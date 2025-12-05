# Streamlined Properties App

A React Native + Expo application for managing properties, teams, and organizations. This repository includes an Expo Router-based file structure, TypeScript types, reusable components, hooks, and API service modules.

This project is focused on account and organization management features (sign-up, sign-in, invitations, teams, profiles) and is organized for maintainability and reusability.

Quick links
- Code: `app/`, `components/`, `services/`, `hooks/`, `types/`
- Docs: `docs/` (development, architecture, API)
- Contributing: `CONTRIBUTING.md`

Prerequisites
- Node.js (LTS), npm or Yarn
- Xcode (for iOS simulator) or Android Studio (for Android emulator)
- Expo CLI (optional but useful): `npm install -g expo-cli`

Quickstart

1. Install dependencies

```bash
npm install
```

2. Start the Metro/Expo dev server

```bash
npm start
# or
npm run ios    # open iOS simulator
npm run android # open Android emulator
```

Available scripts (in `package.json`)

- `start` — run `expo start` (dev server)
- `ios` — start and open iOS simulator
- `android` — start and open Android emulator
- `web` — run web version
- `reset-project` — helper script to reset starter project files
- `lint` — run ESLint

Repository structure (high level)

- `app/` — Expo Router entry and file-based routes (screens)
- `components/` — reusable UI components (organized by feature)
- `services/` — API clients, auth, storage, monitoring
- `hooks/` — React hooks used across the app
- `types/` — TypeScript type definitions for API and domain
- `constants/` — app-level constants and configuration
- `assets/` — images and other static assets
- `docs/` — documentation (development, architecture, API)

Docs and contribution

See `docs/development.md` for setup and common tasks, `docs/architecture.md` for folder layout and design patterns, and `docs/api.md` for API and types overview. See `CONTRIBUTING.md` for how to contribute.

Where to start reading the code

- App entry: `app/index.tsx` and `app/_layout.tsx`
- Auth flows: `app/(auth)/*` and `components/auth/*`
- Main app screens: `app/(tabs)/*` and `components/dashboard/*`
- API clients and types: `services/api/` and `types/`

Contact and notes

If you need an overview of a specific area (e.g., onboarding, auth, or the API layer), open an issue or a PR describing the area you'd like documented further.

---
Generated documentation files:
- `docs/development.md`
- `docs/architecture.md`
- `docs/api.md`

