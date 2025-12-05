/**
 * OrganizationSwitcher Component
 * 
 * Bottom sheet for switching between organizations.
 * Shows all user's organizations with role badges and last active.
 */

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useActiveOrganization } from '@/hooks/use-active-organization';
import { useOrganizations } from '@/hooks/use-organizations';
import { formatRelativeTime } from '@/lib/utils/formatting';
import { lightImpact, mediumImpact } from '@/lib/utils/haptics';
import { Role } from '@/types/organization';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider, Searchbar, Text, useTheme } from 'react-native-paper';

export interface OrganizationSwitcherProps {
  /** Whether the switcher is visible */
  visible: boolean;
  /** Callback when the switcher is dismissed */
  onDismiss: () => void;
}

export const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  visible,
  onDismiss,
}) => {
  const theme = useTheme();
  const { data: organizations = [], isLoading } = useOrganizations();
  const { activeOrganizationId, switchOrganization, isSwitching } = useActiveOrganization();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter organizations based on search query
  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle organization selection
  const handleSelectOrganization = async (organizationId: string) => {
    if (organizationId === activeOrganizationId) {
      // Already active, just close
      lightImpact();
      onDismiss();
      return;
    }

    try {
      await mediumImpact();
      await switchOrganization(organizationId);
      onDismiss();
    } catch (error) {
      console.error('Failed to switch organization:', error);
    }
  };

  // Render organization item
  const renderOrganizationItem = ({ item }: any) => {
    const isActive = item.id === activeOrganizationId;

    return (
      <TouchableOpacity
        onPress={() => handleSelectOrganization(item.id)}
        disabled={isSwitching}
        style={[
          styles.organizationItem,
          isActive && {
            backgroundColor: theme.colors.primaryContainer,
          },
        ]}
      >
        {/* Avatar */}
        <Avatar
          uri={undefined} // No logo yet
          name={item.name}
          size={48}
        />

        {/* Info */}
        <View style={styles.organizationInfo}>
          <View style={styles.organizationHeader}>
            <Text
              variant="titleMedium"
              style={[
                styles.organizationName,
                isActive && { fontWeight: 'bold' },
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {isActive && (
              <Text
                variant="labelSmall"
                style={[
                  styles.activeLabel,
                  { color: theme.colors.primary },
                ]}
              >
                Active
              </Text>
            )}
          </View>

          <View style={styles.organizationMeta}>
            <Badge role={item.userRole as Role} size="small" />
            {item.joinedAt && (
              <>
                <Text variant="bodySmall" style={styles.dot}>
                  •
                </Text>
                <Text variant="bodySmall" style={styles.joinedAt}>
                  Joined {formatRelativeTime(item.joinedAt)}
                </Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet visible={visible} onDismiss={onDismiss} maxHeight={0.85}>
      <View style={styles.container}>
        {/* Header */}
        <Text variant="headlineSmall" style={styles.title}>
          Switch Organization
        </Text>

        {/* Search (only if more than 10 orgs) */}
        {organizations.length > 10 && (
          <Searchbar
            placeholder="Search organizations"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
        )}

        {/* Content */}
        {isLoading ? (
          <LoadingIndicator message="Loading organizations..." />
        ) : filteredOrganizations.length === 0 ? (
          searchQuery ? (
            <EmptyState
              illustrationType="search"
              title="No results"
              description={`No organizations match "${searchQuery}"`}
            />
          ) : (
            <EmptyState
              illustrationType="organizations"
              title="No organizations"
              description="You're not a member of any organizations yet"
            />
          )
        ) : (
          <FlatList
            data={filteredOrganizations}
            renderItem={renderOrganizationItem}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <Divider style={styles.divider} />}
            contentContainerStyle={styles.listContent}
            // Performance optimizations
            windowSize={10}
            maxToRenderPerBatch={10}
            removeClippedSubviews
            initialNumToRender={15}
          />
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchbar: {
    marginBottom: 16,
  },
  listContent: {
    flexGrow: 1,
  },
  organizationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 12,
  },
  organizationInfo: {
    flex: 1,
    gap: 4,
  },
  organizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  organizationName: {
    flex: 1,
  },
  activeLabel: {
    fontWeight: '600',
  },
  organizationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    opacity: 0.5,
  },
  joinedAt: {
    opacity: 0.6,
  },
  divider: {
    marginVertical: 4,
  },
});
