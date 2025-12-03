/**
 * LoadingIndicator Component
 * 
 * Consistent loading indicator using React Native Paper
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

export interface LoadingIndicatorProps {
  /** Loading message to display */
  message?: string;
  /** Size of the indicator */
  size?: 'small' | 'large' | number;
  /** Color of the indicator */
  color?: string;
  /** Center the indicator */
  centered?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message,
  size = 'large',
  color,
  centered = true,
}) => {
  const content = (
    <>
      <ActivityIndicator animating={true} size={size} color={color} />
      {message ? (
        <Text style={styles.message} variant="bodyMedium">
          {message}
        </Text>
      ) : null}
    </>
  );

  if (centered) {
    return <View style={styles.centeredContainer}>{content}</View>;
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
  },
});
