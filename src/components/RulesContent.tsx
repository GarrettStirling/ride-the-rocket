import { StyleSheet, View } from 'react-native';
import { FontSize, Spacing } from '../constants/theme';
import { ThemedText } from './Themed';

const SECTIONS: { title: string; bullets: string[] }[] = [
  {
    title: 'What you need',
    bullets: [
      'Two standard dice',
      '2+ players',
      'One phone as scorekeeper',
    ],
  },
  {
    title: 'Each roll',
    bullets: [
      'Players take turns rolling; tap the matching key associated with each roll',
      'The pot is the round total. It starts blue for the first 3 rolls.',
    ],
  },
  {
    title: 'Opening (first 3 rolls)',
    bullets: [
      'Tap the dice total to add it to the pot',
      'Rolling a 7 adds 70 to the pot',
      '2× is disabled',
    ],
  },
  {
    title: 'After opening (roll 4+)',
    bullets: [
      'Tap the dice total for a normal roll',
      'Doubles: tap 2× to double the pot',
      'A 7 ends the round; the pot is lost',
    ],
  },
  {
    title: 'Pull out',
    bullets: [
      'From roll 4 on, tap Pull out to take the current pot',
      'That player sits out the rest of the round',
      'The pot stays — everyone still in keeps riding from that same total',
    ],
  },
  {
    title: 'End of round & winning',
    bullets: [
      'Round ends on a deadly 7, or when everyone has pulled out',
      'After all rounds, highest total score wins',
      'Undo / Redo fixes wrong taps; you can add or remove players anytime (min 2)',
    ],
  },
];

interface RulesContentProps {
  /** Skip the “What you need” block when dice are already covered elsewhere. */
  omitNeed?: boolean;
}

export function RulesContent({ omitNeed = false }: RulesContentProps) {
  const sections = omitNeed ? SECTIONS.filter((s) => s.title !== 'What you need') : SECTIONS;

  return (
    <View>
      {sections.map((section) => (
        <View key={section.title} style={styles.block}>
          <ThemedText variant="label" muted style={styles.blockTitle}>
            {section.title}
          </ThemedText>
          {section.bullets.map((bullet) => (
            <View key={bullet} style={styles.bulletRow}>
              <ThemedText style={styles.bulletMark}>•</ThemedText>
              <ThemedText style={styles.bulletText}>{bullet}</ThemedText>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: Spacing.lg,
  },
  blockTitle: {
    marginBottom: Spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xs + 2,
  },
  bulletMark: {
    fontSize: FontSize.md,
    lineHeight: 22,
    width: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
});
