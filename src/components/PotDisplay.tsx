import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { FontSize, Motion, Spacing } from '../constants/theme';
import type { GameStatus } from '../game/types';
import { triggerFeedback } from '../hooks/useFeedback';
import { useShake } from '../hooks/useShake';
import { useTheme } from '../hooks/useTheme';
import { bumpInTiming, fadeTiming, swiftTiming } from '../motion';
import { BumpText } from './BumpText';
import { ThemedText } from './Themed';

interface PotDisplayProps {
  pot: number;
  roundLabel: string;
  currentRound: number;
  status: GameStatus;
  rollsThisRound: number;
  lastEvent?: string;
  lastRollNumber?: number;
  sevenOut?: boolean;
  openingPhase?: boolean;
}

export function PotDisplay({
  pot,
  roundLabel,
  currentRound,
  status,
  rollsThisRound,
  lastEvent,
  lastRollNumber,
  sevenOut,
  openingPhase,
}: PotDisplayProps) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const { shake, style: shakeStyle } = useShake();
  const lift = useSharedValue(0);
  const roundPulse = useSharedValue(0);
  const prevPot = useRef(pot);
  const prevSeven = useRef(sevenOut);
  const prevRound = useRef<number | null>(null);
  const didMount = useRef(false);

  const rollMeta =
    lastEvent && lastRollNumber
      ? `${lastEvent} · Roll ${lastRollNumber}`
      : lastEvent;

  const potBg = openingPhase ? colors.potOpening : colors.pot;
  const potFg = openingPhase ? colors.potOpeningText : colors.potText;

  useEffect(() => {
    if (!sevenOut || prevSeven.current === sevenOut) {
      prevSeven.current = sevenOut;
      return;
    }
    prevSeven.current = sevenOut;
    triggerFeedback('error');
    shake();
  }, [sevenOut, shake]);

  useEffect(() => {
    if (prevPot.current === pot) return;
    prevPot.current = pot;
    if (reduced) return;
    lift.value = withSequence(
      withTiming(1, bumpInTiming),
      withTiming(0, swiftTiming),
    );
  }, [pot, reduced, lift]);

  useEffect(() => {
    const playPulse = () => {
      roundPulse.value = withSequence(
        withTiming(1, reduced ? fadeTiming : swiftTiming),
        withDelay(700, withTiming(0, reduced ? fadeTiming : swiftTiming)),
      );
    };

    if (status !== 'playing') {
      didMount.current = true;
      prevRound.current = currentRound;
      roundPulse.value = 0;
      return;
    }

    const firstPaint = !didMount.current;
    didMount.current = true;

    if (firstPaint) {
      prevRound.current = currentRound;
      if (rollsThisRound === 0) playPulse();
      return;
    }

    if (prevRound.current !== null && currentRound > prevRound.current) {
      playPulse();
    }
    prevRound.current = currentRound;
  }, [currentRound, status, rollsThisRound, reduced, roundPulse]);

  const boxStyle = useAnimatedStyle(() => {
    if (reduced) {
      return { opacity: 1 };
    }
    return {
      transform: [
        { scale: 1 + lift.value * 0.03 },
        { translateY: lift.value * Motion.liftY },
      ],
    };
  });

  const eventOpacity = useSharedValue(rollMeta ? 1 : 0);
  useEffect(() => {
    eventOpacity.value = withTiming(rollMeta ? 1 : 0, fadeTiming);
  }, [rollMeta, eventOpacity]);

  const eventStyle = useAnimatedStyle(() => ({
    opacity: eventOpacity.value,
  }));

  const restLabelStyle = useAnimatedStyle(() => ({
    opacity: 1 - roundPulse.value,
  }));

  const heroLabelStyle = useAnimatedStyle(() => ({
    opacity: roundPulse.value,
    transform: [
      {
        scale: reduced ? 1 : interpolate(roundPulse.value, [0, 1], [0.94, 1.04]),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.roundSlot} accessibilityLabel={roundLabel}>
        <Animated.View style={restLabelStyle}>
          <ThemedText variant="label" muted style={styles.roundLabel}>
            {roundLabel}
            {openingPhase ? ' · Opening' : ''}
          </ThemedText>
        </Animated.View>
        <Animated.Text
          pointerEvents="none"
          style={[styles.roundHero, { color: colors.blue }, heroLabelStyle]}
        >
          Round {currentRound}
        </Animated.Text>
      </View>

      <Animated.View style={shakeStyle}>
        <Animated.View style={[styles.potBox, { backgroundColor: potBg }, boxStyle]}>
          <BumpText
            value={pot}
            style={[styles.potValue, { color: potFg }]}
            accessibilityLabel={`Pot value ${pot}${openingPhase ? ', opening rolls' : ''}`}
          />
        </Animated.View>
      </Animated.View>

      {rollMeta ? (
        <Animated.View style={eventStyle}>
          <ThemedText variant="caption" muted style={styles.lastEvent}>
            {rollMeta}
          </ThemedText>
        </Animated.View>
      ) : (
        <View style={styles.lastEventPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    overflow: 'visible',
  },
  roundSlot: {
    height: 28,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    overflow: 'visible',
  },
  roundLabel: {
    textAlign: 'center',
  },
  roundHero: {
    position: 'absolute',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  potBox: {
    minWidth: 180,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 4,
    alignItems: 'center',
  },
  potValue: {
    fontSize: FontSize.pot,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  lastEvent: {
    marginTop: Spacing.sm,
    textAlign: 'center',
    minHeight: 18,
  },
  lastEventPlaceholder: {
    marginTop: Spacing.sm,
    height: 18,
  },
});
