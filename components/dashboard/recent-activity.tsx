/**
 * Recent Activity Component
 * 
 * Display a list of recent activity/events within the organization.
 * Uses FlatList with pagination for performance.
 */

import { EmptyState } from '@/components/ui/empty-state';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, List, Text, useTheme } from 'react-native-paper';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
  user?: {
    name: string;
    profilePhotoUrl?: string;
  };
}

interface RecentActivityProps {
  /**
   * Array of activity items to display
   */
  activities: ActivityItem[];
  
  /**
   * Whether more activities are being loaded
   */
  isLoading?: boolean;
  
  /**
   * Whether there are more activities to load
   */
  hasMore?: boolean;
  
  /**
   * Callback to load more activities
   */
  onLoadMore?: () => void;
  
  /**
   * Maximum number of items to initially render
   * @default 10
   */
  initialNumToRender?: number;
}

/**
 * Format timestamp relative to now (e.g., "2 hours ago", "Yesterday")
 */
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  initialNumToRender = 10,
}) => {
  const theme = useTheme();

  const renderItem = ({ item }: { item: ActivityItem }) => (
    <List.Item
      title={item.title}
      description={item.description}
      left={(props) => (
        <List.Icon {...props} icon={item.icon || 'information'} />
      )}
      right={() => (
        <Text variant="bodySmall" style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
          {formatTimestamp(item.timestamp)}
        </Text>
      )}
      style={styles.listItem}
    />
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        illustrationType="activity"
        title="No Activity Yet"
        description="Recent activity within your organization will appear here."
      />
    );
  };

  return (
    <FlatList
      data={activities}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      onEndReached={hasMore ? onLoadMore : undefined}
      onEndReachedThreshold={0.5}
      initialNumToRender={initialNumToRender}
      maxToRenderPerBatch={10}
      windowSize={10}
      removeClippedSubviews
      contentContainerStyle={activities.length === 0 ? styles.emptyContainer : undefined}
    />
  );
};

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 8,
  },
  timestamp: {
    alignSelf: 'center',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
  },
});
