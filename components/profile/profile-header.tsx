/**
 * Profile Header Component
 * 
 * Displays user profile information with avatar, name, email, and role.
 * Used in profile screens and settings.
 */

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/auth';
import { Role } from '@/types/organization';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export interface ProfileHeaderProps {
  /**
   * User data to display
   */
  user: User;
  
  /**
   * Current role in active organization (optional)
   */
  role?: Role;
  
  /**
   * Organization name (optional)
   */
  organizationName?: string;
  
  /**
   * Size variant
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Show role badge
   * @default true
   */
  showRole?: boolean;
}

/**
 * Profile header component displaying user info
 * 
 * @example
 * ```tsx
 * <ProfileHeader 
 *   user={user} 
 *   role="Admin" 
 *   organizationName="Acme Properties"
 * />
 * ```
 */
export function ProfileHeader({
  user,
  role,
  organizationName,
  size = 'medium',
  showRole = true,
}: ProfileHeaderProps) {
  const theme = useTheme();

  // Avatar size based on variant
  const avatarSize = size === 'large' ? 120 : size === 'medium' ? 80 : 60;

  // Text variants based on size
  const nameVariant = size === 'large' ? 'headlineMedium' : size === 'medium' ? 'titleLarge' : 'titleMedium';
  const emailVariant = size === 'large' ? 'bodyLarge' : 'bodyMedium';

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Avatar
          uri={user.profilePhotoUrl}
          name={user.name}
          size={avatarSize}
        />
      </View>

      {/* User info */}
      <View style={styles.info}>
        {/* Name */}
        <Text 
          variant={nameVariant} 
          style={styles.name}
        >
          {user.name}
        </Text>

        {/* Email */}
        <Text 
          variant={emailVariant}
          style={[styles.email, { color: theme.colors.onSurfaceVariant }]}
        >
          {user.email}
        </Text>

        {/* Phone (if available) */}
        {user.phoneNumber && (
          <Text 
            variant="bodySmall"
            style={[styles.phone, { color: theme.colors.onSurfaceVariant }]}
          >
            {user.phoneNumber}
          </Text>
        )}

        {/* Role badge and organization */}
        {showRole && role && (
          <View style={styles.roleContainer}>
            <Badge role={role} size="small" />
            {organizationName && (
              <Text 
                variant="bodySmall"
                style={[styles.organization, { color: theme.colors.onSurfaceVariant }]}
              >
                {' at '}{organizationName}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatar: {
    marginBottom: 16,
  },
  info: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    textAlign: 'center',
    marginBottom: 4,
  },
  phone: {
    textAlign: 'center',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  organization: {
    marginLeft: 4,
  },
});
