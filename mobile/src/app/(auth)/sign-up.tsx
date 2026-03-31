import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { Link } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'
import { GradientButton } from '@/components/GradientButton'

export default function SignUpScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignUp() {
    if (!email || !password) {
      Alert.alert('Please enter your email and password.')
      return
    }
    if (password.length < 6) {
      Alert.alert('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      Alert.alert('Sign up failed', error.message)
    } else {
      Alert.alert('Check your email', 'We sent you a confirmation link. Click it to activate your account.')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Meal Planner</Text>
        <Text style={styles.subtitle}>Create your household account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.onSurfaceMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min 6 characters)"
          placeholderTextColor={Colors.onSurfaceMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <GradientButton onPress={handleSignUp} loading={loading} style={styles.btn}>Create Account</GradientButton>

        <Link href="/(auth)/sign-in" asChild>
          <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Sign in</Text></Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.screenBg },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 36, fontFamily: Fonts.displayBold, color: Colors.primary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, textAlign: 'center', marginBottom: Spacing.section },
  input: {
    backgroundColor: Colors.surfaceHighest,
    borderRadius: Radius.lg,
    padding: 14,
    fontSize: 16,
    fontFamily: Fonts.bodyRegular,
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  btn: { marginTop: Spacing.sm },
  link: { marginTop: Spacing.xl, textAlign: 'center', fontFamily: Fonts.bodyRegular, color: Colors.onSurfaceVariant, fontSize: 14 },
  linkBold: { fontFamily: Fonts.bodySemiBold, color: Colors.primary },
})
