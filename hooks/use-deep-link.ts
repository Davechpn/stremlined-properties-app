/**
 * Deep Link Hook
 * 
 * Custom hook for handling deep links (invitations, password reset, etc.)
 * Manages parsing and processing of deep link URLs.
 */

import { logToReactotron } from '@/services/monitoring/reactotron';
import * as Sentry from '@sentry/react-native';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';

/**
 * Deep link types
 */
export enum DeepLinkType {
  INVITATION = 'invitation',
  PASSWORD_RESET = 'password-reset',
  UNKNOWN = 'unknown',
}

/**
 * Deep link data structure
 */
export interface DeepLinkData {
  type: DeepLinkType;
  token?: string;
  params?: Record<string, string>;
  url: string;
}

/**
 * Parse deep link URL to extract type and token
 */
function parseDeepLink(url: string): DeepLinkData {
  try {
    logToReactotron('Parsing deep link', { url });

    const { hostname, path, queryParams } = Linking.parse(url);

    // Handle invitation links: streamlinedproperties://invitations/{token}
    if (hostname === 'invitations' || path?.startsWith('invitations/')) {
      const token = path?.replace('invitations/', '') || hostname || undefined;
      
      logToReactotron('Invitation link detected', { token });

      return {
        type: DeepLinkType.INVITATION,
        token,
        params: queryParams as Record<string, string>,
        url,
      };
    }

    // Handle password reset links: streamlinedproperties://reset-password?token={token}
    if (
      hostname === 'reset-password' ||
      path === 'reset-password' ||
      queryParams?.token
    ) {
      const token = (queryParams?.token as string) || '';
      
      logToReactotron('Password reset link detected', { token });

      return {
        type: DeepLinkType.PASSWORD_RESET,
        token,
        params: queryParams as Record<string, string>,
        url,
      };
    }

    logToReactotron('Unknown deep link type', { hostname, path });

    return {
      type: DeepLinkType.UNKNOWN,
      params: queryParams as Record<string, string>,
      url,
    };
  } catch (error) {
    logToReactotron('Error parsing deep link', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url,
    });

    Sentry.captureException(error, {
      tags: { context: 'parse-deep-link' },
      extra: { url },
    });

    return {
      type: DeepLinkType.UNKNOWN,
      url,
    };
  }
}

/**
 * Hook for handling deep links
 * 
 * Listens for deep link events and provides parsed link data.
 * Handles app cold start, background, and active states.
 * 
 * @example
 * ```tsx
 * const { deepLink, isProcessing, clearDeepLink } = useDeepLink();
 * 
 * useEffect(() => {
 *   if (deepLink?.type === DeepLinkType.INVITATION) {
 *     // Navigate to invitation acceptance screen
 *     router.push(`/invitations/${deepLink.token}`);
 *     clearDeepLink();
 *   }
 * }, [deepLink]);
 * ```
 */
export function useDeepLink() {
  const [deepLink, setDeepLink] = useState<DeepLinkData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Handle initial URL when app is opened from closed state
    const handleInitialURL = async () => {
      try {
        const initialURL = await Linking.getInitialURL();
        
        if (initialURL) {
          logToReactotron('Initial URL detected', { url: initialURL });
          
          const linkData = parseDeepLink(initialURL);
          setDeepLink(linkData);

          Sentry.addBreadcrumb({
            category: 'deep-link',
            message: 'Initial deep link handled',
            level: 'info',
            data: {
              type: linkData.type,
              token: linkData.token,
            },
          });
        }
      } catch (error) {
        logToReactotron('Error handling initial URL', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        Sentry.captureException(error, {
          tags: { context: 'initial-deep-link' },
        });
      }
    };

    handleInitialURL();

    // Listen for URL changes when app is in background or foreground
    const subscription = Linking.addEventListener('url', ({ url }) => {
      logToReactotron('Deep link URL received', { url });

      const linkData = parseDeepLink(url);
      setDeepLink(linkData);

      Sentry.addBreadcrumb({
        category: 'deep-link',
        message: 'Deep link received',
        level: 'info',
        data: {
          type: linkData.type,
          token: linkData.token,
        },
      });
    });

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Clear current deep link
   */
  const clearDeepLink = () => {
    logToReactotron('Clearing deep link', { deepLink });
    setDeepLink(null);
    setIsProcessing(false);
  };

  /**
   * Mark deep link as being processed
   */
  const startProcessing = () => {
    logToReactotron('Processing deep link', { deepLink });
    setIsProcessing(true);
  };

  /**
   * Mark deep link processing as complete
   */
  const finishProcessing = () => {
    logToReactotron('Finished processing deep link', { deepLink });
    setIsProcessing(false);
  };

  return {
    // Data
    deepLink,
    isProcessing,
    hasDeepLink: !!deepLink,

    // Actions
    clearDeepLink,
    startProcessing,
    finishProcessing,
  };
}

/**
 * Hook for handling invitation deep links specifically
 * 
 * @example
 * ```tsx
 * const { invitationToken, hasInvitation, processInvitation } = useInvitationDeepLink();
 * 
 * if (hasInvitation) {
 *   // Show invitation acceptance UI
 *   await processInvitation();
 * }
 * ```
 */
export function useInvitationDeepLink() {
  const { deepLink, isProcessing, startProcessing, finishProcessing, clearDeepLink } = useDeepLink();

  const hasInvitation = deepLink?.type === DeepLinkType.INVITATION;
  const invitationToken = hasInvitation ? deepLink.token : null;

  /**
   * Process invitation deep link
   */
  const processInvitation = () => {
    if (!hasInvitation) {
      throw new Error('No invitation deep link to process');
    }

    startProcessing();
  };

  /**
   * Complete invitation processing
   */
  const completeInvitation = () => {
    finishProcessing();
    clearDeepLink();
  };

  return {
    // Data
    invitationToken,
    hasInvitation,
    isProcessing,

    // Actions
    processInvitation,
    completeInvitation,
    clearDeepLink,
  };
}

/**
 * Hook for handling password reset deep links
 * 
 * @example
 * ```tsx
 * const { resetToken, hasPasswordReset, processPasswordReset } = usePasswordResetDeepLink();
 * 
 * if (hasPasswordReset) {
 *   // Navigate to password reset screen
 *   router.push(`/auth/reset-password?token=${resetToken}`);
 *   await processPasswordReset();
 * }
 * ```
 */
export function usePasswordResetDeepLink() {
  const { deepLink, isProcessing, startProcessing, finishProcessing, clearDeepLink } = useDeepLink();

  const hasPasswordReset = deepLink?.type === DeepLinkType.PASSWORD_RESET;
  const resetToken = hasPasswordReset ? deepLink.token : null;

  /**
   * Process password reset deep link
   */
  const processPasswordReset = () => {
    if (!hasPasswordReset) {
      throw new Error('No password reset deep link to process');
    }

    startProcessing();
  };

  /**
   * Complete password reset processing
   */
  const completePasswordReset = () => {
    finishProcessing();
    clearDeepLink();
  };

  return {
    // Data
    resetToken,
    hasPasswordReset,
    isProcessing,

    // Actions
    processPasswordReset,
    completePasswordReset,
    clearDeepLink,
  };
}
