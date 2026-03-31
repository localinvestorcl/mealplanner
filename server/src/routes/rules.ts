import { Router, Response } from 'express'
import { supabase } from '../lib/supabase'
import { AuthRequest } from '../middleware/auth'

const router = Router()

async function getProfileId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('household_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()
  return data?.id ?? null
}

// GET /api/rules
router.get('/', async (req: AuthRequest, res: Response) => {
  const profileId = await getProfileId(req.userId!)
  if (!profileId) { res.json([]); return }

  const { data, error } = await supabase
    .from('weekly_rules')
    .select('*')
    .eq('profile_id', profileId)
    .order('priority', { ascending: false })
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

// POST /api/rules
router.post('/', async (req: AuthRequest, res: Response) => {
  const profileId = await getProfileId(req.userId!)
  if (!profileId) { res.status(404).json({ error: 'Profile not found. Create a profile first.' }); return }

  const { data, error } = await supabase
    .from('weekly_rules')
    .insert({ ...req.body, profile_id: profileId })
    .select()
    .single()
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

// DELETE /api/rules/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const profileId = await getProfileId(req.userId!)
  if (!profileId) { res.status(404).json({ error: 'Profile not found' }); return }

  const { error } = await supabase
    .from('weekly_rules')
    .delete()
    .eq('id', req.params.id)
    .eq('profile_id', profileId)
  if (error) { res.status(500).json({ error: error.message }); return }
  res.status(204).send()
})

export default router
