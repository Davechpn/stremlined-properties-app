/**
 * Edit Profile Screen
 * 
 * Form for editing user profile information including name, email, phone, and photo.
 * Includes real-time validation and optimistic updates.
 */

import { ProfileForm, ProfileFormData } from '@/components/profile/profile-form';
import { PhotoUpload } from '@/components/profile/photo-upload';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useProfile, useUpdateProfile, useUploadProfilePhoto, useDeleteProfilePhoto } from '@/services/api/profile';
import { logToReactotron } from '@/services/monitoring/reactotron';
import * as Sentry from '@sentry/react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, Snackbar, useTheme } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  // Fetch current profile
  const { data: user, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadPhoto = useUploadProfilePhoto();
  const deletePhoto = useDeleteProfilePhoto();

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const isSaving = updateProfile.isPending || uploadPhoto.isPending || deletePhoto.isPending;

  // Handle cancel
  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Handle save
  const handleSave = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      logToReactotron('Updating profile', { formData });

      // Update profile
      await updateProfile.mutateAsync({
        name: formData.name,
        email: formData.email || undefined,
        phoneNumber: formData.phoneNumber || undefined,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSnackbarMessage('Profile updated successfully');
      setSnackbarVisible(true);

      Sentry.addBreadcrumb({
        category: 'profile',
        message: 'Profile updated',
        level: 'info',
      });

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      logToReactotron('Profile update error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        response: error?.response?.data,
      });

      Sentry.captureException(error, {
        tags: { context: 'profile-update' },
      });

      // Handle validation errors from API
      if (error?.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        Alert.alert(
          'Update Failed',
          error?.response?.data?.message || 'Failed to update profile. Please try again.'
        );
      }
    }
  };

  // Configure header with save button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={isSaving}
          style={{ marginRight: 8, opacity: isSaving ? 0.5 : 1 }}
        >
          <IconSymbol name="checkmark" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isSaving, formData, theme]);

  // Update form data when user data loads
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  // Handle form change
  const handleFormChange = (values: ProfileFormData) => {
    setFormData(values);
    // Clear errors when user starts typing
    setFormErrors({});
  };

  // Handle photo selected
  const handlePhotoSelected = async (uri: string, fileInfo: { width: number; height: number; size: number }) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      logToReactotron('Uploading profile photo', { uri, fileInfo });

      // Upload photo
      await uploadPhoto.mutateAsync({
        uri,
        type: 'image/jpeg',
        name: `profile-${Date.now()}.jpg`,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSnackbarMessage('Profile photo updated successfully');
      setSnackbarVisible(true);

      Sentry.addBreadcrumb({
        category: 'profile',
        message: 'Profile photo uploaded',
        level: 'info',
        data: fileInfo,
      });
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      logToReactotron('Photo upload error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      Sentry.captureException(error, {
        tags: { context: 'photo-upload' },
      });

      Alert.alert('Upload Failed', 'Failed to upload photo. Please try again.');
    }
  };

  // Handle photo removed
  const handlePhotoRemoved = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      logToReactotron('Deleting profile photo', {});

      await deletePhoto.mutateAsync();

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSnackbarMessage('Profile photo removed successfully');
      setSnackbarVisible(true);

      Sentry.addBreadcrumb({
        category: 'profile',
        message: 'Profile photo deleted',
        level: 'info',
      });
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      logToReactotron('Photo delete error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      Sentry.captureException(error, {
        tags: { context: 'photo-delete' },
      });

      Alert.alert('Delete Failed', 'Failed to remove photo. Please try again.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingIndicator message="Loading profile..." />
      </View>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ErrorMessage
          error={error || new Error('Failed to load profile')}
          onRetry={() => router.back()}
        />
      </View>
    );
  }

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
          {/* Photo Upload */}
          <PhotoUpload
            currentPhotoUrl={user.profilePhotoUrl}
            userName={user.name}
            onPhotoSelected={handlePhotoSelected}
            onPhotoRemoved={handlePhotoRemoved}
            uploading={uploadPhoto.isPending || deletePhoto.isPending}
            size={120}
          />

          {/* Profile Form */}
          <ProfileForm
            initialValues={formData}
            onChange={handleFormChange}
            errors={formErrors}
            disabled={isSaving}
          />

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={isSaving}
              disabled={isSaving}
              style={styles.saveButton}
            >
              Save Changes
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

      {/* Success Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
});
