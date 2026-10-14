import { Platform, type TextStyle } from 'react-native';

export type ThemeId = 'antik' | 'puding';

type Gradient = readonly [string, string, string];

export type Theme = {
  id: ThemeId;
  name: string;
  tagline: string;
  scheme: 'dark' | 'light';
  color: {
    bg: string;
    bgRaised: string;
    /** Translucent base for bars and floating buttons over scrolling content. */
    glass: string;
    /** Card laid over the Home backdrop. */
    panel: string;
    surface: string;
    surfaceStrong: string;
    line: string;
    text: string;
    textSoft: string;
    textMuted: string;
    accent: string;
    /** Accent for text, icons and outlines on the page background (must stay readable). */
    accentSoft: string;
    /** Text and icons placed on `accent`. */
    accentInk: string;
    danger: string;
    /** Fades any backdrop into `bg` so text on top keeps its contrast. */
    scrim: Gradient;
  };
  text: { display: TextStyle; body: TextStyle; strong: TextStyle; bold: TextStyle };
  radius: { sm: number; md: number; lg: number; pill: number };
  icon: { stroke: number; fillActiveTab: boolean; paths: Partial<Record<string, string>> };
  backdrops: Record<string, { label: string; colors: Gradient }>;
  defaultBackdrop: string;
  /** Gradients for covers without artwork, plus the colour of their initial. */
  art: { palettes: [string, string][]; initial: string };
  /** What sits beside the cover on Now Playing. */
  motif: { kind: 'vinyl'; disc: string; groove: string } | { kind: 'mascot' };
};

const webSans = Platform.select({ web: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', default: undefined });

/*
  Antik, the original look.
  - Night-indigo base: music is listened to at night and on the move; a dark, low-glare
    surface lets album art carry the colour.
  - One accent family (indigo -> lavender) instead of the green every streaming app uses.
  - Fraunces for titles: a warm old-style serif that matches the "antik" (vintage) name;
    the system sans keeps lists and controls fast to read.
*/
const antikBg = '#0b0c16';
const antik: Theme = {
  id: 'antik',
  name: 'Antik',
  tagline: 'Night indigo and a spinning record',
  scheme: 'dark',
  color: {
    bg: antikBg,
    bgRaised: '#131527',
    glass: 'rgba(11,12,22,0.94)',
    panel: 'rgba(19,21,39,0.85)',
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
    scrim: ['rgba(11,12,22,0.35)', 'rgba(11,12,22,0.75)', antikBg],
  },
  text: {
    display: { fontFamily: 'Fraunces_600SemiBold' },
    body: { fontFamily: webSans },
    strong: { fontFamily: webSans, fontWeight: '600' },
    bold: { fontFamily: webSans, fontWeight: '700' },
  },
  radius: { sm: 8, md: 14, lg: 20, pill: 999 },
  icon: { stroke: 1.8, fillActiveTab: false, paths: {} },
  backdrops: {
    dusk: { label: 'Dusk', colors: ['#2a1d5c', '#3b2f8a', antikBg] },
    ocean: { label: 'Ocean', colors: ['#0e3a5c', '#1f4f8f', antikBg] },
    ember: { label: 'Ember', colors: ['#4a1d3a', '#7a2f3f', antikBg] },
    forest: { label: 'Forest', colors: ['#123d38', '#1f5a52', antikBg] },
  },
  defaultBackdrop: 'dusk',
  art: {
    palettes: [
      ['#3b2f8a', '#8f8cf6'],
      ['#1f4f8f', '#5fb3d9'],
      ['#7a2f3f', '#e08a6a'],
      ['#1f5a52', '#7cc7a8'],
      ['#5a2f7a', '#d18be0'],
    ],
    initial: 'rgba(255,255,255,0.85)',
  },
  motif: { kind: 'vinyl', disc: '#121220', groove: 'rgba(255,255,255,0.07)' },
};

/*
  Puding: a soft, playful daytime theme around an original mascot (see components/mascot).
  - Custard cream base with caramel-brown ink; caramel is also the readable accent on cream.
  - Fredoka throughout: round letterforms that match the round corners and chunky icons.
  - The mascot replaces the record on Now Playing and bobs while music plays.
*/
const pudingBg = '#fff6dc';
const fredoka = (weight: '400Regular' | '600SemiBold' | '700Bold'): TextStyle => ({ fontFamily: `Fredoka_${weight}` });
const puding: Theme = {
  id: 'puding',
  name: 'Puding',
  tagline: 'Custard, caramel and a wobbly friend',
  scheme: 'light',
  color: {
    bg: pudingBg,
    bgRaised: '#fffdf6',
    glass: 'rgba(255,248,226,0.96)',
    panel: 'rgba(255,253,246,0.9)',
    surface: 'rgba(74,52,36,0.06)',
    surfaceStrong: 'rgba(74,52,36,0.14)',
    line: 'rgba(74,52,36,0.14)',
    text: '#4a3424',
    textSoft: '#634732',
    textMuted: '#85694f',
    accent: '#ffc93c',
    accentSoft: '#a5520a',
    accentInk: '#4a3424',
    danger: '#b3261e',
    scrim: ['rgba(255,246,220,0.15)', 'rgba(255,246,220,0.65)', pudingBg],
  },
  text: { display: fredoka('700Bold'), body: fredoka('400Regular'), strong: fredoka('600SemiBold'), bold: fredoka('700Bold') },
  radius: { sm: 12, md: 20, lg: 28, pill: 999 },
  icon: {
    stroke: 2.4,
    fillActiveTab: true,
    paths: {
      home: 'M4 12.5a8 8 0 0 1 16 0V19a1 1 0 0 1-1 1h-4v-4.5a3 3 0 0 0-6 0V20H5a1 1 0 0 1-1-1z',
      library: 'M4.5 7.5a2 2 0 0 1 2-2H10l2 2h5.5a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2z',
      link: 'M12 19.5s-7-4.3-7-9.6A3.9 3.9 0 0 1 12 7.6a3.9 3.9 0 0 1 7 2.3c0 5.3-7 9.6-7 9.6z',
    },
  },
  backdrops: {
    custard: { label: 'Custard', colors: ['#ffd76a', '#ffe9a8', pudingBg] },
    strawberry: { label: 'Strawberry', colors: ['#ffb3c1', '#ffd9df', pudingBg] },
    matcha: { label: 'Matcha', colors: ['#bfe3a5', '#e1f2cf', pudingBg] },
    soda: { label: 'Soda', colors: ['#a9d8ff', '#d8eeff', pudingBg] },
  },
  defaultBackdrop: 'custard',
  art: {
    palettes: [
      ['#ffd76a', '#ffb347'],
      ['#ffc2cd', '#ff8fa3'],
      ['#cfe9b8', '#8fcf7a'],
      ['#bfe1ff', '#7fb8f0'],
      ['#e6d1ff', '#bf9bf0'],
    ],
    initial: 'rgba(74,52,36,0.6)',
  },
  motif: { kind: 'mascot' },
};

export const themes: Record<ThemeId, Theme> = { antik, puding };
export const themeList = Object.values(themes);
export const defaultThemeId: ThemeId = 'antik';
