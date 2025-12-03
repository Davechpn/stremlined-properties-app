/**
 * Organization Form Component
 * 
 * Form for creating and editing organizations with name and description inputs.
 * Includes real-time validation and name availability checking.
 */

import { TextInput } from '@/components/ui/text-input';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export interface OrganizationFormData {
  name: string;
  description: string;
  website?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface OrganizationFormProps {
  /**
   * Initial form values
   */
  initialValues: OrganizationFormData;
  
  /**
   * Callback when form values change
   */
  onChange: (values: OrganizationFormData) => void;
  
  /**
   * Form errors from submission
   */
  errors?: Partial<Record<keyof OrganizationFormData, string>>;
  
  /**
   * Whether the form is disabled (during submission)
   */
  disabled?: boolean;
  
  /**
   * Whether to show extended fields (website, phone, address)
   * @default false
   */
  showExtendedFields?: boolean;
  
  /**
   * Name availability status (for real-time validation)
   */
  nameAvailability?: {
    checking: boolean;
    available?: boolean;
    message?: string;
  };
}

/**
 * Organization create/edit form component
 * 
 * @example
 * ```tsx
 * <OrganizationForm
 *   initialValues={{ name: '', description: '' }}
 *   onChange={(values) => console.log(values)}
 * />
 * ```
 */
export function OrganizationForm({
  initialValues,
  onChange,
  errors = {},
  disabled = false,
  showExtendedFields = false,
  nameAvailability,
}: OrganizationFormProps) {
  const theme = useTheme();
  const [values, setValues] = useState<OrganizationFormData>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof OrganizationFormData, boolean>>>({});

  // Handle field change
  const handleChange = (field: keyof OrganizationFormData) => (value: string) => {
    const newValues = { ...values, [field]: value };
    setValues(newValues);
    onChange(newValues);
  };

  // Handle field blur (mark as touched)
  const handleBlur = (field: keyof OrganizationFormData) => () => {
    setTouched({ ...touched, [field]: true });
  };

  // Validate individual fields
  const getFieldError = (field: keyof OrganizationFormData): string | undefined => {
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
          return 'Organization name is required';
        }
        if (values.name.trim().length < 2) {
          return 'Name must be at least 2 characters';
        }
        if (values.name.trim().length > 100) {
          return 'Name must be less than 100 characters';
        }
        // Check name availability
        if (nameAvailability && !nameAvailability.checking && nameAvailability.available === false) {
          return nameAvailability.message || 'This name is already taken';
        }
        break;
        
      case 'description':
        if (values.description && values.description.length > 500) {
          return 'Description must be less than 500 characters';
        }
        break;
        
      case 'website':
        if (values.website && !/^https?:\/\/.+/.test(values.website)) {
          return 'Invalid website URL (must start with http:// or https://)';
        }
        break;
    }

    return undefined;
  };

  return (
    <View style={styles.container}>
      {/* Name input */}
      <TextInput
        label="Organization Name"
        value={values.name}
        onChangeText={handleChange('name')}
        onBlur={handleBlur('name')}
        error={getFieldError('name')}
        disabled={disabled}
        autoCapitalize="words"
        placeholder="Enter organization name"
        style={styles.input}
      />

      {/* Description input */}
      <TextInput
        label="Description (Optional)"
        value={values.description}
        onChangeText={handleChange('description')}
        onBlur={handleBlur('description')}
        error={getFieldError('description')}
        disabled={disabled}
        autoCapitalize="sentences"
        placeholder="Brief description of your organization"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      {/* Extended fields */}
      {showExtendedFields && (
        <>
          {/* Website input */}
          <TextInput
            label="Website (Optional)"
            value={values.website}
            onChangeText={handleChange('website')}
            onBlur={handleBlur('website')}
            error={getFieldError('website')}
            disabled={disabled}
            autoCapitalize="none"
            keyboardType="url"
            placeholder="https://example.com"
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
            keyboardType="phone-pad"
            placeholder="+1234567890"
            style={styles.input}
          />

          {/* Address input */}
          <TextInput
            label="Address (Optional)"
            value={values.address}
            onChangeText={handleChange('address')}
            onBlur={handleBlur('address')}
            error={getFieldError('address')}
            disabled={disabled}
            autoCapitalize="words"
            placeholder="Street address"
            style={styles.input}
          />

          {/* City input */}
          <TextInput
            label="City (Optional)"
            value={values.city}
            onChangeText={handleChange('city')}
            onBlur={handleBlur('city')}
            error={getFieldError('city')}
            disabled={disabled}
            autoCapitalize="words"
            placeholder="City"
            style={styles.input}
          />

          {/* State input */}
          <TextInput
            label="State/Province (Optional)"
            value={values.state}
            onChangeText={handleChange('state')}
            onBlur={handleBlur('state')}
            error={getFieldError('state')}
            disabled={disabled}
            autoCapitalize="words"
            placeholder="State or Province"
            style={styles.input}
          />

          {/* Country input */}
          <TextInput
            label="Country (Optional)"
            value={values.country}
            onChangeText={handleChange('country')}
            onBlur={handleBlur('country')}
            error={getFieldError('country')}
            disabled={disabled}
            autoCapitalize="words"
            placeholder="Country"
            style={styles.input}
          />

          {/* Postal Code input */}
          <TextInput
            label="Postal Code (Optional)"
            value={values.postalCode}
            onChangeText={handleChange('postalCode')}
            onBlur={handleBlur('postalCode')}
            error={getFieldError('postalCode')}
            disabled={disabled}
            placeholder="Postal/ZIP code"
            style={styles.input}
          />
        </>
      )}
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
