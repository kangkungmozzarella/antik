import Svg, { Circle, Path } from 'react-native-svg';

import { color } from '@/theme/tokens';

// One small hand-drawn set with a single 1.8 stroke so every glyph reads as AnTik's own.
const paths = {
  home: 'M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z',
  library: 'M5 4v16M9.5 4v16M14 5l4.5 14.5',
  link: 'M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1',
  play: 'M8 5.5v13l10.5-6.5z',
  pause: 'M8 5v14M16 5v14',
  next: 'M6 6l9 6-9 6zM18 6v12',
  prev: 'M18 6l-9 6 9 6zM6 6v12',
  back: 'M15 5l-7 7 7 7',
  down: 'M6 9l6 6 6-6',
  settings: 'M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M4.2 16.5l1.9-1.1M17.9 8.6l1.9-1.1',
  image: 'M4 6h16v12H4zM4 15l4.5-4.5 4 4 2.5-2.5L20 17',
  check: 'M5 12.5l4.5 4.5L19 7',
  external: 'M7 17 17 7M9 7h8v8',
  search: 'M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13zM15.5 15.5 20 20',
} as const;

export type IconName = keyof typeof paths | 'vinyl';

export function Icon({ name, size = 22, tint = color.text, filled = false }: { name: IconName; size?: number; tint?: string; filled?: boolean }) {
  if (name === 'vinyl') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={tint} strokeWidth={1.8}>
        <Circle cx={12} cy={12} r={8.5} />
        <Circle cx={12} cy={12} r={2.2} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? tint : 'none'} stroke={tint} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d={paths[name]} />
    </Svg>
  );
}
