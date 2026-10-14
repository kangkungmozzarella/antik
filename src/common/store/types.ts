export type Source = 'spotify' | 'youtube' | 'apple' | 'demo';

export type Track = {
  id: string;
  source: Source;
  title: string;
  artist: string;
  album?: string;
  durationMs?: number;
  artwork?: string;
  /** Opens the track in its own app or site; playback always goes through the source's player. */
  externalUrl?: string;
  youtubeVideoId?: string;
};

export type Playlist = {
  id: string;
  source: Source;
  name: string;
  owner: string;
  artwork?: string;
  tracks: Track[];
};

export const sourceLabel: Record<Source, string> = {
  spotify: 'Spotify',
  youtube: 'YouTube',
  apple: 'Apple Music',
  demo: 'Demo',
};
