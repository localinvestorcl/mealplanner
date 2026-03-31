# Family Meal Planner — Design System

This file is the source of truth for visual design decisions. All screens and components should follow these guidelines. Update this file whenever design decisions change.

Design system: **"The Organic Curator"** — warm botanical editorial aesthetic with ambient shadows, surface hierarchy, and gradient CTAs.

---

## Status
✅ Implemented — all 15 screens and 3 shared components updated

---

## Color Palette

All values live in `mobile/src/constants/theme.ts` as `Colors.*`.

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#216e0d` | Buttons, links, active states, icons, step numbers |
| `secondary` | `#8c5100` | Item substitution notes (amber-brown) |
| `screenBg` | `#f0faf0` | All screen backgrounds |
| `surfaceLowest` | `#ffffff` | Cards, modals — highest elevation |
| `surfaceLow` | `#defbdc` | Setup banners, status boxes, chip unselected, empty day slots |
| `surface` | `#d5f5d3` | Mid-level surface (available but rarely used directly) |
| `surfaceHigh` | `#c5ebb8` | Skeleton shimmer, progress bars, switch track off |
| `surfaceHighest` | `#b6e6b7` | Input field backgrounds |
| `onSurface` | `#143a1c` | Headlines, body text, card titles |
| `onSurfaceVariant` | `#3d6b45` | Subtitles, metadata, hints, recipe text |
| `onSurfaceMuted` | `rgba(61,107,69,0.6)` | Placeholders, disabled states, tab labels |
| `outlineVariant` | `rgba(146,188,148,0.15)` | Reserved for subtle outlines if ever needed |
| `error` | `#dc2626` | Error states, destructive text |
| `warningBg` | `#fef9c3` | Warning banners, favorite row |
| `warningBorder` | `#eab308` | (Available but not used directly — see warningBg) |
| `white` | `#ffffff` | Text on gradient buttons, checkmarks |
| `onPrimary` | `#ffffff` | Text on primary-colored backgrounds |

**Rules:**
- No `borderWidth: 1` with opaque color — use background shift for separation
- No `#000000` or `#111827` — always use `Colors.onSurface`
- Destructive actions use `rgba(220,38,38,0.1)` background, `Colors.error` text

---

## Typography

Fonts: **Plus Jakarta Sans** (display) + **Be Vietnam Pro** (body).
All values in `mobile/src/constants/theme.ts` as `Fonts.*`.

| Token | Font | Usage |
|---|---|---|
| `displayBold` | PlusJakartaSans_700Bold | Screen titles, family name, stat numbers |
| `displaySemiBold` | PlusJakartaSans_600SemiBold | Section headings, recipe section headers |
| `bodyRegular` | BeVietnamPro_400Regular | Body text, descriptions, hints, links |
| `bodyMedium` | BeVietnamPro_500Medium | Labels, metadata, switch labels |
| `bodySemiBold` | BeVietnamPro_600SemiBold | Card titles, button text, active tab, chip selected |

Fonts are loaded in `mobile/src/app/_layout.tsx` via `useFonts` with `SplashScreen.preventAutoHideAsync()`.

---

## Spacing

All values in `mobile/src/constants/theme.ts` as `Spacing.*`.

| Token | Value | Usage |
|---|---|---|
| `xs` | 4 | Tight gaps only |
| `sm` | 8 | Between label and input, small gaps |
| `md` | 12 | Default gap between items |
| `lg` | 16 | Card inner sections, modal header margin |
| `xl` | 20 | Screen padding, between sections |
| `xxl` | 24 | Header bottom margin |
| `section` | 56 | Oversized subtitle bottom margin (auth + dashboard) |

---

## Border Radius

All values in `mobile/src/constants/theme.ts` as `Radius.*`.

| Token | Value | Usage |
|---|---|---|
| `sm` | 6 | Checkboxes only |
| `md` | 12 | Minimum for all other elements — chips, action buttons |
| `lg` | 16 | Inputs, status boxes, regen buttons |
| `xl` | 24 | All cards, modals, switch rows, tri-toggles |
| `full` | 9999 | CTA gradient buttons, day chips, flavor chips |

---

## Shadows

Single shadow style in `mobile/src/constants/theme.ts` as `Shadow.card`.

```
shadowColor: '#143a1c'
shadowOpacity: 0.06
shadowRadius: 32
shadowOffset: { width: 0, height: 4 }
elevation: 3
```

No traditional harsh shadows. All elevation is expressed through `Shadow.card` or background shifts.

---

## Gradient CTA Button

Defined in `mobile/src/constants/theme.ts` as `GradientCTA`:
```
colors: ['#216e0d', '#a5f788']
direction: left → right
```

Component: `mobile/src/components/GradientButton.tsx`
Usage: Replace all primary `TouchableOpacity` buttons with `<GradientButton>`.
Both `TouchableOpacity` and `LinearGradient` must share `borderRadius: Radius.full` for iOS clipping.

---

## Component Notes

### Buttons
- Primary: `<GradientButton>` — `#216e0d → #a5f788`, white text, `Radius.full`
- Secondary: `Colors.surfaceLow` background, `Colors.onSurfaceVariant` text, `Radius.md`
- Destructive: `rgba(220,38,38,0.1)` background, `Colors.error` text, `Radius.md`

### Cards
- Background: `Colors.surfaceLowest`
- No border
- Shadow: `...Shadow.card`
- Border radius: `Radius.xl`

### Inputs
- Background: `Colors.surfaceHighest`
- No border
- Border radius: `Radius.lg`
- `placeholderTextColor`: `Colors.onSurfaceMuted`
- Font: `Fonts.bodyRegular`, `Colors.onSurface`

### Switch
- `trackColor={{ true: Colors.primary, false: Colors.surfaceHigh }}`

### Navigation (bottom tabs)
- Background: `Colors.surfaceLowest`
- Active label: `Colors.primary`, `Fonts.bodySemiBold`
- Inactive label: `Colors.onSurfaceMuted`
- No top border — replaced with ambient shadow

### Skeleton loaders
- Base color: `Colors.screenBg`
- Skeleton shimmer: `Colors.surfaceHigh`
- Card backgrounds: `Colors.surfaceLowest`

### Chips / Day toggles
- Unselected: `Colors.surfaceLow`, `Fonts.bodyRegular`, `Colors.onSurfaceVariant`
- Selected: `Colors.primary`, `Fonts.bodySemiBold`, `Colors.white`
- Day chips: `Radius.full` (pill)
- Method chips: `Radius.lg`

---

## App Icon
- File: `mobile/assets/images/icon.png`
- Size: 1024×1024 PNG
- Android adaptive icon background: `#216e0d`

## Splash Screen
- Background color (`app.json`): `#216e0d`
- Logo/image: `mobile/assets/images/splash-icon.png`

---

## Files
- Tokens: `mobile/src/constants/theme.ts`
- Gradient button: `mobile/src/components/GradientButton.tsx`
- Skeleton: `mobile/src/components/Skeleton.tsx`
- Error view: `mobile/src/components/ErrorView.tsx`
- Toast: `mobile/src/components/Toast.tsx`
