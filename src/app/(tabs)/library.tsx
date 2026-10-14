import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PlaylistRow } from '@/components/playlist-card';
import { Screen } from '@/components/screen';
import { Muted, Title } from '@/components/text';
import { useLibrary } from '@/state/store';
import { sourceLabel, type Source } from '@/state/types';
import { color, radius, sourceColor, space } from '@/theme/tokens';

export default function Library() {
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
        <Icon name="search" size={18} tint={color.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search your playlists"
          placeholderTextColor={color.textMuted}
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

const styles = StyleSheet.create({
  title: { marginTop: space.lg },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, minHeight: 48, borderRadius: radius.md, backgroundColor: color.surface },
  input: { flex: 1, fontSize: 15, color: color.text, paddingVertical: space.sm },
  filterBleed: { marginHorizontal: -space.lg, marginTop: -space.sm },
  filters: { gap: space.sm, paddingHorizontal: space.lg },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.md, minHeight: 36, borderRadius: radius.pill, borderWidth: 1, borderColor: color.line },
  chipOn: { backgroundColor: color.accent, borderColor: color.accent },
  dot: { width: 7, height: 7, borderRadius: 4 },
  chipText: { fontSize: 13, fontWeight: '600', color: color.textSoft },
  chipTextOn: { color: color.accentInk },
  empty: { paddingVertical: space.xl, textAlign: 'center' },
});
