import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import { FavoriteMeal } from '@/types/feedback'
import { ListScreenSkeleton } from '@/components/Skeleton'
import { ErrorView } from '@/components/ErrorView'
import { Toast, useToast } from '@/components/Toast'
import { GradientButton } from '@/components/GradientButton'
import { Colors, Fonts, Radius, Spacing, Shadow } from '@/constants/theme'

export default function FavoritesScreen() {
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCuisine, setNewCuisine] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    loadFavorites()
  }, [])

  async function loadFavorites(isRefresh = false) {
    if (!isRefresh) setLoadError(false)
    try {
      const data = await apiGet<FavoriteMeal[]>('/api/favorites')
      setFavorites(data)
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
    await loadFavorites(true)
  }

  async function handleAdd() {
    if (!newName.trim()) { Alert.alert('Enter a meal name.'); return }
    setAdding(true)
    try {
      const fav = await apiPost<FavoriteMeal>('/api/favorites', {
        name: newName.trim(),
        cuisine: newCuisine.trim() || null,
      })
      setFavorites([fav, ...favorites])
      setNewName('')
      setNewCuisine('')
      showToast('Added to favorites')
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to add favorite')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert('Remove Favorite', `Remove "${name}" from favorites?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await apiDelete(`/api/favorites/${id}`)
            setFavorites(favorites.filter(f => f.id !== id))
            showToast('Removed from favorites', 'info')
          } catch { /* silent */ }
        }
      }
    ])
  }

  if (loading) return <ListScreenSkeleton rows={4} />
  if (loadError) return <ErrorView message="Could not load favorites. Check your connection and try again." onRetry={() => { setLoading(true); loadFavorites() }} />

  return (
    <View style={styles.wrapper}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
    >
      <Text style={styles.title}>Favorite Meals</Text>
      <Text style={styles.subtitle}>Saved favorites get rotated into your weekly plans.</Text>

      {/* Add New */}
      <View style={styles.addCard}>
        <Text style={styles.addTitle}>Add a Favorite</Text>
        <TextInput
          style={styles.input}
          value={newName}
          onChangeText={setNewName}
          placeholder="Meal name (e.g. Slow Cooker Chicken Tacos)"
          placeholderTextColor={Colors.onSurfaceMuted}
        />
        <TextInput
          style={styles.input}
          value={newCuisine}
          onChangeText={setNewCuisine}
          placeholder="Cuisine (optional)"
          placeholderTextColor={Colors.onSurfaceMuted}
        />
        <GradientButton onPress={handleAdd} loading={adding}>Add to Favorites</GradientButton>
      </View>

      {/* List */}
      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No favorites yet. Add meals above or save them from your feedback.</Text>
        </View>
      ) : (
        favorites.map(fav => (
          <View key={fav.id} style={styles.favCard}>
            <View style={styles.favInfo}>
              <Text style={styles.favName}>{fav.name}</Text>
              {fav.cuisine && <Text style={styles.favCuisine}>{fav.cuisine}</Text>}
              {fav.last_used_at && (
                <Text style={styles.favUsed}>Last used {new Date(fav.last_used_at).toLocaleDateString()}</Text>
              )}
              {fav.notes && <Text style={styles.favNotes}>{fav.notes}</Text>}
            </View>
            <View style={styles.favActions}>
              <TouchableOpacity onPress={() => handleDelete(fav.id, fav.name)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
    {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onHide={hideToast} />}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.screenBg },
  content: { padding: Spacing.xl, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 26, fontFamily: Fonts.displayBold, color: Colors.onSurface, marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, marginBottom: Spacing.section },
  addCard: { backgroundColor: Colors.surfaceLowest, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.xl, ...Shadow.card },
  addTitle: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.onSurface, marginBottom: Spacing.md },
  input: { backgroundColor: Colors.surfaceHighest, borderRadius: Radius.lg, padding: 12, fontSize: 14, fontFamily: Fonts.bodyRegular, color: Colors.onSurface, marginBottom: Spacing.md },
  emptyState: { padding: Spacing.xl, alignItems: 'center' },
  emptyText: { color: Colors.onSurfaceMuted, fontFamily: Fonts.bodyRegular, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  favCard: { backgroundColor: Colors.surfaceLowest, borderRadius: Radius.xl, padding: Spacing.xl, marginBottom: Spacing.md, flexDirection: 'row', alignItems: 'flex-start', ...Shadow.card },
  favInfo: { flex: 1 },
  favName: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.onSurface },
  favCuisine: { fontSize: 12, fontFamily: Fonts.bodyMedium, color: Colors.primary, marginTop: 2 },
  favUsed: { fontSize: 12, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceMuted, marginTop: 4 },
  favNotes: { fontSize: 13, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, marginTop: 4, fontStyle: 'italic' },
  favActions: { justifyContent: 'center' },
  removeText: { color: Colors.error, fontFamily: Fonts.bodyMedium, fontSize: 13 },
})
