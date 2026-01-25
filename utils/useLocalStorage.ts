import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    // Get from local storage then parse it
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Save to local storage
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    };

    const removeValue = () => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
                setStoredValue(initialValue);
            }
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    };

    return [storedValue, setValue, removeValue] as const;
}
