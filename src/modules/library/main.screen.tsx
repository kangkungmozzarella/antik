import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Icon } from '@/common/components/icon';
import { PlaylistRow } from '@/common/components/playlist-card';
import { Screen } from '@/common/components/screen';
import { Muted, Title } from '@/common/components/text';
import { useLibrary } from '@/common/store/store';
import { sourceLabel, type Source } from '@/common/store/types';
import { makeStyles, useTheme } from '@/common/theme/theme';
import { sourceColor, space } from '@/common/theme/tokens';

export default function Library() {
  const styles = useStyles();
  const theme = useTheme();
  const library = useLibrary();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Source | 'all'>('all');

  // Only offer filters for services that actually have playlists here.
  const sources = useMemo(() => [...new Set(library.map((p) => p.source))], [library]);
  const visible = library.filter(
    (p) => (filter === 'all' || p.source === filter) && p.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <Title style={styles.title}>Library</Title>

      <View style={styles.search}>
        <Icon name="search" size={18} tint={theme.color.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search your playlists"
          placeholderTextColor={theme.color.textMuted}
          style={styles.input}
          accessibilityLabel="Search your playlists"
          returnKeyType="search"
        />
      </View>

      {sources.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters} style={styles.filterBleed}>
          {(['all', ...sources] as const).map((key) => {
            const on = filter === key;
            return (
              <Pressable key={key} onPress={() => setFilter(key)} accessibilityRole="button" accessibilityState={{ selected: on }} style={[styles.chip, on && styles.chipOn]}>
                {key !== 'all' && <View style={[styles.dot, { backgroundColor: sourceColor[key] }]} />}
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{key === 'all' ? 'All' : sourceLabel[key]}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View>
        {visible.map((playlist) => <PlaylistRow key={playlist.id} playlist={playlist} />)}
        {visible.length === 0 && (
          <Muted style={styles.empty}>
            {library.length === 0
              ? 'No playlists yet. Connect a service, or turn on the demo library in Connect.'
              : `No playlists match "${query.trim()}".`}
          </Muted>
        )}
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  title: { marginTop: space.lg },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, minHeight: 48, borderRadius: t.radius.md, backgroundColor: t.color.surface },
  input: { ...t.text.body, flex: 1, fontSize: 15, color: t.color.text, paddingVertical: space.sm },
  filterBleed: { marginHorizontal: -space.lg, marginTop: -space.sm },
  filters: { gap: space.sm, paddingHorizontal: space.lg },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.md, minHeight: 36, borderRadius: t.radius.pill, borderWidth: 1, borderColor: t.color.line },
  chipOn: { backgroundColor: t.color.accent, borderColor: t.color.accent },
  dot: { width: 7, height: 7, borderRadius: 4 },
  chipText: { ...t.text.strong, fontSize: 13, color: t.color.textSoft },
  chipTextOn: { color: t.color.accentInk },
  empty: { paddingVertical: space.xl, textAlign: 'center' },
}));
