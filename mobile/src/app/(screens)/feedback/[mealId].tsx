import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Switch, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { apiPost } from '@/lib/api'
import { GradientButton } from '@/components/GradientButton'
import { Colors, Fonts, Radius, Spacing, Shadow } from '@/constants/theme'

export default function FeedbackScreen() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>()
  const router = useRouter()

  const [familyLiked, setFamilyLiked] = useState<boolean | null>(null)
  const [kidsLiked, setKidsLiked] = useState<boolean | null>(null)
  const [wouldRepeat, setWouldRepeat] = useState<boolean | null>(null)
  const [tooBland, setTooBland] = useState(false)
  const [tooDry, setTooDry] = useState(false)
  const [neededMoreSauce, setNeededMoreSauce] = useState(false)
  const [neededMoreVeg, setNeededMoreVeg] = useState(false)
  const [tooMuchCleanup, setTooMuchCleanup] = useState(false)
  const [saveAsFavorite, setSaveAsFavorite] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await apiPost('/api/feedback', {
        planned_meal_id: mealId,
        family_liked: familyLiked,
        kids_liked: kidsLiked,
        would_repeat: wouldRepeat,
        too_bland: tooBland,
        too_dry: tooDry,
        needed_more_sauce: neededMoreSauce,
        needed_more_veg: neededMoreVeg,
        too_much_cleanup: tooMuchCleanup,
        notes: notes.trim() || null,
        save_as_favorite: saveAsFavorite,
      })
      Alert.alert('Thanks!', 'Feedback saved.', [{ text: 'OK', onPress: () => router.back() }])
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save feedback')
    } finally {
      setSaving(false)
    }
  }

  function TriToggle({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean | null) => void }) {
    return (
      <View style={styles.triToggle}>
        <Text style={styles.triLabel}>{label}</Text>
        <View style={styles.triButtons}>
          {([true, false, null] as Array<boolean | null>).map((v, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.triBtn, value === v && styles.triBtnActive]}
              onPress={() => onChange(v)}
            >
              <Text style={[styles.triBtnText, value === v && styles.triBtnTextActive]}>
                {v === true ? '👍 Yes' : v === false ? '👎 No' : '—'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  }

  function FlagRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
      <View style={styles.flagRow}>
        <Text style={styles.flagLabel}>{label}</Text>
        <Switch value={value} onValueChange={onChange} trackColor={{ true: Colors.primary, false: Colors.surfaceHigh }} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Meal Feedback</Text>
        <View style={{ width: 48 }} />
      </View>

      <Text style={styles.sectionTitle}>How did it go?</Text>
      <TriToggle label="Family liked it" value={familyLiked} onChange={setFamilyLiked} />
      <TriToggle label="Kids liked it" value={kidsLiked} onChange={setKidsLiked} />
      <TriToggle label="Would make again" value={wouldRepeat} onChange={setWouldRepeat} />

      <Text style={styles.sectionTitle}>What could be better?</Text>
      <FlagRow label="Too bland" value={tooBland} onChange={setTooBland} />
      <FlagRow label="Too dry" value={tooDry} onChange={setTooDry} />
      <FlagRow label="Needed more sauce" value={neededMoreSauce} onChange={setNeededMoreSauce} />
      <FlagRow label="Needed more vegetables" value={neededMoreVeg} onChange={setNeededMoreVeg} />
      <FlagRow label="Too much cleanup" value={tooMuchCleanup} onChange={setTooMuchCleanup} />

      <Text style={styles.sectionTitle}>Notes</Text>
      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        placeholder="Any other thoughts about this meal..."
        placeholderTextColor={Colors.onSurfaceMuted}
        multiline
        numberOfLines={4}
      />

      <View style={styles.favoriteRow}>
        <View>
          <Text style={styles.favoriteLabel}>Save as a Favorite</Text>
          <Text style={styles.favoriteHint}>It will be included in future plan suggestions</Text>
        </View>
        <Switch value={saveAsFavorite} onValueChange={setSaveAsFavorite} trackColor={{ true: Colors.primary, false: Colors.surfaceHigh }} />
      </View>

      <GradientButton onPress={handleSave} loading={saving}>Save Feedback</GradientButton>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.screenBg },
  content: { padding: Spacing.xl, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xxl },
  back: { color: Colors.primary, fontFamily: Fonts.bodyMedium, fontSize: 16 },
  title: { fontSize: 20, fontFamily: Fonts.displayBold, color: Colors.onSurface },
  sectionTitle: { fontSize: 15, fontFamily: Fonts.displaySemiBold, color: Colors.primary, marginTop: Spacing.xl, marginBottom: Spacing.md },
  triToggle: { backgroundColor: Colors.surfaceLowest, borderRadius: Radius.xl, padding: 14, marginBottom: Spacing.md, ...Shadow.card },
  triLabel: { fontSize: 14, fontFamily: Fonts.bodyMedium, color: Colors.onSurface, marginBottom: 10 },
  triButtons: { flexDirection: 'row', gap: Spacing.sm },
  triBtn: { flex: 1, padding: Spacing.sm, borderRadius: Radius.md, backgroundColor: Colors.surfaceLow, alignItems: 'center' },
  triBtnActive: { backgroundColor: Colors.surfaceHigh },
  triBtnText: { fontSize: 13, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant },
  triBtnTextActive: { color: Colors.onSurface, fontFamily: Fonts.bodySemiBold },
  flagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surfaceLowest, borderRadius: Radius.xl, padding: 14, marginBottom: Spacing.sm, ...Shadow.card },
  flagLabel: { fontSize: 14, fontFamily: Fonts.bodyRegular, color: Colors.onSurface },
  notesInput: { backgroundColor: Colors.surfaceHighest, borderRadius: Radius.lg, padding: 14, fontSize: 14, fontFamily: Fonts.bodyRegular, color: Colors.onSurface, height: 100, textAlignVertical: 'top', marginBottom: Spacing.lg },
  favoriteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.warningBg, borderRadius: Radius.xl, padding: 14, marginBottom: Spacing.xxl },
  favoriteLabel: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: '#92400e' },
  favoriteHint: { fontSize: 12, fontFamily: Fonts.bodyRegular, color: '#b45309', marginTop: 2 },
})
