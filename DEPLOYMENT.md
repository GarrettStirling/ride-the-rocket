# Deployment Guide

Step-by-step path from this repo to App Store and Google Play as a **California sole proprietor** (no LLC required to start).

## 1. Local development setup

### All platforms
```bash
npm install
npm start
```

### Test on a physical device
1. Install **Expo Go** from the App Store or Play Store.
2. Run `npm start` and scan the QR code.

### Simulators
| Platform | Requirements |
|----------|--------------|
| iOS / iPad | macOS + Xcode (Simulator via Xcode → Open Developer Tool → Simulator) |
| Android | Android Studio → Virtual Device Manager → create a Pixel device |

> **Note:** iOS builds and Simulator require a Mac. On Windows you can develop and test Android + Expo Go on iPhone.

## 2. Repository

**One repo** for iOS, Android, and iPad — React Native shares a single codebase. Do not split into multiple repos.

## 3. EAS Build (cloud binaries)

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Create `eas.json` profiles:
- `development` — internal testing
- `preview` — TestFlight / internal APK
- `production` — store submission

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

## 4. Developer accounts

| Store | Cost | Register as |
|-------|------|-------------|
| [Apple Developer](https://developer.apple.com/programs/) | $99/year | Individual (sole prop) |
| [Google Play Console](https://play.google.com/console) | $25 one-time | Personal |

Use your legal name and SSN for tax reporting. You do **not** need an LLC in California to publish; the $800/year CA franchise tax makes an LLC premature until revenue justifies it.

## 5. Store submission checklist

### Both stores
- [ ] Privacy policy URL (host a static page — GitHub Pages works)
- [ ] App icon 1024×1024 PNG (no transparency)
- [ ] Screenshots at required sizes
- [ ] Short + long description
- [ ] Content rating questionnaire
- [ ] Support email

### Apple-specific
- [ ] Bundle ID: `com.ridetherocket.app` (configured in `app.json`)
- [ ] TestFlight beta before public release
- [ ] If adding IAP later: "Restore Purchases" on paywall

### Google-specific
- [ ] Package name: `com.ridetherocket.app`
- [ ] AAB upload (EAS produces this)
- [ ] Data safety form (declare: no data collected — accurate for current app)

## 6. Submit builds

```bash
eas submit --platform ios
eas submit --platform android
```

## 7. iPad optimization

Already enabled:
- `"supportsTablet": true` in `app.json`
- Play screen uses two-column layout at width ≥ 768px (summary is single-column)

Test on iPad Simulator (11" and 12.9") before submission. Check both an in-progress round and the end-game summary.

## 8. Dark + light theme

`"userInterfaceStyle": "automatic"` in `app.json` — app follows system appearance. Test both modes before release.

## 9. Costs summary

| Item | Cost |
|------|------|
| Apple Developer | $99/year |
| Google Play | $25 one-time |
| EAS Build | Free tier available; paid plans for more builds |
| Hosting | $0 (no backend) |
| **Total to launch** | **~$124** |

## 10. Cursor workflow tips

Build incrementally — don't ask for the entire app in one prompt:

1. "Add roll history log to play screen"
2. "Add custom app icon"
3. "Integrate RevenueCat for Pro pass"

Reference `.cursorrules` and `ARCHITECTURE.md` for constraints the AI should follow. Do not change scoring rules unless asked.
