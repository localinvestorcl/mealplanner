export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type FlavorLevel = 'mild' | 'medium' | 'bold'
export type GroceryStyle = 'standard' | 'warehouse' | 'budget'
export type WeeklyRuleType = 'no_red_meat' | 'meatless' | 'fish_only' | 'cuisine' | 'max_time' | 'cooking_method' | 'custom'

export interface HouseholdProfile {
  id: string
  user_id: string
  name: string
  family_size: number
  num_adults: number
  num_children: number
  dietary_restrictions: string[]
  allergies: string[]
  dislikes: string[]
  preferred_cuisines: string[]
  no_red_meat_days: DayOfWeek[]
  meatless_days: DayOfWeek[]
  fish_days: DayOfWeek[]
  low_fiber: boolean
  avoid_whole_grains: boolean
  avoid_bland: boolean
  flavor_level: FlavorLevel
  cooking_methods_available: string[]
  cooking_methods_unavailable: string[]
  max_prep_time_minutes: number | null
  max_total_time_minutes: number | null
  grocery_style: GroceryStyle
  meals_per_day: MealType[]
  created_at: string
  updated_at: string
}

export interface WeeklyRule {
  id: string
  profile_id: string
  day_of_week: DayOfWeek | 'any'
  rule_type: WeeklyRuleType
  value: string
  priority: number
  created_at: string
}
