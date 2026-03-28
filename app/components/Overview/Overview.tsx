'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { DashboardStats, GitHubData, MoodEntry } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import { formatExtensionTime } from '@/lib/useExtensionData';
import styles from './Overview.module.css';
import RealTimeMonitor from '@/app/components/RealTimeMonitor/RealTimeMonitor';

interface OverviewProps {
  stats: DashboardStats;
  githubData?: GitHubData;
  currentMood?: MoodEntry;
}

const STORAGE_KEY = 'devRealityData';

interface ExtensionStats {
  productiveTime: number;
  unproductiveTime: number;
  neutralTime: number;
  tabSwitches: number;
  lastUpdate: number;
  source?: string;
}

const blackPalette = [
  '#1f2328', '#32383e', '#454d57', '#5c636e', '#737b87', '#8c959f'
];

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#1f2328'
};

function getExtensionData(): ExtensionStats | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to read extension data:', e);
  }
  return null;
}

export default function Overview({ stats, githubData, currentMood }: OverviewProps) {
  const [extensionStats, setExtensionStats] = useState<ExtensionStats | null>(null);

  useEffect(() => {
    const loadExtensionData = () => {
      const data = getExtensionData();
      setExtensionStats(data);
    };

    loadExtensionData();
    const interval = setInterval(loadExtensionData, 2000);
    return () => clearInterval(interval);
  }, []);

  const productiveTime = extensionStats?.productiveTime ?? stats.productiveTimeToday;
  const tabSwitches = extensionStats?.tabSwitches ?? stats.tabSwitchesToday;

  const focusPercentage = extensionStats
    ? Math.max(0, 100 - (tabSwitches * 2))
    : stats.focusScore;

  const productiveHours = Math.floor(productiveTime / 60);
  const productiveMins = productiveTime % 60;
  const productiveDisplay = productiveHours > 0
    ? `${productiveHours}h ${productiveMins}m`
    : `${productiveTime}m`;

  return (
    <div className={styles.overview}>
      <div className={styles.heroSection}>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: '#8c959f', marginBottom: '4px' }}>Productive Time</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: '#1f2328' }}>
            {extensionStats ? productiveDisplay : formatDuration(stats.productiveTimeToday)}
          </div>
          <div style={{ fontSize: '11px', color: '#8c959f', marginTop: '4px' }}>
            {extensionStats ? 'From extension' : 'vs 6h average'}
          </div>
        </div>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: '#8c959f', marginBottom: '4px' }}>Focus Score</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: '#1f2328' }}>
            {Math.min(100, Math.max(0, focusPercentage))}%
          </div>
          <div style={{ fontSize: '11px', color: '#8c959f', marginTop: '4px' }}>Based on tab switches</div>
        </div>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: '#8c959f', marginBottom: '4px' }}>Day Streak</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: '#1f2328' }}>
            {githubData?.currentStreak || stats.streakDays}
          </div>
          <div style={{ fontSize: '11px', color: '#8c959f', marginTop: '4px' }}>
            {githubData ? `Longest: ${githubData.longestStreak}` : 'Keep it up'}
          </div>
        </div>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: '#8c959f', marginBottom: '4px' }}>Tab Switches</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: '#1f2328' }}>
            {tabSwitches}
          </div>
          <div style={{ fontSize: '11px', color: '#8c959f', marginTop: '4px' }}>
            {extensionStats ? 'From extension' : 'Today'}
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Weekly Activity</div>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { day: 'Mon', hours: 6.5 },
                { day: 'Tue', hours: 8.2 },
                { day: 'Wed', hours: 7.1 },
                { day: 'Thu', hours: 9.0 },
                { day: 'Fri', hours: 5.5 },
                { day: 'Sat', hours: 3.2 },
                { day: 'Sun', hours: 2.8 },
              ]}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8c959f', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c959f', fontSize: 11 }} tickFormatter={(v) => `${v}h`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} hours`, 'Activity']} />
                <Bar dataKey="hours" fill="#1f2328" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Current Mood</div>
          <div className={styles.moodDisplay}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '36px', fontWeight: '600', color: '#1f2328' }}>
              {currentMood?.mood || 'Focused'}
            </div>
            <div className={styles.moodLabel}>Coding Mood</div>
            <div className={styles.moodConfidence}>
              {currentMood ? `${Math.round(currentMood.confidence)}% confidence` : '72% confidence'}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.productivityBreakdown}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Time Distribution</div>
          <div className={styles.pieChart}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Productive', value: extensionStats?.productiveTime ?? 45 },
                    { name: 'Unproductive', value: extensionStats?.unproductiveTime ?? 20 },
                    { name: 'Neutral', value: extensionStats?.neutralTime ?? 15 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {[
                    { name: 'Productive', value: extensionStats?.productiveTime ?? 45 },
                    { name: 'Unproductive', value: extensionStats?.unproductiveTime ?? 20 },
                    { name: 'Neutral', value: extensionStats?.neutralTime ?? 15 },
                  ].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={blackPalette[index % blackPalette.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.chartLegend}>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: blackPalette[0] }} />
              <span>Productive</span>
              <span className={styles.legendValue}>{extensionStats ? formatExtensionTime(extensionStats.productiveTime) : '3h 45m'}</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: blackPalette[1] }} />
              <span>Unproductive</span>
              <span className={styles.legendValue}>{extensionStats ? formatExtensionTime(extensionStats.unproductiveTime) : '1h 20m'}</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: blackPalette[2] }} />
              <span>Neutral</span>
              <span className={styles.legendValue}>{extensionStats ? formatExtensionTime(extensionStats.neutralTime) : '1h 15m'}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Focus Score</div>
          <div className={styles.focusContainer}>
            <div className={styles.focusRing}>
              <svg className={styles.focusRingSvg} width="140" height="140" viewBox="0 0 140 140">
                <circle className={styles.focusRingBg} cx="70" cy="70" r="54" />
                <circle
                  className={styles.focusRingProgress}
                  cx="70"
                  cy="70"
                  r="54"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 - (focusPercentage / 100) * 2 * Math.PI * 54}
                />
              </svg>
              <div className={styles.focusRingCenter}>
                <div className={styles.focusRingValue}>{Math.min(100, Math.max(0, focusPercentage))}%</div>
              </div>
            </div>
            <div className={styles.focusStats}>
              <div className={styles.focusStat}>
                <div className={styles.focusStatValue}>{tabSwitches}</div>
                <div className={styles.focusStatLabel}>Tab Switches</div>
              </div>
              <div className={styles.focusStat}>
                <div className={styles.focusStatValue}>{extensionStats ? formatExtensionTime(extensionStats.unproductiveTime) : formatDuration(stats.procrastinationTime)}</div>
                <div className={styles.focusStatLabel}>Distracted</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <RealTimeMonitor />
      </div>
    </div>
  );
}
