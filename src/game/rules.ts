export const OPENING_ROLLS = 3;
export const OPENING_SEVEN_BONUS = 70;
export const SNAKE_EYES_VALUE = 2;
export const BOXCARS_VALUE = 12;

export function rollValues(): number[] {
  return Array.from({ length: 11 }, (_, i) => i + 2);
}

export function isInOpeningPhase(rollsThisRound: number): boolean {
  return rollsThisRound < OPENING_ROLLS;
}

/** 2 and 12 are always doubles — after opening, use 2× instead. */
export function isPureDoublesValue(value: number): boolean {
  return value === SNAKE_EYES_VALUE || value === BOXCARS_VALUE;
}

export function isPureDoublesKeyDisabled(rollsThisRound: number): boolean {
  return rollsThisRound >= OPENING_ROLLS;
}

export function isTwoDisabled(rollsThisRound: number): boolean {
  return isPureDoublesKeyDisabled(rollsThisRound);
}

export function isDoublesDisabled(rollsThisRound: number): boolean {
  return rollsThisRound < OPENING_ROLLS;
}
