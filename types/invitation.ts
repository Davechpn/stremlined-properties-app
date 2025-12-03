/**
 * Invitation Types
 * 
 * Type definitions for team member invitations.
 */

import { Role } from './organization';

/**
 * Contact type for invitation
 */
export enum ContactType {
  EMAIL = 'email',
  PHONE = 'phone',
}

/**
 * Invitation status
 */
export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

/**
 * Basic invitation data
 */
export interface Invitation {
  id: string;
  token: string;
  inviterId: string;
  inviteeContact: string;
  inviteeContactType: ContactType;
  organizationId: string;
  assignedRole: Role;
  status: InvitationStatus;
  message?: string | null;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string | null;
}

/**
 * Invitation with organization and inviter details
 */
export interface InvitationWithDetails extends Invitation {
  organization: {
    id: string;
    name: string;
    logoUrl?: string | null;
  };
  inviter: {
    name: string;
    profilePhotoUrl?: string | null;
  };
}

/**
 * Send invitation request payload
 */
export interface SendInvitationRequest {
  inviteeContact: string;
  inviteeContactType: ContactType;
  assignedRole: Role;
  message?: string | null;
}

/**
 * Accept invitation response
 */
export interface AcceptInvitationResponse {
  membership: {
    id: string;
    userId: string;
    organizationId: string;
    role: Role;
    status: string;
    joinedAt: string;
    invitedBy?: string | null;
  };
  invitation: Invitation;
}
