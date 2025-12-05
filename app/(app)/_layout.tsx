/**
 * App Layout
 * 
 * Main layout for authenticated app screens.
 * Provides navigation structure and Sentry breadcrumbs.
 */

import { useActiveOrganization } from '@/hooks/use-active-organization';
import { useAuth } from '@/hooks/use-auth';
import { useOrganizations } from '@/hooks/use-organizations';
import * as Sentry from '@sentry/react-native';
import { Stack, usePathname } from 'expo-router';
import { useEffect } from 'react';

export default function AppLayout() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: organizations, isLoading: isLoadingOrgs } = useOrganizations();
  const { activeOrganizationId, switchOrganization } = useActiveOrganization();

  // Track navigation with Sentry breadcrumbs
  useEffect(() => {
    if (pathname) {
      Sentry.addBreadcrumb({
        category: 'navigation',
        message: `Navigated to ${pathname}`,
        level: 'info',
        data: { pathname },
      });
    }
  }, [pathname]);

  // Update Sentry user context
  useEffect(() => {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email || undefined,
        username: user.name,
      });
    }
  }, [user]);

  // Auto-select first organization if none is active
  useEffect(() => {
    console.log('🔵 [App Layout] Checking organization selection:', {
      isLoadingOrgs,
      hasOrganizations: !!organizations,
      organizationsCount: organizations?.length,
      activeOrganizationId,
      shouldAutoSelect: !isLoadingOrgs && organizations && organizations.length > 0 && !activeOrganizationId,
    });

    if (!isLoadingOrgs && organizations && organizations.length > 0 && !activeOrganizationId) {
      const firstOrg = organizations[0];
      console.log('🟢 [App Layout] Auto-selecting first organization:', {
        orgId: firstOrg.id,
        orgName: firstOrg.name,
        role: firstOrg.role,
      });
      
      switchOrganization(firstOrg.id).catch((error) => {
        console.error('🔴 [App Layout] Failed to auto-select organization:', error);
        Sentry.captureException(error, {
          tags: { context: 'app-layout-auto-select-org' },
          extra: { organizationId: firstOrg.id },
        });
      });
    }
  }, [organizations, activeOrganizationId, isLoadingOrgs]);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerBackVisible: true,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen 
        name="profile/edit" 
        options={{ 
          title: 'Edit Profile',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="profile/settings" 
        options={{ 
          title: 'Settings',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="organizations/create" 
        options={{ 
          title: 'Create Organization',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="organizations/[id]" 
        options={{ 
          title: 'Organization',
        }} 
      />
      <Stack.Screen 
        name="organizations/[id]/settings" 
        options={{ 
          title: 'Organization Settings',
        }} 
      />
      <Stack.Screen 
        name="teams/index" 
        options={{ 
          title: 'Team Members',
        }} 
      />
      <Stack.Screen 
        name="teams/invite" 
        options={{ 
          title: 'Invite Member',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="teams/[memberId]" 
        options={{ 
          title: 'Member Details',
        }} 
      />
      <Stack.Screen 
        name="invitations/[token]" 
        options={{ 
          title: 'Accept Invitation',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="invitations/pending" 
        options={{ 
          title: 'Pending Invitations',
        }} 
      />
    </Stack>
  );
}
