import { Router, Response } from 'express'
import { supabase } from '../../lib/supabase'
import { callClaudeJSON, HAIKU } from '../../lib/claude'
import { buildGroceryPrompt } from '../../lib/prompts/groceryPrompt'
import { precomputeIngredientTotals } from '../../lib/ingredientSummer'
import { AuthRequest } from '../../middleware/auth'

const router = Router()

// POST /api/generate/grocery
router.post('/', async (req: AuthRequest, res: Response) => {
  const { plan_id } = req.body
  if (!plan_id) { res.status(400).json({ error: 'plan_id is required' }); return }

  const { data: meals, error: mealsError } = await supabase
    .from('planned_meals')
    .select('meal_name, recipe_json')
    .eq('plan_id', plan_id)

  if (mealsError || !meals) { res.status(500).json({ error: 'Could not load meals' }); return }

  const [{ data: profile }, { data: planData }] = await Promise.all([
    supabase.from('household_profiles').select('family_size').eq('user_id', req.userId!).single(),
    supabase.from('weekly_plans').select('notes').eq('id', plan_id).single(),
  ])

  const themeMatch = planData?.notes?.match(/Theme:\s*([^·]+)/)
  const weekTheme = themeMatch?.[1]?.trim() ?? null

  const promptMeals = meals.map(m => ({
    mealName: m.meal_name,
    ingredients: (m.recipe_json as { ingredients?: Array<{ name: string; quantity: string; notes?: string | null }> } | null)?.ingredients ?? [],
  }))

  // Pre-compute totals in server code so Claude doesn't have to do math
  const { perMealLines, totalsByNormalizedName } = precomputeIngredientTotals(promptMeals)

  const verifiedTotals: Record<string, { quantity: string; originalNames: string[] }> = {}
  for (const [key, data] of Object.entries(totalsByNormalizedName)) {
    verifiedTotals[key] = { quantity: data.quantity, originalNames: data.originalNames }
  }

  const prompt = buildGroceryPrompt({
    meals: promptMeals,
    servings: profile?.family_size ?? 4,
    weekTheme,
    perMealLines,
    verifiedTotals,
  })

  const result = await callClaudeJSON<{ sections: object[] }>(prompt, 4096, 0, HAIKU)

  const { data: groceryList, error: upsertError } = await supabase
    .from('grocery_lists')
    .upsert({
      plan_id,
      items_json: result.sections,
      style: 'by_aisle',
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'plan_id' })
    .select()
    .single()

  if (upsertError) { res.status(500).json({ error: upsertError.message }); return }
  res.json(groceryList)
})

export default router
