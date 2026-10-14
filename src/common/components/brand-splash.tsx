import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

// Matches the native splash (app.json) and the design's own background.
const SPLASH_BACKGROUND = '#040c11';
// Long enough to read the name, short enough not to feel like a wait.
const MIN_VISIBLE_MS = 900;
// If the image never reports in, do not keep the native splash up forever.
const NATIVE_SPLASH_TIMEOUT_MS = 2500;

/*
  The full splash design (logo, name and tagline). Android 12+ only lets the native splash
  show a centred icon, so the native splash shows the A on the same background and hands
  over to this as soon as the image is on screen. It fades away once the app is ready.
*/
export function BrandSplash({ appReady }: { appReady: boolean }) {
  const [shown, setShown] = useState(false);
  const [minimumPassed, setMinimumPassed] = useState(false);

  useEffect(() => {
    const fallback = setTimeout(() => setShown(true), NATIVE_SPLASH_TIMEOUT_MS);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (!shown) return;
    SplashScreen.hide();
    const timer = setTimeout(() => setMinimumPassed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [shown]);

  if (appReady && minimumPassed) return null;

  return (
    <Animated.View exiting={FadeOut.duration(400)} style={styles.cover} pointerEvents="none" accessibilityLabel="AnTik, your music, your way">
      <Image
        source={require('../../../assets/images/splash.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        onDisplay={() => setShown(true)}
        onError={() => setShown(true)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cover: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: SPLASH_BACKGROUND },
});
