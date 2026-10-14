// Values every theme shares. Anything a theme changes lives in ./themes.ts.

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

// Source colours are functional labels only (where a playlist comes from), never decoration,
// so they stay the same in every theme.
export const sourceColor = {
  spotify: '#1ed760',
  youtube: '#ff4e45',
  apple: '#fa5c78',
  demo: '#c4c2ff',
} as const;
