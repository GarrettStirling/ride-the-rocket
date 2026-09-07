import { router, Stack, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/Button';
import { FinalStandings } from '../src/components/FinalStandings';
import { LiveRegion } from '../src/components/LiveRegion';
import { NumberPad } from '../src/components/NumberPad';
import { PlayerRow } from '../src/components/PlayerRow';
import { PotDisplay } from '../src/components/PotDisplay';
import { PressableScale } from '../src/components/PressableScale';
import { RulesModal } from '../src/components/RulesModal';
import { StaggerIn } from '../src/components/StaggerIn';
import { ThemedText, ThemedView } from '../src/components/Themed';
import { BorderRadius, FontSize, Motion, Spacing } from '../src/constants/theme';
import { getGameStatusLabel, useGameStore } from '../src/game/gameStore';
import { isInOpeningPhase } from '../src/game/rules';
import { useTheme } from '../src/hooks/useTheme';

export default function PlayScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;

  const present = useGameStore((s) => s.present);
  const selectRoll = useGameStore((s) => s.selectRoll);
  const selectDoubles = useGameStore((s) => s.selectDoubles);
  const pullOut = useGameStore((s) => s.pullOut);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const renamePlayer = useGameStore((s) => s.renamePlayer);
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const resetAll = useGameStore((s) => s.resetAll);
  const canUndo = useGameStore((s) => s.canUndo());
  const canRedo = useGameStore((s) => s.canRedo());

  const [newPlayerName, setNewPlayerName] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [allowLeave, setAllowLeave] = useState(false);
  const [addFocused, setAddFocused] = useState(false);

  useEffect(() => {
    if (!present) {
      router.replace('/');
    }
  }, [present]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (allowLeave || present?.status !== 'playing') {
        return;
      }

      e.preventDefault();

      Alert.alert(
        'End game?',
        'Are you sure you want to end the game? All progress will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'End game',
            style: 'destructive',
            onPress: () => {
              setAllowLeave(true);
              resetAll();
              navigation.dispatch(e.data.action);
            },
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, present?.status, allowLeave, resetAll]);

  if (!present) {
    return null;
  }

  const isPlaying = present.status === 'playing';
  const roundLabel = getGameStatusLabel(
    present.status,
    present.currentRound,
    present.totalRounds,
  );

  const sortedByScore = [...present.players].sort((a, b) => b.score - a.score);
  const liveMessage = [
    roundLabel,
    `Pot ${present.pot}`,
    present.lastEvent,
    present.status === 'finished' && sortedByScore[0]
      ? `Winner ${sortedByScore[0].name} with ${sortedByScore[0].score}`
      : undefined,
  ]
    .filter(Boolean)
    .join('. ');

  const orderedPlayers = [...present.players].sort((a, b) => {
    if (a.pulledOutThisRound === b.pulledOutThisRound) return 0;
    return a.pulledOutThisRound ? 1 : -1;
  });

  const startNewGameFromSummary = () => {
    setAllowLeave(true);
    router.replace({
      pathname: '/setup',
      params: {
        names: JSON.stringify(present.players.map((player) => player.name)),
        rounds: String(present.totalRounds),
      },
    });
  };

  const handleAddPlayer = () => {
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;
    addPlayer(trimmed);
    setNewPlayerName('');
  };

  const requestEndGame = () => {
    if (present.status !== 'playing') {
      setAllowLeave(true);
      resetAll();
      router.replace('/');
      return;
    }

    Alert.alert(
      'End game?',
      'Are you sure you want to end the game? All progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End game',
          style: 'destructive',
          onPress: () => {
            setAllowLeave(true);
            resetAll();
            router.replace('/');
          },
        },
      ],
    );
  };

  const toolbar = (
    <View style={styles.toolbar}>
      <PressableScale
        onPress={undo}
        disabled={!canUndo}
        feedback="selection"
        accessibilityRole="button"
        accessibilityLabel="Undo"
        scaleTo={Motion.pressScale.chip}
        style={[styles.toolBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
      >
        <Text style={[styles.toolIcon, { color: canUndo ? colors.text : colors.textMuted }]}>↶</Text>
        <Text style={[styles.toolText, { color: canUndo ? colors.text : colors.textMuted }]}>Undo</Text>
      </PressableScale>
      <PressableScale
        onPress={redo}
        disabled={!canRedo}
        feedback="selection"
        accessibilityRole="button"
        accessibilityLabel="Redo"
        scaleTo={Motion.pressScale.chip}
        style={[styles.toolBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
      >
        <Text style={[styles.toolText, { color: canRedo ? colors.text : colors.textMuted }]}>Redo</Text>
        <Text style={[styles.toolIcon, { color: canRedo ? colors.text : colors.textMuted }]}>↷</Text>
      </PressableScale>
    </View>
  );

  const leftPane = (
    <View style={styles.leftPane}>
      {toolbar}

      <PotDisplay
        pot={present.pot}
        roundLabel={roundLabel}
        currentRound={present.currentRound}
        status={present.status}
        rollsThisRound={present.rollsThisRound}
        lastEvent={present.lastEvent}
        lastRollNumber={present.lastRollNumber}
        sevenOut={present.sevenOutHighlight}
        openingPhase={isPlaying && isInOpeningPhase(present.rollsThisRound)}
      />

      {isPlaying && (
        <NumberPad
          rollsThisRound={present.rollsThisRound}
          onSelect={selectRoll}
          onSelectDoubles={selectDoubles}
        />
      )}
    </View>
  );

  const rightPane = (
    <View style={[styles.rightPane, !isTablet && { marginTop: -Spacing.xs }]}>
      <ThemedText variant="label" muted style={styles.playersLabel}>
        Players
      </ThemedText>

      {orderedPlayers.map((player, index) => (
        <StaggerIn key={player.id} index={index}>
          <PlayerRow
            player={player}
            canRemove={present.players.length > 2}
            canPullOut={isPlaying}
            onPullOut={() => pullOut(player.id)}
            onRemove={() => removePlayer(player.id)}
            onRename={(name) => renamePlayer(player.id, name)}
          />
        </StaggerIn>
      ))}

      {isPlaying && (
        <View style={styles.addPlayerRow}>
          <TextInput
            value={newPlayerName}
            onChangeText={setNewPlayerName}
            placeholder="Add player"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.addInput,
              {
                color: colors.text,
                borderColor: addFocused ? colors.text : colors.border,
                backgroundColor: colors.surface,
              },
            ]}
            onFocus={() => setAddFocused(true)}
            onBlur={() => setAddFocused(false)}
            accessibilityLabel="Add player name"
            onSubmitEditing={handleAddPlayer}
          />
          <Button
            label="Add"
            onPress={handleAddPlayer}
            compact
            disabled={!newPlayerName.trim()}
            feedback="selection"
          />
        </View>
      )}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={
          present.status === 'finished'
            ? { headerShown: false, gestureEnabled: true }
            : {
                title: 'Ride the Rocket',
                headerTitleAlign: 'center',
                headerBackVisible: false,
                gestureEnabled: false,
                headerLeft: () => (
                  <PressableScale
                    onPress={requestEndGame}
                    hitSlop={12}
                    feedback="selection"
                    accessibilityRole="button"
                    accessibilityLabel="End game"
                    scaleTo={Motion.pressScale.chip}
                    style={styles.closeHit}
                  >
                    <Text style={[styles.closeX, { color: colors.text }]}>×</Text>
                  </PressableScale>
                ),
                headerRight: () => (
                  <PressableScale
                    onPress={() => setRulesOpen(true)}
                    hitSlop={12}
                    feedback="selection"
                    accessibilityRole="button"
                    accessibilityLabel="Open rules"
                    scaleTo={Motion.pressScale.chip}
                    style={styles.rulesHit}
                  >
                    <Text style={[styles.rulesLabel, { color: colors.text }]}>Rules</Text>
                  </PressableScale>
                ),
              }
        }
      />
      <RulesModal visible={rulesOpen} onClose={() => setRulesOpen(false)} />
      <LiveRegion message={liveMessage} />
      <SafeAreaView
        style={styles.flex}
        edges={present.status === 'finished' ? ['top', 'bottom'] : ['bottom']}
      >
        {present.status === 'finished' ? (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, styles.summaryContent]}
            showsVerticalScrollIndicator={false}
          >
            <FinalStandings
              players={present.players}
              roundStats={present.roundStats ?? []}
              onNewGame={startNewGameFromSummary}
            />
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              !isTablet && { paddingBottom: height * 0.12 },
            ]}
          >
            {isTablet ? (
              <View style={styles.tabletRow}>
                <View style={styles.tabletColumn}>{leftPane}</View>
                <View style={styles.tabletColumn}>{rightPane}</View>
              </View>
            ) : (
              <>
                {leftPane}
                {rightPane}
              </>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    maxWidth: 1100,
    alignSelf: 'center',
    width: '100%',
  },
  summaryContent: {
    maxWidth: 560,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  toolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: 40,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.sm,
  },
  toolIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
  toolText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  closeHit: {
    minWidth: 64,
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  closeX: {
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 30,
  },
  rulesHit: {
    minWidth: 64,
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  rulesLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  tabletRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    alignItems: 'flex-start',
  },
  tabletColumn: {
    flex: 1,
  },
  leftPane: {
    marginBottom: Spacing.sm,
  },
  rightPane: {
    marginTop: Spacing.sm,
  },
  playersLabel: {
    marginBottom: Spacing.xs,
  },
  addPlayerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  addInput: {
    flex: 1,
    borderWidth: 2,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
  },
});
