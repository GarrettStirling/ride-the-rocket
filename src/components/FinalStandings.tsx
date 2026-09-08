import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { BorderRadius, FontSize, Spacing } from '../constants/theme';
import type { Player, RoundStat } from '../game/types';
import { triggerFeedback } from '../hooks/useFeedback';
import { useTheme } from '../hooks/useTheme';
import { bumpInTiming, swiftTiming } from '../motion';
import { Button } from './Button';
import { StaggerIn } from './StaggerIn';
import { ThemedText } from './Themed';

interface FinalStandingsProps {
  players: Player[];
  roundStats: RoundStat[];
  onNewGame: () => void;
}

export function FinalStandings({ players, roundStats, onNewGame }: FinalStandingsProps) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const pulse = useSharedValue(1);

  const ranked = [...players].sort((a, b) => b.score - a.score);
  const winner = ranked[0];

  const highestPotRound = roundStats.reduce<RoundStat | null>((best, stat) => {
    if (!best || stat.peakPot > best.peakPot) return stat;
    return best;
  }, null);

  const longestRound = roundStats.reduce<RoundStat | null>((best, stat) => {
    if (!best || stat.rolls > best.rolls) return stat;
    return best;
  }, null);

  useEffect(() => {
    triggerFeedback('success');
    if (reduced) return;
    pulse.value = withRepeat(
      withSequence(withTiming(1.045, bumpInTiming), withTiming(1, swiftTiming)),
      4,
      false,
    );
  }, [reduced, pulse]);

  const winnerPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const placeColor = (index: number) => {
    if (index === 0) return colors.gold;
    if (index === 1) return colors.silver;
    if (index === 2) return colors.bronze;
    return colors.border;
  };

  const placeLabel = (index: number) => {
    if (index === 0) return '1st';
    if (index === 1) return '2nd';
    if (index === 2) return '3rd';
    return `${index + 1}.`;
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <ThemedText variant="label" muted style={styles.kicker}>
        Game over
      </ThemedText>

      {winner ? (
        <Animated.View
          style={[
            styles.winnerBanner,
            { backgroundColor: colors.gold },
            winnerPulse,
          ]}
        >
          <Text style={[styles.winnerEyebrow, { color: colors.goldText }]}>Winner</Text>
          <Text style={[styles.winnerName, { color: colors.goldText }]}>{winner.name}</Text>
          <Text style={[styles.winnerScore, { color: colors.goldText }]}>{winner.score}</Text>
        </Animated.View>
      ) : null}

      <ThemedText variant="subtitle" style={styles.sectionTitle}>
        Standings
      </ThemedText>

      {ranked.map((player, index) => {
        const topThree = index < 3;
        return (
          <StaggerIn key={player.id} index={index}>
            <View
              style={[
                styles.standingRow,
                topThree && { backgroundColor: colors.background },
              ]}
            >
              <Text
                style={[
                  styles.place,
                  {
                    color: topThree ? placeColor(index) : colors.textMuted,
                    fontWeight: index === 0 ? '800' : '600',
                  },
                ]}
              >
                {placeLabel(index)}
              </Text>
              <Text
                style={[
                  styles.playerName,
                  {
                    color: colors.text,
                    fontWeight: index === 0 ? '800' : topThree ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {player.name}
              </Text>
              <Text
                style={[
                  styles.playerScore,
                  {
                    color: index === 0 ? colors.gold : colors.text,
                    fontWeight: index === 0 ? '800' : '600',
                  },
                ]}
              >
                {player.score}
              </Text>
            </View>
          </StaggerIn>
        );
      })}

      {(highestPotRound || longestRound) && (
        <View style={styles.highlights}>
          <ThemedText variant="label" muted style={styles.sectionTitle}>
            Round highlights
          </ThemedText>
          {highestPotRound ? (
            <View style={[styles.statChip, { backgroundColor: colors.background }]}>
              <Text style={[styles.statLabel, { color: colors.blue }]}>Highest pot</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                Round {highestPotRound.round} · {highestPotRound.peakPot}
              </Text>
            </View>
          ) : null}
          {longestRound ? (
            <View style={[styles.statChip, { backgroundColor: colors.background }]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Most rolls</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                Round {longestRound.round} · {longestRound.rolls} rolls
              </Text>
            </View>
          ) : null}
        </View>
      )}

      <Button label="New game" onPress={onNewGame} style={styles.newGameButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  kicker: {
    textAlign: 'center',
  },
  winnerBanner: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  winnerEyebrow: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  winnerName: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    letterSpacing: -1,
  },
  winnerScore: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  place: {
    width: 36,
    fontSize: FontSize.sm,
  },
  playerName: {
    flex: 1,
    fontSize: FontSize.md,
  },
  playerScore: {
    fontSize: FontSize.lg,
    fontVariant: ['tabular-nums'],
  },
  highlights: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  statChip: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  newGameButton: {
    marginTop: Spacing.md,
  },
});
