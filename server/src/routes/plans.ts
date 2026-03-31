import { Router, Response } from 'express'
import { supabase } from '../lib/supabase'
import { AuthRequest } from '../middleware/auth'

const router = Router()

async function getProfileId(userId: string): Promise<string | null> {
  const { data } = await supabase.from('household_profiles').select('id').eq('user_id', userId).single()
  return data?.id ?? null
}

// GET /api/plans
router.get('/', async (req: AuthRequest, res: Response) => {
  const profileId = await getProfileId(req.userId!)
  if (!profileId) { res.json([]); return }

  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*, meals:planned_meals(*)')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

// GET /api/plans/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*, meals:planned_meals(*), grocery_list:grocery_lists(*)')
    .eq('id', req.params.id)
    .single()
  if (error) { res.status(404).json({ error: 'Plan not found' }); return }
  res.json(data)
})

// DELETE /api/plans/meals/:id — must be before DELETE /:id to avoid route shadowing
router.delete('/meals/:id', async (req: AuthRequest, res: Response) => {
  const { error } = await supabase.from('planned_meals').delete().eq('id', req.params.id)
  if (error) { res.status(500).json({ error: error.message }); return }
  res.status(204).send()
})

// DELETE /api/plans/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const profileId = await getProfileId(req.userId!)
  if (!profileId) { res.status(404).json({ error: 'Profile not found' }); return }

  const { error } = await supabase
    .from('weekly_plans')
    .delete()
    .eq('id', req.params.id)
    .eq('profile_id', profileId)
  if (error) { res.status(500).json({ error: error.message }); return }
  res.status(204).send()
})

// GET /api/plans/:id/grocery
router.get('/:id/grocery', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('grocery_lists')
    .select('*')
    .eq('plan_id', req.params.id)
    .single()
  if (error) { res.status(404).json({ error: 'No grocery list found' }); return }
  res.json(data)
})

// POST /api/plans/:id/swap — swap a meal
router.post('/:id/swap', async (req: AuthRequest, res: Response) => {
  const { meal_id } = req.body

  // Get the meal and plan
  const { data: meal, error: mealError } = await supabase
    .from('planned_meals')
    .select('*, plan:weekly_plans(profile_id)')
    .eq('id', meal_id)
    .single()
  if (mealError || !meal) { res.status(404).json({ error: 'Meal not found' }); return }

  // Get profile and rules
  const { data: profile } = await supabase
    .from('household_profiles')
    .select('*')
    .eq('user_id', req.userId!)
    .single()
  if (!profile) { res.status(404).json({ error: 'Profile not found' }); return }

  const { data: rules } = await supabase
    .from('weekly_rules')
    .select('*')
    .eq('profile_id', profile.id)

  const { data: otherMeals } = await supabase
    .from('planned_meals')
    .select('meal_name')
    .eq('plan_id', req.params.id)
    .neq('id', meal_id)

  const { buildSwapPrompt } = await import('../lib/prompts/swapPrompt')
  const { callClaudeJSON, HAIKU } = await import('../lib/claude')
  const { searchFoodPhoto } = await import('../lib/pexels')

  const prompt = buildSwapPrompt({
    currentMealName: meal.meal_name,
    dayOfWeek: meal.day_of_week,
    profile,
    rules: rules ?? [],
    otherMealsThisWeek: (otherMeals ?? []).map((m: { meal_name: string }) => m.meal_name),
    reason: req.body.reason ?? null,
  })

  const swapResult = await callClaudeJSON<{
    mealName: string; cuisine: string; description: string;
    estimatedPrepMinutes: number; estimatedTotalMinutes: number;
    cookingMethod: string; tags: string[]
  }>(prompt, 1024, 1, HAIKU)

  const imageUrl = await searchFoodPhoto(swapResult.mealName)

  const { data: updated, error: updateError } = await supabase
    .from('planned_meals')
    .update({
      meal_name: swapResult.mealName,
      image_url: imageUrl,
      recipe_json: {},
      nutrition_json: {},
      updated_at: new Date().toISOString(),
    })
    .eq('id', meal_id)
    .select()
    .single()

  if (updateError) { res.status(500).json({ error: updateError.message }); return }
  res.json(updated)
})

// POST /api/plans/:id/add-meal — add a Claude-suggested meal to an empty day
router.post('/:id/add-meal', async (req: AuthRequest, res: Response) => {
  const { day_of_week } = req.body
  if (!day_of_week) { res.status(400).json({ error: 'day_of_week is required' }); return }

  const { data: profile } = await supabase
    .from('household_profiles')
    .select('*')
    .eq('user_id', req.userId!)
    .single()
  if (!profile) { res.status(404).json({ error: 'Profile not found' }); return }

  const { data: rules } = await supabase
    .from('weekly_rules')
    .select('*')
    .eq('profile_id', profile.id)

  const { data: existingMeals } = await supabase
    .from('planned_meals')
    .select('meal_name')
    .eq('plan_id', req.params.id)

  const { buildSwapPrompt } = await import('../lib/prompts/swapPrompt')
  const { callClaudeJSON, HAIKU } = await import('../lib/claude')
  const { searchFoodPhoto } = await import('../lib/pexels')

  const prompt = buildSwapPrompt({
    currentMealName: '',
    dayOfWeek: day_of_week,
    profile,
    rules: rules ?? [],
    otherMealsThisWeek: (existingMeals ?? []).map((m: { meal_name: string }) => m.meal_name),
    reason: `Suggest a new meal for ${day_of_week} — the day has no meal planned.`,
  })

  const result = await callClaudeJSON<{
    mealName: string; cuisine: string; description: string;
    estimatedPrepMinutes: number; estimatedTotalMinutes: number;
    cookingMethod: string; tags: string[]
  }>(prompt, 1024, 1, HAIKU)

  const imageUrl = await searchFoodPhoto(result.mealName)

  const { data: newMeal, error: insertError } = await supabase
    .from('planned_meals')
    .insert({
      plan_id: req.params.id,
      day_of_week,
      meal_type: 'dinner',
      meal_name: result.mealName,
      image_url: imageUrl,
      recipe_json: {},
      nutrition_json: {},
      position: 0,
    })
    .select()
    .single()

  if (insertError) { res.status(500).json({ error: insertError.message }); return }
  res.json(newMeal)
})

export default router
