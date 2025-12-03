/**
 * ErrorMessage Component
 * 
 * Displays error messages with optional retry action
 */

import { parseApiError } from '@/lib/utils/error-handling';
import { AxiosError } from 'axios';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

export interface ErrorMessageProps {
  /** Error object or error message string */
  error: Error | AxiosError | string;
  /** Retry callback */
  onRetry?: () => void;
  /** Retry button label */
  retryLabel?: string;
  /** Show as banner instead of card */
  variant?: 'card' | 'banner';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  retryLabel = 'Try Again',
  variant = 'card',
}) => {
  // Parse error message
  const errorMessage = typeof error === 'string' ? error : parseApiError(error);

  if (variant === 'banner') {
    return (
      <View style={styles.bannerContainer}>
        <Text variant="bodyMedium" style={styles.bannerText}>
          {errorMessage}
        </Text>
        {onRetry ? (
          <Button mode="text" onPress={onRetry} compact>
            {retryLabel}
          </Button>
        ) : null}
      </View>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Something went wrong
        </Text>
        <Text variant="bodyMedium" style={styles.message}>
          {errorMessage}
        </Text>
        {onRetry ? (
          <Button mode="contained" onPress={onRetry} style={styles.retryButton}>
            {retryLabel}
          </Button>
        ) : null}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  message: {
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 4,
    margin: 16,
  },
  bannerText: {
    flex: 1,
    marginRight: 8,
    color: '#C62828',
  },
});
