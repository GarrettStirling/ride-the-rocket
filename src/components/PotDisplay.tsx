import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { BorderRadius, FontSize, Motion, Spacing } from '../constants/theme';
import type { GameStatus } from '../game/types';
import { triggerFeedback } from '../hooks/useFeedback';
import { useShake } from '../hooks/useShake';
import { useTheme } from '../hooks/useTheme';
import { bumpInTiming, fadeTiming, swiftTiming } from '../motion';
import { ThemedText } from './Themed';

const COUNT_DURATION_MS = 700;
const COUNT_STEPS = 11;

function isBigPotMove(
  label: string | undefined,
  from: number,
  to: number,
  sevenOut?: boolean,
): boolean {
  if (label === '2×' || label === '7') return true;
  if (sevenOut && to === 0 && from > 0) return true;
  return Math.abs(to - from) >= 50;
}

interface PotDisplayProps {
  pot: number;
  roundLabel: string;
  currentRound: number;
  status: GameStatus;
  rollsThisRound: number;
  lastEvent?: string;
  lastRollNumber?: number;
  lastRollLabel?: string;
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
  lastRollLabel,
  sevenOut,
  openingPhase,
}: PotDisplayProps) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const { shake, style: shakeStyle } = useShake();
  const lift = useSharedValue(0);
  const roundPulse = useSharedValue(0);
  const goldFill = useSharedValue(0);
  const displayFrom = useRef(pot);
  const [displayPot, setDisplayPot] = useState(pot);
  const prevSeven = useRef(sevenOut);
  const prevDoubleKey = useRef<string | null>(null);
  const doublesReady = useRef(false);
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
    const from = displayFrom.current;
    if (from === pot) return;

    const shouldCount = !reduced && isBigPotMove(lastRollLabel, from, pot, sevenOut);

    if (!shouldCount) {
      setDisplayPot(pot);
      displayFrom.current = pot;
      if (!reduced) {
        lift.value = withSequence(
          withTiming(1, bumpInTiming),
          withTiming(0, swiftTiming),
        );
      }
      return;
    }

    let step = 0;
    const id = setInterval(() => {
      step += 1;
      const t = Math.min(1, step / COUNT_STEPS);
      const eased = 1 - (1 - t) * (1 - t);
      setDisplayPot(Math.round(from + (pot - from) * eased));
      if (step >= COUNT_STEPS) {
        clearInterval(id);
        setDisplayPot(pot);
        displayFrom.current = pot;
      }
    }, COUNT_DURATION_MS / COUNT_STEPS);

    lift.value = withSequence(
      withTiming(1, bumpInTiming),
      withTiming(0, { duration: COUNT_DURATION_MS * 0.45, easing: swiftTiming.easing }),
    );

    return () => {
      clearInterval(id);
      setDisplayPot(pot);
      displayFrom.current = pot;
    };
  }, [pot, lastRollLabel, sevenOut, reduced, lift]);

  useEffect(() => {
    const key = lastRollLabel === '2×' ? `${lastRollNumber}-${pot}` : null;
    if (!doublesReady.current) {
      doublesReady.current = true;
      prevDoubleKey.current = key;
      return;
    }
    if (!key) {
      prevDoubleKey.current = null;
      return;
    }
    if (prevDoubleKey.current === key) return;
    prevDoubleKey.current = key;

    goldFill.value = withSequence(
      withTiming(1, reduced ? fadeTiming : { duration: 140, easing: swiftTiming.easing }),
      withDelay(
        90,
        withTiming(0, reduced ? fadeTiming : { duration: 220, easing: swiftTiming.easing }),
      ),
    );
  }, [lastRollLabel, lastRollNumber, pot, reduced, goldFill]);

  useEffect(() => {
    const playPulse = () => {
      roundPulse.value = withSequence(
        withTiming(1, reduced ? fadeTiming : swiftTiming),
        withDelay(1800, withTiming(0, reduced ? fadeTiming : swiftTiming)),
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

  const goldBoxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(goldFill.value, [0, 1], [potBg, colors.gold]),
  }));

  const goldTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(goldFill.value, [0, 1], [potFg, colors.goldText]),
  }));

  const boxStyle = useAnimatedStyle(() => {
    if (reduced) {
      return { opacity: 1 };
    }
    return {
      transform: [
        { scale: 1 + lift.value * 0.03 + goldFill.value * 0.04 },
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
        <Animated.View style={[styles.potBox, goldBoxStyle, boxStyle]}>
          <Animated.Text
            style={[styles.potValue, goldTextStyle]}
            accessibilityLabel={`Pot value ${pot}${openingPhase ? ', opening rolls' : ''}`}
          >
            {displayPot}
          </Animated.Text>
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
    paddingTop: 0,
    paddingBottom: Spacing.md,
    overflow: 'visible',
  },
  roundSlot: {
    height: 28,
    marginBottom: Spacing.xs,
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
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  potValue: {
    fontSize: FontSize.pot,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  lastEvent: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    textAlign: 'center',
    minHeight: 18,
  },
  lastEventPlaceholder: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    height: 18,
  },
});
