/**
 * BottomSheet Component
 * 
 * Reusable bottom sheet modal with smooth animations.
 * Uses react-native-reanimated for 60fps performance.
 */

import { lightImpact } from '@/lib/utils/haptics';
import React, { useCallback, useEffect } from 'react';
import { Dimensions, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const ANIMATION_DURATION = 300;

export interface BottomSheetProps {
  /** Whether the bottom sheet is visible */
  visible: boolean;
  /** Callback when the bottom sheet is dismissed */
  onDismiss: () => void;
  /** Content to display in the bottom sheet */
  children: React.ReactNode;
  /** Maximum height of the bottom sheet (percentage of screen height) */
  maxHeight?: number;
  /** Enable drag to dismiss */
  enableDragToDismiss?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onDismiss,
  children,
  maxHeight = 0.8,
  enableDragToDismiss = true,
}) => {
  const theme = useTheme();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  // Calculate sheet height
  const sheetHeight = SCREEN_HEIGHT * maxHeight;

  // Open animation
  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: ANIMATION_DURATION,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      backdropOpacity.value = withTiming(1, {
        duration: ANIMATION_DURATION,
      });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, {
        duration: ANIMATION_DURATION,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      backdropOpacity.value = withTiming(0, {
        duration: ANIMATION_DURATION,
      });
    }
  }, [visible]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    lightImpact();
    onDismiss();
  }, [onDismiss]);

  // Animated styles
  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss}>
          <Animated.View
            style={[
              styles.backdrop,
              backdropAnimatedStyle,
            ]}
          />
        </Pressable>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              height: sheetHeight,
            },
            sheetAnimatedStyle,
          ]}
        >
          {/* Drag Handle */}
          {enableDragToDismiss && (
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: theme.colors.onSurfaceDisabled },
                ]}
              />
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Account for iOS home indicator
  },
});
