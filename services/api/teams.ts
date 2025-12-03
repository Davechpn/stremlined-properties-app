/**
 * Teams API Service
 * 
 * TanStack Query hooks for team member management operations.
 * Handles fetching members, updating roles, and removing members.
 */

import { Role } from '@/types/organization';
import * as Sentry from '@sentry/react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { logToReactotron } from '../monitoring/reactotron';

/**
 * Team member with user details
 */
export interface MemberWithUser {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  status: 'active' | 'removed';
  joinedAt: string;
  invitedBy?: string | null;
  user: {
    id: string;
    name: string;
    email?: string | null;
    phoneNumber?: string | null;
    profilePhotoUrl?: string | null;
    lastActiveAt?: string;
  };
}

/**
 * Pagination metadata
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Team members list response
 */
export interface TeamMembersResponse {
  members: MemberWithUser[];
  pagination: Pagination;
}

/**
 * Update member role request
 */
export interface UpdateMemberRoleRequest {
  role: Role;
}

/**
 * Fetch all members of an organization
 */
export const useTeamMembers = (
  organizationId: string | null,
  options?: {
    page?: number;
    limit?: number;
    role?: Role;
  }
) => {
  return useQuery<TeamMembersResponse>({
    queryKey: ['team-members', organizationId, options],
    queryFn: async () => {
      logToReactotron('Fetching team members', { organizationId, options });

      try {
        const { data } = await apiClient.get<TeamMembersResponse>(
          `/organizations/${organizationId}/members`,
          { params: options }
        );

        logToReactotron('Team members fetched', {
          count: data.members?.length || 0,
          total: data.pagination?.total || 0,
        });

        return data;
      } catch (error) {
        logToReactotron('Error fetching team members', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        Sentry.captureException(error, {
          tags: { api_operation: 'fetch-team-members' },
          extra: { organizationId, options },
        });
        throw error;
      }
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch a specific member details
 */
export const useTeamMember = (organizationId: string | null, memberId: string | null) => {
  return useQuery<MemberWithUser>({
    queryKey: ['team-member', organizationId, memberId],
    queryFn: async () => {
      logToReactotron('Fetching team member details', { organizationId, memberId });

      try {
        const { data } = await apiClient.get<{ member: MemberWithUser }>(
          `/organizations/${organizationId}/members/${memberId}`
        );

        logToReactotron('Team member details fetched', {
          memberId: data.member.id,
          userName: data.member.user.name,
        });

        return data.member;
      } catch (error) {
        logToReactotron('Error fetching team member', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        Sentry.captureException(error, {
          tags: { api_operation: 'fetch-team-member' },
          extra: { organizationId, memberId },
        });
        throw error;
      }
    },
    enabled: !!organizationId && !!memberId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Update a member's role
 */
export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation<
    MemberWithUser,
    Error,
    { organizationId: string; memberId: string; role: Role }
  >({
    mutationFn: async ({ organizationId, memberId, role }) => {
      logToReactotron('Updating member role', { organizationId, memberId, role });

      try {
        const { data } = await apiClient.patch<{ member: MemberWithUser }>(
          `/organizations/${organizationId}/members/${memberId}`,
          { role }
        );

        logToReactotron('Member role updated successfully', {
          memberId: data.member.id,
          newRole: data.member.role,
        });

        Sentry.addBreadcrumb({
          category: 'team',
          message: 'Member role updated',
          level: 'info',
          data: {
            organizationId,
            memberId,
            newRole: role,
          },
        });

        return data.member;
      } catch (error) {
        logToReactotron('Error updating member role', {
          error: error instanceof Error ? error.message : 'Unknown error',
          response: (error as any)?.response?.data,
        });

        Sentry.captureException(error, {
          tags: { api_operation: 'update-member-role' },
          extra: { organizationId, memberId, role },
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate team members list
      queryClient.invalidateQueries({
        queryKey: ['team-members', variables.organizationId],
      });

      // Invalidate specific member details
      queryClient.invalidateQueries({
        queryKey: ['team-member', variables.organizationId, variables.memberId],
      });
    },
  });
};

/**
 * Remove a member from the organization
 */
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { organizationId: string; memberId: string }>({
    mutationFn: async ({ organizationId, memberId }) => {
      logToReactotron('Removing team member', { organizationId, memberId });

      try {
        await apiClient.delete(`/organizations/${organizationId}/members/${memberId}`);

        logToReactotron('Member removed successfully', {
          memberId,
        });

        Sentry.addBreadcrumb({
          category: 'team',
          message: 'Member removed',
          level: 'info',
          data: {
            organizationId,
            memberId,
          },
        });
      } catch (error) {
        logToReactotron('Error removing member', {
          error: error instanceof Error ? error.message : 'Unknown error',
          response: (error as any)?.response?.data,
        });

        Sentry.captureException(error, {
          tags: { api_operation: 'remove-member' },
          extra: { organizationId, memberId },
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate team members list
      queryClient.invalidateQueries({
        queryKey: ['team-members', variables.organizationId],
      });

      // Remove specific member from cache
      queryClient.removeQueries({
        queryKey: ['team-member', variables.organizationId, variables.memberId],
      });

      // Invalidate organizations list (member count may have changed)
      queryClient.invalidateQueries({
        queryKey: ['organizations'],
      });
    },
  });
};
