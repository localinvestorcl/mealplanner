import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View, ViewStyle } from 'react-native'
import { Colors, Radius } from '@/constants/theme'

interface SkeletonProps {
  width?: number | `${number}%`
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

export function Skeleton({ width, height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [])

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width ?? '100%', height, borderRadius, opacity },
        style,
      ]}
    />
  )
}

// Pre-built skeleton layouts for common screens

export function PlanScreenSkeleton() {
  return (
    <View style={skeletonStyles.container}>
      <View style={skeletonStyles.header}>
        <Skeleton width={60} height={18} />
        <View style={skeletonStyles.headerCenter}>
          <Skeleton width={160} height={22} />
          <Skeleton width={120} height={14} style={{ marginTop: 6 }} />
        </View>
        <View style={{ width: 60 }} />
      </View>
      <View style={skeletonStyles.actionRow}>
        <Skeleton width="47%" height={42} borderRadius={Radius.lg} />
        <Skeleton width="47%" height={42} borderRadius={Radius.full} />
      </View>
      {[1, 2, 3, 4, 5, 6, 7].map(i => (
        <View key={i} style={skeletonStyles.dayRow}>
          <Skeleton width={40} height={40} borderRadius={Radius.md} />
          <View style={skeletonStyles.mealCard}>
            <Skeleton width={72} height={72} borderRadius={Radius.lg} />
            <View style={skeletonStyles.mealInfo}>
              <Skeleton width="70%" height={16} />
              <Skeleton width="45%" height={12} style={{ marginTop: 6 }} />
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}

export function GroceryScreenSkeleton() {
  return (
    <View style={skeletonStyles.scrollContainer}>
      <View style={skeletonStyles.header}>
        <Skeleton width={60} height={18} />
        <Skeleton width={120} height={22} />
        <View style={{ width: 48 }} />
      </View>
      <Skeleton height={6} borderRadius={3} style={{ marginBottom: 4 }} />
      <Skeleton width="40%" height={12} style={{ alignSelf: 'flex-end', marginBottom: 20 }} />
      {[1, 2, 3].map(section => (
        <View key={section} style={{ marginBottom: 24 }}>
          <Skeleton width={100} height={13} style={{ marginBottom: 10 }} />
          {[1, 2, 3, 4].map(item => (
            <View key={item} style={skeletonStyles.groceryItem}>
              <Skeleton width={22} height={22} borderRadius={Radius.sm} />
              <View style={{ flex: 1, gap: 4 }}>
                <Skeleton width="60%" height={15} />
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

export function ListScreenSkeleton({ rows = 4, showImage = false }: { rows?: number; showImage?: boolean }) {
  return (
    <View style={skeletonStyles.scrollContainer}>
      <Skeleton width={180} height={26} style={{ marginBottom: 20 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={skeletonStyles.listCard}>
          {showImage && <Skeleton width={56} height={56} borderRadius={Radius.lg} style={{ marginRight: 12 }} />}
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton width="65%" height={17} />
            <Skeleton width="45%" height={13} />
            <Skeleton width="30%" height={12} />
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: { backgroundColor: Colors.surfaceHigh },
})

const skeletonStyles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: Colors.screenBg },
  scrollContainer: { padding: 20, paddingTop: 60, backgroundColor: Colors.screenBg, flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerCenter: { alignItems: 'center', gap: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  mealCard: { flex: 1, flexDirection: 'row', backgroundColor: Colors.surfaceLowest, borderRadius: Radius.xl, padding: 10, gap: 10, alignItems: 'center' },
  mealInfo: { flex: 1, gap: 0 },
  groceryItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  listCard: { backgroundColor: Colors.surfaceLowest, borderRadius: Radius.xl, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
})
