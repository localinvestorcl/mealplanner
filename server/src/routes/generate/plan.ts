import { Router, Response } from 'express'
import { supabase } from '../../lib/supabase'
import { callClaudeJSON } from '../../lib/claude'
import { searchFoodPhoto } from '../../lib/pexels'
import { buildPlanPrompt } from '../../lib/prompts/planPrompt'
import { AuthRequest } from '../../middleware/auth'

const router = Router()

interface GeneratedMeal {
  dayOfWeek: string
  mealType: string
  mealName: string
  cuisine: string
  description: string
  estimatedPrepMinutes: number
  estimatedTotalMinutes: number
  cookingMethod: string
  tags: string[]
}

// POST /api/generate/plan
router.post('/', async (req: AuthRequest, res: Response) => {
  const { start_date, notes } = req.body

  if (!start_date) { res.status(400).json({ error: 'start_date is required' }); return }

  // Load profile
  const { data: profile, error: profileError } = await supabase
    .from('household_profiles')
    .select('*')
    .eq('user_id', req.userId!)
    .single()
  if (profileError || !profile) {
    res.status(404).json({ error: 'Please create a household profile first.' })
    return
  }

  // Load rules
  const { data: rules } = await supabase
    .from('weekly_rules')
    .select('*')
    .eq('profile_id', profile.id)

  // Load favorites
  const { data: favorites } = await supabase
    .from('favorite_meals')
    .select('name')
    .eq('profile_id', profile.id)
    .order('last_used_at', { ascending: true })
    .limit(15)

  // Load recent meal names (last 3 weeks)
  const threeWeeksAgo = new Date()
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21)
  const { data: recentPlans } = await supabase
    .from('weekly_plans')
    .select('meals:planned_meals(meal_name)')
    .eq('profile_id', profile.id)
    .gte('start_date', threeWeeksAgo.toISOString().split('T')[0])

  const recentMealNames = (recentPlans ?? [])
    .flatMap((p: { meals: Array<{ meal_name: string }> }) => p.meals?.map((m) => m.meal_name) ?? [])

  // Calculate end date (Sunday)
  const startDateObj = new Date(start_date)
  const endDateObj = new Date(startDateObj)
  endDateObj.setDate(endDateObj.getDate() + 6)
  const end_date = endDateObj.toISOString().split('T')[0]

  const weekLabel = startDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // Generate plan via Claude
  const prompt = buildPlanPrompt({
    profile,
    rules: rules ?? [],
    recentMealNames,
    favoriteMeals: (favorites ?? []).map((f: { name: string }) => f.name),
    weekStartDate: weekLabel,
    notes: notes ?? null,
  })

  const result = await callClaudeJSON<{ weekTheme?: string; meals: GeneratedMeal[] }>(prompt)

  // Create plan record
  const planName = `Week of ${startDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  const themeNote = result.weekTheme ? `Theme: ${result.weekTheme}` : null
  const planNotes = [notes, themeNote].filter(Boolean).join(' · ') || null

  const { data: plan, error: planError } = await supabase
    .from('weekly_plans')
    .insert({
      profile_id: profile.id,
      name: planName,
      start_date,
      end_date,
      notes: planNotes,
    })
    .select()
    .single()

  if (planError || !plan) {
    res.status(500).json({ error: planError?.message ?? 'Failed to create plan' })
    return
  }

  // Insert planned meals with photos fetched in parallel
  const mealsWithPhotos = await Promise.all(
    result.meals.map(async (meal: GeneratedMeal) => {
      const imageUrl = await searchFoodPhoto(meal.mealName)
      return {
        plan_id: plan.id,
        day_of_week: meal.dayOfWeek,
        meal_type: meal.mealType,
        meal_name: meal.mealName,
        image_url: imageUrl,
        recipe_json: {},
        nutrition_json: {},
        position: 0,
      }
    })
  )

  const { error: mealsError } = await supabase.from('planned_meals').insert(mealsWithPhotos)
  if (mealsError) {
    res.status(500).json({ error: mealsError.message })
    return
  }

  // Return plan with meals
  const { data: fullPlan } = await supabase
    .from('weekly_plans')
    .select('*, meals:planned_meals(*)')
    .eq('id', plan.id)
    .single()

  res.json(fullPlan)
})

export default router
