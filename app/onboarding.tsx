import { router, Stack } from 'expo-router';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/Button';
import { RulesContent } from '../src/components/RulesContent';
import { ThemedText, ThemedView } from '../src/components/Themed';
import { FontSize, Spacing } from '../src/constants/theme';
import { useGameStore } from '../src/game/gameStore';

export default function OnboardingScreen() {
  const completeOnboarding = useGameStore((s) => s.completeOnboarding);
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;

  const finish = () => {
    completeOnboarding();
    router.replace('/');
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            isTablet && styles.scrollTablet,
            isTablet && isLandscape && styles.scrollLandscape,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <ThemedText variant="label" muted>
              How to play
            </ThemedText>
            <ThemedText variant="title" style={styles.title}>
              Ride the Rocket
            </ThemedText>
            <ThemedText muted style={styles.lead}>
              You’ll need two dice to play. One phone keeps score.
            </ThemedText>
          </View>

          <RulesContent />

          <View style={styles.cta}>
            <Button label="Got it — let’s play" variant="blue" onPress={finish} />
          </View>
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
  },
  scrollTablet: {
    maxWidth: 640,
    paddingTop: Spacing.xxl,
  },
  scrollLandscape: {
    maxWidth: 720,
    paddingHorizontal: Spacing.xl,
  },
  hero: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  lead: {
    fontSize: FontSize.md,
    lineHeight: 24,
    marginTop: Spacing.xs,
  },
  cta: {
    marginTop: Spacing.md,
  },
});
