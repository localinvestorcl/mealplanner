import { View, Text, StyleSheet } from 'react-native'
import { Colors, Fonts } from '@/constants/theme'
import { GradientButton } from '@/components/GradientButton'

interface ErrorViewProps {
  message?: string
  onRetry?: () => void
}

export function ErrorView({ message = 'Something went wrong.', onRetry }: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && <GradientButton onPress={onRetry} style={styles.btn}>Try Again</GradientButton>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: Colors.screenBg },
  icon: { fontSize: 40, marginBottom: 12 },
  message: { fontSize: 15, color: Colors.onSurfaceVariant, fontFamily: Fonts.bodyRegular, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  btn: { paddingHorizontal: 32 },
})
