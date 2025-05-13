/**
 * Utility functions for localStorage and sessionStorage
 */

/**
 * Storage types
 */
export enum StorageType {
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage'
}

/**
 * Get value from storage
 */
export function getItem<T>(key: string, storageType: StorageType = StorageType.LOCAL): T | null {
  try {
    const storage = window[storageType];
    const item = storage.getItem(key);
    
    if (item === null) {
      return null;
    }
    
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error getting item from ${storageType}:`, error);
    return null;
  }
}

/**
 * Set value in storage
 */
export function setItem<T>(key: string, value: T, storageType: StorageType = StorageType.LOCAL): void {
  try {
    const storage = window[storageType];
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item in ${storageType}:`, error);
  }
}

/**
 * Remove item from storage
 */
export function removeItem(key: string, storageType: StorageType = StorageType.LOCAL): void {
  try {
    const storage = window[storageType];
    storage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from ${storageType}:`, error);
  }
}

/**
 * Clear all items from storage
 */
export function clearStorage(storageType: StorageType = StorageType.LOCAL): void {
  try {
    const storage = window[storageType];
    storage.clear();
  } catch (error) {
    console.error(`Error clearing ${storageType}:`, error);
  }
}

/**
 * Store user preferences
 */
export function saveUserPreferences(preferences: Record<string, any>): void {
  setItem('userPreferences', preferences);
}

/**
 * Get user preferences
 */
export function getUserPreferences(): Record<string, any> | null {
  return getItem<Record<string, any>>('userPreferences');
}

/**
 * Save last visited route
 */
export function saveLastRoute(route: string): void {
  setItem('lastRoute', route);
}

/**
 * Get last visited route
 */
export function getLastRoute(): string | null {
  return getItem<string>('lastRoute');
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(storageType: StorageType): boolean {
  try {
    const storage = window[storageType];
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}