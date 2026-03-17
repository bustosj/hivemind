// ─────────────────────────────────────────
//  HiveMind Design Tokens
//  Warm honey/bee dark theme
// ─────────────────────────────────────────

export const Colors = {
  // Backgrounds
  bg0: '#0f0d08',   // deepest - page background
  bg1: '#1a1508',   // cards
  bg2: '#231c0a',   // inputs, subtle surfaces
  bg3: '#2e250e',   // borders, empty states

  // Accent palette
  accent:  '#f5c842',  // primary gold
  accent2: '#e8960c',  // deeper amber
  honey:   '#d97706',  // dark honey
  darkHoney: '#92400e',

  // Semantic
  success: '#86efac',
  successBg: 'rgba(134,239,172,0.12)',
  danger:  '#f87171',
  dangerBg: 'rgba(248,113,113,0.12)',

  // Text
  text1: '#fef9ec',   // primary
  text2: '#c4a96a',   // secondary
  text3: '#7a6535',   // muted/disabled

  // Borders
  border:  'rgba(245,200,66,0.12)',
  border2: 'rgba(245,200,66,0.28)',

  // Transparent tints
  accentAlpha: (opacity: number) => `rgba(245,200,66,${opacity})`,
  honeyAlpha:  (opacity: number) => `rgba(232,150,12,${opacity})`,

  // Partner colors
  partnerA: {
    bg:   'rgba(245,200,66,0.14)',
    text: '#f5c842',
  },
  partnerB: {
    bg:   'rgba(232,150,12,0.14)',
    text: '#e8960c',
  },
} as const;

export const Typography = {
  // Load via expo-google-fonts
  fonts: {
    display:     'Syne_700Bold',      // headings, punch card titles
    displayMed:  'Syne_600SemiBold',
    body:        'Nunito_400Regular', // body text
    bodyMed:     'Nunito_600SemiBold',
    bodyBold:    'Nunito_700Bold',
  },
  sizes: {
    xs:   10,
    sm:   12,
    base: 14,
    md:   16,
    lg:   18,
    xl:   22,
    '2xl': 28,
  },
  lineHeights: {
    tight:  1.2,
    normal: 1.5,
    loose:  1.8,
  },
} as const;

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const Radii = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 9999,
} as const;

export const Shadows = {
  honey: {
    shadowColor:   '#f5c842',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius:  16,
    elevation:     8,
  },
  card: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius:  8,
    elevation:     4,
  },
} as const;
