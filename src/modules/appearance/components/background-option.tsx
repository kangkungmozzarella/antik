import { Pressable, View } from 'react-native';

import { Icon } from '@/common/components/icon';
import { Body, Muted } from '@/common/components/text';
import { makeStyles, useTheme } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';

export function BackgroundOption({ title, detail, selected, onPress, icon }: { title: string; detail: string; selected: boolean; onPress: () => void; icon: 'image' | 'vinyl' }) {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: selected }} style={({ pressed }) => [styles.option, selected && styles.optionOn, pressed && styles.pressed]}>
      <Icon name={icon} tint={selected ? theme.color.accentSoft : theme.color.textSoft} />
      <View style={styles.text}>
        <Body style={styles.title}>{title}</Body>
        <Muted>{detail}</Muted>
      </View>
      {selected && <Icon name="check" tint={theme.color.accentSoft} />}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  option: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: t.radius.lg, backgroundColor: t.color.bgRaised, borderWidth: 1, borderColor: t.color.line },
  optionOn: { borderColor: t.color.accent },
  pressed: { opacity: 0.7 },
  text: { flex: 1, gap: 2 },
  title: t.text.bold,
}));
