import { useEffect } from 'react';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { Mascot } from '@/common/components/mascot';

/** Puding's motif: the mascot peeks from the cover's corner and bobs along. */
export function BobbingMascot({ size, bobbing }: { size: number; bobbing: boolean }) {
  const reduceMotion = useReducedMotion();
  const lift = useSharedValue(0);

  useEffect(() => {
    if (bobbing && !reduceMotion) {
      lift.value = withRepeat(withTiming(-size * 0.08, { duration: 450, easing: Easing.inOut(Easing.quad) }), -1, true);
    } else {
      cancelAnimation(lift);
      lift.value = withTiming(0, { duration: 200 });
    }
  }, [bobbing, reduceMotion, lift, size]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: lift.value }] }));
  return (
    <Animated.View style={style}>
      <Mascot size={size} />
    </Animated.View>
  );
}
