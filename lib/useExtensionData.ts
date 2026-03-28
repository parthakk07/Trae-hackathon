import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'devRealityData';

interface ExtensionData {
  productiveTime: number;
  unproductiveTime: number;
  neutralTime: number;
  tabSwitches: number;
  lastUpdate: number;
  source: string;
}

interface UseExtensionDataReturn {
  data: ExtensionData | null;
  isConnected: boolean;
  lastSync: Date | null;
  refresh: () => void;
}

export function useExtensionData(pollIntervalMs: number = 5000): UseExtensionDataReturn {
  const [data, setData] = useState<ExtensionData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const refresh = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ExtensionData = JSON.parse(stored);
        setData(parsed);
        setIsConnected(parsed.source === 'extension');
        setLastSync(new Date());
      } else {
        setData(null);
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error reading extension data:', error);
      setData(null);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const intervalId = setInterval(refresh, pollIntervalMs);

    return () => clearInterval(intervalId);
  }, [pollIntervalMs, refresh]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        refresh();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refresh]);

  return { data, isConnected, lastSync, refresh };
}

export function formatExtensionTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage: (extensionId: string, message: object, callback?: (response: unknown) => void) => void;
        lastError?: string;
      };
    };
  }
}

export async function isExtensionInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.chrome?.runtime) {
      resolve(false);
      return;
    }

    window.chrome.runtime.sendMessage('dev-reality-extension', { action: 'ping' }, (response) => {
      resolve(window.chrome?.runtime?.lastError === undefined);
    });

    setTimeout(() => resolve(false), 1000);
  });
}

export async function requestExtensionData(): Promise<ExtensionData | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.chrome?.runtime) {
      resolve(null);
      return;
    }

    window.chrome.runtime.sendMessage('dev-reality-extension', { action: 'getData' }, (response) => {
      if (window.chrome?.runtime?.lastError) {
        resolve(null);
        return;
      }
      const res = response as { sharedData?: ExtensionData };
      if (res && res.sharedData) {
        resolve(res.sharedData);
      } else {
        resolve(null);
      }
    });

    setTimeout(() => resolve(null), 5000);
  });
}
