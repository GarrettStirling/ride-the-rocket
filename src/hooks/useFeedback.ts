import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

/**
 * Semantic feedback events.
 * - selection: chips, toggles, light UI choices
 * - action: keys, primary buttons
 * - success: pull-out, completed round action
 * - error: invalid tap, deadly 7
 */
export type FeedbackEvent = 'selection' | 'action' | 'success' | 'error';

export type SoundPlayer = (event: FeedbackEvent) => void;

let soundPlayer: SoundPlayer = () => {};

/** Register audio later (expo-av, etc.) without touching UI call sites. */
export function setSoundPlayer(player: SoundPlayer | null) {
  soundPlayer = player ?? (() => {});
}

export function playSound(event: FeedbackEvent) {
  soundPlayer(event);
}

function swallow(promise: Promise<unknown>) {
  promise.catch(() => {});
}

/** expo-haptics maps to Taptic Engine (iOS), Vibrator (Android), and the Web Vibration API. */
export function triggerHaptic(event: FeedbackEvent) {
  switch (event) {
    case 'selection':
      swallow(Haptics.selectionAsync());
      break;
    case 'action':
      swallow(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
      break;
    case 'success':
      swallow(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
      break;
    case 'error':
      swallow(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
      break;
  }
}

export function triggerFeedback(event: FeedbackEvent) {
  triggerHaptic(event);
  playSound(event);
}

export function useFeedback() {
  const trigger = useCallback((event: FeedbackEvent) => {
    triggerFeedback(event);
  }, []);

  return { trigger, haptic: triggerHaptic, playSound };
}
