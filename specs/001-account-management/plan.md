# Implementation Plan: Account Management Module

**Branch**: `001-account-management` | **Date**: 2025-11-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-account-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a comprehensive account management module for the Streamlined Properties mobile app, enabling users to authenticate via Google OAuth, email/password, or phone/OTP, manage their profile and settings, create/join multiple property management organizations with role-based permissions (Owner, Admin, Manager, Agent, Viewer), invite team members, and switch between organizational contexts seamlessly. The module provides an adaptive personal dashboard that serves as the home screen, dynamically adjusting to user state (no organizations, one organization, or multiple organizations). Implementation uses React Native 0.81.5 with Expo SDK ~54, Expo Router for file-based navigation, TanStack Query for server state management and data fetching, React Native Paper for Material Design UI components, Sentry for production error tracking, and Reactotron for development debugging. All features follow the constitution's core principles: Component-First Architecture, No Duplication, Consistent Naming (kebab-case files, PascalCase components), comprehensive Observability (Sentry + Reactotron everywhere), and 60fps Performance using react-native-reanimated for animations.

## Technical Context

**Language/Version**: React Native 0.81.5, TypeScript ~5.9 (strict mode), Expo SDK ~54  
**Primary Dependencies**: 
- **Navigation**: Expo Router ~6 (file-based routing in app/ directory)
- **UI Library**: React Native Paper 5.x (Material Design components for forms, buttons, dialogs, bottom sheets)
- **State Management**: TanStack Query (React Query) v5 for server state, data fetching, caching, and synchronization
- **Animations**: react-native-reanimated ~4.1 (60fps animations on UI thread)
- **Images**: expo-image ~3.0 (optimized loading with caching and blurhash)
- **Observability**: Sentry SDK for React Native (production error tracking), Reactotron (development debugging)

**Storage**: 
- Expo SecureStore for authentication tokens (encrypted)
- AsyncStorage for local profile cache, organization context, and offline data persistence
- Backend REST API for authoritative data source

**Error Tracking**: 
- Sentry (required) - Error boundaries, navigation breadcrumbs, API monitoring, performance tracking, user context attachment
- Reactotron (development only) - API logging, navigation tracking, AsyncStorage monitoring, custom debug logs

**Navigation**: Expo Router (file-based routing with app/ directory structure)

**Target Platform**: iOS 15+ and Android 8+ (API level 26+) via Expo  

**Project Type**: Mobile (React Native with Expo)  

**Performance Goals**: 
- 60fps for all animations and screen transitions (measured on devices from last 3 years)
- <2s screen load times on 4G connection
- <3s app startup time on 4G connection
- <100ms API response feedback (loading indicators)
- FlatList scrolling at 60fps for lists up to 1000 items

**Constraints**: 
- Mobile device resources (memory, CPU, battery)
- Offline capability required with graceful degradation and clear indicators
- Battery efficiency (minimize background processing, optimize network calls)
- Screen sizes from 4" to 7" (phones and small tablets)
- <50MB app bundle size for initial download
- Portrait and landscape orientation support on tablets
- Accessibility: VoiceOver/TalkBack support, system font size adjustments

**Scale/Scope**: 
- **Screens**: 15+ screens (welcome/onboarding 3, authentication 5, dashboard 1, profile 2, organizations 2, team management 2, invitation handling 2)
- **Concurrent users**: App designed for single-user mobile context with backend handling multi-user scenarios
- **Data volume**: Users can belong to up to 50 organizations (UI optimized for 2-10), with efficient FlatList pagination for larger lists
- **Backend API**: RESTful API with authentication, organizations, teams, invitations, and profile endpoints (documented in contracts/ directory)

**Key External Integrations**:
- **Google OAuth 2.0**: iOS and Android authentication with Expo AuthSession
- **SMS Gateway (Twilio)**: OTP delivery for phone authentication
- **Email Service (SendGrid)**: Verification, password reset, and invitation delivery
- **Cloud Storage (S3/Firebase)**: Profile photo uploads via backend API
- **Push Notifications (FCM)**: Invitation and team update notifications
- **Backend REST API**: All data operations with HTTPS-only communication

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Component-First Architecture**:
- [x] Feature uses modular, reusable components (all screens built with atomic components in components/ui/ and feature-specific components/)
- [x] Components follow single responsibility principle (welcome-screen, auth-form, dashboard-card, profile-editor, org-switcher, member-list)
- [x] Shared components are properly extracted to `/components` (form inputs, buttons, cards, bottom sheets extracted to components/ui/)
- [x] All components have TypeScript interfaces for props (strict TypeScript mode enforced with prop interfaces)

**No Duplication (DRY)**:
- [x] No duplicate code exists across the codebase (shared auth logic in useAuth hook, API calls in services/, validation in utils/)
- [x] Shared logic is extracted to custom hooks in `/hooks` (useAuth, useOrganizations, useInvitations, useProfile)
- [x] Shared utilities are in `/lib` or `/utils` (validation, formatting, error handling, deep link parsing)
- [x] API logic is centralized in `/services` or `/api` (all TanStack Query hooks in services/api/ with baseQuery wrapper)

**Consistent Naming Conventions**:
- [x] Files and directories use kebab-case (welcome-screen.tsx, use-auth.ts, organization-switcher.tsx)
- [x] Components use PascalCase (WelcomeScreen, AuthForm, DashboardCard, OrganizationSwitcher)
- [x] Hooks use camelCase with "use" prefix (useAuth, useOrganizations, useProfile)
- [x] Constants use SCREAMING_SNAKE_CASE (API_BASE_URL, AUTH_TOKEN_KEY, SESSION_DURATION)
- [x] Types and interfaces use PascalCase (User, Organization, AuthCredentials, InvitationStatus)

**Observability & Error Tracking**:
- [x] Sentry error boundaries wrap major sections (app/_layout.tsx wraps all screens, individual feature boundaries for auth/dashboard/profile)
- [x] Sentry is integrated with navigation for breadcrumbs (Expo Router integration in app/_layout.tsx tracking all screen transitions)
- [x] All API calls include Sentry performance monitoring (TanStack Query wrapped with Sentry tracing for request/response times)
- [x] Reactotron logging is added for development debugging (API calls, navigation, AsyncStorage, state changes logged)
- [x] Error handling includes Sentry.captureException for critical errors (auth failures, API errors, permission denials, invitation failures)

**Performance & Optimization**:
- [x] Lists use FlatList or FlashList (not ScrollView + map) (organization list, member list, invitation list all use FlatList)
- [x] Images use expo-image with proper sizing (profile photos, organization logos with blurhash placeholders)
- [x] Animations use react-native-reanimated for 60fps (screen transitions, bottom sheet, organization switcher, all interactive animations)
- [x] Memoization is applied appropriately (React.memo, useMemo, useCallback) (expensive computations memoized, callbacks stabilized)
- [x] Bundle size impact is considered (code splitting via Expo Router lazy loading, minimal third-party dependencies, tree shaking enabled)

## Project Structure

### Documentation (this feature)

```text
specs/001-account-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output: Technology decisions and patterns
├── data-model.md        # Phase 1 output: Entity definitions and relationships
├── quickstart.md        # Phase 1 output: Development environment setup
├── contracts/           # Phase 1 output: API specifications
│   ├── authentication.yaml    # Auth endpoints (signup, signin, oauth, otp)
│   ├── organizations.yaml     # Organization CRUD and switching
│   ├── teams.yaml             # Member management and invitations
│   └── profile.yaml           # User profile operations
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# React Native with Expo Router - Account Management Module Structure
app/
├── _layout.tsx                      # Root layout with Sentry error boundary, TanStack Query provider, theme provider
├── index.tsx                        # Root redirect to welcome or dashboard based on auth state
├── (welcome)/                       # Welcome flow group (unauth only)
│   ├── _layout.tsx                  # Welcome layout (stack navigation, hide header)
│   ├── index.tsx                    # Welcome screen with app intro
│   ├── onboarding.tsx              # Onboarding carousel (2-3 feature highlight screens)
│   └── get-started.tsx             # Final onboarding screen with CTA buttons
├── (auth)/                          # Authentication flow group (unauth only)
│   ├── _layout.tsx                  # Auth layout (stack navigation, minimal header)
│   ├── sign-in.tsx                  # Sign in screen (Google, email/password, phone)
│   ├── sign-up.tsx                  # Sign up screen (Google, email/password, phone)
│   ├── verify-otp.tsx              # OTP verification screen for phone auth
│   ├── forgot-password.tsx         # Password reset request screen
│   └── reset-password.tsx          # Password reset completion screen (deep link target)
├── (app)/                           # Main authenticated app group (auth required)
│   ├── _layout.tsx                  # App layout with drawer/tabs navigation, role-based menu
│   ├── (tabs)/                      # Tab navigation group
│   │   ├── _layout.tsx              # Tab bar layout with role-based tab visibility
│   │   ├── index.tsx                # Dashboard/home screen (redirect from /app)
│   │   ├── organizations.tsx       # Organizations list screen
│   │   └── profile.tsx             # Profile screen
│   ├── dashboard.tsx               # Personal dashboard (adaptive: no orgs, one org, multiple orgs)
│   ├── profile/                    # Profile management
│   │   ├── index.tsx               # Profile view screen
│   │   ├── edit.tsx                # Profile edit screen
│   │   └── settings.tsx            # Account settings screen
│   ├── organizations/              # Organization management
│   │   ├── [id].tsx                # Organization detail screen (dynamic route)
│   │   ├── [id]/settings.tsx       # Organization settings (Owner/Admin only)
│   │   ├── [id]/members.tsx        # Team members list (Owner/Admin/Manager)
│   │   └── create.tsx              # Create organization modal/screen
│   ├── teams/                      # Team management
│   │   ├── index.tsx               # Team members list for active organization
│   │   ├── invite.tsx              # Invite member modal/screen
│   │   └── [memberId].tsx          # Member detail/edit screen
│   └── invitations/                # Invitation handling
│       ├── [token].tsx             # Invitation acceptance screen (deep link target)
│       └── pending.tsx             # User's pending invitations list
└── +not-found.tsx                  # 404 screen

components/
├── ui/                             # Shared atomic UI components (React Native Paper wrappers)
│   ├── button.tsx                  # Custom Button with loading states and haptic
│   ├── text-input.tsx              # Custom TextInput with validation states
│   ├── card.tsx                    # Custom Card with shadows and animations
│   ├── bottom-sheet.tsx            # Bottom sheet modal (organization switcher, role picker)
│   ├── loading-indicator.tsx       # Consistent loading spinner
│   ├── error-message.tsx           # Error display component with retry action
│   ├── avatar.tsx                  # User/organization avatar with fallback
│   ├── badge.tsx                   # Role badge component
│   ├── icon.tsx                    # Icon wrapper (Material Community Icons)
│   └── empty-state.tsx             # Empty state with illustration and CTA
├── auth/                           # Authentication-specific components
│   ├── auth-form.tsx               # Reusable auth form (sign in/sign up)
│   ├── oauth-button.tsx            # Google OAuth button
│   ├── otp-input.tsx               # OTP input component (6-digit)
│   └── auth-guard.tsx              # Auth state wrapper component
├── dashboard/                      # Dashboard-specific components
│   ├── dashboard-header.tsx        # Dashboard header with profile avatar and org switcher
│   ├── welcome-card.tsx            # Welcome card for users with no organizations
│   ├── organization-card.tsx       # Organization summary card
│   ├── quick-actions.tsx           # Quick action buttons
│   └── recent-activity.tsx         # Recent activity list
├── organizations/                  # Organization-specific components
│   ├── organization-switcher.tsx   # Bottom sheet with organization list
│   ├── organization-list-item.tsx  # Organization item in FlatList
│   ├── organization-form.tsx       # Create/edit organization form
│   └── organization-settings.tsx   # Organization settings form
├── teams/                          # Team management components
│   ├── member-list-item.tsx        # Team member card in FlatList
│   ├── invitation-list-item.tsx    # Pending invitation card
│   ├── role-picker.tsx             # Role selection bottom sheet
│   └── invite-form.tsx             # Team invitation form
└── profile/                        # Profile-specific components
    ├── profile-header.tsx          # Profile header with avatar
    ├── profile-form.tsx            # Edit profile form
    ├── photo-upload.tsx            # Profile photo upload with image picker
    └── auth-methods.tsx            # Authentication methods list

hooks/
├── use-auth.ts                     # Authentication state and operations (sign in, sign up, sign out)
├── use-organizations.ts            # Organization queries and mutations (TanStack Query)
├── use-active-organization.ts      # Active organization context and switching logic
├── use-profile.ts                  # User profile queries and mutations
├── use-teams.ts                    # Team member queries and mutations
├── use-invitations.ts              # Invitation queries and mutations
├── use-permissions.ts              # Role-based permission checks
├── use-deep-link.ts                # Deep link handling (invitations, password reset)
└── use-offline-status.ts           # Network status and offline detection

services/
├── api/                            # TanStack Query API integration
│   ├── client.ts                   # Axios client with Sentry and Reactotron integration
│   ├── auth.ts                     # Authentication API calls and TanStack Query hooks
│   ├── organizations.ts            # Organization API calls and TanStack Query hooks
│   ├── teams.ts                    # Team management API calls and TanStack Query hooks
│   ├── invitations.ts              # Invitation API calls and TanStack Query hooks
│   ├── profile.ts                  # Profile API calls and TanStack Query hooks
│   └── query-client.ts             # TanStack Query client configuration with cache settings
├── storage/                        # Local storage abstractions
│   ├── secure-storage.ts           # Expo SecureStore wrapper for tokens
│   ├── async-storage.ts            # AsyncStorage wrapper with Reactotron logging
│   └── cache.ts                    # Cache management utilities
├── auth/                           # Authentication services
│   ├── google-oauth.ts             # Google OAuth integration with Expo AuthSession
│   ├── phone-auth.ts               # Phone/OTP authentication flow
│   └── session-manager.ts          # Session validation and refresh logic
└── monitoring/                     # Observability services
    ├── sentry.ts                   # Sentry initialization and helpers
    └── reactotron.ts               # Reactotron initialization (dev only)

lib/
├── utils/                          # Utility functions
│   ├── validation.ts               # Form validation helpers (email, phone, password)
│   ├── formatting.ts               # Data formatting (dates, names, phone numbers)
│   ├── error-handling.ts           # Error parsing and user-friendly messages
│   └── deep-link.ts                # Deep link parsing and routing
└── constants/                      # Shared constants (separate from /constants for lib isolation)
    └── api.ts                      # API-related constants

constants/
├── theme.ts                        # React Native Paper theme configuration (existing)
├── auth.ts                         # Authentication constants (token keys, session duration)
├── roles.ts                        # Role definitions and permissions map
└── app.ts                          # App-wide constants (bundle ID, API base URL, feature flags)

types/
├── auth.ts                         # Authentication types (User, AuthCredentials, Session)
├── organization.ts                 # Organization types (Organization, OrganizationMember)
├── invitation.ts                   # Invitation types (Invitation, InvitationStatus)
├── profile.ts                      # Profile types (LocalProfile, UpdateProfileData)
├── role.ts                         # Role types (Role enum, Permission type)
└── api.ts                          # API types (ApiResponse, ApiError, PaginatedResponse)

assets/
├── images/                         # Static images (existing)
│   ├── welcome/                    # Welcome/onboarding illustrations
│   ├── empty-states/               # Empty state illustrations
│   └── logos/                      # App logos and icons
└── animations/                     # Lottie animation files (optional)

# Configuration files (repository root)
.env.development                    # Development environment variables (API URLs, Sentry DSN)
.env.production                     # Production environment variables
app.json                            # Expo configuration (deep linking, splash screen)
```

**Structure Decision**: React Native mobile app using Expo Router for file-based navigation with route groups. Authentication flow uses (auth)/ group for public routes, (app)/ group for authenticated routes with nested tab navigation. All screens in `app/` follow Expo Router conventions with _layout.tsx files defining navigation structure. Shared components in `components/` organized by feature domain. Business logic in `hooks/` using custom hooks pattern. API layer in `services/api/` with TanStack Query for data fetching and caching. Complete observability with Sentry and Reactotron integrated at API client level.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
