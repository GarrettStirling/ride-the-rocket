import { useCallback } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Motion } from '../constants/theme';
import { fadeTiming } from '../motion';

/** Tiny horizontal shake; reduced-motion users get a brief opacity flash instead. */
export function useShake() {
  const reduced = useReducedMotion();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const shake = useCallback(() => {
    if (reduced) {
      opacity.value = withSequence(
        withTiming(0.5, { duration: 70 }),
        withTiming(1, fadeTiming),
      );
      return;
    }

    const px = Motion.shakePx;
    translateX.value = withSequence(
      withTiming(-px, { duration: 40 }),
      withTiming(px, { duration: 50 }),
      withTiming(-px * 0.6, { duration: 45 }),
      withTiming(px * 0.45, { duration: 45 }),
      withTiming(0, { duration: 50, easing: Easing.out(Easing.quad) }),
    );
  }, [reduced, opacity, translateX]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return { shake, style };
}
