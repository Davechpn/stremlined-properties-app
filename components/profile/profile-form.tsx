/**
 * Profile Form Component
 * 
 * Edit profile form with name, email, and phone inputs.
 * Includes real-time validation and error handling.
 */

import { TextInput } from '@/components/ui/text-input';
import { validateEmail, validatePhoneNumber } from '@/lib/utils/validation';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export interface ProfileFormData {
  name: string;
  email: string;
  phoneNumber: string;
}

export interface ProfileFormProps {
  /**
   * Initial form values
   */
  initialValues: ProfileFormData;
  
  /**
   * Callback when form values change
   */
  onChange: (values: ProfileFormData) => void;
  
  /**
   * Form errors from submission
   */
  errors?: Partial<Record<keyof ProfileFormData, string>>;
  
  /**
   * Whether the form is disabled (during submission)
   */
  disabled?: boolean;
}

/**
 * Profile edit form component
 * 
 * @example
 * ```tsx
 * <ProfileForm
 *   initialValues={{ name: 'John', email: 'john@example.com', phoneNumber: '+1234567890' }}
 *   onChange={(values) => console.log(values)}
 * />
 * ```
 */
export function ProfileForm({
  initialValues,
  onChange,
  errors = {},
  disabled = false,
}: ProfileFormProps) {
  const theme = useTheme();
  const [values, setValues] = useState<ProfileFormData>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof ProfileFormData, boolean>>>({});

  // Handle field change
  const handleChange = (field: keyof ProfileFormData) => (value: string) => {
    const newValues = { ...values, [field]: value };
    setValues(newValues);
    onChange(newValues);
  };

  // Handle field blur (mark as touched)
  const handleBlur = (field: keyof ProfileFormData) => () => {
    setTouched({ ...touched, [field]: true });
  };

  // Validate individual fields
  const getFieldError = (field: keyof ProfileFormData): string | undefined => {
    // Show server errors first
    if (errors[field]) {
      return errors[field];
    }

    // Show client validation only after field is touched
    if (!touched[field]) {
      return undefined;
    }

    switch (field) {
      case 'name':
        if (!values.name.trim()) {
          return 'Name is required';
        }
        if (values.name.trim().length < 2) {
          return 'Name must be at least 2 characters';
        }
        break;
        
      case 'email':
        if (!values.email.trim()) {
          return 'Email is required';
        }
        if (!validateEmail(values.email)) {
          return 'Invalid email address';
        }
        break;
        
      case 'phoneNumber':
        if (values.phoneNumber && !validatePhoneNumber(values.phoneNumber)) {
          return 'Invalid phone number (use E.164 format: +1234567890)';
        }
        break;
    }

    return undefined;
  };

  return (
    <View style={styles.container}>
      {/* Name input */}
      <TextInput
        label="Full Name"
        value={values.name}
        onChangeText={handleChange('name')}
        onBlur={handleBlur('name')}
        error={getFieldError('name')}
        disabled={disabled}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        placeholder="Enter your full name"
        style={styles.input}
      />

      {/* Email input */}
      <TextInput
        label="Email Address"
        value={values.email}
        onChangeText={handleChange('email')}
        onBlur={handleBlur('email')}
        error={getFieldError('email')}
        disabled={disabled}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="Enter your email address"
        style={styles.input}
      />

      {/* Phone input */}
      <TextInput
        label="Phone Number (Optional)"
        value={values.phoneNumber}
        onChangeText={handleChange('phoneNumber')}
        onBlur={handleBlur('phoneNumber')}
        error={getFieldError('phoneNumber')}
        disabled={disabled}
        autoComplete="tel"
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        placeholder="+1234567890"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
});
