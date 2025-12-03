/**
 * Pending Invitations Screen
 * 
 * Display list of all pending invitations sent by the user
 * for the active organization.
 */

import { InvitationListItem } from '@/components/teams/invitation-list-item';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useActiveOrganization } from '@/hooks/use-active-organization';
import { useInvitationManagement } from '@/hooks/use-invitations';
import { Invitation, InvitationStatus } from '@/types/invitation';
import { logToReactotron } from '@/services/monitoring/reactotron';
import * as Sentry from '@sentry/react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SegmentedButtons, Text, useTheme } from 'react-native-paper';

export default function PendingInvitationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { activeOrganizationId } = useActiveOrganization();

  const [statusFilter, setStatusFilter] = useState<InvitationStatus>(InvitationStatus.PENDING);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch invitations
  const {
    invitations,
    isLoading,
    error,
    refetch,
    revokeInvitation,
    isRevoking,
    pendingCount,
    expiredCount,
  } = useInvitationManagement(activeOrganizationId, statusFilter);

  // Log screen view
  useEffect(() => {
    logToReactotron('Pending invitations screen viewed', {
      organizationId: activeOrganizationId,
      statusFilter,
      count: invitations.length,
    });

    Sentry.addBreadcrumb({
      category: 'navigation',
      message: 'Pending invitations screen viewed',
      level: 'info',
      data: {
        organizationId: activeOrganizationId,
        count: invitations.length,
      },
    });
  }, [activeOrganizationId, statusFilter, invitations.length]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await refetch();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      logToReactotron('Invitations refresh error', { error });
    } finally {
      setRefreshing(false);
    }
  };

  // Handle revoke invitation
  const handleRevoke = async (invitation: Invitation) => {
    try {
      logToReactotron('Revoking invitation', {
        invitationId: invitation.id,
        contact: invitation.inviteeContact,
      });

      await revokeInvitation(invitation.token);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      logToReactotron('Invitation revoked successfully', {
        invitationId: invitation.id,
      });

      Sentry.addBreadcrumb({
        category: 'invitation',
        message: 'Invitation revoked',
        level: 'info',
        data: {
          invitationId: invitation.id,
        },
      });

      // Refresh list
      refetch();
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      logToReactotron('Revoke invitation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      Sentry.captureException(error, {
        tags: { context: 'revoke-invitation' },
      });

      Alert.alert('Revoke Failed', 'Failed to revoke invitation. Please try again.');
    }
  };

  // Handle back press
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Render invitation item
  const renderInvitation = ({ item }: { item: Invitation }) => (
    <InvitationListItem invitation={item} onRevoke={handleRevoke} disabled={isRevoking} />
  );

  // Render empty state
  const renderEmptyState = () => {
    const messages: Record<InvitationStatus, { title: string; description: string }> = {
      [InvitationStatus.PENDING]: {
        title: 'No pending invitations',
        description: 'All sent invitations have been accepted or expired',
      },
      [InvitationStatus.ACCEPTED]: {
        title: 'No accepted invitations',
        description: 'No invitations have been accepted yet',
      },
      [InvitationStatus.EXPIRED]: {
        title: 'No expired invitations',
        description: 'All sent invitations are still valid',
      },
      [InvitationStatus.REVOKED]: {
        title: 'No revoked invitations',
        description: "You haven't revoked any invitations",
      },
    };

    const message = messages[statusFilter];

    return (
      <EmptyState
        title={message.title}
        description={message.description}
        actionLabel="Go Back"
        onAction={handleBack}
      />
    );
  };

  // Loading state
  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <LoadingIndicator message="Loading invitations..." />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ErrorMessage error={error} onRetry={handleRefresh} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Stats header */}
      <View style={[styles.statsHeader, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.stat}>
          <Text variant="titleLarge" style={styles.statValue}>
            {pendingCount}
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Pending
          </Text>
        </View>
        <View style={styles.stat}>
          <Text variant="titleLarge" style={styles.statValue}>
            {expiredCount}
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Expired
          </Text>
        </View>
      </View>

      {/* Status filter */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as InvitationStatus)}
          buttons={[
            {
              value: InvitationStatus.PENDING,
              label: 'Pending',
            },
            {
              value: InvitationStatus.ACCEPTED,
              label: 'Accepted',
            },
            {
              value: InvitationStatus.EXPIRED,
              label: 'Expired',
            },
          ]}
        />
      </View>

      {/* Invitations list */}
      <FlatList
        data={invitations}
        renderItem={renderInvitation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          invitations.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
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
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  filterContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
