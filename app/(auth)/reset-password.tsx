import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextInput } from '@/components/ui/text-input';
import { useAuth } from '@/hooks/use-auth';
import { validatePassword } from '@/lib/utils/validation';

export default function ResetPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const { resetPassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!validatePassword(newPassword)) {
      setPasswordError('Password must be at least 8 characters with uppercase, lowercase, digit, and special character');
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match');
      return;
    }

    if (!params.token) {
      alert('Invalid reset token');
      return;
    }

    try {
      setLoading(true);
      await resetPassword({
        token: params.token,
        newPassword,
        confirmPassword,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Auto sign-in happens in useResetPassword hook
      router.replace('/(app)/dashboard' as any);
    } catch (err) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Reset Password
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Enter your new password below
        </Text>

        <Card animated style={styles.card}>
          <TextInput
            label="New Password"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              setPasswordError('');
            }}
            secureTextEntry
            autoCapitalize="none"
            error={passwordError}
            helperText={passwordError}
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setConfirmError('');
            }}
            secureTextEntry
            autoCapitalize="none"
            error={confirmError}
            helperText={confirmError}
            style={styles.confirmInput}
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !newPassword || !confirmPassword}
            style={styles.button}
          >
            Reset Password
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
  confirmInput: {
    marginTop: 16,
  },
  button: {
    marginTop: 24,
  },
});
