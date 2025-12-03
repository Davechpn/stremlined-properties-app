/**
 * TextInput Component
 * 
 * Wrapper around React Native Paper TextInput with validation states
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText, TextInput as PaperTextInput, TextInputProps as PaperTextInputProps } from 'react-native-paper';

export interface TextInputProps extends Omit<PaperTextInputProps, 'error'> {
  /** Error message to display */
  error?: string;
  /** Helper text to display when no error */
  helperText?: string;
  /** Show character count */
  showCharacterCount?: boolean;
  /** Maximum character length */
  maxLength?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
  error,
  helperText,
  showCharacterCount = false,
  maxLength,
  value,
  secureTextEntry,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const hasError = Boolean(error);
  const isPassword = secureTextEntry;

  const characterCount = value?.toString().length || 0;
  const displayHelperText = error || helperText || (showCharacterCount && maxLength ? `${characterCount}/${maxLength}` : '');

  return (
    <View style={styles.container}>
      <PaperTextInput
        value={value}
        error={hasError}
        secureTextEntry={isPassword && !isPasswordVisible}
        maxLength={maxLength}
        right={
          isPassword ? (
            <PaperTextInput.Icon
              icon={isPasswordVisible ? 'eye-off' : 'eye'}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            />
          ) : undefined
        }
        {...props}
      />
      {displayHelperText ? (
        <HelperText type={hasError ? 'error' : 'info'} visible={Boolean(displayHelperText)}>
          {displayHelperText}
        </HelperText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
});
