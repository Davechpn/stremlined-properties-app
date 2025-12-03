import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

interface OAuthButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  mode?: 'contained' | 'outlined';
}

/**
 * OAuth Button Component
 * 
 * Reusable button for OAuth providers (Google, Apple)
 * with brand-appropriate styling and haptic feedback
 */
export function OAuthButton({
  provider,
  onPress,
  loading = false,
  disabled = false,
  mode = 'outlined',
}: OAuthButtonProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getProviderConfig = () => {
    switch (provider) {
      case 'google':
        return {
          label: 'Continue with Google',
          icon: 'google',
          // Google brand colors
          buttonColor: mode === 'contained' ? '#4285F4' : undefined,
          textColor: mode === 'contained' ? '#FFFFFF' : '#4285F4',
        };
      case 'apple':
        return {
          label: 'Continue with Apple',
          icon: 'apple',
          // Apple brand colors
          buttonColor: mode === 'contained' ? '#000000' : undefined,
          textColor: mode === 'contained' ? '#FFFFFF' : '#000000',
        };
    }
  };

  const config = getProviderConfig();

  return (
    <View style={styles.container}>
      <Button
        mode={mode}
        onPress={handlePress}
        loading={loading}
        disabled={disabled || loading}
        icon={config.icon}
        buttonColor={config.buttonColor}
        textColor={config.textColor}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {config.label}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
