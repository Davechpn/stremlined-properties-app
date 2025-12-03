/**
 * Organization List Item Component
 * 
 * List item for displaying organizations in FlatList with name, role badge, and last active.
 */

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils/formatting';
import { Organization, Role } from '@/types/organization';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export interface OrganizationListItemProps {
  /**
   * Organization data
   */
  organization: Organization;
  
  /**
   * Callback when item is pressed
   */
  onPress?: (organization: Organization) => void;
  
  /**
   * Whether this is the active organization
   * @default false
   */
  isActive?: boolean;
}

/**
 * Organization list item component
 * 
 * @example
 * ```tsx
 * <OrganizationListItem
 *   organization={org}
 *   onPress={(org) => navigateToOrg(org.id)}
 *   isActive={org.id === activeOrgId}
 * />
 * ```
 */
export function OrganizationListItem({
  organization,
  onPress,
  isActive = false,
}: OrganizationListItemProps) {
  const theme = useTheme();

  const handlePress = () => {
    onPress?.(organization);
  };

  // Format last active time
  const lastActiveText = organization.joinedAt
    ? `Joined ${formatRelativeTime(organization.joinedAt)}`
    : 'Recently joined';

  // Parse role from string to Role enum
  const userRole = organization.userRole as Role | undefined;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isActive
            ? `${theme.colors.primary}15`
            : theme.colors.surface,
          borderColor: isActive ? theme.colors.primary : theme.colors.outline,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <Avatar
        uri={null} // Organizations don't have logos yet
        name={organization.name}
        size={48}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Name and role */}
        <View style={styles.header}>
          <Text
            variant="titleMedium"
            style={[styles.name, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {organization.name}
          </Text>
          {userRole && (
            <Badge role={userRole} size="small" />
          )}
        </View>

        {/* Description or last active */}
        <Text
          variant="bodySmall"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          numberOfLines={1}
        >
          {organization.description || lastActiveText}
        </Text>

        {/* Member count */}
        {organization.memberCount !== undefined && (
          <Text
            variant="bodySmall"
            style={[styles.memberCount, { color: theme.colors.onSurfaceVariant }]}
          >
            {organization.memberCount} {organization.memberCount === 1 ? 'member' : 'members'}
          </Text>
        )}
      </View>

      {/* Active indicator */}
      {isActive && (
        <View
          style={[
            styles.activeIndicator,
            { backgroundColor: theme.colors.primary },
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontWeight: '600',
  },
  subtitle: {
    marginBottom: 2,
  },
  memberCount: {
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
