# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: React Native 0.81.5, TypeScript ~5.9, Expo SDK ~54  
**Primary Dependencies**: Expo Router ~6, react-native-reanimated ~4.1, expo-image ~3.0  
**Storage**: AsyncStorage for local persistence, [SPECIFY: Backend API if applicable or NEEDS CLARIFICATION]  
**Error Tracking**: Sentry (required), Reactotron for development  
**Navigation**: Expo Router (file-based routing)  
**Target Platform**: iOS 15+, Android (via Expo)  
**Project Type**: Mobile (React Native with Expo)  
**Performance Goals**: 60fps animations, <2s screen load times, <100ms API response feedback  
**Constraints**: Mobile device resources, offline capability [NEEDS CLARIFICATION if required], battery efficiency  
**Scale/Scope**: [NEEDS CLARIFICATION: number of screens, concurrent users, data volume]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Component-First Architecture**:
- [ ] Feature uses modular, reusable components
- [ ] Components follow single responsibility principle
- [ ] Shared components are properly extracted to `/components`
- [ ] All components have TypeScript interfaces for props

**No Duplication (DRY)**:
- [ ] No duplicate code exists across the codebase
- [ ] Shared logic is extracted to custom hooks in `/hooks`
- [ ] Shared utilities are in `/lib` or `/utils`
- [ ] API logic is centralized in `/services` or `/api`

**Consistent Naming Conventions**:
- [ ] Files and directories use kebab-case
- [ ] Components use PascalCase
- [ ] Hooks use camelCase with "use" prefix
- [ ] Constants use SCREAMING_SNAKE_CASE
- [ ] Types and interfaces use PascalCase

**Observability & Error Tracking**:
- [ ] Sentry error boundaries wrap major sections
- [ ] Sentry is integrated with navigation for breadcrumbs
- [ ] All API calls include Sentry performance monitoring
- [ ] Reactotron logging is added for development debugging
- [ ] Error handling includes Sentry.captureException for critical errors

**Performance & Optimization**:
- [ ] Lists use FlatList or FlashList (not ScrollView + map)
- [ ] Images use expo-image with proper sizing
- [ ] Animations use react-native-reanimated for 60fps
- [ ] Memoization is applied appropriately (React.memo, useMemo, useCallback)
- [ ] Bundle size impact is considered

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., app/(tabs), components/property). The delivered plan must
  not include Option labels.
-->

```text
# React Native (Expo) with Expo Router (DEFAULT for this project)
app/
├── (tabs)/               # Tab navigation group
│   ├── _layout.tsx       # Tab layout
│   ├── index.tsx         # Home screen
│   └── explore.tsx       # Explore screen
├── _layout.tsx           # Root layout
└── [feature]/            # Feature-specific screens

components/
├── ui/                   # Shared UI components
└── [feature]/            # Feature-specific components

hooks/
└── use-[feature].ts      # Custom hooks

services/
└── api/                  # API client services

lib/
└── utils/                # Utility functions

constants/
└── theme.ts              # Theme constants

types/
└── [feature].ts          # TypeScript types

assets/
└── images/               # Images and static assets
```

**Structure Decision**: React Native mobile app using Expo Router for file-based navigation. All screens go in `app/`, shared components in `components/`, business logic in `hooks/` and `services/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
