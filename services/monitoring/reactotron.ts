import { queryClient } from '@/services/api/query-client';
import { clearSession } from '@/services/auth/session-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';
import Reactotron from 'reactotron-react-native';

// Always enable Reactotron in development mode
const ENABLE_REACTOTRON = __DEV__;

/**
 * Initialize Reactotron for development debugging
 * Only runs in development mode
 */
export const initializeReactotron = () => {
  if (!ENABLE_REACTOTRON) {
    console.log('[Reactotron] Disabled or not in development mode');
    return;
  }

  try {
    // For Android emulator, always use localhost (we set up adb reverse)
    // For iOS simulator, use the detected host
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    const scriptHostname = scriptURL?.split('://')[1]?.split(':')[0];
    
    // Force localhost for better compatibility
    const host = 'localhost';

    console.log('[Reactotron] Connecting to:', host);

    Reactotron.setAsyncStorageHandler?.(AsyncStorage)
      .configure({
        name: 'Streamlined Properties',
        host,
        port: 9090,
        onCommand: async (command) => {
          if (command.type === 'custom' && command.payload) {
            const { id } = command.payload;
            
            if (id === 'clearAuthSession') {
              try {
                await clearSession();
                await queryClient.clear();
                Reactotron.log?.('✅ Auth session and cache cleared successfully');
              } catch (error) {
                Reactotron.log?.('❌ Failed to clear session:', error);
              }
            } else if (id === 'clearAllStorage') {
              try {
                await AsyncStorage.clear();
                await clearSession();
                await queryClient.clear();
                Reactotron.log?.('✅ All storage cleared successfully');
              } catch (error) {
                Reactotron.log?.('❌ Failed to clear storage:', error);
              }
            } else if (id === 'viewAuthState') {
              try {
                const keys = await AsyncStorage.getAllKeys();
                const authKeys = keys.filter(key => 
                  key.includes('token') || 
                  key.includes('auth') || 
                  key.includes('session')
                );
                const values = await AsyncStorage.multiGet(authKeys);
                Reactotron.display?.({
                  name: 'Auth State',
                  preview: `Found ${authKeys.length} auth-related keys`,
                  value: values,
                  important: true,
                });
              } catch (error) {
                Reactotron.log?.('❌ Failed to get auth state:', error);
              }
            }
          }
        },
      })
      .useReactNative({
        asyncStorage: true,
        networking: {
          ignoreUrls: /symbolicate|logs/, // Ignore React Native internal requests
        },
        editor: false,
        errors: { veto: () => false },
        overlay: false,
      })
      .connect();

    // Log available commands
    Reactotron.log?.('📋 Available custom commands: clearAuthSession, clearAllStorage, viewAuthState');
    console.log('[Reactotron] Connected successfully to localhost:9090');
    console.log('[Reactotron] If not seeing connection:');
    console.log('[Reactotron]   1. Make sure Reactotron desktop app is running');
    console.log('[Reactotron]   2. For Android: Run "adb reverse tcp:9090 tcp:9090"');
    console.log('[Reactotron]   3. Reload the app');
  } catch (error) {
    console.error('[Reactotron] Failed to connect:', error);
  }
};

/**
 * Log messages to Reactotron console
 */
export const logToReactotron = (message: string, data?: any) => {
  if (ENABLE_REACTOTRON && Reactotron.log) {
    Reactotron.log(message, data);
  }
};

/**
 * Log API requests to Reactotron
 */
export const logApiToReactotron = (
  method: string,
  url: string,
  request?: any,
  response?: any,
  duration?: number
) => {
  if (ENABLE_REACTOTRON && Reactotron.display) {
    const isError = response?.status >= 400 || !response?.data;
    
    Reactotron.display({
      name: isError ? '❌ API Error' : '✅ API Request',
      preview: `${method} ${url}${duration ? ` (${duration}ms)` : ''}`,
      value: {
        method,
        url,
        duration: duration ? `${duration}ms` : undefined,
        request: request ? JSON.parse(JSON.stringify(request)) : undefined,
        response: response ? JSON.parse(JSON.stringify(response)) : undefined,
        status: response?.status,
        hasData: !!response?.data,
        dataKeys: response?.data ? Object.keys(response.data) : [],
      },
      important: isError,
    });
  }
};

/**
 * Log navigation events to Reactotron
 */
export const logNavigationToReactotron = (screenName: string, params?: any) => {
  if (ENABLE_REACTOTRON && Reactotron.display) {
    Reactotron.display({
      name: 'Navigation',
      preview: `Navigated to ${screenName}`,
      value: { screenName, params },
    });
  }
};

/**
 * Log AsyncStorage operations to Reactotron
 */
export const logStorageToReactotron = (
  operation: 'get' | 'set' | 'remove',
  key: string,
  value?: any
) => {
  if (ENABLE_REACTOTRON && Reactotron.display) {
    Reactotron.display({
      name: 'AsyncStorage',
      preview: `${operation.toUpperCase()} ${key}`,
      value: { operation, key, value },
    });
  }
};

/**
 * Log authentication flow to Reactotron
 */
export const logAuthFlowToReactotron = (step: string, data?: any) => {
  if (ENABLE_REACTOTRON && Reactotron.display) {
    Reactotron.display({
      name: 'Auth Flow',
      preview: step,
      value: data,
      important: true,
    });
  }
};

export default Reactotron;
