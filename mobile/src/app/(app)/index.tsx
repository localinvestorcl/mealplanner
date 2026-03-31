import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { apiGet } from '@/lib/api'
import { HouseholdProfile } from '@/types/profile'
import { WeeklyPlan, GroceryList } from '@/types/plan'
import { Colors, Fonts, Radius, Spacing, Shadow } from '@/constants/theme'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning 👋'
  if (h < 17) return 'Good afternoon 👋'
  return 'Good evening 👋'
}

export default function DashboardScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState<HouseholdProfile | null>(null)
  const [recentPlan, setRecentPlan] = useState<WeeklyPlan | null>(null)
  const [recentGroceryList, setRecentGroceryList] = useState<GroceryList | null>(null)
  const [planCount, setPlanCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      loadDashboard()
    }, [])
  )

  async function loadDashboard() {
    try {
      const [profileData, plansData] = await Promise.all([
        apiGet<HouseholdProfile | null>('/api/profile'),
        apiGet<WeeklyPlan[]>('/api/plans'),
      ])
      setProfile(profileData)
      setPlanCount(plansData.length)
      if (plansData.length > 0) {
        const plan = plansData[0]
        setRecentPlan(plan)
        try {
          const gl = await apiGet<GroceryList>(`/api/plans/${plan.id}/grocery`)
          setRecentGroceryList(gl)
        } catch {
          setRecentGroceryList(null)
        }
      }
    } catch {
      // Profile may not exist yet
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.familyName}>{profile?.name ?? 'Your Family'}</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.signOut}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {!profile && (
        <TouchableOpacity style={styles.setupBanner} onPress={() => router.push('/(app)/profile')}>
          <Text style={styles.setupBannerText}>👆 Set up your household profile to get started</Text>
        </TouchableOpacity>
      )}

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.family_size ?? '—'}</Text>
          <Text style={styles.statLabel}>Family Members</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{planCount}</Text>
          <Text style={styles.statLabel}>Saved Plans</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{recentPlan ? '✓' : '—'}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      {/* Grocery List shortcut */}
      {recentGroceryList && recentPlan && (
        <>
          <Text style={styles.sectionTitle}>This Week's Grocery List</Text>
          <TouchableOpacity
            style={styles.groceryCard}
            onPress={() => router.push(`/(screens)/plan/${recentPlan.id}/grocery`)}
          >
            <Text style={styles.groceryEmoji}>🛒</Text>
            <View style={styles.groceryInfo}>
              <Text style={styles.groceryTitle}>{recentPlan.name}</Text>
              <Text style={styles.grocerySubtitle}>Tap to open your grocery list</Text>
            </View>
            <Text style={styles.groceryChevron}>›</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(app)/generate')}>
          <Text style={styles.actionEmoji}>📅</Text>
          <Text style={styles.actionLabel}>Generate Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(app)/profile')}>
          <Text style={styles.actionEmoji}>👤</Text>
          <Text style={styles.actionLabel}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(app)/favorites')}>
          <Text style={styles.actionEmoji}>⭐</Text>
          <Text style={styles.actionLabel}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(screens)/preferences')}>
          <Text style={styles.actionEmoji}>⚙️</Text>
          <Text style={styles.actionLabel}>Preferences</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Plan */}
      {recentPlan && (
        <>
          <Text style={styles.sectionTitle}>Most Recent Plan</Text>
          <TouchableOpacity
            style={styles.recentPlanCard}
            onPress={() => router.push(`/(screens)/plan/${recentPlan.id}`)}
          >
            <Text style={styles.recentPlanName}>{recentPlan.name}</Text>
            <Text style={styles.recentPlanDate}>
              {new Date(recentPlan.start_date).toLocaleDateString()} – {new Date(recentPlan.end_date).toLocaleDateString()}
            </Text>
            <Text style={styles.recentPlanMeals}>
              {recentPlan.meals?.length ?? 0} meals planned
            </Text>
            <Text style={styles.viewLink}>View plan →</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.screenBg },
  content: { padding: Spacing.xl, paddingTop: 60, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.screenBg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xl },
  greeting: { fontSize: 14, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant },
  familyName: { fontSize: 28, fontFamily: Fonts.displayBold, color: Colors.onSurface, marginBottom: Spacing.section },
  signOut: { color: Colors.onSurfaceMuted, fontFamily: Fonts.bodyRegular, fontSize: 14, paddingTop: 4 },
  setupBanner: { backgroundColor: Colors.surfaceLow, borderRadius: Radius.xl, padding: 14, marginBottom: Spacing.xl },
  setupBannerText: { color: Colors.primary, fontFamily: Fonts.bodyMedium, fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: 28 },
  statCard: { flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', ...Shadow.card },
  statNumber: { fontSize: 32, fontFamily: Fonts.displayBold, color: Colors.primary },
  statLabel: { fontSize: 11, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontFamily: Fonts.displaySemiBold, color: Colors.onSurface, marginBottom: Spacing.md },
  groceryCard: { backgroundColor: Colors.surfaceLowest, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: 28, flexDirection: 'row', alignItems: 'center', gap: 14, ...Shadow.card },
  groceryEmoji: { fontSize: 28 },
  groceryInfo: { flex: 1 },
  groceryTitle: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.onSurface },
  grocerySubtitle: { fontSize: 12, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, marginTop: 2 },
  groceryChevron: { fontSize: 22, color: Colors.onSurfaceMuted },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: 28 },
  actionCard: { width: '47%', backgroundColor: Colors.surfaceLowest, borderRadius: Radius.xl, padding: Spacing.xxl, alignItems: 'center', ...Shadow.card },
  actionEmoji: { fontSize: 28, marginBottom: Spacing.sm },
  actionLabel: { fontSize: 13, fontFamily: Fonts.bodyMedium, color: Colors.onSurface, textAlign: 'center' },
  recentPlanCard: { backgroundColor: Colors.surfaceLowest, borderRadius: Radius.xl, padding: Spacing.xl, ...Shadow.card },
  recentPlanName: { fontSize: 18, fontFamily: Fonts.bodySemiBold, color: Colors.onSurface, marginBottom: 4 },
  recentPlanDate: { fontSize: 13, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, marginBottom: 4 },
  recentPlanMeals: { fontSize: 13, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, marginBottom: Spacing.md },
  viewLink: { color: Colors.primary, fontFamily: Fonts.bodySemiBold, fontSize: 14 },
})
