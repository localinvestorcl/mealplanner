import { Router, Response } from 'express'
import { supabase } from '../lib/supabase'
import { AuthRequest } from '../middleware/auth'

const router = Router()

async function getProfileId(userId: string): Promise<string | null> {
  const { data } = await supabase.from('household_profiles').select('id').eq('user_id', userId).single()
  return data?.id ?? null
}

// POST /api/feedback
router.post('/', async (req: AuthRequest, res: Response) => {
  const { save_as_favorite, ...feedbackData } = req.body

  // Look up meal name from planned_meal if not provided
  let mealName = feedbackData.meal_name
  if (!mealName && feedbackData.planned_meal_id) {
    const { data: meal } = await supabase
      .from('planned_meals')
      .select('meal_name')
      .eq('id', feedbackData.planned_meal_id)
      .single()
    mealName = meal?.meal_name ?? 'Unknown Meal'
  }

  const { data, error } = await supabase
    .from('meal_feedback')
    .insert({ ...feedbackData, meal_name: mealName })
    .select()
    .single()
  if (error) { res.status(500).json({ error: error.message }); return }

  // Optionally save as favorite
  if (save_as_favorite && mealName) {
    const profileId = await getProfileId(req.userId!)
    if (profileId) {
      await supabase.from('favorite_meals').insert({
        profile_id: profileId,
        name: mealName,
      })
    }
  }

  res.json(data)
})

// GET /api/feedback?meal_id=...
router.get('/', async (req: AuthRequest, res: Response) => {
  const { meal_id } = req.query

  let query = supabase.from('meal_feedback').select('*').order('created_at', { ascending: false })
  if (meal_id) query = query.eq('planned_meal_id', meal_id as string)

  const { data, error } = await query
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

export default router
