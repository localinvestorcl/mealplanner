import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import { WeeklyRule, WeeklyRuleType, DayOfWeek } from '@/types/profile'
import { GradientButton } from '@/components/GradientButton'
import { Colors, Fonts, Radius, Spacing, Shadow } from '@/constants/theme'

const DAYS: Array<DayOfWeek | 'any'> = ['any', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const RULE_TYPES: WeeklyRuleType[] = ['no_red_meat', 'meatless', 'fish_only', 'cuisine', 'cooking_method', 'custom']

const RULE_LABELS: Record<WeeklyRuleType, string> = {
  no_red_meat: 'No Red Meat',
  meatless: 'Meatless',
  fish_only: 'Fish Only',
  cuisine: 'Cuisine Type',
  max_time: 'Max Time',
  cooking_method: 'Cooking Method',
  custom: 'Custom Rule',
}

export default function PreferencesScreen() {
  const router = useRouter()
  const [rules, setRules] = useState<WeeklyRule[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newDay, setNewDay] = useState<DayOfWeek | 'any'>('friday')
  const [newType, setNewType] = useState<WeeklyRuleType>('no_red_meat')
  const [newValue, setNewValue] = useState('')

  useEffect(() => {
    loadRules()
  }, [])

  async function loadRules() {
    try {
      const data = await apiGet<WeeklyRule[]>('/api/rules')
      setRules(data)
    } catch {
      setRules([])
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    if (!newValue.trim()) {
      Alert.alert('Please enter a rule description.')
      return
    }
    setAdding(true)
    try {
      const rule = await apiPost<WeeklyRule>('/api/rules', {
        day_of_week: newDay,
        rule_type: newType,
        value: newValue.trim(),
      })
      setRules([...rules, rule])
      setNewValue('')
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to add rule')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiDelete(`/api/rules/${id}`)
      setRules(rules.filter(r => r.id !== id))
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to delete rule')
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Weekly Rules</Text>
        <View style={{ width: 48 }} />
      </View>

      <Text style={styles.hint}>Rules tell the meal generator what to do on specific days. These are applied strictly.</Text>

      {/* Existing Rules */}
      {rules.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No rules yet. Add one below.</Text>
        </View>
      ) : (
        rules.map(rule => (
          <View key={rule.id} style={styles.ruleCard}>
            <View style={styles.ruleInfo}>
              <Text style={styles.ruleDay}>{rule.day_of_week === 'any' ? 'Every day' : rule.day_of_week.charAt(0).toUpperCase() + rule.day_of_week.slice(1)}</Text>
              <Text style={styles.ruleType}>{RULE_LABELS[rule.rule_type as WeeklyRuleType] ?? rule.rule_type}</Text>
              <Text style={styles.ruleValue}>{rule.value}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(rule.id)} style={styles.deleteButton}>
              <Text style={styles.deleteText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* Add New Rule */}
      <Text style={styles.sectionTitle}>Add a Rule</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Day</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {DAYS.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, newDay === d && styles.chipSelected]}
                onPress={() => setNewDay(d)}
              >
                <Text style={[styles.chipText, newDay === d && styles.chipTextSelected]}>
                  {d === 'any' ? 'Any' : d.slice(0, 3).charAt(0).toUpperCase() + d.slice(1, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Rule Type</Text>
        <View style={styles.chipRow}>
          {RULE_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, newType === t && styles.chipSelected]}
              onPress={() => setNewType(t)}
            >
              <Text style={[styles.chipText, newType === t && styles.chipTextSelected]}>{RULE_LABELS[t]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={newValue}
          onChangeText={setNewValue}
          placeholder={newType === 'no_red_meat' ? 'e.g. No beef, pork, or lamb' : 'Describe the rule...'}
          placeholderTextColor={Colors.onSurfaceMuted}
          multiline
        />
      </View>

      <GradientButton onPress={handleAdd} loading={adding} style={styles.addButton}>Add Rule</GradientButton>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.screenBg },
  content: { padding: Spacing.xl, paddingTop: 60, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.screenBg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  back: { color: Colors.primary, fontFamily: Fonts.bodyMedium, fontSize: 16 },
  title: { fontSize: 20, fontFamily: Fonts.displayBold, color: Colors.onSurface },
  hint: { fontSize: 13, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, marginBottom: Spacing.xl, lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontFamily: Fonts.displaySemiBold, color: Colors.primary, marginTop: Spacing.xxl, marginBottom: Spacing.md },
  emptyState: { backgroundColor: Colors.surfaceLowest, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.sm, ...Shadow.card },
  emptyText: { color: Colors.onSurfaceMuted, fontFamily: Fonts.bodyRegular, fontSize: 14 },
  ruleCard: { backgroundColor: Colors.surfaceLowest, borderRadius: Radius.xl, padding: 14, marginBottom: Spacing.md, flexDirection: 'row', alignItems: 'center', ...Shadow.card },
  ruleInfo: { flex: 1 },
  ruleDay: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: Colors.primary },
  ruleType: { fontSize: 12, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, marginTop: 2 },
  ruleValue: { fontSize: 14, fontFamily: Fonts.bodyRegular, color: Colors.onSurface, marginTop: 4 },
  deleteButton: { paddingHorizontal: 10, paddingVertical: 6 },
  deleteText: { color: Colors.error, fontFamily: Fonts.bodyMedium, fontSize: 13 },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontFamily: Fonts.bodyMedium, color: Colors.onSurface, marginBottom: Spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.surfaceLow },
  chipSelected: { backgroundColor: Colors.primary },
  chipText: { fontSize: 13, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant },
  chipTextSelected: { color: Colors.white, fontFamily: Fonts.bodySemiBold },
  input: { backgroundColor: Colors.surfaceHighest, borderRadius: Radius.lg, padding: 12, fontSize: 15, fontFamily: Fonts.bodyRegular, color: Colors.onSurface, minHeight: 60, textAlignVertical: 'top' },
  addButton: { marginTop: Spacing.sm },
})
