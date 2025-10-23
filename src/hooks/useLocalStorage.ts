import { useState, useEffect, useCallback } from 'react';

// Type for the setter function
type SetStateAction<T> = T | ((prev: T) => T);

/**
 * useLocalStorage - A hook to persist state in localStorage
 *
 * @param key - The storage key
 * @param defaultValue - The default value if no stored value exists
 * @returns [value, setValue] - State tuple matching useState signature
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: SetStateAction<T>) => void] {
  // Initialize state with value from localStorage or default
  const [state, setState] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      try {
        return JSON.parse(stored) as T;
      } catch (error) {
        console.warn(`[useLocalStorage] Failed to parse localStorage for key "${key}":`, error);
        // If parsing fails, store the raw string value instead
        return stored as unknown as T;
      }
    }
    return defaultValue;
  });

  // Sync to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`[useLocalStorage] Failed to save to localStorage for key "${key}":`, error);
    }
  }, [key, state]);

  // Custom setter that handles both direct values and updater functions
  const setValue = useCallback((value: SetStateAction<T>) => {
    setState((prev) => {
      const newValue = value instanceof Function ? value(prev) : value;
      try {
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.error(`[useLocalStorage] Failed to save to localStorage for key "${key}":`, error);
      }
      return newValue;
    });
  }, [key]);

  return [state, setValue];
}

export default useLocalStorage;