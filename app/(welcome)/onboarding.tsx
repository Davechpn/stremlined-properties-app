/**
 * Onboarding Screen
 * 
 * Carousel of 2-3 feature highlight screens with 60fps animations
 */

import { lightImpact } from '@/lib/utils/haptics';
import { logToReactotron } from '@/services/monitoring/reactotron';
import type { OnboardingSlide } from '@/types/welcome';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Onboarding slides data
const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Manage Properties Effortlessly',
    description: 'Keep track of all your properties in one place. Access important information anytime, anywhere.',
    image: require('@/assets/images/icon.png'), // Placeholder - replace with actual illustrations
    backgroundColor: '#0066CC',
  },
  {
    id: '2',
    title: 'Collaborate with Your Team',
    description: 'Invite team members, assign roles, and work together seamlessly across multiple organizations.',
    image: require('@/assets/images/icon.png'), // Placeholder
    backgroundColor: '#00A86B',
  },
  {
    id: '3',
    title: 'Stay Organized',
    description: 'Access all your data offline, receive real-time updates, and never miss important information.',
    image: require('@/assets/images/icon.png'), // Placeholder
    backgroundColor: '#FF6B35',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  useEffect(() => {
    logToReactotron('Onboarding screen viewed');
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = contentOffsetX;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const handleNext = async () => {
    await lightImpact();
    
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      logToReactotron('Onboarding next tapped', { currentIndex });
    } else {
      logToReactotron('Onboarding completed');
      router.push('./get-started');
    }
  };

  const handleSkip = async () => {
    await lightImpact();
    logToReactotron('Onboarding skipped', { currentIndex });
    router.push('./get-started');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { width }]}>
      <Animated.Image
        source={item.image}
        style={styles.image}
      />
      <Text variant="headlineMedium" style={styles.title}>
        {item.title}
      </Text>
      <Text variant="bodyLarge" style={styles.description}>
        {item.description}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={handleSkip}>
          Skip
        </Button>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => {
            const animatedStyle = useAnimatedStyle(() => {
              const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
              const scale = interpolate(scrollX.value, inputRange, [0.8, 1.2, 0.8], 'clamp');
              const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], 'clamp');

              return {
                transform: [{ scale: withSpring(scale) }],
                opacity: withSpring(opacity),
              };
            });

            return (
              <Animated.View key={index} style={[styles.dot, animatedStyle]} />
            );
          })}
        </View>

        <Button mode="contained" onPress={handleNext} style={styles.nextButton}>
          {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 24,
  },
  footer: {
    padding: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066CC',
    marginHorizontal: 4,
  },
  nextButton: {
    paddingVertical: 8,
  },
});
