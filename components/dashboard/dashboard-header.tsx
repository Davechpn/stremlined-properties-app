/**
 * Dashboard Header Component
 * 
 * Header component for the dashboard displaying user profile avatar,
 * name, organization switcher trigger, and user's role badge.
 */

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useOfflineStatus } from '@/hooks/use-offline-status';
import { lightImpact, mediumImpact } from '@/lib/utils/haptics';
import { User } from '@/types/auth';
import { OrganizationWithMember, Role } from '@/types/organization';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';

interface DashboardHeaderProps {
  /**
   * Current user data
   */
  user: User | null;
  
  /**
   * Currently active organization
   */
  activeOrganization: OrganizationWithMember | null;
  
  /**
   * Callback when organization switcher is tapped
   */
  onOrganizationSwitcherPress?: () => void;
  
  /**
   * Callback when logout button is pressed
   */
  onLogoutPress?: () => void;
  
  /**
   * Whether the user has multiple organizations
   */
  hasMultipleOrganizations?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  activeOrganization,
  onOrganizationSwitcherPress,
  onLogoutPress,
  hasMultipleOrganizations = false,
}) => {
  const theme = useTheme();
  const { isOffline } = useOfflineStatus();

  const handleSwitcherPress = async () => {
    await lightImpact();
    onOrganizationSwitcherPress?.();
  };

  const handleLogoutPress = async () => {
    await mediumImpact();
    onLogoutPress?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.userSection}>
        <Avatar
          uri={user?.profilePhotoUrl}
          name={user?.name || 'User'}
          size={48}
        />
        <View style={styles.textSection}>
          <Text variant="titleMedium" style={styles.userName}>
            {user?.name || 'Welcome'}
          </Text>
          {activeOrganization ? (
            <Pressable
              onPress={hasMultipleOrganizations ? handleSwitcherPress : undefined}
              style={styles.organizationPressable}
              disabled={!hasMultipleOrganizations}
            >
              <Text
                variant="bodyMedium"
                style={[
                  styles.organizationName,
                  { color: theme.colors.onSurfaceVariant },
                ]}
                numberOfLines={1}
              >
                {activeOrganization.name}
              </Text>
              {hasMultipleOrganizations && (
                <IconButton
                  icon="chevron-down"
                  size={16}
                  style={styles.chevron}
                  iconColor={theme.colors.onSurfaceVariant}
                />
              )}
            </Pressable>
          ) : (
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              No organization
            </Text>
          )}
          {/* Display user's role badge */}
          {activeOrganization?.role && (
            <View style={styles.roleBadgeContainer}>
              <Badge role={activeOrganization.role as Role} size="small" />
            </View>
          )}
        </View>
      </View>
      {onLogoutPress && (
        <IconButton
          icon="logout"
          size={24}
          onPress={handleLogoutPress}
          iconColor={theme.colors.error}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textSection: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontWeight: '600',
  },
  organizationPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  organizationName: {
    flex: 1,
  },
  chevron: {
    margin: 0,
    marginLeft: -4,
  },
  roleBadgeContainer: {
    marginTop: 6,
  },
});
