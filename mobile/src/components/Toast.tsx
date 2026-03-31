import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { Colors, Fonts, Radius } from '@/constants/theme'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onHide: () => void
  duration?: number
}

export function Toast({ message, type = 'success', onHide, duration = 2500 }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(duration - 400),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(onHide)
  }, [])

  const bgColor = type === 'success' ? Colors.primary : type === 'error' ? Colors.error : Colors.onSurface

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: bgColor }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  )
}

// Hook for managing toast state
import { useState, useCallback } from 'react'

interface ToastState {
  message: string
  type: ToastType
  key: number
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type, key: Date.now() })
  }, [])

  const hideToast = useCallback(() => setToast(null), [])

  return { toast, showToast, hideToast }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: Colors.onSurface,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  text: { color: Colors.white, fontFamily: Fonts.bodySemiBold, fontSize: 14, textAlign: 'center' },
})
