import { successFeedback, errorFeedback } from '@/lib/utils/haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextInput } from '@/components/ui/text-input';
import { useAuth } from '@/hooks/use-auth';
import { validateEmail } from '@/lib/utils/validation';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword({ email });
      setSuccess(true);
      await successFeedback();
    } catch (err) {
      await errorFeedback();
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Check Your Email
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            We've sent a password reset link to {email}
          </Text>
          <Button mode="contained" onPress={() => router.back()} style={styles.button}>
            Back to Sign In
          </Button>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Forgot Password?
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Enter your email address and we'll send you a link to reset your password
        </Text>

        <Card animated style={styles.card}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={emailError}
            helperText={emailError}
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !email}
            style={styles.button}
          >
            Send Reset Link
          </Button>
        </Card>
      </Animated.View>
    </View>
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
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 22,
    marginBottom: 32,
  },
  card: {
    padding: 24,
  },
  button: {
    marginTop: 16,
  },
});
