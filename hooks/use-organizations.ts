/**
 * Organizations Hook
 * 
 * Custom hook for organization management operations.
 * Wraps TanStack Query hooks with additional business logic and optimistic updates.
 */

import {
    useCreateOrganization as useCreateOrganizationMutation,
    useDeleteOrganization as useDeleteOrganizationMutation,
    useOrganization,
    useOrganizations as useOrganizationsQuery,
    useUpdateOrganization as useUpdateOrganizationMutation,
} from '@/services/api/organizations';
import { CreateOrganizationRequest, Organization, UpdateOrganizationRequest } from '@/types/organization';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook for fetching all organizations the user belongs to
 */
export const useOrganizations = () => {
  return useOrganizationsQuery();
};

/**
 * Hook for fetching a specific organization
 */
export const useOrganizationDetails = (organizationId: string | null) => {
  return useOrganization(organizationId);
};

/**
 * Hook for creating a new organization
 */
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  const mutation = useCreateOrganizationMutation();

  return {
    ...mutation,
    createOrganization: async (request: CreateOrganizationRequest) => {
      const result = await mutation.mutateAsync(request);
      
      // Optimistically update the organizations list
      queryClient.setQueryData<Organization[]>(['organizations'], (old = []) => [
        ...old,
        result,
      ]);
      
      return result;
    },
  };
};

/**
 * Hook for updating an organization
 */
export const useUpdateOrganization = (organizationId: string) => {
  const mutation = useUpdateOrganizationMutation(organizationId);

  return {
    ...mutation,
    updateOrganization: async (request: UpdateOrganizationRequest) => {
      return mutation.mutateAsync(request);
    },
  };
};

/**
 * Hook for deleting an organization
 */
export const useDeleteOrganization = (organizationId: string) => {
  const queryClient = useQueryClient();
  const mutation = useDeleteOrganizationMutation(organizationId);

  return {
    ...mutation,
    deleteOrganization: async () => {
      await mutation.mutateAsync();
      
      // Optimistically remove the organization from the list
      queryClient.setQueryData<Organization[]>(['organizations'], (old = []) =>
        old.filter((org) => org.id !== organizationId)
      );
    },
  };
};
