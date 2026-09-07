import { useEffect, useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Motion } from '../constants/theme';
import { triggerFeedback, type FeedbackEvent } from '../hooks/useFeedback';
import { useTheme } from '../hooks/useTheme';
import { fadeTiming, pressTiming, snappySpring, swiftTiming } from '../motion';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Resting scale when pressed. Defaults to 0.97. */
  scaleTo?: number;
  /** Selected / active — lifts slightly instead of relying on color alone. */
  selected?: boolean;
  /** Fire haptic + optional sound on press. Skip when handling feedback in onPress. */
  feedback?: FeedbackEvent;
};

/**
 * Pressable is a JS composite, not a native animated host.
 * Reanimated cannot wrap it (`Property 'Pressable' doesn't exist`).
 * Animate an inner Animated.View; keep Pressable as the tap target.
 */
export function PressableScale({
  children,
  onPress,
  onPressIn,
  onPressOut,
  onFocus,
  onBlur,
  disabled,
  style,
  scaleTo = Motion.pressScale.default,
  selected = false,
  feedback,
  accessibilityState,
  ...rest
}: Props) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const pressed = useSharedValue(0);
  const selectedProgress = useSharedValue(selected ? 1 : 0);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    selectedProgress.value = withTiming(selected ? 1 : 0, reduced ? fadeTiming : swiftTiming);
  }, [selected, reduced, selectedProgress]);

  const animStyle = useAnimatedStyle(() => {
    if (reduced) {
      return {
        opacity: disabled ? 1 : 1 - pressed.value * 0.22,
      };
    }

    const restScale = 1 + selectedProgress.value * 0.02;
    const pressScale = 1 - pressed.value * (1 - scaleTo);

    return {
      transform: [
        { scale: restScale * pressScale },
        { translateY: selectedProgress.value * Motion.liftY },
      ],
    };
  });

  const webFocusStyle: ViewStyle | undefined =
    Platform.OS === 'web' && focused
      ? {
          outlineWidth: 2,
          outlineStyle: 'solid',
          outlineColor: colors.text,
          outlineOffset: 2,
        }
      : undefined;

  const flattened = StyleSheet.flatten(style);
  const layoutStyle: ViewStyle = {
    flex: flattened?.flex,
    width: flattened?.width,
    height: flattened?.height,
    minWidth: flattened?.minWidth,
    minHeight: flattened?.minHeight,
    maxWidth: flattened?.maxWidth,
    alignSelf: flattened?.alignSelf,
  };

  return (
    <Pressable
      {...rest}
      android_ripple={{ color: 'transparent' }}
      disabled={disabled}
      accessibilityState={{ disabled: !!disabled, selected, ...accessibilityState }}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      onPressIn={(e) => {
        pressed.value = withTiming(1, pressTiming);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.value = reduced ? withTiming(0, fadeTiming) : withSpring(0, snappySpring);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (!disabled && feedback) {
          triggerFeedback(feedback);
        }
        onPress?.(e);
      }}
      style={layoutStyle}
    >
      <Animated.View style={[style, webFocusStyle, animStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
