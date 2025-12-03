/**
 * Invitation List Item Component
 * 
 * Pending invitation card showing invitee contact, role, sent date,
 * expiration countdown, and revoke action.
 */

import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { ContactType, Invitation, InvitationStatus } from '@/types/invitation';
import { Role } from '@/types/organization';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';

export interface InvitationListItemProps {
  /**
   * Invitation data
   */
  invitation: Invitation;
  
  /**
   * Callback when revoke is pressed
   */
  onRevoke?: (invitation: Invitation) => void;
  
  /**
   * Callback when invitation is pressed
   */
  onPress?: (invitation: Invitation) => void;
  
  /**
   * Whether revoke action is disabled
   */
  disabled?: boolean;
}

/**
 * Get icon for contact type
 */
const getContactIcon = (type: ContactType): string => {
  return type === ContactType.EMAIL ? 'email' : 'phone';
};

/**
 * Pending invitation list item component
 * 
 * @example
 * ```tsx
 * <InvitationListItem
 *   invitation={invitation}
 *   onRevoke={(inv) => handleRevoke(inv.token)}
 * />
 * ```
 */
export function InvitationListItem({
  invitation,
  onRevoke,
  onPress,
  disabled = false,
}: InvitationListItemProps) {
  const theme = useTheme();

  // Calculate days remaining
  const daysRemaining = React.useMemo(() => {
    const now = new Date();
    const expiresAt = new Date(invitation.expiresAt);
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [invitation.expiresAt]);

  // Check if expired
  const isExpired = invitation.status === InvitationStatus.EXPIRED || daysRemaining === 0;
  
  // Check if can revoke (only pending invitations)
  const canRevoke = invitation.status === InvitationStatus.PENDING && !isExpired && onRevoke;

  // Format sent date
  const sentText = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(invitation.createdAt), {
        addSuffix: true,
      });
    } catch {
      return 'Unknown';
    }
  }, [invitation.createdAt]);

  const handlePress = () => {
    if (!disabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(invitation);
    }
  };

  const handleRevoke = () => {
    if (disabled || !canRevoke) return;

    Alert.alert(
      'Revoke Invitation',
      `Are you sure you want to revoke the invitation to ${invitation.inviteeContact}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onRevoke!(invitation);
          },
        },
      ]
    );
  };

  // Status badge color
  const getStatusColor = () => {
    switch (invitation.status) {
      case InvitationStatus.PENDING:
        return isExpired ? theme.colors.error : theme.colors.primary;
      case InvitationStatus.ACCEPTED:
        return '#00A86B';
      case InvitationStatus.EXPIRED:
        return theme.colors.error;
      case InvitationStatus.REVOKED:
        return theme.colors.onSurfaceVariant;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusText = () => {
    if (invitation.status === InvitationStatus.PENDING && isExpired) {
      return 'Expired';
    }
    return invitation.status;
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || !onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isExpired ? theme.colors.error : theme.colors.outline,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
      activeOpacity={0.7}
    >
      {/* Contact icon */}
      <View style={styles.iconContainer}>
        <Icon
          name={getContactIcon(invitation.inviteeContactType) as any}
          size={24}
          color={theme.colors.primary}
        />
      </View>

      {/* Invitation info */}
      <View style={styles.content}>
        {/* Contact and role */}
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.contact} numberOfLines={1}>
            {invitation.inviteeContact}
          </Text>
          <Badge role={invitation.assignedRole as Role} size="small" />
        </View>

        {/* Message (if provided) */}
        {invitation.message && (
          <Text
            variant="bodySmall"
            style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={2}
          >
            "{invitation.message}"
          </Text>
        )}

        {/* Metadata */}
        <View style={styles.metadata}>
          <Text
            variant="bodySmall"
            style={[styles.metadataText, { color: theme.colors.onSurfaceVariant }]}
          >
            Sent {sentText}
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.separator, { color: theme.colors.onSurfaceVariant }]}
          >
            {' • '}
          </Text>
          <Text
            variant="bodySmall"
            style={[
              styles.expirationText,
              {
                color: isExpired ? theme.colors.error : theme.colors.onSurfaceVariant,
                fontWeight: isExpired ? '600' : '400',
              },
            ]}
          >
            {isExpired ? 'Expired' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`}
          </Text>
        </View>

        {/* Status badge */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor()}20` },
            ]}
          >
            <Text
              variant="labelSmall"
              style={[styles.statusText, { color: getStatusColor() }]}
            >
              {getStatusText()}
            </Text>
          </View>
        </View>
      </View>

      {/* Revoke button */}
      {canRevoke && (
        <View style={styles.actions}>
          <IconButton
            icon="close-circle-outline"
            iconColor={theme.colors.error}
            size={24}
            onPress={handleRevoke}
            disabled={disabled}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contact: {
    fontWeight: '600',
    flex: 1,
  },
  message: {
    fontStyle: 'italic',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
  },
  separator: {
    fontSize: 12,
  },
  expirationText: {
    fontSize: 12,
  },
  statusContainer: {
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actions: {
    marginLeft: 8,
  },
});
