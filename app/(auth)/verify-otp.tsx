import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';

import { OtpInput } from '@/components/auth/otp-input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { resendOTP, verifyOTP } from '@/services/auth/phone-auth';
import { logAuthFlowToReactotron } from '@/services/monitoring/reactotron';

export default function VerifyOTPScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const resendTimer = setTimeout(() => {
      setCanResend(true);
    }, 60000); // 60 seconds

    return () => {
      clearInterval(timer);
      clearTimeout(resendTimer);
    };
  }, []);

  const handleComplete = async (code: string) => {
    if (!params.phone) {
      setError('Phone number is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await verifyOTP({ phone: params.phone, code });

      logAuthFlowToReactotron('OTP verified successfully', {});

      router.replace('/(app)/dashboard' as any);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP code');
      logAuthFlowToReactotron('OTP verification failed', {});
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!params.phone || !canResend) return;

    try {
      setLoading(true);
      await resendOTP({ phone: params.phone, countryCode: '+1' });
      setCanResend(false);
      setCountdown(600);
      setTimeout(() => setCanResend(true), 60000);
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Verify Phone Number
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Enter the 6-digit code sent to {params.phone}
        </Text>

        <Card animated style={styles.card}>
          <OtpInput
            length={6}
            onComplete={handleComplete}
            onChangeText={setOtp}
            autoFocus
            error={!!error}
            disabled={loading}
          />

          {error && (
            <Text variant="bodySmall" style={[styles.error, { color: theme.colors.error }]}>
              {error}
            </Text>
          )}

          <Text variant="bodySmall" style={[styles.countdown, { color: theme.colors.onSurfaceVariant }]}>
            Code expires in {formatTime(countdown)}
          </Text>

          <Button
            mode="text"
            onPress={handleResend}
            disabled={!canResend || loading}
            style={styles.resendButton}
          >
            {canResend ? 'Resend Code' : 'Resend in 60s'}
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
  error: {
    marginTop: 16,
    textAlign: 'center',
  },
  countdown: {
    marginTop: 16,
    textAlign: 'center',
  },
  resendButton: {
    marginTop: 8,
  },
});
