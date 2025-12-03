/**
 * Role Picker Component
 * 
 * Bottom sheet for selecting a role with descriptions.
 * Shows role hierarchy and permissions for each role.
 */

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import { Role } from '@/types/organization';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';

export interface RolePickerProps {
  /**
   * Whether the picker is visible
   */
  visible: boolean;
  
  /**
   * Currently selected role
   */
  selectedRole?: Role;
  
  /**
   * Callback when a role is selected
   */
  onSelect: (role: Role) => void;
  
  /**
   * Callback when picker is dismissed
   */
  onDismiss: () => void;
  
  /**
   * Roles to exclude from picker (e.g., Owner cannot be selected)
   */
  excludeRoles?: Role[];
  
  /**
   * Title text
   */
  title?: string;
}

/**
 * Role metadata with descriptions and permissions
 */
const roleMetadata: Record<Role, { description: string; permissions: string[]; icon: string }> = {
  [Role.OWNER]: {
    description: 'Full control over the organization',
    permissions: [
      'Manage all organization settings',
      'Transfer ownership',
      'Delete organization',
      'Manage all members and properties',
    ],
    icon: 'crown',
  },
  [Role.ADMIN]: {
    description: 'Manage organization and members',
    permissions: [
      'Manage organization settings',
      'Invite and remove members',
      'Change member roles',
      'Manage all properties',
    ],
    icon: 'shield-account',
  },
  [Role.MANAGER]: {
    description: 'Manage properties and assignments',
    permissions: [
      'Create and edit properties',
      'Assign agents to properties',
      'View all properties',
      'Generate reports',
    ],
    icon: 'briefcase',
  },
  [Role.AGENT]: {
    description: 'Work with assigned properties',
    permissions: [
      'View assigned properties',
      'Update property information',
      'Manage tenants',
      'Submit reports',
    ],
    icon: 'account-tie',
  },
  [Role.VIEWER]: {
    description: 'Read-only access',
    permissions: [
      'View organization information',
      'View properties',
      'View reports',
      'No editing permissions',
    ],
    icon: 'eye',
  },
};

/**
 * Get role color
 */
const getRoleColor = (role: Role): string => {
  switch (role) {
    case Role.OWNER:
      return '#FFD700';
    case Role.ADMIN:
      return '#FF6B6B';
    case Role.MANAGER:
      return '#4ECDC4';
    case Role.AGENT:
      return '#45B7D1';
    case Role.VIEWER:
      return '#95A5A6';
    default:
      return '#6C757D';
  }
};

/**
 * Role picker bottom sheet component
 * 
 * @example
 * ```tsx
 * const [visible, setVisible] = useState(false);
 * const [role, setRole] = useState<Role>(Role.VIEWER);
 * 
 * <RolePicker
 *   visible={visible}
 *   selectedRole={role}
 *   excludeRoles={[Role.OWNER]}
 *   onSelect={(role) => {
 *     setRole(role);
 *     setVisible(false);
 *   }}
 *   onDismiss={() => setVisible(false)}
 * />
 * ```
 */
export function RolePicker({
  visible,
  selectedRole,
  onSelect,
  onDismiss,
  excludeRoles = [],
  title = 'Select Role',
}: RolePickerProps) {
  const theme = useTheme();

  // Filter out excluded roles
  const availableRoles = Object.values(Role).filter(
    (role) => !excludeRoles.includes(role)
  );

  const handleSelectRole = (role: Role) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(role);
  };

  return (
    <BottomSheet visible={visible} onDismiss={onDismiss}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            {title}
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Choose a role with appropriate permissions
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Roles list */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {availableRoles.map((role, index) => {
            const metadata = roleMetadata[role];
            const isSelected = role === selectedRole;
            const roleColor = getRoleColor(role);

            return (
              <React.Fragment key={role}>
                <TouchableOpacity
                  style={[
                    styles.roleItem,
                    {
                      backgroundColor: isSelected
                        ? `${theme.colors.primary}10`
                        : theme.colors.surface,
                      borderColor: isSelected ? theme.colors.primary : 'transparent',
                    },
                  ]}
                  onPress={() => handleSelectRole(role)}
                  activeOpacity={0.7}
                >
                  {/* Icon and role name */}
                  <View style={styles.roleHeader}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: `${roleColor}20` },
                      ]}
                    >
                      <Icon name={metadata.icon as any} size={24} color={roleColor} />
                    </View>

                    <View style={styles.roleTitle}>
                      <Text variant="titleMedium" style={styles.roleName}>
                        {role}
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={[
                          styles.roleDescription,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        {metadata.description}
                      </Text>
                    </View>

                    {isSelected && (
                      <Icon
                        name="check-circle"
                        size={24}
                        color={theme.colors.primary}
                      />
                    )}
                  </View>

                  {/* Permissions */}
                  <View style={styles.permissions}>
                    {metadata.permissions.map((permission, idx) => (
                      <View key={idx} style={styles.permission}>
                        <Icon
                          name="check"
                          size={16}
                          color={theme.colors.primary}
                          style={styles.permissionIcon}
                        />
                        <Text
                          variant="bodySmall"
                          style={[
                            styles.permissionText,
                            { color: theme.colors.onSurfaceVariant },
                          ]}
                        >
                          {permission}
                        </Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>

                {index < availableRoles.length - 1 && (
                  <Divider style={styles.itemDivider} />
                )}
              </React.Fragment>
            );
          })}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    marginTop: 4,
  },
  divider: {
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  roleItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 8,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleTitle: {
    flex: 1,
  },
  roleName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  roleDescription: {
    fontSize: 13,
  },
  permissions: {
    gap: 6,
  },
  permission: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  permissionIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  permissionText: {
    flex: 1,
    fontSize: 13,
  },
  itemDivider: {
    marginVertical: 8,
  },
});
