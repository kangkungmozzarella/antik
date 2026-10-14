import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import { defaultThemeId, themes, type ThemeId } from '@/common/theme/themes';

import { demoPlaylists } from './demo';
import type { Notice, Playlist, Source, Track } from './types';

export type Backdrop =
  | { kind: 'aurora'; preset: string }
  | { kind: 'photo'; uri: string }
  | { kind: 'album' };

/** Kept on this device only until AnTik has accounts. */
export type Profile = { name: string; photoUri?: string };

type PlayerState = { queue: Track[]; index: number; playing: boolean; contextName?: string };

type State = {
  hydrated: boolean;
  themeId: ThemeId;
  backdrop: Backdrop;
  profile: Profile;
  demoEnabled: boolean;
  connected: Partial<Record<Exclude<Source, 'demo'>, boolean>>;
  playlists: Playlist[];
  player: PlayerState;
  /** Most recent first. */
  history: Track[];
  /** Newest first. */
  notifications: Notice[];
};

type Saved = Partial<Pick<State, 'themeId' | 'backdrop' | 'profile' | 'demoEnabled' | 'history' | 'notifications'>>;

const HISTORY_LIMIT = 30;
const NOTIFICATION_LIMIT = 50;

type Action =
  | { type: 'hydrate'; saved: Saved }
  | { type: 'setTheme'; themeId: ThemeId }
  | { type: 'setBackdrop'; backdrop: Backdrop }
  | { type: 'setProfile'; profile: Partial<Profile> }
  | { type: 'setDemo'; enabled: boolean }
  | { type: 'play'; queue: Track[]; index: number; contextName?: string }
  | { type: 'toggle' }
  | { type: 'skip'; by: 1 | -1 }
  | { type: 'notify'; notice: Omit<Notice, 'read'> }
  | { type: 'readNotifications' }
  | { type: 'clearNotifications' };

const initial: State = {
  hydrated: false,
  themeId: defaultThemeId,
  backdrop: { kind: 'aurora', preset: themes[defaultThemeId].defaultBackdrop },
  profile: { name: '' },
  demoEnabled: true,
  connected: {},
  playlists: [],
  player: { queue: [], index: 0, playing: false },
  history: [],
  notifications: [],
};

/** Puts the track first in the history, once. */
function remember(history: Track[], track: Track | undefined) {
  if (!track) return history;
  return [track, ...history.filter((t) => t.id !== track.id)].slice(0, HISTORY_LIMIT);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate': {
      const next = { ...state, ...action.saved, hydrated: true };
      // A theme saved by a newer or older build may not exist here.
      if (!(next.themeId in themes)) next.themeId = defaultThemeId;
      return next;
    }
    case 'setTheme': {
      // Each theme has its own aurora set, so an aurora backdrop moves to the new theme's default.
      const backdrop: Backdrop = state.backdrop.kind === 'aurora' ? { kind: 'aurora', preset: themes[action.themeId].defaultBackdrop } : state.backdrop;
      return { ...state, themeId: action.themeId, backdrop };
    }
    case 'setBackdrop':
      return { ...state, backdrop: action.backdrop };
    case 'setProfile':
      return { ...state, profile: { ...state.profile, ...action.profile } };
    case 'setDemo':
      return { ...state, demoEnabled: action.enabled };
    case 'play':
      return {
        ...state,
        player: { queue: action.queue, index: action.index, playing: true, contextName: action.contextName },
        history: remember(state.history, action.queue[action.index]),
      };
    case 'toggle':
      return { ...state, player: { ...state.player, playing: !state.player.playing } };
    case 'skip': {
      const { queue, index } = state.player;
      if (!queue.length) return state;
      const next = (index + action.by + queue.length) % queue.length;
      return { ...state, player: { ...state.player, index: next }, history: remember(state.history, queue[next]) };
    }
    case 'notify':
      return { ...state, notifications: [{ ...action.notice, read: false }, ...state.notifications].slice(0, NOTIFICATION_LIMIT) };
    case 'readNotifications':
      return { ...state, notifications: state.notifications.map((n) => (n.read ? n : { ...n, read: true })) };
    case 'clearNotifications':
      return { ...state, notifications: [] };
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
    const saved: Saved = {
      themeId: state.themeId,
      backdrop: state.backdrop,
      profile: state.profile,
      demoEnabled: state.demoEnabled,
      history: state.history,
      notifications: state.notifications,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved)).catch(() => {});
  }, [state.hydrated, state.themeId, state.backdrop, state.profile, state.demoEnabled, state.history, state.notifications]);

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

export function useUnreadCount() {
  const { state } = useStore();
  return state.notifications.filter((n) => !n.read).length;
}

/** Builds a notice with its id and time; pass it to `dispatch({ type: 'notify', notice })`. */
export function makeNotice(kind: Notice['kind'], title: string, body: string): Omit<Notice, 'read'> {
  const at = Date.now();
  return { id: `${at}-${Math.random().toString(36).slice(2, 8)}`, kind, title, body, at };
}
