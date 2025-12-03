/**
 * Multi-Step Sign Up Form Component
 * 
 * Beautiful multi-step registration flow with progress tracking
 */

import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TextInput } from '@/components/ui/text-input';
import { validateEmail, validatePassword } from '@/lib/utils/validation';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProgressBar, Text, useTheme } from 'react-native-paper';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export interface SignUpFormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
  organizationName?: string;
  organizationDescription?: string;
  website?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface MultiStepSignUpFormProps {
  onSubmit: (data: SignUpFormData) => void;
  isLoading?: boolean;
}

type Step = 1 | 2 | 3;

export const MultiStepSignUpForm: React.FC<MultiStepSignUpFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1: Account Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Organization Info
  const [organizationName, setOrganizationName] = useState('');
  const [organizationDescription, setOrganizationDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Step 3: Location Info
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');

  // Errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const totalSteps = 3;
  const progress = currentStep / totalSteps;

  const stepTitles = {
    1: 'Account Details',
    2: 'Organization Info',
    3: 'Location Details',
  };

  const stepDescriptions = {
    1: 'Create your account credentials',
    2: 'Tell us about your organization (optional)',
    3: 'Add location details (optional)',
  };

  const validateStep1 = (): boolean => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.errors[0] || 'Password does not meet requirements');
      return false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }

    onSubmit({
      name,
      email,
      password,
      confirmPassword,
      organizationName,
      organizationDescription,
      website,
      phoneNumber,
      address,
      city,
      state,
      country,
    });
  };

  const renderStep1 = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stepContainer}>
      <TextInput
        label="Full Name (Optional)"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoComplete="name"
        returnKeyType="next"
        disabled={isLoading}
        style={styles.input}
      />

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
        style={styles.input}
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
        autoComplete="password-new"
        returnKeyType="next"
        disabled={isLoading}
        style={styles.input}
      />

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
        returnKeyType="done"
        disabled={isLoading}
        style={styles.input}
      />

      <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        Password must be at least 8 characters with uppercase, lowercase, and numbers
      </Text>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stepContainer}>
      <TextInput
        label="Organization Name"
        value={organizationName}
        onChangeText={setOrganizationName}
        autoCapitalize="words"
        returnKeyType="next"
        disabled={isLoading}
        style={styles.input}
      />

      <TextInput
        label="Organization Description"
        value={organizationDescription}
        onChangeText={setOrganizationDescription}
        autoCapitalize="sentences"
        returnKeyType="next"
        multiline
        numberOfLines={3}
        disabled={isLoading}
        style={styles.input}
      />

      <TextInput
        label="Website"
        value={website}
        onChangeText={setWebsite}
        keyboardType="url"
        autoCapitalize="none"
        autoComplete="off"
        returnKeyType="next"
        disabled={isLoading}
        style={styles.input}
      />

      <TextInput
        label="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        autoComplete="tel"
        returnKeyType="done"
        disabled={isLoading}
        style={styles.input}
      />

      <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        These details are optional and can be updated later
      </Text>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stepContainer}>
      <TextInput
        label="Address"
        value={address}
        onChangeText={setAddress}
        autoCapitalize="words"
        autoComplete="street-address"
        returnKeyType="next"
        disabled={isLoading}
        style={styles.input}
      />

      <TextInput
        label="City"
        value={city}
        onChangeText={setCity}
        autoCapitalize="words"
        autoComplete="off"
        returnKeyType="next"
        disabled={isLoading}
        style={styles.input}
      />

      <TextInput
        label="State/Province"
        value={state}
        onChangeText={setState}
        autoCapitalize="words"
        autoComplete="off"
        returnKeyType="next"
        disabled={isLoading}
        style={styles.input}
      />

      <TextInput
        label="Country"
        value={country}
        onChangeText={setCountry}
        autoCapitalize="words"
        autoComplete="country"
        returnKeyType="done"
        disabled={isLoading}
        style={styles.input}
      />

      <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        Location details help us provide better local services
      </Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
            Step {currentStep} of {totalSteps}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {Math.round(progress * 100)}% Complete
          </Text>
        </View>
        <ProgressBar
          progress={progress}
          color={theme.colors.primary}
          style={styles.progressBar}
        />
      </View>

      {/* Step Header */}
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <View style={[styles.stepIcon, { backgroundColor: theme.colors.primaryContainer }]}>
            <IconSymbol
              name={currentStep === 1 ? 'person.fill' : currentStep === 2 ? 'building.2.fill' : 'location.fill'}
              size={24}
              color={theme.colors.primary}
            />
          </View>
        </View>
        <Text variant="titleLarge" style={styles.stepTitle}>
          {stepTitles[currentStep]}
        </Text>
        <Text variant="bodyMedium" style={[styles.stepDescription, { color: theme.colors.onSurfaceVariant }]}>
          {stepDescriptions[currentStep]}
        </Text>
      </View>

      {/* Step Content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <Button
            mode="outlined"
            onPress={handleBack}
            disabled={isLoading}
            style={styles.backButton}
          >
            Back
          </Button>
        )}
        
        {currentStep < 3 ? (
          <Button
            mode="contained"
            onPress={handleNext}
            disabled={isLoading}
            style={styles.nextButton}
          >
            Continue
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.nextButton}
          >
            Create Account
          </Button>
        )}
      </View>

      {/* Skip Option for Steps 2 & 3 */}
      {currentStep > 1 && (
        <Button
          mode="text"
          onPress={() => {
            if (currentStep < 3) {
              setCurrentStep((prev) => (prev + 1) as Step);
            } else {
              handleSubmit();
            }
          }}
          disabled={isLoading}
          style={styles.skipButton}
        >
          {currentStep === 3 ? 'Skip & Create Account' : 'Skip this step'}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressSection: {
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepIconContainer: {
    marginBottom: 16,
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
  stepContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  hint: {
    marginTop: 8,
    marginBottom: 8,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  skipButton: {
    marginTop: 12,
  },
});
