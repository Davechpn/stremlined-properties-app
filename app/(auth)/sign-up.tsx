import { IconSymbol } from '@/components/ui/icon-symbol';
import { errorFeedback, successFeedback } from '@/lib/utils/haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { MultiStepSignUpForm } from '@/components/auth/multi-step-signup-form';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getAuthErrorMessage } from '@/lib/utils/error-handling';
import { logAuthFlowToReactotron } from '@/services/monitoring/reactotron';
import type { SignUpCredentials } from '@/types/auth';

/**
 * Sign Up Screen
 * 
 * Beautiful multi-step user registration flow.
 */
export default function SignUpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signUp, signUpMutation } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async (formData: any) => {
    setIsSubmitting(true);
    try {
      setError(null);
      
      // Validate and transform form data
      const data: SignUpCredentials = {
        name: formData.name || '',
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword || formData.password,
        rememberMe: formData.rememberMe,
        // Optional organization and contact fields
        organizationName: formData.organizationName,
        organizationDescription: formData.organizationDescription,
        website: formData.website,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
      };

      logAuthFlowToReactotron('Sign up attempt', {
        email: data.email,
        name: data.name,
        rememberMe: data.rememberMe,
      });

      await signUp(data);

      await successFeedback();

      logAuthFlowToReactotron('Sign up successful', { email: data.email });

      // Navigate to dashboard
      router.replace('/(tabs)');
    } catch (err: any) {
      // Use error handling utility for better error messages
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);

      await errorFeedback();

      logAuthFlowToReactotron('Sign up failed', {
        error: errorMessage,
        statusCode: err.response?.status,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = () => {
    router.push('/(auth)/sign-in' as any);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
        <Text variant="displaySmall" style={styles.title}>
          Join Us
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Create your account in just a few steps
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.formContainer}>
        <Card animated animationDelay={300} style={styles.card}>
          <MultiStepSignUpForm
            onSubmit={handleSignUp}
            isLoading={isSubmitting}
          />

          {error && (
            <Animated.View entering={FadeIn} style={[styles.errorCard, { backgroundColor: theme.colors.errorContainer }]}>
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
            </Animated.View>
          )}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.footer}>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Already have an account?{' '}
          <Text
            variant="bodyMedium"
            style={[styles.link, { color: theme.colors.primary }]}
            onPress={handleSignIn}
          >
            Sign In
          </Text>
        </Text>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    lineHeight: 24,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 32,
  },
  card: {
    padding: 24,
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
  footer: {
    alignItems: 'center',
  },
  link: {
    fontWeight: '700',
  },
});
