/**
 * Profile Settings Screen
 * 
 * Account settings including authentication methods, app preferences,
 * cache management, and sign out.
 */

import { AuthMethods, AuthMethodItem } from '@/components/profile/auth-methods';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/services/api/profile';
import { clear as clearAsyncStorage } from '@/services/storage/async-storage';
import { logToReactotron } from '@/services/monitoring/reactotron';
import { AuthMethod } from '@/types/auth';
import * as Sentry from '@sentry/react-native';
import { lightImpact, mediumImpact, heavyImpact, successFeedback, errorFeedback, warningFeedback, selectionChanged } from '@/lib/utils/haptics';
import { useRouter, useNavigation } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, List, Switch, useTheme } from 'react-native-paper';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { signOut } = useAuth();

  // Fetch profile
  const { data: user, isLoading, error } = useProfile();

  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = React.useState(false);

  // Handle clear cache
  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all locally cached data. You may need to re-download some information.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            try {
              await lightImpact();
              
              logToReactotron('Clearing cache', {});
              
              await clearAsyncStorage();

              await successFeedback();

              Sentry.addBreadcrumb({
                category: 'settings',
                message: 'Cache cleared',
                level: 'info',
              });

              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              await errorFeedback();
              
              logToReactotron('Clear cache error', {
                error: error instanceof Error ? error.message : 'Unknown error',
              });

              Sentry.captureException(error, {
                tags: { context: 'clear-cache' },
              });

              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await successFeedback();
              
              logToReactotron('User signed out from settings', {
                userId: user?.id,
              });

              Sentry.addBreadcrumb({
                category: 'auth',
                message: 'User signed out from settings',
                level: 'info',
              });

              await signOut();
            } catch (error) {
              await errorFeedback();
              
              logToReactotron('Sign out error', {
                error: error instanceof Error ? error.message : 'Unknown error',
              });

              Sentry.captureException(error, {
                tags: { context: 'settings-signout' },
              });

              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  // Handle add authentication method
  const handleAddAuthMethod = (method: AuthMethod) => {
    lightImpact();
    
    logToReactotron('Add authentication method requested', { method });

    // TODO: Implement add auth method flow
    Alert.alert(
      'Add Authentication Method',
      `Adding ${method} authentication will be available soon.`,
      [{ text: 'OK' }]
    );
  };

  // Handle remove authentication method
  const handleRemoveAuthMethod = (method: AuthMethod) => {
    Alert.alert(
      'Remove Authentication Method',
      `Are you sure you want to remove ${method} authentication?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await lightImpact();
            
            logToReactotron('Remove authentication method requested', { method });

            // TODO: Implement remove auth method API call
            Alert.alert(
              'Not Implemented',
              'Removing authentication methods will be available soon.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingIndicator message="Loading settings..." />
      </View>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ErrorMessage
          error={error || new Error('Failed to load settings')}
          onRetry={() => router.back()}
        />
      </View>
    );
  }

  // Map user auth methods
  const authMethods: AuthMethodItem[] = user.authenticationMethods.map((method, index) => {
    let authMethod: AuthMethod;
    let identifier: string;

    if (method === 'Email') {
      authMethod = AuthMethod.EMAIL_PASSWORD;
      identifier = user.email || '';
    } else if (method === 'Google') {
      authMethod = AuthMethod.GOOGLE_OAUTH;
      identifier = user.email || '';
    } else {
      authMethod = AuthMethod.PHONE_OTP;
      identifier = user.phoneNumber || '';
    }

    return {
      method: authMethod,
      identifier,
      isPrimary: index === 0,
      linkedAt: user.createdAt,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* App Settings */}
        <List.Section>
          <List.Subheader>App Settings</List.Subheader>
          
          <List.Item
            title="Push Notifications"
            description="Receive notifications about updates and invitations"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
          />
          
          <List.Item
            title="Biometric Authentication"
            description="Use Face ID or fingerprint to unlock"
            left={(props) => <List.Icon {...props} icon="fingerprint" />}
            right={() => (
              <Switch
                value={biometricsEnabled}
                onValueChange={setBiometricsEnabled}
              />
            )}
          />
        </List.Section>

        <Divider style={styles.divider} />

        {/* Authentication Methods */}
        <AuthMethods
          methods={authMethods}
          onAddMethod={handleAddAuthMethod}
          onRemoveMethod={handleRemoveAuthMethod}
        />

        <Divider style={styles.divider} />

        {/* Data & Privacy */}
        <List.Section>
          <List.Subheader>Data & Privacy</List.Subheader>
          
          <List.Item
            title="Clear Cache"
            description="Remove locally stored data"
            left={(props) => <List.Icon {...props} icon="database-remove" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleClearCache}
          />
          
          <List.Item
            title="Privacy Policy"
            description="View our privacy policy"
            left={(props) => <List.Icon {...props} icon="shield-account" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              lightImpact();
              // TODO: Navigate to privacy policy
              Alert.alert('Privacy Policy', 'Privacy policy will be available soon.');
            }}
          />
          
          <List.Item
            title="Terms of Service"
            description="View our terms of service"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              lightImpact();
              // TODO: Navigate to terms of service
              Alert.alert('Terms of Service', 'Terms of service will be available soon.');
            }}
          />
        </List.Section>

        <Divider style={styles.divider} />

        {/* About */}
        <List.Section>
          <List.Subheader>About</List.Subheader>
          
          <List.Item
            title="App Version"
            description="1.0.0 (Build 1)"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          
          <List.Item
            title="Help & Support"
            description="Get help with the app"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              lightImpact();
              // TODO: Navigate to help
              Alert.alert('Help & Support', 'Help & support will be available soon.');
            }}
          />
        </List.Section>

        <Divider style={styles.divider} />

        {/* Sign Out Button */}
        <View style={styles.section}>
          <Button
            mode="outlined"
            onPress={handleSignOut}
            icon="logout"
            textColor={theme.colors.error}
            style={[styles.signOutButton, { borderColor: theme.colors.error }]}
          >
            Sign Out
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  section: {
    padding: 16,
  },
  divider: {
    marginVertical: 8,
  },
  signOutButton: {
    marginTop: 8,
  },
});
