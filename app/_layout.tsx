import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { paperDarkTheme, paperLightTheme } from '@/constants/paper-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { asyncStoragePersister, queryClient } from '@/services/api/query-client';
import { initializeReactotron, logAuthFlowToReactotron } from '@/services/monitoring/reactotron';
import { initializeSentry } from '@/services/monitoring/sentry';
import { StyleSheet } from 'react-native';

// Suppress non-fatal "Unable to activate keep awake" error in Android emulators
// This is a known issue with expo-keep-awake in Expo Go on certain emulators
// The error doesn't affect app functionality
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Unable to activate keep awake')
    ) {
      // Suppress this specific error
      return;
    }
    originalConsoleError(...args);
  };
}

export const unstable_settings = {
  anchor: '(tabs)',
};

// Wrap root component with Sentry error boundary
function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Initialize monitoring services
  useEffect(() => {
    initializeSentry();
    initializeReactotron();
  }, []);

  // Handle deep links
  useEffect(() => {
    // Handle initial URL when app opens from closed state
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle URLs when app is already open (background or foreground)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    try {
      const { hostname, path, queryParams } = Linking.parse(url);

      logAuthFlowToReactotron('Deep link received', {
        url,
        hostname,
        path,
        queryParams,
      });

      // Password reset: streamlinedproperties://reset-password?token=abc123
      if (hostname === 'reset-password' || path === '/reset-password') {
        const token = queryParams?.token as string;
        if (token) {
          logAuthFlowToReactotron('Password reset deep link', { token: token.substring(0, 10) + '...' });
          router.push(`/(auth)/reset-password?token=${token}` as any);
        }
      }

      // Invitation: streamlinedproperties://invitation?token=xyz789
      // or streamlinedproperties://invitations/xyz789
      if (hostname === 'invitation' || path?.startsWith('/invitation')) {
        const token = (queryParams?.token as string) || path?.split('/').pop();
        if (token) {
          logAuthFlowToReactotron('Invitation deep link', { token: token.substring(0, 10) + '...' });
          // Navigate to invitation acceptance screen
          router.push(`/invitations/${token}` as any);
        }
      }

      Sentry.addBreadcrumb({
        category: 'deep-link',
        message: 'Deep link handled',
        data: { url, hostname, path },
        level: 'info',
      });
    } catch (error) {
      logAuthFlowToReactotron('Deep link error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        url,
      });

      Sentry.captureException(error, {
        tags: { feature: 'deep-linking' },
        extra: { url },
      });
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <PaperProvider theme={colorScheme === 'dark' ? paperDarkTheme : paperLightTheme}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(welcome)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </PaperProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}

// Export root component with Sentry monitoring
export default Sentry.wrap(RootLayout);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
