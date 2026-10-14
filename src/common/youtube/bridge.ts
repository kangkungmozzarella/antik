import type { WebView } from 'react-native-webview';

/*
  Request/response channel to the hidden engine WebView. Requests sent before the WebView
  has loaded wait for it instead of failing.
*/
type Pending = { resolve: (value: unknown) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> };

const TIMEOUT_MS = 30_000;

let webview: WebView | null = null;
let nextId = 1;
const pending = new Map<number, Pending>();
let markReady: () => void = () => {};
let ready = new Promise<void>((resolve) => (markReady = resolve));
const resetListeners = new Set<() => void>();

/** Called whenever the WebView (re)loads and so holds no state yet. */
export function onEngineReset(listener: () => void) {
  resetListeners.add(listener);
}

export function attachEngine(view: WebView | null) {
  webview = view;
}

/** The WebView reloaded (or crashed and came back): fail what was in flight and wait for it again. */
export function resetEngine() {
  for (const [id, request] of pending) {
    clearTimeout(request.timer);
    request.reject(new Error('The YouTube engine restarted'));
    pending.delete(id);
  }
  ready = new Promise<void>((resolve) => (markReady = resolve));
  resetListeners.forEach((listener) => listener());
}

export function onEngineMessage(raw: string) {
  const message = JSON.parse(raw) as { type?: string; id?: number; ok?: boolean; result?: unknown; error?: string; message?: string };
  if (message.type === 'ready') {
    // Every 'ready' is a fresh page (first load, fast refresh, renderer restart): nothing the
    // WebView held before survives it.
    resetListeners.forEach((listener) => listener());
    return markReady();
  }
  if (message.type === 'log') return console.warn(`[youtube-engine] ${message.message}`);
  const request = message.id ? pending.get(message.id) : undefined;
  if (!request) return;
  pending.delete(message.id!);
  clearTimeout(request.timer);
  if (message.ok) request.resolve(message.result);
  else request.reject(new Error(message.error ?? 'The YouTube engine failed'));
}

/** Sends one request to the engine WebView (see scripts/youtube-engine/entry.js for the handlers). */
export async function engineRequest<T>(type: string, args: Record<string, unknown>): Promise<T> {
  await ready;
  if (!webview) throw new Error('The YouTube engine is not mounted');
  const id = nextId++;
  const result = new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`The YouTube engine did not answer (${type})`));
    }, TIMEOUT_MS);
    pending.set(id, { resolve: resolve as (value: unknown) => void, reject, timer });
  });
  webview.injectJavaScript(`window.__antikEngine.handle(${JSON.stringify({ id, type, ...args })}); true;`);
  return result;
}

/** Runs the player's deciphering code in the browser; it returns plain strings only. */
export const evaluateInEngine = <T>(code: string) => engineRequest<T>('eval', { code });
