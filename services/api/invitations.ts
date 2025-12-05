/**
 * Invitations API Service
 * 
 * TanStack Query hooks for team invitation operations.
 * Handles sending, revoking, and accepting invitations.
 */

import {
    AcceptInvitationResponse,
    Invitation,
    InvitationFromAPI,
    InvitationStatus,
    InvitationWithDetails,
    SendInvitationAPIRequest,
    SendInvitationAPIResponse,
    UserInvitationsResponse
} from '@/types/invitation';
import * as Sentry from '@sentry/react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { logToReactotron } from '../monitoring/reactotron';
import apiClient from './client';

/**
 * Fetch user invitations (sent and received)
 * Uses GET /api/v1/invitations
 */
export const useUserInvitations = () => {
  return useQuery<UserInvitationsResponse>({
    queryKey: ['user-invitations'],
    queryFn: async () => {
      console.log('🔵 [API] Fetching user invitations from: /invitations');
      
      try {
        const { data } = await apiClient.get<UserInvitationsResponse>('/invitations');
        
        console.log('🔵 [API] User invitations response:', {
          success: data.success,
          sentCount: data.sentInvitations?.length || 0,
          receivedCount: data.receivedInvitations?.length || 0,
        });

        logToReactotron('User invitations fetched', {
          sentCount: data.sentInvitations?.length || 0,
          receivedCount: data.receivedInvitations?.length || 0,
        });

        return data;
      } catch (error) {
        console.error('🔴 [API] Error fetching user invitations:', error);
        console.error('🔴 [API] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          response: (error as any)?.response?.data,
          status: (error as any)?.response?.status,
        });
        
        logToReactotron('Error fetching user invitations', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        Sentry.captureException(error, {
          tags: { api_operation: 'fetch-user-invitations' },
        });
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch all invitations for an organization
 */
export const useInvitations = (
  organizationId: string | null,
  status: InvitationStatus = InvitationStatus.PENDING
) => {
  return useQuery<Invitation[]>({
    queryKey: ['invitations', organizationId, status],
    queryFn: async () => {
      logToReactotron('Fetching invitations', { organizationId, status });
      
      try {
        const { data } = await apiClient.get<{ invitations: Invitation[] }>(
          `/organizations/${organizationId}/invitations`,
          { params: { status } }
        );

        logToReactotron('Invitations fetched', {
          count: data.invitations?.length || 0,
        });

        return data.invitations || [];
      } catch (error) {
        logToReactotron('Error fetching invitations', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        Sentry.captureException(error, {
          tags: { api_operation: 'fetch-invitations' },
          extra: { organizationId, status },
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
 * Fetch invitation details by token (public endpoint)
 */
export const useInvitationByToken = (token: string | null) => {
  return useQuery<InvitationWithDetails>({
    queryKey: ['invitation', token],
    queryFn: async () => {
      logToReactotron('Fetching invitation by token', { token });

      try {
        const { data } = await apiClient.get<{ invitation: InvitationWithDetails }>(
          `/invitations/${token}`
        );

        logToReactotron('Invitation details fetched', {
          invitationId: data.invitation.id,
          organizationName: data.invitation.organization.name,
        });

        return data.invitation;
      } catch (error) {
        logToReactotron('Error fetching invitation', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        Sentry.captureException(error, {
          tags: { api_operation: 'fetch-invitation-by-token' },
          extra: { token },
        });
        throw error;
      }
    },
    enabled: !!token,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1, // Only retry once for invitations
  });
};

/**
 * Send a new invitation
 * Uses POST /api/v1/invitations/send
 */
export const useSendInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation<InvitationFromAPI, Error, SendInvitationAPIRequest>({
    mutationFn: async (request) => {
      console.log('🔵 [API] Sending invitation to: /invitations/send');
      console.log('🔵 [API] Request payload:', request);
      
      logToReactotron('Sending invitation', {
        organizationId: request.organizationId,
        email: request.email,
        phoneNumber: request.phoneNumber,
        role: request.role,
      });

      try {
        const { data } = await apiClient.post<SendInvitationAPIResponse>(
          '/invitations/send',
          request
        );

        console.log('🔵 [API] Send invitation response:', JSON.stringify(data, null, 2));

        if (!data.invitation) {
          console.error('🔴 [API] No invitation in response:', data);
          throw new Error('No invitation returned from API');
        }

        console.log('🟢 [API] Invitation sent successfully:', {
          id: data.invitation.id,
          organizationId: data.invitation.organizationId,
          email: data.invitation.email,
          phoneNumber: data.invitation.phoneNumber,
        });

        logToReactotron('Invitation sent successfully', {
          invitationId: data.invitation.id,
          expiresAt: data.invitation.expiresAt,
        });

        Sentry.addBreadcrumb({
          category: 'invitation',
          message: 'Invitation sent',
          level: 'info',
          data: {
            organizationId: request.organizationId,
            role: request.role,
          },
        });

        return data.invitation;
      } catch (error) {
        console.error('🔴 [API] Error sending invitation:', error);
        console.error('🔴 [API] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          response: (error as any)?.response?.data,
          status: (error as any)?.response?.status,
        });
        
        logToReactotron('Error sending invitation', {
          error: error instanceof Error ? error.message : 'Unknown error',
          response: (error as any)?.response?.data,
        });

        Sentry.captureException(error, {
          tags: { api_operation: 'send-invitation' },
          extra: { request },
        });
        throw error;
      }
    },
    onSuccess: (invitation) => {
      // Invalidate user invitations list
      queryClient.invalidateQueries({
        queryKey: ['user-invitations'],
      });
      
      // Also invalidate organization-specific invitations if needed
      queryClient.invalidateQueries({
        queryKey: ['invitations', invitation.organizationId],
      });
    },
  });
};

/**
 * Accept an invitation
 */
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation<AcceptInvitationResponse, Error, { token: string }>({
    mutationFn: async ({ token }) => {
      logToReactotron('Accepting invitation', { token });

      try {
        const { data } = await apiClient.post<AcceptInvitationResponse>(
          `/invitations/${token}`
        );

        logToReactotron('Invitation accepted successfully', {
          membershipId: data.membership.id,
          organizationId: data.membership.organizationId,
          role: data.membership.role,
        });

        Sentry.addBreadcrumb({
          category: 'invitation',
          message: 'Invitation accepted',
          level: 'info',
          data: {
            organizationId: data.membership.organizationId,
            role: data.membership.role,
          },
        });

        return data;
      } catch (error) {
        logToReactotron('Error accepting invitation', {
          error: error instanceof Error ? error.message : 'Unknown error',
          response: (error as any)?.response?.data,
        });

        Sentry.captureException(error, {
          tags: { api_operation: 'accept-invitation' },
          extra: { token },
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate organizations list (user joined a new organization)
      queryClient.invalidateQueries({
        queryKey: ['organizations'],
      });

      // Invalidate invitation details
      queryClient.invalidateQueries({
        queryKey: ['invitation'],
      });

      // Invalidate invitations list for the organization
      queryClient.invalidateQueries({
        queryKey: ['invitations', data.membership.organizationId],
      });
    },
  });
};

/**
 * Revoke an invitation
 */
export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation<Invitation, Error, { token: string; organizationId: string }>({
    mutationFn: async ({ token }) => {
      logToReactotron('Revoking invitation', { token });

      try {
        const { data } = await apiClient.delete<{ invitation: Invitation }>(
          `/invitations/${token}`
        );

        logToReactotron('Invitation revoked successfully', {
          invitationId: data.invitation.id,
        });

        Sentry.addBreadcrumb({
          category: 'invitation',
          message: 'Invitation revoked',
          level: 'info',
          data: {
            invitationId: data.invitation.id,
          },
        });

        return data.invitation;
      } catch (error) {
        logToReactotron('Error revoking invitation', {
          error: error instanceof Error ? error.message : 'Unknown error',
          response: (error as any)?.response?.data,
        });

        Sentry.captureException(error, {
          tags: { api_operation: 'revoke-invitation' },
          extra: { token },
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate invitations list
      queryClient.invalidateQueries({
        queryKey: ['invitations', variables.organizationId],
      });
    },
  });
};
