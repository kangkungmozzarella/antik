/*
  Runs inside the hidden WebView (see src/common/youtube/engine-view.tsx), never in the app's JS.

  YouTube only serves a whole song when the stream URL carries a PoToken, and a PoToken can
  only come from Google's BotGuard program running in a real browser. The WebView is that
  browser. It also runs the player's deciphering code that youtubei.js extracts, so the app
  never has to evaluate downloaded code in its own runtime.

  The WebView makes no network requests itself: an Android WebView tags every request with
  the app's package name, and Google then withholds the integrity token. The app fetches the
  challenge and the token and hands the raw responses in here (the same split NewPipe and
  BitChord use).

  Bundled into src/common/youtube/engine-script.ts by `npm run build:youtube-engine`.
*/
import { BotGuardClient, parseChallengeData } from 'bgutils-js/botguard';
import { WebPoMinter } from 'bgutils-js/webpo';

let signals = [];
let minter = null;

function post(message) {
  window.ReactNativeWebView.postMessage(JSON.stringify(message));
}

const handlers = {
  /** Runs BotGuard on the challenge from /Create; returns the snapshot /GenerateIT expects. */
  async runBotGuard({ challengeResponse }) {
    const challenge = parseChallengeData(challengeResponse);
    if (!challenge) throw new Error('Could not read the BotGuard challenge');
    const script = challenge.interpreterJavascript.privateDoNotAccessOrElseSafeScriptWrappedValue;
    if (!script) throw new Error('The BotGuard challenge has no interpreter');
    new Function(script)();
    const botguard = await BotGuardClient.create({ program: challenge.program, globalName: challenge.globalName, globalObject: window });
    signals = [];
    minter = null;
    return botguard.snapshot({ webPoSignalOutput: signals });
  },

  /** Builds the minter from /GenerateIT's response; returns how long it stays valid. */
  async createMinter({ integrityResponse }) {
    const [integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken] = integrityResponse;
    if (typeof integrityToken !== 'string') throw new Error('Google withheld the integrity token');
    minter = await WebPoMinter.create({ integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken }, signals);
    return { ttlSecs: estimatedTtlSecs, refreshSecs: mintRefreshThreshold };
  },

  async mint({ videoId }) {
    if (!minter) throw new Error('No PoToken minter yet');
    return minter.mintAsWebsafeString(videoId);
  },

  eval({ code }) {
    return new Function(code)();
  },
};

window.__antikEngine = {
  async handle({ id, type, ...args }) {
    try {
      const handler = handlers[type];
      if (!handler) throw new Error(`Unknown request ${type}`);
      post({ id, ok: true, result: await handler(args) });
    } catch (error) {
      post({ id, ok: false, error: String(error?.message ?? error) });
    }
  },
};

post({ type: 'ready' });
