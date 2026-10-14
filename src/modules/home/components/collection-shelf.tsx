import { router } from 'expo-router';
import { Pressable, ScrollView, Text } from 'react-native';

import { Artwork } from '@/common/components/artwork';
import { makeStyles } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';
import { collectionRouteId, type Collection } from '@/common/youtube/client';

/** Playlist and album covers from YouTube Music; each opens its track list. */
export function CollectionShelf({ collections }: { collections: Collection[] }) {
  const styles = useStyles();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.row}>
      {collections.map((collection) => (
        <Pressable
          key={`${collection.kind}-${collection.id}`}
          onPress={() => router.push({ pathname: '/playlist/[id]', params: { id: collectionRouteId(collection) } })}
          accessibilityRole="link"
          accessibilityLabel={[collection.title, collection.subtitle].filter(Boolean).join(', ')}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <Artwork uri={collection.artwork} label={collection.title} size={148} />
          <Text style={styles.title} numberOfLines={2}>{collection.title}</Text>
          {!!collection.subtitle && <Text style={styles.subtitle} numberOfLines={1}>{collection.subtitle}</Text>}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const useStyles = makeStyles((t) => ({
  bleed: { marginHorizontal: -space.lg },
  row: { gap: space.md, paddingHorizontal: space.lg },
  card: { width: 148, gap: space.xs },
  pressed: { opacity: 0.7 },
  title: { ...t.text.strong, fontSize: 14, lineHeight: 18, color: t.color.text, marginTop: space.xs },
  subtitle: { ...t.text.body, fontSize: 12, color: t.color.textMuted },
}));
