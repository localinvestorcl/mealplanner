import { useEffect, useState } from 'react'
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Switch, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { apiGet, apiPost } from '@/lib/api'
import { HouseholdProfile, DayOfWeek, FlavorLevel } from '@/types/profile'
import { GradientButton } from '@/components/GradientButton'
import { Colors, Fonts, Radius, Spacing, Shadow } from '@/constants/theme'

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const FLAVOR_LEVELS: FlavorLevel[] = ['mild', 'medium', 'bold']
const COMMON_METHODS = ['stovetop', 'oven', 'slow cooker', 'instant pot', 'air fryer', 'grill', 'microwave']

function TagInput({ label, tags, onAdd, onRemove }: {
  label: string
  tags: string[]
  onAdd: (v: string) => void
  onRemove: (v: string) => void
}) {
  const [input, setInput] = useState('')
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.tagRow}>
        {tags.map(t => (
          <TouchableOpacity key={t} style={styles.tag} onPress={() => onRemove(t)}>
            <Text style={styles.tagText}>{t} ×</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.tagInputRow}>
        <TextInput
          style={styles.tagInput}
          value={input}
          onChangeText={setInput}
          placeholder="Type and press Add"
          placeholderTextColor={Colors.onSurfaceMuted}
          onSubmitEditing={() => { if (input.trim()) { onAdd(input.trim()); setInput('') } }}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => { if (input.trim()) { onAdd(input.trim()); setInput('') } }}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function DayToggle({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.dayChip, selected && styles.dayChipSelected]}
      onPress={onToggle}
    >
      <Text style={[styles.dayChipText, selected && styles.dayChipTextSelected]}>
        {label.slice(0, 3)}
      </Text>
    </TouchableOpacity>
  )
}

export default function ProfileScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('Our Family')
  const [familySize, setFamilySize] = useState('4')
  const [numAdults, setNumAdults] = useState('2')
  const [numChildren, setNumChildren] = useState('2')
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])
  const [dislikes, setDislikes] = useState<string[]>([])
  const [preferredCuisines, setPreferredCuisines] = useState<string[]>([])
  const [noRedMeatDays, setNoRedMeatDays] = useState<DayOfWeek[]>([])
  const [meatlessDays, setMeatlessDays] = useState<DayOfWeek[]>([])
  const [lowFiber, setLowFiber] = useState(false)
  const [avoidWholeGrains, setAvoidWholeGrains] = useState(false)
  const [avoidBland, setAvoidBland] = useState(false)
  const [flavorLevel, setFlavorLevel] = useState<FlavorLevel>('medium')
  const [cookingAvailable, setCookingAvailable] = useState<string[]>([])
  const [cookingUnavailable, setCookingUnavailable] = useState<string[]>([])
  const [maxPrepTime, setMaxPrepTime] = useState('')
  const [maxTotalTime, setMaxTotalTime] = useState('')

  useEffect(() => {
    apiGet<HouseholdProfile | null>('/api/profile').then(p => {
      if (p) {
        setName(p.name)
        setFamilySize(String(p.family_size))
        setNumAdults(String(p.num_adults))
        setNumChildren(String(p.num_children))
        setDietaryRestrictions(p.dietary_restrictions)
        setAllergies(p.allergies)
        setDislikes(p.dislikes)
        setPreferredCuisines(p.preferred_cuisines)
        setNoRedMeatDays(p.no_red_meat_days)
        setMeatlessDays(p.meatless_days)
        setLowFiber(p.low_fiber)
        setAvoidWholeGrains(p.avoid_whole_grains)
        setAvoidBland(p.avoid_bland)
        setFlavorLevel(p.flavor_level)
        setCookingAvailable(p.cooking_methods_available)
        setCookingUnavailable(p.cooking_methods_unavailable)
        setMaxPrepTime(p.max_prep_time_minutes ? String(p.max_prep_time_minutes) : '')
        setMaxTotalTime(p.max_total_time_minutes ? String(p.max_total_time_minutes) : '')
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  function toggleDay(day: DayOfWeek, list: DayOfWeek[], setList: (v: DayOfWeek[]) => void) {
    setList(list.includes(day) ? list.filter(d => d !== day) : [...list, day])
  }

  function toggleMethod(method: string, list: string[], setList: (v: string[]) => void) {
    setList(list.includes(method) ? list.filter(m => m !== method) : [...list, method])
  }

  async function handleSave() {
    setSaving(true)
    try {
      await apiPost('/api/profile', {
        name,
        family_size: parseInt(familySize) || 1,
        num_adults: parseInt(numAdults) || 1,
        num_children: parseInt(numChildren) || 0,
        dietary_restrictions: dietaryRestrictions,
        allergies,
        dislikes,
        preferred_cuisines: preferredCuisines,
        no_red_meat_days: noRedMeatDays,
        meatless_days: meatlessDays,
        fish_days: [],
        low_fiber: lowFiber,
        avoid_whole_grains: avoidWholeGrains,
        avoid_bland: avoidBland,
        flavor_level: flavorLevel,
        cooking_methods_available: cookingAvailable,
        cooking_methods_unavailable: cookingUnavailable,
        max_prep_time_minutes: maxPrepTime ? parseInt(maxPrepTime) : null,
        max_total_time_minutes: maxTotalTime ? parseInt(maxTotalTime) : null,
        grocery_style: 'standard',
        meals_per_day: ['dinner'],
      })
      Alert.alert('Saved!', 'Your household profile has been saved.')
      router.back()
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Household Profile</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Basic Info */}
      <Text style={styles.sectionTitle}>Basic Info</Text>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Household Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. The Smith Family" placeholderTextColor={Colors.onSurfaceMuted} />
      </View>
      <View style={styles.row}>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>Family Size</Text>
          <TextInput style={styles.input} value={familySize} onChangeText={setFamilySize} keyboardType="number-pad" />
        </View>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>Adults</Text>
          <TextInput style={styles.input} value={numAdults} onChangeText={setNumAdults} keyboardType="number-pad" />
        </View>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>Children</Text>
          <TextInput style={styles.input} value={numChildren} onChangeText={setNumChildren} keyboardType="number-pad" />
        </View>
      </View>

      {/* Dietary */}
      <Text style={styles.sectionTitle}>Dietary Needs</Text>
      <TagInput label="Dietary Restrictions" tags={dietaryRestrictions} onAdd={v => setDietaryRestrictions([...dietaryRestrictions, v])} onRemove={v => setDietaryRestrictions(dietaryRestrictions.filter(x => x !== v))} />
      <TagInput label="Allergies" tags={allergies} onAdd={v => setAllergies([...allergies, v])} onRemove={v => setAllergies(allergies.filter(x => x !== v))} />
      <TagInput label="Disliked Ingredients / Foods" tags={dislikes} onAdd={v => setDislikes([...dislikes, v])} onRemove={v => setDislikes(dislikes.filter(x => x !== v))} />
      <TagInput label="Preferred Cuisines" tags={preferredCuisines} onAdd={v => setPreferredCuisines([...preferredCuisines, v])} onRemove={v => setPreferredCuisines(preferredCuisines.filter(x => x !== v))} />

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Low-Fiber Diet</Text>
          <Text style={styles.switchHint}>Avoid high-fiber veg, legumes, whole grains</Text>
        </View>
        <Switch value={lowFiber} onValueChange={setLowFiber} trackColor={{ true: Colors.primary, false: Colors.surfaceHigh }} />
      </View>
      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Avoid Whole Grains</Text>
          <Text style={styles.switchHint}>Use white rice, regular pasta only</Text>
        </View>
        <Switch value={avoidWholeGrains} onValueChange={setAvoidWholeGrains} trackColor={{ true: Colors.primary, false: Colors.surfaceHigh }} />
      </View>

      {/* Day Rules */}
      <Text style={styles.sectionTitle}>Day Rules</Text>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>No Red Meat Days</Text>
        <View style={styles.dayRow}>
          {DAYS.map(d => <DayToggle key={d} label={d} selected={noRedMeatDays.includes(d)} onToggle={() => toggleDay(d, noRedMeatDays, setNoRedMeatDays)} />)}
        </View>
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Meatless Days</Text>
        <View style={styles.dayRow}>
          {DAYS.map(d => <DayToggle key={d} label={d} selected={meatlessDays.includes(d)} onToggle={() => toggleDay(d, meatlessDays, setMeatlessDays)} />)}
        </View>
      </View>

      {/* Cooking */}
      <Text style={styles.sectionTitle}>Cooking Methods</Text>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Available Methods</Text>
        <View style={styles.methodGrid}>
          {COMMON_METHODS.map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.methodChip, cookingAvailable.includes(m) && styles.methodChipOn]}
              onPress={() => toggleMethod(m, cookingAvailable, setCookingAvailable)}
            >
              <Text style={[styles.methodChipText, cookingAvailable.includes(m) && styles.methodChipTextOn]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Unavailable Methods (never use)</Text>
        <View style={styles.methodGrid}>
          {COMMON_METHODS.map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.methodChip, cookingUnavailable.includes(m) && styles.methodChipOff]}
              onPress={() => toggleMethod(m, cookingUnavailable, setCookingUnavailable)}
            >
              <Text style={[styles.methodChipText, cookingUnavailable.includes(m) && styles.methodChipTextOff]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Timing */}
      <Text style={styles.sectionTitle}>Timing & Flavor</Text>
      <View style={styles.row}>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>Max Prep (min)</Text>
          <TextInput style={styles.input} value={maxPrepTime} onChangeText={setMaxPrepTime} keyboardType="number-pad" placeholder="No limit" placeholderTextColor={Colors.onSurfaceMuted} />
        </View>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>Max Total (min)</Text>
          <TextInput style={styles.input} value={maxTotalTime} onChangeText={setMaxTotalTime} keyboardType="number-pad" placeholder="No limit" placeholderTextColor={Colors.onSurfaceMuted} />
        </View>
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Flavor Level</Text>
        <View style={styles.dayRow}>
          {FLAVOR_LEVELS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.dayChip, flavorLevel === f && styles.dayChipSelected]}
              onPress={() => setFlavorLevel(f)}
            >
              <Text style={[styles.dayChipText, flavorLevel === f && styles.dayChipTextSelected]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Avoid Bland Food</Text>
          <Text style={styles.switchHint}>Always use herbs, spices, and seasoning</Text>
        </View>
        <Switch value={avoidBland} onValueChange={setAvoidBland} trackColor={{ true: Colors.primary, false: Colors.surfaceHigh }} />
      </View>

      <GradientButton onPress={handleSave} loading={saving} style={styles.saveButton}>Save Profile</GradientButton>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.screenBg },
  content: { padding: Spacing.xl, paddingTop: 60, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.screenBg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xxl },
  back: { color: Colors.primary, fontFamily: Fonts.bodyMedium, fontSize: 16 },
  title: { fontSize: 20, fontFamily: Fonts.displayBold, color: Colors.onSurface },
  sectionTitle: { fontSize: 16, fontFamily: Fonts.displaySemiBold, color: Colors.primary, marginTop: 32, marginBottom: Spacing.md },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontFamily: Fonts.bodyMedium, color: Colors.onSurface, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.surfaceHighest, borderRadius: Radius.lg, padding: 12, fontSize: 15, fontFamily: Fonts.bodyRegular, color: Colors.onSurface },
  row: { flexDirection: 'row', gap: 10 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  tag: { backgroundColor: Colors.surfaceLow, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 4 },
  tagText: { color: Colors.onSurfaceVariant, fontFamily: Fonts.bodyRegular, fontSize: 13 },
  tagInputRow: { flexDirection: 'row', gap: Spacing.sm },
  tagInput: { flex: 1, backgroundColor: Colors.surfaceHighest, borderRadius: Radius.lg, padding: 10, fontSize: 14, fontFamily: Fonts.bodyRegular, color: Colors.onSurface },
  addButton: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingHorizontal: 14, justifyContent: 'center' },
  addButtonText: { color: Colors.white, fontFamily: Fonts.bodySemiBold, fontSize: 13 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surfaceLowest, borderRadius: Radius.xl, padding: 14, marginBottom: Spacing.md, ...Shadow.card },
  switchInfo: { flex: 1, marginRight: 12 },
  switchLabel: { fontSize: 14, fontFamily: Fonts.bodyMedium, color: Colors.onSurface },
  switchHint: { fontSize: 12, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, marginTop: 2 },
  dayRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  dayChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.surfaceLow },
  dayChipSelected: { backgroundColor: Colors.primary },
  dayChipText: { fontSize: 13, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant },
  dayChipTextSelected: { color: Colors.white, fontFamily: Fonts.bodySemiBold },
  methodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  methodChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.lg, backgroundColor: Colors.surfaceLow },
  methodChipOn: { backgroundColor: Colors.surfaceHigh },
  methodChipOff: { backgroundColor: 'rgba(220,38,38,0.1)' },
  methodChipText: { fontSize: 13, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant },
  methodChipTextOn: { color: Colors.onSurface, fontFamily: Fonts.bodyMedium },
  methodChipTextOff: { color: Colors.error, fontFamily: Fonts.bodyMedium },
  saveButton: { marginTop: 28 },
})
