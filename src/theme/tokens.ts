/*
  AnTik design tokens.
  - Night-indigo base: music is listened to at night and on the move; a dark, low-glare
    surface lets album art carry the colour.
  - One accent family (indigo -> lavender) instead of the green every streaming app uses.
  - Source colours are functional labels only (where a playlist comes from), never decoration.
  - Fraunces for titles: a warm old-style serif that matches the "antik" (vintage) name;
    the system sans keeps lists and controls fast to read.
*/
import { Platform } from 'react-native';

export const color = {
  bg: '#0b0c16',
  bgRaised: '#131527',
  surface: 'rgba(255,255,255,0.06)',
  surfaceStrong: 'rgba(255,255,255,0.1)',
  line: 'rgba(255,255,255,0.1)',
  text: '#f2f1fb',
  textSoft: '#cfcde6',
  textMuted: '#9a98b8',
  accent: '#8f8cf6',
  accentSoft: '#c4c2ff',
  accentInk: '#14132b',
  danger: '#ff8a8a',
} as const;

export const sourceColor = {
  spotify: '#1ed760',
  youtube: '#ff4e45',
  apple: '#fa5c78',
  demo: '#c4c2ff',
} as const;

export const auroraPresets = {
  dusk: ['#2a1d5c', '#3b2f8a', '#0b0c16'],
  ocean: ['#0e3a5c', '#1f4f8f', '#0b0c16'],
  ember: ['#4a1d3a', '#7a2f3f', '#0b0c16'],
  forest: ['#123d38', '#1f5a52', '#0b0c16'],
} as const;
export type AuroraPreset = keyof typeof auroraPresets;

export const font = {
  display: 'Fraunces_600SemiBold',
  displayItalic: 'Fraunces_600SemiBold_Italic',
  body: Platform.select({ web: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', default: undefined }),
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 } as const;
