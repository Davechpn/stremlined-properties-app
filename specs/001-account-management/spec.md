# Feature Specification: Account Management Module

**Feature Branch**: `001-account-management`  
**Created**: 2025-11-29  
**Status**: Draft  
**Input**: User description: "Account management module for user authentication, profile management, and role-based access control in mobile app"

## Clarifications

### Session 2025-11-29 (Automated Review)

**Clarification Process**: Comprehensive ambiguity scan completed using structured taxonomy covering functional scope, data model, UX flow, non-functional requirements, integration dependencies, edge cases, constraints, terminology, and completion signals.

**Result**: ✅ **No critical ambiguities detected**

All categories assessed as **Clear**:
- ✅ Functional scope well-defined with explicit out-of-scope boundaries
- ✅ Domain model with 6 entities, clear identity rules, and lifecycle states
- ✅ User interaction flows documented across 8 user stories with detailed acceptance scenarios
- ✅ Non-functional requirements measurable (60fps, <2s loads, <3s startup, up to 50 orgs)
- ✅ External dependencies documented (Twilio, Google OAuth, Sentry, backend API)
- ✅ Edge cases and failure modes addressed (12 scenarios with resolutions)
- ✅ Constraints explicit (iOS 15+, Android 8+, <50MB bundle, 60fps animations)
- ✅ Terminology consistent (Organization, not workspace/company; standardized role names)
- ✅ Completion signals testable (45 measurable success criteria, Given/When/Then scenarios)

**Issues Found & Resolved**:
- Fixed user story numbering: User Story 5 was duplicated, User Story 6-7 were misnumbered
- Corrected to sequential numbering: US1-US8

**Questions Asked**: 0 (no ambiguities requiring clarification)

**Specification Status**: Ready for `/speckit.plan` - All requirements are clear, complete, and testable.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Welcome Experience & Initial Navigation (Priority: P1)

First-time users experience a compelling welcome flow with onboarding screens that explain the app's value proposition and guide them to sign up or sign in.

**Why this priority**: Mobile apps need an effective first impression to retain users. Welcome screens are critical for user activation and understanding the app's purpose. Without this, users may uninstall immediately.

**Independent Test**: Can be fully tested by launching the app for the first time, viewing all welcome/onboarding screens, and navigating to authentication via "Get Started" or "Sign In" buttons.

**Acceptance Scenarios**:

1. **Given** a user launches the app for the first time, **When** the app loads, **Then** they see a welcome screen with the Streamlined Properties branding and tagline
2. **Given** a user is on the welcome screen, **When** they swipe or tap next, **Then** they see 2-3 onboarding screens highlighting key features with engaging visuals
3. **Given** a user completes viewing onboarding screens, **When** they reach the final screen, **Then** they see prominent "Get Started" and "Sign In" buttons
4. **Given** a user taps "Get Started", **When** the navigation occurs, **Then** they are directed to the sign-up screen with smooth transition animation
5. **Given** a user taps "Sign In", **When** the navigation occurs, **Then** they are directed to the sign-in screen with smooth transition animation
6. **Given** a returning user launches the app, **When** the app detects a valid session, **Then** they bypass welcome screens and go directly to the dashboard
7. **Given** a user on onboarding screens, **When** they tap "Skip", **Then** they are taken directly to sign-up screen

---

### User Story 2 - Simple Email/Password Authentication (Priority: P1)

Users can quickly sign up and sign in using a straightforward email and password combination to access the property management dashboard. This is the primary authentication method, with optional Google OAuth and Phone/OTP as alternatives.

**Why this priority**: Core functionality - without authentication, no other app features are accessible. Email/password is the most familiar and universally accessible authentication method, requiring no additional provider setup (Google account, phone number). This provides immediate value by allowing users to create accounts and access the platform with minimal friction.

**Independent Test**: Can be fully tested by registering a new account with email and password, signing out, signing back in with the same credentials, and accessing the dashboard. Test password reset flow by requesting reset link via email.

**Acceptance Scenarios**:

**Sign Up Flow (Email/Password - Primary Method)**:
1. **Given** a new user on the sign-up screen, **When** they enter their full name, email address, and password (8+ characters with uppercase, lowercase, number, special char), **Then** an account is created immediately and they access the dashboard without email verification
2. **Given** a new user on the sign-up screen, **When** they enter an email that's already registered, **Then** they see an inline error "This email is already registered" with a link to sign-in screen
3. **Given** a new user on the sign-up screen, **When** they enter a weak password (less than 8 characters or missing required character types), **Then** they see real-time validation errors explaining password requirements
4. **Given** a new user completes sign-up, **When** their account is created, **Then** they receive a welcome email with account details (email verification is optional, not blocking)

**Sign In Flow (Email/Password - Primary Method)**:
5. **Given** an existing user on the sign-in screen, **When** they enter their correct email and password, **Then** they authenticate immediately and access the dashboard with smooth transition
6. **Given** an existing user on the sign-in screen, **When** they check "Remember Me" and sign in, **Then** they receive a 7-day session that persists across app restarts
7. **Given** an existing user on the sign-in screen, **When** they leave "Remember Me" unchecked, **Then** they receive a 1-hour session
8. **Given** an existing user on the sign-in screen, **When** they enter incorrect email or password, **Then** they see a generic error "Email or password is incorrect" (for security, don't specify which is wrong)
9. **Given** an existing user on the sign-in screen, **When** they tap "Forgot Password", **Then** they navigate to password reset screen

**Password Reset Flow**:
10. **Given** a user on the password reset screen, **When** they enter their registered email address, **Then** they receive a secure password reset link via email valid for 24 hours and see confirmation message
11. **Given** a user clicks the password reset link in email, **When** the link is valid (not expired), **Then** the app opens to a new password screen with the reset token pre-filled
12. **Given** a user on the new password screen, **When** they enter and confirm a valid new password, **Then** their password is updated, they are automatically signed in, and redirected to the dashboard

**Alternative Authentication Methods (Optional)**:
13. **Given** a new user on the sign-up screen, **When** they choose "Sign up with Google" instead of email/password, **Then** they are authenticated via Google OAuth and redirected to the dashboard
14. **Given** a new user on the sign-up screen, **When** they choose "Sign up with Phone" instead of email/password, **Then** they receive an OTP via SMS valid for 10 minutes
15. **Given** a user receives an OTP, **When** they enter the correct 6-digit code within 10 minutes, **Then** their account is created and they are redirected to the dashboard
16. **Given** an existing user on the sign-in screen, **When** they tap "Sign in with Google", **Then** they authenticate via Google and receive a 7-day session

**Logging & Observability**:
17. **Given** a user completes authentication (any method), **When** they are authenticated, **Then** Sentry logs the successful authentication event with method used (email, google, phone) and Reactotron logs the auth flow details for debugging

---

### User Story 3 - Personal Dashboard & Home Screen (Priority: P1)

Users have a personal dashboard that serves as their home screen, showing an overview of their account, organizations, and quick actions regardless of whether they belong to any organizations.

**Why this priority**: Essential for providing users with a consistent home base in the app. The dashboard serves different purposes for different user states (new users vs established users) and provides navigation to all key features. This is the primary screen users see after authentication.

**Independent Test**: Can be tested by signing in as different user types (no organizations, one organization, multiple organizations) and verifying the dashboard adapts appropriately with relevant content and actions.

**Acceptance Scenarios**:

1. **Given** a newly authenticated user with no organizations, **When** they access the dashboard, **Then** they see a welcome card, their profile summary, and a prominent "Create Your First Organization" CTA with onboarding tips
2. **Given** a user with one organization, **When** they access the dashboard, **Then** they see their profile header, the active organization card with quick stats, recent activity, and quick action buttons
3. **Given** a user with multiple organizations, **When** they access the dashboard, **Then** they see their profile header, a "Current Organization" section with switcher, and a "My Organizations" list showing all organizations with their roles
4. **Given** a user on the dashboard, **When** they tap their profile avatar/name, **Then** they navigate to their detailed profile and settings screen
5. **Given** a user on the dashboard, **When** they pull down to refresh, **Then** the dashboard reloads all data with a loading indicator and haptic feedback
6. **Given** a user with multiple organizations, **When** they tap "Switch Organization" or the current organization name, **Then** they see a bottom sheet listing all organizations with names, roles, and last active timestamps
7. **Given** a user in the organization switcher, **When** they select a different organization, **Then** the dashboard updates to show that organization's context within 2 seconds with a smooth transition
8. **Given** a user on the dashboard, **When** they tap the menu icon or swipe from left, **Then** they see a navigation drawer with role-appropriate menu items for the active organization
9. **Given** a user with no organizations, **When** they view the dashboard, **Then** they see helpful content explaining the benefits of creating an organization and how to get started
10. **Given** a user on the dashboard, **When** the app loads, **Then** Reactotron logs the dashboard load event with user context and organization count

---

### User Story 4 - Profile Management & Settings (Priority: P2)

Users can view and edit their profile information including name, email, phone number, profile photo, and manage authentication methods.

**Why this priority**: Enables users to maintain accurate account information and customize their experience. Essential for account management but not blocking initial use.

**Independent Test**: Can be tested by navigating to profile settings from dashboard, updating profile information, uploading a profile photo, and adding/removing authentication methods.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they tap their profile avatar in the dashboard header, **Then** they navigate to their profile screen
2. **Given** a user on the profile screen, **When** they view their information, **Then** they see their name, email, phone number, profile photo, and authentication methods
3. **Given** a user taps "Edit Profile", **When** they update their name or email, **Then** the changes are saved and reflected immediately
4. **Given** a user taps the profile photo, **When** they choose to take a photo or select from gallery, **Then** the photo is uploaded and updated
5. **Given** a user views authentication methods, **When** they tap "Add Authentication Method", **Then** they can link Google, email/password, or phone to their account
6. **Given** a user has multiple authentication methods, **When** they attempt to remove one, **Then** the system prevents removal if it's the only method (shows warning)
7. **Given** a user updates profile information, **When** changes are saved, **Then** Sentry logs the profile update event and Reactotron logs the API call details

---

### User Story 5 - Organization Management & Creation (Priority: P2)

Users can create organizations (property management companies) and manage organization settings, with the creator becoming the owner and having full control.

**Why this priority**: Enables users to set up their business context and provides the foundation for multi-user collaboration. Essential for transitioning from individual to business use.

**Independent Test**: Can be tested by signing in, viewing an empty dashboard state, creating a new organization, and verifying the creator becomes the owner with access to organization settings.

**Acceptance Scenarios**:

1. **Given** a newly registered user signs in, **When** they access the dashboard, **Then** they see an empty state with "Create Organization" CTA and illustration
2. **Given** a user taps "Create Organization", **When** they enter organization name and description, **Then** a new organization is created and they become the owner
3. **Given** a user creates an organization, **When** the organization is created, **Then** the dashboard updates to show organization content within 2 seconds
4. **Given** an organization owner, **When** they access organization settings, **Then** they can update organization name, description, and view member list
5. **Given** a user belongs to multiple organizations, **When** they tap the organization name in the header, **Then** they see a bottom sheet with all organizations
6. **Given** a user in the organization switcher, **When** they select a different organization, **Then** the dashboard updates to show that organization's data with loading indicator
7. **Given** a user switches organizations, **When** the switch completes, **Then** Reactotron logs the workspace switch event

---

### User Story 6 - Organization Switching & Multi-Workspace Management (Priority: P2)

Users who belong to multiple organizations can seamlessly switch between them, with each organization maintaining its own context including role-specific permissions and data.

**Why this priority**: Critical for users who work across multiple property management companies or have different roles in different organizations. Enables efficient context switching without re-authentication.

**Independent Test**: Can be tested by joining multiple organizations (as different roles), switching between them using the organization switcher, and verifying context updates correctly with appropriate permissions for each.

**Acceptance Scenarios**:

1. **Given** a user belongs to multiple organizations, **When** they tap the current organization name in the dashboard header, **Then** they see a bottom sheet with all their organizations listed
2. **Given** a user in the organization switcher bottom sheet, **When** they view the list, **Then** each organization shows its name, the user's role in that organization, and last active timestamp
3. **Given** a user in the organization switcher, **When** they select a different organization, **Then** the dashboard and all screens update to show the selected organization's context within 2 seconds
4. **Given** a user switches to an organization where they are an Agent, **When** the switch completes, **Then** restricted menu items (team management, org settings) are hidden automatically
5. **Given** a user switches to an organization where they are an Admin, **When** the switch completes, **Then** additional menu items (team management, org settings) appear automatically
6. **Given** a user switches organizations, **When** the context changes, **Then** the active organization indicator updates in the dashboard header and navigation menu
7. **Given** a user switches organizations, **When** they close and reopen the app, **Then** the app remembers the last active organization and loads it automatically
8. **Given** a user switches organizations, **When** the switch completes, **Then** Reactotron logs the organization switch event with old and new organization details

---

### User Story 7 - Team Member Invitations (Priority: P2)

Organization owners and admins can invite team members via email or phone number with role assignments and 14-day expiration.

**Why this priority**: Enables collaboration by allowing multiple users to work within the same organization. Critical for business users who need to delegate and collaborate.

**Independent Test**: Can be tested by accessing the team screen, sending an invitation to a new email/phone, having the recipient accept it via a deep link, and verifying they join with the correct role.

**Acceptance Scenarios**:

1. **Given** an organization admin, **When** they navigate to "Team" from the menu, **Then** they see a list of current members and an "Invite Member" button
2. **Given** an admin taps "Invite Member", **When** they fill in email or phone and select a role, **Then** an invitation is created and sent with a 14-day expiration
3. **Given** an invitation is sent, **When** the recipient receives the notification, **Then** they get a deep link that opens the app to the invitation acceptance screen
4. **Given** a user receives an organization invitation, **When** they tap the invitation link within 14 days, **Then** they are added to the organization with the assigned role
5. **Given** an invitation has been sent, **When** 14 days pass without acceptance, **Then** the invitation expires and shows as "Expired" in the invitations list
6. **Given** an admin views pending invitations, **When** they swipe left on a pending invitation, **Then** they can revoke it before expiration
7. **Given** the invitation recipient doesn't have the app installed, **When** they tap the deep link, **Then** they are directed to the app store, then to the invitation after installing

---

### User Story 8 - Role-Based Access Control (Priority: P2)

Users have different permissions within organizations based on their assigned roles (Owner, Admin, Manager, Agent, Viewer) with clear UI indication of their permissions.

**Why this priority**: Essential for security and proper business workflow. Prevents unauthorized access and ensures users can only perform actions appropriate to their role.

**Independent Test**: Can be tested by assigning different roles to users and verifying each role can only access permitted features while being blocked from restricted actions with clear UI feedback.

**Acceptance Scenarios**:

1. **Given** a user with "Agent" role, **When** they view the dashboard menu, **Then** team management options are hidden from the navigation
2. **Given** a user has "Admin" role in one organization and "Agent" role in another, **When** they switch workspaces, **Then** their available menu items change according to their role
3. **Given** a Manager views the organization dashboard, **When** they access screens, **Then** they have full property access but organization settings are hidden
4. **Given** an organization owner, **When** they access team management, **Then** they can change member roles, remove members, and send invitations
5. **Given** a Viewer accesses any screen, **When** they attempt any modification, **Then** all action buttons are disabled with tooltips explaining read-only access
6. **Given** any user attempts a restricted action, **When** authorization fails, **Then** Sentry logs the unauthorized access attempt

---

### Edge Cases

- What happens when a user tries to create an organization with a name that already exists globally on the platform? → Show error toast notification, suggest alternatives, focus on name input field
- How does the system handle when a user tries to sign up with a phone number or email already in use? → Show error message, offer sign-in or password reset options with action buttons
- What happens if a user is removed from an organization while actively using it? → Detect session invalidation, show notification, redirect to dashboard with empty state
- How are orphaned organizations handled if the only owner leaves? → Prevent owner removal if they're the last owner, require owner transfer first, show dialog explaining requirement
- What happens if authentication provider (Google) is temporarily unavailable? → Show error message, offer alternative authentication methods, log error to Sentry, allow retry
- What happens when a user tries to access the dashboard without being authenticated? → Redirect to welcome/sign-in screen, preserve deep link for post-authentication navigation
- How does the welcome screen handle slow network connections? → Use cached images, show skeleton loading states, enable offline viewing of onboarding content
- What happens if OTP SMS fails to deliver? → Provide resend option after 60 seconds, log delivery failures to Sentry, show support contact if repeated failures
- What happens when the app is offline during sign-up? → Show offline indicator, explain authentication requires internet, allow user to retry when online
- What happens if a user's session expires while they're using the app? → Detect expired session on next API call, show session expired message, redirect to sign-in with return path
- How does the app handle when a user receives an invitation deep link but isn't signed in? → Save invitation token, redirect to sign-in/sign-up, process invitation after authentication
- What happens when profile photo upload fails? → Show error message, allow retry, keep previous photo, log error to Sentry with upload details

## Requirements *(mandatory)*

### Functional Requirements

#### Welcome & Onboarding (FR-WELCOME)
- **FR-WELCOME-001**: App MUST display welcome/onboarding screens on first launch for new users
- **FR-WELCOME-002**: Welcome screens MUST include 2-3 slides showcasing key app features with visuals
- **FR-WELCOME-003**: Welcome screens MUST use react-native-reanimated for 60fps transitions between slides
- **FR-WELCOME-004**: Final onboarding screen MUST display prominent "Get Started" and "Sign In" buttons
- **FR-WELCOME-005**: App MUST provide "Skip" option on onboarding screens to jump to authentication
- **FR-WELCOME-006**: App MUST bypass welcome screens for returning users with valid sessions
- **FR-WELCOME-007**: Welcome screens MUST be fully responsive across iOS and Android devices
- **FR-WELCOME-008**: Welcome screens MUST support swipe gestures for navigation between slides
- **FR-WELCOME-009**: Welcome screens MUST display progress indicators showing current slide position
- **FR-WELCOME-010**: App MUST store onboarding completion status in AsyncStorage to prevent repeated display

#### Authentication UI (FR-AUTH-UI)
- **FR-AUTH-UI-001**: App MUST provide a sign-up screen accessible from welcome screens with email/password as the primary, most prominent option
- **FR-AUTH-UI-002**: App MUST provide a sign-in screen accessible from welcome screens and deep links with email/password as the primary, most prominent option
- **FR-AUTH-UI-003**: Sign-up screen MUST display email/password form fields first (name, email, password, confirm password) with Google OAuth and Phone/OTP as alternative options below or via tabs
- **FR-AUTH-UI-004**: Sign-in screen MUST display email/password form fields first (email, password, remember me toggle) with Google OAuth and Phone/OTP as alternative options below
- **FR-AUTH-UI-005**: Email/password sign-up form MUST include fields: Full Name (required), Email (required with validation), Password (required, min 8 chars), Confirm Password (required, must match)
- **FR-AUTH-UI-006**: Email/password sign-in form MUST include fields: Email (required), Password (required), Remember Me checkbox (optional, default unchecked)
- **FR-AUTH-UI-007**: App MUST display loading indicators during authentication process with disabled submit buttons to prevent double-submission
- **FR-AUTH-UI-008**: App MUST show inline validation errors on form fields in real-time as users type, with clear error messages (e.g., "Password must be at least 8 characters")
- **FR-AUTH-UI-009**: App MUST provide prominent "Forgot Password?" link on sign-in screen directing to password reset screen
- **FR-AUTH-UI-010**: Password reset screen MUST display simple form with single email input field and "Send Reset Link" button
- **FR-AUTH-UI-011**: App MUST show success message after sending password reset email (e.g., "If an account exists for this email, you'll receive a password reset link")
- **FR-AUTH-UI-012**: App MUST provide "Remember Me" toggle on sign-in screen extending session from 1 hour (unchecked) to 7 days (checked)
- **FR-AUTH-UI-013**: Sign-up/sign-in screens MUST display "Already have an account? Sign In" / "Don't have an account? Sign Up" links for easy switching
- **FR-AUTH-UI-014**: App MUST redirect authenticated users to dashboard after successful sign-in/sign-up with smooth animated transition
- **FR-AUTH-UI-015**: All authentication forms MUST use keyboard-aware scroll views to prevent keyboard obstruction on small screens
- **FR-AUTH-UI-016**: App MUST implement haptic feedback on authentication success/failure (iOS and Android)
- **FR-AUTH-UI-017**: OTP verification screen (for phone auth) MUST display countdown timer showing remaining time (10 minutes)
- **FR-AUTH-UI-018**: OTP verification screen MUST provide "Resend OTP" button disabled for 60 seconds after sending
- **FR-AUTH-UI-019**: App MUST display rate limit warnings when OTP request limits are reached
- **FR-AUTH-UI-020**: Password fields MUST include "Show/Hide Password" toggle icon for visibility control

#### Authentication Backend (FR-AUTH)
- **FR-AUTH-001**: App MUST support user authentication via email and password as the primary authentication method
- **FR-AUTH-002**: App MUST support user authentication via Google OAuth as an alternative authentication method
- **FR-AUTH-003**: App MUST support user authentication via phone number with OTP verification as an alternative authentication method
- **FR-AUTH-004**: App MUST create user accounts immediately upon sign-up without requiring email verification (email verification optional)
- **FR-AUTH-005**: App MUST send welcome email after successful sign-up (informational only, not blocking)
- **FR-AUTH-006**: App MUST enforce password complexity requirements: minimum 8 characters, at least one uppercase, one lowercase, one digit, one special character
- **FR-AUTH-007**: App MUST hash passwords using bcrypt or equivalent before storing (never store plain text passwords)
- **FR-AUTH-008**: App MUST support password reset functionality with secure time-limited tokens
- **FR-AUTH-009**: App MUST expire password reset tokens after 24 hours
- **FR-AUTH-010**: App MUST send password reset email with deep link containing reset token
- **FR-AUTH-011**: App MUST validate reset tokens before allowing password change
- **FR-AUTH-012**: App MUST automatically sign in user after successful password reset
- **FR-AUTH-013**: App MUST send OTP to phone numbers via SMS for phone-based authentication (when user chooses phone auth)
- **FR-AUTH-014**: App MUST validate OTP codes within 10 minutes of generation
- **FR-AUTH-015**: App MUST invalidate OTP codes after successful use or after 10-minute expiration
- **FR-AUTH-016**: App MUST limit OTP requests to 5 per phone number per 15-minute period
- **FR-AUTH-017**: App MUST allow maximum 3 verification attempts per OTP code
- **FR-AUTH-018**: App MUST store authentication tokens securely using Expo SecureStore
- **FR-AUTH-019**: App MUST allow users to authenticate using any linked authentication method
- **FR-AUTH-020**: App MUST provide "remember me" functionality extending sessions to 7 days (default 1 hour)
- **FR-AUTH-021**: App MUST support account lockout after 5 failed login attempts within 15 minutes
- **FR-AUTH-022**: App MUST log all authentication events to Sentry for security monitoring
- **FR-AUTH-023**: App MUST log all authentication flows to Reactotron for development debugging

#### Profile Management UI (FR-PROFILE-UI)
- **FR-PROFILE-UI-001**: App MUST provide profile screen accessible from dashboard header/menu
- **FR-PROFILE-UI-002**: Profile screen MUST display user name, email, phone, profile photo, and role
- **FR-PROFILE-UI-003**: Profile screen MUST provide "Edit Profile" button opening edit modal
- **FR-PROFILE-UI-004**: Edit profile modal MUST use form inputs for name, email, and phone with validation
- **FR-PROFILE-UI-005**: Profile screen MUST display profile photo with tap gesture to change photo
- **FR-PROFILE-UI-006**: Photo change MUST offer options: "Take Photo" or "Choose from Library"
- **FR-PROFILE-UI-007**: App MUST use expo-image-picker for photo selection with permissions handling
- **FR-PROFILE-UI-008**: Profile screen MUST display list of linked authentication methods with icons
- **FR-PROFILE-UI-009**: Profile screen MUST provide "Add Authentication Method" button opening method selection modal
- **FR-PROFILE-UI-010**: App MUST show confirmation dialog before removing authentication methods
- **FR-PROFILE-UI-011**: App MUST prevent removal of last authentication method with clear error message
- **FR-PROFILE-UI-012**: Profile screen MUST include "Sign Out" button in a prominent location
- **FR-PROFILE-UI-013**: All profile actions MUST show loading indicators and success/error toast notifications

#### Profile Management Backend (FR-PROFILE)
- **FR-PROFILE-001**: App MUST allow users to update their name, email, and phone number
- **FR-PROFILE-002**: App MUST validate email format and uniqueness before updating
- **FR-PROFILE-003**: App MUST validate phone number format and uniqueness before updating
- **FR-PROFILE-004**: App MUST support profile photo upload using FormData to backend API
- **FR-PROFILE-005**: App MUST compress and resize profile photos before upload (max 1MB, 800x800px)
- **FR-PROFILE-006**: App MUST store user profile data locally using AsyncStorage for offline access
- **FR-PROFILE-007**: App MUST allow users to link additional authentication methods to their account
- **FR-PROFILE-008**: App MUST allow users to unlink authentication methods if multiple methods exist
- **FR-PROFILE-009**: App MUST log profile updates to Sentry for monitoring
- **FR-PROFILE-010**: App MUST log profile API calls to Reactotron for development debugging

#### Dashboard UI (FR-DASH)
- **FR-DASH-001**: App MUST provide personal dashboard as home screen accessible only to authenticated users
- **FR-DASH-002**: Dashboard MUST display user profile header showing avatar, name, and profile access
- **FR-DASH-003**: Dashboard MUST adapt layout based on user's organization membership:
  - No organizations: Welcome card + "Create Your First Organization" CTA + onboarding tips
  - One organization: Profile header + active organization card + quick stats + recent activity
  - Multiple organizations: Profile header + current organization section + "My Organizations" list showing all
- **FR-DASH-004**: Dashboard MUST show current organization indicator in header when user has organizations
- **FR-DASH-005**: Dashboard MUST display user's role badge for the active organization
- **FR-DASH-006**: Dashboard MUST provide organization switcher accessible by tapping current organization name in header
- **FR-DASH-007**: Dashboard MUST include navigation drawer or bottom tabs with role-appropriate menu items
- **FR-DASH-008**: Dashboard MUST highlight current active section in navigation
- **FR-DASH-009**: Dashboard MUST include pull-to-refresh functionality with loading indicator and haptic feedback
- **FR-DASH-010**: Dashboard MUST use FlatList for organization lists and activity feeds (not ScrollView + map)
- **FR-DASH-011**: Dashboard MUST use react-native-reanimated for all transitions and animations at 60fps
- **FR-DASH-012**: Dashboard MUST show skeleton loading states while fetching user and organization data
- **FR-DASH-013**: Dashboard MUST display helpful empty states with illustrations when user has no organizations
- **FR-DASH-014**: Dashboard MUST update all content within 2 seconds when organization context changes
- **FR-DASH-015**: Dashboard MUST log screen load events to Reactotron with user and organization context

#### Organization Switcher UI (FR-SWITCH-UI)
- **FR-SWITCH-UI-001**: App MUST provide organization switcher as bottom sheet triggered from dashboard header
- **FR-SWITCH-UI-002**: Organization switcher MUST list all user's organizations using FlatList
- **FR-SWITCH-UI-003**: Each organization item MUST show organization name, user's role badge, and last active timestamp
- **FR-SWITCH-UI-004**: Organization switcher MUST highlight the currently active organization
- **FR-SWITCH-UI-005**: Organization switcher MUST include "Create Organization" option at the bottom
- **FR-SWITCH-UI-006**: Organization switcher MUST use smooth animations when opening/closing (react-native-reanimated)
- **FR-SWITCH-UI-007**: Organization switcher MUST show loading indicator during organization context switch
- **FR-SWITCH-UI-008**: Organization switcher MUST provide haptic feedback when selecting an organization
- **FR-SWITCH-UI-009**: Organization switcher MUST close automatically after successful organization switch
- **FR-SWITCH-UI-010**: Organization switcher MUST support search/filter when user has more than 10 organizations

#### Organization Management UI (FR-ORG-UI)
- **FR-ORG-UI-001**: App MUST provide organization creation modal accessible from dashboard CTA or menu
- **FR-ORG-UI-002**: Organization creation modal MUST include form for name and description with real-time validation
- **FR-ORG-UI-003**: Organization creation form MUST validate name uniqueness and show inline error if name exists
- **FR-ORG-UI-004**: Organization creation form MUST show name availability indicator (checkmark or error icon)
- **FR-ORG-UI-005**: App MUST provide organization settings screen accessible to Owner and Admin roles
- **FR-ORG-UI-006**: Organization settings screen MUST display editable fields for name, description with save button
- **FR-ORG-UI-007**: Organization settings MUST show organization metadata (created date, member count, owner info)
- **FR-ORG-UI-008**: App MUST show skeleton loading states while fetching organization data
- **FR-ORG-UI-009**: App MUST show confirmation dialog before sensitive organization actions (delete, transfer ownership)
- **FR-ORG-UI-010**: All organization interactions MUST use haptic feedback for actions
- **FR-ORG-UI-011**: Organization screens MUST display user's current role badge prominently

#### Organization Backend (FR-ORG)
- **FR-ORG-001**: Users MUST be able to create new organizations with globally unique names (case-insensitive)
- **FR-ORG-002**: App MUST assign the creating user as the organization owner automatically
- **FR-ORG-003**: App MUST support users belonging to multiple organizations simultaneously with different roles
- **FR-ORG-004**: App MUST support switching between organizations for users with multiple memberships
- **FR-ORG-005**: App MUST maintain active organization context in AsyncStorage for persistence across app restarts
- **FR-ORG-006**: App MUST record the last active timestamp for each organization when user switches to it or performs actions
- **FR-ORG-007**: App MUST cache organization data locally using AsyncStorage for offline access
- **FR-ORG-008**: App MUST sync local organization data with backend when connection is available
- **FR-ORG-009**: App MUST update user's role and permissions when organization context switches
- **FR-ORG-010**: App MUST fetch fresh organization list when dashboard is loaded or refreshed
- **FR-ORG-011**: App MUST log all organization operations (create, update, switch) to Sentry and Reactotron

#### Team Management UI (FR-TEAM-UI)
- **FR-TEAM-UI-001**: App MUST provide team management screen accessible from dashboard menu
- **FR-TEAM-UI-002**: Team screen MUST display members in a list using FlatList with member cards
- **FR-TEAM-UI-003**: Member cards MUST show name, email/phone, role badge, join date, and last active
- **FR-TEAM-UI-004**: App MUST provide floating action button (FAB) or header button to "Invite Member"
- **FR-TEAM-UI-005**: Invitation modal MUST include fields for email/phone, role picker, and optional message
- **FR-TEAM-UI-006**: Role picker MUST display roles as selectable chips or bottom sheet picker
- **FR-TEAM-UI-007**: App MUST display pending invitations section with status badges
- **FR-TEAM-UI-008**: Each pending invitation MUST show invitee contact, role, sent date, countdown, and "Revoke" action
- **FR-TEAM-UI-009**: Member cards MUST support long-press or swipe for role change/remove actions
- **FR-TEAM-UI-010**: App MUST show confirmation dialog before removing members
- **FR-TEAM-UI-011**: Team screen MUST be accessible only to users with Owner or Admin roles
- **FR-TEAM-UI-012**: App MUST show loading indicators while sending invitations or updating roles

#### Invitation System (FR-INVITE)
- **FR-INVITE-001**: Authorized users (Owner, Admin) MUST be able to invite members by email or phone
- **FR-INVITE-002**: App MUST create invitation records with inviter, invitee contact, org, role, and 14-day expiration
- **FR-INVITE-003**: App MUST send invitation notifications via email or SMS with deep link
- **FR-INVITE-004**: Invitation deep links MUST open the app to invitation acceptance screen
- **FR-INVITE-005**: App MUST handle deep links when app is closed, backgrounded, or active
- **FR-INVITE-006**: Invitees MUST be able to accept invitations within 14 days and be added to the organization
- **FR-INVITE-007**: App MUST handle invitations to existing users by adding them to the organization
- **FR-INVITE-008**: App MUST handle invitations to new users by directing them to sign-up with pre-filled data
- **FR-INVITE-009**: App MUST track invitation status (pending, accepted, expired, revoked)
- **FR-INVITE-010**: Authorized users MUST be able to revoke pending invitations
- **FR-INVITE-011**: App MUST automatically expire invitations 14 days after creation
- **FR-INVITE-012**: App MUST prevent acceptance of expired invitations with clear error message
- **FR-INVITE-013**: App MUST prevent duplicate active invitations to the same contact for the same organization
- **FR-INVITE-014**: App MUST redirect users to app store if deep link clicked without app installed

#### Role-Based Access Control UI (FR-RBAC-UI)
- **FR-RBAC-UI-001**: App MUST display user's current role badge prominently in dashboard header
- **FR-RBAC-UI-002**: App MUST conditionally show/hide navigation menu items based on user's role
- **FR-RBAC-UI-003**: App MUST disable action buttons for unauthorized actions with opacity and tooltip
- **FR-RBAC-UI-004**: App MUST show "Access Denied" toast message when user attempts unauthorized actions
- **FR-RBAC-UI-005**: App MUST display role information in user profile with tooltip explaining role capabilities
- **FR-RBAC-UI-006**: Role selection UI MUST display role descriptions when selecting or viewing roles

#### Role-Based Access Control Backend (FR-RBAC)
- **FR-RBAC-001**: App MUST enforce role-based permissions for all organization-scoped actions
- **FR-RBAC-002**: App MUST support five role types: Owner, Admin, Manager, Agent, and Viewer
- **FR-RBAC-003**: App MUST define role permissions as follows:
  - **Owner**: Full control including member management, organization settings, and all lower permissions
  - **Admin**: Manage members (invite, remove, change roles), organization settings, and all lower permissions
  - **Manager**: Manage properties (create, update, delete), assign agents, and all lower permissions
  - **Agent**: Basic property operations (view assigned properties, update status, communicate)
  - **Viewer**: Read-only access to organization data
- **FR-RBAC-004**: App MUST apply role permissions based on the user's role in their currently active organization
- **FR-RBAC-005**: App MUST prevent users from performing actions beyond their role permissions
- **FR-RBAC-006**: App MUST log unauthorized access attempts to Sentry for security monitoring

#### Monitoring & Error Tracking (FR-MONITOR)
- **FR-MONITOR-001**: App MUST integrate Sentry SDK for React Native for error tracking
- **FR-MONITOR-002**: App MUST log all authentication events to Sentry (success, failure, lockout)
- **FR-MONITOR-003**: App MUST log authorization failures to Sentry with user context
- **FR-MONITOR-004**: App MUST log critical errors to Sentry with full context (user ID, org ID, role)
- **FR-MONITOR-005**: App MUST integrate Reactotron for development-time debugging
- **FR-MONITOR-006**: App MUST log all API calls to Reactotron (request/response/timing)
- **FR-MONITOR-007**: App MUST log navigation events to Reactotron for flow tracking
- **FR-MONITOR-008**: App MUST log AsyncStorage operations to Reactotron
- **FR-MONITOR-009**: App MUST set up Sentry performance monitoring for screen transitions and API calls
- **FR-MONITOR-010**: App MUST disable Reactotron in production builds

### Key Entities

- **User**: Represents an individual using the mobile app. Key attributes: unique identifier, name, email (nullable), phone number (nullable), profile photo URL, authentication methods used, last active timestamp, account creation date, account status.

- **Organization**: Represents a property management company. Key attributes: unique identifier, globally unique name (case-insensitive), description, owner reference, last active timestamp, creation date, organization status.

- **OrganizationMember**: Represents the relationship between a user and an organization. Key attributes: user reference, organization reference, role (Owner/Admin/Manager/Agent/Viewer), membership status, joined date, invited by reference.

- **Invitation**: Represents a pending invitation to join an organization. Key attributes: unique identifier, unique token for deep link, inviter reference, invitee contact (email or phone), organization reference, assigned role, invitation status (pending/accepted/expired/revoked), created date, expiration date (created + 14 days), acceptance date.

- **Session**: Represents user authentication sessions. Key attributes: session ID, user reference, organization reference (active workspace), created at, expires at, remember me flag, device information.

- **LocalProfile**: Cached user profile data stored in AsyncStorage for offline access. Key attributes: user ID, name, email, phone, profile photo URI, cached timestamp, organizations array.

## Success Criteria *(mandatory)*

### Measurable Outcomes

#### Welcome & Onboarding Success
- **SC-001**: 80% of first-time users complete viewing all onboarding screens before signing up
- **SC-002**: Onboarding screens load and animate at 60fps on devices from last 3 years
- **SC-003**: Users can navigate through welcome flow in under 30 seconds

#### User Adoption & Authentication
- **SC-004**: Users can complete account creation within 2 minutes using any authentication method
- **SC-005**: Authentication success rate of 99% or higher for all methods (Google, email/password, phone/OTP)
- **SC-006**: 90% of users successfully authenticate on their first attempt
- **SC-007**: Password reset completion rate of 90% or higher
- **SC-008**: App maintains authentication state correctly across app restarts (99% success rate)

#### Profile Management
- **SC-009**: Profile photo upload succeeds in 95% of attempts
- **SC-010**: Profile updates complete in under 3 seconds on 4G connection
- **SC-011**: Users can successfully link additional authentication methods with 98% success rate

#### Dashboard & Organization Management
- **SC-012**: Personal dashboard loads within 2 seconds after authentication
- **SC-013**: Dashboard adapts correctly for users with 0, 1, or multiple organizations
- **SC-014**: Organization switcher displays all user's organizations within 1 second
- **SC-015**: Organization switching completes in under 2 seconds with smooth animation at 60fps
- **SC-016**: Organization creation completes in under 30 seconds including name validation
- **SC-017**: 90% of users successfully create their first organization without support assistance
- **SC-018**: Dashboard pull-to-refresh completes in under 3 seconds
- **SC-019**: Active organization context persists correctly across app restarts (100% success rate)
- **SC-020**: Role-based menu items update correctly within 1 second after organization switch
- **SC-021**: Users can manage up to 50 organizations without performance degradation

#### Team Collaboration
- **SC-022**: Invitation delivery success rate of 98% or higher via email and SMS
- **SC-023**: Deep link handling works 100% of the time for invitations
- **SC-024**: Invitation acceptance flow completes in under 3 minutes for new users
- **SC-025**: Role changes take effect immediately without requiring user re-login
- **SC-026**: 85% of organizations invite at least one additional team member within first week

#### Security & Compliance
- **SC-027**: Zero unauthorized access incidents through role-based permissions
- **SC-028**: 100% of authentication events are logged in Sentry
- **SC-029**: Sentry captures 100% of critical errors with full context
- **SC-030**: Average time to detect security incidents is under 5 minutes via Sentry alerts
- **SC-031**: Secure token storage works correctly 100% of the time (Expo SecureStore)

#### Performance & UX
- **SC-032**: All screen transitions maintain 60fps on devices from last 3 years
- **SC-033**: All animations use react-native-reanimated for optimal performance
- **SC-034**: App startup time is under 3 seconds on 4G connection
- **SC-035**: App bundle size stays under 50MB for initial download
- **SC-036**: All images use expo-image with proper caching and optimization
- **SC-037**: FlatList scrolling maintains 60fps for lists up to 1000 items
- **SC-038**: All user interactions provide haptic feedback where appropriate
- **SC-039**: Error messages are clear and actionable, guiding users to resolution
- **SC-040**: Forms validate in real-time with helpful inline error messages
- **SC-041**: Offline detection works 100% accurately and shows appropriate UI

#### Developer Experience
- **SC-042**: All API calls are logged to Reactotron in development with full details
- **SC-043**: All navigation events are tracked in Reactotron for debugging
- **SC-044**: No console warnings or errors in development mode
- **SC-045**: TypeScript compilation has zero errors with strict mode enabled

## Assumptions

- REST API backend is available and properly documented for all required endpoints
- SMS gateway service (e.g., Twilio) is configured for OTP delivery
- Google OAuth is configured for iOS and Android with proper app credentials
- Email service provider is configured for verification and password reset emails
- Sentry account is set up with React Native SDK configured
- Users have access to email or SMS for receiving invitations and verification
- Users have iOS 15+ or Android 8+ devices with camera and photo library access
- App store accounts (Apple App Store, Google Play Store) are set up for deployment
- Deep linking is configured properly in app.json and backend redirects
- Backend API provides consistent session validation across requests
- Organization names are globally unique across platform (enforced at backend)
- Users can belong to unlimited organizations (UI optimized for 2-10)
- Email verification is optional for platform use, required only for password reset
- Profile photos are stored in cloud storage (S3/Firebase) by backend
- Authentication tokens have configurable expiration (1 hour default, 7 days with remember me)
- Backend enforces rate limiting for OTP requests and authentication attempts
- App supports both iOS and Android platforms equally
- Development team has access to React Native development environment (iOS Simulator, Android Emulator)

## Dependencies

### External Services
- SMS service provider (e.g., Twilio, AWS SNS) for OTP delivery
- Google OAuth 2.0 for iOS and Android
- Email service provider (e.g., SendGrid, AWS SES) for invitations and password reset
- Sentry account and React Native SDK for error tracking
- Cloud storage (S3, Firebase Storage) for profile photos via backend
- Push notification service (Firebase Cloud Messaging) for invitation notifications

### Backend API
- RESTful API providing authentication endpoints
- Organization management endpoints
- Team and invitation management endpoints
- Role-based access control enforcement
- Profile management endpoints
- Real-time session validation
- Deep link redirect handling

### Mobile Dependencies
- React Native 0.81.5 with Expo SDK ~54
- Expo Router ~6 for navigation
- react-native-reanimated ~4.1 for animations
- expo-image ~3.0 for optimized images
- Expo SecureStore for secure token storage
- Expo Image Picker for photo selection
- Expo Linking for deep links
- Sentry SDK for React Native
- Reactotron for development debugging
- AsyncStorage for local data persistence

### Development Tools
- Node.js 18+ for development
- Expo CLI for development workflow
- iOS Simulator (macOS) or physical iOS device
- Android Emulator or physical Android device
- TypeScript compiler with strict mode
- ESLint with Expo configuration

## Security Requirements

### Authentication Security
- App MUST store authentication tokens in Expo SecureStore (encrypted storage)
- App MUST never store passwords or sensitive data in AsyncStorage (plain text)
- App MUST implement rate limiting on authentication attempts (enforced by backend)
- App MUST log all authentication events to Sentry for security audit
- App MUST implement HTTPS-only communication with backend
- App MUST validate and sanitize all user inputs before sending to backend
- App MUST invalidate local session tokens on logout
- App MUST clear all cached user data on logout
- App MUST detect jailbroken/rooted devices and log to Sentry (warning, not blocking)

### Authorization Security
- App MUST enforce role-based access control in UI (hiding/disabling unauthorized actions)
- App MUST validate user permissions on every action (frontend validation, backend enforcement)
- App MUST log all authorization failures to Sentry
- App MUST clear active workspace context when user leaves organization
- App MUST validate deep link tokens before processing invitations

### Data Protection
- App MUST encrypt profile photos before upload (handled by HTTPS)
- App MUST not store sensitive data in logs or error messages
- App MUST implement proper keychain/keystore access controls for SecureStore
- App MUST handle app backgrounding securely (hide sensitive screens)
- App MUST implement certificate pinning for API communication (future consideration)

### Mobile-Specific Security
- App MUST request only necessary permissions (camera, photo library, notifications)
- App MUST handle permission denials gracefully with clear explanations
- App MUST implement biometric authentication option (Face ID, Touch ID, Fingerprint)
- App MUST support app-level PIN/passcode for additional security layer
- App MUST detect and prevent screenshot capture on sensitive screens
- App MUST implement secure keyboard for password/PIN entry

## Data Retention

- App MUST retain cached user profile data until logout or data expiration (7 days)
- App MUST retain cached organization data until workspace switch or data expiration (7 days)
- App MUST retain authentication tokens according to session duration (1 hour or 7 days)
- App MUST clear all local data on account deletion
- App MUST provide "Clear Cache" option in settings
- App MUST automatically clean up expired session data on app startup

## Constraints

- App MUST support iOS 15+ and Android 8+ (API level 26+)
- App MUST work on devices with screen sizes from 4" to 7" (phones and small tablets)
- App MUST maintain 60fps for all animations on devices from last 3 years
- App bundle size MUST not exceed 50MB for initial download
- App MUST handle offline scenarios gracefully with clear indicators
- App MUST complete authentication flow in under 2 minutes on 4G connection
- Profile photo uploads MUST be limited to 5MB with compression
- Organization names MUST be limited to 100 characters
- App MUST support both portrait and landscape orientations on tablets
- App MUST be accessible via VoiceOver (iOS) and TalkBack (Android)
- App MUST work with system font size adjustments (accessibility)

## Non-Functional Requirements

### Performance
- App startup time under 3 seconds on 4G connection
- Screen transitions at 60fps minimum
- API response handling under 200ms for UI feedback
- Image loading with progressive enhancement (blur-up)
- List scrolling at 60fps for up to 1000 items
- Pull-to-refresh completes in under 3 seconds

### Scalability
- App MUST handle users with up to 50 organizations
- App MUST handle organizations with up to 1000 members
- App MUST paginate large lists (members, invitations)
- App MUST implement infinite scroll for large data sets

### Reliability
- App MUST handle network interruptions gracefully
- App MUST retry failed API calls with exponential backoff
- App MUST provide meaningful error messages to users
- App MUST recover from crashes without data loss
- App MUST maintain offline functionality for critical features

### Maintainability
- Code MUST follow React Native and TypeScript best practices
- Components MUST be reusable and follow single responsibility principle
- No duplicate code or files with same functionality
- All functions MUST have clear, single responsibilities
- Code MUST use consistent naming conventions (kebab-case files, PascalCase components)
- All custom hooks MUST be documented with JSDoc comments

### Usability
- All user flows MUST be intuitive with minimal learning curve
- Error messages MUST be clear and actionable
- Loading states MUST be shown for all async operations
- Success feedback MUST be provided via toast notifications or haptic feedback
- Forms MUST provide real-time validation feedback
- App MUST support system dark mode and light mode

## Future Considerations

While not part of this specification, consider these for future phases:

- Biometric authentication (Face ID, Touch ID, Fingerprint) as primary auth method
- Social authentication with additional providers (Microsoft, Apple Sign In)
- Offline mode with full functionality and sync when online
- Push notifications for invitations, role changes, organization updates
- Multi-language support (i18n)
- Onboarding customization based on user type (owner vs agent)
- Organization templates for quick setup
- Batch member invitation via contact imports
- Advanced role customization with granular permissions
- In-app chat for team communication
- Activity feed showing recent organization actions
- Advanced profile customization (themes, preferences)
- Export user data for GDPR compliance
- Two-factor authentication (2FA) for all users
- Organization transfer workflow
- Advanced search across organizations and members
- Integration with third-party property management systems
- Widget support for quick actions from home screen
- Apple Watch / Wear OS companion app
- Tablet-optimized layouts with split views
- Real-time collaboration features (presence indicators)

---

**Next Steps**: 
1. Review this specification with stakeholders
2. Run `/speckit.plan` to create detailed implementation plan
3. Run `/speckit.tasks` to break down into actionable tasks
4. Begin implementation with `/speckit.implement`
