import { Pressable, ScrollView, Text } from 'react-native';

import { makeStyles } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';

export type HomeFilter = 'all' | 'songs' | 'playlists';

const FILTERS: { key: HomeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'songs', label: 'Songs' },
  { key: 'playlists', label: 'Playlists' },
];

export function FilterChips({ value, onChange }: { value: HomeFilter; onChange: (filter: HomeFilter) => void }) {
  const styles = useStyles();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} style={styles.bleed} accessibilityRole="tablist">
      {FILTERS.map(({ key, label }) => {
        const on = value === key;
        return (
          <Pressable key={key} onPress={() => onChange(key)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={[styles.chip, on && styles.chipOn]}>
            <Text style={[styles.label, on && styles.labelOn]}>{label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const useStyles = makeStyles((t) => ({
  bleed: { marginHorizontal: -space.lg, marginTop: -space.sm },
  row: { gap: space.sm, paddingHorizontal: space.lg },
  chip: { paddingHorizontal: space.lg, minHeight: 36, justifyContent: 'center', borderRadius: t.radius.pill, backgroundColor: t.color.surfaceStrong },
  chipOn: { backgroundColor: t.color.accent },
  label: { ...t.text.strong, fontSize: 13, color: t.color.text },
  labelOn: { color: t.color.accentInk },
}));
