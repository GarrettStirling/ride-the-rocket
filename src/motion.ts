import { Easing, type WithSpringConfig, type WithTimingConfig } from 'react-native-reanimated';
import { Motion } from './constants/theme';

export const swiftEasing = Easing.bezier(
  Motion.bezier[0],
  Motion.bezier[1],
  Motion.bezier[2],
  Motion.bezier[3],
);

export const pressTiming: WithTimingConfig = {
  duration: Motion.durationMs.press,
  easing: Easing.out(Easing.quad),
};

export const swiftTiming: WithTimingConfig = {
  duration: Motion.durationMs.state,
  easing: swiftEasing,
};

export const fadeTiming: WithTimingConfig = {
  duration: Motion.durationMs.fade,
  easing: Easing.out(Easing.quad),
};

export const bumpInTiming: WithTimingConfig = {
  duration: Motion.durationMs.bump,
  easing: swiftEasing,
};

export const snappySpring: WithSpringConfig = {
  damping: 16,
  stiffness: 320,
  mass: 0.5,
  overshootClamping: false,
};
