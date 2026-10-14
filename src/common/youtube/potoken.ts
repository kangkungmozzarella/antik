import { engineRequest, onEngineReset } from './bridge';

/*
  PoTokens, the proof-of-browser googlevideo asks for before it serves more than the first
  megabyte of a stream. BotGuard runs in the engine WebView; the two requests to Google go
  out from here, because Google withholds the token when an Android WebView sends them.
*/

// What YouTube's web player sends; the endpoints check both.
const REQUEST_KEY = 'O43z0dpjhgX20SCx4KAo';
const GOOGLE_API_KEY = 'AIzaSyDyT5W0Jh49F30Pqqtyfdf7pDLFKLJoAnw';
export const DESKTOP_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

let validUntil = 0;
let starting: Promise<void> | null = null;

onEngineReset(() => {
  validUntil = 0;
  starting = null;
});

async function botguardRequest(endpoint: 'Create' | 'GenerateIT', payload: unknown[]) {
  const response = await fetch(`https://www.youtube.com/api/jnn/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json+protobuf',
      'x-goog-api-key': GOOGLE_API_KEY,
      'x-user-agent': 'grpc-web-javascript/0.1',
      'user-agent': DESKTOP_USER_AGENT,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`BotGuard ${endpoint} failed (HTTP ${response.status})`);
  return response.json() as Promise<unknown[]>;
}

async function createMinter() {
  const challengeResponse = await botguardRequest('Create', [REQUEST_KEY]);
  const snapshot = await engineRequest<string>('runBotGuard', { challengeResponse });
  const integrityResponse = await botguardRequest('GenerateIT', [REQUEST_KEY, snapshot]);
  const { ttlSecs, refreshSecs } = await engineRequest<{ ttlSecs: number; refreshSecs: number }>('createMinter', { integrityResponse });
  validUntil = Date.now() + Math.max(ttlSecs - refreshSecs, 60) * 1000;
}

/** Start BotGuard early so the first song does not wait for it. */
export function warmUpPoTokens() {
  ensureMinter().catch((error: unknown) => console.warn(`[youtube] PoToken warm-up failed: ${error instanceof Error ? error.message : error}`));
}

async function ensureMinter() {
  if (Date.now() < validUntil) return;
  starting ??= createMinter().finally(() => {
    starting = null;
  });
  await starting;
}

/** A content-bound PoToken for one video. */
export async function mintPoToken(videoId: string) {
  await ensureMinter();
  try {
    return await engineRequest<string>('mint', { videoId });
  } catch {
    // The WebView may have restarted since the minter was built; build it again once.
    validUntil = 0;
    await ensureMinter();
    return engineRequest<string>('mint', { videoId });
  }
}
