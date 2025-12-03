/**
 * Welcome screen types
 */

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any; // Image source from require()
  backgroundColor?: string;
}

export interface WelcomeState {
  hasSeenOnboarding: boolean;
  currentSlideIndex: number;
}
