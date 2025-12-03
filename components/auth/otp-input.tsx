import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput as RNTextInput, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onChangeText?: (otp: string) => void;
  autoFocus?: boolean;
  error?: boolean;
  disabled?: boolean;
}

/**
 * OTP Input Component
 * 
 * 6-digit OTP input with individual boxes
 * Features:
 * - Auto-focus next field on digit entry
 * - Auto-focus previous field on backspace
 * - Paste support for 6-digit codes
 * - Haptic feedback on completion
 * - Error state styling
 */
export function OtpInput({
  length = 6,
  onComplete,
  onChangeText,
  autoFocus = false,
  error = false,
  disabled = false,
}: OtpInputProps) {
  const theme = useTheme();
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<Array<RNTextInput | null>>([]);

  useEffect(() => {
    const otpString = otp.join('');
    onChangeText?.(otpString);

    if (otpString.length === length) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete(otpString);
    }
  }, [otp, length, onComplete, onChangeText]);

  const handleChangeText = (text: string, index: number) => {
    // Handle paste event (multiple digits)
    if (text.length > 1) {
      const digits = text.slice(0, length).split('');
      const newOtp = [...otp];
      
      digits.forEach((digit, i) => {
        if (index + i < length && /^\d$/.test(digit)) {
          newOtp[index + i] = digit;
        }
      });

      setOtp(newOtp);

      // Focus last filled input or last input
      const lastFilledIndex = Math.min(index + digits.length - 1, length - 1);
      inputRefs.current[lastFilledIndex]?.focus();
      
      return;
    }

    // Handle single digit entry
    if (/^\d$/.test(text) || text === '') {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Auto-focus next input
      if (text !== '' && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace to move to previous input
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    // Select all text on focus for easy replacement
    inputRefs.current[index]?.setNativeProps({
      selection: { start: 0, end: 1 },
    });
  };

  const handleBoxPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    inputRefs.current[index]?.focus();
  };

  const getBorderColor = () => {
    if (error) {
      return theme.colors.error;
    }
    return theme.colors.outline;
  };

  return (
    <View style={styles.container}>
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <Pressable
            key={index}
            onPress={() => handleBoxPress(index)}
            style={[
              styles.box,
              {
                borderColor: getBorderColor(),
                backgroundColor: disabled
                  ? theme.colors.surfaceDisabled
                  : theme.colors.surface,
              },
              otp[index] !== '' && styles.boxFilled,
              error && styles.boxError,
            ]}
          >
            <RNTextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.input,
                {
                  color: error ? theme.colors.error : theme.colors.onSurface,
                },
              ]}
              value={otp[index]}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => handleFocus(index)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={autoFocus && index === 0}
              editable={!disabled}
              selectTextOnFocus
              textContentType="oneTimeCode"
            />
          </Pressable>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  box: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxFilled: {
    borderWidth: 2,
  },
  boxError: {
    borderWidth: 2,
  },
  input: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
  },
});
