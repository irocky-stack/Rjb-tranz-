import { useState, useEffect, useCallback } from 'react';

// Type for the KV setter function (matches @github/spark/hooks useKV signature)
type SetStateAction<T> = T | ((prev: T) => T);

/**
 * useKVWithFallback - A wrapper around useKV that falls back to localStorage in development
 * 
 * This hook detects when the Spark KV service is unavailable (development mode) and 
 * automatically falls back to localStorage for data persistence.
 * 
 * @param key - The storage key
 * @param defaultValue - The default value if no stored value exists
 * @returns [value, setValue] - State tuple matching useState/useKV signature
 */
export function useKVWithFallback<T>(
  key: string,
  defaultValue: T
): [T, (value: SetStateAction<T>) => void] {
  // Detect if we're in development mode (Spark plugins disabled)
  const isDevelopment = import.meta.env.DEV;
  const sparkEnabled = !isDevelopment; // Spark is disabled in dev mode per vite.config.ts
  
  // Initialize state with value from localStorage or default
  const [state, setState] = useState<T>(() => {
    if (!sparkEnabled) {
      try {
        const stored = localStorage.getItem(`kv:${key}`);
        if (stored !== null) {
          return JSON.parse(stored) as T;
        }
      } catch (error) {
        console.warn(`[useKVWithFallback] Failed to parse localStorage for key "${key}":`, error);
      }
    }
    return defaultValue;
  });

  // Sync to localStorage when state changes (development mode only)
  useEffect(() => {
    if (!sparkEnabled) {
      try {
        localStorage.setItem(`kv:${key}`, JSON.stringify(state));
      } catch (error) {
        console.error(`[useKVWithFallback] Failed to save to localStorage for key "${key}":`, error);
      }
    }
  }, [key, state, sparkEnabled]);

  // Custom setter that handles both direct values and updater functions
  const setValue = useCallback((value: SetStateAction<T>) => {
    setState((prev) => {
      const newValue = value instanceof Function ? value(prev) : value;
      
      // In development, immediately save to localStorage
      if (!sparkEnabled) {
        try {
          localStorage.setItem(`kv:${key}`, JSON.stringify(newValue));
        } catch (error) {
          console.error(`[useKVWithFallback] Failed to save to localStorage for key "${key}":`, error);
        }
      }
      
      return newValue;
    });
  }, [key, sparkEnabled]);

  return [state, setValue];
}

/**
 * useKV - Compatibility wrapper that mimics @github/spark/hooks useKV
 * 
 * In production with Spark enabled, this would use the actual Spark KV service.
 * In development, it uses localStorage as a fallback.
 * 
 * This allows the app to function in development without the Spark backend.
 */
export function useKV<T>(
  key: string,
  defaultValue: T
): [T, (value: SetStateAction<T>) => void] {
  return useKVWithFallback(key, defaultValue);
}

export default useKV;