export interface MealFeedback {
  id: string
  planned_meal_id?: string | null
  favorite_meal_id?: string | null
  meal_name: string
  family_liked?: boolean | null
  kids_liked?: boolean | null
  would_repeat?: boolean | null
  too_bland: boolean
  too_dry: boolean
  needed_more_sauce: boolean
  needed_more_veg: boolean
  too_much_cleanup: boolean
  notes?: string | null
  created_at: string
}

export interface FavoriteMeal {
  id: string
  profile_id: string
  name: string
  cuisine?: string | null
  image_url?: string | null
  notes?: string | null
  last_used_at?: string | null
  created_at: string
  updated_at: string
  feedback?: MealFeedback[]
}
