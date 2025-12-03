/**
 * Organization Types matching API schema
 * 
 * Types and enums for organization management, including organization entities,
 * memberships, roles, and status enums.
 */

/**
 * Role enum defining the hierarchy of permissions within an organization
 * 
 * Hierarchy: Owner > Admin > Manager > Agent > Viewer
 */
export enum Role {
  OWNER = 'Owner',
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  AGENT = 'Agent',
  VIEWER = 'Viewer',
}

/**
 * Organization status enum
 */
export enum OrganizationStatus {
  ACTIVE = 'Active',
  ARCHIVED = 'Archived',
  INACTIVE = 'Inactive',
}

/**
 * Membership status enum
 */
export enum MembershipStatus {
  ACTIVE = 'Active',
  REMOVED = 'Removed',
  PENDING = 'Pending',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
}

/**
 * Organization entity representing a property management company
 */
export interface Organization {
  id: string;
  name: string;
  description?: string;
  website?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  timezone?: string;
  currency?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  userRole?: string;
  joinedAt?: string;
  memberCount?: number;
}

/**
 * Organization member entity representing the relationship between a user and an organization
 */
export interface OrganizationMember {
  id: string;
  userId: string;
  name: string;
  userName: string;
  email: string;
  role: string;
  joinedAt: string;
  status: string;
}

/**
 * Create organization request payload
 */
export interface CreateOrganizationRequest {
  name: string;
  description?: string;
  website?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  timezone?: string;
  currency?: string;
}

/**
 * Update organization request payload
 */
export interface UpdateOrganizationRequest {
  name: string;
  description?: string;
  website?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  timezone?: string;
  currency?: string;
}

/**
 * Switch active organization request payload
 */
export interface SwitchOrganizationRequest {
  organizationId: string;
}

/**
 * Organization with member details (used in dashboard and lists)
 * This represents the organization data as returned by the API with user context
 */
export interface OrganizationWithMember extends Organization {
  // role is inherited from Organization.userRole for backward compatibility
  role?: Role;
}
