export const Colors = {
  primary: '#216e0d',
  secondary: '#8c5100',
  surfaceLowest: '#ffffff',
  surfaceLow: '#defbdc',
  surface: '#d5f5d3',
  surfaceHigh: '#c5ebb8',
  surfaceHighest: '#b6e6b7',
  screenBg: '#f0faf0',
  onSurface: '#143a1c',
  onSurfaceVariant: '#3d6b45',
  onSurfaceMuted: 'rgba(61, 107, 69, 0.6)',
  outlineVariant: 'rgba(146, 188, 148, 0.15)',
  error: '#dc2626',
  warningBg: '#fef9c3',
  warningBorder: '#eab308',
  white: '#ffffff',
  onPrimary: '#ffffff',
} as const

export const Fonts = {
  displayBold: 'PlusJakartaSans_700Bold',
  displaySemiBold: 'PlusJakartaSans_600SemiBold',
  bodyRegular: 'BeVietnamPro_400Regular',
  bodyMedium: 'BeVietnamPro_500Medium',
  bodySemiBold: 'BeVietnamPro_600SemiBold',
} as const

export const Radius = {
  sm: 6,      // checkboxes only
  md: 12,     // minimum for all other elements
  lg: 16,     // inputs, chips
  xl: 24,     // cards
  full: 9999, // CTA buttons
} as const

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 56,
} as const

export const Shadow = {
  card: {
    shadowColor: '#143a1c',
    shadowOpacity: 0.06,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
} as const

export const GradientCTA = {
  colors: ['#216e0d', '#a5f788'] as [string, string],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
} as const
