/**
 * Invitation Acceptance Screen
 * 
 * Deep link target for accepting team invitations.
 * Displays invitation details and allows user to accept or decline.
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useAuth } from '@/hooks/use-auth';
import { useInvitationAcceptance } from '@/hooks/use-invitations';
import { Role } from '@/types/organization';
import { logToReactotron } from '@/services/monitoring/reactotron';
import * as Sentry from '@sentry/react-native';
import { formatDistanceToNow } from 'date-fns';
import { mediumImpact, lightImpact, successFeedback, errorFeedback } from '@/lib/utils/haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Divider, Text, useTheme } from 'react-native-paper';

export default function InvitationAcceptanceScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ token: string }>();
  const token = params.token;

  const { isAuthenticated } = useAuth();
  const {
    invitation,
    isLoading,
    error,
    isAccepting,
    canAccept,
    isExpired,
    daysRemaining,
    acceptInvitation,
  } = useInvitationAcceptance(token);

  // Log invitation view
  useEffect(() => {
    if (invitation) {
      logToReactotron('Invitation viewed', {
        invitationId: invitation.id,
        organizationName: invitation.organization.name,
        assignedRole: invitation.assignedRole,
      });

      Sentry.addBreadcrumb({
        category: 'invitation',
        message: 'Invitation viewed',
        level: 'info',
        data: {
          invitationId: invitation.id,
          organizationId: invitation.organizationId,
        },
      });
    }
  }, [invitation]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      // Store invitation token for after sign-in
      router.replace('/sign-in' as any);
    }
  }, [isAuthenticated, isLoading, token, router]);

  // Handle accept invitation
  const handleAccept = async () => {
    try {
      await mediumImpact();

      logToReactotron('Accepting invitation', {
        token,
        invitationId: invitation?.id,
      });

      await acceptInvitation();

      await successFeedback();

      logToReactotron('Invitation accepted', {
        organizationId: invitation?.organizationId,
      });

      // Navigate to dashboard
      router.replace('/dashboard' as any);
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      logToReactotron('Invitation acceptance error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      Sentry.captureException(error, {
        tags: { context: 'accept-invitation' },
        extra: { token },
      });
    }
  };

  // Handle decline
  const handleDecline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/dashboard' as any);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <LoadingIndicator message="Loading invitation..." />
      </View>
    );
  }

  // Error state
  if (error || !invitation) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ErrorMessage
          error={error || new Error('Invitation not found')}
          onRetry={() => router.replace('/dashboard' as any)}
        />
      </View>
    );
  }

  const expiresText = formatDistanceToNow(new Date(invitation.expiresAt), {
    addSuffix: true,
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Organization card */}
        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.cardContent}>
            {invitation.organization.logoUrl && (
              <Image
                source={{ uri: invitation.organization.logoUrl }}
                style={styles.logo}
                resizeMode="contain"
              />
            )}
            <Text variant="headlineMedium" style={styles.organizationName}>
              {invitation.organization.name}
            </Text>
            <Text
              variant="bodyLarge"
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              You've been invited to join this organization
            </Text>
          </Card.Content>
        </Card>

        {/* Invitation details */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Invitation Details
            </Text>
            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text
                variant="bodyMedium"
                style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                From
              </Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {invitation.inviter.name}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text
                variant="bodyMedium"
                style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                Your Role
              </Text>
              <Badge role={invitation.assignedRole as Role} size="small" />
            </View>

            <View style={styles.detailRow}>
              <Text
                variant="bodyMedium"
                style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                Expires
              </Text>
              <Text
                variant="bodyMedium"
                style={[
                  styles.detailValue,
                  {
                    color: isExpired
                      ? theme.colors.error
                      : daysRemaining && daysRemaining <= 2
                      ? '#FFA500'
                      : theme.colors.onSurface,
                  },
                ]}
              >
                {isExpired ? 'Expired' : `${expiresText} (${daysRemaining} days)`}
              </Text>
            </View>

            {invitation.message && (
              <>
                <Divider style={styles.divider} />
                <Text variant="titleSmall" style={styles.messageTitle}>
                  Personal Message
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
                >
                  "{invitation.message}"
                </Text>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Expiration warning */}
        {isExpired && (
          <Card style={[styles.warningCard, { backgroundColor: `${theme.colors.error}10` }]}>
            <Card.Content>
              <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                ⚠️ This invitation has expired. Please contact{' '}
                {invitation.inviter.name} to send a new invitation.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleAccept}
            icon="check"
            disabled={!canAccept || isAccepting}
            loading={isAccepting}
            style={styles.actionButton}
          >
            Accept Invitation
          </Button>

          <Button
            mode="outlined"
            onPress={handleDecline}
            icon="close"
            disabled={isAccepting}
            style={styles.actionButton}
          >
            Decline
          </Button>
        </View>
      </ScrollView>
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
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  organizationName: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  divider: {
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    flex: 1,
  },
  detailValue: {
    fontWeight: '500',
  },
  messageTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  message: {
    fontStyle: 'italic',
  },
  warningCard: {
    marginBottom: 16,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
});
