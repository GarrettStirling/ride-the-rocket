import { StyleSheet, Text, type ViewStyle } from 'react-native';
import { BorderRadius, FontSize, Motion, Spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import type { FeedbackEvent } from '../hooks/useFeedback';
import { PressableScale } from './PressableScale';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'blue';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  compact?: boolean;
  style?: ViewStyle;
  feedback?: FeedbackEvent;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  compact,
  style,
  feedback = 'action',
}: ButtonProps) {
  const { colors } = useTheme();

  const palette = {
    primary: { bg: colors.accent, text: colors.accentText },
    secondary: { bg: colors.surface, text: colors.text },
    ghost: { bg: 'transparent', text: colors.text },
    danger: { bg: colors.danger, text: colors.dangerText },
    blue: { bg: colors.blue, text: colors.blueText },
  }[variant];

  const bg = disabled ? colors.surface : palette.bg;
  const fg = disabled ? colors.textMuted : palette.text;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      feedback={disabled ? undefined : feedback}
      onPress={onPress}
      scaleTo={compact ? Motion.pressScale.chip : Motion.pressScale.default}
      style={[
        styles.base,
        compact && styles.compact,
        { backgroundColor: bg },
        style,
      ]}
    >
      <Text style={[styles.label, { color: fg }, compact && styles.compactLabel]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  compact: {
    minHeight: 36,
    paddingHorizontal: Spacing.md,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  compactLabel: {
    fontSize: FontSize.sm,
  },
});
