interface ProfileData {
  dietary_restrictions: string[]
  allergies: string[]
  dislikes: string[]
  low_fiber: boolean
  avoid_whole_grains: boolean
  flavor_level: string
  cooking_methods_unavailable: string[]
}

interface RuleData {
  day_of_week: string
  value: string
}

export function buildSwapPrompt(params: {
  currentMealName: string
  dayOfWeek: string
  profile: ProfileData
  rules: RuleData[]
  otherMealsThisWeek: string[]
  reason?: string | null
}): string {
  const { currentMealName, dayOfWeek, profile, rules, otherMealsThisWeek, reason } = params
  const dayRules = rules.filter(r => r.day_of_week === dayOfWeek || r.day_of_week === 'any')

  return `Suggest a single replacement dinner meal for ${dayOfWeek} to replace "${currentMealName}".
${reason ? `Reason for swap: ${reason}` : ''}

## Constraints — Follow Strictly
- Low-Fiber: ${profile.low_fiber ? 'YES' : 'no'}
- Avoid Whole Grains: ${profile.avoid_whole_grains ? 'YES' : 'no'}
- Allergies: ${profile.allergies.join(', ') || 'none'}
- Dislikes: ${profile.dislikes.join(', ') || 'none'}
- Unavailable cooking methods: ${profile.cooking_methods_unavailable.join(', ') || 'none'}
- Day rules for ${dayOfWeek}: ${dayRules.map(r => r.value).join('; ') || 'none'}
- Do NOT suggest any of these meals already in the plan: ${otherMealsThisWeek.join(', ')}
- Do NOT suggest "${currentMealName}" again

## Output Format — Return ONLY this JSON
{
  "mealName": "New Meal Name",
  "cuisine": "Cuisine Type",
  "description": "One sentence description",
  "estimatedPrepMinutes": 15,
  "estimatedTotalMinutes": 45,
  "cookingMethod": "stovetop",
  "tags": ["kid-friendly"]
}

Return ONLY the JSON. No markdown, no explanation.`
}
