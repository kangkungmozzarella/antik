import { useEffect } from 'react';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/common/theme/theme';

/** Antik's motif: the record slides half out of its sleeve (the cover) and turns. */
export function Vinyl({ size, spinning, disc, groove }: { size: number; spinning: boolean; disc: string; groove: string }) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const turn = useSharedValue(0);

  useEffect(() => {
    if (spinning && !reduceMotion) {
      turn.value = withRepeat(withTiming(turn.value + 360, { duration: 6000, easing: Easing.linear }), -1, false);
    } else {
      cancelAnimation(turn);
    }
  }, [spinning, reduceMotion, turn]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value}deg` }] }));
  const grooves = [0.92, 0.82, 0.72, 0.62, 0.52];
  return (
    <Animated.View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx={50} cy={50} r={49} fill={disc} />
        {grooves.map((g) => <Circle key={g} cx={50} cy={50} r={49 * g} fill="none" stroke={groove} strokeWidth={0.6} />)}
        <Circle cx={50} cy={50} r={17} fill={theme.color.accent} />
        <Circle cx={50} cy={50} r={2.2} fill={disc} />
      </Svg>
    </Animated.View>
  );
}
