import { useEffect, useRef } from 'react';
import { StyleSheet, type StyleProp, type TextProps, type TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Motion } from '../constants/theme';
import { bumpInTiming, fadeTiming, swiftTiming } from '../motion';

type Props = Omit<TextProps, 'children' | 'style'> & {
  value: string | number;
  style?: StyleProp<TextStyle>;
};

/** Scale-pulse a value when it changes. Reduced motion: quick opacity flicker. */
export function BumpText({ value, style, ...rest }: Props) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;

    if (reduced) {
      opacity.value = withSequence(withTiming(0.55, { duration: 70 }), withTiming(1, fadeTiming));
      return;
    }

    scale.value = withSequence(
      withTiming(Motion.bumpScale, bumpInTiming),
      withTiming(1, swiftTiming),
    );
  }, [value, reduced, opacity, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.base, style, animStyle]} {...rest}>
      {value}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontVariant: ['tabular-nums'],
  },
});
