import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { Motion } from '../constants/theme';

interface StaggerInProps {
  index: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Staggered entrance. Reduced motion: short fade, no travel. */
export function StaggerIn({ index, children, style }: StaggerInProps) {
  const reduced = useReducedMotion();
  const delay = Math.min(index * Motion.staggerMs, 240);

  const entering = reduced
    ? FadeIn.duration(Motion.durationMs.fade).delay(Math.min(delay, 80))
    : FadeInDown.delay(delay).springify().damping(17).stiffness(280).mass(0.55);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
