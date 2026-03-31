/**
 * Pre-computes ingredient totals from recipe data so Claude doesn't have to do math.
 * Claude's only job becomes: categorize, merge, and annotate.
 */

interface RawIngredient {
  name: string
  quantity: string
  notes?: string | null
}

export interface PrecomputedIngredient {
  name: string           // normalized name used for grouping
  originalNames: string[] // original names before normalization
  quantity: string       // pre-computed total as a clean string
  rawTotal: number       // numeric total (for validation)
  unit: string
}

/** Parse a quantity string into a numeric value and unit.
 *  Handles: "3 lbs", "2.5 lbs", "1/2 cup", "1 1/2 cups", "3" */
function parseQuantity(qty: string): { value: number; unit: string } | null {
  const s = qty.trim().toLowerCase()

  // Mixed number: "1 1/2 lbs"
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)\s*([a-z]*)/)
  if (mixed) {
    return { value: parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]), unit: mixed[4].replace(/s$/, '') }
  }

  // Fraction: "1/2 cup"
  const frac = s.match(/^(\d+)\/(\d+)\s*([a-z]*)/)
  if (frac) {
    return { value: parseInt(frac[1]) / parseInt(frac[2]), unit: frac[3].replace(/s$/, '') }
  }

  // Decimal or integer: "2.5 lbs" or "3"
  const num = s.match(/^([\d.]+)\s*([a-z]*)/)
  if (num) {
    return { value: parseFloat(num[1]), unit: num[2].replace(/s$/, '') }
  }

  return null
}

/** Normalize unit to a canonical form */
function normalizeUnit(unit: string): string {
  const u = unit.toLowerCase().replace(/s$/, '')
  const map: Record<string, string> = {
    'lb': 'lb', 'pound': 'lb',
    'oz': 'oz', 'ounce': 'oz',
    'cup': 'cup',
    'tbsp': 'tbsp', 'tablespoon': 'tbsp',
    'tsp': 'tsp', 'teaspoon': 'tsp',
    'clove': 'clove',
    'can': 'can',
    'bunch': 'bunch',
    'piece': 'piece',
    'slice': 'slice',
    'g': 'g', 'gram': 'g',
    'kg': 'kg', 'kilogram': 'kg',
    'ml': 'ml', 'l': 'l',
  }
  return map[u] ?? u
}

/** Format a numeric total back into a clean quantity string */
function formatQuantity(value: number, unit: string): string {
  const rounded = Math.round(value * 4) / 4 // round to nearest 0.25
  const whole = Math.floor(rounded)
  const frac = rounded - whole

  const fracStr = frac === 0 ? '' : frac === 0.25 ? '¼' : frac === 0.5 ? '½' : frac === 0.75 ? '¾' : ''
  const numStr = whole === 0 ? fracStr : fracStr ? `${whole} ${fracStr}` : `${whole}`

  return unit ? `${numStr} ${unit}${value !== 1 && !['tbsp', 'tsp'].includes(unit) ? 's' : ''}`.trim() : numStr
}

/** Strip descriptors that don't affect identity for grouping purposes */
function normalizeNameForGrouping(name: string): string {
  return name.toLowerCase()
    .replace(/\b(diced|minced|sliced|chopped|crushed|fresh|dried|ground|large|small|medium|extra virgin)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Pre-compute totals from all meal ingredients.
 *  Returns a map of normalized name → totals, plus the original per-meal data. */
export function precomputeIngredientTotals(meals: Array<{ mealName: string; ingredients: RawIngredient[] }>): {
  perMealLines: string
  totalsByNormalizedName: Record<string, PrecomputedIngredient>
} {
  // Build per-meal lines for the prompt (so Claude can see context)
  const perMealLines = meals.map(m =>
    `### ${m.mealName}\n` +
    (m.ingredients.length > 0
      ? m.ingredients.map(i => `- ${i.quantity} ${i.name}${i.notes ? ` (${i.notes})` : ''}`).join('\n')
      : '(no recipe loaded)')
  ).join('\n\n')

  // Sum totals per ingredient
  const totals: Record<string, {
    originalNames: Set<string>
    byUnit: Record<string, number>
    unparseable: string[]
  }> = {}

  for (const meal of meals) {
    for (const ing of meal.ingredients) {
      const key = normalizeNameForGrouping(ing.name)
      if (!totals[key]) totals[key] = { originalNames: new Set(), byUnit: {}, unparseable: [] }
      totals[key].originalNames.add(ing.name)

      const parsed = parseQuantity(ing.quantity)
      if (parsed) {
        const unit = normalizeUnit(parsed.unit)
        totals[key].byUnit[unit] = (totals[key].byUnit[unit] ?? 0) + parsed.value
      } else {
        totals[key].unparseable.push(`${ing.quantity} ${ing.name}`)
      }
    }
  }

  // Convert to PrecomputedIngredient map
  const totalsByNormalizedName: Record<string, PrecomputedIngredient> = {}
  for (const [key, data] of Object.entries(totals)) {
    const units = Object.keys(data.byUnit)
    if (units.length === 1) {
      const unit = units[0]
      const value = data.byUnit[unit]
      totalsByNormalizedName[key] = {
        name: key,
        originalNames: [...data.originalNames],
        quantity: formatQuantity(value, unit),
        rawTotal: value,
        unit,
      }
    }
    // Multiple units (e.g. cups + tbsp) — leave for Claude to handle
  }

  return { perMealLines, totalsByNormalizedName }
}
