/**
 * Organization Card Component
 * 
 * Display card showing organization summary with quick stats.
 * Used in the dashboard when user has one or more organizations.
 */

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { OrganizationWithMember } from '@/types/organization';
import { lightImpact, mediumImpact } from '@/lib/utils/haptics';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

interface OrganizationCardProps {
  /**
   * Organization data with member details
   */
  organization: OrganizationWithMember;
  
  /**
   * Callback when card is pressed
   */
  onPress?: () => void;
  
  /**
   * Callback when card is long pressed
   */
  onLongPress?: () => void;
  
  /**
   * Whether this is the active organization
   */
  isActive?: boolean;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  onPress,
  onLongPress,
  isActive = false,
}) => {
  const theme = useTheme();

  // Debug log what props are received
  React.useEffect(() => {
    console.log('🟡 [OrganizationCard] Rendering with props:', {
      organizationId: organization.id,
      organizationName: organization.name,
      role: organization.role,
      userRole: organization.userRole,
      memberCount: organization.memberCount,
      description: organization.description,
      isActive,
      hasOnPress: !!onPress,
      hasOnLongPress: !!onLongPress,
    });
  }, [organization, isActive, onPress, onLongPress]);

  const handlePress = async () => {
    await lightImpact();
    onPress?.();
  };

  const handleLongPress = async () => {
    await mediumImpact();
    onLongPress?.();
  };

  return (
    <Pressable 
      onPress={handlePress} 
      onLongPress={handleLongPress}
      disabled={!onPress && !onLongPress}
    >
      <Card
        style={[
          styles.card,
          isActive && {
            borderColor: theme.colors.primary,
            borderWidth: 2,
          },
        ]}
        mode="elevated"
      >
        <Card.Content>
          <View style={styles.header}>
            <Avatar
              name={organization.name}
              size={56}
            />
            <View style={styles.headerText}>
              <Text variant="titleMedium" style={styles.organizationName} numberOfLines={1}>
                {organization.name}
              </Text>
              {(organization.role || organization.userRole) && (
                <Badge role={organization.role || (organization.userRole as any)} size="small" />
              )}
            </View>
          </View>

          {organization.description && (
            <Text
              variant="bodyMedium"
              style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={2}
            >
              {organization.description}
            </Text>
          )}

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text variant="titleMedium" style={styles.statValue}>
                {organization.memberCount || 0}
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                Members
              </Text>
            </View>
            <View style={styles.stat}>
              <Text variant="titleMedium" style={styles.statValue}>
                --
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                Properties
              </Text>
            </View>
            <View style={styles.stat}>
              <Text variant="titleMedium" style={styles.statValue}>
                --
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                Units
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  organizationName: {
    fontWeight: '600',
    marginBottom: 6,
  },
  description: {
    marginBottom: 16,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
});
