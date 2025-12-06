import { IconSymbol } from '@/components/ui/icon-symbol';
import { useActiveOrganization } from '@/hooks/use-active-organization';
import { useAuth } from '@/hooks/use-auth';
import { useOrganizations } from '@/hooks/use-organizations';
import { usePermissions } from '@/hooks/use-permissions';
import { errorFeedback, lightImpact, successFeedback } from '@/lib/utils/haptics';
import { useProfile } from '@/services/api/profile';
import { logToReactotron } from '@/services/monitoring/reactotron';
import { Role } from '@/types/organization';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import * as Sentry from '@sentry/react-native';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Divider, IconButton, Text, useTheme } from 'react-native-paper';

function CustomDrawerContent(props: any) {
  const theme = useTheme();
  const { signOut } = useAuth();
  const { data: user } = useProfile();
  const { data: organizations } = useOrganizations();
  const { canManageMembers, currentRole } = usePermissions();
  const router = useRouter();

  // Check if user has Owner/Admin role in ANY organization (even if not active)
  const hasManagementRole = React.useMemo(() => {
    if (canManageMembers) return true; // Use active org permission if available
    if (!organizations) return false;
    return organizations.some(
      (org) => org.role === Role.OWNER || org.role === Role.ADMIN
    );
  }, [organizations, canManageMembers]);

  // Debug permissions
  React.useEffect(() => {
    console.log('🔐 Drawer Permissions:', { 
      canManageMembers, 
      currentRole, 
      hasManagementRole,
      organizationsCount: organizations?.length 
    });
  }, [canManageMembers, currentRole, hasManagementRole, organizations]);

  const handleLogout = async () => {
    try {
      await successFeedback();
      
      logToReactotron('User logged out from drawer', {
        userId: user?.id,
      });
      
      await signOut();
      
      Sentry.addBreadcrumb({
        category: 'auth',
        message: 'User logged out from drawer',
        level: 'info',
      });

      // Navigate to sign-in screen
      router.replace('/(auth)/sign-in');
    } catch (error) {
      await errorFeedback();
      
      logToReactotron('Logout error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      Sentry.captureException(error, {
        tags: { context: 'drawer-logout' },
      });
    }
  };

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: theme.colors.background }}>
      {/* User Profile Section */}
      <View style={[styles.profileSection, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Avatar.Text
          size={60}
          label={user?.name?.substring(0, 2).toUpperCase() || 'U'}
          style={{ backgroundColor: theme.colors.primary }}
        />
        <Text variant="titleMedium" style={styles.userName}>
          {user?.name || 'User'}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {user?.email || ''}
        </Text>
      </View>

      <Divider style={styles.divider} />

      {/* Navigation Items */}
      <DrawerItem
        label="Dashboard"
        icon={() => <IconSymbol size={24} name="house.fill" color={theme.colors.onSurface} />}
        onPress={() => {
          props.navigation.navigate('index');
          lightImpact();
        }}
        labelStyle={{ color: theme.colors.onSurface }}
      />
      
      <DrawerItem
        label="Organizations"
        icon={() => <IconSymbol size={24} name="building.2.fill" color={theme.colors.onSurface} />}
        onPress={() => {
          props.navigation.navigate('organizations');
          lightImpact();
        }}
        labelStyle={{ color: theme.colors.onSurface }}
      />
      
      <DrawerItem
        label="Profile"
        icon={() => <IconSymbol size={24} name="person.fill" color={theme.colors.onSurface} />}
        onPress={() => {
          props.navigation.navigate('profile');
          lightImpact();
        }}
        labelStyle={{ color: theme.colors.onSurface }}
      />

      {/* Team Management - Only for Owner/Admin */}
      {hasManagementRole && (
        <DrawerItem
          label="Team"
          icon={() => <IconSymbol size={24} name="person.2.fill" color={theme.colors.onSurface} />}
          onPress={() => {
            router.push('/teams' as any);
            lightImpact();
          }}
          labelStyle={{ color: theme.colors.onSurface }}
        />
      )}

      {/* Pending Invitations - Only for Owner/Admin */}
      {hasManagementRole && (
        <DrawerItem
          label="Invitations"
          icon={() => <IconSymbol size={24} name="envelope.fill" color={theme.colors.onSurface} />}
          onPress={() => {
            router.push('/invitations/pending' as any);
            lightImpact();
          }}
          labelStyle={{ color: theme.colors.onSurface }}
        />
      )}

      <Divider style={styles.divider} />

      {/* Logout */}
      <DrawerItem
        label="Logout"
        icon={() => <IconSymbol size={24} name="arrow.right.square" color={theme.colors.error} />}
        onPress={handleLogout}
        labelStyle={{ color: theme.colors.error }}
      />
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const theme = useTheme();
  const router = useRouter();
  const { data: organizations, isLoading: isLoadingOrgs } = useOrganizations();
  const { activeOrganizationId, switchOrganization } = useActiveOrganization();

  // Auto-select first organization if none is active
  useEffect(() => {
    console.log('🔵 [Tabs Layout] Checking organization selection:', {
      isLoadingOrgs,
      hasOrganizations: !!organizations,
      organizationsCount: organizations?.length,
      activeOrganizationId,
      shouldAutoSelect: !isLoadingOrgs && organizations && organizations.length > 0 && !activeOrganizationId,
    });

    if (!isLoadingOrgs && organizations && organizations.length > 0 && !activeOrganizationId) {
      const firstOrg = organizations[0];
      console.log('🟢 [Tabs Layout] Auto-selecting first organization:', {
        orgId: firstOrg.id,
        orgName: firstOrg.name,
        role: firstOrg.role,
      });
      
      switchOrganization(firstOrg.id).catch((error) => {
        console.error('🔴 [Tabs Layout] Failed to auto-select organization:', error);
        Sentry.captureException(error, {
          tags: { context: 'tabs-layout-auto-select-org' },
          extra: { organizationId: firstOrg.id },
        });
      });
    }
  }, [organizations, activeOrganizationId, isLoadingOrgs]);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        drawerStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Dashboard',
          drawerLabel: 'Dashboard',
        }}
      />
      <Drawer.Screen
        name="organizations"
        options={{
          title: 'Organizations',
          drawerLabel: 'Organizations',
          headerShown: false,
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              iconColor={theme.colors.onSurface}
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: 'Profile',
          drawerLabel: 'Profile',
          headerShown: false,
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              iconColor={theme.colors.onSurface}
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="teams"
        options={{
          title: 'Team',
          drawerLabel: 'Team',
          headerShown: false,
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              iconColor={theme.colors.onSurface}
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="invitations"
        options={{
          title: 'Invitations',
          drawerLabel: 'Invitations',
          headerShown: false,
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              iconColor={theme.colors.onSurface}
              onPress={() => router.back()}
            />
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    marginTop: 12,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 8,
  },
});
