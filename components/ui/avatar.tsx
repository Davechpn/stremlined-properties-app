/**
 * Avatar Component
 * 
 * Displays user or organization avatar with fallback to initials.
 * Uses expo-image for optimized loading with blurhash placeholders.
 */

import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface AvatarProps {
  /**
   * URL of the avatar image
   */
  uri?: string | null;
  
  /**
   * Name to generate initials from (e.g., "John Doe" → "JD")
   */
  name: string;
  
  /**
   * Size of the avatar in pixels
   * @default 48
   */
  size?: number;
  
  /**
   * Whether to show a border
   * @default false
   */
  bordered?: boolean;
}

/**
 * Extract initials from a name
 * Examples:
 * - "John Doe" → "JD"
 * - "Alice" → "A"
 * - "Bob Smith Johnson" → "BJ"
 */
const getInitials = (name: string): string => {
  const parts = name.trim().split(' ').filter(Boolean);
  
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  
  // Take first letter of first name and first letter of last name
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Generate a consistent background color based on the name
 * Uses a simple hash function to map names to colors
 */
const getBackgroundColor = (name: string): string => {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Orange
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Light Blue
  ];
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 48,
  bordered = false,
}) => {
  const theme = useTheme();
  const initials = getInitials(name);
  const backgroundColor = getBackgroundColor(name);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: bordered ? 2 : 0,
    borderColor: theme.colors.outline,
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, containerStyle]}
        contentFit="cover"
        transition={200}
        placeholder={initials}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        containerStyle,
        { backgroundColor },
      ]}
    >
      <Text
        variant="titleMedium"
        style={[
          styles.initials,
          {
            fontSize: size * 0.4,
            color: '#FFFFFF',
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    overflow: 'hidden',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
