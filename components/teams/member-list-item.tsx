/**
 * Member List Item Component
 * 
 * Team member card displayed in FlatList showing member info,
 * role, join date, and last active status.
 */

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MemberWithUser } from '@/services/api/teams';
import { Role } from '@/types/organization';
import { formatDistanceToNow } from 'date-fns';
import { lightImpact } from '@/lib/utils/haptics';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { List, Text, useTheme } from 'react-native-paper';

export interface MemberListItemProps {
  /**
   * Team member data
   */
  member: MemberWithUser;
  
  /**
   * Callback when member is pressed
   */
  onPress?: (member: MemberWithUser) => void;
  
  /**
   * Whether the item is disabled
   */
  disabled?: boolean;
  
  /**
   * Show last active status
   * @default true
   */
  showLastActive?: boolean;
}

/**
 * Team member list item component
 * 
 * @example
 * ```tsx
 * <MemberListItem
 *   member={member}
 *   onPress={(member) => router.push(`/teams/${member.id}`)}
 * />
 * ```
 */
export function MemberListItem({
  member,
  onPress,
  disabled = false,
  showLastActive = true,
}: MemberListItemProps) {
  const theme = useTheme();

  const handlePress = () => {
    if (!disabled && onPress) {
      lightImpact();
      onPress(member);
    }
  };

  // Format last active time
  const lastActiveText = React.useMemo(() => {
    if (!member.user.lastActiveAt) return 'Never';
    
    try {
      return formatDistanceToNow(new Date(member.user.lastActiveAt), {
        addSuffix: true,
      });
    } catch {
      return 'Unknown';
    }
  }, [member.user.lastActiveAt]);

  // Format join date
  const joinedText = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(member.joinedAt), {
        addSuffix: true,
      });
    } catch {
      return 'Unknown';
    }
  }, [member.joinedAt]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || !onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatar}>
        <Avatar
          uri={member.user.profilePhotoUrl}
          name={member.user.name}
          size={48}
        />
      </View>

      {/* Member info */}
      <View style={styles.content}>
        {/* Name and role */}
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.name} numberOfLines={1}>
            {member.user.name}
          </Text>
          <Badge role={member.role as Role} size="small" />
        </View>

        {/* Contact info */}
        <View style={styles.contactInfo}>
          {member.user.email && (
            <Text
              variant="bodySmall"
              style={[styles.contact, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={1}
            >
              {member.user.email}
            </Text>
          )}
          {member.user.phoneNumber && !member.user.email && (
            <Text
              variant="bodySmall"
              style={[styles.contact, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={1}
            >
              {member.user.phoneNumber}
            </Text>
          )}
        </View>

        {/* Metadata */}
        <View style={styles.metadata}>
          <Text
            variant="bodySmall"
            style={[styles.metadataText, { color: theme.colors.onSurfaceVariant }]}
          >
            Joined {joinedText}
          </Text>
          {showLastActive && (
            <>
              <Text
                variant="bodySmall"
                style={[styles.separator, { color: theme.colors.onSurfaceVariant }]}
              >
                {' • '}
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.metadataText, { color: theme.colors.onSurfaceVariant }]}
              >
                Active {lastActiveText}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Chevron icon */}
      {onPress && !disabled && (
        <View style={styles.chevron}>
          <List.Icon icon="chevron-right" />
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
    marginBottom: 8,
  },
  avatar: {
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
  name: {
    fontWeight: '600',
    flex: 1,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contact: {
    flex: 1,
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
  chevron: {
    marginLeft: 8,
  },
});
