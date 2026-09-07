import { StyleSheet, Text, TextProps, View, ViewProps } from 'react-native';
import { FontSize } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

export function ThemedView({ style, ...props }: ViewProps) {
  const { colors } = useTheme();
  return <View style={[{ backgroundColor: colors.background }, style]} {...props} />;
}

interface ThemedTextProps extends TextProps {
  variant?: 'title' | 'subtitle' | 'body' | 'caption' | 'label';
  muted?: boolean;
}

export function ThemedText({ style, variant = 'body', muted, ...props }: ThemedTextProps) {
  const { colors } = useTheme();

  const variantStyle = {
    title: { fontSize: FontSize.xl, fontWeight: '700' as const, letterSpacing: -0.5 },
    subtitle: { fontSize: FontSize.lg, fontWeight: '600' as const },
    body: { fontSize: FontSize.md, fontWeight: '400' as const },
    caption: { fontSize: FontSize.sm, fontWeight: '400' as const },
    label: {
      fontSize: FontSize.xs,
      fontWeight: '600' as const,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
    },
  }[variant];

  return (
    <Text
      style={[
        { color: muted ? colors.textMuted : colors.text },
        variantStyle,
        style,
      ]}
      {...props}
    />
  );
}

export function useThemedStyles() {
  const { colors } = useTheme();

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    surface: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 12,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
  });
}
