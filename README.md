# Mumken Mobile

An iOS-focused discussion app for reading updates, posting comments, and replying in English or Arabic. Built with Expo SDK 57, React Native, React 19, TypeScript, Expo Router, and Reanimated.

## Run

```sh
npm ci
npm start
```

Open in Expo Go, or press `i` for an iOS simulator and `a` for an Android emulator.

## Checks

```sh
npm test
npm run lint
npm run typecheck
```

## Features

- Update list and discussion screens, with one level of replies.
- English/LTR and Arabic/RTL layouts, switched without restarting the app.
- Empty-input validation, a 2,000-character limit, and duplicate-submission protection.
- Failed submissions retain the draft and reply target; successful posts show a green confirmation.
- Loading skeletons, empty discussions, unavailable updates, and retryable errors.
- Collapsible replies and a shared composer that focuses when Reply is selected.
- Safe-area spacing, keyboard avoidance, status announcements, scalable text, and reduced-motion support.
- A startup overlay with the Mumken logo and gradient. It stays for at least 1.2 seconds, then fades when fonts and the saved language are ready. It does not replay during navigation or normal background/resume.

## Data and storage

| Data | Lifetime |
| --- | --- |
| Comments and replies | In memory while the app session is alive. A reload or fresh launch restores the JSON seed. |
| Language | Saved in `AsyncStorage` and restored on launch. Clearing app data or uninstalling removes it. |
| Draft and reply target | Temporary composer state; retained after a failed submission. |

Backgrounding alone does not end a session, but the OS may terminate the app. If device storage fails, language selection still works for that session. Device-reboot restoration follows the storage design but was not manually tested.

There is no backend or authentication. The supplied current user is used for submissions. Authored comments keep their original language. UTC timestamps display in the device timezone using the Gregorian calendar.

## Demo scenarios

In development, **Demo / تجربة** provides slow loading, initial-load and discussion-load failures, a failed submission, an empty list, an empty discussion, and an unavailable update. Choosing a scenario resets session comments. Each failure happens once, then retry succeeds.

The normal development delay is 900 ms. `EXPO_PUBLIC_DEMO_DELAY_MS` changes it (0–4,000 ms); the slow-loading scenario always uses four seconds. Demo controls, simulated delays, and failures are disabled in production.

## iOS screenshots

The [English and Arabic walkthrough](docs/journey/README.md) has 13 native images: the startup overlay and six paired stages. They were captured in Expo Go on an iPhone 17 Pro simulator running iOS 26.5, and complement the submitted Loom recordings.

<details>
<summary>Startup overlay</summary>

<img src="docs/journey/00-startup.png" alt="Mumken startup overlay on iOS" width="260" />

</details>

## Implementation notes

The PDF defines the scope, the JSON supplies the seed, and Figma provides the visual reference. The update list was inferred from the journey because the supplied design covered the discussion screen. The shared composer and collapsible threads are implementation choices.

Expo Router handles navigation. React Context shares session data and language; a repository handles validation and simulated requests. Drafts stay in the composer. Small dictionaries provide interface translations without an i18n library.

## Limits and next steps

Comments are plain text and session-only. There is no backend sync, pagination, or multi-user conflict handling. Automated tests cover the repository and model; the screenshot walkthrough was checked separately on the iOS simulator.

Next steps would be native UI tests, physical-device and VoiceOver/TalkBack checks, software-keyboard and reboot testing, and pagination if discussions grow.
