export type ColorScheme = 'light' | 'dark';

/**
 * NYT Games–inspired tokens:
 * flat surfaces, hairline borders, no drop shadows.
 * Ink black for CTAs. Red is reserved for the deadly-7 key only.
 */
export const Colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    key: '#D3D6DA',
    text: '#121212',
    textMuted: '#787C7E',
    border: '#D3D6DA',
    hairline: '#E2E2E2',
    accent: '#121212',
    accentText: '#FFFFFF',
    pot: '#121212',
    potText: '#FFFFFF',
    danger: '#D0021B',
    dangerText: '#FFFFFF',
    blue: '#2671DC',
    blueText: '#FFFFFF',
    potOpening: '#2671DC',
    potOpeningText: '#FFFFFF',
    gold: '#C9A227',
    goldText: '#121212',
    silver: '#8A8F98',
    bronze: '#A67C52',
    pulledOut: '#EEEEEE',
    doubles: '#2671DC',
  },
  dark: {
    background: '#121213',
    surface: '#1A1A1B',
    key: '#818384',
    text: '#FFFFFF',
    textMuted: '#818384',
    border: '#3A3A3C',
    hairline: '#3A3A3C',
    accent: '#FFFFFF',
    accentText: '#121213',
    pot: '#FFFFFF',
    potText: '#121213',
    danger: '#E03131',
    dangerText: '#FFFFFF',
    blue: '#4C8BF5',
    blueText: '#FFFFFF',
    potOpening: '#4C8BF5',
    potOpeningText: '#FFFFFF',
    gold: '#E2C35A',
    goldText: '#121213',
    silver: '#A8ADB6',
    bronze: '#C4986A',
    pulledOut: '#2A2A2C',
    doubles: '#4C8BF5',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 48,
  pot: 64,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 6,
  lg: 8,
  full: 999,
} as const;

/**
 * Motion tokens — NYT Games feel: short, snappy, slight overshoot.
 * Pair with Reanimated springs / cubic-bezier(0.175, 0.885, 0.32, 1.275).
 */
export const Motion = {
  durationMs: {
    press: 90,
    state: 180,
    fade: 150,
    bump: 90,
  },
  pressScale: {
    default: 0.97,
    key: 0.96,
    chip: 0.98,
  },
  bumpScale: 1.06,
  liftY: -2,
  staggerMs: 45,
  shakePx: 6,
  /** CSS / Reanimated bezier: elastic-swift overshoot */
  bezier: [0.175, 0.885, 0.32, 1.275] as const,
} as const;
