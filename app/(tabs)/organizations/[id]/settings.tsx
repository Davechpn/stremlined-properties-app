/**
 * Organization Settings Screen
 * 
 * Settings page for organization management.
 * Only accessible by owner/admin roles.
 */

import { OrganizationForm, OrganizationFormData } from '@/components/organizations/organization-form';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useOrganizationDetails, useUpdateOrganization, useDeleteOrganization } from '@/hooks/use-organizations';
import { Role } from '@/types/organization';
import { logToReactotron } from '@/services/monitoring/reactotron';
import * as Sentry from '@sentry/react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Dialog, Divider, Portal, Text, useTheme } from 'react-native-paper';

export default function OrganizationSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch organization details
  const { data: organization, isLoading, isError, refetch } = useOrganizationDetails(id!);
  const updateOrganization = useUpdateOrganization(id!);
  const deleteOrganization = useDeleteOrganization(id!);

  // Form state
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof OrganizationFormData, string>>>({});
  
  // Delete confirmation dialog
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  // Handle back
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Initialize form with organization data
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        description: organization.description || '',
        website: organization.website || '',
        phoneNumber: organization.phoneNumber || '',
        address: organization.address || '',
        city: organization.city || '',
        state: organization.state || '',
        country: organization.country || '',
        postalCode: organization.postalCode || '',
      });
    }
  }, [organization]);

  // Check if user can manage organization
  const canManage = organization?.userRole === Role.OWNER || organization?.userRole === Role.ADMIN;
  const isOwner = organization?.userRole === Role.OWNER;

  // Handle form change
  const handleFormChange = (values: OrganizationFormData) => {
    setFormData(values);
    // Clear errors when user starts typing
    setFormErrors({});
  };

  // Handle save
  const handleSave = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      logToReactotron('Updating organization', { id, formData });

      // Update organization
      await updateOrganization.mutateAsync({
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

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Sentry.addBreadcrumb({
        category: 'organization',
        message: 'Organization updated',
        level: 'info',
        data: { id, name: formData.name },
      });

      Alert.alert(
        'Success',
        'Organization updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      logToReactotron('Organization update error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        response: error?.response?.data,
      });

      Sentry.captureException(error, {
        tags: { context: 'update-organization' },
      });

      // Handle validation errors from API
      if (error?.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        Alert.alert(
          'Update Failed',
          error?.response?.data?.message || 'Failed to update organization. Please try again.'
        );
      }
    }
  };

  // Handle delete
  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteDialogVisible(false);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      logToReactotron('Deleting organization', { id });

      // Delete organization
      await deleteOrganization.mutateAsync();

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Sentry.addBreadcrumb({
        category: 'organization',
        message: 'Organization deleted',
        level: 'warning',
        data: { id },
      });

      Alert.alert(
        'Success',
        'Organization deleted successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(app)/(tabs)/organizations'),
          },
        ]
      );
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      logToReactotron('Organization deletion error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        response: error?.response?.data,
      });

      Sentry.captureException(error, {
        tags: { context: 'delete-organization' },
      });

      Alert.alert(
        'Deletion Failed',
        error?.response?.data?.message || 'Failed to delete organization. Please try again.'
      );
    }
  };

  const cancelDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDeleteDialogVisible(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingIndicator message="Loading organization..." />
      </View>
    );
  }

  // Error state
  if (isError || !organization) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorMessage
          error="Failed to load organization"
          onRetry={refetch}
        />
      </View>
    );
  }

  // Access denied for non-owner/admin
  if (!canManage) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Card style={styles.accessDeniedCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.accessDeniedTitle}>
              Access Denied
            </Text>
            <Text variant="bodyMedium" style={styles.accessDeniedMessage}>
              You don't have permission to view organization settings.
            </Text>
            <Button mode="contained" onPress={handleBack} style={styles.backButton}>
              Go Back
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  const isSaving = updateOrganization.isPending;
  const isDeleting = deleteOrganization.isPending;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
            showExtendedFields={true}
          />

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={isSaving}
              disabled={isSaving || !formData.name.trim()}
              style={styles.saveButton}
            >
              Save Changes
            </Button>

            <Button
              mode="outlined"
              onPress={handleBack}
              disabled={isSaving || isDeleting}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>

          {/* Danger Zone (Owner Only) */}
          {isOwner && (
            <>
              <Divider style={styles.divider} />
              <Card style={styles.dangerZoneCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.dangerZoneTitle}>
                    Danger Zone
                  </Text>
                  <Text variant="bodyMedium" style={styles.dangerZoneMessage}>
                    Deleting this organization is permanent and cannot be undone.
                    All members will lose access.
                  </Text>
                  <Button
                    mode="contained"
                    onPress={handleDelete}
                    loading={isDeleting}
                    disabled={isSaving || isDeleting}
                    buttonColor={theme.colors.error}
                    style={styles.deleteButton}
                  >
                    Delete Organization
                  </Button>
                </Card.Content>
              </Card>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={cancelDelete}>
          <Dialog.Title>Delete Organization?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete "{organization.name}"? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelDelete}>Cancel</Button>
            <Button onPress={confirmDelete} textColor={theme.colors.error}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  saveButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 24,
  },
  dangerZoneCard: {
    margin: 16,
    borderColor: '#ef5350',
    borderWidth: 1,
  },
  dangerZoneTitle: {
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  dangerZoneMessage: {
    marginBottom: 16,
    opacity: 0.8,
  },
  deleteButton: {
    marginTop: 8,
  },
  accessDeniedCard: {
    margin: 16,
  },
  accessDeniedTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  accessDeniedMessage: {
    marginBottom: 16,
    opacity: 0.8,
  },
  backButton: {
    marginTop: 8,
  },
});
