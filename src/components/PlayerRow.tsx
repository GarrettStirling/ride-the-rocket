import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { BorderRadius, FontSize, Motion, Spacing } from '../constants/theme';
import type { Player } from '../game/types';
import { useTheme } from '../hooks/useTheme';
import { fadeTiming, swiftTiming } from '../motion';
import { BumpText } from './BumpText';
import { Button } from './Button';
import { PressableScale } from './PressableScale';

function isPlaceholderPlayerName(name: string): boolean {
  return /^Player \d+$/i.test(name.trim());
}

interface PlayerRowProps {
  player: Player;
  canRemove: boolean;
  canPullOut: boolean;
  onPullOut: () => void;
  onRemove: () => void;
  onRename: (name: string) => void;
}

export function PlayerRow({
  player,
  canRemove,
  canPullOut,
  onPullOut,
  onRemove,
  onRename,
}: PlayerRowProps) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const pulled = useSharedValue(player.pulledOutThisRound ? 1 : 0);
  const [focused, setFocused] = useState(false);
  const nameAtFocus = useRef(player.name);

  useEffect(() => {
    pulled.value = withTiming(player.pulledOutThisRound ? 1 : 0, reduced ? fadeTiming : swiftTiming);
  }, [player.pulledOutThisRound, reduced, pulled]);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: 1 - pulled.value * 0.22,
  }));

  const washStyle = useAnimatedStyle(() => ({
    opacity: pulled.value,
  }));

  const confirmRemove = () => {
    if (!canRemove) {
      Alert.alert('Cannot remove', 'You need at least two players in the game.');
      return;
    }
    Alert.alert('Remove player?', `Are you sure you want to remove ${player.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: onRemove },
    ]);
  };

  return (
    <Animated.View style={[styles.row, { borderBottomColor: colors.hairline }, rowStyle]}>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.pulledOut }, washStyle]}
      />

      <View style={styles.identity}>
        <TextInput
          value={player.name}
          onChangeText={onRename}
          selectTextOnFocus={isPlaceholderPlayerName(player.name)}
          onFocus={() => {
            setFocused(true);
            nameAtFocus.current = player.name;
          }}
          onBlur={() => {
            setFocused(false);
            if (!player.name.trim()) {
              onRename(nameAtFocus.current || 'Player');
            }
          }}
          style={[
            styles.nameInput,
            {
              color: colors.text,
              borderColor: focused ? colors.text : 'transparent',
            },
          ]}
          placeholder="Name"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={`${player.name} name`}
        />
        <BumpText
          value={player.score}
          accessibilityLabel={`${player.name} score ${player.score}${player.pulledOutThisRound ? ', pulled out' : ''}`}
          style={[styles.score, { color: colors.text }]}
        />
      </View>
      {player.pulledOutThisRound ? (
        <Text style={[styles.outTag, { color: colors.textMuted }]}>Pulled Out</Text>
      ) : null}

      {!player.pulledOutThisRound ? (
        <Button
          label="Pull Out"
          onPress={onPullOut}
          disabled={!canPullOut}
          compact
          variant="blue"
          feedback="success"
          style={styles.pullOut}
        />
      ) : (
        <View style={styles.pullOutPlaceholder} />
      )}

      <PressableScale
        onPress={confirmRemove}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${player.name}`}
        feedback="selection"
        hitSlop={10}
        scaleTo={Motion.pressScale.chip}
        style={[
          styles.removeButton,
          {
            borderColor: colors.border,
            opacity: canRemove ? 1 : 0.35,
          },
        ]}
      >
        <Text style={[styles.removeX, { color: colors.text }]}>×</Text>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
    overflow: 'hidden',
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: 0,
  },
  nameInput: {
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 72,
    maxWidth: 160,
    fontSize: FontSize.md,
    fontWeight: '600',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  score: {
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    fontSize: FontSize.lg,
  },
  outTag: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  pullOut: {
    minWidth: 92,
  },
  pullOutPlaceholder: {
    minWidth: 92,
  },
  removeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  removeX: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 22,
    marginTop: -1,
  },
});
