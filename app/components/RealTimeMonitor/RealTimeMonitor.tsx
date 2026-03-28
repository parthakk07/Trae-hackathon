'use client';

import { useState, useEffect, useCallback } from 'react';
import { useExtensionData, formatExtensionTime } from '@/lib/useExtensionData';
import styles from './RealTimeMonitor.module.css';

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

interface ActivityEntry {
  id: string;
  type: 'productive' | 'unproductive' | 'neutral';
  label: string;
  duration: number;
  timestamp: Date;
}

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

function classifyActivity(url: string | null, type: 'productive' | 'unproductive' | 'neutral'): { type: 'productive' | 'unproductive' | 'neutral'; label: string } {
  if (!url) return { type: 'neutral', label: 'No activity' };

  const hostname = url.toLowerCase();

  for (const site of PRODUCTIVE_SITES) {
    if (hostname.includes(site)) {
      return { type: 'productive', label: `Working on ${hostname}` };
    }
  }

  for (const site of UNPRODUCTIVE_SITES) {
    if (hostname.includes(site)) {
      return { type: 'unproductive', label: `Browsing ${hostname}` };
    }
  }

  if (type === 'productive') return { type: 'productive', label: `Productive: ${hostname}` };
  if (type === 'unproductive') return { type: 'unproductive', label: `Unproductive: ${hostname}` };
  return { type: 'neutral', label: hostname };
}

export default function RealTimeMonitor() {
  const { data, isConnected, lastSync, refresh } = useExtensionData(3000);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [currentActivity, setCurrentActivity] = useState<ActivityEntry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(3);
  const [lastErrorCheck, setLastErrorCheck] = useState<Date>(new Date());

  const checkConnection = useCallback(() => {
    if (!lastSync) {
      setConnectionStatus('disconnected');
      return;
    }

    const secondsSinceSync = (Date.now() - lastSync.getTime()) / 1000;

    if (secondsSinceSync > 30) {
      setConnectionStatus('disconnected');
      setErrorMessage('Extension not responding. Please check if the extension popup is open.');
    } else if (secondsSinceSync > 10) {
      setConnectionStatus('connecting');
    } else {
      setConnectionStatus('connected');
      setErrorMessage(null);
    }

    if (Date.now() - lastErrorCheck.getTime() > 60000) {
      setLastErrorCheck(new Date());
    }
  }, [lastSync, lastErrorCheck]);

  useEffect(() => {
    if (data) {
      const entry: ActivityEntry = {
        id: Date.now().toString(),
        type: data.productiveTime > data.unproductiveTime ? 'productive' : data.unproductiveTime > data.productiveTime ? 'unproductive' : 'neutral',
        label: currentActivity?.label || 'Activity',
        duration: Math.max(data.productiveTime, data.unproductiveTime),
        timestamp: new Date()
      };

      if (entry.duration > 0) {
        setCurrentActivity(entry);
        setActivities(prev => {
          const newActivities = [entry, ...prev].slice(0, 20);
          return newActivities;
        });
      }
    }
  }, [data]);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 2000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  const handleReconnect = () => {
    setConnectionStatus('connecting');
    setErrorMessage('Reconnecting...');
    refresh();
    setTimeout(() => {
      checkConnection();
    }, 3000);
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
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Error';
    }
  };

  const totalTime = data ? data.productiveTime + data.unproductiveTime + data.neutralTime : 0;
  const productivePercent = totalTime > 0 ? Math.round((data?.productiveTime || 0) / totalTime * 100) : 0;
  const unproductivePercent = totalTime > 0 ? Math.round((data?.unproductiveTime || 0) / totalTime * 100) : 0;

  return (
    <div className={styles.monitor}>
      <div className={styles.header}>
        <h3 className={styles.title}>Real-Time Monitor</h3>
        <div className={styles.statusContainer}>
          <span
            className={styles.statusDot}
            style={{ backgroundColor: getStatusColor() }}
          />
          <span className={styles.statusText}>{getStatusText()}</span>
        </div>
      </div>

      {errorMessage && connectionStatus !== 'connected' && (
        <div className={styles.errorAlert}>
          <span className={styles.errorIcon}>⚠️</span>
          <span className={styles.errorText}>{errorMessage}</span>
          {connectionStatus === 'disconnected' && (
            <button className={styles.reconnectButton} onClick={handleReconnect}>
              Reconnect
            </button>
          )}
        </div>
      )}

      <div className={styles.connectionInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Last Sync</span>
          <span className={styles.infoValue}>
            {lastSync ? `${Math.round((Date.now() - lastSync.getTime()) / 1000)}s ago` : 'Never'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Refresh</span>
          <span className={styles.infoValue}>{refreshInterval}s</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Source</span>
          <span className={styles.infoValue}>Chrome Extension</span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.productive}`}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>✅</span>
            <span className={styles.statLabel}>Productive</span>
          </div>
          <div className={styles.statValue}>
            {data ? formatExtensionTime(data.productiveTime) : '0m'}
          </div>
          <div className={styles.statBar}>
            <div
              className={styles.statBarFill}
              style={{
                width: `${productivePercent}%`,
                backgroundColor: '#1f2328'
              }}
            />
          </div>
          <div className={styles.statPercent}>{productivePercent}%</div>
        </div>

        <div className={`${styles.statCard} ${styles.unproductive}`}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>❌</span>
            <span className={styles.statLabel}>Unproductive</span>
          </div>
          <div className={styles.statValue}>
            {data ? formatExtensionTime(data.unproductiveTime) : '0m'}
          </div>
          <div className={styles.statBar}>
            <div
              className={styles.statBarFill}
              style={{
                width: `${unproductivePercent}%`,
                backgroundColor: '#656d76'
              }}
            />
          </div>
          <div className={styles.statPercent}>{unproductivePercent}%</div>
        </div>

        <div className={`${styles.statCard} ${styles.neutral}`}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>⚪</span>
            <span className={styles.statLabel}>Neutral</span>
          </div>
          <div className={styles.statValue}>
            {data ? formatExtensionTime(data.neutralTime) : '0m'}
          </div>
          <div className={styles.statBar}>
            <div
              className={styles.statBarFill}
              style={{
                width: `${100 - productivePercent - unproductivePercent}%`,
                backgroundColor: '#8c959f'
              }}
            />
          </div>
          <div className={styles.statPercent}>
            {totalTime > 0 ? 100 - productivePercent - unproductivePercent : 0}%
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.tabs}`}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>🔄</span>
            <span className={styles.statLabel}>Tab Switches</span>
          </div>
          <div className={styles.statValue}>
            {data?.tabSwitches || 0}
          </div>
          <div className={styles.statHint}>
            Total switches today
          </div>
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
                <span className={styles.activityDuration}>
                  {formatExtensionTime(activity.duration)}
                </span>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No activities recorded yet.</p>
              <p className={styles.emptyHint}>Start browsing to see your activities appear here.</p>
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
