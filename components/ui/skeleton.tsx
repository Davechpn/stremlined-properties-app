/**
 * Skeleton Loading Component
 * 
 * Provides placeholder loading states with shimmer animation
 * for various UI elements during data fetching.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Base skeleton component with shimmer animation
 */
export function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const theme = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    // Shimmer animation
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.ease,
      }),
      -1, // Infinite repeat
      true // Reverse
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const baseStyle: ViewStyle = {
    width: width as any,
    height: height as any,
    borderRadius,
    backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
  };

  return (
    <Animated.View
      style={[
        baseStyle,
        animatedStyle,
        style,
      ]}
    />
  );
}

/**
 * Skeleton for text lines
 */
interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  spacing?: number;
  lastLineWidth?: string;
}

export function SkeletonText({ 
  lines = 3, 
  lineHeight = 16, 
  spacing = 8,
  lastLineWidth = '60%',
}: SkeletonTextProps) {
  return (
    <View>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          style={{ marginBottom: index < lines - 1 ? spacing : 0 }}
        />
      ))}
    </View>
  );
}

/**
 * Skeleton for circular avatar
 */
interface SkeletonAvatarProps {
  size?: number;
}

export function SkeletonAvatar({ size = 40 }: SkeletonAvatarProps) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}

/**
 * Skeleton for card component
 */
interface SkeletonCardProps {
  hasAvatar?: boolean;
  lines?: number;
}

export function SkeletonCard({ hasAvatar = false, lines = 3 }: SkeletonCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        {hasAvatar && <SkeletonAvatar size={48} />}
        <View style={[styles.cardHeaderText, !hasAvatar && styles.cardHeaderTextFull]}>
          <Skeleton height={20} width="70%" style={{ marginBottom: 8 }} />
          <Skeleton height={14} width="50%" />
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <SkeletonText lines={lines} lineHeight={14} spacing={6} />
      </View>
    </View>
  );
}

/**
 * Skeleton for dashboard header
 */
export function SkeletonDashboardHeader() {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.outline,
        },
      ]}
    >
      <View style={styles.headerContent}>
        <SkeletonAvatar size={40} />
        <View style={styles.headerText}>
          <Skeleton height={18} width={120} style={{ marginBottom: 6 }} />
          <Skeleton height={14} width={180} />
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton for organization card
 */
export function SkeletonOrganizationCard() {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.orgCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <View style={styles.orgCardHeader}>
        <Skeleton height={24} width="60%" style={{ marginBottom: 8 }} />
        <Skeleton height={16} width={80} borderRadius={12} />
      </View>
      
      <Skeleton height={14} width="80%" style={{ marginBottom: 16 }} />
      
      <View style={styles.orgCardStats}>
        <View style={styles.orgCardStat}>
          <Skeleton height={28} width={40} style={{ marginBottom: 4 }} />
          <Skeleton height={12} width={60} />
        </View>
        <View style={styles.orgCardStat}>
          <Skeleton height={28} width={40} style={{ marginBottom: 4 }} />
          <Skeleton height={12} width={70} />
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton for quick actions
 */
export function SkeletonQuickActions() {
  return (
    <View style={styles.quickActions}>
      <View style={styles.quickActionsRow}>
        <Skeleton height={40} width="48%" borderRadius={20} />
        <Skeleton height={40} width="48%" borderRadius={20} />
      </View>
      <View style={styles.quickActionsRow}>
        <Skeleton height={40} width="48%" borderRadius={20} />
        <Skeleton height={40} width="48%" borderRadius={20} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Card styles
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  cardHeaderTextFull: {
    marginLeft: 0,
  },
  cardContent: {
    marginTop: 8,
  },

  // Header styles
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },

  // Organization card styles
  orgCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  orgCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orgCardStats: {
    flexDirection: 'row',
    gap: 24,
  },
  orgCardStat: {
    alignItems: 'flex-start',
  },

  // Quick actions styles
  quickActions: {
    padding: 16,
    gap: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
