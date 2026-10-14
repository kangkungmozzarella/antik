import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import type { Profile } from '@/common/store/store';
import { useTheme } from '@/common/theme/theme';

import { Icon } from './icon';

/** The profile photo, else the name's initial, else a person glyph. */
export function Avatar({ profile, size }: { profile: Profile; size: number }) {
  const theme = useTheme();
  const box = { width: size, height: size, borderRadius: size / 2 };
  if (profile.photoUri) return <Image source={profile.photoUri} style={box} contentFit="cover" accessibilityIgnoresInvertColors />;
  const initial = profile.name.trim().charAt(0).toUpperCase();
  return (
    <View style={[box, { alignItems: 'center', justifyContent: 'center', backgroundColor: theme.color.accent }]}>
      {initial ? (
        <Text style={[theme.text.display, { fontSize: size * 0.45, color: theme.color.accentInk }]} accessible={false}>{initial}</Text>
      ) : (
        <Icon name="user" size={size * 0.5} tint={theme.color.accentInk} />
      )}
    </View>
  );
}
