# TODO — Ride the Rocket

## MVP (done in initial scaffold)
- [x] Expo + TypeScript project setup
- [x] Game state with Zustand + undo/redo
- [x] Core rules (opening rolls, doubles, sevens, pull out)
- [x] Setup screen (players, 10/20 rounds)
- [x] Play screen (pot, number pad, players)
- [x] Mid-game add / remove / rename players
- [x] Light + dark theme (system)
- [x] iPad two-column layout
- [x] Local persistence (resume after app close)
- [x] Haptic feedback on taps

## Built since scaffold
- [x] NYT-style press scale, springs, reduced-motion fallbacks
- [x] Semantic haptics (selection / action / success / error) + optional sound hook
- [x] Live region announcements for pot / round / last event
- [x] In-game Rules modal
- [x] Opening-roll pot (blue) vs normal pot (ink)
- [x] ROUND N start-of-round flash (non-blocking)
- [x] End-game summary only (winner, standings, highlights)
- [x] New game from summary reuses the same players and round count
- [x] Home screen previous-game history
- [x] Confirm before leaving an in-progress game

## Polish (next)
- [ ] Custom app icon and splash screen (rocket motif, NYT-clean)
- [ ] Sound effects (optional, subtle — `setSoundPlayer` is ready)
- [ ] Roll history log (scrollable list per round)
- [ ] Onboarding / rules screen (first launch)
- [ ] Accessibility pass (larger Dynamic Type, VoiceOver polish)
- [ ] Landscape layout tuning for iPad

## Pre-launch
- [ ] Privacy policy page (required for App Store / Play Store)
- [ ] App Store screenshots (6.7", 6.5", 12.9" iPad)
- [ ] EAS Build configuration (`eas.json`)
- [ ] TestFlight + internal Play testing
- [ ] App Store / Play Store listings copy

## Monetization (later — per Gemini brainstorm)
- [ ] Banner ads (free tier)
- [ ] "Pro Rocket Pass" IAP via RevenueCat
  - Remove ads
  - 5+ players
  - Custom house rules / themes
- [ ] Restore purchases button on paywall

## Nice to have
- [ ] Multiple saved games
- [ ] Export / share final scores
- [ ] Custom round counts and opening-roll count
- [ ] Widget showing current pot (iOS)
