import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { Link } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'
import { GradientButton } from '@/components/GradientButton'

export default function SignInScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert('Please enter your email and password.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) Alert.alert('Sign in failed', error.message)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Meal Planner</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

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
          placeholder="Password"
          placeholderTextColor={Colors.onSurfaceMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <GradientButton onPress={handleSignIn} loading={loading} style={styles.btn}>Sign In</GradientButton>

        <Link href="/(auth)/sign-up" asChild>
          <Text style={styles.link}>Don't have an account? <Text style={styles.linkBold}>Sign up</Text></Text>
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
