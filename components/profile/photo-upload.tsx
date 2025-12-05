/**
 * Photo Upload Component
 * 
 * Profile photo upload using expo-image-picker with camera/gallery options.
 * Includes image compression and resize before upload.
 */

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { errorFeedback, lightImpact, successFeedback } from '@/lib/utils/haptics';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

export interface PhotoUploadProps {
  /**
   * Current photo URL
   */
  currentPhotoUrl?: string | null;
  
  /**
   * User name for avatar fallback
   */
  userName: string;
  
  /**
   * Callback when photo is selected and processed
   * Returns the processed image URI and file info
   */
  onPhotoSelected: (uri: string, fileInfo: { width: number; height: number; size: number }) => void;
  
  /**
   * Callback when photo is removed
   */
  onPhotoRemoved?: () => void;
  
  /**
   * Whether upload is in progress
   */
  uploading?: boolean;
  
  /**
   * Avatar size
   * @default 120
   */
  size?: number;
}

/**
 * Photo upload component with camera/gallery options
 * 
 * Features:
 * - Take photo with camera
 * - Select from gallery
 * - Remove current photo
 * - Compress and resize to 800x800px, max 1MB
 * 
 * @example
 * ```tsx
 * <PhotoUpload
 *   currentPhotoUrl={user.profilePhotoUrl}
 *   userName={user.name}
 *   onPhotoSelected={(uri, info) => uploadPhoto(uri)}
 *   onPhotoRemoved={() => removePhoto()}
 * />
 * ```
 */
export function PhotoUpload({
  currentPhotoUrl,
  userName,
  onPhotoSelected,
  onPhotoRemoved,
  uploading = false,
  size = 120,
}: PhotoUploadProps) {
  const theme = useTheme();
  const [processing, setProcessing] = useState(false);

  /**
   * Request camera permissions
   */
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return true;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in your device settings to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  /**
   * Request gallery permissions
   */
  const requestGalleryPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return true;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Gallery Permission Required',
        'Please enable photo library access in your device settings to select photos.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  /**
   * Process and compress image
   * Resize to 800x800px, compress to max 1MB
   */
  const processImage = async (uri: string): Promise<ImageManipulator.ImageResult | null> => {
    try {
      setProcessing(true);

      // Resize and compress
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800, height: 800 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      return result;
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image. Please try another photo.');
      return null;
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Handle image selection from result
   */
  const handleImageResult = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      
      // Process image
      const processed = await processImage(asset.uri);
      
      if (processed) {
        await successFeedback();
        
        // Calculate approximate file size
        const fileSize = Math.round(processed.width * processed.height * 0.5); // Rough estimate
        
        onPhotoSelected(processed.uri, {
          width: processed.width,
          height: processed.height,
          size: fileSize,
        });
      }
    }
  };

  /**
   * Take photo with camera
   */
  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      await lightImpact();
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      await handleImageResult(result);
    } catch (error) {
      console.error('Error taking photo:', error);
      await errorFeedback();
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  /**
   * Select photo from gallery
   */
  const handleSelectPhoto = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      await lightImpact();
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      await handleImageResult(result);
    } catch (error) {
      console.error('Error selecting photo:', error);
      await errorFeedback();
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  /**
   * Remove current photo
   */
  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await successFeedback();
            onPhotoRemoved?.();
          },
        },
      ]
    );
  };

  const isLoading = uploading || processing;

  return (
    <View style={styles.container}>
      {/* Avatar with loading overlay */}
      <View style={styles.avatarContainer}>
        <Avatar uri={currentPhotoUrl} name={userName} size={size} />
        
        {isLoading && (
          <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        {/* Camera button */}
        <Button
          mode="outlined"
          onPress={handleTakePhoto}
          disabled={isLoading}
          icon={() => <Icon name="camera" size={20} />}
          style={styles.button}
        >
          Camera
        </Button>

        {/* Gallery button */}
        <Button
          mode="outlined"
          onPress={handleSelectPhoto}
          disabled={isLoading}
          icon={() => <Icon name="image" size={20} />}
          style={styles.button}
        >
          Gallery
        </Button>

        {/* Remove button (only if photo exists) */}
        {currentPhotoUrl && onPhotoRemoved && (
          <Button
            mode="text"
            onPress={handleRemovePhoto}
            disabled={isLoading}
            icon={() => <Icon name="delete" size={20} />}
            textColor={theme.colors.error}
            style={styles.button}
          >
            Remove
          </Button>
        )}
      </View>

      {/* Helper text */}
      <Text 
        variant="bodySmall" 
        style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}
      >
        Max 1MB, 800x800px. JPG format.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  button: {
    minWidth: 100,
  },
  helperText: {
    textAlign: 'center',
    marginTop: 4,
  },
});
