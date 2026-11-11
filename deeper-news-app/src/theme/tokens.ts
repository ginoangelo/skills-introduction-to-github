import { useColorScheme } from 'react-native';

const light = {
  bg: '#EEF3F4',
  surface: '#FFFFFF',
  ink: '#0F2129',
  muted: '#587079',
  line: '#D3DEE2',
  accent: '#087269',
  accentInk: '#FFFFFF',
  warm: '#9A5212',
};

const dark: typeof light = {
  bg: '#0A161C',
  surface: '#11222A',
  ink: '#E3EDEF',
  muted: '#8EA4AC',
  line: '#223D48',
  accent: '#4FD1C5',
  accentInk: '#062024',
  warm: '#E7A560',
};

export type Tokens = typeof light;

/** Video surfaces stay dark in both themes. */
export const video = {
  bg: '#061015',
  ink: '#EEF5F6',
  muted: 'rgba(238, 245, 246, 0.72)',
  glass: 'rgba(255, 255, 255, 0.14)',
  line: 'rgba(255, 255, 255, 0.28)',
  accent: '#4FD1C5',
  warm: '#E7A560',
  scrim: 'rgba(4, 12, 15, 0.92)',
  /** Behind the hand-off: nearly solid so the clip underneath doesn't compete with the question. */
  handoff: '#040C0F',
  card: '#17252B',
};

export function useTokens(): Tokens {
  return useColorScheme() === 'dark' ? dark : light;
}

/** Placeholder art color for a story, until real thumbnails exist. */
export function storyColor(hue: number, lightness = 26): string {
  return `hsl(${hue}, 45%, ${lightness}%)`;
}

export const WIDE_BREAKPOINT = 900;
