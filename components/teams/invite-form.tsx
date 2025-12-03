/**
 * Invite Form Component
 * 
 * Team invitation form with email/phone input, role picker,
 * and optional personal message.
 */

import { RolePicker } from '@/components/teams/role-picker';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { validateEmail, validatePhoneNumber } from '@/lib/utils/validation';
import { ContactType } from '@/types/invitation';
import { Role } from '@/types/organization';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Chip, HelperText, Text, useTheme } from 'react-native-paper';

export interface InviteFormData {
  inviteeContact: string;
  inviteeContactType: ContactType;
  assignedRole: Role;
  message?: string;
}

export interface InviteFormProps {
  /**
   * Initial form values
   */
  initialValues?: Partial<InviteFormData>;
  
  /**
   * Callback when form is submitted
   */
  onSubmit: (data: InviteFormData) => void | Promise<void>;
  
  /**
   * Whether the form is disabled (loading)
   */
  disabled?: boolean;
  
  /**
   * Roles to exclude from picker
   */
  excludeRoles?: Role[];
}

/**
 * Team invitation form component
 * 
 * @example
 * ```tsx
 * <InviteForm
 *   onSubmit={async (data) => {
 *     await sendInvitation(data);
 *   }}
 *   excludeRoles={[Role.OWNER]}
 * />
 * ```
 */
export function InviteForm({
  initialValues,
  onSubmit,
  disabled = false,
  excludeRoles = [Role.OWNER],
}: InviteFormProps) {
  const theme = useTheme();

  // Form state
  const [contact, setContact] = useState(initialValues?.inviteeContact || '');
  const [contactType, setContactType] = useState<ContactType>(
    initialValues?.inviteeContactType || ContactType.EMAIL
  );
  const [role, setRole] = useState<Role>(initialValues?.assignedRole || Role.VIEWER);
  const [message, setMessage] = useState(initialValues?.message || '');

  // UI state
  const [contactError, setContactError] = useState('');
  const [rolePickerVisible, setRolePickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate contact based on type
  const validateContact = (value: string, type: ContactType): string => {
    if (!value.trim()) {
      return `${type === ContactType.EMAIL ? 'Email' : 'Phone number'} is required`;
    }

    if (type === ContactType.EMAIL) {
      if (!validateEmail(value)) {
        return 'Please enter a valid email address';
      }
    } else {
      if (!validatePhoneNumber(value)) {
        return 'Please enter a valid phone number (e.g., +1234567890)';
      }
    }

    return '';
  };

  // Handle contact type change
  const handleContactTypeChange = (type: ContactType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setContactType(type);
    setContact('');
    setContactError('');
  };

  // Handle contact change
  const handleContactChange = (value: string) => {
    setContact(value);
    if (contactError) {
      const error = validateContact(value, contactType);
      setContactError(error);
    }
  };

  // Handle role picker open
  const handleRolePickerOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRolePickerVisible(true);
  };

  // Handle role selection
  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setRolePickerVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate contact
    const error = validateContact(contact, contactType);
    if (error) {
      setContactError(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const formData: InviteFormData = {
        inviteeContact: contact.trim(),
        inviteeContactType: contactType,
        assignedRole: role,
        message: message.trim() || undefined,
      };

      await onSubmit(formData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = contact.trim() !== '' && !contactError;
  const isLoading = disabled || isSubmitting;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Contact type selector */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionLabel}>
            Contact Type
          </Text>
          <View style={styles.chipGroup}>
            <Chip
              selected={contactType === ContactType.EMAIL}
              onPress={() => handleContactTypeChange(ContactType.EMAIL)}
              disabled={isLoading}
              icon="email"
              style={styles.chip}
            >
              Email
            </Chip>
            <Chip
              selected={contactType === ContactType.PHONE}
              onPress={() => handleContactTypeChange(ContactType.PHONE)}
              disabled={isLoading}
              icon="phone"
              style={styles.chip}
            >
              Phone
            </Chip>
          </View>
        </View>

        {/* Contact input */}
        <View style={styles.section}>
          <TextInput
            label={contactType === ContactType.EMAIL ? 'Email Address' : 'Phone Number'}
            value={contact}
            onChangeText={handleContactChange}
            onBlur={() => setContactError(validateContact(contact, contactType))}
            keyboardType={contactType === ContactType.EMAIL ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            autoComplete={contactType === ContactType.EMAIL ? 'email' : 'tel'}
            textContentType={contactType === ContactType.EMAIL ? 'emailAddress' : 'telephoneNumber'}
            placeholder={
              contactType === ContactType.EMAIL
                ? 'john.doe@example.com'
                : '+1234567890'
            }
            error={contactError}
            disabled={isLoading}
            left={contactType === ContactType.EMAIL ? 'email' : 'phone'}
          />
          {contactError && (
            <HelperText type="error" visible={!!contactError}>
              {contactError}
            </HelperText>
          )}
        </View>

        {/* Role selector */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionLabel}>
            Assigned Role
          </Text>
          <Button
            mode="outlined"
            onPress={handleRolePickerOpen}
            icon="shield-account"
            disabled={isLoading}
            style={styles.roleButton}
          >
            {role}
          </Button>
          <HelperText type="info" visible>
            Selected role will determine the member's permissions
          </HelperText>
        </View>

        {/* Optional message */}
        <View style={styles.section}>
          <TextInput
            label="Personal Message (Optional)"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            maxLength={500}
            placeholder="Add a personal message to your invitation..."
            disabled={isLoading}
            left="message-text"
          />
          <HelperText type="info" visible>
            {message.length}/500 characters
          </HelperText>
        </View>

        {/* Submit button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!isFormValid || isLoading}
          icon="send"
          style={styles.submitButton}
        >
          Send Invitation
        </Button>
      </ScrollView>

      {/* Role picker bottom sheet */}
      <RolePicker
        visible={rolePickerVisible}
        selectedRole={role}
        excludeRoles={excludeRoles}
        onSelect={handleRoleSelect}
        onDismiss={() => setRolePickerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: 12,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
  },
  roleButton: {
    justifyContent: 'flex-start',
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
