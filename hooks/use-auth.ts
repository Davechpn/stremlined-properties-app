import {
    useCurrentUser,
    useForgotPassword,
    useResetPassword,
    useSignIn,
    useSignOut,
    useSignUp,
} from '@/services/api/auth';
import type { AuthCredentials, PasswordReset, PasswordResetRequest, SignUpCredentials } from '@/types/auth';
import { useMemo } from 'react';

/**
 * useAuth Hook
 * 
 * Central authentication state management hook.
 * Provides access to all authentication operations and current user state.
 * 
 * Usage:
 * ```tsx
 * const { user, isAuthenticated, isLoading, signUp, signIn, signOut } = useAuth();
 * 
 * // Sign up
 * await signUp({ name: 'John', email: 'john@example.com', password: 'pass123' });
 * 
 * // Sign in
 * await signIn({ email: 'john@example.com', password: 'pass123', rememberMe: true });
 * 
 * // Sign out
 * await signOut();
 * ```
 */
export function useAuth() {
  // Query hooks
  const { data: user, isLoading: isLoadingUser, error: userError } = useCurrentUser();

  // Mutation hooks
  const signUpMutation = useSignUp();
  const signInMutation = useSignIn();
  const signOutMutation = useSignOut();
  const forgotPasswordMutation = useForgotPassword();
  const resetPasswordMutation = useResetPassword();

  // Computed states
  const isAuthenticated = useMemo(() => !!user, [user]);
  
  const isLoading = useMemo(
    () =>
      isLoadingUser ||
      signUpMutation.isPending ||
      signInMutation.isPending ||
      signOutMutation.isPending,
    [
      isLoadingUser,
      signUpMutation.isPending,
      signInMutation.isPending,
      signOutMutation.isPending,
    ]
  );

  const error = useMemo(
    () =>
      userError ||
      signUpMutation.error ||
      signInMutation.error ||
      signOutMutation.error,
    [userError, signUpMutation.error, signInMutation.error, signOutMutation.error]
  );

  // Authentication operations
  const signUp = async (credentials: SignUpCredentials) => {
    return signUpMutation.mutateAsync(credentials);
  };

  const signIn = async (credentials: AuthCredentials) => {
    return signInMutation.mutateAsync(credentials);
  };

  const signOut = async (logoutFromAllDevices: boolean = true) => {
    return signOutMutation.mutateAsync(logoutFromAllDevices);
  };

  const forgotPassword = async (request: PasswordResetRequest) => {
    return forgotPasswordMutation.mutateAsync(request);
  };

  const resetPassword = async (reset: PasswordReset) => {
    return resetPasswordMutation.mutateAsync(reset);
  };

  return {
    // User state
    user,
    isAuthenticated,
    isLoading,
    error,

    // Auth operations
    signUp,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,

    // Mutation states (for fine-grained loading/error handling)
    signUpMutation,
    signInMutation,
    signOutMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
  };
}
