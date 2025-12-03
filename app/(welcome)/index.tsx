/**
 * Welcome Screen
 * 
 * Initial landing screen showing app branding and tagline
 */

import { APP_NAME } from '@/constants/app';
import { logToReactotron } from '@/services/monitoring/reactotron';
import { mediumImpact } from '@/lib/utils/haptics';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    logToReactotron('Welcome screen viewed');
  }, []);

  const handleGetStarted = async () => {
    await mediumImpact();
    logToReactotron('Get Started button tapped');
    router.push('./onboarding');
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(800)} style={styles.content}>
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Text variant="displayLarge" style={styles.title}>
            {APP_NAME}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <Text variant="headlineSmall" style={styles.tagline}>
            Simplify Your Property Management
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.buttonContainer}>
          <Button mode="contained" onPress={handleGetStarted} style={styles.button}>
            Get Started
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
  tagline: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    paddingVertical: 8,
  },
});
