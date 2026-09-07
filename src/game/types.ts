export type RoundCount = 10 | 20;

export type GameStatus = 'idle' | 'playing' | 'finished';

export interface Player {
  id: string;
  name: string;
  score: number;
  pulledOutThisRound: boolean;
}

export interface RoundStat {
  round: number;
  /** Highest pot reached during the round. */
  peakPot: number;
  rolls: number;
}

export interface GameSnapshot {
  players: Player[];
  totalRounds: RoundCount;
  currentRound: number;
  pot: number;
  rollsThisRound: number;
  status: GameStatus;
  lastEvent?: string;
  /** Dice total / action for the most recent input (e.g. 7 or "2×"). */
  lastRollLabel?: string;
  /** Roll index within the round that produced lastRollLabel (1-based). */
  lastRollNumber?: number;
  /** True after a deadly seven ended the previous round. */
  sevenOutHighlight: boolean;
  startedAt: number;
  /** Peak pot so far in the active round. */
  currentPeakPot: number;
  /** Completed round highlights. */
  roundStats: RoundStat[];
}

export interface GameHistoryEntry {
  id: string;
  finishedAt: number;
  totalRounds: RoundCount;
  playerNames: string[];
  scores: { name: string; score: number }[];
}
