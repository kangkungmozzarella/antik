// youtubei.js builds URLs with URLSearchParams setters that React Native's URL lacks.
import 'react-native-url-polyfill/auto';

import { ClientType, Innertube, Platform } from 'youtubei.js';

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
  session ??= Innertube.create({ client_type: ClientType.MUSIC, retrieve_player: true, generate_session_locally: true }).catch((error) => {
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

export async function searchSongs(query: string): Promise<Track[]> {
  const yt = await innertube();
  const result = await yt.music.search(query, { type: 'song' });
  return (result.songs?.contents ?? []).flatMap((item) => {
    if (!item.id || !item.title) return [];
    return [{
      id: `youtube-${item.id}`,
      source: 'youtube' as const,
      youtubeVideoId: item.id,
      title: item.title,
      artist: item.artists?.map((artist) => artist.name).join(', ') || 'Unknown artist',
      album: item.album?.name,
      durationMs: item.duration?.seconds ? item.duration.seconds * 1000 : undefined,
      artwork: largeArtwork(item.thumbnail?.contents?.[0]?.url),
    }];
  });
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
