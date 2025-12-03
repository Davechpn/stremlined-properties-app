/**
 * Profile Types
 * 
 * Types for user profile management and local caching.
 * LocalProfile and LocalOrganization are client-side only types
 * stored in AsyncStorage for offline access and quick app startup.
 */

import { Role } from './organization';

/**
 * Local organization representation cached in AsyncStorage
 * Minimal data needed for organization switcher and dashboard
 */
export interface LocalOrganization {
  id: string;
  name: string;
  logoUrl: string | null;
  role: Role;
  lastActiveAt: string;
}

/**
 * Local profile representation cached in AsyncStorage
 * Contains user info and organization memberships for offline access
 */
export interface LocalProfile {
  userId: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  profilePhotoUrl: string | null;
  organizations: LocalOrganization[];
  activeOrganizationId: string | null;
  cachedAt: string;
}

/**
 * Update profile request payload
 */
export interface UpdateProfileRequest {
  name?: string;
  email?: string | null;
  phoneNumber?: string | null;
  profilePhotoUrl?: string | null;
}
