import { useState, useEffect, useCallback, useRef } from 'react';

export interface StreamData {
  productiveTime: number;
  unproductiveTime: number;
  neutralTime: number;
  tabSwitches: number;
  lastUpdate: number;
  source: string;
}

export interface UseStreamDataOptions {
  enabled?: boolean;
  reconnectInterval?: number;
  maxRetries?: number;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export interface UseStreamDataReturn {
  data: StreamData | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  retryCount: number;
  lastUpdate: Date | null;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

const DEFAULT_OPTIONS: UseStreamDataOptions = {
  enabled: true,
  reconnectInterval: 3000,
  maxRetries: 5
};

export function useStreamData(options: UseStreamDataOptions = {}): UseStreamDataReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [data, setData] = useState<StreamData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    cleanup();
    if (mountedRef.current) {
      setIsConnected(false);
      setIsConnecting(false);
      opts.onDisconnect?.();
    }
  }, [cleanup, opts]);

  const handleStreamData = useCallback((event: MessageEvent) => {
    try {
      const parsed = JSON.parse(event.data);

      switch (parsed.type) {
        case 'connected':
          if (mountedRef.current) {
            setIsConnected(true);
            setIsConnecting(false);
            setError(null);
            setRetryCount(0);
            opts.onConnect?.();
          }
          break;

        case 'stats':
          if (parsed.data && mountedRef.current) {
            setData(parsed.data as StreamData);
            setLastUpdate(new Date(parsed.timestamp));
          }
          break;

        case 'heartbeat':
          if (mountedRef.current) {
            setLastUpdate(new Date(parsed.timestamp));
          }
          break;

        case 'error':
          if (mountedRef.current) {
            setError(new Error(parsed.message || 'Stream error'));
          }
          break;

        case 'complete':
          disconnect();
          break;
      }
    } catch (e) {
      console.error('[useStreamData] Failed to parse event:', e);
    }
  }, [disconnect, opts]);

  const handleStreamError = useCallback((e: Event) => {
    console.error('[useStreamData] EventSource error:', e);
    if (mountedRef.current) {
      setIsConnected(false);
      setError(new Error('Stream connection lost'));
      opts.onError?.(new Error('Stream connection lost'));
    }
  }, [opts]);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    if (!mountedRef.current || !opts.enabled) return;

    setIsConnecting(true);

    const eventSource = new EventSource('/api/stream-data');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      if (mountedRef.current) {
        console.log('[useStreamData] Connected to stream');
      }
    };

    eventSource.onmessage = handleStreamData;
    eventSource.onerror = handleStreamError;
  }, [handleStreamData, handleStreamError, opts.enabled]);

  const reconnect = useCallback(() => {
    if (retryCount >= (opts.maxRetries || 5)) {
      setError(new Error('Max retries reached'));
      return;
    }

    cleanup();
    setRetryCount(prev => prev + 1);
    setIsConnecting(true);

    reconnectTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current && opts.enabled) {
        connect();
      }
    }, opts.reconnectInterval || 3000);
  }, [cleanup, connect, opts.enabled, opts.maxRetries, opts.reconnectInterval, retryCount]);

  useEffect(() => {
    mountedRef.current = true;

    if (opts.enabled) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [opts.enabled]);

  useEffect(() => {
    if (isConnected && error) {
      setError(null);
    }
  }, [isConnected, error]);

  return {
    data,
    isConnected,
    isConnecting,
    error,
    retryCount,
    lastUpdate,
    connect,
    disconnect,
    reconnect
  };
}

export function useCachedStreamData(
  options: UseStreamDataOptions = {}
): { data: StreamData | null; updateFromCache: () => void } {
  const CACHE_KEY = 'devRealityStreamCache';
  const MAX_CACHE_AGE = 60000;

  const { data } = useStreamData(options);

  const cachedData = useCallback((): StreamData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsed = JSON.parse(cached);
      const age = Date.now() - parsed.timestamp;

      if (age > MAX_CACHE_AGE) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return parsed.data as StreamData;
    } catch {
      return null;
    }
  }, []);

  const updateFromCache = useCallback(() => {
    const cached = cachedData();
    if (cached) {
      return { data: cached };
    }
    return { data: null };
  }, [cachedData]);

  useEffect(() => {
    if (data) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('[useCachedStreamData] Failed to cache:', e);
      }
    }
  }, [data]);

  return {
    data,
    updateFromCache
  };
}
