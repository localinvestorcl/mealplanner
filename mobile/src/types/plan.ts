import { Recipe, NutritionEstimate } from './recipe'

export interface WeeklyPlan {
  id: string
  profile_id: string
  name: string
  start_date: string
  end_date: string
  notes?: string | null
  generated_at: string
  created_at: string
  updated_at: string
  meals?: PlannedMeal[]
  grocery_list?: GroceryList | null
}

export interface PlannedMeal {
  id: string
  plan_id: string
  day_of_week: string
  meal_type: string
  meal_name: string
  image_url?: string | null
  recipe_json: Recipe | Record<string, never>
  nutrition_json: NutritionEstimate | Record<string, never>
  position: number
  created_at: string
  updated_at: string
}

export interface GroceryList {
  id: string
  plan_id: string
  items_json: GrocerySection[]
  style: 'by_aisle' | 'by_recipe' | 'simple'
  generated_at: string
  updated_at: string
}

export interface GroceryItem {
  name: string
  quantity: string
  unit?: string
  aisle?: string
  fromMeals?: string[]
  notes?: string | null
  checked?: boolean
}

export interface GrocerySection {
  aisle: string
  items: GroceryItem[]
}
