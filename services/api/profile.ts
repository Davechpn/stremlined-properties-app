/**
 * Profile API Service
 * 
 * TanStack Query hooks for user profile management operations.
 * Includes queries for fetching profile data and mutations for updating profile information.
 */

import { ApiResponse } from '@/types/api';
import { OrganizationMembership, User } from '@/types/auth';
import { UpdateProfileRequest } from '@/types/profile';
import * as Sentry from '@sentry/react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

/**
 * Full profile data including organizations and permissions
 */
export interface ProfileData {
  user: User;
  organizations: OrganizationMembership[];
  activeSessions: any[];
  permissions: any;
}

/**
 * Fetch the current user's profile
 */
export const useProfile = () => {
  return useQuery<User>({
    queryKey: ['profile'],
    queryFn: async () => {
      console.log('🔵 [Profile API] Fetching profile from: /auth/profile');
      try {
        const { data } = await apiClient.get<ApiResponse<ProfileData>>('/auth/profile');
        console.log('🔵 [Profile API] Raw response:', JSON.stringify(data, null, 2));
        
        if (!data.data || !data.data.user) {
          console.error('🔴 [Profile API] No user data in response:', data);
          throw new Error('No user data returned from API');
        }
        
        console.log('🟢 [Profile API] User profile:', data.data.user);
        return data.data.user;
      } catch (error) {
        console.error('🔴 [Profile API] Error fetching profile:', error);
        console.error('🔴 [Profile API] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          response: (error as any)?.response?.data,
          status: (error as any)?.response?.status,
        });
        Sentry.captureException(error, {
          tags: { api_operation: 'fetch-profile' },
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch the full profile data including organizations and permissions
 */
export const useFullProfile = () => {
  return useQuery<ProfileData>({
    queryKey: ['fullProfile'],
    queryFn: async () => {
      console.log('🔵 [Profile API] Fetching full profile from: /auth/profile');
      try {
        const { data } = await apiClient.get<ApiResponse<ProfileData>>('/auth/profile');
        console.log('🔵 [Profile API] Full profile response:', JSON.stringify(data, null, 2));
        
        if (!data.data) {
          console.error('🔴 [Profile API] No data in response:', data);
          throw new Error('No data returned from API');
        }
        
        console.log('🟢 [Profile API] Full profile data:', {
          user: data.data.user,
          organizationsCount: data.data.organizations?.length || 0,
        });
        return data.data;
      } catch (error) {
        console.error('🔴 [Profile API] Error fetching full profile:', error);
        Sentry.captureException(error, {
          tags: { api_operation: 'fetch-full-profile' },
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Update the current user's profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateProfileRequest>({
    mutationFn: async (request) => {
      console.log('🔵 [Profile API] Updating profile at: /auth/profile');
      console.log('🔵 [Profile API] Request payload:', request);
      
      try {
        const { data } = await apiClient.put<ApiResponse<User>>(
          '/auth/profile',
          request
        );
        
        console.log('🔵 [Profile API] Update response:', JSON.stringify(data, null, 2));
        
        // Check if response has the expected structure
        if (!data) {
          console.error('🔴 [Profile API] No response data');
          throw new Error('No response from server');
        }
        
        // Handle both wrapped and direct user response
        const userData = data.data || (data as any);
        
        if (!userData || !userData.id) {
          console.error('🔴 [Profile API] Invalid user data in response:', data);
          throw new Error('Invalid user data returned from API');
        }
        
        console.log('🟢 [Profile API] Profile updated successfully:', userData);
        return userData;
      } catch (error) {
        console.error('🔴 [Profile API] Error updating profile:', error);
        console.error('🔴 [Profile API] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          response: (error as any)?.response?.data,
          status: (error as any)?.response?.status,
        });
        
        Sentry.captureException(error, {
          tags: { api_operation: 'update-profile' },
          extra: { request },
        });
        throw error;
      }
    },
    onSuccess: (updatedUser) => {
      // Update the profile cache with the new data
      queryClient.setQueryData(['profile'], updatedUser);

      Sentry.addBreadcrumb({
        category: 'profile',
        message: 'Profile updated successfully',
        level: 'info',
      });

      // Update Sentry user context
      Sentry.setUser({
        id: updatedUser.id,
        email: updatedUser.email || undefined,
        username: updatedUser.name,
      });
    },
  });
};

/**
 * Upload profile photo
 */
export const useUploadProfilePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { uri: string; type: string; name: string }>({
    mutationFn: async ({ uri, type, name }) => {
      try {
        const formData = new FormData();
        formData.append('photo', {
          uri,
          type,
          name,
        } as any);

        const { data } = await apiClient.post<ApiResponse<User>>(
          '/users/me/photo',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        if (!data.data) {
          throw new Error('No data returned from API');
        }
        return data.data;
      } catch (error) {
        Sentry.captureException(error, {
          tags: { api_operation: 'upload-profile-photo' },
        });
        throw error;
      }
    },
    onSuccess: (updatedUser) => {
      // Update the profile cache with the new photo URL
      queryClient.setQueryData(['profile'], updatedUser);

      Sentry.addBreadcrumb({
        category: 'profile',
        message: 'Profile photo uploaded successfully',
        level: 'info',
      });
    },
  });
};

/**
 * Delete profile photo
 */
export const useDeleteProfilePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, void>({
    mutationFn: async () => {
      try {
        const { data } = await apiClient.delete<ApiResponse<User>>('/users/me/photo');
        if (!data.data) {
          throw new Error('No data returned from API');
        }
        return data.data;
      } catch (error) {
        Sentry.captureException(error, {
          tags: { api_operation: 'delete-profile-photo' },
        });
        throw error;
      }
    },
    onSuccess: (updatedUser) => {
      // Update the profile cache to remove photo URL
      queryClient.setQueryData(['profile'], updatedUser);

      Sentry.addBreadcrumb({
        category: 'profile',
        message: 'Profile photo deleted successfully',
        level: 'info',
      });
    },
  });
};
