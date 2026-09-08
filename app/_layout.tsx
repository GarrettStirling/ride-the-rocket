import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { Colors } from '../src/constants/theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerBackTitle: 'Back',
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700', color: colors.text },
          headerStyle: { backgroundColor: colors.background },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="setup" options={{ title: 'New Game' }} />
        <Stack.Screen name="play" options={{ title: 'Ride the Rocket' }} />
      </Stack>
    </>
  );
}
