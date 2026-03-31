interface ProfileData {
  name: string
  family_size: number
  num_adults: number
  num_children: number
  dietary_restrictions: string[]
  allergies: string[]
  dislikes: string[]
  preferred_cuisines: string[]
  no_red_meat_days: string[]
  meatless_days: string[]
  low_fiber: boolean
  avoid_whole_grains: boolean
  avoid_bland: boolean
  flavor_level: string
  cooking_methods_available: string[]
  cooking_methods_unavailable: string[]
  max_prep_time_minutes: number | null
  max_total_time_minutes: number | null
}

interface RuleData {
  day_of_week: string
  rule_type: string
  value: string
}

export function buildPlanPrompt(params: {
  profile: ProfileData
  rules: RuleData[]
  recentMealNames: string[]
  favoriteMeals: string[]
  weekStartDate: string
  notes?: string | null
}): string {
  const { profile, rules, recentMealNames, favoriteMeals, weekStartDate, notes } = params

  return `You are a meal planning assistant. Generate a 7-day dinner plan for a household.

## Household Profile
- Family: ${profile.name}, ${profile.family_size} people (${profile.num_adults} adults, ${profile.num_children} children)
- Dietary Restrictions: ${profile.dietary_restrictions.join(', ') || 'none'}
- Allergies: ${profile.allergies.join(', ') || 'none'}
- Dislikes: ${profile.dislikes.join(', ') || 'none'}
- Preferred Cuisines: ${profile.preferred_cuisines.join(', ') || 'varied'}
- Flavor Level: ${profile.flavor_level}${profile.avoid_bland ? ' (family strongly dislikes bland food — always use herbs and spices)' : ''}
- Low-Fiber Diet: ${profile.low_fiber ? 'YES — avoid high-fiber vegetables, legumes, whole grains, raw vegetables. Use cooked carrots, zucchini, green beans, potatoes.' : 'no'}
- Avoid Whole Grains: ${profile.avoid_whole_grains ? 'YES — use only white rice, regular pasta, white bread' : 'no'}
- Max Prep Time: ${profile.max_prep_time_minutes ? profile.max_prep_time_minutes + ' minutes' : 'no limit'}
- Max Total Time: ${profile.max_total_time_minutes ? profile.max_total_time_minutes + ' minutes' : 'no limit'}
- UNAVAILABLE Cooking Methods (never use): ${profile.cooking_methods_unavailable.join(', ') || 'none'}
- Available Special Equipment: ${profile.cooking_methods_available.join(', ') || 'standard kitchen'}

## Day-Specific Rules — MUST FOLLOW EXACTLY
${rules.length > 0 ? rules.map(r => `- ${r.day_of_week.toUpperCase()}: ${r.value}`).join('\n') : 'No specific day rules.'}
${profile.no_red_meat_days.length > 0 ? `- NO RED MEAT on: ${profile.no_red_meat_days.join(', ')}` : ''}
${profile.meatless_days.length > 0 ? `- MEATLESS on: ${profile.meatless_days.join(', ')}` : ''}

## Recent Meals — Avoid Repeating These
${recentMealNames.length > 0 ? recentMealNames.join(', ') : 'None'}

## Family Favorites — Include 2-3 This Week
${favoriteMeals.length > 0 ? favoriteMeals.join(', ') : 'None saved yet'}

## Week of ${weekStartDate}
${notes ? `Special request: ${notes}` : ''}

## Requirements
- Generate exactly 7 dinners (Monday through Sunday)
- Choose a single weekly flavor theme (e.g. "Mediterranean", "Tex-Mex", "Comfort Classics", "Asian-inspired") that allows herbs, spices, and pantry staples to overlap across multiple meals — this reduces the grocery list significantly
- Within the theme, still vary the protein and cooking method each day
- Ensure meals are practical for a family with children
- Include vegetables in most meals (low-fiber appropriate ones if applicable)
- Return ONLY valid JSON with no other text

## Output Format
{
  "weekTheme": "Mediterranean",
  "meals": [
    {
      "dayOfWeek": "monday",
      "mealType": "dinner",
      "mealName": "Exact Meal Name Here",
      "cuisine": "Italian",
      "description": "One sentence description",
      "estimatedPrepMinutes": 15,
      "estimatedTotalMinutes": 45,
      "cookingMethod": "stovetop",
      "tags": ["kid-friendly", "low-fiber"]
    }
  ]
}

Return ONLY the JSON object above with all 7 days. No markdown, no explanation.`
}
