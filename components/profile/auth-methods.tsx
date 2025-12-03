/**
 * Authentication Methods Component
 * 
 * Displays linked authentication methods with icons and status.
 * Shows add/remove options for managing auth methods.
 */

import { Icon } from '@/components/ui/icon';
import { AuthMethod } from '@/types/auth';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { List, Text, useTheme } from 'react-native-paper';

export interface AuthMethodItem {
  method: AuthMethod;
  identifier: string; // Email, phone number, or provider email
  isPrimary: boolean;
  linkedAt: string;
}

export interface AuthMethodsProps {
  /**
   * List of linked authentication methods
   */
  methods: AuthMethodItem[];
  
  /**
   * Callback when add method is pressed
   */
  onAddMethod?: (method: AuthMethod) => void;
  
  /**
   * Callback when remove method is pressed
   */
  onRemoveMethod?: (method: AuthMethod) => void;
  
  /**
   * Whether actions are disabled
   */
  disabled?: boolean;
}

/**
 * Get icon name for auth method
 */
const getMethodIcon = (method: AuthMethod): React.ComponentProps<typeof Icon>['name'] => {
  switch (method) {
    case AuthMethod.GOOGLE_OAUTH:
      return 'google';
    case AuthMethod.EMAIL_PASSWORD:
      return 'email';
    case AuthMethod.PHONE_OTP:
      return 'phone';
    default:
      return 'account';
  }
};

/**
 * Get display name for auth method
 */
const getMethodName = (method: AuthMethod): string => {
  switch (method) {
    case AuthMethod.GOOGLE_OAUTH:
      return 'Google';
    case AuthMethod.EMAIL_PASSWORD:
      return 'Email/Password';
    case AuthMethod.PHONE_OTP:
      return 'Phone/OTP';
    default:
      return 'Unknown';
  }
};

/**
 * Get method color
 */
const getMethodColor = (method: AuthMethod): string => {
  switch (method) {
    case AuthMethod.GOOGLE_OAUTH:
      return '#DB4437';
    case AuthMethod.EMAIL_PASSWORD:
      return '#0066CC';
    case AuthMethod.PHONE_OTP:
      return '#00A86B';
    default:
      return '#6C757D';
  }
};

/**
 * Authentication methods display component
 * 
 * @example
 * ```tsx
 * <AuthMethods
 *   methods={[
 *     { method: 'email', identifier: 'user@example.com', isPrimary: true, linkedAt: '2024-01-01' }
 *   ]}
 *   onAddMethod={(method) => console.log('Add', method)}
 *   onRemoveMethod={(method) => console.log('Remove', method)}
 * />
 * ```
 */
export function AuthMethods({
  methods,
  onAddMethod,
  onRemoveMethod,
  disabled = false,
}: AuthMethodsProps) {
  const theme = useTheme();

  // Available methods to add (not currently linked)
  const linkedMethods = new Set(methods.map(m => m.method));
  const availableMethods = Object.values(AuthMethod).filter(
    method => !linkedMethods.has(method)
  );

  // Check if user can remove methods (must have at least one)
  const canRemove = methods.length > 1;

  return (
    <View style={styles.container}>
      {/* Section title */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Authentication Methods
      </Text>
      <Text 
        variant="bodySmall" 
        style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        Manage how you sign in to your account
      </Text>

      {/* Linked methods */}
      <View style={styles.methodsList}>
        {methods.map((item, index) => (
          <List.Item
            key={`${item.method}-${index}`}
            title={getMethodName(item.method)}
            description={item.identifier}
            left={() => (
              <Icon 
                name={getMethodIcon(item.method)} 
                size={24} 
                color={getMethodColor(item.method)}
                style={styles.methodIcon}
              />
            )}
            right={() => (
              <View style={styles.methodRight}>
                {item.isPrimary && (
                  <Text 
                    variant="labelSmall" 
                    style={[styles.primaryBadge, { 
                      color: theme.colors.primary,
                      backgroundColor: `${theme.colors.primary}20`,
                    }]}
                  >
                    Primary
                  </Text>
                )}
                {canRemove && !item.isPrimary && onRemoveMethod && !disabled && (
                  <TouchableOpacity onPress={() => onRemoveMethod(item.method)}>
                    <List.Icon 
                      icon="close-circle-outline" 
                      color={theme.colors.error}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
            style={[
              styles.methodItem,
              { backgroundColor: theme.colors.surfaceVariant }
            ]}
            disabled={disabled}
          />
        ))}
      </View>

      {/* Add method section */}
      {availableMethods.length > 0 && onAddMethod && (
        <>
          <Text 
            variant="titleSmall" 
            style={[styles.addTitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Add Authentication Method
          </Text>
          
          <View style={styles.addMethodsList}>
            {availableMethods.map((method) => (
              <List.Item
                key={method}
                title={getMethodName(method)}
                description={`Link your ${getMethodName(method)} account`}
                left={() => (
                  <Icon 
                    name={getMethodIcon(method)} 
                    size={24} 
                    color={getMethodColor(method)}
                    style={styles.methodIcon}
                  />
                )}
                right={() => <List.Icon icon="plus-circle-outline" />}
                onPress={() => !disabled && onAddMethod(method)}
                style={[
                  styles.addMethodItem,
                  { backgroundColor: theme.colors.surface }
                ]}
                disabled={disabled}
              />
            ))}
          </View>
        </>
      )}

      {/* Warning about removing last method */}
      {!canRemove && (
        <Text 
          variant="bodySmall" 
          style={[styles.warningText, { color: theme.colors.error }]}
        >
          ⚠️ You must have at least one authentication method
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    marginBottom: 16,
  },
  methodsList: {
    gap: 8,
    marginBottom: 24,
  },
  methodItem: {
    borderRadius: 8,
    paddingVertical: 4,
  },
  methodIcon: {
    marginTop: 12,
    marginLeft: 8,
  },
  methodRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  addTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  addMethodsList: {
    gap: 8,
    marginBottom: 16,
  },
  addMethodItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 4,
  },
  warningText: {
    textAlign: 'center',
    marginTop: 8,
  },
});
