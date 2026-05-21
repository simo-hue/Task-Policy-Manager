import { useCallback, useEffect, useRef, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const initialRef = useRef(initialValue);

  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') return initialRef.current;
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialRef.current;
    } catch (error) {
      console.error(error);
      return initialRef.current;
    }
  }, [key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(prev => {
      const next = typeof value === 'function' ? (value as (val: T) => T)(prev) : value;
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(next));
          window.dispatchEvent(new CustomEvent('local-storage', { detail: { key } }));
        }
      } catch (error) {
        console.error(error);
      }
      return next;
    });
  }, [key]);

  useEffect(() => {
    const handleStorageChange = (event: Event) => {
      if (event instanceof StorageEvent) {
        if (event.key !== null && event.key !== key) return;
      } else if (event instanceof CustomEvent && event.detail?.key && event.detail.key !== key) {
        return;
      }
      setStoredValue(readValue());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange as EventListener);
    };
  }, [key, readValue]);

  return [storedValue, setValue] as const;
}
