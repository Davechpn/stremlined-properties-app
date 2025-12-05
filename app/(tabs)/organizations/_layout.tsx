import { IconSymbol } from '@/components/ui/icon-symbol';
import { DrawerActions } from '@react-navigation/native';
import { Stack, useNavigation } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function OrganizationsLayout() {
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
          title: 'Organizations',
          headerShown: true,
          headerLeft: () => {
            const navigation = useNavigation();
            return (
              <TouchableOpacity 
                onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                style={{ marginLeft: 8 }}
              >
                <IconSymbol name="line.3.horizontal" size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            );
          },
        }} 
      />
      <Stack.Screen 
        name="create" 
        options={{ 
          title: 'Create Organization',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Organization',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="[id]/settings" 
        options={{ 
          title: 'Organization Settings',
          headerShown: true,
        }} 
      />
    </Stack>
  );
}
