import { logNavigationEvent } from '@/services/monitoring/sentry';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

/**
 * Auth Layout
 * 
 * Stack navigation for authentication screens with:
 * - Minimal header (back button only)
 * - Keyboard avoiding view for form inputs
 * - Sentry navigation breadcrumbs
 */
export default function AuthLayout() {
  useEffect(() => {
    logNavigationEvent('Auth Flow');
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerShadowVisible: false,
          headerTitle: '',
          headerBackTitle: 'Back',
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: true,
            title: '',
          }}
        />
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: true,
            title: '',
          }}
        />
        <Stack.Screen
          name="verify-otp"
          options={{
            headerShown: true,
            title: '',
          }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{
            headerShown: true,
            title: '',
          }}
        />
        <Stack.Screen
          name="reset-password"
          options={{
            headerShown: true,
            title: '',
          }}
        />
      </Stack>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
