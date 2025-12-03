/**
 * App Entry Point
 * 
 * Checks authentication status and redirects to appropriate screen:
 * - If authenticated: redirect to dashboard
 * - If not authenticated: redirect to welcome/onboarding
 */

import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { HAS_SEEN_ONBOARDING_KEY } from '@/constants/auth';
import { getItem } from '@/services/storage/async-storage';
import { getToken } from '@/services/storage/secure-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    
    // Re-check auth status periodically (every 2 seconds)
    const interval = setInterval(() => {
      checkAuthStatus();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check for authentication token
      const token = await getToken();
      setIsAuthenticated(!!token);

      // Check if user has seen onboarding
      const seenOnboarding = await getItem<boolean>(HAS_SEEN_ONBOARDING_KEY);
      setHasSeenOnboarding(!!seenOnboarding);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setHasSeenOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingIndicator message="Loading..." />
      </View>
    );
  }

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // Show welcome flow for first-time users
  if (!hasSeenOnboarding) {
    return <Redirect href={'/(welcome)' as any} />;
  }

  // For returning unauthenticated users, go to sign-in
  return <Redirect href="/(auth)/sign-in" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
