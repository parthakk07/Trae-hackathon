'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { DashboardStats, GitHubData, MoodEntry } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import styles from './Overview.module.css';

interface OverviewProps {
  stats: DashboardStats;
  githubData?: GitHubData;
  currentMood?: MoodEntry;
}

const blackPalette = [
  '#1f2328', '#32383e', '#454d57', '#5c636e', '#737b87', '#8c959f'
];

const activityData = [
  { day: 'Mon', hours: 6.5 },
  { day: 'Tue', hours: 8.2 },
  { day: 'Wed', hours: 7.1 },
  { day: 'Thu', hours: 9.0 },
  { day: 'Fri', hours: 5.5 },
  { day: 'Sat', hours: 3.2 },
  { day: 'Sun', hours: 2.8 },
];

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#1f2328'
};

export default function Overview({ stats, githubData, currentMood }: OverviewProps) {
  const focusPercentage = stats.focusScore;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (focusPercentage / 100) * circumference;

  const pieData = [
    { name: 'Deep Work', value: 45 },
    { name: 'Meetings', value: 20 },
    { name: 'Learning', value: 15 },
    { name: 'Break', value: 12 },
    { name: 'Other', value: 8 },
  ];

  return (
    <div className={styles.overview}>
      <div className={styles.heroSection}>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: '#8c959f', marginBottom: '4px' }}>Productive Time</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: '#1f2328' }}>
            {formatDuration(stats.productiveTimeToday)}
          </div>
          <div style={{ fontSize: '11px', color: '#8c959f', marginTop: '4px' }}>vs 6h average</div>
        </div>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: '#8c959f', marginBottom: '4px' }}>Focus Score</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: '#1f2328' }}>
            {stats.focusScore}%
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
          <div style={{ fontSize: '12px', color: '#8c959f', marginBottom: '4px' }}>Current Mood</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: '#1f2328' }}>
            {currentMood?.mood || 'Focused'}
          </div>
          <div style={{ fontSize: '11px', color: '#8c959f', marginTop: '4px' }}>From commits</div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Weekly Activity</div>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
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
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={blackPalette[index % blackPalette.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.chartLegend}>
            {pieData.map((item, index) => (
              <div key={item.name} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: blackPalette[index % blackPalette.length] }} />
                <span>{item.name}</span>
                <span className={styles.legendValue}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Focus Score</div>
          <div className={styles.focusContainer}>
            <div className={styles.focusRing}>
              <svg className={styles.focusRingSvg} width="140" height="140" viewBox="0 0 140 140">
                <circle className={styles.focusRingBg} cx="70" cy="70" r="54" />
                <circle className={styles.focusRingProgress} cx="70" cy="70" r="54" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
              </svg>
              <div className={styles.focusRingCenter}>
                <div className={styles.focusRingValue}>{focusPercentage}%</div>
              </div>
            </div>
            <div className={styles.focusStats}>
              <div className={styles.focusStat}>
                <div className={styles.focusStatValue}>{stats.tabSwitchesToday}</div>
                <div className={styles.focusStatLabel}>Tab Switches</div>
              </div>
              <div className={styles.focusStat}>
                <div className={styles.focusStatValue}>{formatDuration(stats.procrastinationTime)}</div>
                <div className={styles.focusStatLabel}>Distracted</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
