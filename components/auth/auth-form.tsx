/**
 * AuthForm Component
 * 
 * Reusable email/password form with real-time validation
 */

import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { validateEmail, validatePassword } from '@/lib/utils/validation';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export interface AuthFormProps {
  /** Form mode */
  mode: 'signin' | 'signup';
  /** Form submission callback */
  onSubmit: (data: AuthFormData) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Show name field (for signup) */
  showNameField?: boolean;
  /** Show remember me toggle */
  showRememberMe?: boolean;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
  rememberMe?: boolean;
  // Optional organization fields
  organizationName?: string;
  organizationDescription?: string;
  website?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onSubmit,
  isLoading = false,
  showNameField = mode === 'signup',
  showRememberMe = mode === 'signin',
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Optional organization fields
  const [organizationName, setOrganizationName] = useState('');
  const [organizationDescription, setOrganizationDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Real-time validation
  useEffect(() => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  }, [email]);

  useEffect(() => {
    if (password && mode === 'signup') {
      const validation = validatePassword(password);
      if (!validation.valid) {
        setPasswordError(validation.errors[0] || 'Password does not meet requirements');
      } else {
        setPasswordError('');
      }
    }
  }, [password, mode]);

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  }, [password, confirmPassword]);

  const handleSubmit = () => {
    // Final validation
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (mode === 'signup') {
      const validation = validatePassword(password);
      if (!validation.valid) {
        setPasswordError(validation.errors[0] || 'Password does not meet requirements');
        return;
      }

      if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
        return;
      }
    }

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    // Submit form
    onSubmit({
      email,
      password,
      ...(showNameField && { name }),
      ...(mode === 'signup' && { confirmPassword }),
      ...(showRememberMe && { rememberMe }),
      // Include organization fields for signup
      ...(mode === 'signup' && {
        organizationName,
        organizationDescription,
        website,
        phoneNumber,
        address,
        city,
        state,
        country,
      }),
    });
  };

  return (
    <View style={styles.container}>
      {showNameField && (
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setNameError('');
          }}
          error={nameError}
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="next"
          disabled={isLoading}
        />
      )}

      <TextInput
        label="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailError('');
        }}
        error={emailError}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        returnKeyType="next"
        disabled={isLoading}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setPasswordError('');
        }}
        error={passwordError}
        secureTextEntry
        autoCapitalize="none"
        autoComplete={mode === 'signup' ? 'password-new' : 'password'}
        returnKeyType={mode === 'signup' ? 'next' : 'done'}
        disabled={isLoading}
      />

      {mode === 'signup' && (
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setConfirmPasswordError('');
          }}
          error={confirmPasswordError}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
          returnKeyType="next"
          disabled={isLoading}
        />
      )}

      {mode === 'signup' && (
        <>
          <TextInput
            label="Organization Name (Optional)"
            value={organizationName}
            onChangeText={setOrganizationName}
            autoCapitalize="words"
            returnKeyType="next"
            disabled={isLoading}
          />

          <TextInput
            label="Organization Description (Optional)"
            value={organizationDescription}
            onChangeText={setOrganizationDescription}
            autoCapitalize="sentences"
            returnKeyType="next"
            multiline
            numberOfLines={2}
            disabled={isLoading}
          />

          <TextInput
            label="Website (Optional)"
            value={website}
            onChangeText={setWebsite}
            keyboardType="url"
            autoCapitalize="none"
            autoComplete="off"
            returnKeyType="next"
            disabled={isLoading}
          />

          <TextInput
            label="Phone Number (Optional)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoComplete="tel"
            returnKeyType="next"
            disabled={isLoading}
          />

          <TextInput
            label="Address (Optional)"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="words"
            autoComplete="street-address"
            returnKeyType="next"
            disabled={isLoading}
          />

          <TextInput
            label="City (Optional)"
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
            autoComplete="off"
            returnKeyType="next"
            disabled={isLoading}
          />

          <TextInput
            label="State/Province (Optional)"
            value={state}
            onChangeText={setState}
            autoCapitalize="words"
            autoComplete="off"
            returnKeyType="next"
            disabled={isLoading}
          />

          <TextInput
            label="Country (Optional)"
            value={country}
            onChangeText={setCountry}
            autoCapitalize="words"
            autoComplete="country"
            returnKeyType="done"
            disabled={isLoading}
          />
        </>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.submitButton}
      >
        {mode === 'signup' ? 'Create Account' : 'Sign In'}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  submitButton: {
    marginTop: 16,
  },
});
