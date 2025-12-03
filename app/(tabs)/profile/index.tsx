/**
 * Profile Screen
 * 
 * User profile view showing personal information, role, and authentication methods.
 * Provides access to edit profile, settings, and sign out.
 */

import { ProfileHeader } from '@/components/profile/profile-header';
import { AuthMethods, AuthMethodItem } from '@/components/profile/auth-methods';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { ROLE_DESCRIPTIONS } from '@/constants/roles';
import { useActiveOrganization } from '@/hooks/use-active-organization';
import { useAuth } from '@/hooks/use-auth';
import { useOrganizations } from '@/hooks/use-organizations';
import { useProfile } from '@/services/api/profile';
import { AuthMethod } from '@/types/auth';
import { Role } from '@/types/organization';
import { lightImpact, mediumImpact, heavyImpact, successFeedback, errorFeedback, warningFeedback, selectionChanged } from '@/lib/utils/haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, List, useTheme } from 'react-native-paper';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signOut } = useAuth();

  // Fetch data
  const { data: user, isLoading, error, refetch } = useProfile();
  const { data: organizations } = useOrganizations();
  const { activeOrganizationId } = useActiveOrganization();

  const [refreshing, setRefreshing] = React.useState(false);

  // Find active organization and user's role
  const activeOrganization = organizations?.find((org) => org.id === activeOrganizationId);
  const userRole = activeOrganization?.userRole as Role | undefined;

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await lightImpact();
    
    try {
      await refetch();
      await successFeedback();
    } catch (error) {
      await errorFeedback();
    } finally {
      setRefreshing(false);
    }
  };

  // Handle edit profile
  const handleEditProfile = () => {
    lightImpact();
    router.push('/profile/edit' as any);
  };

  // Handle settings
  const handleSettings = () => {
    lightImpact();
    router.push('/profile/settings' as any);
  };

  // Handle sign out
  const handleSignOut = async () => {
    await successFeedback();
    await signOut();
  };

  // Loading state
  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingIndicator message="Loading profile..." />
      </View>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ErrorMessage
          error={error || new Error('Failed to load profile')}
          onRetry={handleRefresh}
        />
      </View>
    );
  }

  // Map user auth methods to AuthMethodItem format
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
      isPrimary: index === 0, // First method is primary
      linkedAt: user.createdAt,
    };
  });

  // Handle add authentication method
  const handleAddAuthMethod = (method: AuthMethod) => {
    lightImpact();
    // TODO: Navigate to add auth method flow
    console.log('Add auth method:', method);
  };

  // Handle remove authentication method
  const handleRemoveAuthMethod = (method: AuthMethod) => {
    lightImpact();
    // TODO: Show confirmation and remove auth method
    console.log('Remove auth method:', method);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Profile Header */}
        <ProfileHeader
          user={user}
          role={userRole}
          organizationName={activeOrganization?.name}
          size="large"
        />

        <Divider style={styles.divider} />

        {/* Quick Actions */}
        <View style={styles.section}>
          <Button
            mode="contained"
            onPress={handleEditProfile}
            icon="pencil"
            style={styles.primaryButton}
          >
            Edit Profile
          </Button>

          <Button
            mode="outlined"
            onPress={handleSettings}
            icon="cog"
            style={styles.secondaryButton}
          >
            Settings
          </Button>
        </View>

        <Divider style={styles.divider} />

        {/* Account Info */}
        <View style={styles.section}>
          <List.Section>
            <List.Subheader>Account Information</List.Subheader>
            
            <List.Item
              title="Email"
              description={user.email || 'Not set'}
              left={(props) => <List.Icon {...props} icon="email" />}
            />
            
            <List.Item
              title="Phone"
              description={user.phoneNumber || 'Not set'}
              left={(props) => <List.Icon {...props} icon="phone" />}
            />
            
            {userRole && activeOrganization && (
              <List.Item
                title="Role"
                description={ROLE_DESCRIPTIONS[userRole]}
                left={(props) => <List.Icon {...props} icon="shield-account" />}
              />
            )}
            
            <List.Item
              title="Email Verified"
              description={user.isEmailVerified ? 'Verified' : 'Not verified'}
              left={(props) => <List.Icon {...props} icon={user.isEmailVerified ? 'check-circle' : 'alert-circle'} />}
              right={() => user.isEmailVerified ? null : <List.Icon icon="chevron-right" />}
            />
            
            <List.Item
              title="Phone Verified"
              description={user.isPhoneVerified ? 'Verified' : 'Not verified'}
              left={(props) => <List.Icon {...props} icon={user.isPhoneVerified ? 'check-circle' : 'alert-circle'} />}
              right={() => user.isPhoneVerified ? null : <List.Icon icon="chevron-right" />}
            />
          </List.Section>
        </View>

        <Divider style={styles.divider} />

        {/* Authentication Methods */}
        <AuthMethods
          methods={authMethods}
          onAddMethod={handleAddAuthMethod}
          onRemoveMethod={handleRemoveAuthMethod}
        />

        <Divider style={styles.divider} />

        {/* Sign Out */}
        <View style={styles.section}>
          <Button
            mode="outlined"
            onPress={handleSignOut}
            icon="logout"
            textColor={theme.colors.error}
            style={[styles.secondaryButton, { borderColor: theme.colors.error }]}
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
  primaryButton: {
    marginBottom: 12,
  },
  secondaryButton: {
    marginBottom: 8,
  },
});
