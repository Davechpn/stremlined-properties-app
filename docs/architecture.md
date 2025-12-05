# Architecture & Folder Layout

This section explains the main folders and patterns used in the codebase.

Top-level folders

- `app/` — Primary app entry point and file-based routes powered by Expo Router. Routes are organized into nested folders such as `(auth)`, `(tabs)`, and feature folders.
- `components/` — Reusable UI components grouped by feature (e.g., `auth/`, `dashboard/`, `profile/`). Keep components small and UI-focused.
- `services/` — API clients, auth helpers, storage adapters, and monitoring wrappers. Network clients (e.g., `apisauce` or `axios`) will live here.
- `hooks/` — Reusable React hooks (e.g., `use-auth`, `use-organizations`, `use-teams`).
- `types/` — Shared TypeScript types for API responses and domain models (e.g., `invitation.ts`, `organization.ts`).
- `constants/` — App-level constants (themes, roles, config) used across the app.

Key patterns

- File-based routing: Screens are files in `app/`. Layout components are `_layout.tsx` files.
- Separation of concerns: Presentational components in `components/`, data fetching and business logic in `services/` and `hooks/`.
- State and data fetching: `@tanstack/react-query` is used to fetch and cache data; persisters may use AsyncStorage.
- Error handling: Sentry is included (`@sentry/react-native`) for crash reporting; the app has `monitoring/` helpers.

How to add a feature

1. Add screens under `app/<feature>` or `app/(tabs)/<feature>` for tabbed routes.
2. Add UI components to `components/<feature>`.
3. Add API calls to `services/api/` and corresponding TypeScript types in `types/`.
4. Add hooks in `hooks/` for cross-component logic.

Routing examples

- `app/(auth)/sign-in.tsx` — sign-in screen
- `app/(tabs)/index.tsx` — main tab navigator

Styling and theming

- The project uses a theming file in `constants/theme.ts` and a Paper theme in `constants/paper-theme.ts`.

Third-party integrations

- React Query for data fetching
- Sentry for monitoring
- Expo modules for native features (image picker, splash screen, updates)
