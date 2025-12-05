/**
 * Teams Hook
 * 
 * Custom hook for managing team members with optimistic updates.
 * Provides convenient access to team queries and mutations.
 */

import {
    useRemoveMember,
    useTeamMember,
    useTeamMembers,
    useUpdateMemberRole
} from '@/services/api/teams';
import { Role } from '@/types/organization';
import { useMemo } from 'react';

/**
 * Hook for managing team members
 * 
 * @param organizationId - Organization ID to fetch members for
 * @param options - Query options (page, limit, role filter)
 * 
 * @example
 * ```tsx
 * const { members, isLoading, updateMemberRole, removeMember } = useTeamManagement('org_123');
 * 
 * // Update member role
 * await updateMemberRole('mem_456', Role.ADMIN);
 * 
 * // Remove member
 * await removeMember('mem_789');
 * ```
 */
export function useTeamManagement(
  organizationId: string | null,
  options?: {
    page?: number;
    limit?: number;
    role?: Role;
  }
) {
  // Queries
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useTeamMembers(organizationId, options);

  // Mutations
  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();

  // Computed states
  const isUpdating = updateRoleMutation.isPending;
  const isRemoving = removeMemberMutation.isPending;

  // Extract members and pagination
  const members = useMemo(() => response?.members || [], [response]);
  const pagination = useMemo(() => response?.pagination, [response]);

  // Helper functions
  const updateMemberRole = async (memberId: string, role: Role) => {
    if (!organizationId) {
      throw new Error('Organization ID is required to update member role');
    }

    return updateRoleMutation.mutateAsync({
      organizationId,
      memberId,
      role,
    });
  };

  const removeMember = async (memberId: string) => {
    if (!organizationId) {
      throw new Error('Organization ID is required to remove member');
    }

    return removeMemberMutation.mutateAsync({
      organizationId,
      memberId,
    });
  };

  // Computed values
  const memberCount = useMemo(() => members.length, [members]);

  const roleDistribution = useMemo(() => {
    const distribution: Record<Role, number> = {
      [Role.OWNER]: 0,
      [Role.ADMIN]: 0,
      [Role.MANAGER]: 0,
      [Role.AGENT]: 0,
      [Role.VIEWER]: 0,
    };

    members.forEach((member) => {
      if (member.role in distribution) {
        distribution[member.role]++;
      }
    });

    return distribution;
  }, [members]);

  const activeMembers = useMemo(
    () => members.filter((m) => m.status === 'active'),
    [members]
  );

  return {
    // Data
    members,
    activeMembers,
    pagination,
    memberCount,
    roleDistribution,

    // Loading states
    isLoading,
    isUpdating,
    isRemoving,
    isProcessing: isUpdating || isRemoving,

    // Error
    error,

    // Actions
    updateMemberRole,
    removeMember,
    refetch,

    // Mutations (for advanced usage)
    updateRoleMutation,
    removeMemberMutation,
  };
}

/**
 * Hook for fetching a specific team member
 * 
 * @param organizationId - Organization ID
 * @param memberId - Member ID to fetch
 * 
 * @example
 * ```tsx
 * const { member, isLoading } = useTeamMemberDetails('org_123', 'mem_456');
 * 
 * if (member) {
 *   console.log('Member:', member.user.name);
 *   console.log('Role:', member.role);
 *   console.log('Joined:', member.joinedAt);
 * }
 * ```
 */
export function useTeamMemberDetails(
  organizationId: string | null,
  memberId: string | null
) {
  const {
    data: member,
    isLoading,
    error,
    refetch,
  } = useTeamMember(organizationId, memberId);

  // Computed values
  const daysInOrganization = useMemo(() => {
    if (!member) return null;
    const now = new Date();
    const joinedAt = new Date(member.joinedAt);
    const diffMs = now.getTime() - joinedAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [member]);

  const isActive = useMemo(() => {
    return member?.status === 'active';
  }, [member]);

  return {
    // Data
    member,
    daysInOrganization,
    isActive,

    // Loading states
    isLoading,

    // Error
    error,

    // Actions
    refetch,
  };
}

/**
 * Hook for checking if current user can manage a specific member
 * 
 * @param currentUserRole - Current user's role in the organization
 * @param targetMemberRole - Target member's role
 * 
 * @example
 * ```tsx
 * const { canUpdate, canRemove } = useCanManageMember(Role.ADMIN, Role.MANAGER);
 * 
 * if (canUpdate) {
 *   // Show update role button
 * }
 * 
 * if (canRemove) {
 *   // Show remove member button
 * }
 * ```
 */
export function useCanManageMember(
  currentUserRole?: Role,
  targetMemberRole?: Role
) {
  // Role hierarchy: Owner > Admin > Manager > Agent > Viewer
  const roleHierarchy = {
    [Role.OWNER]: 5,
    [Role.ADMIN]: 4,
    [Role.MANAGER]: 3,
    [Role.AGENT]: 2,
    [Role.VIEWER]: 1,
  };

  const canUpdate = useMemo(() => {
    if (!currentUserRole || !targetMemberRole) return false;

    // Owner and Admin can update roles
    if (currentUserRole === Role.OWNER || currentUserRole === Role.ADMIN) {
      // Cannot change Owner role
      if (targetMemberRole === Role.OWNER) return false;
      // Admin cannot change another Admin
      if (currentUserRole === Role.ADMIN && targetMemberRole === Role.ADMIN) return false;
      return true;
    }

    return false;
  }, [currentUserRole, targetMemberRole]);

  const canRemove = useMemo(() => {
    if (!currentUserRole || !targetMemberRole) return false;

    // Owner and Admin can remove members
    if (currentUserRole === Role.OWNER || currentUserRole === Role.ADMIN) {
      // Cannot remove Owner
      if (targetMemberRole === Role.OWNER) return false;
      return true;
    }

    return false;
  }, [currentUserRole, targetMemberRole]);

  const canInvite = useMemo(() => {
    if (!currentUserRole) return false;
    return currentUserRole === Role.OWNER || currentUserRole === Role.ADMIN;
  }, [currentUserRole]);

  return {
    canUpdate,
    canRemove,
    canInvite,
  };
}
