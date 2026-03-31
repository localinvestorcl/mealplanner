import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Stack, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as Linking from 'expo-linking'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import { PlusJakartaSans_700Bold, PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans'
import { BeVietnamPro_400Regular, BeVietnamPro_500Medium, BeVietnamPro_600SemiBold } from '@expo-google-fonts/be-vietnam-pro'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Session } from '@supabase/supabase-js'
import { Colors } from '@/constants/theme'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient()

function AuthGate() {
  const { session, setSession } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setSession(session)
    })

    // Handle deep link from email confirmation
    const handleDeepLink = async (url: string) => {
      if (url.includes('access_token') || url.includes('confirmation_token')) {
        const parsed = Linking.parse(url)
        const params = parsed.queryParams ?? {}
        const access_token = params['access_token'] as string | undefined
        const refresh_token = params['refresh_token'] as string | undefined
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token })
        }
      }
    }

    // Check if app was opened from a link
    Linking.getInitialURL().then(url => { if (url) handleDeepLink(url) }).catch(() => {})

    // Listen for links while app is open
    const linkSub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url))

    return () => {
      subscription.unsubscribe()
      linkSub.remove()
    }
  }, [])

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/sign-in')
    } else if (session && inAuthGroup) {
      router.replace('/(app)')
    }
  }, [session, segments, loading])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.screenBg }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(screens)" />
    </Stack>
  )
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_600SemiBold,
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthGate />
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
