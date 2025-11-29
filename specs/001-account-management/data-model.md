# Data Model: Account Management Module

**Phase**: Phase 1 - Design  
**Date**: 2025-11-29  
**Feature**: Account Management Module

## Overview

This document defines the data model for the account management module, including entity definitions, TypeScript interfaces, validation rules, state transitions, and relationships. All entities follow TypeScript strict mode conventions with comprehensive type safety.

---

## Core Entities

### 1. User

**Description**: Represents an individual user account in the mobile app. A user can belong to multiple organizations with different roles in each.

**TypeScript Interface**:
```typescript
// types/auth.ts
export interface User {
  id: string;                          // UUID from backend
  name: string;                        // Full name (e.g., "John Doe")
  email: string | null;                // Email address (nullable for phone-only users)
  phoneNumber: string | null;          // Phone number in E.164 format (nullable for email-only)
  profilePhotoUrl: string | null;      // URL to profile photo in cloud storage
  authMethods: AuthMethod[];           // Authentication methods linked to account
  lastActiveAt: string;                // ISO 8601 timestamp of last activity
  createdAt: string;                   // ISO 8601 timestamp of account creation
  status: UserStatus;                  // Account status (active, suspended, deleted)
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum AuthMethod {
  GOOGLE = 'google',
  EMAIL_PASSWORD = 'email_password',
  PHONE_OTP = 'phone_otp',
}
```

**Validation Rules**:
- `name`: Required, 2-100 characters, no leading/trailing whitespace
- `email`: Must be valid email format (RFC 5322), unique across platform
- `phoneNumber`: Must be valid E.164 format (e.g., +12125551234), unique across platform
- At least one of `email` or `phoneNumber` must be non-null
- `authMethods`: Must contain at least one method, cannot be empty array
- `profilePhotoUrl`: Must be valid HTTPS URL if provided

**Identity Rule**: `email` and `phoneNumber` are globally unique identifiers. Users can authenticate with any linked auth method.

**Lifecycle States**:
1. **Active**: Normal state, user can authenticate and use app
2. **Suspended**: Temporary restriction, user cannot authenticate
3. **Deleted**: Soft delete, user data retained for compliance but account inaccessible

**State Transitions**:
```
Created (active) → Suspended → Active (reactivated)
                → Deleted (permanent)
```

**Sample Data**:
```json
{
  "id": "usr_abc123xyz",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+12125551234",
  "profilePhotoUrl": "https://storage.example.com/avatars/usr_abc123xyz.jpg",
  "authMethods": ["google", "email_password"],
  "lastActiveAt": "2025-11-29T14:30:00Z",
  "createdAt": "2025-11-01T10:00:00Z",
  "status": "active"
}
```

---

### 2. Organization

**Description**: Represents a property management company. Users can create organizations and invite others to join. Each organization has one owner and multiple members with assigned roles.

**TypeScript Interface**:
```typescript
// types/organization.ts
export interface Organization {
  id: string;                          // UUID from backend
  name: string;                        // Organization name (globally unique, case-insensitive)
  description: string | null;          // Optional description
  logoUrl: string | null;              // URL to organization logo
  ownerId: string;                     // User ID of organization owner
  lastActiveAt: string;                // ISO 8601 timestamp of last activity by any member
  createdAt: string;                   // ISO 8601 timestamp of creation
  status: OrganizationStatus;          // Organization status
  memberCount: number;                 // Total number of members (computed field)
}

export enum OrganizationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}
```

**Validation Rules**:
- `name`: Required, 3-100 characters, globally unique (case-insensitive), alphanumeric + spaces/hyphens
- `description`: Optional, max 500 characters
- `logoUrl`: Must be valid HTTPS URL if provided
- `ownerId`: Must reference a valid, active User
- `memberCount`: Read-only, computed by backend based on OrganizationMember records

**Identity Rule**: `name` is globally unique identifier (case-insensitive). Two organizations cannot have names that differ only in case (e.g., "Acme Properties" and "ACME PROPERTIES" are considered duplicates).

**Lifecycle States**:
1. **Active**: Normal state, members can access and perform operations
2. **Archived**: Organization inactive, members retain read-only access

**State Transitions**:
```
Created (active) → Archived → Active (restored)
```

**Business Rules**:
- Organization must have exactly one owner at all times
- Owner cannot leave organization without transferring ownership first
- Archiving an organization does not delete member records
- Organization names cannot be changed after creation (future enhancement)

**Sample Data**:
```json
{
  "id": "org_xyz789abc",
  "name": "Acme Property Management",
  "description": "Full-service property management for residential and commercial properties",
  "logoUrl": "https://storage.example.com/logos/org_xyz789abc.png",
  "ownerId": "usr_abc123xyz",
  "lastActiveAt": "2025-11-29T15:45:00Z",
  "createdAt": "2025-11-15T09:30:00Z",
  "status": "active",
  "memberCount": 12
}
```

---

### 3. OrganizationMember

**Description**: Represents the relationship between a User and an Organization, including the user's role and membership status. A user can be a member of multiple organizations with different roles in each.

**TypeScript Interface**:
```typescript
// types/organization.ts
export interface OrganizationMember {
  id: string;                          // UUID from backend
  userId: string;                      // Reference to User
  organizationId: string;              // Reference to Organization
  role: Role;                          // User's role in this organization
  status: MembershipStatus;            // Membership status
  joinedAt: string;                    // ISO 8601 timestamp when user joined
  invitedBy: string | null;            // User ID of inviter (null if user created org)
}

export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  AGENT = 'agent',
  VIEWER = 'viewer',
}

export enum MembershipStatus {
  ACTIVE = 'active',
  REMOVED = 'removed',
}
```

**Validation Rules**:
- `userId`: Must reference a valid User
- `organizationId`: Must reference a valid Organization
- `role`: Must be one of the five defined roles
- Combination of (`userId`, `organizationId`) must be unique (composite unique constraint)
- Organization must have exactly one member with `role: 'owner'` at all times

**Role Hierarchy & Permissions**:
```
Owner > Admin > Manager > Agent > Viewer

Owner:
  - Full control: manage members, change roles, delete organization
  - Transfer ownership to another member
  - All lower permissions

Admin:
  - Manage members: invite, remove, change roles (except Owner)
  - Update organization settings
  - All lower permissions

Manager:
  - Manage properties: create, update, delete
  - Assign agents to properties
  - All lower permissions

Agent:
  - View assigned properties
  - Update property status and details
  - Communicate with tenants
  - All lower permissions

Viewer:
  - Read-only access to organization data
  - View properties, members, activity
```

**Business Rules**:
- User can be member of multiple organizations but only one active organization at a time (client-side context)
- Removing owner requires ownership transfer first (enforced by backend)
- Role changes take effect immediately, no re-authentication required
- Removing a member sets `status: 'removed'` (soft delete for audit trail)

**State Transitions**:
```
Invited → Active (on invitation acceptance)
Active → Removed (on removal by Owner/Admin)
```

**Sample Data**:
```json
{
  "id": "mem_def456ghi",
  "userId": "usr_abc123xyz",
  "organizationId": "org_xyz789abc",
  "role": "owner",
  "status": "active",
  "joinedAt": "2025-11-15T09:30:00Z",
  "invitedBy": null
}
```

---

### 4. Invitation

**Description**: Represents a pending invitation to join an organization. Invitations are created by authorized users (Owner/Admin) and sent via email or SMS with a unique deep link. Invitations expire after 14 days.

**TypeScript Interface**:
```typescript
// types/invitation.ts
export interface Invitation {
  id: string;                          // UUID from backend
  token: string;                       // Unique token for deep link (UUID)
  inviterId: string;                   // User ID of person who sent invitation
  inviteeContact: string;              // Email or phone number of invitee
  inviteeContactType: ContactType;     // Type of contact (email or phone)
  organizationId: string;              // Organization user is invited to
  assignedRole: Role;                  // Role to assign on acceptance
  status: InvitationStatus;            // Invitation status
  message: string | null;              // Optional personalized message
  createdAt: string;                   // ISO 8601 timestamp of creation
  expiresAt: string;                   // ISO 8601 timestamp of expiration (createdAt + 14 days)
  acceptedAt: string | null;           // ISO 8601 timestamp of acceptance (null if pending)
}

export enum ContactType {
  EMAIL = 'email',
  PHONE = 'phone',
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}
```

**Validation Rules**:
- `token`: Must be unique UUID, used in deep link URL
- `inviteeContact`: Must be valid email or E.164 phone number based on `inviteeContactType`
- `assignedRole`: Cannot be 'owner' (only one owner per organization)
- Combination of (`inviteeContact`, `organizationId`, `status: 'pending'`) must be unique (prevents duplicate active invitations)
- `expiresAt`: Must be `createdAt + 14 days`
- `message`: Optional, max 500 characters

**Lifecycle States**:
1. **Pending**: Invitation sent, awaiting action
2. **Accepted**: Invitee accepted and joined organization
3. **Expired**: Invitation exceeded 14-day validity period
4. **Revoked**: Invitation cancelled by inviter before acceptance

**State Transitions**:
```
Created (pending) → Accepted (user joins org)
                 → Expired (after 14 days)
                 → Revoked (by inviter)
```

**Business Rules**:
- Only Owner and Admin roles can send invitations
- Cannot send invitation to existing member of the organization
- Cannot send multiple active invitations to same contact for same organization
- Expired invitations cannot be accepted (must send new invitation)
- Revoked invitations cannot be accepted
- Accepting invitation creates OrganizationMember record with `assignedRole`
- If invitee has no account, deep link directs to sign-up with pre-filled contact info

**Deep Link Format**:
```
https://app.streamlinedproperties.com/invitations/{token}
```

**Sample Data**:
```json
{
  "id": "inv_jkl012mno",
  "token": "7f8c9d4e-2b3a-4c5d-8e9f-0a1b2c3d4e5f",
  "inviterId": "usr_abc123xyz",
  "inviteeContact": "jane.smith@example.com",
  "inviteeContactType": "email",
  "organizationId": "org_xyz789abc",
  "assignedRole": "manager",
  "status": "pending",
  "message": "Hi Jane, I'd love for you to join our team as a property manager!",
  "createdAt": "2025-11-25T10:00:00Z",
  "expiresAt": "2025-12-09T10:00:00Z",
  "acceptedAt": null
}
```

---

### 5. Session

**Description**: Represents an authenticated user session. Sessions track authentication state, active organization context, and device information for security purposes. Managed primarily by backend; mobile app stores token in Expo SecureStore.

**TypeScript Interface**:
```typescript
// types/auth.ts
export interface Session {
  id: string;                          // UUID from backend (session ID)
  userId: string;                      // Reference to User
  activeOrganizationId: string | null; // Current active organization (null for users with no orgs)
  token: string;                       // JWT token for API authentication
  refreshToken: string;                // Refresh token for extending session
  createdAt: string;                   // ISO 8601 timestamp of session creation
  expiresAt: string;                   // ISO 8601 timestamp of expiration
  rememberMe: boolean;                 // Whether session should be extended (7 days vs 1 hour)
  deviceInfo: DeviceInfo;              // Device metadata for security
}

export interface DeviceInfo {
  platform: 'ios' | 'android';         // Mobile platform
  osVersion: string;                   // OS version (e.g., "17.0")
  appVersion: string;                  // App version (e.g., "1.0.0")
  deviceModel: string;                 // Device model (e.g., "iPhone 15 Pro")
  deviceId: string;                    // Unique device identifier (anonymized)
}
```

**Validation Rules**:
- `token`: JWT token signed by backend, contains user ID and expiration
- `refreshToken`: Opaque token for session refresh
- `expiresAt`: 1 hour if `rememberMe: false`, 7 days if `rememberMe: true`
- `activeOrganizationId`: Must reference a valid Organization where user is an active member (or null)

**Business Rules**:
- Session created on successful authentication (sign in, sign up, OAuth callback)
- Session token stored in Expo SecureStore on mobile device (encrypted)
- Active organization context switches via dedicated API call, persists in AsyncStorage
- Session expires after `expiresAt`, requires re-authentication or refresh
- Logout invalidates session and removes token from SecureStore
- Multiple concurrent sessions allowed (user can be logged in on multiple devices)

**Security Considerations**:
- Token stored in SecureStore (iOS Keychain, Android Keystore)
- Refresh token allows extending session without re-entering credentials
- Device info logged to Sentry for security monitoring
- Session invalidation on password change (all devices)

**Sample Data**:
```json
{
  "id": "ses_pqr345stu",
  "userId": "usr_abc123xyz",
  "activeOrganizationId": "org_xyz789abc",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "rt_vwx678yz0",
  "createdAt": "2025-11-29T14:00:00Z",
  "expiresAt": "2025-12-06T14:00:00Z",
  "rememberMe": true,
  "deviceInfo": {
    "platform": "ios",
    "osVersion": "17.0",
    "appVersion": "1.0.0",
    "deviceModel": "iPhone 15 Pro",
    "deviceId": "anon_abc123xyz"
  }
}
```

---

### 6. LocalProfile

**Description**: Client-side cached representation of user profile and organization memberships, stored in AsyncStorage for offline access and quick app startup. Not a backend entity—purely client-side cache.

**TypeScript Interface**:
```typescript
// types/profile.ts
export interface LocalProfile {
  userId: string;                      // User ID (matches User.id)
  name: string;                        // User's full name
  email: string | null;                // User's email
  phoneNumber: string | null;          // User's phone number
  profilePhotoUrl: string | null;      // Profile photo URL
  organizations: LocalOrganization[];  // List of user's organizations
  activeOrganizationId: string | null; // Currently active organization ID
  cachedAt: string;                    // ISO 8601 timestamp when cached
}

export interface LocalOrganization {
  id: string;                          // Organization ID
  name: string;                        // Organization name
  logoUrl: string | null;              // Organization logo URL
  role: Role;                          // User's role in this organization
  lastActiveAt: string;                // When user last accessed this org
}
```

**Validation Rules**:
- Cached data expires after 7 days (checked on app startup)
- Data syncs with backend on authentication and after mutations
- If cache expired, re-fetch from backend

**Business Rules**:
- Cached immediately after authentication
- Updated after profile changes, organization changes, or role changes
- Cleared on logout
- Used for offline access and quick app startup (skeleton screen while validating)

**AsyncStorage Key**:
```typescript
const PROFILE_CACHE_KEY = '@streamlined:profile_cache';
```

**Sample Data** (stored as JSON string in AsyncStorage):
```json
{
  "userId": "usr_abc123xyz",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+12125551234",
  "profilePhotoUrl": "https://storage.example.com/avatars/usr_abc123xyz.jpg",
  "organizations": [
    {
      "id": "org_xyz789abc",
      "name": "Acme Property Management",
      "logoUrl": "https://storage.example.com/logos/org_xyz789abc.png",
      "role": "owner",
      "lastActiveAt": "2025-11-29T15:45:00Z"
    },
    {
      "id": "org_def456ghi",
      "name": "Downtown Real Estate",
      "logoUrl": null,
      "role": "manager",
      "lastActiveAt": "2025-11-20T10:00:00Z"
    }
  ],
  "activeOrganizationId": "org_xyz789abc",
  "cachedAt": "2025-11-29T16:00:00Z"
}
```

---

## Entity Relationships

```
User (1) ──── (M) OrganizationMember ──── (1) Organization
  │                                              │
  │                                              │
  │                                          (1) Owner
  │
  └─── (M) Invitation ───────────────────────── (1) Organization
  │         (as inviter)
  │
  └─── (M) Session
```

**Relationship Details**:

1. **User ↔ OrganizationMember** (One-to-Many):
   - A user can be a member of multiple organizations (0..N)
   - Each membership record links to exactly one user
   - Cascading: Deleting user soft-deletes all memberships (set `status: 'removed'`)

2. **Organization ↔ OrganizationMember** (One-to-Many):
   - An organization has multiple members (1..N, minimum 1 owner)
   - Each membership record links to exactly one organization
   - Cascading: Deleting organization soft-deletes all memberships

3. **User ↔ Invitation (as inviter)** (One-to-Many):
   - A user can send multiple invitations (0..N)
   - Each invitation has exactly one inviter
   - Cascading: Deleting inviter user does NOT delete invitations (invitations remain for audit)

4. **Organization ↔ Invitation** (One-to-Many):
   - An organization can have multiple pending/accepted invitations (0..N)
   - Each invitation is for exactly one organization
   - Cascading: Deleting organization revokes all pending invitations

5. **User ↔ Session** (One-to-Many):
   - A user can have multiple concurrent sessions (0..N, across different devices)
   - Each session belongs to exactly one user
   - Cascading: Deleting user invalidates all sessions

6. **Organization ↔ User (Owner)** (Many-to-One):
   - Each organization has exactly one owner (1)
   - A user can own multiple organizations (0..N)
   - Enforced via OrganizationMember with `role: 'owner'` (exactly one per organization)

---

## Indexes & Query Optimization

**Backend Indexes** (for API performance):
- `User.email` - Unique index for email lookup during authentication
- `User.phoneNumber` - Unique index for phone lookup during authentication
- `Organization.name` - Unique index (case-insensitive) for name validation
- `OrganizationMember(userId, organizationId)` - Composite unique index
- `OrganizationMember(organizationId, status)` - Index for member listing
- `Invitation(token)` - Unique index for deep link resolution
- `Invitation(inviteeContact, organizationId, status)` - Index for duplicate prevention
- `Session(token)` - Index for token validation
- `Session(userId)` - Index for user's sessions listing

**Client-Side Cache Keys** (AsyncStorage):
- `@streamlined:auth_token` - Stored in SecureStore (token)
- `@streamlined:profile_cache` - Stored in AsyncStorage (LocalProfile JSON)
- `@streamlined:active_org` - Stored in AsyncStorage (organizationId string)

---

## Validation Schemas

**Zod Schemas** (for runtime validation):
```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().nullable(),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/).nullable(),
  profilePhotoUrl: z.string().url().nullable(),
  authMethods: z.array(z.enum(['google', 'email_password', 'phone_otp'])).min(1),
  lastActiveAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  status: z.enum(['active', 'suspended', 'deleted']),
}).refine(
  (data) => data.email !== null || data.phoneNumber !== null,
  { message: 'Either email or phone number must be provided' }
);

export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(100).regex(/^[a-zA-Z0-9 -]+$/),
  description: z.string().max(500).nullable(),
  logoUrl: z.string().url().nullable(),
  ownerId: z.string().uuid(),
  lastActiveAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  status: z.enum(['active', 'archived']),
  memberCount: z.number().int().min(1),
});

export const invitationSchema = z.object({
  id: z.string().uuid(),
  token: z.string().uuid(),
  inviterId: z.string().uuid(),
  inviteeContact: z.string().min(1),
  inviteeContactType: z.enum(['email', 'phone']),
  organizationId: z.string().uuid(),
  assignedRole: z.enum(['admin', 'manager', 'agent', 'viewer']), // Cannot be 'owner'
  status: z.enum(['pending', 'accepted', 'expired', 'revoked']),
  message: z.string().max(500).nullable(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  acceptedAt: z.string().datetime().nullable(),
});
```

---

## Data Flow Examples

### Example 1: User Sign Up with Email/Password

```typescript
// 1. User submits sign-up form
const credentials = { email: 'john@example.com', password: 'SecurePass123!', name: 'John Doe' };

// 2. API creates User and Session
POST /api/auth/signup
Request: { email, password, name }
Response: {
  user: { id: 'usr_abc123', name: 'John Doe', email: 'john@example.com', ... },
  session: { token: 'eyJ...', expiresAt: '2025-12-06T14:00:00Z', ... }
}

// 3. Client stores token in SecureStore
await SecureStore.setItemAsync(AUTH_TOKEN_KEY, session.token);

// 4. Client caches profile in AsyncStorage
const localProfile: LocalProfile = {
  userId: user.id,
  name: user.name,
  email: user.email,
  phoneNumber: null,
  profilePhotoUrl: null,
  organizations: [], // Empty for new user
  activeOrganizationId: null,
  cachedAt: new Date().toISOString(),
};
await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(localProfile));

// 5. Client navigates to dashboard
router.replace('/(app)/dashboard');
```

### Example 2: Organization Switching

```typescript
// 1. User taps organization in switcher
const selectedOrgId = 'org_xyz789abc';

// 2. Client updates active organization via API
PATCH /api/users/me/active-organization
Request: { organizationId: selectedOrgId }
Response: { activeOrganizationId: selectedOrgId, updatedAt: '2025-11-29T16:00:00Z' }

// 3. Client updates AsyncStorage cache
await AsyncStorage.setItem(ACTIVE_ORG_KEY, selectedOrgId);

// 4. TanStack Query invalidates affected queries
queryClient.invalidateQueries(['dashboard']);
queryClient.invalidateQueries(['permissions']);

// 5. UI updates with new organization context (role-based menu, dashboard data)
```

### Example 3: Invitation Acceptance

```typescript
// 1. User clicks deep link: https://app.streamlinedproperties.com/invitations/7f8c9d4e-...
// 2. App opens to invitation screen with token
const { token } = useLocalSearchParams();

// 3. App fetches invitation details
GET /api/invitations/{token}
Response: {
  id: 'inv_jkl012',
  organization: { id: 'org_xyz789', name: 'Acme Properties' },
  assignedRole: 'manager',
  inviter: { name: 'John Doe' },
  expiresAt: '2025-12-09T10:00:00Z',
  status: 'pending'
}

// 4. User taps "Accept Invitation"
POST /api/invitations/{token}/accept
Response: {
  membership: { id: 'mem_def456', organizationId: 'org_xyz789', role: 'manager', ... },
  invitation: { ...updatedInvitation, status: 'accepted' }
}

// 5. Client invalidates organizations query and updates cache
queryClient.invalidateQueries(['organizations']);

// 6. Client navigates to organization dashboard
router.replace(`/(app)/organizations/${membership.organizationId}`);
```

---

## Summary

**Entities Defined**: 6 (User, Organization, OrganizationMember, Invitation, Session, LocalProfile)

**Total TypeScript Interfaces**: 12 (including enums and nested interfaces)

**Key Design Decisions**:
- Strict TypeScript with Zod runtime validation for data integrity
- Composite unique constraints prevent duplicate memberships and invitations
- Soft deletes (status fields) maintain audit trail
- Client-side caching (LocalProfile) for offline access and performance
- Role hierarchy enforced at both client (UI) and backend (API)
- Deep link token-based invitations for seamless onboarding

**Constitution Compliance**:
- ✅ **Consistent Naming**: PascalCase types, camelCase properties, SCREAMING_SNAKE_CASE enums
- ✅ **No Duplication**: Shared validation schemas in lib/validation/, types in types/
- ✅ **Type Safety**: Strict TypeScript mode, comprehensive interfaces, runtime validation

**Next Steps**: Proceed to API contracts definition (contracts/ directory)
