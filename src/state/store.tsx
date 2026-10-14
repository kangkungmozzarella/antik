import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import type { AuroraPreset } from '@/theme/tokens';

import { demoPlaylists } from './demo';
import type { Playlist, Source, Track } from './types';

export type Backdrop =
  | { kind: 'aurora'; preset: AuroraPreset }
  | { kind: 'photo'; uri: string }
  | { kind: 'album' };

type PlayerState = { queue: Track[]; index: number; playing: boolean; contextName?: string };

type State = {
  hydrated: boolean;
  backdrop: Backdrop;
  demoEnabled: boolean;
  connected: Partial<Record<Exclude<Source, 'demo'>, boolean>>;
  playlists: Playlist[];
  player: PlayerState;
};

type Action =
  | { type: 'hydrate'; saved: Partial<Pick<State, 'backdrop' | 'demoEnabled'>> }
  | { type: 'setBackdrop'; backdrop: Backdrop }
  | { type: 'setDemo'; enabled: boolean }
  | { type: 'play'; queue: Track[]; index: number; contextName?: string }
  | { type: 'toggle' }
  | { type: 'skip'; by: 1 | -1 };

const initial: State = {
  hydrated: false,
  backdrop: { kind: 'aurora', preset: 'dusk' },
  demoEnabled: true,
  connected: {},
  playlists: [],
  player: { queue: [], index: 0, playing: false },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.saved, hydrated: true };
    case 'setBackdrop':
      return { ...state, backdrop: action.backdrop };
    case 'setDemo':
      return { ...state, demoEnabled: action.enabled };
    case 'play':
      return { ...state, player: { queue: action.queue, index: action.index, playing: true, contextName: action.contextName } };
    case 'toggle':
      return { ...state, player: { ...state.player, playing: !state.player.playing } };
    case 'skip': {
      const { queue, index } = state.player;
      if (!queue.length) return state;
      return { ...state, player: { ...state.player, index: (index + action.by + queue.length) % queue.length } };
    }
  }
}

const STORAGE_KEY = 'antik:settings:v1';
const StoreContext = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => dispatch({ type: 'hydrate', saved: raw ? JSON.parse(raw) : {} }))
      // Unreadable settings fall back to the defaults instead of blocking the app.
      .catch(() => dispatch({ type: 'hydrate', saved: {} }));
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ backdrop: state.backdrop, demoEnabled: state.demoEnabled })).catch(() => {});
  }, [state.hydrated, state.backdrop, state.demoEnabled]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

/** Every playlist the user can see: connected services first, then the demo library if enabled. */
export function useLibrary(): Playlist[] {
  const { state } = useStore();
  return useMemo(
    () => [...state.playlists, ...(state.demoEnabled ? demoPlaylists : [])],
    [state.playlists, state.demoEnabled],
  );
}

export function useNowPlaying(): Track | undefined {
  const { state } = useStore();
  return state.player.queue[state.player.index];
}
