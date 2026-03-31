interface MealIngredient {
  name: string
  quantity: string
  notes?: string | null
  category?: string
}

interface MealForGrocery {
  mealName: string
  ingredients: MealIngredient[]
}

export function buildGroceryPrompt(params: {
  meals: MealForGrocery[]
  servings: number
  weekTheme?: string | null
  perMealLines: string
  verifiedTotals: Record<string, { quantity: string; originalNames: string[] }>
}): string {
  const { servings, weekTheme, perMealLines, verifiedTotals } = params

  const totalCount = Object.keys(verifiedTotals).length
  const verifiedSection = totalCount > 0
    ? `## Pre-Verified Quantities (use these exact numbers — do NOT recalculate)\n` +
      Object.entries(verifiedTotals)
        .map(([name, data]) => `- ${name}: ${data.quantity}${data.originalNames.length > 1 ? ` (from: ${data.originalNames.join(', ')})` : ''}`)
        .join('\n')
    : ''

  return `Consolidate the following ingredients from ${params.meals.length} dinner meals into a single organized grocery list for ${servings} people.${weekTheme ? ` This week's theme is ${weekTheme}.` : ''}

${verifiedSection}

## Per-Meal Ingredient Details
${perMealLines}

## Merging Rules
- For ingredients in the Pre-Verified Quantities section above: use the exact quantity listed — do not recalculate
- Merge ONLY when the substitution is practical and won't significantly affect the dish:
  - OK: "minced garlic" + "garlic cloves" → "garlic"; "olive oil" + "extra virgin olive oil" → "olive oil"; "diced onion" + "sliced onion" → "onion"
  - OK: upgrade a cut for shopping simplicity (e.g. if one recipe needs boneless chicken and another bone-in, list only bone-in and add a note like "debone X lbs for [Meal Name]")
  - NOT OK: different proteins, different vegetables, items where the specific form significantly changes the recipe (whole tomatoes vs crushed tomatoes)
- Keep all ingredients including pantry staples (salt, pepper, oil, spices)
- Keep quantities practical (e.g., "2 lbs" not "32 oz")
- Group items by supermarket aisle/section
- Be concise — short item names

## Output Format — Return ONLY this JSON
{
  "sections": [
    {
      "aisle": "Produce",
      "items": [
        { "name": "item name", "quantity": "2 lbs", "notes": "optional note for substitutions, or null" }
      ]
    }
  ]
}

Return ONLY the JSON. No markdown, no explanation.`
}
