export interface RecipeIngredient {
  name: string
  quantity: string
  notes?: string | null
  category?: 'produce' | 'protein' | 'dairy' | 'pantry' | 'frozen' | 'bakery' | 'deli' | 'other'
}

export interface RecipeStep {
  stepNumber: number
  instruction: string
  timeMinutes?: number | null
}

export interface Recipe {
  mealName: string
  servings: number
  prepTimeMinutes: number
  cookTimeMinutes: number
  totalTimeMinutes: number
  cuisine: string
  description: string
  whyThisWorks?: string
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  planAheadTips?: string | null
  servingSuggestions?: string | null
  notes?: string | null
  tags: string[]
  cookingMethod: string
}

export interface NutritionEstimate {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG: number
  servingSize: string
  disclaimer: string
}
