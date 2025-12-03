/**
 * Permissions Hook
 * 
 * Custom hook for role-based permission checks within an organization.
 * Provides permission check functions based on the user's role.
 */

import { Role } from '@/types/organization';
import { useMemo } from 'react';
import { useActiveOrganization } from './use-active-organization';
import { useOrganizations } from './use-organizations';

/**
 * Role hierarchy levels for permission comparison
 */
const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.OWNER]: 5,
  [Role.ADMIN]: 4,
  [Role.MANAGER]: 3,
  [Role.AGENT]: 2,
  [Role.VIEWER]: 1,
};

/**
 * Hook for role-based permission checks
 */
export const usePermissions = () => {
  const { data: organizations, isLoading } = useOrganizations();
  const { activeOrganizationId } = useActiveOrganization();

  // Find current organization and user's role
  const currentMembership = useMemo(() => {
    if (!organizations || !activeOrganizationId) return null;
    return organizations.find((org) => org.id === activeOrganizationId);
  }, [organizations, activeOrganizationId]);

  const currentRole = currentMembership?.role || null;

  /**
   * Check if user has at least the specified role level
   */
  const hasRole = (requiredRole: Role): boolean => {
    if (!currentRole) return false;
    return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole];
  };

  /**
   * Check if user is the owner of the active organization
   */
  const isOwner = currentRole === Role.OWNER;

  /**
   * Check if user is an admin (or owner)
   */
  const isAdmin = currentRole === Role.ADMIN || isOwner;

  /**
   * Check if user can manage team members (invite, remove, change roles)
   */
  const canManageMembers = isOwner || isAdmin;

  /**
   * Check if user can manage organization settings
   */
  const canManageOrganization = isOwner || isAdmin;

  /**
   * Check if user can manage properties (create, update, delete)
   */
  const canManageProperties = hasRole(Role.MANAGER);

  /**
   * Check if user can invite members to the organization
   */
  const canInviteMembers = canManageMembers;

  /**
   * Check if user can update property status and details
   */
  const canUpdateProperties = hasRole(Role.AGENT);

  /**
   * Check if user has read-only access (viewer role only)
   */
  const isReadOnly = currentRole === Role.VIEWER;

  /**
   * Check if user can perform a specific action
   */
  const can = (action: string): boolean => {
    switch (action) {
      case 'manage:members':
        return canManageMembers;
      case 'manage:organization':
        return canManageOrganization;
      case 'manage:properties':
        return canManageProperties;
      case 'invite:members':
        return canInviteMembers;
      case 'update:properties':
        return canUpdateProperties;
      case 'delete:organization':
        return isOwner;
      case 'transfer:ownership':
        return isOwner;
      default:
        return false;
    }
  };

  return {
    currentRole,
    currentMembership,
    isLoading,
    // Role checks
    isOwner,
    isAdmin,
    hasRole,
    // Permission checks
    canManageMembers,
    canManageOrganization,
    canManageProperties,
    canInviteMembers,
    canUpdateProperties,
    isReadOnly,
    // Generic permission check
    can,
  };
};
