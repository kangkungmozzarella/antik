import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/common/theme/theme';

// One small hand-drawn set so every glyph reads as AnTik's own. A theme can redraw any
// glyph and sets the stroke weight for the whole set.
const paths = {
  home: 'M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z',
  library: 'M5 4v16M9.5 4v16M14 5l4.5 14.5',
  link: 'M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1',
  play: 'M8 5.5v13l10.5-6.5z',
  pause: 'M8 5v14M16 5v14',
  next: 'M6 6l9 6-9 6zM18 6v12',
  prev: 'M18 6l-9 6 9 6zM6 6v12',
  back: 'M15 5l-7 7 7 7',
  forward: 'M9 5l7 7-7 7',
  down: 'M6 9l6 6 6-6',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20a7.5 7.5 0 0 1 15 0',
  bell: 'M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2h-14zM10 20.5a2 2 0 0 0 4 0',
  alert: 'M12 4 21 19.5H3zM12 10v4.5M12 17v.5',
  image: 'M4 6h16v12H4zM4 15l4.5-4.5 4 4 2.5-2.5L20 17',
  check: 'M5 12.5l4.5 4.5L19 7',
  external: 'M7 17 17 7M9 7h8v8',
  search: 'M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13zM15.5 15.5 20 20',
} as const;

export type IconName = keyof typeof paths | 'vinyl';

export function Icon({ name, size = 22, tint, filled = false }: { name: IconName; size?: number; tint?: string; filled?: boolean }) {
  const theme = useTheme();
  const stroke = tint ?? theme.color.text;
  if (name === 'vinyl') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={theme.icon.stroke}>
        <Circle cx={12} cy={12} r={8.5} />
        <Circle cx={12} cy={12} r={2.2} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? stroke : 'none'} stroke={stroke} strokeWidth={theme.icon.stroke} strokeLinecap="round" strokeLinejoin="round">
      <Path d={theme.icon.paths[name] ?? paths[name]} />
    </Svg>
  );
}
