import { IconSymbol } from '@/components/ui/icon-symbol';
import { DrawerActions } from '@react-navigation/native';
import { Stack, useNavigation } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function InvitationsLayout() {
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
        name="pending"
        options={{
          title: 'Invitations',
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
        name="[token]"
        options={{
          title: 'Accept Invitation',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
