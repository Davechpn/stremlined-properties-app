import { IconSymbol } from '@/components/ui/icon-symbol';
import { errorFeedback, successFeedback } from '@/lib/utils/haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AuthForm } from '@/components/auth/auth-form';
import { OAuthButton } from '@/components/auth/oauth-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getAuthErrorMessage, isAuthError } from '@/lib/utils/error-handling';
import { clearSession } from '@/services/auth/session-manager';
import { logAuthFlowToReactotron } from '@/services/monitoring/reactotron';
import type { AuthCredentials } from '@/types/auth';

/**
 * Sign In Screen
 * 
 * User authentication with email/password as primary method.
 * Includes "Remember Me" toggle and "Forgot Password" link.
 */
export default function SignInScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signIn, signInMutation } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (formData: any) => {
    setIsSubmitting(true);
    try {
      setError(null);
      
      const data: AuthCredentials = {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      };

      logAuthFlowToReactotron('Sign in attempt', {
        email: data.email,
        rememberMe: data.rememberMe,
      });

      await signIn(data);

      await successFeedback();

      logAuthFlowToReactotron('Sign in successful', { email: data.email });

      // Navigate to dashboard
      router.replace('/(tabs)');
    } catch (err: any) {
      // Use error handling utility for better error messages
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);

      await errorFeedback();

      logAuthFlowToReactotron('Sign in failed', {
        error: errorMessage,
        statusCode: err.response?.status,
        isAuthError: isAuthError(err),
      });

      // Clear any stale tokens on auth error
      if (isAuthError(err)) {
        await clearSession();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleOAuth = async () => {
    logAuthFlowToReactotron('Google OAuth selected', {});
    // TODO: Implement Google OAuth flow
  };

  const handlePhoneAuth = () => {
    logAuthFlowToReactotron('Phone auth selected', {});
    router.push('/(auth)/verify-otp' as any);
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password' as any);
  };

  const handleSignUp = () => {
    router.push('/(auth)/sign-up' as any);
  };

  const handleClearStorage = async () => {
    try {
      await clearSession();
      await successFeedback();
      logAuthFlowToReactotron('Storage cleared manually', {});
      setError('Storage cleared! You can now sign in.');
    } catch (err) {
      await errorFeedback();
      setError('Failed to clear storage');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Welcome Back OP
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Sign in to access your organization and profile
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(200)}>
        <Card animated animationDelay={300}>
          <AuthForm
            mode="signin"
            onSubmit={handleSignIn}
            isLoading={isSubmitting}
            showRememberMe
          />

          {error && (
            <Card
              style={[styles.errorCard, { backgroundColor: theme.colors.errorContainer }]}
            >
              <View style={styles.errorContent}>
                <IconSymbol
                  size={20}
                  name="exclamationmark.triangle.fill"
                  color={theme.colors.error}
                />
                <Text variant="bodyMedium" style={[styles.errorText, { color: theme.colors.error }]}>
                  {error}
                </Text>
              </View>
            </Card>
          )}

          <Button
            mode="text"
            onPress={handleForgotPassword}
            style={styles.forgotPassword}
          >
            Forgot Password?
          </Button>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.dividerContainer}>
        <Divider />
        <Text variant="bodySmall" style={[styles.dividerText, { color: theme.colors.onSurfaceVariant }]}>
          or continue with
        </Text>
        <Divider />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(500)} style={styles.alternativeAuth}>
        <OAuthButton
          provider="google"
          onPress={handleGoogleOAuth}
          loading={false}
          mode="outlined"
        />

        <Button
          mode="outlined"
          onPress={handlePhoneAuth}
          icon="phone"
          style={styles.phoneButton}
        >
          Phone Number
        </Button>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(600)} style={styles.footer}>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Don't have an account?{' '}
          <Text
            variant="bodyMedium"
            style={[styles.link, { color: theme.colors.primary }]}
            onPress={handleSignUp}
          >
            Sign Up
          </Text>
        </Text>
        
        {__DEV__ && (
          <Button
            mode="outlined"
            onPress={handleClearStorage}
            style={styles.devButton}
            textColor={theme.colors.error}
          >
            🔧 Clear Storage (Dev Only)
          </Button>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 22,
  },
  errorCard: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  errorText: {
    flex: 1,
    textAlign: 'left',
    fontWeight: '500',
  },
  forgotPassword: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 16,
  },
  dividerText: {
    paddingHorizontal: 8,
  },
  alternativeAuth: {
    gap: 12,
  },
  phoneButton: {
    borderRadius: 8,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  link: {
    fontWeight: '600',
  },
  devButton: {
    marginTop: 16,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
});
