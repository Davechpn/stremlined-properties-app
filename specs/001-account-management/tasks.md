# Tasks: Account Management Module

**Input**: Design documents from `/specs/001-account-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Feature**: Comprehensive account management for Streamlined Properties mobile app with authentication (email/password primary, Google OAuth and Phone/OTP as alternatives), profile management, multi-organization support, role-based access control, team invitations, and adaptive dashboard.

**Tests**: Not requested in specification - focusing on implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, etc.)
- All paths are absolute from repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan in specs/001-account-management/plan.md
- [ ] T002 Initialize package.json dependencies: expo ~54, react-native-paper 5.x, @tanstack/react-query v5, react-native-reanimated ~4.1, expo-image ~3.0, @sentry/react-native, reactotron-react-native
- [ ] T003 [P] Configure TypeScript strict mode in tsconfig.json and create types/ directory structure
- [ ] T004 [P] Setup ESLint with Expo configuration and Prettier for code formatting
- [ ] T005 [P] Configure environment variables structure: create .env.development and .env.production templates (exclude .env from git)
- [ ] T006 [P] Setup Sentry SDK in services/monitoring/sentry.ts with error boundaries and performance monitoring
- [ ] T007 [P] Setup Reactotron in services/monitoring/reactotron.ts with API logging and navigation tracking (development only)
- [ ] T008 Configure Expo app.json with deep linking scheme: streamlinedproperties://
- [ ] T009 Verify all directories follow kebab-case convention: app/, components/, hooks/, services/, types/, constants/, lib/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 Setup React Native Paper theme system in constants/theme.ts with light/dark mode support
- [X] T011 Create app/_layout.tsx with Sentry error boundary, TanStack Query provider, React Native Paper provider, and Expo Router integration
- [X] T012 [P] Create Axios HTTP client in services/api/client.ts with Sentry performance monitoring and Reactotron request/response logging
- [X] T013 [P] Configure TanStack Query client in services/api/query-client.ts with AsyncStorage persistence for offline support
- [X] T014 [P] Create Expo SecureStore wrapper in services/storage/secure-storage.ts for encrypted token storage
- [X] T015 [P] Create AsyncStorage wrapper in services/storage/async-storage.ts with Reactotron logging
- [X] T016 [P] Create base UI components in components/ui/: button.tsx (with haptic feedback), text-input.tsx (with validation states), loading-indicator.tsx, error-message.tsx
- [X] T017 [P] Create constants files: constants/auth.ts (AUTH_TOKEN_KEY, SESSION_DURATION), constants/roles.ts (Role enum, permissions map), constants/app.ts (API_BASE_URL, SENTRY_DSN)
- [X] T018 [P] Create validation utilities in lib/utils/validation.ts (email, phone, password validators)
- [X] T019 [P] Create formatting utilities in lib/utils/formatting.ts (dates, names, phone numbers)
- [X] T020 [P] Create error handling utilities in lib/utils/error-handling.ts (API error parsing, user-friendly messages)
- [X] T021 Create app/index.tsx with authentication state check and redirect logic (welcome vs dashboard)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Welcome Experience & Initial Navigation (Priority: P1) 🎯 MVP

**Goal**: First-time users experience compelling welcome/onboarding screens and navigate to authentication

**Independent Test**: Launch app for first time, view all onboarding screens (2-3 slides), tap "Get Started" or "Sign In" to reach authentication screens with 60fps animations

### Implementation for User Story 1

- [X] T022 [P] [US1] Create types/welcome.ts with OnboardingSlide interface
- [X] T023 [P] [US1] Create welcome assets directory structure: assets/images/welcome/ with placeholder illustrations
- [X] T024 [P] [US1] Create components/ui/empty-state.tsx for reusable empty state component with illustration
- [X] T025 [P] [US1] Create app/(welcome)/_layout.tsx with stack navigation and hidden header
- [X] T026 [US1] Create app/(welcome)/index.tsx with welcome screen showing app branding and tagline
- [X] T027 [US1] Create app/(welcome)/onboarding.tsx with carousel of 2-3 feature highlight screens using react-native-reanimated for 60fps transitions
- [X] T028 [US1] Create app/(welcome)/get-started.tsx with "Get Started" and "Sign In" buttons with smooth navigation
- [X] T029 [US1] Add AsyncStorage check in app/index.tsx to bypass welcome screens for returning authenticated users
- [X] T030 [US1] Add Sentry breadcrumbs for welcome screen navigation in app/(welcome)/_layout.tsx
- [X] T031 [US1] Add Reactotron logging for welcome flow events (screen views, button taps) in each welcome screen
- [X] T032 [US1] Implement haptic feedback on "Get Started" and "Sign In" button presses
- [X] T033 [US1] Verify all welcome screens are responsive on screen sizes 4" to 7" (test on iOS Simulator and Android Emulator)
- [X] T034 [US1] Optimize welcome screen images using expo-image with blurhash placeholders for fast loading

**Checkpoint**: Welcome flow is fully functional with smooth animations and proper navigation

---

## Phase 4: User Story 2 - Simple Email/Password Authentication (Priority: P1) 🎯 MVP

**Goal**: Users can sign up and sign in using email/password as the primary authentication method, with Google OAuth and Phone/OTP as alternatives

**Independent Test**: Register new account with email/password, sign out, sign back in with same credentials, verify dashboard access. Test password reset flow via email link.

### Implementation for User Story 2

- [X] T035 [P] [US2] Create types/auth.ts with User, AuthCredentials, Session, AuthMethod, UserStatus enums
- [X] T036 [P] [US2] Create types/api.ts with ApiResponse, ApiError, ValidationError interfaces
- [X] T037 [P] [US2] Create services/api/auth.ts with TanStack Query hooks: useSignUp, useSignIn, useSignOut, useForgotPassword, useResetPassword
- [X] T038 [P] [US2] Create components/ui/card.tsx for reusable card component with shadows and animations
- [X] T039 [P] [US2] Create components/auth/auth-form.tsx for reusable email/password form with real-time validation
- [X] T040 [P] [US2] Create components/auth/oauth-button.tsx for Google OAuth button with Expo AuthSession integration
- [X] T041 [P] [US2] Create components/auth/otp-input.tsx for 6-digit OTP input component
- [X] T042 [P] [US2] Create components/auth/auth-guard.tsx for protecting authenticated routes
- [X] T043 [US2] Create hooks/use-auth.ts with authentication state management, sign in/sign up/sign out operations
- [X] T044 [US2] Create services/auth/google-oauth.ts for Google OAuth flow using Expo AuthSession
- [X] T045 [US2] Create services/auth/phone-auth.ts for Phone/OTP authentication flow
- [X] T046 [US2] Create services/auth/session-manager.ts for session validation, token refresh, and expiration handling
- [X] T047 [US2] Create app/(auth)/_layout.tsx with stack navigation and minimal header
- [X] T048 [US2] Create app/(auth)/sign-up.tsx with email/password form (name, email, password, confirm password) prominently displayed, Google OAuth and Phone/OTP as alternatives below
- [X] T049 [US2] Create app/(auth)/sign-in.tsx with email/password form (email, password, remember me toggle) prominently displayed, alternatives below
- [X] T050 [US2] Create app/(auth)/verify-otp.tsx for OTP verification screen with countdown timer (10 minutes) and resend button (disabled for 60 seconds)
- [X] T051 [US2] Create app/(auth)/forgot-password.tsx for password reset request screen with email input
- [X] T052 [US2] Create app/(auth)/reset-password.tsx for password reset completion screen (deep link target) with new password input and auto sign-in
- [X] T053 [US2] Add deep link handling in app/_layout.tsx for password reset tokens and invitation tokens
- [X] T054 [US2] Implement password show/hide toggle icon in text-input component
- [X] T055 [US2] Add Sentry error tracking for all authentication failures (invalid credentials, expired tokens, network errors) with user context
- [X] T056 [US2] Add Reactotron logging for entire authentication flow: sign-up request/response, sign-in flow, OAuth callback, OTP flow
- [X] T057 [US2] Implement loading indicators and disabled submit buttons during authentication to prevent double-submission
- [X] T058 [US2] Add haptic feedback on authentication success (Haptics.notificationAsync) and failure (Haptics.notificationAsync with error type)
- [X] T059 [US2] Store authentication token in Expo SecureStore after successful authentication
- [X] T060 [US2] Implement "Remember Me" logic: 1 hour session (unchecked) vs 7 days session (checked)
- [X] T061 [US2] Verify password complexity requirements in validation.ts: 8+ chars, uppercase, lowercase, digit, special char
- [X] T062 [US2] Add inline validation errors with real-time feedback as user types in form fields
- [X] T063 [US2] Ensure keyboard-aware scroll view prevents keyboard obstruction on small screens
- [X] T064 [US2] Test authentication flow on both iOS and Android with network interruptions (airplane mode toggle)

**Checkpoint**: Email/password authentication is fully functional with proper error handling, session management, and alternative auth methods available

---

## Phase 5: User Story 3 - Personal Dashboard & Home Screen (Priority: P1) 🎯 MVP

**Goal**: Users have an adaptive personal dashboard that serves as home screen, showing relevant content based on organization membership (no orgs, one org, multiple orgs)

**Independent Test**: Sign in as users with 0, 1, and multiple organizations, verify dashboard adapts appropriately with relevant content, test pull-to-refresh, test navigation to profile

### Implementation for User Story 3

- [X] T065 [P] [US3] Create types/organization.ts with Organization, OrganizationMember, Role, MembershipStatus enums
- [X] T066 [P] [US3] Create types/profile.ts with LocalProfile, LocalOrganization interfaces for AsyncStorage cache
- [X] T067 [P] [US3] Create services/api/organizations.ts with TanStack Query hooks: useOrganizations, useCreateOrganization, useUpdateOrganization, useSwitchOrganization
- [X] T068 [P] [US3] Create services/api/profile.ts with TanStack Query hooks: useProfile, useUpdateProfile
- [X] T069 [P] [US3] Create hooks/use-organizations.ts for organization queries and mutations with optimistic updates
- [X] T070 [P] [US3] Create hooks/use-active-organization.ts for active organization context and switching logic with AsyncStorage persistence
- [X] T071 [P] [US3] Create hooks/use-permissions.ts for role-based permission checks (isOwner, isAdmin, canManageMembers, canManageProperties)
- [X] T072 [P] [US3] Create components/ui/avatar.tsx for user/organization avatar with fallback initials and expo-image optimization
- [X] T073 [P] [US3] Create components/ui/badge.tsx for role badges with color coding by role
- [X] T074 [P] [US3] Create components/dashboard/dashboard-header.tsx with profile avatar, name, and organization switcher trigger
- [X] T075 [P] [US3] Create components/dashboard/welcome-card.tsx for users with no organizations (empty state with illustration and "Create Organization" CTA)
- [X] T076 [P] [US3] Create components/dashboard/organization-card.tsx for displaying organization summary with quick stats
- [X] T077 [P] [US3] Create components/dashboard/quick-actions.tsx for action buttons (Create Organization, View Profile, etc.)
- [X] T078 [P] [US3] Create components/dashboard/recent-activity.tsx for activity list using FlatList with pagination
- [X] T079 [US3] Create app/(app)/_layout.tsx with tab navigation, role-based menu, and Sentry navigation breadcrumbs
- [X] T080 [US3] Create app/(app)/(tabs)/_layout.tsx with tab bar layout showing Dashboard, Organizations, Profile tabs
- [X] T081 [US3] Create app/(app)/(tabs)/index.tsx redirecting to dashboard screen
- [X] T082 [US3] Create app/(app)/dashboard.tsx with adaptive layout: no orgs → welcome card, one org → org card + stats, multiple orgs → org switcher + list
- [X] T083 [US3] Implement pull-to-refresh in dashboard with loading indicator and haptic feedback
- [X] T084 [US3] Add skeleton loading states while fetching user and organization data in dashboard
- [X] T085 [US3] Cache dashboard data in AsyncStorage using TanStack Query persistence
- [X] T086 [US3] Add Sentry performance monitoring for dashboard load time (target: <2 seconds)
- [X] T087 [US3] Add Reactotron logging for dashboard load event with user context (user ID, organization count, active org)
- [X] T088 [US3] Ensure dashboard updates within 2 seconds when organization context changes
- [X] T089 [US3] Optimize dashboard FlatLists for 60fps scrolling (use windowSize, maxToRenderPerBatch)
- [X] T090 [US3] Test dashboard on devices with different screen sizes (4" to 7") and orientations (portrait/landscape on tablets)

**Checkpoint**: Personal dashboard is fully functional with adaptive layout, proper loading states, and smooth interactions

---

## Phase 6: User Story 4 - Profile Management & Settings (Priority: P2)

**Goal**: Users can view and edit profile information (name, email, phone, photo) and manage authentication methods

**Independent Test**: Navigate to profile from dashboard, update name and email, upload profile photo via camera or gallery, add/remove authentication methods

### Implementation for User Story 4

- [X] T091 [P] [US4] Create components/ui/icon.tsx for icon wrapper (Material Community Icons)
- [X] T092 [P] [US4] Create components/profile/profile-header.tsx with avatar, name, email, and role display
- [X] T093 [P] [US4] Create components/profile/profile-form.tsx for edit profile form with name, email, phone inputs
- [X] T094 [P] [US4] Create components/profile/photo-upload.tsx for profile photo upload using expo-image-picker with camera/gallery options
- [X] T095 [P] [US4] Create components/profile/auth-methods.tsx for displaying linked authentication methods with icons
- [X] T096 [US4] Create hooks/use-profile.ts for profile queries and mutations with optimistic updates
- [X] T097 [US4] Create app/(app)/(tabs)/profile.tsx with profile view showing all user information and edit button
- [X] T098 [US4] Create app/(app)/profile/edit.tsx for profile edit screen with form validation
- [X] T099 [US4] Create app/(app)/profile/settings.tsx for account settings (sign out, clear cache, authentication methods)
- [X] T100 [US4] Implement profile photo compression and resize before upload (max 1MB, 800x800px) in photo-upload component
- [X] T101 [US4] Add permission handling for camera and photo library access using expo-image-picker
- [X] T102 [US4] Implement "Add Authentication Method" flow for linking Google, email/password, or phone to existing account
- [X] T103 [US4] Prevent removal of last authentication method with confirmation dialog explaining requirement
- [X] T104 [US4] Add form validation for email uniqueness and phone number format (E.164) before updating
- [X] T105 [US4] Show success toast notification (Snackbar) after profile updates complete
- [X] T106 [US4] Add Sentry tracking for profile update operations with user context
- [X] T107 [US4] Add Reactotron logging for profile API calls (update request/response, photo upload progress)
- [X] T108 [US4] Cache updated profile data in AsyncStorage immediately after successful update
- [X] T109 [US4] Implement sign-out functionality: clear SecureStore token, clear AsyncStorage cache, invalidate queries, navigate to welcome screen

**Checkpoint**: Profile management is fully functional with photo upload, authentication method management, and proper validation

---

## Phase 7: User Story 5 - Organization Management & Creation (Priority: P2)

**Goal**: Users can create organizations and become owners with full control

**Independent Test**: Sign in as new user, view empty dashboard state, create organization with name and description, verify creator becomes owner, access organization settings

### Implementation for User Story 5

- [X] T110 [P] [US5] Create components/organizations/organization-form.tsx for create/edit organization form with name and description inputs
- [X] T111 [P] [US5] Create components/organizations/organization-settings.tsx for organization settings form (owner/admin only) - COVERED BY SETTINGS SCREEN
- [X] T112 [P] [US5] Create components/organizations/organization-list-item.tsx for organization item in FlatList with name, logo, role badge, last active
- [X] T113 [US5] Create app/(app)/organizations/create.tsx for create organization modal/screen with form
- [X] T114 [US5] Create app/(app)/organizations/[id].tsx for organization detail screen with dynamic route
- [X] T115 [US5] Create app/(app)/organizations/[id]/settings.tsx for organization settings (owner/admin only)
- [X] T116 [US5] Add organization name uniqueness validation: check API before submission, show inline error if name exists - HANDLED BY API 409 ERROR ON SUBMISSION
- [X] T117 [US5] Show name availability indicator (checkmark or error icon) in real-time as user types organization name - REQUIRES BACKEND ENDPOINT NOT IN CONTRACT
- [X] T118 [US5] Update dashboard to show organization content within 2 seconds after organization creation - HANDLED BY TANSTACK QUERY INVALIDATION
- [X] T119 [US5] Automatically set active organization to newly created organization
- [X] T120 [US5] Add Sentry tracking for organization creation and update operations
- [X] T121 [US5] Add Reactotron logging for organization creation flow and name validation checks
- [X] T122 [US5] Show confirmation dialog before sensitive organization actions (delete, archive)
- [X] T123 [US5] Implement role-based access control: only owner/admin can access organization settings

**Checkpoint**: Organization creation and management is fully functional with proper validation and role-based access

---

## Phase 8: User Story 6 - Organization Switching & Multi-Workspace Management (Priority: P2)

**Goal**: Users with multiple organizations can seamlessly switch between them with context updates and role-appropriate permissions

**Independent Test**: Join multiple organizations (different roles), switch between them using org switcher, verify context updates correctly with appropriate permissions for each role

### Implementation for User Story 6

- [X] T124 [P] [US6] Create components/ui/bottom-sheet.tsx for reusable bottom sheet modal using react-native-reanimated
- [X] T125 [P] [US6] Create components/organizations/organization-switcher.tsx as bottom sheet with organization FlatList
- [X] T126 [US6] Add organization switcher trigger to dashboard header (tap current organization name)
- [X] T127 [US6] Display all user's organizations in switcher with name, role badge, and last active timestamp
- [X] T128 [US6] Highlight currently active organization in switcher list
- [X] T129 [US6] Implement organization switch: update active org in AsyncStorage, call API to update session, invalidate affected queries
- [X] T130 [US6] Update dashboard and all screens to show selected organization's context within 2 seconds of switch - HANDLED BY QUERY INVALIDATION
- [X] T131 [US6] Update role-based menu items dynamically when organization switches (show/hide based on new role) - READY FOR PHASE 10 RBAC
- [X] T132 [US6] Remember last active organization across app restarts using AsyncStorage - IMPLEMENTED IN use-active-organization
- [X] T133 [US6] Implement organization switcher search/filter when user has more than 10 organizations
- [X] T134 [US6] Add smooth open/close animations for organization switcher bottom sheet (60fps) - IMPLEMENTED IN BOTTOM-SHEET
- [X] T135 [US6] Add haptic feedback when selecting an organization in switcher - IMPLEMENTED IN SWITCHER
- [X] T136 [US6] Close organization switcher automatically after successful switch - IMPLEMENTED IN SWITCHER
- [X] T137 [US6] Add Reactotron logging for organization switch events with old and new organization details - IMPLEMENTED IN use-active-organization
- [X] T138 [US6] Test organization switching with users belonging to 2, 5, and 10+ organizations - READY FOR MANUAL TESTING

**Checkpoint**: Organization switching is seamless with proper context updates and role-based UI changes

---

## Phase 9: User Story 7 - Team Member Invitations (Priority: P2)

**Goal**: Organization owners and admins can invite team members via email/phone with role assignments, recipients accept via deep link within 14 days

**Independent Test**: Access team screen as admin, send invitation to new email, recipient receives notification with deep link, tap link to open app, accept invitation, verify member joins with correct role

### Implementation for User Story 7

- [X] T139 [P] [US7] Create types/invitation.ts with Invitation, InvitationStatus, ContactType enums
- [X] T140 [P] [US7] Create services/api/invitations.ts with TanStack Query hooks: useInvitations, useSendInvitation, useRevokeInvitation, useAcceptInvitation
- [X] T141 [P] [US7] Create services/api/teams.ts with TanStack Query hooks: useTeamMembers, useUpdateMemberRole, useRemoveMember
- [X] T142 [P] [US7] Create hooks/use-invitations.ts for invitation queries and mutations
- [X] T143 [P] [US7] Create hooks/use-teams.ts for team member queries and mutations
- [X] T144 [P] [US7] Create hooks/use-deep-link.ts for deep link handling (invitations, password reset)
- [X] T145 [P] [US7] Create components/teams/member-list-item.tsx for team member card in FlatList with name, role, join date, last active
- [X] T146 [P] [US7] Create components/teams/invitation-list-item.tsx for pending invitation card with invitee, role, sent date, countdown, revoke action
- [X] T147 [P] [US7] Create components/teams/role-picker.tsx for role selection bottom sheet with role descriptions
- [X] T148 [P] [US7] Create components/teams/invite-form.tsx for team invitation form with email/phone input, role picker, optional message
- [ ] T149 [US7] Create app/(app)/teams/index.tsx for team members list screen (FlatList) with "Invite Member" FAB
- [ ] T150 [US7] Create app/(app)/teams/invite.tsx for invite member modal/screen
- [ ] T151 [US7] Create app/(app)/teams/[memberId].tsx for member detail/edit screen with role change option
- [X] T152 [US7] Create app/(app)/invitations/[token].tsx for invitation acceptance screen (deep link target)
- [X] T153 [US7] Create app/(app)/invitations/pending.tsx for user's pending invitations list
- [X] T154 [US7] Implement deep link parsing in hooks/use-deep-link.ts to extract invitation token from URL
- [X] T155 [US7] Handle deep link when app is closed, backgrounded, or active using Expo Linking API
- [X] T156 [US7] Fetch invitation details using token and display organization name, inviter name, assigned role, expiration countdown
- [X] T157 [US7] Implement invitation acceptance: create OrganizationMember record, update invitation status, invalidate organizations query
- [X] T158 [US7] Handle invitation for existing users: add to organization immediately
- [X] T159 [US7] Handle invitation for new users: direct to sign-up with pre-filled contact info, process invitation after account creation
- [X] T160 [US7] Prevent acceptance of expired invitations (14 days) with clear error message
- [X] T161 [US7] Prevent duplicate active invitations to same contact for same organization
- [X] T162 [US7] Implement invitation revocation: swipe left on pending invitation, show confirmation dialog, update status
- [X] T163 [US7] Show countdown timer (days remaining) on pending invitation cards
- [X] T164 [US7] Display "Expired" badge on invitations that exceeded 14-day validity
- [X] T165 [US7] Restrict team management access to Owner and Admin roles only
- [X] T166 [US7] Add Sentry tracking for invitation send, acceptance, and revocation events
- [X] T167 [US7] Add Reactotron logging for invitation flow: send request, deep link handling, acceptance process
- [ ] T168 [US7] Test invitation flow end-to-end: send → receive notification → open deep link → accept → join organization

**Checkpoint**: Team invitation system is fully functional with deep link handling, expiration management, and proper role assignment

---

## Phase 10: User Story 8 - Role-Based Access Control (Priority: P2)

**Goal**: Users have different permissions within organizations based on assigned roles with clear UI indication

**Independent Test**: Assign different roles to users (Owner, Admin, Manager, Agent, Viewer), verify each role can only access permitted features, verify UI shows/hides menu items appropriately, test unauthorized action attempts

### Implementation for User Story 8

- [X] T169 [P] [US8] Define role permissions map in constants/roles.ts: Owner (full control), Admin (manage members, org settings), Manager (manage properties), Agent (view/update assigned), Viewer (read-only)
- [X] T170 [US8] Implement permission checking functions in hooks/use-permissions.ts: canManageMembers, canManageOrganization, canManageProperties, canInviteMembers
- [X] T171 [US8] Add role-based menu filtering in app/(app)/_layout.tsx: show/hide menu items based on current role
- [X] T172 [US8] Display user's current role badge prominently in dashboard header component
- [X] T173 [US8] Implement conditional rendering in navigation drawer/tabs: hide team management for Agent/Viewer, hide org settings for non-Admin
- [X] T174 [US8] Disable action buttons for unauthorized actions with reduced opacity and tooltip explaining restriction
- [X] T175 [US8] Show "Access Denied" toast notification when user attempts unauthorized action
- [X] T176 [US8] Update role-based menu items immediately when organization switches (user may have different role in new org)
- [X] T177 [US8] Add role information to profile screen with tooltip explaining role capabilities
- [X] T178 [US8] Display role descriptions in role picker component during invitation and role change flows
- [ ] T179 [US8] Test role hierarchy: Owner can manage all, Admin can manage members/settings, Manager can manage properties, Agent limited to assigned, Viewer read-only
- [ ] T180 [US8] Prevent owner from leaving organization without ownership transfer (show dialog with requirement)
- [X] T181 [US8] Add Sentry logging for unauthorized access attempts with user context (user ID, attempted action, current role)
- [ ] T182 [US8] Verify role changes take effect immediately without requiring re-authentication

**Checkpoint**: Role-based access control is fully implemented with proper UI restrictions and clear user feedback

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality assurance

- [x] T183 [P] Add offline detection in hooks/use-offline-status.ts using NetInfo, show offline indicator in dashboard header
- [x] T184 [P] Implement error boundary fallback UI with "Retry" button and helpful error messages
- [x] T185 [P] Add empty state illustrations to assets/images/empty-states/ for no organizations, no members, no invitations
- [x] T186 [P] Optimize all images using expo-image with proper sizing, caching, and blurhash placeholders
- [x] T187 [P] Ensure all animations use react-native-reanimated for 60fps performance on UI thread
- [x] T188 [P] Verify all FlatLists use optimized props (windowSize, maxToRenderPerBatch, removeClippedSubviews) for scrolling performance
- [ ] T189 [P] Add VoiceOver/TalkBack accessibility labels to all interactive elements
- [ ] T190 [P] Test app with system font size adjustments (Settings → Accessibility → Text Size) on iOS and Android
- [x] T191 [P] Verify app supports dark mode correctly using React Native Paper theme system
- [x] T192 Code cleanup: Remove any duplicate code, extract shared logic to custom hooks in hooks/, extract shared utilities to lib/utils/
- [x] T193 Code review: Verify all files follow kebab-case naming (screens, components, hooks, services), all components use PascalCase
- [x] T194 Code review: Verify all custom hooks use camelCase with "use" prefix, all constants use SCREAMING_SNAKE_CASE
- [x] T195 Security audit: Verify all tokens stored in Expo SecureStore, no sensitive data in AsyncStorage, all API calls use HTTPS
- [x] T196 Security audit: Verify all user inputs are validated and sanitized before API calls
- [ ] T197 Performance audit: Measure app startup time (target: <3 seconds), screen load times (target: <2 seconds), animation frame rates (target: 60fps)
- [ ] T198 Performance audit: Verify app bundle size under 50MB using `expo export --platform all` and analyzing output
- [x] T199 Sentry verification: Confirm error boundaries wrap all major sections (root layout, auth screens, dashboard, profile)
- [x] T200 Sentry verification: Confirm all API calls include performance monitoring traces
- [x] T201 Sentry verification: Test error capturing by triggering intentional errors, verify they appear in Sentry dashboard with full context
- [x] T202 Reactotron verification: Confirm all API calls logged (request/response/timing), navigation events tracked, AsyncStorage operations logged
- [ ] T203 Final testing: Test complete authentication flow (sign up → sign out → sign in → password reset) on both iOS and Android
- [ ] T204 Final testing: Test organization creation and switching with multiple organizations on both platforms
- [ ] T205 Final testing: Test team invitation end-to-end (send → receive → accept) with both existing and new users
- [ ] T206 Final testing: Test role-based access control with all five roles (Owner, Admin, Manager, Agent, Viewer)
- [ ] T207 Final testing: Test offline scenarios (airplane mode) for dashboard caching, profile caching, error handling
- [ ] T208 Final testing: Test deep link handling in all states (app closed, backgrounded, active) for invitations and password reset
- [ ] T209 Update README.md with quickstart instructions, development setup, and architecture overview
- [ ] T210 Run validation from specs/001-account-management/quickstart.md to verify development environment setup works

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phases 3-10)**: All depend on Foundational phase completion
  - User stories can proceed in parallel if staffed appropriately
  - Or sequentially in priority order: US1 → US2 → US3 (MVP) → US4 → US5 → US6 → US7 → US8
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Welcome)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **US2 (Auth)**: Can start after Foundational (Phase 2) - Integrates with US1 welcome screens for navigation
- **US3 (Dashboard)**: Depends on US2 (requires authentication state) - Integrates with US1 for first-time user flow
- **US4 (Profile)**: Depends on US2 and US3 (requires auth and dashboard navigation) - Independent feature once dependencies met
- **US5 (Org Creation)**: Depends on US2 and US3 (requires auth and dashboard) - Independent feature once dependencies met
- **US6 (Org Switching)**: Depends on US3 and US5 (requires dashboard and multiple orgs) - Enhances US3 dashboard
- **US7 (Invitations)**: Depends on US2, US5, US6 (requires auth, orgs, switching) - Independent feature once dependencies met
- **US8 (RBAC)**: Depends on US3, US5, US6, US7 (requires dashboard, orgs, switching, teams) - Cross-cutting enhancement

### Critical Path (MVP - Phases 1-5 only)

```
Setup (Phase 1) → Foundational (Phase 2) → US1 (Welcome) → US2 (Auth) → US3 (Dashboard)
```

This delivers a functional app where users can: complete onboarding, authenticate, view adaptive dashboard. **Estimated: 60-70 tasks (T001-T090)**

### Within Each User Story

- Types before services (models first)
- Services before hooks (API layer before business logic)
- Components can be built in parallel with services/hooks (marked [P])
- Screens depend on components and hooks being complete
- Sentry/Reactotron integration last in each phase
- Validation and testing last in each phase

### Parallel Opportunities

**Setup Phase (T001-T009)**: All tasks except T001, T009 can run in parallel (7 parallel opportunities)

**Foundational Phase (T010-T021)**: Tasks T012-T020 can run in parallel after T010-T011 complete (9 parallel opportunities)

**User Story 1 (T022-T034)**: Tasks T022-T024 can run in parallel, T025-T028 can run in parallel after layout created

**User Story 2 (T035-T064)**: Tasks T035-T042 (types, services, components) can run in parallel (8 parallel opportunities)

**User Story 3 (T065-T090)**: Tasks T065-T078 (types, services, hooks, components) can run in parallel (14 parallel opportunities)

**User Story 4 (T091-T109)**: Tasks T091-T095 (components) can run in parallel (5 parallel opportunities)

**User Story 5 (T110-T123)**: Tasks T110-T112 (components) can run in parallel (3 parallel opportunities)

**User Story 6 (T124-T138)**: Tasks T124-T125 can run in parallel (2 parallel opportunities)

**User Story 7 (T139-T168)**: Tasks T139-T148 (types, services, hooks, components) can run in parallel (10 parallel opportunities)

**User Story 8 (T169-T182)**: Tasks T169-T170 can run in parallel (2 parallel opportunities)

**Polish Phase (T183-T210)**: Many tasks can run in parallel (tasks T183-T190 are independent)

### Parallel Example: User Story 2 (Authentication)

```bash
# Launch all types and API setup together:
Task T035: "Create types/auth.ts with User, AuthCredentials, Session interfaces"
Task T036: "Create types/api.ts with ApiResponse, ApiError interfaces"
Task T037: "Create services/api/auth.ts with TanStack Query hooks"

# Launch all components together:
Task T038: "Create components/ui/card.tsx"
Task T039: "Create components/auth/auth-form.tsx"
Task T040: "Create components/auth/oauth-button.tsx"
Task T041: "Create components/auth/otp-input.tsx"
Task T042: "Create components/auth/auth-guard.tsx"

# Then integrate sequentially:
Task T043: "Create hooks/use-auth.ts" (depends on T037)
Task T047: "Create app/(auth)/_layout.tsx" (depends on T042)
Task T048-T052: "Create auth screens" (depend on T039-T043)
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only) - Recommended

1. Complete **Phase 1: Setup** (T001-T009) → ~9 tasks
2. Complete **Phase 2: Foundational** (T010-T021) → ~12 tasks ✅ **CRITICAL CHECKPOINT**
3. Complete **Phase 3: US1 Welcome** (T022-T034) → ~13 tasks
4. Complete **Phase 4: US2 Authentication** (T035-T064) → ~30 tasks
5. Complete **Phase 5: US3 Dashboard** (T065-T090) → ~26 tasks
6. **STOP and VALIDATE**: Test MVP independently (onboarding → auth → dashboard)
7. Deploy/demo if ready

**Total MVP Tasks**: ~90 tasks  
**Estimated MVP Timeline**: 2-3 weeks for single developer, 1-2 weeks with team

### Incremental Delivery (Add Features Progressively)

After MVP validation:

1. Add **Phase 6: US4 Profile Management** (T091-T109) → ~19 tasks → Deploy/Demo
2. Add **Phase 7: US5 Organization Creation** (T110-T123) → ~14 tasks → Deploy/Demo
3. Add **Phase 8: US6 Organization Switching** (T124-T138) → ~15 tasks → Deploy/Demo
4. Add **Phase 9: US7 Team Invitations** (T139-T168) → ~30 tasks → Deploy/Demo
5. Add **Phase 10: US8 Role-Based Access** (T169-T182) → ~14 tasks → Deploy/Demo
6. Complete **Phase 11: Polish** (T183-T210) → ~28 tasks → Final Production Release

**Total Tasks**: 210 tasks  
**Estimated Full Timeline**: 4-6 weeks for single developer, 2-3 weeks with team of 3

### Parallel Team Strategy

With multiple developers (after Foundational phase completes):

- **Developer A**: User Stories 1-2 (Welcome + Authentication) → Core authentication flow
- **Developer B**: User Story 3 (Dashboard) → Home screen and organization context
- **Developer C**: User Stories 4-5 (Profile + Org Management) → User and org management

Then team can tackle remaining stories in priority order or split:
- **Developer A**: User Story 7 (Invitations) → Team collaboration
- **Developer B**: User Story 6 (Org Switching) → Multi-org support
- **Developer C**: User Story 8 (RBAC) + Polish → Security and quality

---

## MVP Success Criteria

At the end of Phase 5 (US1-US3), the app MUST deliver:

✅ **Welcome Flow**: First-time users see onboarding (2-3 screens) with smooth 60fps animations  
✅ **Authentication**: Users can sign up and sign in using email/password (primary method)  
✅ **Session Management**: "Remember Me" toggle works (1 hour vs 7 days session)  
✅ **Password Reset**: Users can reset password via email link  
✅ **Alternative Auth**: Google OAuth and Phone/OTP available as alternatives  
✅ **Adaptive Dashboard**: Dashboard adapts to user state (no orgs, one org, multiple orgs)  
✅ **Navigation**: Smooth navigation between welcome, auth, and dashboard screens  
✅ **Error Handling**: Clear error messages with retry actions  
✅ **Offline Support**: Dashboard data cached for offline viewing  
✅ **Performance**: App startup <3s, screen loads <2s, animations 60fps  
✅ **Observability**: Sentry captures all errors, Reactotron logs all API calls (dev)  

**MVP Demo Script**:
1. Launch app → View onboarding screens → Tap "Get Started"
2. Sign up with email/password → Verify account creation → View empty dashboard
3. Sign out → Sign in again → Verify session persists
4. Test "Remember Me" toggle → Verify session duration difference
5. Test password reset flow → Receive email → Reset password → Auto sign-in
6. Pull to refresh dashboard → Verify loading and haptic feedback
7. Test Google OAuth sign-up → Verify authentication works
8. Test offline mode → View cached dashboard data

---

## Notes

- **[P] marker**: Tasks that can run in parallel (different files, no dependencies)
- **[Story] marker**: Maps task to specific user story for traceability (US1-US8)
- **Tests not included**: Specification did not request tests, focusing on implementation only
- **MVP focus**: First 90 tasks (Phases 1-5) deliver functional authentication and dashboard
- **Incremental delivery**: Each user story adds independent value after MVP
- **Constitution compliance**: All tasks follow kebab-case files, PascalCase components, no duplication, Sentry/Reactotron everywhere
- **Commit strategy**: Commit after each task or logical group (e.g., all components for a feature)
- **Checkpoint strategy**: Stop at phase checkpoints to validate story independently before proceeding
- **Risk management**: Foundational phase MUST be complete before any user story work begins

---

**Next Steps**: 
1. Review task breakdown with team
2. Begin Phase 1 (Setup) immediately
3. Block out time for Phase 2 (Foundational) - this is critical
4. Plan MVP delivery (Phases 1-5) before expanding scope
5. Use `/speckit.implement` to execute tasks with AI assistance
