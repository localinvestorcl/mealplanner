import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { apiGet, apiDelete } from '@/lib/api'
import { WeeklyPlan } from '@/types/plan'
import { ListScreenSkeleton } from '@/components/Skeleton'
import { ErrorView } from '@/components/ErrorView'
import { GradientButton } from '@/components/GradientButton'
import { Colors, Fonts, Radius, Spacing, Shadow } from '@/constants/theme'

export default function PlansScreen() {
  const router = useRouter()
  const [plans, setPlans] = useState<WeeklyPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { loadPlans() }, [])

  async function loadPlans(isRefresh = false) {
    if (!isRefresh) setLoadError(false)
    try {
      const data = await apiGet<WeeklyPlan[]>('/api/plans')
      setPlans(data)
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
    await loadPlans(true)
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert('Delete Plan', `Delete "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiDelete(`/api/plans/${id}`)
            setPlans(plans.filter(p => p.id !== id))
          } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed to delete plan')
          }
        }
      }
    ])
  }

  if (loading) return <ListScreenSkeleton rows={3} />
  if (loadError) return <ErrorView message="Could not load your plans. Check your connection and try again." onRetry={() => { setLoading(true); loadPlans() }} />

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
    >
      <Text style={styles.title}>Saved Plans</Text>
      {plans.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text style={styles.emptyTitle}>No plans yet</Text>
          <Text style={styles.emptyText}>Generate your first weekly meal plan to get started.</Text>
          <GradientButton onPress={() => router.push('/(app)/generate')} style={styles.generateButton}>Generate a Plan</GradientButton>
        </View>
      ) : (
        plans.map(plan => (
          <View key={plan.id} style={styles.planCard}>
            <TouchableOpacity style={styles.planMain} onPress={() => router.push(`/(screens)/plan/${plan.id}`)}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planDate}>
                {new Date(plan.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(plan.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              <Text style={styles.planMeals}>{plan.meals?.length ?? 0} meals</Text>
            </TouchableOpacity>
            <View style={styles.planActions}>
              <TouchableOpacity onPress={() => router.push(`/(screens)/plan/${plan.id}`)} style={styles.viewBtn}>
                <Text style={styles.viewBtnText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(plan.id, plan.name)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.screenBg },
  content: { padding: Spacing.xl, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 26, fontFamily: Fonts.displayBold, color: Colors.onSurface, marginBottom: Spacing.section },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: 20, fontFamily: Fonts.displaySemiBold, color: Colors.onSurface, marginBottom: Spacing.sm },
  emptyText: { fontSize: 14, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, textAlign: 'center', marginBottom: Spacing.xxl, lineHeight: 20 },
  generateButton: { paddingHorizontal: 24 },
  planCard: { backgroundColor: Colors.surfaceLowest, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadow.card },
  planMain: { marginBottom: Spacing.md },
  planName: { fontSize: 17, fontFamily: Fonts.bodySemiBold, color: Colors.onSurface },
  planDate: { fontSize: 13, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, marginTop: 4 },
  planMeals: { fontSize: 13, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceMuted, marginTop: 2 },
  planActions: { flexDirection: 'row', gap: 10, paddingTop: Spacing.md },
  viewBtn: { flex: 1, backgroundColor: Colors.surfaceLow, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  viewBtnText: { color: Colors.onSurfaceVariant, fontFamily: Fonts.bodySemiBold, fontSize: 14 },
  deleteBtn: { flex: 1, backgroundColor: 'rgba(220,38,38,0.1)', borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  deleteBtnText: { color: Colors.error, fontFamily: Fonts.bodySemiBold, fontSize: 14 },
})
