/**
 * EmptyState Component
 * 
 * Reusable empty state component with illustration, title, and description
 */

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { EmptyStateIllustration, IllustrationType } from './empty-state-illustration';

export interface EmptyStateProps {
  /** Illustration type (replaces image) */
  illustrationType?: IllustrationType;
  /** Legacy: Illustration image source (deprecated in favor of illustrationType) */
  image?: any;
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Action button label */
  actionLabel?: string;
  /** Action button callback */
  onAction?: () => void;
  /** Image/Illustration size */
  imageSize?: number;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  illustrationType,
  image,
  title,
  description,
  actionLabel,
  onAction,
  imageSize = 120,
}) => {
  return (
    <View style={styles.container}>
      {illustrationType ? (
        <EmptyStateIllustration type={illustrationType} size={imageSize} />
      ) : image ? (
        <Image
          source={image}
          style={[styles.image, { width: imageSize, height: imageSize }]}
          resizeMode="contain"
        />
      ) : null}
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyLarge" style={styles.description}>
        {description}
      </Text>
      {actionLabel && onAction ? (
        <Button mode="contained" onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  image: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  button: {
    marginTop: 16,
  },
});
