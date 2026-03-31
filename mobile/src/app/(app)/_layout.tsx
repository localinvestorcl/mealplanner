import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { Colors, Fonts } from '@/constants/theme'

function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
    </View>
  )
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.surfaceLowest,
          borderTopWidth: 0,
          shadowColor: Colors.onSurface,
          shadowOpacity: 0.06,
          shadowRadius: 32,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Home" emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Plan" emoji="📅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Saved" emoji="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Favs" emoji="⭐" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Profile" emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabIcon: { alignItems: 'center', paddingTop: 4 },
  emoji: { fontSize: 22 },
  label: { fontSize: 10, color: Colors.onSurfaceMuted, marginTop: 2 },
  labelFocused: { color: Colors.primary, fontFamily: Fonts.bodySemiBold },
})
