-- ============================================================
-- Meal Planning App — Supabase Migration
-- Run this in your Supabase project SQL Editor
-- ============================================================

-- Household Profiles
CREATE TABLE household_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Our Family',
  family_size INT DEFAULT 1,
  num_adults INT DEFAULT 1,
  num_children INT DEFAULT 0,
  dietary_restrictions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  dislikes TEXT[] DEFAULT '{}',
  preferred_cuisines TEXT[] DEFAULT '{}',
  no_red_meat_days TEXT[] DEFAULT '{}',
  meatless_days TEXT[] DEFAULT '{}',
  fish_days TEXT[] DEFAULT '{}',
  low_fiber BOOLEAN DEFAULT false,
  avoid_whole_grains BOOLEAN DEFAULT false,
  avoid_bland BOOLEAN DEFAULT false,
  flavor_level TEXT DEFAULT 'medium',
  cooking_methods_available TEXT[] DEFAULT '{}',
  cooking_methods_unavailable TEXT[] DEFAULT '{}',
  max_prep_time_minutes INT,
  max_total_time_minutes INT,
  grocery_style TEXT DEFAULT 'standard',
  meals_per_day TEXT[] DEFAULT '{dinner}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE household_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile"
  ON household_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Weekly Rules
CREATE TABLE weekly_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES household_profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  value TEXT NOT NULL,
  priority INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE weekly_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own rules"
  ON weekly_rules FOR ALL
  USING (profile_id IN (SELECT id FROM household_profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM household_profiles WHERE user_id = auth.uid()));

-- Favorite Meals
CREATE TABLE favorite_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES household_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  cuisine TEXT,
  image_url TEXT,
  notes TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE favorite_meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own favorites"
  ON favorite_meals FOR ALL
  USING (profile_id IN (SELECT id FROM household_profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM household_profiles WHERE user_id = auth.uid()));

-- Weekly Plans
CREATE TABLE weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES household_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own plans"
  ON weekly_plans FOR ALL
  USING (profile_id IN (SELECT id FROM household_profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM household_profiles WHERE user_id = auth.uid()));

-- Planned Meals
CREATE TABLE planned_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES weekly_plans(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT NOT NULL,
  meal_type TEXT NOT NULL DEFAULT 'dinner',
  meal_name TEXT NOT NULL,
  image_url TEXT,
  recipe_json JSONB DEFAULT '{}',
  nutrition_json JSONB DEFAULT '{}',
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE planned_meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage meals in their own plans"
  ON planned_meals FOR ALL
  USING (plan_id IN (
    SELECT wp.id FROM weekly_plans wp
    JOIN household_profiles hp ON wp.profile_id = hp.id
    WHERE hp.user_id = auth.uid()
  ))
  WITH CHECK (plan_id IN (
    SELECT wp.id FROM weekly_plans wp
    JOIN household_profiles hp ON wp.profile_id = hp.id
    WHERE hp.user_id = auth.uid()
  ));

-- Grocery Lists
CREATE TABLE grocery_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES weekly_plans(id) ON DELETE CASCADE NOT NULL UNIQUE,
  items_json JSONB DEFAULT '[]',
  style TEXT DEFAULT 'by_aisle',
  generated_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own grocery lists"
  ON grocery_lists FOR ALL
  USING (plan_id IN (
    SELECT wp.id FROM weekly_plans wp
    JOIN household_profiles hp ON wp.profile_id = hp.id
    WHERE hp.user_id = auth.uid()
  ))
  WITH CHECK (plan_id IN (
    SELECT wp.id FROM weekly_plans wp
    JOIN household_profiles hp ON wp.profile_id = hp.id
    WHERE hp.user_id = auth.uid()
  ));

-- Meal Feedback
CREATE TABLE meal_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planned_meal_id UUID REFERENCES planned_meals(id) ON DELETE SET NULL,
  favorite_meal_id UUID REFERENCES favorite_meals(id) ON DELETE SET NULL,
  meal_name TEXT NOT NULL,
  family_liked BOOLEAN,
  kids_liked BOOLEAN,
  would_repeat BOOLEAN,
  too_bland BOOLEAN DEFAULT false,
  too_dry BOOLEAN DEFAULT false,
  needed_more_sauce BOOLEAN DEFAULT false,
  needed_more_veg BOOLEAN DEFAULT false,
  too_much_cleanup BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE meal_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own feedback"
  ON meal_feedback FOR ALL
  USING (
    planned_meal_id IN (
      SELECT pm.id FROM planned_meals pm
      JOIN weekly_plans wp ON pm.plan_id = wp.id
      JOIN household_profiles hp ON wp.profile_id = hp.id
      WHERE hp.user_id = auth.uid()
    )
    OR
    favorite_meal_id IN (
      SELECT fm.id FROM favorite_meals fm
      JOIN household_profiles hp ON fm.profile_id = hp.id
      WHERE hp.user_id = auth.uid()
    )
  );

-- Future: Nutrition Goals
CREATE TABLE nutrition_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES household_profiles(id) ON DELETE CASCADE NOT NULL,
  member_name TEXT,
  calories_target INT,
  protein_grams_target INT,
  carbs_grams_target INT,
  fat_grams_target INT,
  fiber_grams_target INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own nutrition goals"
  ON nutrition_goals FOR ALL
  USING (profile_id IN (SELECT id FROM household_profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM household_profiles WHERE user_id = auth.uid()));

-- Future: Grocery Spending
CREATE TABLE grocery_spending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grocery_list_id UUID REFERENCES grocery_lists(id) ON DELETE CASCADE NOT NULL,
  store_name TEXT,
  total_spent DECIMAL(10,2),
  receipt_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE grocery_spending ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own spending records"
  ON grocery_spending FOR ALL
  USING (grocery_list_id IN (
    SELECT gl.id FROM grocery_lists gl
    JOIN weekly_plans wp ON gl.plan_id = wp.id
    JOIN household_profiles hp ON wp.profile_id = hp.id
    WHERE hp.user_id = auth.uid()
  ));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER household_profiles_updated_at BEFORE UPDATE ON household_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER favorite_meals_updated_at BEFORE UPDATE ON favorite_meals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER weekly_plans_updated_at BEFORE UPDATE ON weekly_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER planned_meals_updated_at BEFORE UPDATE ON planned_meals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER grocery_lists_updated_at BEFORE UPDATE ON grocery_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER nutrition_goals_updated_at BEFORE UPDATE ON nutrition_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
