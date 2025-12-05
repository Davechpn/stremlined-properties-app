/**
 * Empty State Illustrations
 * 
 * Simple, icon-based illustrations for various empty states
 * Uses MaterialCommunityIcons for consistent design
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export type IllustrationType = 
  | 'organizations'
  | 'teams'
  | 'invitations'
  | 'properties'
  | 'activity'
  | 'search';

export interface EmptyStateIllustrationProps {
  type: IllustrationType;
  size?: number;
}

const getIconConfig = (type: IllustrationType): { name: keyof typeof MaterialCommunityIcons.glyphMap; color: string } => {
  switch (type) {
    case 'organizations':
      return { name: 'office-building-outline', color: '#6366f1' };
    case 'teams':
      return { name: 'account-group-outline', color: '#8b5cf6' };
    case 'invitations':
      return { name: 'email-outline', color: '#ec4899' };
    case 'properties':
      return { name: 'home-city-outline', color: '#14b8a6' };
    case 'activity':
      return { name: 'clock-outline', color: '#f59e0b' };
    case 'search':
      return { name: 'magnify', color: '#64748b' };
  }
};

export const EmptyStateIllustration: React.FC<EmptyStateIllustrationProps> = ({
  type,
  size = 120,
}) => {
  const theme = useTheme();
  const iconConfig = getIconConfig(type);
  
  // Use theme-aware background color
  const backgroundColor = theme.dark 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.03)';

  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        backgroundColor,
        borderRadius: size / 2,
      }
    ]}>
      <MaterialCommunityIcons
        name={iconConfig.name}
        size={size * 0.5}
        color={iconConfig.color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
});
