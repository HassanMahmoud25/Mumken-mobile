# Mumken Mobile

A mobile discussion app for browsing updates, posting comments, and replying to other users. Supports English and Arabic with LTR and RTL layouts.

## Stack

Expo SDK 57, React Native, React 19, TypeScript, Expo Router, and Reanimated.

## Run locally

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

The app uses local sample data. Comments persist during the current session and reset when the app reloads.

The development-only **Demo** button provides loading, empty, and failure scenarios. See [demo steps](docs/demo.md) and [verification notes](docs/verification.md) for details.
