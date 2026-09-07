import { useColorScheme } from 'react-native';
import { Colors, type ColorScheme } from '../constants/theme';

export function useTheme() {
  const scheme = useColorScheme();
  const colorScheme: ColorScheme = scheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  return { colorScheme, colors, isDark: colorScheme === 'dark' };
}
