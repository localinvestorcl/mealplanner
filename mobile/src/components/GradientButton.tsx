import { TouchableOpacity, ActivityIndicator, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { GradientCTA, Radius, Fonts, Colors } from '@/constants/theme'

interface Props {
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  children: string
  style?: object
}

export function GradientButton({ onPress, disabled, loading, children, style }: Props) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={{ borderRadius: Radius.full }}>
      <LinearGradient
        colors={GradientCTA.colors}
        start={GradientCTA.start}
        end={GradientCTA.end}
        style={[styles.btn, style]}
      >
        {loading
          ? <ActivityIndicator color={Colors.white} size="small" />
          : <Text style={styles.text}>{children}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: { borderRadius: Radius.full, paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center' },
  text: { color: Colors.white, fontFamily: Fonts.bodySemiBold, fontSize: 16 },
})
