/**
 * Invitations Hook
 * 
 * Custom hook for managing team invitations with optimistic updates.
 * Provides convenient access to invitation queries and mutations.
 */

import {
    useAcceptInvitation,
    useInvitationByToken,
    useInvitations,
    useRevokeInvitation,
    useSendInvitation,
    useUserInvitations,
} from '@/services/api/invitations';
import { ContactType, InvitationStatus, SendInvitationRequest } from '@/types/invitation';
import { useMemo } from 'react';

/**
 * Hook for managing user invitations (sent and received)
 * Uses GET /api/v1/invitations
 * 
 * @example
 * ```tsx
 * const { sentInvitations, receivedInvitations, isLoading, refetch } = useUserInvitationsManagement();
 * 
 * // Display sent invitations
 * sentInvitations.map(inv => <InvitationItem key={inv.id} invitation={inv} />)
 * 
 * // Display received invitations
 * receivedInvitations.map(inv => <InvitationCard key={inv.id} invitation={inv} />)
 * ```
 */
export function useUserInvitationsManagement() {
  // Query
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useUserInvitations();

  // Computed values
  const sentInvitations = useMemo(() => data?.sentInvitations || [], [data]);
  const receivedInvitations = useMemo(() => data?.receivedInvitations || [], [data]);

  const pendingSentCount = useMemo(
    () => sentInvitations.filter((inv) => inv.status.toLowerCase() === 'pending').length,
    [sentInvitations]
  );

  const pendingReceivedCount = useMemo(
    () => receivedInvitations.filter((inv) => inv.status.toLowerCase() === 'pending').length,
    [receivedInvitations]
  );

  const expiredSentCount = useMemo(
    () => sentInvitations.filter((inv) => inv.isExpired).length,
    [sentInvitations]
  );

  const expiredReceivedCount = useMemo(
    () => receivedInvitations.filter((inv) => inv.isExpired).length,
    [receivedInvitations]
  );

  return {
    // Data
    sentInvitations,
    receivedInvitations,
    pendingSentCount,
    pendingReceivedCount,
    expiredSentCount,
    expiredReceivedCount,

    // Loading states
    isLoading,

    // Error
    error,

    // Actions
    refetch,

    // Raw response (for advanced usage)
    data,
  };
}

/**
 * Hook for managing invitations
 * 
 * @param organizationId - Organization ID to fetch invitations for
 * @param status - Filter by invitation status (default: PENDING)
 * 
 * @example
 * ```tsx
 * const { invitations, isLoading, sendInvitation, revokeInvitation } = useInvitationManagement('org_123');
 * 
 * // Send invitation
 * await sendInvitation({
 *   inviteeContact: 'user@example.com',
 *   inviteeContactType: ContactType.EMAIL,
 *   assignedRole: Role.MANAGER,
 *   message: 'Join our team!',
 * });
 * 
 * // Revoke invitation
 * await revokeInvitation('inv_token_abc');
 * ```
 */
export function useInvitationManagement(
  organizationId: string | null,
  status: InvitationStatus = InvitationStatus.PENDING
) {
  // Queries
  const {
    data: invitations = [],
    isLoading,
    error,
    refetch,
  } = useInvitations(organizationId, status);

  // Mutations
  const sendInvitationMutation = useSendInvitation();
  const revokeInvitationMutation = useRevokeInvitation();

  // Computed states
  const isSending = sendInvitationMutation.isPending;
  const isRevoking = revokeInvitationMutation.isPending;

  // Helper functions
  const sendInvitation = async (request: SendInvitationRequest) => {
    if (!organizationId) {
      throw new Error('Organization ID is required to send invitation');
    }

    // Convert to API format
    const apiRequest = {
      organizationId,
      email: request.inviteeContactType === ContactType.EMAIL ? request.inviteeContact : undefined,
      phoneNumber: request.inviteeContactType === ContactType.PHONE ? request.inviteeContact : undefined,
      role: request.assignedRole,
      message: request.message || undefined,
    };

    return sendInvitationMutation.mutateAsync(apiRequest);
  };

  const revokeInvitation = async (token: string) => {
    if (!organizationId) {
      throw new Error('Organization ID is required to revoke invitation');
    }

    return revokeInvitationMutation.mutateAsync({
      token,
      organizationId,
    });
  };

  // Computed values
  const pendingCount = useMemo(
    () => invitations.filter((inv) => inv.status === InvitationStatus.PENDING).length,
    [invitations]
  );

  const expiredCount = useMemo(
    () => invitations.filter((inv) => inv.status === InvitationStatus.EXPIRED).length,
    [invitations]
  );

  return {
    // Data
    invitations,
    pendingCount,
    expiredCount,

    // Loading states
    isLoading,
    isSending,
    isRevoking,
    isProcessing: isSending || isRevoking,

    // Error
    error,

    // Actions
    sendInvitation,
    revokeInvitation,
    refetch,

    // Mutations (for advanced usage)
    sendInvitationMutation,
    revokeInvitationMutation,
  };
}

/**
 * Hook for accepting an invitation
 * 
 * @param token - Invitation token from deep link
 * 
 * @example
 * ```tsx
 * const { invitation, isLoading, acceptInvitation } = useInvitationAcceptance(token);
 * 
 * if (invitation) {
 *   // Show invitation details
 *   console.log('Invited to:', invitation.organization.name);
 *   console.log('Role:', invitation.assignedRole);
 *   
 *   // Accept invitation
 *   await acceptInvitation();
 * }
 * ```
 */
export function useInvitationAcceptance(token: string | null) {
  // Query
  const {
    data: invitation,
    isLoading,
    error,
    refetch,
  } = useInvitationByToken(token);

  // Mutation
  const acceptInvitationMutation = useAcceptInvitation();

  // Computed states
  const isAccepting = acceptInvitationMutation.isPending;
  const isExpired = useMemo(() => {
    if (!invitation) return false;
    return new Date(invitation.expiresAt) < new Date();
  }, [invitation]);

  const canAccept = useMemo(() => {
    if (!invitation) return false;
    return (
      invitation.status === InvitationStatus.PENDING &&
      !isExpired
    );
  }, [invitation, isExpired]);

  // Helper function
  const acceptInvitation = async () => {
    if (!token) {
      throw new Error('Invitation token is required');
    }

    if (!canAccept) {
      throw new Error('Invitation cannot be accepted (expired or already accepted)');
    }

    return acceptInvitationMutation.mutateAsync({ token });
  };

  // Calculate time remaining
  const daysRemaining = useMemo(() => {
    if (!invitation) return null;
    const now = new Date();
    const expiresAt = new Date(invitation.expiresAt);
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [invitation]);

  return {
    // Data
    invitation,
    daysRemaining,
    isExpired,
    canAccept,

    // Loading states
    isLoading,
    isAccepting,

    // Error
    error,

    // Actions
    acceptInvitation,
    refetch,

    // Mutation (for advanced usage)
    acceptInvitationMutation,
  };
}
