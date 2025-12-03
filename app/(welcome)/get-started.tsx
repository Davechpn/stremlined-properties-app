/**
 * Get Started Screen
 * 
 * Final welcome screen with "Get Started" and "Sign In" buttons
 */

import { HAS_SEEN_ONBOARDING_KEY } from '@/constants/auth';
import { logToReactotron } from '@/services/monitoring/reactotron';
import { setItem } from '@/services/storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function GetStartedScreen() {
  const router = useRouter();

  useEffect(() => {
    logToReactotron('Get Started screen viewed');
    
    // Mark onboarding as seen
    setItem(HAS_SEEN_ONBOARDING_KEY, true);
  }, []);

  const handleGetStarted = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logToReactotron('Get Started (signup) button tapped');
    
    // TODO: Navigate to sign-up screen once Phase 4 is complete
    // For now, navigate to tabs
    router.replace('/(tabs)');
  };

  const handleSignIn = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    logToReactotron('Sign In button tapped');
    
    // TODO: Navigate to sign-in screen once Phase 4 is complete
    // For now, navigate to tabs
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Text variant="displaySmall" style={styles.title}>
            Ready to Get Started?
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <Text variant="bodyLarge" style={styles.description}>
            Create an account to start managing your properties or sign in if you already have one.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.buttonContainer}>
          <Button mode="contained" onPress={handleGetStarted} style={styles.button}>
            Create Account
          </Button>
          
          <Button mode="outlined" onPress={handleSignIn} style={styles.button}>
            Sign In
          </Button>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 48,
    paddingHorizontal: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    marginBottom: 16,
    paddingVertical: 8,
  },
});
