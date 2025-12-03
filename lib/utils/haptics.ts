/**
 * Haptics Utility
 * 
 * Centralized haptic feedback functions to avoid duplication.
 * Wraps expo-haptics with common patterns used throughout the app.
 */

import * as Haptics from 'expo-haptics';

/**
 * Light impact haptic feedback
 * Used for button taps, selection changes, and general interactions
 */
export const lightImpact = async (): Promise<void> => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

/**
 * Medium impact haptic feedback
 * Used for more significant actions like confirmations or deletions
 */
export const mediumImpact = async (): Promise<void> => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

/**
 * Heavy impact haptic feedback
 * Used for critical actions or major state changes
 */
export const heavyImpact = async (): Promise<void> => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

/**
 * Success notification haptic
 * Used when an action completes successfully
 */
export const successFeedback = async (): Promise<void> => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

/**
 * Error notification haptic
 * Used when an action fails or encounters an error
 */
export const errorFeedback = async (): Promise<void> => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

/**
 * Warning notification haptic
 * Used for warnings or cautionary messages
 */
export const warningFeedback = async (): Promise<void> => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

/**
 * Selection changed haptic
 * Used when user changes a selection (non-async version for immediate feedback)
 */
export const selectionChanged = (): void => {
  Haptics.selectionAsync();
};
