import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { requireAuth } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'

import profileRouter from './routes/profile'
import rulesRouter from './routes/rules'
import favoritesRouter from './routes/favorites'
import feedbackRouter from './routes/feedback'
import plansRouter from './routes/plans'
import generatePlanRouter from './routes/generate/plan'
import generateRecipeRouter from './routes/generate/recipe'
import generateGroceryRouter from './routes/generate/grocery'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(helmet())
app.use(cors())
app.use(express.json())

// Health check (no auth)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// All routes below require authentication
app.use('/api/profile', requireAuth, profileRouter)
app.use('/api/rules', requireAuth, rulesRouter)
app.use('/api/favorites', requireAuth, favoritesRouter)
app.use('/api/feedback', requireAuth, feedbackRouter)
app.use('/api/plans', requireAuth, plansRouter)
app.use('/api/generate/plan', requireAuth, generatePlanRouter)
app.use('/api/generate/recipe', requireAuth, generateRecipeRouter)
app.use('/api/generate/grocery', requireAuth, generateGroceryRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🍽️  Meal Planner API running on port ${PORT}`)
})
