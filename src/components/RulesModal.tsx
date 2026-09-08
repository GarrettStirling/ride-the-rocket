import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { BorderRadius, Motion, Spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { PressableScale } from './PressableScale';
import { RulesContent } from './RulesContent';
import { ThemedText } from './Themed';

interface RulesModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RulesModal({ visible, onClose }: RulesModalProps) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              maxWidth: isTablet ? (isLandscape ? 720 : 560) : undefined,
              alignSelf: 'center',
              width: '100%',
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <ThemedText variant="subtitle">Rules</ThemedText>
            <PressableScale
              onPress={onClose}
              hitSlop={12}
              feedback="selection"
              accessibilityRole="button"
              accessibilityLabel="Close rules"
              scaleTo={Motion.pressScale.chip}
              style={styles.closeBtn}
            >
              <ThemedText style={{ color: colors.text, fontWeight: '600' }}>Close</ThemedText>
            </PressableScale>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <RulesContent />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  sheet: {
    maxHeight: '80%',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  closeBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  body: {
    gap: Spacing.md,
  },
});
