/**
 * Access Denied Notification Utility
 * 
 * Helper function to show toast notifications when user attempts
 * unauthorized actions based on their role.
 */

import { logToReactotron } from '@/services/monitoring/reactotron';
import * as Sentry from '@sentry/react-native';
import { warningFeedback } from '@/lib/utils/haptics';
import { Alert, Platform, ToastAndroid } from 'react-native';

/**
 * Show access denied notification
 * 
 * @param action - The action the user attempted
 * @param currentRole - The user's current role
 * @param requiredRole - The role required for the action
 * 
 * @example
 * ```tsx
 * if (!canManageMembers) {
 *   showAccessDenied('manage team members', currentRole, 'Owner or Admin');
 *   return;
 * }
 * ```
 */
export function showAccessDenied(
  action: string,
  currentRole?: string,
  requiredRole?: string
): void {
  const message = requiredRole
    ? `You need to be ${requiredRole} to ${action}`
    : `You don't have permission to ${action}`;

  // Log unauthorized access attempt
  logToReactotron('Unauthorized access attempt', {
    action,
    currentRole,
    requiredRole,
  });

  // Track with Sentry
  Sentry.addBreadcrumb({
    category: 'authorization',
    message: 'Unauthorized access attempt',
    level: 'warning',
    data: {
      action,
      currentRole,
      requiredRole,
    },
  });

  // Haptic feedback
  warningFeedback();

  // Show notification
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert('Access Denied', message, [{ text: 'OK' }]);
  }
}

/**
 * Common access denied scenarios
 */
export const AccessDeniedMessages = {
  MANAGE_MEMBERS: 'manage team members',
  MANAGE_ORGANIZATION: 'manage organization settings',
  MANAGE_PROPERTIES: 'manage properties',
  INVITE_MEMBERS: 'invite team members',
  REMOVE_MEMBERS: 'remove team members',
  CHANGE_ROLES: 'change member roles',
  DELETE_ORGANIZATION: 'delete this organization',
  TRANSFER_OWNERSHIP: 'transfer organization ownership',
} as const;

/**
 * Required roles for common actions
 */
export const RequiredRoles = {
  OWNER_ONLY: 'Owner',
  OWNER_OR_ADMIN: 'Owner or Admin',
  MANAGER_OR_ABOVE: 'Manager, Admin, or Owner',
} as const;
