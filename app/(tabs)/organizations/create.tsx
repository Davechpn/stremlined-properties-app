/**
 * Create Organization Screen
 * 
 * Form for creating a new organization.
 * User becomes owner upon successful creation.
 */

import { OrganizationForm, OrganizationFormData } from '@/components/organizations/organization-form';
import { useActiveOrganization } from '@/hooks/use-active-organization';
import { useCreateOrganization } from '@/hooks/use-organizations';
import { logToReactotron } from '@/services/monitoring/reactotron';
import * as Sentry from '@sentry/react-native';
import { lightImpact, mediumImpact, heavyImpact, successFeedback, errorFeedback, warningFeedback, selectionChanged } from '@/lib/utils/haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, useTheme } from 'react-native-paper';

export default function CreateOrganizationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const createOrganization = useCreateOrganization();
  const { switchOrganization } = useActiveOrganization();

  // Form state
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof OrganizationFormData, string>>>({});

  // Handle form change
  const handleFormChange = (values: OrganizationFormData) => {
    setFormData(values);
    // Clear errors when user starts typing
    setFormErrors({});
  };

  // Handle create
  const handleCreate = async () => {
    try {
      await lightImpact();

      logToReactotron('Creating organization', { formData });

      // Create organization
      const newOrg = await createOrganization.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        website: formData.website || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        postalCode: formData.postalCode || undefined,
      });

      // T119: Automatically set the new organization as active
      if (newOrg?.id) {
        try {
          await switchOrganization(newOrg.id);
          logToReactotron('Set new organization as active', { organizationId: newOrg.id });
        } catch (switchError) {
          // Log but don't fail - org was created successfully
          logToReactotron('Failed to auto-switch to new organization', { error: switchError });
        }
      }

      await successFeedback();

      Sentry.addBreadcrumb({
        category: 'organization',
        message: 'Organization created',
        level: 'info',
        data: { name: formData.name, id: newOrg?.id },
      });

      Alert.alert(
        'Success',
        'Organization created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      await errorFeedback();

      logToReactotron('Organization creation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        response: error?.response?.data,
      });

      Sentry.captureException(error, {
        tags: { context: 'create-organization' },
      });

      // Handle validation errors from API
      if (error?.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        Alert.alert(
          'Creation Failed',
          error?.response?.data?.message || 'Failed to create organization. Please try again.'
        );
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    lightImpact();
    router.back();
  };

  const isSaving = createOrganization.isPending;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Appbar.Header>
        <Appbar.BackAction onPress={handleCancel} />
        <Appbar.Content title="Create Organization" />
      </Appbar.Header>

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Organization Form */}
          <OrganizationForm
            initialValues={formData}
            onChange={handleFormChange}
            errors={formErrors}
            disabled={isSaving}
            showExtendedFields={false}
          />

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={handleCreate}
              loading={isSaving}
              disabled={isSaving || !formData.name.trim()}
              style={styles.createButton}
            >
              Create Organization
            </Button>

            <Button
              mode="outlined"
              onPress={handleCancel}
              disabled={isSaving}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  createButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
});
