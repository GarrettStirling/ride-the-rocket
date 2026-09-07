import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/Button';
import { PressableScale } from '../src/components/PressableScale';
import { StaggerIn } from '../src/components/StaggerIn';
import { ThemedText, ThemedView } from '../src/components/Themed';
import { BorderRadius, FontSize, Motion, Spacing } from '../src/constants/theme';
import { useGameStore } from '../src/game/gameStore';
import type { RoundCount } from '../src/game/types';
import { useTheme } from '../src/hooks/useTheme';

const EMPTY_NAMES = ['', ''];

function isPlaceholderPlayerName(name: string): boolean {
  return /^Player \d+$/i.test(name.trim());
}

function namesFromParams(raw: string | string[] | undefined): string[] {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return EMPTY_NAMES;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (
      Array.isArray(parsed) &&
      parsed.length >= 2 &&
      parsed.every((name) => typeof name === 'string')
    ) {
      return parsed.map((name) => {
        const trimmed = name.trim();
        return isPlaceholderPlayerName(trimmed) ? '' : trimmed;
      });
    }
  } catch {
    return EMPTY_NAMES;
  }
  return EMPTY_NAMES;
}

function roundsFromParams(raw: string | string[] | undefined): RoundCount {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === '10' ? 10 : 20;
}

export default function SetupScreen() {
  const { colors } = useTheme();
  const startGame = useGameStore((s) => s.startGame);
  const params = useLocalSearchParams<{ names?: string | string[]; rounds?: string | string[] }>();
  const [names, setNames] = useState<string[]>(() => namesFromParams(params.names));
  const [rounds, setRounds] = useState<RoundCount>(() => roundsFromParams(params.rounds));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const updateName = (index: number, value: string) => {
    setNames((prev) => prev.map((name, i) => (i === index ? value : name)));
  };

  const addPlayer = () => {
    setNames((prev) => [...prev, '']);
  };

  const removePlayer = (index: number) => {
    if (names.length <= 2) return;
    setNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStart = () => {
    const validNames = names.map((n, i) => n.trim() || `Player ${i + 1}`);
    if (validNames.length < 2) return;
    startGame(validNames, rounds);
    router.replace('/play');
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.flex} edges={['bottom']}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <ThemedText variant="label" muted>
              Players
            </ThemedText>
            <ThemedText variant="caption" muted style={styles.hint}>
              At least two players. You can rename or add more during the game.
            </ThemedText>

            {names.map((name, index) => (
              <StaggerIn key={index} index={index} style={styles.nameRow}>
                <TextInput
                  value={name}
                  onChangeText={(value) => updateName(index, value)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex((current) => (current === index ? null : current))}
                  accessibilityLabel={`Player ${index + 1} name`}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.surface,
                      borderColor: focusedIndex === index ? colors.text : colors.border,
                    },
                  ]}
                  placeholder={`Player ${index + 1}`}
                  placeholderTextColor={colors.textMuted}
                />
                {names.length > 2 && (
                  <PressableScale
                    onPress={() => removePlayer(index)}
                    feedback="selection"
                    accessibilityRole="button"
                    accessibilityLabel={`Remove player ${index + 1}`}
                    scaleTo={Motion.pressScale.chip}
                    style={styles.remove}
                  >
                    <ThemedText style={{ color: colors.textMuted, fontSize: 22 }}>×</ThemedText>
                  </PressableScale>
                )}
              </StaggerIn>
            ))}

            <Button label="Add player" variant="secondary" onPress={addPlayer} compact feedback="selection" />

            <View style={styles.roundSection}>
              <ThemedText variant="label" muted>
                Rounds
              </ThemedText>
              <View style={styles.roundRow}>
                {([10, 20] as RoundCount[]).map((value) => {
                  const selected = rounds === value;
                  return (
                    <PressableScale
                      key={value}
                      onPress={() => setRounds(value)}
                      selected={selected}
                      feedback="selection"
                      accessibilityRole="radio"
                      accessibilityLabel={`${value} rounds`}
                      scaleTo={Motion.pressScale.chip}
                      style={[
                        styles.roundChip,
                        {
                          backgroundColor: selected ? colors.accent : colors.surface,
                          borderColor: selected ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      <ThemedText
                        style={{
                          color: selected ? colors.accentText : colors.text,
                          fontWeight: '600',
                          fontSize: FontSize.lg,
                        }}
                      >
                        {value}
                      </ThemedText>
                    </PressableScale>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              label="Start game"
              variant="blue"
              onPress={handleStart}
              disabled={names.length < 2}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    maxWidth: 560,
    alignSelf: 'center',
    width: '100%',
  },
  hint: {
    marginBottom: Spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  input: {
    flex: 1,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
  },
  remove: {
    padding: Spacing.sm,
    width: 36,
    alignItems: 'center',
  },
  roundSection: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  roundRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  roundChip: {
    flex: 1,
    borderWidth: 2,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  footer: {
    padding: Spacing.lg,
    maxWidth: 560,
    alignSelf: 'center',
    width: '100%',
  },
});
