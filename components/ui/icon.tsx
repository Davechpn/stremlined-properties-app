/**
 * Icon Component
 * 
 * Reusable icon wrapper for Material Community Icons.
 * Provides consistent sizing, colors, and accessibility.
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

export interface IconProps {
  /**
   * Icon name from Material Community Icons
   * @see https://oblador.github.io/react-native-vector-icons/
   */
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  
  /**
   * Icon size in pixels
   * @default 24
   */
  size?: number;
  
  /**
   * Icon color (hex, rgb, or theme color name)
   * @default theme.colors.onSurface
   */
  color?: string;
  
  /**
   * Additional style for the icon
   */
  style?: StyleProp<TextStyle>;
  
  /**
   * Accessibility label for screen readers
   */
  accessibilityLabel?: string;
  
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Icon component wrapping Material Community Icons
 * 
 * @example
 * ```tsx
 * <Icon name="account" size={24} color="#000" />
 * <Icon name="home" size={32} />
 * <Icon name="cog" />
 * ```
 */
export function Icon({
  name,
  size = 24,
  color,
  style,
  accessibilityLabel,
  testID,
}: IconProps) {
  const theme = useTheme();
  const iconColor = color || theme.colors.onSurface;

  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={iconColor}
      style={style}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    />
  );
}
