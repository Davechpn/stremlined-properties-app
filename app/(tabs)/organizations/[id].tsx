/**
 * Organization Detail Screen
 * 
 * Displays detailed information about an organization.
 * Shows members, settings access for owner/admin.
 */

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorMessage } from '@/components/ui/error-message';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useOrganizationDetails } from '@/hooks/use-organizations';
import { formatRelativeTime } from '@/lib/utils/formatting';
import { lightImpact } from '@/lib/utils/haptics';
import { Role } from '@/types/organization';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Divider, List, Text, useTheme } from 'react-native-paper';

export default function OrganizationDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch organization details
  const { data: organization, isLoading, isError, refetch } = useOrganizationDetails(id!);

  // TODO: Implement useOrganizationMembers hook in Phase 9 (Invitations)
  const members: any[] = [];
  const isLoadingMembers = false;

  // Check if user can manage organization
  const canManage = organization?.userRole === Role.OWNER || organization?.userRole === Role.ADMIN;

  // Handle settings navigation
  const handleSettingsPress = () => {
    lightImpact();
    router.push(`/organizations/${id}/settings` as any);
  };

  // Configure header with settings button if user can manage
  React.useLayoutEffect(() => {
    if (organization) {
      navigation.setOptions({
        title: organization.name,
        headerRight: canManage ? () => (
          <TouchableOpacity onPress={handleSettingsPress} style={{ marginRight: 8 }}>
            <IconSymbol name="gearshape.fill" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        ) : undefined,
      });
    }
  }, [organization, canManage, navigation, theme]);

  // Handle back
  const handleBack = () => {
    lightImpact();
    router.back();
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingIndicator message="Loading organization..." />
      </View>
    );
  }

  // Error state
  if (isError || !organization) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorMessage
          error="Failed to load organization"
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Content */}
      <ScrollView style={styles.scrollView}>
        {/* Organization Info Card */}
        <Card style={styles.infoCard}>
          <Card.Content>
            {/* Avatar and Name */}
            <View style={styles.header}>
              <Avatar
                uri={undefined} // Organization doesn't have logo yet
                name={organization.name}
                size={80}
              />
              <View style={styles.headerText}>
                <Text variant="headlineSmall" style={styles.name}>
                  {organization.name}
                </Text>
                <Badge
                  role={organization.userRole as Role}
                  size="small"
                />
              </View>
            </View>

            {/* Description */}
            {organization.description && (
              <>
                <Divider style={styles.divider} />
                <Text variant="bodyMedium" style={styles.description}>
                  {organization.description}
                </Text>
              </>
            )}

            {/* Stats */}
            <Divider style={styles.divider} />
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text variant="titleLarge" style={styles.statValue}>
                  {organization.memberCount || 0}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Members
                </Text>
              </View>
              <View style={styles.stat}>
                <Text variant="titleLarge" style={styles.statValue}>
                  {formatRelativeTime(organization.createdAt)}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Created
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Members Section */}
        <Card style={styles.membersCard}>
          <Card.Title
            title="Members"
            titleVariant="titleMedium"
            right={(props) => (
              canManage ? (
                <Text {...props} variant="labelMedium" style={styles.viewAll}>
                  View All
                </Text>
              ) : null
            )}
          />
          <Card.Content>
            {isLoadingMembers ? (
              <LoadingIndicator message="Loading members..." size="small" />
            ) : members.length === 0 ? (
              <EmptyState
                illustrationType="teams"
                title="No members yet"
                description="Invite members to get started"
              />
            ) : (
              <>
                {members.slice(0, 5).map((member: any, index: number) => (
                  <React.Fragment key={member.id}>
                    {index > 0 && <Divider />}
                    <List.Item
                      title={member.name || member.email}
                      description={member.email}
                      left={(props) => (
                        <Avatar
                          {...props}
                          uri={member.avatarUrl}
                          name={member.name || member.email}
                          size={40}
                        />
                      )}
                      right={(props) => (
                        <Badge
                          {...props}
                          role={member.role as Role}
                          size="small"
                        />
                      )}
                    />
                  </React.Fragment>
                ))}
                {members.length > 5 && (
                  <Text variant="bodySmall" style={styles.moreMembers}>
                    +{members.length - 5} more members
                  </Text>
                )}
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 8,
  },
  name: {
    fontWeight: '600',
  },
  divider: {
    marginVertical: 16,
  },
  description: {
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '700',
  },
  statLabel: {
    opacity: 0.6,
    marginTop: 4,
  },
  membersCard: {
    margin: 16,
    marginTop: 0,
  },
  viewAll: {
    marginRight: 16,
  },
  moreMembers: {
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 8,
  },
});
