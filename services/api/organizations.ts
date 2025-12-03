/**
 * Organizations API Service
 * 
 * TanStack Query hooks for organization management operations.
 * Includes queries for fetching organizations and mutations for creating,
 * updating, and switching active organization.
 */

import { ApiResponse } from '@/types/api';
import {
    CreateOrganizationRequest,
    Organization,
    OrganizationWithMember,
    SwitchOrganizationRequest,
    UpdateOrganizationRequest,
} from '@/types/organization';
import * as Sentry from '@sentry/react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

/**
 * Fetch all organizations the current user belongs to
 */
export const useOrganizations = () => {
  return useQuery<OrganizationWithMember[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      console.log('🔵 [API] Fetching organizations from:', '/organizations');
      try {
        const { data } = await apiClient.get<{ organizations: OrganizationWithMember[] }>(
          '/organizations'
        );
        console.log('🔵 [API] Raw response:', JSON.stringify(data, null, 2));
        
        if (!data.organizations) {
          console.error('🔴 [API] No organizations array in response:', data);
          throw new Error('No organizations returned from API');
        }
        
        console.log('🔵 [API] Organizations count:', data.organizations.length);
        
        // Transform the response to ensure role is set from userRole for backward compatibility
        const transformed = data.organizations.map(org => {
          console.log('🔵 [API] Transforming org:', { id: org.id, name: org.name, userRole: org.userRole });
          return {
            ...org,
            role: org.userRole as any,
          };
        });
        
        console.log('🟢 [API] Transformed organizations:', JSON.stringify(transformed, null, 2));
        return transformed;
      } catch (error) {
        console.error('🔴 [API] Error fetching organizations:', error);
        console.error('🔴 [API] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          response: (error as any)?.response?.data,
          status: (error as any)?.response?.status,
        });
        Sentry.captureException(error, {
          tags: { api_operation: 'fetch-organizations' },
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch a specific organization by ID
 */
export const useOrganization = (organizationId: string | null) => {
  return useQuery<Organization>({
    queryKey: ['organizations', organizationId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<Organization>(
          `/organizations/${organizationId}`
        );
        if (!data) {
          throw new Error('No data returned from API');
        }
        return data;
      } catch (error) {
        Sentry.captureException(error, {
          tags: { api_operation: 'fetch-organization', organization_id: organizationId || 'unknown' },
        });
        throw error;
      }
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Create a new organization
 */
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation<Organization, Error, CreateOrganizationRequest>({
    mutationFn: async (request) => {
      try {
        const { data } = await apiClient.post<ApiResponse<Organization>>(
          '/organizations',
          request
        );
        if (!data.data) {
          throw new Error('No data returned from API');
        }
        return data.data;
      } catch (error) {
        Sentry.captureException(error, {
          tags: { api_operation: 'create-organization', organization_name: request.name },
        });
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate organizations list to refetch
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      
      Sentry.addBreadcrumb({
        category: 'organization',
        message: 'Organization created successfully',
        level: 'info',
      });
    },
  });
};

/**
 * Update an existing organization
 */
export const useUpdateOrganization = (organizationId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Organization, Error, UpdateOrganizationRequest>({
    mutationFn: async (request) => {
      try {
        const { data } = await apiClient.patch<ApiResponse<Organization>>(
          `/organizations/${organizationId}`,
          request
        );
        if (!data.data) {
          throw new Error('No data returned from API');
        }
        return data.data;
      } catch (error) {
        Sentry.captureException(error, {
          tags: { api_operation: 'update-organization', organization_id: organizationId },
        });
        throw error;
      }
    },
    onSuccess: (updatedOrganization) => {
      // Update the specific organization in cache
      queryClient.setQueryData(
        ['organizations', organizationId],
        updatedOrganization
      );
      
      // Invalidate organizations list to refetch
      queryClient.invalidateQueries({ queryKey: ['organizations'] });

      Sentry.addBreadcrumb({
        category: 'organization',
        message: 'Organization updated successfully',
        level: 'info',
        data: { organizationId },
      });
    },
  });
};

/**
 * Switch the active organization for the current user
 */
export const useSwitchOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation<{ activeOrganizationId: string; updatedAt: string }, Error, SwitchOrganizationRequest>({
    mutationFn: async (request) => {
      try {
        const { data } = await apiClient.patch<ApiResponse<{ activeOrganizationId: string; updatedAt: string }>>(
          '/users/me/active-organization',
          request
        );
        if (!data.data) {
          throw new Error('No data returned from API');
        }
        return data.data;
      } catch (error) {
        Sentry.captureException(error, {
          tags: { api_operation: 'switch-organization', organization_id: request.organizationId },
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate dashboard and permission queries to refetch with new org context
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      Sentry.addBreadcrumb({
        category: 'organization',
        message: 'Active organization switched',
        level: 'info',
        data: { activeOrganizationId: data.activeOrganizationId },
      });
    },
  });
};

/**
 * Delete an organization (Owner only)
 */
export const useDeleteOrganization = (organizationId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        await apiClient.delete(`/organizations/${organizationId}`);
      } catch (error) {
        Sentry.captureException(error, {
          tags: { api_operation: 'delete-organization', organization_id: organizationId },
        });
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate organizations list to refetch
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      
      // Remove the specific organization from cache
      queryClient.removeQueries({ queryKey: ['organizations', organizationId] });

      Sentry.addBreadcrumb({
        category: 'organization',
        message: 'Organization deleted successfully',
        level: 'warning',
        data: { organizationId },
      });
    },
  });
};
