import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/Button';
import { PressableScale } from '../src/components/PressableScale';
import { StaggerIn } from '../src/components/StaggerIn';
import { ThemedText, ThemedView } from '../src/components/Themed';
import { BorderRadius, FontSize, Motion, Spacing } from '../src/constants/theme';
import { useGameStore } from '../src/game/gameStore';
import type { GameHistoryEntry } from '../src/game/types';
import { useTheme } from '../src/hooks/useTheme';

function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function HistoryCard({
  entry,
  onReplay,
  index,
}: {
  entry: GameHistoryEntry;
  onReplay: () => void;
  index: number;
}) {
  const { colors } = useTheme();
  const winner = entry.scores[0];

  return (
    <StaggerIn index={index}>
      <View style={[styles.card, { borderColor: colors.border }]}>
        <View style={styles.cardTop}>
          <ThemedText variant="caption" muted>
            {formatDate(entry.finishedAt)} · {entry.totalRounds} rounds
          </ThemedText>
          {winner ? (
            <ThemedText style={styles.winner}>
              {winner.name} · {winner.score}
            </ThemedText>
          ) : null}
        </View>
        <ThemedText variant="caption" muted numberOfLines={1}>
          {entry.playerNames.join(', ')}
        </ThemedText>
        <PressableScale
          onPress={onReplay}
          feedback="selection"
          accessibilityRole="button"
          accessibilityLabel={`Start new game with ${entry.playerNames.join(', ')}`}
          scaleTo={Motion.pressScale.chip}
          style={[styles.replayBtn, { borderColor: colors.border }]}
        >
          <ThemedText style={{ color: colors.text, fontWeight: '600', fontSize: FontSize.sm }}>
            Start new game with same players
          </ThemedText>
        </PressableScale>
      </View>
    </StaggerIn>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const present = useGameStore((s) => s.present);
  const gameHistory = useGameStore((s) => s.gameHistory);
  const startGame = useGameStore((s) => s.startGame);
  const hasActiveGame = useGameStore((s) => s.hasActiveGame);

  useEffect(() => {
    if (present?.status === 'playing') {
      router.replace('/play');
    }
  }, [present?.status]);

  const replay = (entry: GameHistoryEntry) => {
    startGame(entry.playerNames, entry.totalRounds);
    router.replace('/play');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <ThemedText variant="label" muted>
              Dice party game
            </ThemedText>
            <ThemedText variant="title" style={styles.title}>
              Ride the Rocket
            </ThemedText>
            <ThemedText muted style={styles.subtitle}>
              Track the pot, roll by roll. Grab the cash before a seven ends the round.
            </ThemedText>
          </View>

          <View style={styles.actions}>
            <Button label="New Game" onPress={() => router.push('/setup')} />
            {hasActiveGame() && present?.status === 'finished' && (
              <Button
                label="View Final Scores"
                variant="secondary"
                onPress={() => router.push('/play')}
              />
            )}
          </View>

          {gameHistory.length > 0 && (
            <View style={styles.history}>
              <ThemedText variant="label" muted style={styles.historyLabel}>
                Previous games
              </ThemedText>
              {gameHistory.map((entry, index) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                  index={index}
                  onReplay={() => replay(entry)}
                />
              ))}
            </View>
          )}

          <ThemedText variant="caption" muted style={styles.footer}>
            Bring two dice. One phone keeps score.
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
  },
  hero: {
    paddingTop: Spacing.xxl,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  subtitle: {
    lineHeight: 24,
    marginTop: Spacing.xs,
  },
  actions: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  history: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  historyLabel: {
    marginBottom: Spacing.xs,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  winner: {
    fontWeight: '700',
    fontSize: FontSize.md,
  },
  replayBtn: {
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
