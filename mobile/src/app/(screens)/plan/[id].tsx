import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, Modal, RefreshControl } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import { WeeklyPlan, PlannedMeal } from '@/types/plan'
import { Recipe } from '@/types/recipe'
import { PlanScreenSkeleton } from '@/components/Skeleton'
import { ErrorView } from '@/components/ErrorView'
import { Toast, useToast } from '@/components/Toast'
import { GradientButton } from '@/components/GradientButton'
import { Colors, Fonts, Radius, Spacing, Shadow } from '@/constants/theme'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
}

export default function PlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<PlannedMeal | null>(null)
  const [loadingRecipe, setLoadingRecipe] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const [generatingAll, setGeneratingAll] = useState(false)
  const [generatingGrocery, setGeneratingGrocery] = useState(false)
  const [favoritedMeals, setFavoritedMeals] = useState<Record<string, string>>({})
  const [togglingFav, setTogglingFav] = useState(false)
  const [addingMealDay, setAddingMealDay] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    loadPlan()
    loadFavorites()
  }, [id])

  async function loadPlan(isRefresh = false) {
    if (!isRefresh) setLoadError(false)
    try {
      const data = await apiGet<WeeklyPlan>(`/api/plans/${id}`)
      setPlan(data)
      if (isRefresh) setLoadError(false)
    } catch {
      if (!isRefresh) setLoadError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    await loadPlan(true)
  }

  async function loadFavorites() {
    try {
      const favs = await apiGet<{ id: string; name: string }[]>('/api/favorites')
      const map: Record<string, string> = {}
      favs.forEach(f => { map[f.name] = f.id })
      setFavoritedMeals(map)
    } catch { /* non-critical */ }
  }

  async function handleToggleFavorite(meal: PlannedMeal) {
    setTogglingFav(true)
    const existingId = favoritedMeals[meal.meal_name]
    try {
      if (existingId) {
        await apiDelete(`/api/favorites/${existingId}`)
        setFavoritedMeals(prev => {
          const next = { ...prev }
          delete next[meal.meal_name]
          return next
        })
      } else {
        const recipe = meal.recipe_json && Object.keys(meal.recipe_json).length > 0
          ? meal.recipe_json as Recipe
          : null
        const fav = await apiPost<{ id: string }>('/api/favorites', {
          name: meal.meal_name,
          image_url: meal.image_url ?? null,
          cuisine: recipe?.cuisine ?? null,
        })
        setFavoritedMeals(prev => ({ ...prev, [meal.meal_name]: fav.id }))
      }
    } catch {
      Alert.alert('Error', 'Could not update favorites')
    } finally {
      setTogglingFav(false)
    }
  }

  async function loadRecipe(meal: PlannedMeal) {
    if (meal.recipe_json && Object.keys(meal.recipe_json).length > 0) {
      setSelectedMeal(meal)
      return
    }
    setLoadingRecipe(true)
    setSelectedMeal(meal)
    try {
      const updated = await apiPost<PlannedMeal>(`/api/generate/recipe`, { meal_id: meal.id })
      setPlan(prev => prev ? {
        ...prev,
        meals: prev.meals?.map(m => m.id === meal.id ? updated : m)
      } : prev)
      setSelectedMeal(updated)
    } catch {
      Alert.alert('Error', 'Could not generate recipe')
    } finally {
      setLoadingRecipe(false)
    }
  }

  async function handleGenerateAll() {
    setGeneratingAll(true)
    const mealsWithoutRecipes = plan?.meals?.filter(m => !m.recipe_json || Object.keys(m.recipe_json).length === 0) ?? []
    for (const meal of mealsWithoutRecipes) {
      try {
        const updated = await apiPost<PlannedMeal>('/api/generate/recipe', { meal_id: meal.id })
        setPlan(prev => prev ? {
          ...prev,
          meals: prev.meals?.map(m => m.id === meal.id ? updated : m)
        } : prev)
      } catch { /* continue */ }
    }
    setGeneratingAll(false)
  }

  async function handleSwap(meal: PlannedMeal) {
    setSwapping(true)
    setSelectedMeal(null)
    try {
      const updated = await apiPost<PlannedMeal>(`/api/plans/${id}/swap`, { meal_id: meal.id })
      setPlan(prev => prev ? {
        ...prev,
        meals: prev.meals?.map(m => m.id === meal.id ? updated : m)
      } : prev)
      showToast(`Swapped to ${updated.meal_name}`)
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Swap failed')
    } finally {
      setSwapping(false)
    }
  }

  async function handleRemove(meal: PlannedMeal) {
    Alert.alert('Remove Meal', `Remove ${meal.meal_name} from this plan?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await apiDelete(`/api/plans/meals/${meal.id}`)
            setPlan(prev => prev ? {
              ...prev,
              meals: prev.meals?.filter(m => m.id !== meal.id)
            } : prev)
            setSelectedMeal(null)
          } catch { /* silent */ }
        }
      }
    ])
  }

  async function handleAddMeal(day: string) {
    setAddingMealDay(day)
    try {
      const newMeal = await apiPost<PlannedMeal>(`/api/plans/${id}/add-meal`, { day_of_week: day })
      setPlan(prev => prev ? {
        ...prev,
        meals: [...(prev.meals ?? []), newMeal]
      } : prev)
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not add meal')
    } finally {
      setAddingMealDay(null)
    }
  }

  async function handleGroceryList() {
    setGeneratingGrocery(true)
    try {
      const unloaded = plan?.meals?.filter(m => !m.recipe_json || Object.keys(m.recipe_json).length === 0) ?? []

      if (unloaded.length === 0) {
        try {
          await apiGet(`/api/plans/${id}/grocery`)
          setGeneratingGrocery(false)
          router.push(`/(screens)/plan/${id}/grocery`)
          return
        } catch {
          // No grocery list yet — fall through to generate
        }
      }

      if (unloaded.length > 0) {
        for (const meal of unloaded) {
          try {
            const updated = await apiPost<PlannedMeal>('/api/generate/recipe', { meal_id: meal.id })
            setPlan(prev => prev ? {
              ...prev,
              meals: prev.meals?.map(m => m.id === meal.id ? updated : m)
            } : prev)
          } catch { /* continue with what we have */ }
        }
      }

      await apiPost(`/api/generate/grocery`, { plan_id: id })
      router.push(`/(screens)/plan/${id}/grocery`)
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not generate grocery list')
    } finally {
      setGeneratingGrocery(false)
    }
  }

  if (loading) return <PlanScreenSkeleton />
  if (loadError) return <ErrorView message="Could not load plan. Check your connection and try again." onRetry={() => { setLoading(true); loadPlan() }} />
  if (!plan) return <ErrorView message="Plan not found." />

  const mealsByDay = Object.fromEntries(
    DAYS.map(d => [d, plan.meals?.find(m => m.day_of_week === d)])
  )

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>{plan.name}</Text>
            <Text style={styles.dateRange}>
              {new Date(plan.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(plan.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
            {plan.notes?.startsWith('Theme:') || plan.notes?.includes('· Theme:') ? (
              <Text style={styles.themeBadge}>
                {plan.notes.match(/Theme:\s*([^·]+)/)?.[1]?.trim() ?? ''}
              </Text>
            ) : null}
          </View>
          <View style={{ width: 48 }} />
        </View>

        {/* Recipe warning */}
        {plan.meals && plan.meals.some(m => !m.recipe_json || Object.keys(m.recipe_json).length === 0) && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>⚠️ Some recipes aren't loaded. Tapping Grocery List will load them automatically before generating.</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleGenerateAll} disabled={generatingAll}>
            {generatingAll ? <ActivityIndicator color={Colors.primary} size="small" /> : <Text style={styles.actionBtnText}>🍳 Load Recipes</Text>}
          </TouchableOpacity>
          <GradientButton
            onPress={handleGroceryList}
            loading={generatingGrocery}
            disabled={generatingAll}
            style={styles.groceryBtn}
          >
            🛒 Grocery List
          </GradientButton>
        </View>

        {/* Week Grid */}
        {DAYS.map(day => {
          const meal = mealsByDay[day]
          return (
            <View key={day} style={styles.dayRow}>
              <View style={styles.dayLabel}>
                <Text style={styles.dayLabelText}>{DAY_LABELS[day]}</Text>
              </View>
              {meal ? (
                <TouchableOpacity style={styles.mealCard} onPress={() => loadRecipe(meal)}>
                  {meal.image_url && (
                    <Image source={{ uri: meal.image_url }} style={styles.mealImage} />
                  )}
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{meal.meal_name}</Text>
                    {meal.recipe_json && Object.keys(meal.recipe_json).length > 0 ? (
                      <Text style={styles.mealMeta}>
                        {(meal.recipe_json as Recipe).totalTimeMinutes} min · {(meal.recipe_json as Recipe).cuisine}
                      </Text>
                    ) : (
                      <Text style={styles.mealMetaMuted}>Tap to load recipe</Text>
                    )}
                  </View>
                  <Text style={favoritedMeals[meal.meal_name] ? styles.starFilled : styles.starEmpty}>
                    {favoritedMeals[meal.meal_name] ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.emptyDay} onPress={() => handleAddMeal(day)} disabled={addingMealDay === day}>
                  {addingMealDay === day
                    ? <ActivityIndicator size="small" color={Colors.primary} />
                    : <Text style={styles.emptyDayText}>+ Add meal</Text>
                  }
                </TouchableOpacity>
              )}
            </View>
          )
        })}
      </ScrollView>

      {swapping && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={Colors.white} />
          <Text style={styles.overlayText}>Finding a replacement meal...</Text>
        </View>
      )}

      {/* Meal Detail Modal */}
      <Modal visible={!!selectedMeal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedMeal(null)}>
        {selectedMeal && (
          <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedMeal.meal_name}</Text>
              <View style={styles.modalHeaderRight}>
                <TouchableOpacity
                  onPress={() => handleToggleFavorite(selectedMeal)}
                  disabled={togglingFav}
                  style={styles.starBtn}
                >
                  <Text style={[styles.starBtnText, favoritedMeals[selectedMeal.meal_name] ? styles.starFilled : styles.starEmpty]}>
                    {favoritedMeals[selectedMeal.meal_name] ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedMeal(null)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {selectedMeal.image_url && (
              <Image source={{ uri: selectedMeal.image_url }} style={styles.modalImage} />
            )}

            {loadingRecipe ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator color={Colors.primary} />
                <Text style={styles.modalLoadingText}>Generating recipe...</Text>
              </View>
            ) : selectedMeal.recipe_json && Object.keys(selectedMeal.recipe_json).length > 0 ? (
              <>
                {(() => {
                  const r = selectedMeal.recipe_json as Recipe
                  return (
                    <>
                      <Text style={styles.recipeDesc}>{r.description}</Text>

                      <View style={styles.recipeMeta}>
                        <View style={styles.recipeMetaItem}><Text style={styles.recipeMetaLabel}>Prep</Text><Text style={styles.recipeMetaValue}>{r.prepTimeMinutes}m</Text></View>
                        <View style={styles.recipeMetaItem}><Text style={styles.recipeMetaLabel}>Cook</Text><Text style={styles.recipeMetaValue}>{r.cookTimeMinutes}m</Text></View>
                        <View style={styles.recipeMetaItem}><Text style={styles.recipeMetaLabel}>Total</Text><Text style={styles.recipeMetaValue}>{r.totalTimeMinutes}m</Text></View>
                        <View style={styles.recipeMetaItem}><Text style={styles.recipeMetaLabel}>Serves</Text><Text style={styles.recipeMetaValue}>{r.servings}</Text></View>
                      </View>

                      <Text style={styles.recipeSection}>Ingredients</Text>
                      {r.ingredients.map((ing, i) => (
                        <Text key={i} style={styles.ingredient}>• {ing.quantity} {ing.name}{ing.notes ? ` (${ing.notes})` : ''}</Text>
                      ))}

                      <Text style={styles.recipeSection}>Instructions</Text>
                      {r.steps.map(step => (
                        <View key={step.stepNumber} style={styles.step}>
                          <Text style={styles.stepNum}>{step.stepNumber}</Text>
                          <Text style={styles.stepText}>{step.instruction}</Text>
                        </View>
                      ))}

                      {r.planAheadTips && (
                        <>
                          <Text style={styles.recipeSection}>Plan-Ahead Tips</Text>
                          <Text style={styles.sectionText}>{r.planAheadTips}</Text>
                        </>
                      )}
                      {r.servingSuggestions && (
                        <>
                          <Text style={styles.recipeSection}>Serving Suggestions</Text>
                          <Text style={styles.sectionText}>{r.servingSuggestions}</Text>
                        </>
                      )}
                    </>
                  )
                })()}
              </>
            ) : (
              <Text style={styles.noRecipe}>Recipe not loaded yet. Close and tap the meal card to load it.</Text>
            )}

            {/* Meal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionBtn}
                onPress={() => { setSelectedMeal(null); router.push(`/(screens)/feedback/${selectedMeal.id}`) }}
              >
                <Text style={styles.modalActionText}>📝 Leave Feedback</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleSwap(selectedMeal)}>
                <Text style={styles.modalActionText}>🔄 Swap Meal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalActionBtn, styles.modalActionDanger]} onPress={() => handleRemove(selectedMeal)}>
                <Text style={[styles.modalActionText, { color: Colors.error }]}>🗑 Remove</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </Modal>
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onHide={hideToast} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.screenBg },
  content: { padding: Spacing.xl, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  back: { color: Colors.primary, fontFamily: Fonts.bodyMedium, fontSize: 16, paddingTop: 4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: 20, fontFamily: Fonts.displayBold, color: Colors.onSurface },
  dateRange: { fontSize: 13, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, marginTop: 2 },
  themeBadge: { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.primary, marginTop: 4, backgroundColor: Colors.surfaceLow, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.md, overflow: 'hidden' },
  warningBanner: { backgroundColor: Colors.warningBg, borderRadius: Radius.md, padding: 10, marginBottom: Spacing.md },
  warningText: { fontSize: 12, fontFamily: Fonts.bodyRegular, color: '#713f12', lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.xl, alignItems: 'center' },
  actionBtn: { flex: 1, backgroundColor: Colors.surfaceLow, borderRadius: Radius.lg, padding: 12, alignItems: 'center' },
  actionBtnText: { fontFamily: Fonts.bodySemiBold, color: Colors.onSurfaceVariant, fontSize: 13 },
  groceryBtn: { flex: 1 },
  dayRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  dayLabel: { width: 36, alignItems: 'center' },
  dayLabelText: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: Colors.onSurfaceMuted },
  mealCard: { flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: Radius.xl, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', ...Shadow.card },
  mealImage: { width: 56, height: 56 },
  mealInfo: { flex: 1, padding: 10 },
  mealName: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: Colors.onSurface },
  mealMeta: { fontSize: 12, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, marginTop: 2 },
  mealMetaMuted: { fontSize: 12, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceMuted, marginTop: 2 },
  starFilled: { color: '#f59e0b', fontSize: 18, paddingRight: 10 },
  starEmpty: { color: Colors.onSurfaceMuted, fontSize: 18, paddingRight: 10 },
  emptyDay: { flex: 1, backgroundColor: Colors.surfaceLow, borderRadius: Radius.xl, padding: 14 },
  emptyDayText: { fontSize: 13, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceMuted },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', gap: 12 },
  overlayText: { color: Colors.white, fontFamily: Fonts.bodySemiBold, fontSize: 16 },
  modal: { flex: 1, backgroundColor: Colors.screenBg },
  modalContent: { padding: Spacing.xl, paddingBottom: 60 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  modalTitle: { fontSize: 22, fontFamily: Fonts.displayBold, color: Colors.onSurface, flex: 1, marginRight: 12 },
  modalHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  starBtn: { padding: 4 },
  starBtnText: { fontSize: 26 },
  modalClose: { fontSize: 20, color: Colors.onSurfaceMuted, padding: 4 },
  modalImage: { width: '100%', height: 200, borderRadius: Radius.xl, marginBottom: Spacing.lg },
  modalLoading: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  modalLoadingText: { color: Colors.onSurfaceVariant, fontFamily: Fonts.bodyRegular, fontSize: 14 },
  noRecipe: { color: Colors.onSurfaceMuted, fontFamily: Fonts.bodyRegular, fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  recipeDesc: { fontSize: 14, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, lineHeight: 20, marginBottom: Spacing.lg },
  recipeMeta: { flexDirection: 'row', backgroundColor: Colors.surfaceLow, borderRadius: Radius.lg, padding: 12, marginBottom: Spacing.xl, gap: 4 },
  recipeMetaItem: { flex: 1, alignItems: 'center' },
  recipeMetaLabel: { fontSize: 11, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceMuted },
  recipeMetaValue: { fontSize: 15, fontFamily: Fonts.displayBold, color: Colors.onSurface, marginTop: 2 },
  recipeSection: { fontSize: 16, fontFamily: Fonts.displaySemiBold, color: Colors.onSurface, marginTop: Spacing.xl, marginBottom: Spacing.md },
  ingredient: { fontSize: 14, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, marginBottom: 6, lineHeight: 20 },
  step: { flexDirection: 'row', marginBottom: 12, gap: 10 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, color: Colors.white, textAlign: 'center', lineHeight: 24, fontSize: 12, fontFamily: Fonts.bodySemiBold },
  stepText: { flex: 1, fontSize: 14, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, lineHeight: 21 },
  sectionText: { fontSize: 14, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, lineHeight: 21, marginBottom: Spacing.sm },
  modalActions: { marginTop: 28, gap: 10, paddingTop: Spacing.xl },
  modalActionBtn: { backgroundColor: Colors.surfaceLow, borderRadius: Radius.lg, padding: 14, alignItems: 'center' },
  modalActionDanger: { backgroundColor: 'rgba(220,38,38,0.08)' },
  modalActionText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.onSurfaceVariant },
})
