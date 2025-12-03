/**
 * Active Organization Hook
 * 
 * Custom hook for managing the active organization context.
 * Handles organization switching with AsyncStorage persistence and query invalidation.
 */

import { useSwitchOrganization } from '@/services/api/organizations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';

const ACTIVE_ORG_KEY = '@streamlined:active_org';

/**
 * Hook for managing active organization context
 */
export const useActiveOrganization = () => {
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const switchOrganizationMutation = useSwitchOrganization();

  // Load active organization from AsyncStorage on mount
  useEffect(() => {
    loadActiveOrganization();
  }, []);

  const loadActiveOrganization = async () => {
    try {
      const storedOrgId = await AsyncStorage.getItem(ACTIVE_ORG_KEY);
      setActiveOrganizationId(storedOrgId);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { context: 'load-active-organization' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Switch to a different organization
   */
  const switchOrganization = async (organizationId: string) => {
    try {
      // Call API to update server-side session
      await switchOrganizationMutation.mutateAsync({ organizationId });

      // Update local state
      setActiveOrganizationId(organizationId);

      // Persist to AsyncStorage
      await AsyncStorage.setItem(ACTIVE_ORG_KEY, organizationId);

      // Haptic feedback for successful switch
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Sentry.addBreadcrumb({
        category: 'organization',
        message: 'Successfully switched active organization',
        level: 'info',
        data: { organizationId },
      });
    } catch (error) {
      // Haptic feedback for failed switch
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      Sentry.captureException(error, {
        tags: { context: 'switch-organization' },
        extra: { organizationId },
      });
      throw error;
    }
  };

  /**
   * Clear active organization (e.g., on logout)
   */
  const clearActiveOrganization = async () => {
    try {
      setActiveOrganizationId(null);
      await AsyncStorage.removeItem(ACTIVE_ORG_KEY);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { context: 'clear-active-organization' },
      });
    }
  };

  return {
    activeOrganizationId,
    isLoading,
    switchOrganization,
    clearActiveOrganization,
    isSwitching: switchOrganizationMutation.isPending,
  };
};
