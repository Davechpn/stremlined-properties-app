/**
 * Badge Component
 * 
 * Displays role badges with appropriate color coding.
 * Used to indicate user roles within organizations.
 */

import { Role } from '@/types/organization';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';

interface BadgeProps {
  /**
   * The role to display
   */
  role: Role;
  
  /**
   * Size of the badge
   * @default 'small'
   */
  size?: 'small' | 'medium';
  
  /**
   * Whether to show the badge in compact mode (icon only)
   * @default false
   */
  compact?: boolean;
}

/**
 * Get display label for a role
 */
const getRoleLabel = (role: Role): string => {
  switch (role) {
    case Role.OWNER:
      return 'Owner';
    case Role.ADMIN:
      return 'Admin';
    case Role.MANAGER:
      return 'Manager';
    case Role.AGENT:
      return 'Agent';
    case Role.VIEWER:
      return 'Viewer';
    default:
      return role;
  }
};

/**
 * Get color scheme for a role
 * Returns background and text colors based on role hierarchy
 */
const getRoleColors = (role: Role, theme: any): { backgroundColor: string; textColor: string } => {
  switch (role) {
    case Role.OWNER:
      return {
        backgroundColor: theme.colors.primaryContainer,
        textColor: theme.colors.onPrimaryContainer,
      };
    case Role.ADMIN:
      return {
        backgroundColor: theme.colors.secondaryContainer,
        textColor: theme.colors.onSecondaryContainer,
      };
    case Role.MANAGER:
      return {
        backgroundColor: theme.colors.tertiaryContainer,
        textColor: theme.colors.onTertiaryContainer,
      };
    case Role.AGENT:
      return {
        backgroundColor: theme.colors.surfaceVariant,
        textColor: theme.colors.onSurfaceVariant,
      };
    case Role.VIEWER:
      return {
        backgroundColor: theme.colors.surface,
        textColor: theme.colors.onSurface,
      };
    default:
      return {
        backgroundColor: theme.colors.surface,
        textColor: theme.colors.onSurface,
      };
  }
};

/**
 * Get icon for a role
 */
const getRoleIcon = (role: Role): string => {
  switch (role) {
    case Role.OWNER:
      return 'crown';
    case Role.ADMIN:
      return 'shield-account';
    case Role.MANAGER:
      return 'account-tie';
    case Role.AGENT:
      return 'account';
    case Role.VIEWER:
      return 'eye';
    default:
      return 'account';
  }
};

export const Badge: React.FC<BadgeProps> = ({
  role,
  size = 'small',
  compact = false,
}) => {
  const theme = useTheme();
  const label = getRoleLabel(role);
  const { backgroundColor, textColor } = getRoleColors(role, theme);
  const icon = getRoleIcon(role);

  return (
    <Chip
      icon={icon}
      mode="flat"
      compact={size === 'small'}
      style={[
        styles.badge,
        { backgroundColor },
      ]}
      textStyle={[
        styles.text,
        { color: textColor },
        size === 'small' && styles.textSmall,
      ]}
    >
      {!compact && label}
    </Chip>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 10,
  },
});
