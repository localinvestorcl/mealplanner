import { Router, Response } from 'express'
import { supabase } from '../../lib/supabase'
import { callClaudeJSON } from '../../lib/claude'
import { buildRecipePrompt } from '../../lib/prompts/recipePrompt'
import { AuthRequest } from '../../middleware/auth'

const router = Router()

// POST /api/generate/recipe
router.post('/', async (req: AuthRequest, res: Response) => {
  const { meal_id } = req.body
  if (!meal_id) { res.status(400).json({ error: 'meal_id is required' }); return }

  // Get meal
  const { data: meal, error: mealError } = await supabase
    .from('planned_meals')
    .select('*, plan:weekly_plans(profile_id)')
    .eq('id', meal_id)
    .single()
  if (mealError || !meal) { res.status(404).json({ error: 'Meal not found' }); return }

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('household_profiles')
    .select('*')
    .eq('user_id', req.userId!)
    .single()
  if (profileError || !profile) { res.status(404).json({ error: 'Profile not found' }); return }

  const prompt = buildRecipePrompt({
    mealName: meal.meal_name,
    cuisine: 'varied',
    cookingMethod: 'varied',
    profile,
    tags: [],
  })

  const recipe = await callClaudeJSON<object>(prompt, 6000)

  // Also estimate nutrition as part of recipe
  const { data: updated, error: updateError } = await supabase
    .from('planned_meals')
    .update({
      recipe_json: recipe,
      updated_at: new Date().toISOString(),
    })
    .eq('id', meal_id)
    .select()
    .single()

  if (updateError) { res.status(500).json({ error: updateError.message }); return }
  res.json(updated)
})

export default router
