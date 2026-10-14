import { createContext, useContext, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { useStore } from '@/common/store/store';

import { themes, type Theme } from './themes';

const ThemeContext = createContext<Theme>(themes.antik);

// A separate context so components re-render when the theme changes, not on every store update.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { state } = useStore();
  return <ThemeContext.Provider value={themes[state.themeId]}>{children}</ThemeContext.Provider>;
}

/** Renders its children in another theme, e.g. a live preview in the theme picker. */
export function ThemeScope({ theme, children }: { theme: Theme; children: ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

/** Builds a styles hook from the theme; each theme's sheet is created once and reused. */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (theme: Theme) => T) {
  const cache = new Map<Theme, T>();
  return function useStyles() {
    const theme = useTheme();
    let styles = cache.get(theme);
    if (!styles) {
      styles = StyleSheet.create(factory(theme));
      cache.set(theme, styles);
    }
    return styles;
  };
}
