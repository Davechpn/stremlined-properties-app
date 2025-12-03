/**
 * Member Detail Screen
 * 
 * Display detailed information about a specific team member
 * with options to change role or remove from organization.
 */

import { RolePicker } from '@/components/teams/role-picker';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useActiveOrganization } from '@/hooks/use-active-organization';
import { usePermissions } from '@/hooks/use-permissions';
import { useCanManageMember, useTeamManagement, useTeamMemberDetails } from '@/hooks/use-teams';
import { Role } from '@/types/organization';
import { logToReactotron } from '@/services/monitoring/reactotron';
import * as Sentry from '@sentry/react-native';
import { formatDistanceToNow } from 'date-fns';
import { lightImpact, mediumImpact, successFeedback, errorFeedback } from '@/lib/utils/haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, List, Snackbar, Text, useTheme } from 'react-native-paper';

export default function MemberDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ memberId: string }>();
  const memberId = params.memberId;

  const { activeOrganizationId } = useActiveOrganization();
  const { currentRole } = usePermissions();
  const { member, isLoading, error, daysInOrganization } = useTeamMemberDetails(
    activeOrganizationId,
    memberId
  );
  const { updateMemberRole, removeMember, isUpdating, isRemoving } = useTeamManagement(
    activeOrganizationId
  );

  const [rolePickerVisible, setRolePickerVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Check permissions
  const { canUpdate, canRemove } = useCanManageMember(currentRole || undefined, member?.role as Role);

  // Handle back press
  const handleBack = () => {
    lightImpact();
    router.back();
  };

  // Handle change role
  const handleChangeRole = () => {
    lightImpact();
    setRolePickerVisible(true);
  };

  // Handle role selection
  const handleRoleSelect = async (newRole: Role) => {
    if (!member) return;

    try {
      logToReactotron('Updating member role', {
        memberId: member.id,
        oldRole: member.role,
        newRole,
      });

      await updateMemberRole(member.id, newRole);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setRolePickerVisible(false);
      setSnackbarMessage(`Role updated to ${newRole}`);
      setSnackbarVisible(true);

      Sentry.addBreadcrumb({
        category: 'team',
        message: 'Member role updated',
        level: 'info',
        data: {
          memberId: member.id,
          newRole,
        },
      });
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      logToReactotron('Role update error', { error });
      Sentry.captureException(error, {
        tags: { context: 'update-member-role' },
      });

      Alert.alert('Update Failed', 'Failed to update member role. Please try again.');
    }
  };

  // Handle remove member
  const handleRemoveMember = () => {
    if (!member) return;

    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.user.name} from the organization?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => lightImpact(),
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

              logToReactotron('Removing member', {
                memberId: member.id,
                userName: member.user.name,
              });

              await removeMember(member.id);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

              Sentry.addBreadcrumb({
                category: 'team',
                message: 'Member removed',
                level: 'info',
                data: {
                  memberId: member.id,
                },
              });

              // Navigate back
              router.back();
            } catch (error) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              logToReactotron('Remove member error', { error });
              Sentry.captureException(error, {
                tags: { context: 'remove-member' },
              });

              Alert.alert('Remove Failed', 'Failed to remove member. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <LoadingIndicator message="Loading member details..." />
      </View>
    );
  }

  // Error state
  if (error || !member) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ErrorMessage error={error || new Error('Member not found')} onRetry={handleBack} />
      </View>
    );
  }

  const lastActiveText = member.user.lastActiveAt
    ? formatDistanceToNow(new Date(member.user.lastActiveAt), { addSuffix: true })
    : 'Never';

  const joinedText = formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile section */}
        <View style={[styles.profileSection, { backgroundColor: theme.colors.surface }]}>
          <Avatar uri={member.user.profilePhotoUrl} name={member.user.name} size={80} />
          <Text variant="headlineSmall" style={styles.name}>
            {member.user.name}
          </Text>
          <Badge role={member.role as Role} size="medium" />
        </View>

        <Divider style={styles.divider} />

        {/* Contact information */}
        <View style={styles.section}>
          <List.Section>
            <List.Subheader>Contact Information</List.Subheader>
            {member.user.email && (
              <List.Item
                title="Email"
                description={member.user.email}
                left={(props) => <List.Icon {...props} icon="email" />}
              />
            )}
            {member.user.phoneNumber && (
              <List.Item
                title="Phone"
                description={member.user.phoneNumber}
                left={(props) => <List.Icon {...props} icon="phone" />}
              />
            )}
          </List.Section>
        </View>

        <Divider style={styles.divider} />

        {/* Membership information */}
        <View style={styles.section}>
          <List.Section>
            <List.Subheader>Membership Information</List.Subheader>
            <List.Item
              title="Joined"
              description={`${joinedText} (${daysInOrganization} days)`}
              left={(props) => <List.Icon {...props} icon="calendar" />}
            />
            <List.Item
              title="Last Active"
              description={lastActiveText}
              left={(props) => <List.Icon {...props} icon="clock" />}
            />
            <List.Item
              title="Status"
              description={member.status}
              left={(props) => <List.Icon {...props} icon="check-circle" />}
            />
          </List.Section>
        </View>

        <Divider style={styles.divider} />

        {/* Actions */}
        {(canUpdate || canRemove) && (
          <View style={styles.actions}>
            {canUpdate && (
              <Button
                mode="contained"
                onPress={handleChangeRole}
                icon="shield-account"
                disabled={isUpdating || isRemoving}
                loading={isUpdating}
                style={styles.actionButton}
              >
                Change Role
              </Button>
            )}

            {canRemove && (
              <Button
                mode="outlined"
                onPress={handleRemoveMember}
                icon="account-remove"
                textColor={theme.colors.error}
                disabled={isUpdating || isRemoving}
                loading={isRemoving}
                style={[styles.actionButton, { borderColor: theme.colors.error }]}
              >
                Remove Member
              </Button>
            )}
          </View>
        )}
      </ScrollView>

      {/* Role picker */}
      <RolePicker
        visible={rolePickerVisible}
        selectedRole={member.role as Role}
        excludeRoles={[Role.OWNER]}
        onSelect={handleRoleSelect}
        onDismiss={() => setRolePickerVisible(false)}
        title="Change Member Role"
      />

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  name: {
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 8,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});
