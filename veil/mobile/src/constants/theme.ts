import { Platform } from 'react-native';

/** Veil design tokens — matches the mockups (dark "stealth" look, mint accent). */
export const C = {
  bg: '#06080B',
  surface: '#0D1117',
  surface2: '#141A22',
  border: '#1F2833',
  divider: '#161D26',
  text: '#E8EEF3',
  textSoft: '#C5CFD9',
  muted: '#9AA7B5',
  faint: '#8A97A6',
  accent: '#2EF2B4',
  onAccent: '#04130D',
  accentTint: '#0B1A14',
  accentEdge: '#1E6B4B',
  warn: '#FFB547',
  warnSoft: '#FFC976',
  warnTint: '#2A2110',
  danger: '#FF7A59',
  dangerSoft: '#FF9C80',
  dangerTint: '#2A140E',
  track: '#2A333E',
} as const;

export const Font = {
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' }),
};

export const Space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;
export const Radius = { sm: 10, md: 14, lg: 18, xl: 22 } as const;

export type Severity = 'critical' | 'high' | 'low';

export const severityColor: Record<Severity, string> = {
  critical: C.danger,
  high: C.warn,
  low: C.accent,
};
