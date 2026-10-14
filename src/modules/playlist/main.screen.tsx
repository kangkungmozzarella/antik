import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { songCount } from '@/common/components/playlist-card';
import { useLibrary } from '@/common/store/store';
import { getCollection, parseCollectionRouteId, type CollectionPage } from '@/common/youtube/client';

import { TrackListMessage, TrackListPage } from './components/track-list-page';

/** `/playlist/<id>`: a playlist from the library, or `yt:playlist:…` / `yt:album:…` from YouTube Music. */
export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const remote = parseCollectionRouteId(id);
  return remote ? <RemoteCollection kind={remote.kind} id={remote.id} /> : <LibraryPlaylist id={id} />;
}

function LibraryPlaylist({ id }: { id: string }) {
  const playlist = useLibrary().find((p) => p.id === id);
  if (!playlist) {
    return <TrackListMessage title="Playlist not found" body="It may have been removed from its service, or the demo library is turned off." />;
  }
  return (
    <TrackListPage
      title={playlist.name}
      meta={`${playlist.owner} · ${songCount(playlist)}`}
      source={playlist.source}
      artwork={playlist.artwork}
      tracks={playlist.tracks}
    />
  );
}

function RemoteCollection({ kind, id }: { kind: 'playlist' | 'album'; id: string }) {
  const [result, setResult] = useState<{ key: string; page?: CollectionPage; error?: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const key = `${kind}:${id}:${attempt}`;

  useEffect(() => {
    let stale = false;
    getCollection({ kind, id }).then(
      (page) => !stale && setResult({ key, page }),
      (error: unknown) => !stale && setResult({ key, error: error instanceof Error ? error.message : String(error) }),
    );
    return () => {
      stale = true;
    };
  }, [kind, id, key]);

  const current = result?.key === key ? result : null;
  if (!current) return <TrackListMessage title="Opening…" body={`Loading this ${kind} from YouTube Music.`} busy />;
  if (!current.page) {
    return <TrackListMessage title={`Could not open this ${kind}`} body="YouTube Music did not answer. Check your connection." onRetry={() => setAttempt((n) => n + 1)} />;
  }
  const { page } = current;
  return (
    <TrackListPage
      title={page.title}
      meta={[page.subtitle, page.detail].filter(Boolean).join(' · ')}
      source="youtube"
      artwork={page.artwork}
      tracks={page.tracks}
    />
  );
}
