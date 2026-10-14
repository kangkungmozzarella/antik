import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';

import { Icon } from './icon';

/** Floating back button for stack screens; opened from a deep link it goes Home instead. */
export function BackButton() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} accessibilityLabel="Back" hitSlop={8} style={[styles.back, { top: insets.top + space.sm }]}>
      <Icon name="back" />
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  back: { position: 'absolute', left: space.md, width: 44, height: 44, borderRadius: t.radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: t.color.glass },
}));
