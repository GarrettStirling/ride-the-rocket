import { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { BorderRadius, FontSize, Motion, Spacing } from '../constants/theme';
import { isDoublesDisabled, isInOpeningPhase, isPureDoublesKeyDisabled, isPureDoublesValue, rollValues } from '../game/rules';
import { triggerFeedback } from '../hooks/useFeedback';
import { useShake } from '../hooks/useShake';
import { useTheme } from '../hooks/useTheme';
import { bumpInTiming, swiftTiming } from '../motion';
import { PressableScale } from './PressableScale';
import { StaggerIn } from './StaggerIn';

interface NumberPadProps {
  rollsThisRound: number;
  onSelect: (value: number) => void;
  onSelectDoubles: () => void;
  disabled?: boolean;
}

export function NumberPad({
  rollsThisRound,
  onSelect,
  onSelectDoubles,
  disabled,
}: NumberPadProps) {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;
  const [padWidth, setPadWidth] = useState(Math.max(width - Spacing.lg * 2, 1));
  const values = rollValues();
  // Phone: 3×4 (bigger keys). Tablet: 4 cols portrait / 6 landscape.
  const columns = isTablet ? (isLandscape ? 6 : 4) : 3;
  const gap = Spacing.xs;
  const keyWidth = Math.max((padWidth - gap * (columns - 1)) / columns, 56);

  const doublesDisabled = disabled || isDoublesDisabled(rollsThisRound);
  const sevenIsDeadly = !isInOpeningPhase(rollsThisRound);

  return (
    <View
      style={styles.wrapper}
      onLayout={(e) => {
        const next = e.nativeEvent.layout.width;
        if (next > 0) setPadWidth(next);
      }}
    >
      <View style={[styles.grid, { gap }]}>
        {values.map((value, index) => {
          const keyDisabled =
            disabled || (isPureDoublesValue(value) && isPureDoublesKeyDisabled(rollsThisRound));
          return (
            <StaggerIn key={value} index={index} style={{ width: keyWidth }}>
              <PadKey
                label={String(value)}
                accessibilityLabel={
                  value === 7 && sevenIsDeadly ? 'Roll 7, ends the round' : `Roll ${value}`
                }
                disabled={keyDisabled}
                hot={value === 7 && sevenIsDeadly}
                compact={isTablet && isLandscape}
                onPress={() => onSelect(value)}
              />
            </StaggerIn>
          );
        })}
        <StaggerIn index={values.length} style={{ width: keyWidth }}>
          <PadKey
            label="2×"
            accessibilityLabel="Doubles — double the pot"
            disabled={doublesDisabled}
            doubles
            compact={isTablet && isLandscape}
            onPress={onSelectDoubles}
          />
        </StaggerIn>
      </View>
    </View>
  );
}

function PadKey({
  label,
  accessibilityLabel,
  disabled,
  hot,
  doubles,
  compact,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  disabled: boolean;
  hot?: boolean;
  doubles?: boolean;
  compact?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const { shake, style: shakeStyle } = useShake();
  const reduced = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!hot) {
      pulse.value = 1;
      return;
    }
    if (reduced) return;
    pulse.value = withSequence(
      withTiming(Motion.bumpScale, bumpInTiming),
      withTiming(1, swiftTiming),
    );
  }, [hot, reduced, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const bg = hot ? colors.danger : doubles && !disabled ? colors.doubles : colors.key;
  const fg = hot ? colors.dangerText : doubles && !disabled ? colors.blueText : colors.text;
  const mutedFg = colors.textMuted;

  return (
    <Animated.View style={shakeStyle}>
      <Animated.View style={pulseStyle}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled }}
          scaleTo={Motion.pressScale.key}
          style={[styles.key, compact && styles.keyCompact, { backgroundColor: bg }]}
          onPress={() => {
            if (disabled) {
              triggerFeedback('error');
              shake();
              return;
            }
            triggerFeedback('action');
            onPress();
          }}
        >
          <Text
            style={[
              styles.keyText,
              compact && styles.keyTextCompact,
              doubles && styles.doublesText,
              { color: disabled ? mutedFg : fg },
            ]}
          >
            {label}
          </Text>
        </PressableScale>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.xs,
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  key: {
    width: '100%',
    aspectRatio: 1.55,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  keyCompact: {
    aspectRatio: 1.75,
    marginBottom: 2,
  },
  keyText: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  keyTextCompact: {
    fontSize: FontSize.lg,
  },
  doublesText: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
