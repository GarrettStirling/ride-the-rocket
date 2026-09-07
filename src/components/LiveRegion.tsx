import { useEffect, useRef } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

interface LiveRegionProps {
  message?: string;
}

/**
 * Announces dynamic game updates to screen readers.
 * Android: accessibilityLiveRegion. iOS: announceForAccessibility.
 */
export function LiveRegion({ message }: LiveRegionProps) {
  const lastAnnounced = useRef<string | undefined>(undefined);
  const didMount = useRef(false);

  useEffect(() => {
    const next = message?.trim();
    if (!next || next === lastAnnounced.current) return;

    // Skip the first paint so opening a screen isn't a noisy announcement.
    if (!didMount.current) {
      didMount.current = true;
      lastAnnounced.current = next;
      return;
    }

    lastAnnounced.current = next;
    AccessibilityInfo.announceForAccessibility(next);
  }, [message]);

  if (!message) return null;

  return (
    <View
      accessible
      accessibilityLiveRegion="polite"
      accessibilityRole="text"
      accessibilityLabel={message}
      importantForAccessibility="yes"
      pointerEvents="none"
      style={styles.hidden}
    />
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
});
