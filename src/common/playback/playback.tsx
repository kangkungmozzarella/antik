import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { useNowPlaying, useStore } from '@/common/store/store';
import { resolveStream } from '@/common/youtube/client';

type Phase = 'idle' | 'loading' | 'ready' | 'error';

export type Playback = {
  phase: Phase;
  error?: string;
  /** True only while audio is actually coming out. */
  playing: boolean;
  buffering: boolean;
  currentTime: number;
  duration: number;
  seekTo: (seconds: number) => void;
};

const PlaybackContext = createContext<Playback | null>(null);

// Lock screen controls run in a native service that expo-audio's config plugin adds at build
// time, so Expo Go does not have it; they work in a development or release build.
const lockScreenAvailable = Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

/*
  Turns the store's queue into sound. The store says what should play and whether the user
  wants it playing; this finds the stream, drives expo-audio, and moves on when a song ends.
  Only YouTube tracks have audio; demo tracks stay silent by design.
*/
export function PlaybackProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useStore();
  const track = useNowPlaying();
  const player = useAudioPlayer(null, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);
  // Result of resolving the current song's stream; anything older belongs to a previous song.
  const [resolved, setResolved] = useState<{ trackId: string; phase: 'ready' | 'error'; error?: string } | null>(null);
  const wantsToPlay = state.player.playing;

  useEffect(() => {
    // Lock screen controls need doNotMix, and Android stops background audio without them.
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' }).catch(() => {});
  }, []);

  const videoId = track?.source === 'youtube' ? track.youtubeVideoId : undefined;
  const load: { phase: Phase; error?: string } = !videoId || !track ? { phase: 'idle' } : resolved?.trackId === track.id ? resolved : { phase: 'loading' };

  useEffect(() => {
    player.pause();
    if (!videoId || !track) return;
    let cancelled = false;
    resolveStream(videoId)
      .then(({ uri }) => {
        if (cancelled) return;
        player.replace({ uri });
        if (lockScreenAvailable) player.setActiveForLockScreen(true, { title: track.title, artist: track.artist, albumTitle: track.album, artworkUrl: track.artwork });
        setResolved({ trackId: track.id, phase: 'ready' });
      })
      .catch((error: unknown) => {
        if (!cancelled) setResolved({ trackId: track.id, phase: 'error', error: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      cancelled = true;
    };
    // A new stream only when the song changes; play/pause is handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.id]);

  useEffect(() => {
    if (load.phase !== 'ready') return;
    if (wantsToPlay) player.play();
    else player.pause();
  }, [wantsToPlay, load.phase, player]);

  useEffect(() => {
    if (status.didJustFinish) dispatch({ type: 'skip', by: 1 });
  }, [status.didJustFinish, dispatch]);

  const value: Playback = {
    phase: load.phase,
    error: load.error,
    playing: load.phase === 'ready' && status.playing,
    buffering: load.phase === 'loading' || (load.phase === 'ready' && status.isBuffering),
    currentTime: status.currentTime,
    duration: status.duration || (track?.durationMs ?? 0) / 1000,
    seekTo: (seconds) => {
      player.seekTo(seconds).catch(() => {});
    },
  };
  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlayback() {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('usePlayback must be used inside PlaybackProvider');
  return ctx;
}
