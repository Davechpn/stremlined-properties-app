/**
 * Dashboard Screen
 * 
 * Adaptive personal dashboard that serves as the home screen.
 * Layout adapts based on user's organization membership:
 * - No organizations: Welcome card with "Create Organization" CTA
 * - One organization: Organization card with stats
 * - Multiple organizations: Organization switcher + active org card
 */

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { OrganizationCard } from '@/components/dashboard/organization-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { WelcomeCard } from '@/components/dashboard/welcome-card';
import { OrganizationSwitcher } from '@/components/organizations/organization-switcher';
import { ErrorMessage } from '@/components/ui/error-message';
import {
  SkeletonDashboardHeader,
  SkeletonOrganizationCard,
  SkeletonQuickActions,
} from '@/components/ui/skeleton';
import { useActiveOrganization } from '@/hooks/use-active-organization';
import { useAuth } from '@/hooks/use-auth';
import { useOrganizations } from '@/hooks/use-organizations';
import { usePermissions } from '@/hooks/use-permissions';
import { errorFeedback, lightImpact, successFeedback } from '@/lib/utils/haptics';
import { useProfile } from '@/services/api/profile';
import { logToReactotron } from '@/services/monitoring/reactotron';
import * as Sentry from '@sentry/react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { FAB, Text, useTheme } from 'react-native-paper';

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loadStartTime] = useState(Date.now());
  const [switcherVisible, setSwitcherVisible] = useState(false);

  // Auth hook
  const { signOut } = useAuth();

  // Fetch data
  const { data: user, isLoading: isLoadingUser, error: userError, refetch: refetchUser } = useProfile();
  const { data: organizations, isLoading: isLoadingOrgs, error: orgsError, refetch: refetchOrgs } = useOrganizations();
  const { activeOrganizationId, switchOrganization } = useActiveOrganization();
  const { canManageOrganization, canManageProperties, canInviteMembers } = usePermissions();

  const isLoading = isLoadingUser || isLoadingOrgs;
  const error = userError || orgsError;

  // Debug logs for organizations data
  useEffect(() => {
    console.log('🟣 [Dashboard] Organizations data updated:', {
      isLoading: isLoadingOrgs,
      hasError: !!orgsError,
      error: orgsError,
      organizationsCount: organizations?.length,
      organizations: organizations,
      activeOrganizationId,
    });
  }, [organizations, isLoadingOrgs, orgsError, activeOrganizationId]);

  // Performance monitoring and logging
  useEffect(() => {
    if (!isLoading && !error) {
      const loadTime = Date.now() - loadStartTime;
      
      // Log to Reactotron
      logToReactotron('Dashboard loaded', {
        loadTimeMs: loadTime,
        userId: user?.id,
        organizationCount: organizations?.length || 0,
        activeOrgId: activeOrganizationId,
        hasMultipleOrgs: (organizations?.length || 0) > 1,
      });

      // Add Sentry breadcrumb
      Sentry.addBreadcrumb({
        category: 'dashboard',
        message: 'Dashboard loaded',
        level: 'info',
        data: {
          loadTimeMs: loadTime,
          organizationCount: organizations?.length || 0,
          activeOrgId: activeOrganizationId,
        },
      });

      // Track performance (target: <2 seconds)
      if (loadTime > 2000) {
        Sentry.captureMessage('Dashboard load time exceeded target', {
          level: 'warning',
          tags: {
            feature: 'dashboard',
            performance: 'slow-load',
          },
          extra: {
            loadTimeMs: loadTime,
            targetMs: 2000,
          },
        });
      }
    }
  }, [isLoading, error, user, organizations, activeOrganizationId, loadStartTime]);

  // Monitor organization context changes
  useEffect(() => {
    if (activeOrganizationId) {
      const contextChangeTime = Date.now();
      
      logToReactotron('Organization context changed', {
        activeOrgId: activeOrganizationId,
        timestamp: contextChangeTime,
      });

      Sentry.addBreadcrumb({
        category: 'dashboard',
        message: 'Organization context changed',
        level: 'info',
        data: { activeOrgId: activeOrganizationId },
      });
    }
  }, [activeOrganizationId]);

  // Auto-select first organization if none is active
  useEffect(() => {
    if (!isLoadingOrgs && organizations && organizations.length > 0 && !activeOrganizationId) {
      const firstOrg = organizations[0];
      console.log('🟢 [Dashboard] Auto-selecting first organization:', {
        orgId: firstOrg.id,
        orgName: firstOrg.name,
        role: firstOrg.role,
      });
      
      switchOrganization(firstOrg.id).catch((error) => {
        console.error('🔴 [Dashboard] Failed to auto-select organization:', error);
        Sentry.captureException(error, {
          tags: { context: 'dashboard-auto-select-org' },
          extra: { organizationId: firstOrg.id },
        });
      });
    }
  }, [organizations, activeOrganizationId, isLoadingOrgs, switchOrganization]);

  // Find active organization
  const activeOrganization = organizations?.find((org) => org.id === activeOrganizationId) || 
                            (organizations && organizations.length > 0 ? organizations[0] : null);

  // Determine dashboard state
  const hasNoOrganizations = organizations && organizations.length === 0;
  const hasOneOrganization = organizations && organizations.length === 1;
  const hasMultipleOrganizations = organizations && organizations.length > 1;

  // Debug log dashboard state
  useEffect(() => {
    console.log('🟣 [Dashboard] State determined:', {
      hasNoOrganizations,
      hasOneOrganization,
      hasMultipleOrganizations,
      activeOrganization: activeOrganization ? { id: activeOrganization.id, name: activeOrganization.name } : null,
      organizationsArray: organizations?.map(o => ({ id: o.id, name: o.name })),
      willShowWelcomeCard: hasNoOrganizations,
      willShowOrgCard: !!activeOrganization,
    });
  }, [hasNoOrganizations, hasOneOrganization, hasMultipleOrganizations, activeOrganization, organizations]);

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Haptic feedback at start
    await lightImpact();
    
    try {
      await Promise.all([refetchUser(), refetchOrgs()]);
      
      // Success haptic feedback
      await successFeedback();
      
      logToReactotron('Dashboard refreshed', {
        userId: user?.id,
        organizationCount: organizations?.length || 0,
        activeOrgId: activeOrganizationId,
      });
      
      Sentry.addBreadcrumb({
        category: 'dashboard',
        message: 'Dashboard refreshed',
        level: 'info',
        data: {
          organizationCount: organizations?.length || 0,
          activeOrgId: activeOrganizationId,
        },
      });
    } catch (error) {
      // Error haptic feedback
      await errorFeedback();
      
      logToReactotron('Dashboard refresh error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      Sentry.captureException(error, {
        tags: { context: 'dashboard-refresh' },
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Handle create organization
  const handleCreateOrganization = () => {
    // Will be implemented when create organization screen is added
    console.log('Create organization');
  };

  // Handle organization switcher
  const handleOrganizationSwitcher = () => {
    lightImpact();
    setSwitcherVisible(true);
    
    logToReactotron('Organization switcher opened', {
      organizationCount: organizations?.length || 0,
      activeOrgId: activeOrganizationId,
    });
  };

  // Handle switcher dismiss
  const handleSwitcherDismiss = () => {
    setSwitcherVisible(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await successFeedback();
      await signOut();
      
      logToReactotron('User logged out', {
        userId: user?.id,
      });
      
      Sentry.addBreadcrumb({
        category: 'auth',
        message: 'User logged out',
        level: 'info',
      });
    } catch (error) {
      await errorFeedback();
      
      logToReactotron('Logout error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      Sentry.captureException(error, {
        tags: { context: 'logout' },
      });
    }
  };

  // Generate quick actions based on permissions
  const getQuickActions = () => {
    const actions = [];

    if (canManageOrganization) {
      actions.push({
        label: 'Settings',
        icon: 'cog',
        onPress: () => console.log('Organization settings'),
      });
    }

    if (canManageProperties) {
      actions.push({
        label: 'Add Property',
        icon: 'home-plus',
        onPress: () => console.log('Add property'),
      });
    }

    if (canInviteMembers) {
      actions.push({
        label: 'Team',
        icon: 'account-group',
        onPress: () => {
          lightImpact();
          router.push('/teams' as any);
        },
      });

      actions.push({
        label: 'Invitations',
        icon: 'email-outline',
        onPress: () => {
          lightImpact();
          router.push('/invitations/pending' as any);
        },
      });
    }

    actions.push({
      label: 'View Profile',
      icon: 'account',
      onPress: () => {
        lightImpact();
        router.push('/profile' as any);
      },
      variant: 'outlined' as const,
    });

    return actions;
  };

  // Loading state with skeleton
  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SkeletonDashboardHeader />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <SkeletonOrganizationCard />
          <SkeletonQuickActions />
        </ScrollView>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ErrorMessage
          error={error}
          onRetry={handleRefresh}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <DashboardHeader
        user={user || null}
        activeOrganization={activeOrganization}
        onOrganizationSwitcherPress={handleOrganizationSwitcher}
        onLogoutPress={handleLogout}
        hasMultipleOrganizations={hasMultipleOrganizations || false}
      />

      {/* Scrollable content */}
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
        {/* No organizations: Welcome card */}
        {hasNoOrganizations && (
          <WelcomeCard
            userName={user?.name || 'there'}
            onCreateOrganization={handleCreateOrganization}
          />
        )}

        {/* One or more organizations: Show active organization */}
        {activeOrganization && (
          <>
            <OrganizationCard
              organization={activeOrganization}
              isActive
            />
            
            {/* Quick actions */}
            <QuickActions actions={getQuickActions()} />
            
            {/* Recent activity section */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Recent Activity
              </Text>
              <Text variant="bodyMedium" style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                No recent activity
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* FAB for creating organization (only shown when user has no orgs) */}
      {hasNoOrganizations && (
        <FAB
          icon="plus"
          label="Create Organization"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={handleCreateOrganization}
        />
      )}

      {/* Organization Switcher Bottom Sheet */}
      <OrganizationSwitcher
        visible={switcherVisible}
        onDismiss={handleSwitcherDismiss}
      />
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
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
