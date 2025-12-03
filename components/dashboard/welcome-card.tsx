/**
 * Welcome Card Component
 * 
 * Display card for users with no organizations (empty state).
 * Shows an illustration and CTA to create their first organization.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

interface WelcomeCardProps {
  /**
   * User's name for personalized welcome message
   */
  userName: string;
  
  /**
   * Callback when "Create Organization" button is pressed
   */
  onCreateOrganization: () => void;
  
  /**
   * Whether the create action is loading
   */
  isLoading?: boolean;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({
  userName,
  onCreateOrganization,
  isLoading = false,
}) => {
  const theme = useTheme();

  return (
    <Card style={styles.card} mode="contained">
      <Card.Content>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Welcome, {userName}!
          </Text>
          <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            Get started by creating your first property management organization.
            You'll be able to invite team members, manage properties, and more.
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={onCreateOrganization}
            loading={isLoading}
            disabled={isLoading}
            icon="plus"
            style={styles.button}
          >
            Create Organization
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  button: {
    minWidth: 200,
  },
});
