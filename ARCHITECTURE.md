# Architecture

## Overview

Ride the Rocket is a **fully offline** mobile app. All game state lives on the device. There is no API, database, or auth.

```
┌─────────────────────────────────────────┐
│  app/ (Expo Router screens)             │
│  index → setup → play                   │
│  finished play → setup (same roster)    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  src/game/gameStore.ts (Zustand)        │
│  present │ past[] │ future[]            │
│  gameHistory[]                          │
└─────────────────┬───────────────────────┘
                  │ persist
┌─────────────────▼───────────────────────┐
│  AsyncStorage                             │
└───────────────────────────────────────────┘
```

## Screens

| Screen | Behavior |
|--------|----------|
| Home (`app/index.tsx`) | New game, previous-game list, resume redirect if `status === 'playing'` |
| Setup (`app/setup.tsx`) | Names + 10/20 rounds. Prefills from query params after a finished game. Empty names become Player N on start. |
| Play (`app/play.tsx`) | While playing: header, undo/redo, pot, pad, players. When `finished`: summary only (no header/pad/players). |

Leaving an in-progress game is confirmed; the snapshot would be discarded.

## State model

### `GameSnapshot`
Immutable snapshot of one moment in a game:
- `players[]` — id, name, score, pulledOutThisRound
- `totalRounds` — 10 or 20
- `currentRound`
- `pot` — running total for the active round
- `rollsThisRound` — drives opening-roll rules (first 3)
- `status` — `playing` | `finished`
- `lastEvent` — human-readable last action (cleared when a new round starts)
- `lastRollLabel` / `lastRollNumber` — last pad input in the current round
- `sevenOutHighlight` — deadly 7 just ended the previous round (pot shake)
- `currentPeakPot` / `roundStats[]` — per-round peak pot and roll count for the summary

### Undo / redo
Every mutating action:
1. Pushes a clone of `present` onto `past`
2. Clears `future`
3. Sets `present` to the new snapshot

`undo` pops `past` → `present`, pushes old present to `future`.  
`redo` is the inverse.

Live rename does **not** push undo (typing would be one undo per letter).

History is capped at 50 undo entries in persistence. Finished games are stored in `gameHistory` (max 20).

## Game logic (`applyRoll`)

| Phase | Roll 7 | Doubles | Other |
|-------|--------|---------|-------|
| Opening (rolls 0–2) | +70 to pot | Add value only | Add value |
| Normal | End round | Add value, then ×2 pot | Add value |

After opening, **2** and **12** are pad-disabled (always doubles); use **2×**.

**Pull out:** player score += pot; pot = 0; player marked out. If everyone is out, round ends.

**Round end:** reset pot, reset pull-out flags, increment round (or finish game). Do not carry last-roll copy into the next round.

## Doubles detection

The number pad includes a **2×** button alongside values 2–12.

| Phase | 2× button | 2 and 12 buttons |
|-------|-----------|------------------|
| Opening (rolls 1–3) | Disabled (grayed) | Active |
| Roll 4+ | Active | Disabled (grayed) — use 2× for snake eyes / boxcars |

**After opening rolls:**
- Not doubles: tap the dice total.
- Doubles (any pair): tap **2×** only — doubles the pot.

## Motion and feedback

- `PressableScale` — press scale on a wrapping `Animated.View` (do not `createAnimatedComponent(Pressable)`; Reanimated has no Pressable host).
- `BumpText` / pot lift — value-change pulse.
- `StaggerIn` — list/key entrance; respects reduced motion (fade only).
- `useFeedback` — `selection` \| `action` \| `success` \| `error` haptics; `setSoundPlayer` for later audio.
- Round banner and disabled-key shake are non-blocking (`pointerEvents: 'none'` on the banner).

## UI layout

| Breakpoint | Layout |
|------------|--------|
| Phone | Single column: pot → pad → players |
| Tablet (≥768px) | Two columns: play controls left, players right |
| Finished game | Summary card only, centered, no play chrome |

Theme follows `useColorScheme()` — no in-app theme toggle yet; respects OS setting.

Red is reserved for the deadly **7** key after opening. Opening pot uses blue. Start game CTA is blue.

## File map

| Path | Responsibility |
|------|----------------|
| `app/index.tsx` | Home, history, resume redirect |
| `app/setup.tsx` | New game configuration |
| `app/play.tsx` | Play UI + finished summary routing |
| `src/game/gameStore.ts` | State + actions + persistence |
| `src/game/rules.ts` | Opening length, 2× / 2 / 12 helpers |
| `src/game/types.ts` | Snapshot, history, round stats |
| `src/constants/theme.ts` | Colors, spacing, typography, motion tokens |
| `src/motion.ts` | Reanimated easing / springs |
| `src/hooks/useFeedback.ts` | Haptics + optional sound |
| `src/components/FinalStandings.tsx` | End-game summary |
| `src/components/PotDisplay.tsx` | Pot, round flash, last event |
| `src/components/NumberPad.tsx` | Dice keys |
| `src/components/PlayerRow.tsx` | Name, score, pull out |
