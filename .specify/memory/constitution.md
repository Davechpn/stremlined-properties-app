<!--
SYNC IMPACT REPORT
==================
Version Change: INITIAL → 1.0.0
Constitution Type: Initial Ratification

Modified Principles:
- NEW: I. Component-First Architecture
- NEW: II. No Duplication
- NEW: III. Consistent Naming Conventions
- NEW: IV. Observability & Error Tracking
- NEW: V. Development Tooling
- NEW: VI. Performance & Optimization

Added Sections:
- Technology Stack Standards
- Code Quality Standards
- Governance

Templates Requiring Updates:
✅ plan-template.md - Updated Constitution Check references
✅ spec-template.md - Aligned with mobile-first requirements
✅ tasks-template.md - Added observability and naming convention tasks
✅ checklist-template.md - No updates needed (generic)
✅ agent-file-template.md - No updates needed (generic)

Follow-up TODOs:
- None - all placeholders resolved
-->

# Streamlined Properties App Constitution

## Core Principles

### I. Component-First Architecture

Every feature MUST be built using modular, reusable React Native components. Components MUST follow these rules:

- Single Responsibility: Each component has ONE clear purpose
- Self-contained: Components manage their own state and logic when appropriate
- Reusable: Shared components live in `/components` or `/components/ui`
- Screen-specific: Screen components live in `/app` with Expo Router file-based routing
- Type-safe: All components MUST have TypeScript interfaces for props
- Documented: Complex components MUST include JSDoc comments explaining usage

**Rationale**: React Native apps thrive on component reusability. This prevents code duplication and ensures maintainable, testable code. The component-first approach aligns with React's declarative paradigm and enables rapid feature development.

### II. No Duplication (DRY - Don't Repeat Yourself)

Code duplication is STRICTLY FORBIDDEN. When similar functionality exists:

- Extract shared logic into hooks in `/hooks`
- Extract shared utilities into `/lib` or `/utils`
- Extract shared types into `/types`
- Extract shared constants into `/constants`
- Extract shared API logic into `/services` or `/api`
- Use composition over inheritance
- Prefer custom hooks over repeated useEffect/useState patterns

**Rationale**: Duplication leads to maintenance nightmares, inconsistent behavior, and bugs. Every duplicated line is a future liability. React hooks and functional composition provide elegant solutions for code reuse.

### III. Consistent Naming Conventions

All code MUST follow React Native and TypeScript best practices for naming:

- **Files & Directories**: kebab-case (e.g., `property-list.tsx`, `use-auth.ts`)
- **Components**: PascalCase (e.g., `PropertyCard`, `UserProfile`)
- **Hooks**: camelCase with "use" prefix (e.g., `useAuth`, `useProperties`)
- **Functions/Variables**: camelCase (e.g., `fetchProperties`, `propertyData`)
- **Types/Interfaces**: PascalCase (e.g., `PropertyData`, `UserProfile`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `API_BASE_URL`, `MAX_RETRIES`)
- **Enums**: PascalCase with SCREAMING_SNAKE_CASE values
- **Private methods**: camelCase with leading underscore (e.g., `_handleInternalLogic`)

**Rationale**: Consistent naming improves code readability, reduces cognitive load, and aligns with the React Native ecosystem standards. It enables developers to understand code structure at a glance.

### IV. Observability & Error Tracking (NON-NEGOTIABLE)

Sentry MUST be integrated for comprehensive error tracking and monitoring:

- **Error Boundaries**: Wrap all major sections with Sentry-enhanced error boundaries
- **Navigation Tracking**: Integrate Sentry with Expo Router for navigation breadcrumbs
- **API Monitoring**: Wrap all API calls with Sentry performance monitoring
- **User Context**: Attach user identifiers (anonymized when necessary) to all events
- **Performance Monitoring**: Track screen load times, API response times, and render performance
- **Manual Logging**: Use Sentry.captureException() for caught errors that require attention
- **Breadcrumbs**: Log significant user actions for debugging context

Reactotron MUST be integrated for development-time debugging:

- **State Logging**: Log Redux/state management actions and state changes
- **API Logging**: Log all API requests/responses in development
- **Custom Logs**: Use Reactotron.log() for debugging complex logic flows
- **Async Storage**: Monitor AsyncStorage reads/writes
- **Performance**: Track component render counts and times
- **Network**: Display network requests with timing information

**Rationale**: React Native apps are distributed to users' devices, making debugging production issues challenging. Sentry provides critical production monitoring, while Reactotron enables efficient development debugging. Together, they ensure problems are caught early and resolved quickly.

### V. Development Tooling

Development tooling MUST be properly configured and consistently used:

- **TypeScript**: Strict mode enabled, no `any` types without explicit justification
- **ESLint**: Expo's ESLint config MUST pass without errors or warnings
- **Prettier**: Automated formatting on save and pre-commit
- **Git Hooks**: Pre-commit hooks MUST run linting and type checking
- **Environment Variables**: Use expo-constants for environment-specific configuration
- **VS Code**: Recommended extensions and settings MUST be documented

**Rationale**: Consistent tooling prevents bugs, enforces code quality, and reduces code review friction. TypeScript catches errors at compile time that would otherwise crash in production.

### VI. Performance & Optimization

Performance is critical for mobile user experience and MUST be prioritized:

- **List Rendering**: Use FlatList/FlashList for lists, never ScrollView with map
- **Images**: Use expo-image with proper sizing and caching
- **Memoization**: Use React.memo, useMemo, useCallback appropriately (not excessively)
- **Bundle Size**: Monitor and minimize bundle size, lazy load when beneficial
- **Reanimated**: Use react-native-reanimated for animations (60fps required)
- **Navigation**: Optimize screen transitions and prevent unnecessary re-renders
- **Network**: Implement proper caching, request deduplication, and optimistic updates

**Rationale**: Mobile devices have limited resources. Poor performance leads to battery drain, crashes, and user abandonment. React Native provides tools for optimization, but they must be used correctly.

## Technology Stack Standards

The Streamlined Properties App MUST adhere to the following technology stack:

**Core Framework**:
- React Native 0.81.5 with Expo SDK ~54
- Expo Router ~6 for file-based navigation
- TypeScript ~5.9 in strict mode

**UI & Styling**:
- React Native core components
- expo-image for optimized images
- react-native-reanimated ~4.1 for animations
- react-native-gesture-handler ~2.28 for gestures
- Consistent theme system using /constants/theme.ts

**State Management**:
- React Context API for global state (default)
- OR React Query/TanStack Query for server state (if needed)
- AsyncStorage for persistence

**Observability**:
- Sentry (required) for production error tracking and performance monitoring
- Reactotron (required) for development debugging and logging

**Navigation**:
- Expo Router (file-based routing)
- Deep linking configured via expo-linking
- Type-safe routes with experimental.typedRoutes enabled
- Drawer navigator in app/(tabs)/ with Stack navigators for sub-sections
- Navigation Pattern: Folders with _layout.tsx MUST use Stack navigator with headerShown: true for index screen and hamburger menu (DrawerActions.toggleDrawer)
- Drawer screens MUST set headerShown: false to prevent double headers
- Sub-screens (edit, settings, details) inherit Stack headers automatically

**Development**:
- ESLint with expo config
- TypeScript strict mode
- Git hooks for quality gates

## Code Quality Standards

All code contributions MUST meet these quality standards:

**Before Implementation**:
- Features MUST have approved specifications in `/specs/[###-feature-name]/`
- User stories MUST be independently testable
- Technical design MUST be documented in plan.md

**During Implementation**:
- TypeScript MUST compile without errors
- ESLint MUST pass without errors or warnings
- No console.log statements in production code (use Reactotron/Sentry)
- Components MUST be properly typed with interfaces
- Shared logic MUST be extracted to hooks or utilities (no duplication)
- File naming MUST follow kebab-case convention
- Component naming MUST follow PascalCase convention

**Error Handling**:
- All async operations MUST have try/catch with Sentry.captureException
- Error boundaries MUST wrap major app sections
- User-facing errors MUST show helpful messages, not stack traces
- Network errors MUST have retry logic where appropriate

**Performance**:
- No performance regressions (measured by Sentry performance monitoring)
- FlatList MUST be used for lists, not ScrollView + map
- Images MUST use expo-image with appropriate sizing
- Animations MUST maintain 60fps (use react-native-reanimated)

**Documentation**:
- Complex components MUST have JSDoc comments
- Custom hooks MUST document parameters and return values
- API services MUST document request/response types
- README MUST be kept up to date with setup instructions

## Governance

This Constitution supersedes all other development practices and guidelines. It represents the non-negotiable principles that ensure the Streamlined Properties App remains maintainable, performant, and high-quality.

**Amendment Process**:
- Amendments MUST be proposed via the `/speckit.constitution` command
- Amendments MUST include rationale and impact analysis
- Version MUST be incremented according to semantic versioning:
  - MAJOR: Principle removal or fundamental redefinition
  - MINOR: New principle or section added
  - PATCH: Clarifications, wording improvements, non-semantic changes
- All affected templates and documentation MUST be updated
- Team review and approval MUST be obtained before ratification

**Compliance**:
- All PRs MUST be reviewed against this Constitution
- Violations MUST be justified in the Complexity Tracking section of plan.md
- Unjustified violations MUST be rejected
- Constitution compliance is checked in plan.md Constitution Check section

**Living Document**:
- This Constitution evolves with the project
- Outdated principles MUST be updated or removed
- New learnings MUST be incorporated through formal amendments
- Historical versions MUST be tracked via git history

**Version**: 1.0.0 | **Ratified**: 2025-11-29 | **Last Amended**: 2025-11-29
