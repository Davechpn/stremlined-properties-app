# Development Guide

This document explains how to set up a local development environment, run the app on simulators, and common debugging tips.

Prerequisites

- Node.js (LTS)
- npm or Yarn
- Xcode (macOS) for iOS simulator
- Android Studio for Android emulator
- Optional: Expo CLI (`npm i -g expo-cli`)

Environment

- Copy environment variables into a `.env` file at the repo root if the project uses one. Check `services/` for env usage.
- Secure keys (Sentry DSN, API base URL, auth secrets) should not be committed.

Install

```bash
npm install
```

Run

- Start Metro / Expo dev server:

```bash
npm start
```

- Open iOS simulator:

```bash
npm run ios
```

- Open Android emulator:

```bash
npm run android
```

Web

```bash
npm run web
```

Linting

```bash
npm run lint
```

Reset project

The repo includes a helper script to reset the app starter files:

```bash
npm run reset-project
```

Debugging tips

- Use Reactotron for network and state debugging (repo includes `reactotron-*` deps).
- Check `console.log` and the Metro terminal for runtime errors.
- For native build issues, open Xcode/Android Studio and inspect build logs.

Common tasks

- Add a new screen: create a file under `app/` following file-based routing.
- Add a shared component: add to `components/` with tests and stories (if applicable).
- Use hooks in `hooks/` for cross-cutting logic.

Persistence and caching

- This app uses `@tanstack/react-query` for data fetching and caching. There may be a local persister using AsyncStorage.
