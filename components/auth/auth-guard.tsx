import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { getToken } from '@/services/storage/secure-storage';
import { Redirect } from 'expo-router';
import React, { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  /** If true, only allow authenticated users. If false, only allow unauthenticated users. */
  requireAuth?: boolean;
  /** Redirect path for authenticated users (when requireAuth is false) */
  authenticatedRedirect?: string;
  /** Redirect path for unauthenticated users (when requireAuth is true) */
  unauthenticatedRedirect?: string;
}

/**
 * Auth Guard Component
 * 
 * Higher-order component for protecting routes based on authentication state.
 * 
 * Usage:
 * ```tsx
 * // Protect authenticated routes
 * <AuthGuard requireAuth>
 *   <DashboardScreen />
 * </AuthGuard>
 * 
 * // Protect guest-only routes (e.g., login screen)
 * <AuthGuard requireAuth={false} authenticatedRedirect="/(app)/dashboard">
 *   <SignInScreen />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({
  children,
  requireAuth = true,
  authenticatedRedirect = '/(app)/dashboard',
  unauthenticatedRedirect = '/(auth)/sign-in',
}: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
  const [checkKey, setCheckKey] = React.useState(0);

  useEffect(() => {
    checkAuth();
  }, [checkKey]);

  // Listen for storage changes (when user logs out)
  useEffect(() => {
    const interval = setInterval(() => {
      checkAuth();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getToken();
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    }
  };

  // Loading state while checking authentication
  if (isAuthenticated === null) {
    return <LoadingIndicator />;
  }

  // Require authentication: redirect unauthenticated users to login
  if (requireAuth && !isAuthenticated) {
    return <Redirect href={unauthenticatedRedirect as any} />;
  }

  // Require unauthenticated: redirect authenticated users to dashboard
  if (!requireAuth && isAuthenticated) {
    return <Redirect href={authenticatedRedirect as any} />;
  }

  // Render children if auth state matches requirement
  return <>{children}</>;
}
