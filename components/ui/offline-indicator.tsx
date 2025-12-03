/**
 * Offline Indicator Component
 * 
 * Displays a banner at the top of the screen when device is offline.
 * Shows connection type and internet reachability status.
 */

import { useOfflineStatus } from '@/hooks/use-offline-status';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Banner, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Offline indicator banner
 * 
 * Automatically shown when device goes offline.
 * Hides when connection is restored.
 */
export const OfflineIndicator: React.FC = () => {
  const { isOffline, type } = useOfflineStatus();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (!isOffline) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Banner
        visible={isOffline}
        icon="wifi-off"
        style={[
          styles.banner,
          { backgroundColor: theme.colors.errorContainer },
        ]}
      >
        <View style={styles.content}>
          <Text
            variant="titleSmall"
            style={{ color: theme.colors.onErrorContainer }}
          >
            No Internet Connection
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onErrorContainer, opacity: 0.8 }}
          >
            {type === 'none'
              ? 'Please check your connection'
              : 'Limited connectivity detected'}
          </Text>
        </View>
      </Banner>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,
  },
  banner: {
    elevation: 4,
  },
  content: {
    gap: 4,
  },
});
