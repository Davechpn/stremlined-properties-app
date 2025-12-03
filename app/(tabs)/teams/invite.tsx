/**
 * Invite Member Screen
 * 
 * Modal/screen for inviting new team members with role selection
 * and optional personal message.
 */

import { InviteForm, InviteFormData } from '@/components/teams/invite-form';
import { useActiveOrganization } from '@/hooks/use-active-organization';
import { useInvitationManagement } from '@/hooks/use-invitations';
import { Role } from '@/types/organization';
import { logToReactotron } from '@/services/monitoring/reactotron';
import * as Sentry from '@sentry/react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Snackbar, useTheme } from 'react-native-paper';

export default function InviteMemberScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { activeOrganizationId } = useActiveOrganization();
  const { sendInvitation, isSending } = useInvitationManagement(activeOrganizationId);

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');

  // Handle form submission
  const handleSubmit = async (data: InviteFormData) => {
    try {
      logToReactotron('Sending invitation', {
        organizationId: activeOrganizationId,
        contact: data.inviteeContact,
        role: data.assignedRole,
      });

      await sendInvitation(data);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      logToReactotron('Invitation sent successfully', {
        contact: data.inviteeContact,
      });

      Sentry.addBreadcrumb({
        category: 'invitation',
        message: 'Invitation sent',
        level: 'info',
        data: {
          organizationId: activeOrganizationId,
          role: data.assignedRole,
        },
      });

      // Show success message
      setSnackbarMessage(`Invitation sent to ${data.inviteeContact}`);
      setSnackbarVisible(true);

      // Navigate back after short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      logToReactotron('Invitation send error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        response: error?.response?.data,
      });

      Sentry.captureException(error, {
        tags: { context: 'send-invitation' },
        extra: { data },
      });

      // Handle specific error cases
      const errorMessage = error?.response?.data?.error?.message || 'Failed to send invitation';
      const errorCode = error?.response?.data?.error?.code;

      if (errorCode === 'ALREADY_MEMBER') {
        Alert.alert(
          'Already a Member',
          'This user is already a member of the organization.',
          [{ text: 'OK', onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }]
        );
      } else if (errorCode === 'DUPLICATE_INVITATION') {
        Alert.alert(
          'Invitation Already Sent',
          'A pending invitation already exists for this contact.',
          [{ text: 'OK', onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }]
        );
      } else {
        Alert.alert(
          'Invitation Failed',
          errorMessage,
          [{ text: 'OK', onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }]
        );
      }

      throw error; // Re-throw to prevent navigation
    }
  };

  // Handle back press
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

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
          showsVerticalScrollIndicator={false}
        >
          <InviteForm
            onSubmit={handleSubmit}
            disabled={isSending}
            excludeRoles={[Role.OWNER]}
          />
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
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
