# Research: Account Management Module

**Phase**: Phase 0 - Technology Research & Decision Making  
**Date**: 2025-11-29  
**Feature**: Account Management Module

## Overview

This document consolidates research findings and technology decisions for implementing the account management module in the Streamlined Properties mobile app. All decisions follow the constitution's core principles (Component-First, No Duplication, Consistent Naming, Observability, Performance) and user-specified technology preferences (Expo, TanStack Query, React Native Paper).

---

## Technology Stack Decisions

### 1. UI Component Library: React Native Paper

**Decision**: Use React Native Paper 5.x for all UI components

**Rationale**:
- Material Design 3 support provides modern, polished UI out of the box
- Comprehensive component library (Button, TextInput, Card, Dialog, BottomSheet, Snackbar, FAB) reduces custom component development
- Built-in theming system with dark mode support
- Accessibility features (ARIA labels, screen reader support) included
- Active maintenance and excellent TypeScript support
- Integrates seamlessly with React Native and Expo

**Key Components Used**:
- **Button**: Primary, outlined, text variants with loading states
- **TextInput**: Email, password, phone inputs with validation states and error messages
- **Card**: Organization cards, member cards, invitation cards
- **Dialog**: Confirmation dialogs (delete, revoke, logout)
- **Portal**: For modals and bottom sheets rendering outside view hierarchy
- **BottomSheet**: Organization switcher, role picker
- **Snackbar**: Toast notifications for success/error feedback
- **FAB (Floating Action Button)**: Invite member, create organization
- **Avatar**: User and organization avatars with fallback initials
- **Chip**: Role badges, status badges
- **List**: Settings lists, navigation menu items

**Implementation Pattern**:
```typescript
// Example: Custom Button wrapper in components/ui/button.tsx
import { Button as PaperButton, useTheme } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

export const Button: React.FC<ButtonProps> = ({ onPress, haptic = true, ...props }) => {
  const theme = useTheme();
  
  const handlePress = async (e: GestureResponderEvent) => {
    if (haptic) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };
  
  return <PaperButton onPress={handlePress} {...props} />;
};
```

**Alternatives Considered**:
- **NativeBase**: Rejected - less active maintenance, larger bundle size
- **React Native Elements**: Rejected - more basic design, lacks bottom sheet
- **Custom components only**: Rejected - duplicates effort, violates constitution (No Duplication)

---

### 2. State Management: TanStack Query (React Query) v5

**Decision**: Use TanStack Query v5 for all server state management, data fetching, caching, and synchronization

**Rationale**:
- Eliminates need for complex state management (Redux, MobX) for API data
- Built-in caching with automatic background refetching and stale-while-revalidate
- Optimistic updates for perceived instant interactions
- Request deduplication prevents duplicate API calls
- Offline support with cache persistence via AsyncStorage
- Excellent developer experience with React Query DevTools (development only)
- Perfect fit for mobile apps with intermittent connectivity

**Key Patterns**:

**Query Pattern** (GET requests):
```typescript
// hooks/use-organizations.ts
import { useQuery } from '@tanstack/react-query';
import { organizationsApi } from '@/services/api/organizations';

export const useOrganizations = () => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    onError: (error) => {
      Sentry.captureException(error);
      Reactotron.log?.('Organizations fetch error', error);
    }
  });
};
```

**Mutation Pattern** (POST/PUT/DELETE requests):
```typescript
// hooks/use-organizations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: organizationsApi.create,
    onMutate: async (newOrg) => {
      // Optimistic update
      await queryClient.cancelQueries(['organizations']);
      const previous = queryClient.getQueryData(['organizations']);
      queryClient.setQueryData(['organizations'], (old) => [...old, { ...newOrg, id: 'temp' }]);
      return { previous };
    },
    onError: (err, newOrg, context) => {
      // Rollback on error
      queryClient.setQueryData(['organizations'], context.previous);
      Sentry.captureException(err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['organizations']);
    }
  });
};
```

**Infinite Query Pattern** (Paginated lists):
```typescript
// hooks/use-teams.ts
import { useInfiniteQuery } from '@tanstack/react-query';

export const useTeamMembers = (orgId: string) => {
  return useInfiniteQuery({
    queryKey: ['teams', orgId, 'members'],
    queryFn: ({ pageParam = 1 }) => teamsApi.getMembers(orgId, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });
};
```

**Cache Persistence** (Offline support):
```typescript
// services/api/query-client.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 2,
    },
  },
});

export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1000,
});
```

**Alternatives Considered**:
- **Redux Toolkit + RTK Query**: Rejected - more boilerplate, overkill for mobile app
- **Apollo Client (GraphQL)**: Rejected - backend is REST API, not GraphQL
- **SWR**: Rejected - less feature-rich than TanStack Query, smaller ecosystem

---

### 3. Observability: Sentry + Reactotron

**Decision**: Integrate Sentry for production error tracking and Reactotron for development debugging

**Sentry Implementation**:

**Error Tracking**:
```typescript
// services/monitoring/sentry.ts
import * as Sentry from '@sentry/react-native';
import { SENTRY_DSN } from '@/constants/app';

export const initSentry = () => {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: 1.0, // 100% performance monitoring in dev, adjust for prod
    enableAutoSessionTracking: true,
    integrations: [
      new Sentry.ReactNativeTracing({
        routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
      }),
    ],
  });
};
```

**Navigation Breadcrumbs** (Expo Router integration):
```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { usePathname } from 'expo-router';
import * as Sentry from '@sentry/react-native';

export default function RootLayout() {
  const pathname = usePathname();
  
  useEffect(() => {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${pathname}`,
      level: 'info',
    });
  }, [pathname]);
  
  return <Slot />;
}
```

**API Monitoring** (Axios interceptor):
```typescript
// services/api/client.ts
import axios from 'axios';
import * as Sentry from '@sentry/react-native';

const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use((config) => {
  const transaction = Sentry.startTransaction({
    op: 'http.client',
    name: `${config.method?.toUpperCase()} ${config.url}`,
  });
  config.headers['sentry-trace'] = transaction.toTraceparent();
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    Sentry.getCurrentHub().getScope()?.getTransaction()?.finish();
    return response;
  },
  (error) => {
    Sentry.captureException(error, {
      contexts: {
        request: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
      },
    });
    Sentry.getCurrentHub().getScope()?.getTransaction()?.finish();
    return Promise.reject(error);
  }
);
```

**Reactotron Implementation**:

**Setup** (development only):
```typescript
// services/monitoring/reactotron.ts
import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const initReactotron = () => {
  if (__DEV__) {
    Reactotron
      .setAsyncStorageHandler(AsyncStorage)
      .configure({ name: 'Streamlined Properties' })
      .useReactNative({
        networking: {
          ignoreUrls: /symbolicate/,
        },
      })
      .connect();
  }
};
```

**API Logging**:
```typescript
// services/api/client.ts (add to existing interceptors)
if (__DEV__) {
  apiClient.interceptors.request.use((config) => {
    Reactotron.log?.(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  });
  
  apiClient.interceptors.response.use(
    (response) => {
      Reactotron.log?.(`API Response: ${response.config.url}`, {
        status: response.status,
        data: response.data,
        duration: Date.now() - response.config.metadata.startTime,
      });
      return response;
    }
  );
}
```

**AsyncStorage Logging**:
```typescript
// services/storage/async-storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import Reactotron from 'reactotron-react-native';

export const storage = {
  getItem: async (key: string) => {
    const value = await AsyncStorage.getItem(key);
    if (__DEV__) Reactotron.log?.(`AsyncStorage.getItem: ${key}`, value);
    return value;
  },
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
    if (__DEV__) Reactotron.log?.(`AsyncStorage.setItem: ${key}`, value);
  },
};
```

**Alternatives Considered**:
- **Firebase Crashlytics**: Rejected - Sentry provides better React Native integration and more features
- **Flipper**: Rejected - Reactotron has better plugin ecosystem and simpler setup

---

### 4. Authentication Patterns

**Decision**: Multi-provider authentication with unified session management

**Google OAuth with Expo AuthSession**:
```typescript
// services/auth/google-oauth.ts
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_EXPO_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });
  
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      // Send token to backend for verification and session creation
      authApi.signInWithGoogle(authentication.accessToken);
    }
  }, [response]);
  
  return { signInWithGoogle: () => promptAsync() };
};
```

**Phone Authentication with OTP**:
```typescript
// services/auth/phone-auth.ts
export const phoneAuthFlow = {
  // Step 1: Request OTP
  requestOtp: async (phoneNumber: string) => {
    const response = await authApi.requestOtp({ phoneNumber });
    return response.data.sessionId; // Backend returns session ID
  },
  
  // Step 2: Verify OTP
  verifyOtp: async (sessionId: string, code: string) => {
    const response = await authApi.verifyOtp({ sessionId, code });
    return response.data; // Returns auth token and user data
  },
};
```

**Session Management**:
```typescript
// services/auth/session-manager.ts
import * as SecureStore from 'expo-secure-store';

export const sessionManager = {
  saveToken: async (token: string) => {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    Reactotron.log?.('Session token saved');
  },
  
  getToken: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  },
  
  clearSession: async () => {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await AsyncStorage.multiRemove([PROFILE_CACHE_KEY, ORG_CONTEXT_KEY]);
    Sentry.setUser(null);
    Reactotron.log?.('Session cleared');
  },
};
```

**Unified Auth Hook**:
```typescript
// hooks/use-auth.ts
export const useAuth = () => {
  const queryClient = useQueryClient();
  
  const signInWithEmail = useMutation({
    mutationFn: ({ email, password }: EmailCredentials) => 
      authApi.signInWithEmail(email, password),
    onSuccess: async (data) => {
      await sessionManager.saveToken(data.token);
      Sentry.setUser({ id: data.user.id, email: data.user.email });
      queryClient.setQueryData(['user'], data.user);
      router.replace('/(app)/dashboard');
    },
  });
  
  const signOut = useMutation({
    mutationFn: authApi.signOut,
    onSuccess: async () => {
      await sessionManager.clearSession();
      queryClient.clear();
      router.replace('/(auth)/sign-in');
    },
  });
  
  return { signInWithEmail, signOut, /* other methods */ };
};
```

---

### 5. Deep Linking Implementation

**Decision**: Use Expo Linking with universal links for invitation acceptance and password reset

**Configuration** (app.json):
```json
{
  "expo": {
    "scheme": "streamlinedproperties",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "app.streamlinedproperties.com",
              "pathPrefix": "/invitations"
            },
            {
              "scheme": "https",
              "host": "app.streamlinedproperties.com",
              "pathPrefix": "/reset-password"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "associatedDomains": ["applinks:app.streamlinedproperties.com"]
    }
  }
}
```

**Deep Link Handling**:
```typescript
// hooks/use-deep-link.ts
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export const useDeepLink = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Handle deep link when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });
    
    // Handle deep link when app opens from closed state
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });
    
    return () => subscription.remove();
  }, []);
  
  const handleDeepLink = (url: string) => {
    const { hostname, path, queryParams } = Linking.parse(url);
    
    if (path?.includes('/invitations/')) {
      const token = path.split('/').pop();
      router.push(`/(app)/invitations/${token}`);
      Sentry.addBreadcrumb({ message: `Deep link: invitation ${token}` });
    } else if (path?.includes('/reset-password')) {
      const token = queryParams?.token;
      router.push(`/(auth)/reset-password?token=${token}`);
    }
    
    Reactotron.log?.('Deep link handled', { url, hostname, path, queryParams });
  };
};
```

**Invitation Deep Link Screen**:
```typescript
// app/(app)/invitations/[token].tsx
import { useLocalSearchParams } from 'expo-router';

export default function InvitationAcceptScreen() {
  const { token } = useLocalSearchParams();
  const acceptInvitation = useAcceptInvitation();
  
  useEffect(() => {
    // Auto-accept if user is authenticated
    if (isAuthenticated) {
      acceptInvitation.mutate(token);
    }
  }, [token, isAuthenticated]);
  
  // Show invitation details, allow user to accept/decline
}
```

---

### 6. Offline Support & Caching Strategy

**Decision**: Implement progressive offline support with AsyncStorage caching and TanStack Query persistence

**Cache Architecture**:
1. **Authentication Tokens**: Expo SecureStore (encrypted)
2. **User Profile**: AsyncStorage with TanStack Query persistence
3. **Organizations List**: AsyncStorage with TanStack Query persistence
4. **Active Organization Context**: AsyncStorage (immediate persistence on switch)
5. **API Responses**: TanStack Query in-memory cache with AsyncStorage backup

**Implementation**:
```typescript
// services/storage/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const cache = {
  // Active organization context (for persistence across app restarts)
  saveActiveOrg: async (orgId: string) => {
    await AsyncStorage.setItem(ACTIVE_ORG_KEY, orgId);
    Reactotron.log?.(`Active org set: ${orgId}`);
  },
  
  getActiveOrg: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(ACTIVE_ORG_KEY);
  },
  
  // Profile cache with timestamp
  saveProfile: async (profile: User) => {
    const cached = {
      data: profile,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cached));
  },
  
  getProfile: async (): Promise<User | null> => {
    const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000; // 7 days
    
    if (isExpired) {
      await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
      return null;
    }
    
    return data;
  },
};
```

**Offline Detection**:
```typescript
// hooks/use-offline-status.ts
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export const useOfflineStatus = () => {
  const [isOffline, setIsOffline] = useState(false);
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
      if (!state.isConnected) {
        Sentry.addBreadcrumb({ message: 'Device went offline' });
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  return isOffline;
};
```

**Offline UI Feedback**:
```typescript
// components/ui/offline-banner.tsx
export const OfflineBanner = () => {
  const isOffline = useOfflineStatus();
  
  if (!isOffline) return null;
  
  return (
    <Banner
      visible
      icon="wifi-off"
      style={styles.banner}
    >
      You're offline. Some features may be unavailable.
    </Banner>
  );
};
```

---

### 7. Performance Optimization Patterns

**FlatList Optimization**:
```typescript
// components/organizations/organization-list.tsx
import { FlashList } from '@shopify/flash-list'; // Consider FlashList for better performance

export const OrganizationList = ({ organizations }: Props) => {
  const renderItem = useCallback(({ item }: { item: Organization }) => (
    <OrganizationListItem organization={item} />
  ), []);
  
  const keyExtractor = useCallback((item: Organization) => item.id, []);
  
  const getItemType = useCallback(() => 'organization', []); // For FlashList
  
  return (
    <FlashList
      data={organizations}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      estimatedItemSize={80}
      // Performance optimizations
      removeClippedSubviews
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={5}
    />
  );
};
```

**Image Optimization**:
```typescript
// components/ui/avatar.tsx
import { Image } from 'expo-image';

export const Avatar = ({ uri, size = 48 }: Props) => {
  const blurhash = 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.'; // Placeholder blurhash
  
  return (
    <Image
      source={{ uri }}
      placeholder={blurhash}
      contentFit="cover"
      transition={200}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      cachePolicy="memory-disk" // Cache on device
    />
  );
};
```

**Memoization Strategy**:
```typescript
// components/dashboard/organization-card.tsx
import { memo, useMemo, useCallback } from 'react';

export const OrganizationCard = memo(({ organization, onPress }: Props) => {
  const formattedDate = useMemo(
    () => formatDate(organization.lastActive),
    [organization.lastActive]
  );
  
  const handlePress = useCallback(() => {
    onPress(organization.id);
  }, [organization.id, onPress]);
  
  return (
    <Card onPress={handlePress}>
      {/* Card content */}
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for deep equality check
  return prevProps.organization.id === nextProps.organization.id &&
         prevProps.organization.lastActive === nextProps.organization.lastActive;
});
```

**Animation with Reanimated**:
```typescript
// components/ui/bottom-sheet.tsx
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';

export const BottomSheet = ({ visible, children }: Props) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  
  useEffect(() => {
    translateY.value = visible 
      ? withSpring(0, { damping: 20 }) 
      : withTiming(SCREEN_HEIGHT, { duration: 250 });
  }, [visible]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
};
```

---

## Summary of Technology Choices

| Category | Technology | Rationale |
|----------|-----------|-----------|
| **UI Library** | React Native Paper 5.x | Material Design 3, comprehensive components, built-in theming |
| **State Management** | TanStack Query v5 | Server state management, caching, offline support, optimistic updates |
| **Error Tracking** | Sentry | Production monitoring, performance tracking, user context |
| **Dev Debugging** | Reactotron | API logging, navigation tracking, AsyncStorage monitoring |
| **Authentication** | Expo AuthSession + Backend API | Multi-provider support (Google, email, phone), unified session |
| **Deep Linking** | Expo Linking | Universal links for invitations and password reset |
| **Secure Storage** | Expo SecureStore | Encrypted token storage (iOS Keychain, Android Keystore) |
| **Local Caching** | AsyncStorage | Profile cache, organization context, offline data |
| **Navigation** | Expo Router v6 | File-based routing, type-safe navigation, nested layouts |
| **Animations** | react-native-reanimated | 60fps animations on UI thread, spring physics |
| **Images** | expo-image | Optimized loading, caching, blurhash placeholders |
| **Lists** | FlatList / FlashList | Virtualized lists for performance (FlashList for 60fps) |

---

## Implementation Order

Based on dependencies and constitution principles (Component-First, No Duplication):

1. **Foundation Setup** (Day 1):
   - Sentry initialization in app/_layout.tsx
   - Reactotron setup (dev only)
   - TanStack Query client with AsyncStorage persister
   - React Native Paper theme configuration
   - Axios client with interceptors (Sentry + Reactotron)

2. **Shared Components** (Day 2-3):
   - UI primitives (Button, TextInput, Card, Avatar, Badge)
   - Bottom sheet component with reanimated
   - Error boundary with Sentry integration
   - Loading indicators and empty states

3. **Authentication** (Day 4-6):
   - Session manager with SecureStore
   - Auth API client with TanStack Query hooks
   - Google OAuth integration
   - Phone/OTP flow
   - Auth screens (sign in, sign up, OTP, password reset)
   - Auth guard for protected routes

4. **Core Features** (Day 7-14):
   - Dashboard with adaptive layouts
   - Profile management
   - Organization CRUD
   - Organization switcher
   - Team management
   - Invitation system with deep links

5. **Polish & Testing** (Day 15-18):
   - Offline support validation
   - Performance optimization (memoization, list virtualization)
   - Error handling and edge cases
   - Accessibility improvements
   - Constitution compliance verification

---

## Open Questions & Future Considerations

### Resolved:
- ✅ UI component library choice: React Native Paper
- ✅ State management strategy: TanStack Query for server state
- ✅ Observability tooling: Sentry + Reactotron
- ✅ Authentication approach: Multi-provider with unified session
- ✅ Deep linking implementation: Expo Linking with universal links

### For Future Phases:
- **Biometric Authentication**: Implement Face ID/Touch ID after basic auth is stable
- **Certificate Pinning**: Add SSL pinning for enhanced security in production
- **Push Notifications**: Integrate Firebase Cloud Messaging for real-time updates
- **Internationalization (i18n)**: Add multi-language support using expo-localization + i18next
- **Analytics**: Add Amplitude or Mixpanel for product analytics (separate from Sentry)
- **Error Recovery**: Implement automatic retry strategies for failed mutations
- **Performance Monitoring**: Fine-tune Sentry performance monitoring sample rates for production

---

## Constitution Compliance Verification

| Principle | Status | Evidence |
|-----------|--------|----------|
| **Component-First** | ✅ Compliant | All features built with atomic components (ui/, auth/, dashboard/, etc.) |
| **No Duplication** | ✅ Compliant | Auth logic in hooks, API in services/, validation in utils/ |
| **Naming Conventions** | ✅ Compliant | kebab-case files, PascalCase components, camelCase hooks |
| **Observability** | ✅ Compliant | Sentry everywhere (errors, performance, breadcrumbs), Reactotron for dev |
| **Performance** | ✅ Compliant | FlatList for lists, expo-image, reanimated for 60fps, memoization |

---

**Next Steps**: Proceed to Phase 1 (Design) - Generate data-model.md and API contracts/
