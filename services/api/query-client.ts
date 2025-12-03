/**
 * TanStack Query Client Configuration
 * 
 * Configures React Query with:
 * - AsyncStorage persistence for offline support
 * - Optimized cache and stale time settings
 * - Retry logic for failed requests
 * - Default query and mutation options
 */

import { QUERY_CACHE_TIME, QUERY_STALE_TIME } from '@/constants/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';

// Create persister for offline support
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1000, // Throttle writes to storage
});

// Create query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time before data is garbage collected
      gcTime: QUERY_CACHE_TIME,
      
      // Time before data is considered stale
      staleTime: QUERY_STALE_TIME,
      
      // Retry failed requests
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus
      refetchOnWindowFocus: true,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
      retryDelay: 1000,
    },
  },
});

/**
 * Invalidate all queries
 * Useful when user signs out or switches organizations
 */
export const invalidateAllQueries = async () => {
  await queryClient.invalidateQueries();
};

/**
 * Clear all query cache
 * Useful when user signs out
 */
export const clearQueryCache = () => {
  queryClient.clear();
};

/**
 * Remove specific queries by key
 */
export const removeQueries = (queryKey: any[]) => {
  queryClient.removeQueries({ queryKey });
};
