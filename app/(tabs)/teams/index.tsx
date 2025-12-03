/**
 * Team Members List Screen
 * 
 * Displays all members of the active organization with roles and status.
 * Includes search, filtering, and invite member FAB for authorized users.
 */

import { MemberListItem } from '@/components/teams/member-list-item';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useActiveOrganization } from '@/hooks/use-active-organization';
import { usePermissions } from '@/hooks/use-permissions';
import { useTeamManagement } from '@/hooks/use-teams';
import { MemberWithUser } from '@/services/api/teams';
import { logToReactotron } from '@/services/monitoring/reactotron';
import * as Sentry from '@sentry/react-native';
import { lightImpact, successFeedback, errorFeedback } from '@/lib/utils/haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { FAB, Searchbar, Text, useTheme } from 'react-native-paper';

export default function TeamMembersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { activeOrganizationId } = useActiveOrganization();
  const { canInviteMembers } = usePermissions();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch team members
  const {
    members,
    isLoading,
    error,
    refetch,
    memberCount,
    roleDistribution,
  } = useTeamManagement(activeOrganizationId);

  // Log screen view
  useEffect(() => {
    logToReactotron('Team members screen viewed', {
      organizationId: activeOrganizationId,
      memberCount,
    });

    Sentry.addBreadcrumb({
      category: 'navigation',
      message: 'Team members screen viewed',
      level: 'info',
      data: {
        organizationId: activeOrganizationId,
        memberCount,
      },
    });
  }, [activeOrganizationId, memberCount]);

  // Filter members by search query
  const filteredMembers = React.useMemo(() => {
    if (!searchQuery.trim()) return members;

    const query = searchQuery.toLowerCase();
    return members.filter(
      (member) =>
        member.user.name.toLowerCase().includes(query) ||
        member.user.email?.toLowerCase().includes(query) ||
        member.user.phoneNumber?.includes(query) ||
        member.role.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await refetch();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      logToReactotron('Team members refresh error', { error });
    } finally {
      setRefreshing(false);
    }
  };

  // Handle member press
  const handleMemberPress = (member: MemberWithUser) => {
    router.push(`/(app)/teams/${member.id}` as any);
  };

  // Handle invite press
  const handleInvitePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(app)/teams/invite' as any);
  };

  // Handle search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Render member item
  const renderMember = ({ item }: { item: MemberWithUser }) => (
    <MemberListItem member={item} onPress={handleMemberPress} />
  );

  // Render empty state
  const renderEmptyState = () => {
    if (searchQuery.trim()) {
      return (
        <EmptyState
          illustrationType="search"
          title="No members found"
          description={`No members match "${searchQuery}"`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      );
    }

    return (
      <EmptyState
        illustrationType="teams"
        title="No team members yet"
        description="Invite team members to start collaborating"
        actionLabel={canInviteMembers ? 'Invite Member' : undefined}
        onAction={canInviteMembers ? handleInvitePress : undefined}
      />
    );
  };

  // Loading state
  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingIndicator message="Loading team members..." />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ErrorMessage error={error} onRetry={handleRefresh} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with stats */}
      {memberCount > 0 && (
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleMedium" style={styles.headerTitle}>
            Team Members ({memberCount})
          </Text>
          <View style={styles.statsRow}>
            {Object.entries(roleDistribution).map(([role, count]) =>
              count > 0 ? (
                <View key={role} style={styles.stat}>
                  <Text
                    variant="bodySmall"
                    style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
                  >
                    {role}
                  </Text>
                  <Text variant="titleSmall" style={styles.statValue}>
                    {count}
                  </Text>
                </View>
              ) : null
            )}
          </View>
        </View>
      )}

      {/* Search bar */}
      {memberCount > 0 && (
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search members..."
            onChangeText={handleSearchChange}
            value={searchQuery}
            style={styles.searchbar}
          />
        </View>
      )}

      {/* Members list */}
      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredMembers.length === 0 && styles.listContentEmpty,
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

      {/* Invite FAB (only for authorized users) */}
      {canInviteMembers && (
        <FAB
          icon="account-plus"
          label="Invite Member"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={handleInvitePress}
        />
      )}
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 0,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
