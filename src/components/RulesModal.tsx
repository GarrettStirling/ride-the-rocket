import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { BorderRadius, FontSize, Motion, Spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { PressableScale } from './PressableScale';
import { ThemedText } from './Themed';

interface RulesModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RulesModal({ visible, onClose }: RulesModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}
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
            <RuleBlock title="Opening (first 3 rolls)">
              Tap the dice total. A 7 adds 70. The 2× button is disabled — doubles don’t double yet.
            </RuleBlock>
            <RuleBlock title="After opening">
              Tap the total for a normal roll. Tap 2× for doubles (doubles the pot). A 7 ends the
              round and the pot is lost. From roll 4 on, the 2 key is disabled — use 2× for snake
              eyes.
            </RuleBlock>
            <RuleBlock title="Pull out">
              Any active player can pull out anytime to take the current pot, then sits out the rest
              of the round. The pot resets to 0 for everyone still in.
            </RuleBlock>
            <RuleBlock title="End of round">
              Round ends on a deadly 7, or when everyone has pulled out. Highest score after 10 or 20
              rounds wins.
            </RuleBlock>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function RuleBlock({ title, children }: { title: string; children: string }) {
  return (
    <View style={styles.block}>
      <ThemedText variant="label" muted style={styles.blockTitle}>
        {title}
      </ThemedText>
      <ThemedText style={styles.blockBody}>{children}</ThemedText>
    </View>
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
    borderWidth: StyleSheet.hairlineWidth,
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
  block: {
    marginBottom: Spacing.lg,
  },
  blockTitle: {
    marginBottom: Spacing.xs,
  },
  blockBody: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
});
