// youtubei.js builds URLs with URLSearchParams setters that React Native's URL lacks.
import 'react-native-url-polyfill/auto';

import { getLocales } from 'expo-localization';
import { ClientType, Innertube, Platform, YTNodes } from 'youtubei.js';

import type { Track } from '@/common/store/types';

import { evaluateInEngine } from './bridge';
import { mintPoToken } from './potoken';

/*
  YouTube Music through InnerTube, the private API YouTube's own apps use. Not an official
  API: YouTube changes it without notice, so every step here can start failing.

  The approach follows BitChord's (github.com/kushagrasinghx/BitChord): search with the
  YouTube Music web client, ask several player clients for a stream because each one is
  refused for some songs, and bind each stream to a PoToken so googlevideo serves past the
  first megabyte.
*/

// youtubei.js extracts the player's deciphering functions; they run in the engine WebView.
Platform.shim.eval = async (data, env) => {
  const properties: string[] = [];
  if (env.n) properties.push(`n: exportedVars.nFunction(${JSON.stringify(env.n)})`);
  if (env.sig) properties.push(`sig: exportedVars.sigFunction(${JSON.stringify(env.sig)})`);
  return evaluateInEngine(`${data.output}\nreturn { ${properties.join(', ')} }`);
};

// Tried in order. IOS is left out: its URLs are refused even with a PoToken.
const PLAYER_CLIENTS = ['YTMUSIC', 'MWEB', 'WEB'] as const;

let session: Promise<Innertube> | null = null;

function innertube() {
  // YouTube Music shapes the home feed by country (no Quick picks without one), so use the phone's region.
  const region = getLocales()[0]?.regionCode ?? undefined;
  session ??= Innertube.create({ client_type: ClientType.MUSIC, retrieve_player: true, generate_session_locally: true, ...(region ? { location: region } : {}) }).catch((error) => {
    // Let the next call try again instead of caching the failure.
    session = null;
    throw error;
  });
  return session;
}

/** Thumbnails come at 60–120px; googleusercontent resizes on request. */
function largeArtwork(url?: string) {
  return url?.replace(/=w\d+-h\d+/, '=w544-h544');
}

/** A song or music video row as a Track; anything else (artists, episodes…) is skipped. */
function toTrack(item: YTNodes.MusicResponsiveListItem, fallback?: { artist?: string; album?: string; artwork?: string }): Track[] {
  if (!item.id || !item.title || (item.item_type !== 'song' && item.item_type !== 'video')) return [];
  const people = item.artists?.length ? item.artists : item.authors;
  return [{
    id: `youtube-${item.id}`,
    source: 'youtube',
    youtubeVideoId: item.id,
    title: item.title,
    artist: people?.map((person) => person.name).join(', ') || fallback?.artist || 'Unknown artist',
    album: item.album?.name ?? fallback?.album,
    durationMs: item.duration?.seconds ? item.duration.seconds * 1000 : undefined,
    artwork: largeArtwork(item.thumbnail?.contents?.[0]?.url) ?? fallback?.artwork,
  }];
}

export async function searchSongs(query: string): Promise<Track[]> {
  const yt = await innertube();
  const result = await yt.music.search(query, { type: 'song' });
  return (result.songs?.contents ?? []).flatMap((item) => toTrack(item));
}

/** A YouTube Music playlist or album, opened as `/playlist/yt:<kind>:<id>`. */
export type Collection = { id: string; kind: 'playlist' | 'album'; title: string; subtitle?: string; artwork?: string };
export type FeedSection = { title: string; songs: Track[]; collections: Collection[] };

export const collectionRouteId = (collection: Pick<Collection, 'kind' | 'id'>) => `yt:${collection.kind}:${collection.id}`;

export function parseCollectionRouteId(routeId: string): Pick<Collection, 'kind' | 'id'> | null {
  const match = /^yt:(playlist|album):(.+)$/.exec(routeId);
  return match ? { kind: match[1] as Collection['kind'], id: match[2] } : null;
}

function toCollection(item: YTNodes.MusicTwoRowItem): Collection[] {
  if (!item.id || (item.item_type !== 'playlist' && item.item_type !== 'album')) return [];
  return [{
    // Browse ids of playlists carry a VL prefix that the playlist endpoint does not want.
    id: item.item_type === 'playlist' ? item.id.replace(/^VL/, '') : item.id,
    kind: item.item_type,
    title: item.title.toString(),
    subtitle: item.subtitle?.toString(),
    artwork: item.thumbnail?.[0]?.url,
  }];
}

/**
 * The YouTube Music home page without an account: Quick picks, trending playlists and so on.
 * Shelves of artists, videos or episodes are left out.
 */
export async function getHomeFeed(): Promise<FeedSection[]> {
  const yt = await innertube();
  const feed = await yt.music.getHomeFeed();
  return (feed.sections ?? []).flatMap((section) => {
    if (!section.is(YTNodes.MusicCarouselShelf)) return [];
    const songs: Track[] = [];
    const collections: Collection[] = [];
    for (const item of section.contents) {
      if (item.is(YTNodes.MusicResponsiveListItem)) songs.push(...toTrack(item));
      else if (item.is(YTNodes.MusicTwoRowItem)) collections.push(...toCollection(item));
    }
    const title = section.header?.title?.toString() ?? '';
    return title && (songs.length || collections.length) ? [{ title, songs, collections }] : [];
  });
}

export type CollectionPage = { title: string; subtitle?: string; detail?: string; artwork?: string; tracks: Track[] };

export async function getCollection({ kind, id }: Pick<Collection, 'kind' | 'id'>): Promise<CollectionPage> {
  const yt = await innertube();
  const page = kind === 'album' ? await yt.music.getAlbum(id) : await yt.music.getPlaylist(id);
  const header = page.header?.is(YTNodes.MusicResponsiveHeader) ? page.header : undefined;
  const artwork = largeArtwork(header?.thumbnail?.contents?.[0]?.url);
  // Album rows name no artist and have no cover of their own; they share the album's.
  const fallback = { artist: header?.strapline_text_one?.toString(), album: kind === 'album' ? header?.title?.toString() : undefined, artwork };
  const rows = kind === 'album' ? (page as Awaited<ReturnType<typeof yt.music.getAlbum>>).contents : (page as Awaited<ReturnType<typeof yt.music.getPlaylist>>).items;
  return {
    title: header?.title?.toString() ?? 'Untitled',
    subtitle: header?.subtitle?.toString(),
    detail: header?.second_subtitle?.toString() || header?.strapline_text_one?.toString(),
    artwork,
    tracks: (rows ?? []).flatMap((row) => (row.is(YTNodes.MusicResponsiveListItem) ? toTrack(row, fallback) : [])),
  };
}

export class StreamUnavailableError extends Error {}

/** A playable URL for one song. It is tied to this device's IP and expires within hours. */
export async function resolveStream(videoId: string): Promise<{ uri: string; client: string }> {
  const yt = await innertube();
  const poToken = mintPoToken(videoId);
  const reasons: string[] = [];
  for (const client of PLAYER_CLIENTS) {
    try {
      const info = await yt.getBasicInfo(videoId, { client });
      const format = info.chooseFormat({ type: 'audio', quality: 'best', format: 'mp4' });
      const url = await format.decipher(yt.session.player);
      return { uri: `${url}&pot=${encodeURIComponent(await poToken)}`, client };
    } catch (error) {
      reasons.push(`${client}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new StreamUnavailableError(`YouTube would not stream this song (${reasons.join('; ')})`);
}
