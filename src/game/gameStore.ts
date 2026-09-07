import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { isInOpeningPhase, isPureDoublesValue, OPENING_ROLLS, OPENING_SEVEN_BONUS } from './rules';
import type { GameHistoryEntry, GameSnapshot, GameStatus, Player, RoundCount } from './types';

const MAX_HISTORY = 20;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function cloneSnapshot(snapshot: GameSnapshot): GameSnapshot {
  return {
    ...snapshot,
    players: snapshot.players.map((player) => ({ ...player })),
    roundStats: (snapshot.roundStats ?? []).map((stat) => ({ ...stat })),
  };
}

function createInitialSnapshot(totalRounds: RoundCount, playerNames: string[]): GameSnapshot {
  return {
    players: playerNames.map((name) => ({
      id: generateId(),
      name: name.trim(),
      score: 0,
      pulledOutThisRound: false,
    })),
    totalRounds,
    currentRound: 1,
    pot: 0,
    rollsThisRound: 0,
    status: 'playing',
    lastEvent: undefined,
    lastRollLabel: undefined,
    lastRollNumber: undefined,
    sevenOutHighlight: false,
    startedAt: Date.now(),
    currentPeakPot: 0,
    roundStats: [],
  };
}

function toHistoryEntry(snapshot: GameSnapshot): GameHistoryEntry {
  const scores = [...snapshot.players]
    .map((p) => ({ name: p.name, score: p.score }))
    .sort((a, b) => b.score - a.score);

  return {
    id: generateId(),
    finishedAt: Date.now(),
    totalRounds: snapshot.totalRounds,
    playerNames: snapshot.players.map((p) => p.name),
    scores,
  };
}

function activePlayers(players: Player[]): Player[] {
  return players.filter((player) => !player.pulledOutThisRound);
}

function resetRound(
  snapshot: GameSnapshot,
  message: string,
  extras: Partial<GameSnapshot> = {},
): GameSnapshot {
  const nextRound = snapshot.currentRound + 1;
  const finished = nextRound > snapshot.totalRounds;
  const rolls = extras.lastRollNumber ?? snapshot.rollsThisRound;
  const peakPot = Math.max(snapshot.currentPeakPot, snapshot.pot);
  const roundStats = [
    ...(snapshot.roundStats ?? []),
    {
      round: snapshot.currentRound,
      peakPot,
      rolls,
    },
  ];

  const { roundStats: _ignoredStats, currentPeakPot: _ignoredPeak, ...safeExtras } = extras;

  return {
    ...snapshot,
    ...safeExtras,
    currentRound: finished ? snapshot.currentRound : nextRound,
    pot: 0,
    rollsThisRound: 0,
    currentPeakPot: 0,
    roundStats,
    status: finished ? 'finished' : snapshot.status,
    players: snapshot.players.map((player) => ({
      ...player,
      pulledOutThisRound: false,
    })),
    lastEvent: finished ? message : undefined,
    lastRollLabel: finished ? (safeExtras.lastRollLabel ?? snapshot.lastRollLabel) : undefined,
    lastRollNumber: finished ? (safeExtras.lastRollNumber ?? snapshot.lastRollNumber) : undefined,
  };
}

function withPeakPot(snapshot: GameSnapshot, pot: number): GameSnapshot {
  return {
    ...snapshot,
    pot,
    currentPeakPot: Math.max(snapshot.currentPeakPot ?? 0, pot),
  };
}

function maybeEndRoundIfEveryoneOut(
  snapshot: GameSnapshot,
  message: string,
): { snapshot: GameSnapshot; endedRound: boolean } {
  if (activePlayers(snapshot.players).length === 0) {
    return {
      snapshot: resetRound(snapshot, message, { sevenOutHighlight: false }),
      endedRound: true,
    };
  }
  return { snapshot, endedRound: false };
}

function applyRoll(snapshot: GameSnapshot, value: number): { snapshot: GameSnapshot; endedRound: boolean } {
  const inOpening = isInOpeningPhase(snapshot.rollsThisRound);
  let pot = snapshot.pot;
  const rollNumber = snapshot.rollsThisRound + 1;
  const rollsThisRound = rollNumber;
  const lastRollLabel = String(value);
  let lastEvent = `Rolled ${value}`;

  if (value === 7 && !inOpening) {
    return {
      snapshot: resetRound(
        withPeakPot(snapshot, snapshot.pot),
        `Rolled 7`,
        {
          lastRollLabel: '7',
          lastRollNumber: rollNumber,
          sevenOutHighlight: true,
        },
      ),
      endedRound: true,
    };
  }

  if (value === 7 && inOpening) {
    pot += OPENING_SEVEN_BONUS;
    lastEvent = `Rolled 7`;
  } else {
    pot += value;
  }

  return maybeEndRoundIfEveryoneOut(
    {
      ...withPeakPot(snapshot, pot),
      rollsThisRound,
      lastEvent,
      lastRollLabel,
      lastRollNumber: rollNumber,
      sevenOutHighlight: false,
    },
    'Everyone pulled out',
  );
}

function applyDoubles(snapshot: GameSnapshot): { snapshot: GameSnapshot; endedRound: boolean } {
  const rollNumber = snapshot.rollsThisRound + 1;
  const pot = snapshot.pot * 2;

  return maybeEndRoundIfEveryoneOut(
    {
      ...withPeakPot(snapshot, pot),
      rollsThisRound: rollNumber,
      lastEvent: 'Doubles',
      lastRollLabel: '2×',
      lastRollNumber: rollNumber,
      sevenOutHighlight: false,
    },
    'Everyone pulled out',
  );
}

interface GameStore {
  present: GameSnapshot | null;
  past: GameSnapshot[];
  future: GameSnapshot[];
  gameHistory: GameHistoryEntry[];

  hasActiveGame: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;

  startGame: (playerNames: string[], totalRounds: RoundCount) => void;
  resetAll: () => void;
  archivePresentIfFinished: () => void;
  selectRoll: (value: number) => void;
  selectDoubles: () => void;
  pullOut: (playerId: string) => void;
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  renamePlayer: (playerId: string, name: string) => void;
  undo: () => void;
  redo: () => void;
}

function pushHistory(entry: GameHistoryEntry, history: GameHistoryEntry[]): GameHistoryEntry[] {
  return [entry, ...history].slice(0, MAX_HISTORY);
}

function archiveFinished(
  present: GameSnapshot | null,
  history: GameHistoryEntry[],
): GameHistoryEntry[] {
  if (!present || present.status !== 'finished') return history;
  const already = history.some(
    (h) =>
      h.finishedAt >= present.startedAt &&
      h.playerNames.join('|') === present.players.map((p) => p.name).join('|'),
  );
  if (already) return history;
  return pushHistory(toHistoryEntry(present), history);
}

function commit(snapshot: GameSnapshot, set: (partial: Partial<GameStore>) => void, get: () => GameStore) {
  const { present, past, gameHistory } = get();
  if (!present) return;

  let nextHistory = gameHistory;
  if (snapshot.status === 'finished' && present.status !== 'finished') {
    nextHistory = pushHistory(toHistoryEntry(snapshot), gameHistory);
  }

  set({
    past: [...past, cloneSnapshot(present)],
    future: [],
    present: cloneSnapshot(snapshot),
    gameHistory: nextHistory,
  });
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      present: null,
      past: [],
      future: [],
      gameHistory: [],

      hasActiveGame: () => {
        const { present } = get();
        return present !== null && present.status !== 'idle';
      },

      canUndo: () => get().past.length > 0,
      canRedo: () => get().future.length > 0,

      startGame: (playerNames, totalRounds) => {
        const names = playerNames.map((n) => n.trim()).filter(Boolean);
        if (names.length < 2) return;

        const { present, gameHistory } = get();
        const nextHistory = archiveFinished(present, gameHistory);

        set({
          present: createInitialSnapshot(totalRounds, names),
          past: [],
          future: [],
          gameHistory: nextHistory,
        });
      },

      resetAll: () => {
        const { present, gameHistory } = get();
        set({
          present: null,
          past: [],
          future: [],
          gameHistory: archiveFinished(present, gameHistory),
        });
      },

      archivePresentIfFinished: () => {
        const { present, gameHistory } = get();
        set({ gameHistory: archiveFinished(present, gameHistory) });
      },

      selectRoll: (value) => {
        const { present } = get();
        if (!present || present.status !== 'playing') return;
        if (activePlayers(present.players).length === 0) return;
        if (isPureDoublesValue(value) && present.rollsThisRound >= OPENING_ROLLS) return;

        const { snapshot } = applyRoll(present, value);
        commit(snapshot, set, get);
      },

      selectDoubles: () => {
        const { present } = get();
        if (!present || present.status !== 'playing') return;
        if (activePlayers(present.players).length === 0) return;
        if (present.rollsThisRound < OPENING_ROLLS) return;

        const { snapshot } = applyDoubles(present);
        commit(snapshot, set, get);
      },

      pullOut: (playerId) => {
        const { present } = get();
        if (!present || present.status !== 'playing') return;

        const player = present.players.find((p) => p.id === playerId);
        if (!player || player.pulledOutThisRound) return;

        const payout = present.pot;
        const players = present.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                score: p.score + payout,
                pulledOutThisRound: true,
              }
            : p,
        );

        const remaining = activePlayers(players);
        let snapshot: GameSnapshot = {
          ...present,
          players,
          pot: 0,
          currentPeakPot: Math.max(present.currentPeakPot, payout),
          lastEvent: `${player.name} pulled out · ${payout}`,
          sevenOutHighlight: false,
        };

        if (remaining.length === 0) {
          snapshot = resetRound(snapshot, `${player.name} pulled out · everyone out`, {
            sevenOutHighlight: false,
          });
        }

        commit(snapshot, set, get);
      },

      addPlayer: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        const { present } = get();
        if (!present) return;

        commit(
          {
            ...present,
            players: [
              ...present.players,
              {
                id: generateId(),
                name: trimmed,
                score: 0,
                pulledOutThisRound: false,
              },
            ],
            lastEvent: `${trimmed} joined`,
          },
          set,
          get,
        );
      },

      removePlayer: (playerId) => {
        const { present } = get();
        if (!present) return;
        if (present.players.length <= 2) return;

        const removed = present.players.find((p) => p.id === playerId);
        if (!removed) return;

        commit(
          {
            ...present,
            players: present.players.filter((p) => p.id !== playerId),
            lastEvent: `${removed.name} removed`,
          },
          set,
          get,
        );
      },

      renamePlayer: (playerId, name) => {
        const { present } = get();
        if (!present) return;

        // Live rename — skip undo stack so typing isn't one undo per letter
        set({
          present: {
            ...cloneSnapshot(present),
            players: present.players.map((p) =>
              p.id === playerId ? { ...p, name } : p,
            ),
          },
        });
      },

      undo: () => {
        const { past, present, future } = get();
        if (!present || past.length === 0) return;

        const previous = past[past.length - 1];
        set({
          past: past.slice(0, -1),
          present: cloneSnapshot(previous),
          future: [cloneSnapshot(present), ...future],
        });
      },

      redo: () => {
        const { past, present, future } = get();
        if (!present || future.length === 0) return;

        const next = future[0];
        set({
          past: [...past, cloneSnapshot(present)],
          present: cloneSnapshot(next),
          future: future.slice(1),
        });
      },
    }),
    {
      name: 'ride-the-rocket-game',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        present: state.present,
        past: state.past.slice(-50),
        future: state.future,
        gameHistory: state.gameHistory,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<GameStore> | undefined;
        const present = p?.present
          ? {
              ...p.present,
              sevenOutHighlight: p.present.sevenOutHighlight ?? false,
              startedAt: p.present.startedAt ?? Date.now(),
              currentPeakPot: p.present.currentPeakPot ?? 0,
              roundStats: p.present.roundStats ?? [],
            }
          : current.present;

        return {
          ...current,
          ...p,
          present,
          gameHistory: p?.gameHistory ?? current.gameHistory,
        };
      },
    },
  ),
);

export function getGameStatusLabel(status: GameStatus, currentRound: number, totalRounds: number): string {
  if (status === 'finished') return 'Game over';
  return `Round ${currentRound} of ${totalRounds}`;
}
