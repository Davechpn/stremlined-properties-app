import { IconSymbol } from '@/components/ui/icon-symbol';
import { DrawerActions } from '@react-navigation/native';
import { Stack, useNavigation } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

const HeaderLeft: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={{ marginLeft: 8, padding: 8 }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel="Open drawer"
      testID="profile-drawer-button"
    >
      <IconSymbol name="line.3.horizontal" size={24} color={theme.colors.onSurface} />
    </TouchableOpacity>
  );
};

export default function ProfileLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Profile',
          headerShown: true,
          headerLeft: () => <HeaderLeft />,
        }} 
      />
      <Stack.Screen 
        name="edit" 
        options={{ 
          title: 'Edit Profile',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          headerShown: true,
        }} 
      />
    </Stack>
  );
}
