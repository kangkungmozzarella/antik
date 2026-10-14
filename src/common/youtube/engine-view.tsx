import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { attachEngine, onEngineMessage, resetEngine } from './bridge';
import { ENGINE_SCRIPT } from './engine-script';
import { DESKTOP_USER_AGENT, warmUpPoTokens } from './potoken';

// A blank page under youtube.com's origin, which is where YouTube's own player runs BotGuard.
const PAGE = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><script>${ENGINE_SCRIPT}</script></body></html>`;

/** Mount once at the root. Invisible and never interactive. */
export function YouTubeEngineView() {
  const ref = useRef<WebView>(null);
  useEffect(warmUpPoTokens, []);
  return (
    <View style={styles.hidden} pointerEvents="none" importantForAccessibility="no-hide-descendants">
      <WebView
        ref={(view) => {
          ref.current = view;
          attachEngine(view);
        }}
        source={{ html: PAGE, baseUrl: 'https://www.youtube.com/' }}
        originWhitelist={['*']}
        userAgent={DESKTOP_USER_AGENT}
        javaScriptEnabled
        onMessage={(event) => onEngineMessage(event.nativeEvent.data)}
        // The OS may kill a background WebView's renderer; bring the engine back.
        onContentProcessDidTerminate={() => {
          resetEngine();
          ref.current?.reload();
        }}
        onRenderProcessGone={() => {
          resetEngine();
          ref.current?.reload();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' },
});
