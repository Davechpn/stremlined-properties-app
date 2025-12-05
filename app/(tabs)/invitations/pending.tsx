/**
 * Invitations Screen
 * 
 * Displays all user invitations (sent and received).
 * Uses GET /api/v1/invitations endpoint.
 */

import { EmptyState } from '@/components/ui/empty-state';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useUserInvitationsManagement } from '@/hooks/use-invitations';
import { formatRelativeTime } from '@/lib/utils/formatting';
import { errorFeedback, lightImpact, successFeedback } from '@/lib/utils/haptics';
import { logToReactotron } from '@/services/monitoring/reactotron';
import { InvitationFromAPI } from '@/types/invitation';
import * as Sentry from '@sentry/react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Badge, Button, Card, Divider, SegmentedButtons, Text, useTheme } from 'react-native-paper';

type InvitationType = 'sent' | 'received';

export default function PendingInvitationsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [invitationType, setInvitationType] = useState<InvitationType>('received');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user invitations
  const {
    sentInvitations,
    receivedInvitations,
    isLoading,
    error,
    refetch,
    pendingSentCount,
    pendingReceivedCount,
    expiredSentCount,
    expiredReceivedCount,
    data,
  } = useUserInvitationsManagement();

  // Debug logging
  useEffect(() => {
    console.log('🟣 [Invitations Screen] State:', {
      isLoading,
      hasError: !!error,
      error: error instanceof Error ? error.message : error,
      sentCount: sentInvitations.length,
      receivedCount: receivedInvitations.length,
      rawData: data,
    });
  }, [isLoading, error, sentInvitations, receivedInvitations, data]);

  // Log screen view
  useEffect(() => {
    logToReactotron('User invitations screen viewed', {
      sentCount: sentInvitations.length,
      receivedCount: receivedInvitations.length,
    });

    Sentry.addBreadcrumb({
      category: 'navigation',
      message: 'User invitations screen viewed',
      level: 'info',
      data: {
        sentCount: sentInvitations.length,
        receivedCount: receivedInvitations.length,
      },
    });
  }, [sentInvitations.length, receivedInvitations.length]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await lightImpact();

    try {
      await refetch();
      await successFeedback();
    } catch (error) {
      await errorFeedback();
      logToReactotron('Invitations refresh error', { error });
    } finally {
      setRefreshing(false);
    }
  };

  // Handle invitation press
  const handleInvitationPress = async (invitation: InvitationFromAPI) => {
    await lightImpact();
    // Navigate to organization detail or invitation acceptance
    if (invitationType === 'received' && invitation.status.toLowerCase() === 'pending') {
      // TODO: Navigate to accept invitation screen
      router.push(`/invitations/${invitation.id}` as any);
    } else {
      router.push(`/organizations/${invitation.organizationId}` as any);
    }
  };

  // Get current invitations list
  const currentInvitations = invitationType === 'sent' ? sentInvitations : receivedInvitations;

  // Render invitation item
  const renderInvitation = ({ item }: { item: InvitationFromAPI }) => {
    const isPending = item.status.toLowerCase() === 'pending';
    const isExpired = item.isExpired;

    return (
      <Card 
        style={styles.invitationCard}
        onPress={() => handleInvitationPress(item)}
      >
        <Card.Content>
          <View style={styles.invitationHeader}>
            <Text variant="titleMedium" style={styles.organizationName}>
              {item.organizationName}
            </Text>
            <Badge
              size={24}
              style={[
                styles.badge,
                isPending && !isExpired && { backgroundColor: theme.colors.primaryContainer },
                isExpired && { backgroundColor: theme.colors.errorContainer },
              ]}
            >
              {isExpired ? 'Expired' : item.status}
            </Badge>
          </View>

          <View style={styles.invitationDetails}>
            {invitationType === 'sent' ? (
              <>
                <Text variant="bodyMedium" style={styles.detailText}>
                  To: {item.email || item.phoneNumber}
                </Text>
                <Text variant="bodySmall" style={styles.detailText}>
                  Role: {item.role}
                </Text>
              </>
            ) : (
              <>
                <Text variant="bodyMedium" style={styles.detailText}>
                  From: {item.inviterName}
                </Text>
                <Text variant="bodySmall" style={styles.detailText}>
                  Role: {item.role}
                </Text>
              </>
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.invitationFooter}>
            <Text variant="bodySmall" style={styles.timestamp}>
              {formatRelativeTime(item.createdAt)}
            </Text>
            {!isExpired && isPending && (
              <Text variant="bodySmall" style={styles.expiryText}>
                {item.daysRemaining} day{item.daysRemaining !== 1 ? 's' : ''} remaining
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    const message = invitationType === 'sent'
      ? {
          title: 'No sent invitations',
          description: "You haven't sent any invitations yet",
        }
      : {
          title: 'No received invitations',
          description: "You don't have any pending invitations",
        };

    return (
      <EmptyState
        illustrationType="invitations"
        title={message.title}
        description={message.description}
      />
    );
  };

  // Loading state
  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <LoadingIndicator message="Loading invitations..." />
        <Text variant="bodySmall" style={{ marginTop: 16, opacity: 0.6 }}>
          Fetching from: /api/v1/invitations
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ErrorMessage error={error} onRetry={handleRefresh} />
        <Text variant="bodySmall" style={{ marginTop: 16, opacity: 0.6 }}>
          Error details: {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Debug info at top */}
      {__DEV__ && (
        <View style={[styles.debugBanner, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="bodySmall" style={{ marginBottom: 4 }}>
            Debug: Sent={sentInvitations.length}, Received={receivedInvitations.length}
          </Text>
          <Button mode="outlined" onPress={() => refetch()} compact>
            Refetch Now
          </Button>
        </View>
      )}
      
      {/* Stats header */}
      <View style={[styles.statsHeader, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.stat}>
          <Text variant="titleLarge" style={styles.statValue}>
            {invitationType === 'sent' ? pendingSentCount : pendingReceivedCount}
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
            {invitationType === 'sent' ? expiredSentCount : expiredReceivedCount}
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Expired
          </Text>
        </View>
        <View style={styles.stat}>
          <Text variant="titleLarge" style={styles.statValue}>
            {currentInvitations.length}
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Total
          </Text>
        </View>
      </View>

      {/* Type filter */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={invitationType}
          onValueChange={(value) => setInvitationType(value as InvitationType)}
          buttons={[
            {
              value: 'received',
              label: `Received (${receivedInvitations.length})`,
            },
            {
              value: 'sent',
              label: `Sent (${sentInvitations.length})`,
            },
          ]}
        />
      </View>

      {/* Invitations list */}
      <FlatList
        data={currentInvitations}
        renderItem={renderInvitation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          currentInvitations.length === 0 && styles.listContentEmpty,
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
        // Performance optimizations
        windowSize={10}
        maxToRenderPerBatch={10}
        removeClippedSubviews
        initialNumToRender={15}
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
  debugBanner: {
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  invitationCard: {
    marginBottom: 12,
  },
  invitationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  organizationName: {
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    marginLeft: 8,
  },
  invitationDetails: {
    gap: 4,
  },
  detailText: {
    opacity: 0.8,
  },
  divider: {
    marginVertical: 12,
  },
  invitationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    opacity: 0.6,
  },
  expiryText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
});
