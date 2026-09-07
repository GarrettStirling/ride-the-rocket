# Ride the Rocket

A clean, minimal dice party game scorekeeper for iOS, Android, and iPad. Bring two dice — one phone tracks the pot.

Inspired by classic Bank / 7-11-21 dice games, with opening-roll house rules and mid-game player management.

## Quick start

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS)
- [Expo Go](https://expo.dev/go) on your phone (easiest way to test)
- For simulators: Xcode (macOS, iOS/iPad) and/or Android Studio (Android)

### Run locally

```bash
npm install
npm start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator (macOS only).

Reload the app from the **Metro terminal** (`r`), not Android Studio Logcat. On Windows emulators, `Ctrl+M` often does nothing; use `m` in the Metro terminal for the dev menu.

### Web (optional)

```bash
npm run web
```

## How to play

1. **New game** — add names (blank fields become Player 1, Player 2, …), pick 10 or 20 rounds. Start game is the blue CTA.
2. **Roll** — players take turns rolling two dice; tap the total (2–12) on the number pad.
3. **Pot** — each roll adds to the pot. The pot is **blue during opening rolls**, then ink for the rest of the round. After opening, doubles double the pot (tap **2×** only).
4. **Opening rolls** — first 3 rolls of each round: 7 adds 70; doubles don't double. A **ROUND N** flash marks the start of each round without blocking taps.
5. **Seven** — after opening rolls, the 7 key turns red; rolling 7 ends the round and the pot is lost.
6. **Pull out** — take the current pot and sit out the rest of the round. Scores sit next to each name.
7. **Undo / Redo** — fix scorer mistakes instantly. Leaving an in-progress game asks for confirmation.
8. **Game over** — standings, winner, and round highlights only. **New game** reopens setup with the same players and round count.

Home also lists previous games so you can start again with the same roster.

## Project structure

```
app/                 Expo Router screens (home, setup, play)
src/game/            Rules, types, Zustand store
src/components/      UI (pad, pot, players, summary, motion primitives)
src/hooks/           Theme, haptics/sound feedback, shake
src/constants/       Theme and motion tokens
src/motion.ts        Reanimated easing / spring configs
```

## Building for stores

This project uses [EAS Build](https://docs.expo.dev/build/introduction/) for App Store and Google Play binaries.

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform all
```

You'll need:
- **Apple Developer Program** — $99/year
- **Google Play Console** — $25 one-time

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full launch checklist.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Expo SDK 57 + React Native |
| Navigation | Expo Router |
| State | Zustand + undo/redo stacks |
| Persistence | AsyncStorage (resume + game history) |
| Motion | react-native-reanimated (reduced-motion aware) |
| Haptics | expo-haptics (Taptic / vibrator / Web Vibration API) |
| Themes | System light/dark |

Sound hooks exist (`setSoundPlayer`) but no audio assets are wired yet.

## Troubleshooting

### "Incompatible SDK version" in Expo Go

This project uses **Expo SDK 57**. The Play Store / App Store version of Expo Go is often older and won't work.

**Android (physical device):**
1. Uninstall the existing Expo Go app from your phone.
2. Download the matching build from [expo.dev/go](https://expo.dev/go) (SDK 57 → Android → Install), or run:
   ```bash
   npx expo-go download android 57
   ```
   This saves an APK in the project folder (e.g. `Expo-Go-57.0.9.apk`).
3. Transfer the APK to your phone and install it (allow installs from unknown sources if prompted).
4. Run `npm start` again and scan the QR code.

**iPhone / iPad:** SDK 57 Expo Go is not on the App Store. Install from [sign.expo.dev](https://sign.expo.dev) (free, certificate expires every 7 days).

## License

Private — all rights reserved unless you choose to open-source.
