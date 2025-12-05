/**
 * Offline Status Hook
 * 
 * Monitors network connectivity using NetInfo.
 * Provides current connection status and type.
 */

import { logToReactotron } from '@/services/monitoring/reactotron';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import * as Sentry from '@sentry/react-native';
import { useEffect, useState } from 'react';

export interface OfflineStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isOffline: boolean;
}

/**
 * Hook for monitoring network connectivity
 * 
 * @example
 * ```tsx
 * const { isOffline, isConnected, type } = useOfflineStatus();
 * 
 * if (isOffline) {
 *   return <OfflineBanner />;
 * }
 * ```
 */
export function useOfflineStatus(): OfflineStatus {
  const [status, setStatus] = useState<OfflineStatus>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
    isOffline: false,
  });

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then((state) => {
      updateStatus(state);
    });

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      updateStatus(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateStatus = (state: NetInfoState) => {
    const isConnected = state.isConnected ?? false;
    const isInternetReachable = state.isInternetReachable ?? null;
    const type = state.type;
    const isOffline = !isConnected || isInternetReachable === false;

    setStatus({
      isConnected,
      isInternetReachable,
      type,
      isOffline,
    });

    // Log network status changes
    logToReactotron('Network status changed', {
      isConnected,
      isInternetReachable,
      type,
      isOffline,
    });

    // Track in Sentry for offline usage patterns
    Sentry.addBreadcrumb({
      category: 'network',
      message: isOffline ? 'Device went offline' : 'Device came online',
      level: isOffline ? 'warning' : 'info',
      data: {
        type,
        isInternetReachable,
      },
    });

    // Set Sentry tag for offline context
    Sentry.setTag('network_status', isOffline ? 'offline' : 'online');
  };

  return status;
}
