import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiGet, apiPost } from '@/lib/api'
import { GroceryList, GrocerySection } from '@/types/plan'
import { GroceryScreenSkeleton } from '@/components/Skeleton'
import { ErrorView } from '@/components/ErrorView'
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'

export default function GroceryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    loadAll()
  }, [id])

  async function loadAll() {
    setLoadError(false)
    try {
      const [data, saved] = await Promise.all([
        apiGet<GroceryList>(`/api/plans/${id}/grocery`),
        AsyncStorage.getItem(`grocery-checked-${id}`),
      ])
      setGroceryList(data)
      if (saved) setCheckedItems(new Set(JSON.parse(saved) as string[]))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      if (!msg.includes('404') && !msg.toLowerCase().includes('not found')) {
        setLoadError(true)
      }
      setGroceryList(null)
    } finally {
      setLoading(false)
    }
  }

  async function toggleItem(key: string) {
    setCheckedItems(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      AsyncStorage.setItem(`grocery-checked-${id}`, JSON.stringify([...next]))
      return next
    })
  }

  async function handleRegenerate() {
    setRegenerating(true)
    try {
      const data = await apiPost<GroceryList>('/api/generate/grocery', { plan_id: id })
      setGroceryList(data)
      setCheckedItems(new Set())
      await AsyncStorage.removeItem(`grocery-checked-${id}`)
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not regenerate grocery list')
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) return <GroceryScreenSkeleton />
  if (loadError) return <ErrorView message="Could not load grocery list. Check your connection and try again." onRetry={() => { setLoading(true); loadAll() }} />

  const sections: GrocerySection[] = (groceryList?.items_json ?? []).filter(
    (s): s is GrocerySection => !!s && Array.isArray(s.items)
  )
  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0)
  const checkedCount = checkedItems.size

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Plan</Text></TouchableOpacity>
        <Text style={styles.title}>Grocery List</Text>
        <View style={{ width: 48 }} />
      </View>

      {totalItems > 0 && (
        <>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(checkedCount / totalItems) * 100}%` as `${number}%` }]} />
          </View>
          <Text style={styles.progressText}>{checkedCount} of {totalItems} items checked</Text>
        </>
      )}

      {sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No grocery list generated yet.</Text>
          <TouchableOpacity style={styles.regenBtn} onPress={handleRegenerate}>
            <Text style={styles.regenBtnText}>Generate Grocery List</Text>
          </TouchableOpacity>
        </View>
      ) : (
        sections.map(section => (
          <View key={section.aisle} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.aisle}</Text>
            {section.items.map((item, i) => {
              const key = `${section.aisle}-${i}`
              const checked = checkedItems.has(key)
              return (
                <TouchableOpacity key={key} style={styles.itemRow} onPress={() => toggleItem(key)}>
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemText, checked && styles.itemChecked]}>
                      {item.name}
                      {item.quantity ? <Text style={[styles.itemQty, checked && styles.itemChecked]}> — {item.quantity}</Text> : null}
                    </Text>
                    {item.notes ? <Text style={styles.itemNote}>{item.notes}</Text> : null}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        ))
      )}

      <TouchableOpacity style={styles.regenBtn} onPress={handleRegenerate} disabled={regenerating}>
        {regenerating
          ? <ActivityIndicator color={Colors.primary} size="small" />
          : <Text style={styles.regenBtnText}>🔄 Regenerate List</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.screenBg },
  content: { padding: Spacing.xl, paddingTop: 60, paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  back: { color: Colors.primary, fontFamily: Fonts.bodyMedium, fontSize: 16 },
  title: { fontSize: 22, fontFamily: Fonts.displayBold, color: Colors.onSurface },
  progressBar: { height: 6, backgroundColor: Colors.surfaceHigh, borderRadius: 3, marginBottom: 4 },
  progressFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
  progressText: { fontSize: 12, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceMuted, marginBottom: Spacing.xl, textAlign: 'right' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: Colors.onSurfaceMuted, fontFamily: Fonts.bodyRegular, fontSize: 14, marginBottom: Spacing.lg },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: Colors.primary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  checkbox: { width: 22, height: 22, borderRadius: Radius.sm, borderWidth: 2, borderColor: Colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { color: Colors.white, fontSize: 13, fontFamily: Fonts.bodySemiBold },
  itemContent: { flex: 1 },
  itemText: { fontSize: 15, fontFamily: Fonts.bodyRegular, color: Colors.onSurface },
  itemQty: { fontSize: 15, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant },
  itemChecked: { textDecorationLine: 'line-through', color: Colors.onSurfaceMuted },
  itemNote: { fontSize: 12, fontFamily: Fonts.bodyRegular, color: Colors.secondary, marginTop: 2, fontStyle: 'italic' },
  regenBtn: { marginTop: 12, backgroundColor: Colors.surfaceLow, borderRadius: Radius.lg, padding: 14, alignItems: 'center' },
  regenBtnText: { color: Colors.onSurfaceVariant, fontFamily: Fonts.bodySemiBold, fontSize: 14 },
})
