/**
 * Welcome Layout
 * 
 * Stack navigation for welcome screens with hidden header
 */

import * as Sentry from '@sentry/react-native';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function WelcomeLayout() {
  useEffect(() => {
    // Add breadcrumb for welcome flow navigation
    Sentry.addBreadcrumb({
      type: 'navigation',
      category: 'welcome',
      message: 'Entered welcome flow',
      level: 'info',
    });
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="get-started" />
    </Stack>
  );
}
