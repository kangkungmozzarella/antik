import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/common/components/icon';
import { Mascot } from '@/common/components/mascot';
import { Body, Muted } from '@/common/components/text';
import { makeStyles, ThemeScope, useTheme } from '@/common/theme/theme';
import type { Theme } from '@/common/theme/themes';
import { space } from '@/common/theme/tokens';

/** A live miniature of the theme, drawn with the theme's own tokens and icons. */
export function ThemeCard({ item, selected, onPress }: { item: Theme; selected: boolean; onPress: () => void }) {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${item.name} theme. ${item.tagline}`}
      style={({ pressed }) => [styles.card, selected && styles.cardOn, pressed && styles.pressed]}>
      <ThemeScope theme={item}>
        <View style={[styles.preview, { backgroundColor: item.color.bg, borderRadius: item.radius.md }]}>
          <LinearGradient colors={item.backdrops[item.defaultBackdrop].colors} style={StyleSheet.absoluteFill} />
          <Text style={[item.text.display, styles.sample, { color: item.color.text }]}>Aa</Text>
          <View style={styles.icons}>
            {(['home', 'library', 'link'] as const).map((name, i) => (
              <Icon key={name} name={name} size={16} tint={i === 0 ? item.color.accentSoft : item.color.textMuted} filled={i === 0 && item.icon.fillActiveTab} />
            ))}
          </View>
          <View style={[styles.play, { backgroundColor: item.color.accent }]}>
            <Icon name="play" size={14} tint={item.color.accentInk} filled />
          </View>
          {item.motif.kind === 'mascot' && <View style={styles.mascot}><Mascot size={44} /></View>}
        </View>
      </ThemeScope>
      <View style={styles.text}>
        <View style={styles.nameRow}>
          <Body style={styles.name}>{item.name}</Body>
          {selected && <Icon name="check" size={18} tint={theme.color.accentSoft} />}
        </View>
        <Muted numberOfLines={2}>{item.tagline}</Muted>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  card: { flex: 1, gap: space.sm, padding: space.sm, borderRadius: t.radius.lg, backgroundColor: t.color.bgRaised, borderWidth: 2, borderColor: t.color.line },
  cardOn: { borderColor: t.color.accentSoft },
  pressed: { opacity: 0.7 },
  preview: { height: 112, overflow: 'hidden', padding: space.sm },
  sample: { fontSize: 26, lineHeight: 32 },
  icons: { position: 'absolute', left: space.sm, bottom: space.sm, flexDirection: 'row', gap: space.sm },
  play: { position: 'absolute', right: space.sm, top: space.sm, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  mascot: { position: 'absolute', right: space.xs, bottom: 0 },
  text: { gap: 2, paddingHorizontal: space.xs, paddingBottom: space.xs },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: t.text.bold,
}));
