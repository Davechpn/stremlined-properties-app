/**
 * Organizations Screen
 * 
 * Displays a list of all organizations the user belongs to,
 * with the ability to switch between them and view organization details.
 */

import { OrganizationCard } from '@/components/dashboard/organization-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useActiveOrganization } from '@/hooks/use-active-organization';
import { useOrganizations } from '@/hooks/use-organizations';
import { useSwitchOrganization } from '@/services/api/organizations';
import { logToReactotron } from '@/services/monitoring/reactotron';
import * as Sentry from '@sentry/react-native';
import { lightImpact, mediumImpact, successFeedback, errorFeedback } from '@/lib/utils/haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Snackbar, Text, useTheme } from 'react-native-paper';

export default function OrganizationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch organizations
  const { data: organizations, isLoading, error, refetch } = useOrganizations();
  const { activeOrganizationId, switchOrganization: setActiveOrganization } = useActiveOrganization();
  const switchOrgMutation = useSwitchOrganization();

  // Debug logs for organizations data
  React.useEffect(() => {
    console.log('🟣 [Organizations Screen] Data updated:', {
      isLoading,
      hasError: !!error,
      error,
      organizationsCount: organizations?.length,
      organizations: organizations?.map(o => ({ id: o.id, name: o.name, role: o.role, userRole: o.userRole })),
      activeOrganizationId,
    });
  }, [organizations, isLoading, error, activeOrganizationId]);

  // Handle organization press - navigate to detail view
  const handleOrganizationPress = async (organizationId: string) => {
    await lightImpact();
    router.push(`/organizations/${organizationId}` as any);
  };

  // Handle organization long press - switch active organization
  const handleOrganizationLongPress = async (organizationId: string) => {
    if (organizationId === activeOrganizationId) {
      return; // Already active
    }

    try {
      await mediumImpact();
      
      // Switch organization via API
      await switchOrgMutation.mutateAsync({ organizationId });
      
      // Update local state
      setActiveOrganization(organizationId);
      
      await successFeedback();
      
      setSnackbarMessage('Organization switched successfully');
      setSnackbarVisible(true);
      
      logToReactotron('Organization switched', {
        organizationId,
        previousOrgId: activeOrganizationId,
      });
      
      Sentry.addBreadcrumb({
        category: 'organization',
        message: 'Organization switched from list',
        level: 'info',
        data: { organizationId },
      });
    } catch (error) {
      await errorFeedback();
      
      setSnackbarMessage('Failed to switch organization');
      setSnackbarVisible(true);
      
      logToReactotron('Organization switch error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        organizationId,
      });
      
      Sentry.captureException(error, {
        tags: { context: 'organization-switch' },
        extra: { organizationId },
      });
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await lightImpact();
    
    try {
      await refetch();
      await successFeedback();
      
      logToReactotron('Organizations list refreshed', {
        organizationCount: organizations?.length || 0,
      });
    } catch (error) {
      await errorFeedback();
      
      logToReactotron('Organizations refresh error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      Sentry.captureException(error, {
        tags: { context: 'organizations-refresh' },
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Loading state
  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <LoadingIndicator />
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <ErrorMessage error={error} onRetry={refetch} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Organizations list */}
      <Text>Organizations</Text>
      <FlatList
        data={organizations || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrganizationCard
            organization={item}
            isActive={item.id === activeOrganizationId}
            onPress={() => handleOrganizationPress(item.id)}
            onLongPress={() => handleOrganizationLongPress(item.id)}
          />
        )}
        contentContainerStyle={
          organizations && organizations.length > 0
            ? styles.listContent
            : styles.emptyContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No Organizations"
            description="You are not a member of any organizations yet."
          />
        }
      />

      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
