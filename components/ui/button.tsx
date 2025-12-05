/**
 * Button Component
 * 
 * Wrapper around React Native Paper Button with haptic feedback
 */

import { heavyImpact, lightImpact, mediumImpact } from '@/lib/utils/haptics';
import React from 'react';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';

export interface ButtonProps extends PaperButtonProps {
  /** Enable haptic feedback on press */
  haptic?: boolean;
  /** Haptic feedback style */
  hapticStyle?: 'light' | 'medium' | 'heavy';
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  haptic = true,
  hapticStyle = 'light',
  ...props
}) => {
  const handlePress = async (e: any) => {
    if (haptic) {
      // Trigger haptic feedback based on style
      switch (hapticStyle) {
        case 'light':
          await lightImpact();
          break;
        case 'medium':
          await mediumImpact();
          break;
        case 'heavy':
          await heavyImpact();
          break;
      }
    }
    
    // Call original onPress handler
    if (onPress) {
      onPress(e);
    }
  };

  return <PaperButton onPress={handlePress} {...props} />;
};
