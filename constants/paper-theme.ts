import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Custom color palette for Streamlined Properties
const colors = {
  primary: '#0066CC',
  primaryContainer: '#E6F4FE',
  secondary: '#00A86B',
  secondaryContainer: '#E6FFF5',
  tertiary: '#FF6B35',
  tertiaryContainer: '#FFE8E0',
  error: '#DC143C',
  errorContainer: '#FFE6E6',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceVariant: '#E9ECEF',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onTertiary: '#FFFFFF',
  onError: '#FFFFFF',
  onBackground: '#1A1A1A',
  onSurface: '#1A1A1A',
  outline: '#CED4DA',
  shadow: '#000000',
};

const darkColors = {
  primary: '#4D9EFF',
  primaryContainer: '#003D7A',
  secondary: '#4DFFB8',
  secondaryContainer: '#005A3C',
  tertiary: '#FFB399',
  tertiaryContainer: '#A63D1A',
  error: '#FF6B6B',
  errorContainer: '#8B0000',
  background: '#1A1A1A',
  surface: '#2A2A2A',
  surfaceVariant: '#3A3A3A',
  onPrimary: '#001D36',
  onSecondary: '#003822',
  onTertiary: '#5A1E0D',
  onError: '#5A0000',
  onBackground: '#E9ECEF',
  onSurface: '#E9ECEF',
  outline: '#6C757D',
  shadow: '#000000',
};

export const paperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...colors,
  },
};

export const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
};
