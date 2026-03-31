import { Router, Response } from 'express'
import { supabase } from '../lib/supabase'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/profile
router.get('/', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('household_profiles')
    .select('*')
    .eq('user_id', req.userId!)
    .single()

  if (error && error.code !== 'PGRST116') {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data ?? null)
})

// POST /api/profile (create or update)
router.post('/', async (req: AuthRequest, res: Response) => {
  const { data: existing } = await supabase
    .from('household_profiles')
    .select('id')
    .eq('user_id', req.userId!)
    .single()

  const payload = { ...req.body, user_id: req.userId!, updated_at: new Date().toISOString() }

  if (existing) {
    const { data, error } = await supabase
      .from('household_profiles')
      .update(payload)
      .eq('user_id', req.userId!)
      .select()
      .single()
    if (error) { res.status(500).json({ error: error.message }); return }
    res.json(data)
  } else {
    const { data, error } = await supabase
      .from('household_profiles')
      .insert(payload)
      .select()
      .single()
    if (error) { res.status(500).json({ error: error.message }); return }
    res.json(data)
  }
})

export default router
