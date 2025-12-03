/**
 * Card Component
 * 
 * Reusable card component with shadows and animations
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Card as PaperCard, CardProps as PaperCardProps } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';

export interface CardProps extends PaperCardProps {
  /** Enable entrance animation */
  animated?: boolean;
  /** Animation delay in milliseconds */
  animationDelay?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  animated = false,
  animationDelay = 0,
  style,
  ...props
}) => {
  const cardContent = (
    <PaperCard style={[styles.card, style]} {...props}>
      {children}
    </PaperCard>
  );

  if (animated) {
    return (
      <Animated.View entering={FadeIn.delay(animationDelay).duration(400)}>
        {cardContent}
      </Animated.View>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    elevation: 2,
  },
});
