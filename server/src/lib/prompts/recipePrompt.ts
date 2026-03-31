interface ProfileData {
  family_size: number
  dietary_restrictions: string[]
  allergies: string[]
  dislikes: string[]
  low_fiber: boolean
  avoid_whole_grains: boolean
  avoid_bland: boolean
  flavor_level: string
  cooking_methods_unavailable: string[]
}

export function buildRecipePrompt(params: {
  mealName: string
  cuisine: string
  cookingMethod: string
  profile: ProfileData
  tags?: string[]
}): string {
  const { mealName, cuisine, cookingMethod, profile, tags } = params
  const servings = profile.family_size

  return `Generate a complete, detailed recipe for "${mealName}" serving ${servings} people.

## Household Constraints — Follow Strictly
- Low-Fiber: ${profile.low_fiber ? 'YES — use only low-fiber ingredients. No beans, lentils, whole wheat, brown rice, raw vegetables, or high-fiber produce.' : 'no'}
- Avoid Whole Grains: ${profile.avoid_whole_grains ? 'YES — white rice, regular pasta, white bread only' : 'no'}
- Allergies to avoid: ${profile.allergies.join(', ') || 'none'}
- Ingredients to avoid: ${profile.dislikes.join(', ') || 'none'}
- Unavailable cooking methods: ${profile.cooking_methods_unavailable.join(', ') || 'none'}
- Flavor Level: ${profile.flavor_level}${profile.avoid_bland ? ' — use generous herbs and spices, not just salt and pepper' : ''}
- Primary cooking method: ${cookingMethod}
- Cuisine: ${cuisine}
${tags && tags.length > 0 ? `- Tags: ${tags.join(', ')}` : ''}

## Important Recipe Rules
- Always specify whether proteins are raw or pre-cooked
- If something must be pre-cooked first (e.g. chicken must be cooked before adding to casserole), explain how to pre-cook it and include that time in totalTimeMinutes
- Use herbs and spices beyond just salt and pepper
- Keep flavors family-friendly but not boring
- Be specific with quantities (e.g. "2 cups", "1 lb", "3 cloves garlic, minced")

## Output Format — Return ONLY this JSON
{
  "mealName": "${mealName}",
  "servings": ${servings},
  "prepTimeMinutes": 0,
  "cookTimeMinutes": 0,
  "totalTimeMinutes": 0,
  "cuisine": "${cuisine}",
  "description": "2-3 sentence description",
  "whyThisWorks": "Brief explanation of why this meal fits the family",
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": "2 cups",
      "notes": "finely chopped or null",
      "category": "produce"
    }
  ],
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "Full instruction here. Be specific.",
      "timeMinutes": 5
    }
  ],
  "planAheadTips": "Tips for prepping ahead or null",
  "servingSuggestions": "What to serve alongside or null",
  "notes": "Any important notes or null",
  "tags": ["tag1", "tag2"],
  "cookingMethod": "${cookingMethod}"
}

Return ONLY the JSON. No markdown, no explanation.`
}
