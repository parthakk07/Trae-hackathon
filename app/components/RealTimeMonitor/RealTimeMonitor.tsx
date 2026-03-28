'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { formatExtensionTime } from '@/lib/useExtensionData';
import styles from './RealTimeMonitor.module.css';

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

interface ActivityEntry {
  id: string;
  type: 'productive' | 'unproductive' | 'neutral';
  label: string;
  duration: number;
  timestamp: Date;
}

interface ExtensionStats {
  productiveTime: number;
  unproductiveTime: number;
  neutralTime: number;
  tabSwitches: number;
  lastUpdate: number;
  source?: string;
}

const STORAGE_KEY = 'devRealityData';
const POLL_INTERVAL = 2000;

const PRODUCTIVE_SITES = [
  'github.com', 'gitlab.com', 'bitbucket.org',
  'stackoverflow.com', 'stackblitz.com', 'codesandbox.io',
  'medium.com', 'dev.to', 'hashnode.com',
  'notion.so', 'figma.com',
  'aws.amazon.com', 'vercel.com', 'netlify.com',
  'reactjs.org', 'vuejs.org', 'angular.io',
  'typescriptlang.org', 'python.org'
];

const UNPRODUCTIVE_SITES = [
  'youtube.com', 'youtu.be',
  'twitter.com', 'x.com',
  'facebook.com', 'instagram.com',
  'reddit.com', 'netflix.com',
  'twitch.tv', 'discord.com',
  'spotify.com', 'tiktok.com'
];

function getDataFromStorage(): ExtensionStats | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to read from localStorage:', e);
  }
  return null;
}

function classifyHostname(hostname: string): 'productive' | 'unproductive' | 'neutral' {
  for (const site of PRODUCTIVE_SITES) {
    if (hostname.includes(site)) return 'productive';
  }
  for (const site of UNPRODUCTIVE_SITES) {
    if (hostname.includes(site)) return 'unproductive';
  }
  return 'neutral';
}

export default function RealTimeMonitor() {
  const [data, setData] = useState<ExtensionStats | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(() => {
    const stored = getDataFromStorage();
    if (stored) {
      setData(stored);
      setConnectionStatus('connected');
      setErrorMessage(null);
    } else {
      setConnectionStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    if (data && data.lastUpdate) {
      const entry: ActivityEntry = {
        id: `${data.lastUpdate}-${Math.random().toString(36).substr(2, 9)}`,
        type: data.productiveTime > data.unproductiveTime ? 'productive' : data.unproductiveTime > data.productiveTime ? 'unproductive' : 'neutral',
        label: currentUrl ? classifyHostname(new URL(currentUrl).hostname) : 'Activity',
        duration: Math.max(data.productiveTime, data.unproductiveTime),
        timestamp: new Date(data.lastUpdate)
      };

      if (entry.duration > 0) {
        setActivities(prev => {
          const exists = prev.some(a => a.id === entry.id);
          if (exists) return prev;
          return [entry, ...prev].slice(0, 20);
        });
      }
    }
  }, [data, currentUrl]);

  const handleReconnect = () => {
    loadData();
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#1f2328';
      case 'connecting': return '#656d76';
      case 'disconnected': return '#8c959f';
      case 'error': return '#cf222e';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'No Data';
      case 'error': return 'Error';
    }
  };

  const getDataSource = () => {
    if (!data) return 'No Data';
    if (data.source === 'extension') return 'Chrome Extension';
    return 'Extension';
  };

  const totalTime = data ? data.productiveTime + data.unproductiveTime + data.neutralTime : 0;
  const productivePercent = totalTime > 0 ? Math.round((data?.productiveTime || 0) / totalTime * 100) : 0;
  const unproductivePercent = totalTime > 0 ? Math.round((data?.unproductiveTime || 0) / totalTime * 100) : 0;
  const neutralPercent = totalTime > 0 ? 100 - productivePercent - unproductivePercent : 0;

  return (
    <div className={styles.monitor}>
      <div className={styles.header}>
        <h3 className={styles.title}>Real-Time Monitor</h3>
        <div className={styles.statusContainer}>
          <span className={styles.statusDot} style={{ backgroundColor: getStatusColor() }} />
          <span className={styles.statusText}>{getStatusText()}</span>
        </div>
      </div>

      {errorMessage && (
        <div className={styles.errorAlert}>
          <span className={styles.errorIcon}>!</span>
          <span className={styles.errorText}>{errorMessage}</span>
        </div>
      )}

      <div className={styles.connectionInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Data Source</span>
          <span className={styles.infoValue}>{getDataSource()}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Last Update</span>
          <span className={styles.infoValue}>
            {data?.lastUpdate ? `${Math.round((Date.now() - data.lastUpdate) / 1000)}s ago` : 'Never'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Refresh</span>
          <span className={styles.infoValue}>2s</span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.productive}`}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>[+]</span>
            <span className={styles.statLabel}>Productive</span>
          </div>
          <div className={styles.statValue}>
            {data ? formatExtensionTime(data.productiveTime) : '0m'}
          </div>
          <div className={styles.statBar}>
            <div className={styles.statBarFill} style={{ width: `${productivePercent}%`, backgroundColor: '#1f2328' }} />
          </div>
          <div className={styles.statPercent}>{productivePercent}%</div>
        </div>

        <div className={`${styles.statCard} ${styles.unproductive}`}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>[-]</span>
            <span className={styles.statLabel}>Unproductive</span>
          </div>
          <div className={styles.statValue}>
            {data ? formatExtensionTime(data.unproductiveTime) : '0m'}
          </div>
          <div className={styles.statBar}>
            <div className={styles.statBarFill} style={{ width: `${unproductivePercent}%`, backgroundColor: '#656d76' }} />
          </div>
          <div className={styles.statPercent}>{unproductivePercent}%</div>
        </div>

        <div className={`${styles.statCard} ${styles.neutral}`}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>[o]</span>
            <span className={styles.statLabel}>Neutral</span>
          </div>
          <div className={styles.statValue}>
            {data ? formatExtensionTime(data.neutralTime) : '0m'}
          </div>
          <div className={styles.statBar}>
            <div className={styles.statBarFill} style={{ width: `${neutralPercent}%`, backgroundColor: '#8c959f' }} />
          </div>
          <div className={styles.statPercent}>{neutralPercent}%</div>
        </div>

        <div className={`${styles.statCard} ${styles.tabs}`}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>[~]</span>
            <span className={styles.statLabel}>Tab Switches</span>
          </div>
          <div className={styles.statValue}>{data?.tabSwitches || 0}</div>
          <div className={styles.statHint}>Total switches today</div>
        </div>
      </div>

      <div className={styles.activitySection}>
        <h4 className={styles.activityTitle}>Recent Activities</h4>
        <div className={styles.activityList}>
          {activities.length > 0 ? (
            activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className={`${styles.activityItem} ${styles[activity.type]}`}>
                <span className={styles.activityDot} />
                <span className={styles.activityLabel}>{activity.label}</span>
                <span className={styles.activityDuration}>{formatExtensionTime(activity.duration)}</span>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No activities recorded yet.</p>
              <p className={styles.emptyHint}>Open the Chrome extension to start tracking.</p>
            </div>
          )}
        </div>
      </div>

      {connectionStatus === 'connected' && data && (
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot} />
          <span>Live tracking active</span>
        </div>
      )}
    </div>
  );
}
