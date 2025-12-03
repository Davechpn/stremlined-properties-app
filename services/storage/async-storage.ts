/**
 * AsyncStorage Wrapper
 * 
 * Provides persistent storage for non-sensitive data with Reactotron logging.
 * Used for caching dashboard data, user preferences, and organization context.
 */

import { logStorageToReactotron } from '@/services/monitoring/reactotron';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

/**
 * Store item in AsyncStorage
 */
export async function setItem<T>(key: string, value: T): Promise<boolean> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    
    logStorageToReactotron('set', key, value);
    
    return true;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { storage: 'async', operation: 'setItem' },
      extra: { key },
    });
    console.error(`Failed to store item with key "${key}":`, error);
    return false;
  }
}

/**
 * Retrieve item from AsyncStorage
 */
export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    
    if (jsonValue === null) {
      logStorageToReactotron('get', key, null);
      return null;
    }
    
    const value = JSON.parse(jsonValue) as T;
    logStorageToReactotron('get', key, value);
    
    return value;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { storage: 'async', operation: 'getItem' },
      extra: { key },
    });
    console.error(`Failed to retrieve item with key "${key}":`, error);
    return null;
  }
}

/**
 * Remove item from AsyncStorage
 */
export async function removeItem(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    logStorageToReactotron('remove', key);
    
    return true;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { storage: 'async', operation: 'removeItem' },
      extra: { key },
    });
    console.error(`Failed to remove item with key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all AsyncStorage data
 */
export async function clear(): Promise<boolean> {
  try {
    await AsyncStorage.clear();
    
    if (__DEV__) {
      console.log('[AsyncStorage] Cleared all data');
    }
    
    return true;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { storage: 'async', operation: 'clear' },
    });
    console.error('Failed to clear AsyncStorage:', error);
    return false;
  }
}

/**
 * Get all keys in AsyncStorage
 */
export async function getAllKeys(): Promise<readonly string[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { storage: 'async', operation: 'getAllKeys' },
    });
    console.error('Failed to get all keys from AsyncStorage:', error);
    return [];
  }
}

/**
 * Get multiple items from AsyncStorage
 */
export async function multiGet<T>(keys: string[]): Promise<Record<string, T | null>> {
  try {
    const results = await AsyncStorage.multiGet(keys);
    const data: Record<string, T | null> = {};
    
    results.forEach(([key, value]) => {
      if (value !== null) {
        try {
          data[key] = JSON.parse(value) as T;
        } catch {
          data[key] = null;
        }
      } else {
        data[key] = null;
      }
    });
    
    return data;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { storage: 'async', operation: 'multiGet' },
      extra: { keys },
    });
    console.error('Failed to get multiple items from AsyncStorage:', error);
    return {};
  }
}

/**
 * Remove multiple items from AsyncStorage
 */
export async function multiRemove(keys: string[]): Promise<boolean> {
  try {
    await AsyncStorage.multiRemove(keys);
    keys.forEach((key) => logStorageToReactotron('remove', key));
    
    return true;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { storage: 'async', operation: 'multiRemove' },
      extra: { keys },
    });
    console.error('Failed to remove multiple items from AsyncStorage:', error);
    return false;
  }
}
