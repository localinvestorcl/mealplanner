import { useState } from 'react'
import { View, Text, TextInput, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { apiPost } from '@/lib/api'
import { WeeklyPlan } from '@/types/plan'
import { GradientButton } from '@/components/GradientButton'
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'

function getNextMonday(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? 1 : 8 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

export default function GenerateScreen() {
  const router = useRouter()
  const [startDate, setStartDate] = useState(getNextMonday())
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setStatus('Asking Claude to plan your week...')
    try {
      const plan = await apiPost<WeeklyPlan>('/api/generate/plan', {
        start_date: startDate,
        notes: notes.trim() || null,
      })
      setStatus('Plan created!')
      router.push(`/(screens)/plan/${plan.id}`)
    } catch (e: unknown) {
      Alert.alert('Generation failed', e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      setStatus('')
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Generate Meal Plan</Text>
      <Text style={styles.subtitle}>Claude will create a 7-day dinner plan based on your household profile and rules.</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Week Starting (Monday)</Text>
        <TextInput
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.onSurfaceMuted}
        />
        <Text style={styles.hint}>Format: YYYY-MM-DD (e.g. 2026-04-07)</Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Special notes for this week (optional)</Text>
        <TextInput
          style={styles.textarea}
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. Make it lighter this week, we have a busy Thursday..."
          placeholderTextColor={Colors.onSurfaceMuted}
          multiline
          numberOfLines={4}
        />
      </View>

      {loading && (
        <View style={styles.statusBox}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      )}

      <GradientButton onPress={handleGenerate} loading={loading}>Generate Plan →</GradientButton>

      <Text style={styles.disclaimer}>Generation takes 10–20 seconds. Recipes are loaded individually after the plan is created.</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.screenBg },
  content: { padding: Spacing.xl, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 26, fontFamily: Fonts.displayBold, color: Colors.onSurface, marginBottom: Spacing.sm },
  subtitle: { fontSize: 14, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, marginBottom: Spacing.section, lineHeight: 20 },
  fieldGroup: { marginBottom: Spacing.xl },
  label: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: Colors.onSurface, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.surfaceHighest, borderRadius: Radius.lg, padding: 14, fontSize: 16, fontFamily: Fonts.bodyRegular, color: Colors.onSurface },
  hint: { fontSize: 12, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceMuted, marginTop: 4 },
  textarea: { backgroundColor: Colors.surfaceHighest, borderRadius: Radius.lg, padding: 14, fontSize: 15, fontFamily: Fonts.bodyRegular, color: Colors.onSurface, height: 100, textAlignVertical: 'top' },
  statusBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceLow, borderRadius: Radius.lg, padding: 14, marginBottom: Spacing.lg, gap: 10 },
  statusText: { color: Colors.onSurfaceVariant, fontSize: 14, fontFamily: Fonts.bodyMedium },
  disclaimer: { fontSize: 12, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceMuted, textAlign: 'center', marginTop: Spacing.lg, lineHeight: 18 },
})
