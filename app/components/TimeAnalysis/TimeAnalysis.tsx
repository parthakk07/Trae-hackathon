'use client';

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getHourLabel } from '@/lib/utils';
import styles from './TimeAnalysis.module.css';

const hourlyData = [
  { hour: 0, productivity: 5 }, { hour: 1, productivity: 2 }, { hour: 2, productivity: 1 },
  { hour: 3, productivity: 0 }, { hour: 4, productivity: 1 }, { hour: 5, productivity: 3 },
  { hour: 6, productivity: 8 }, { hour: 7, productivity: 15 }, { hour: 8, productivity: 35 },
  { hour: 9, productivity: 55 }, { hour: 10, productivity: 75 }, { hour: 11, productivity: 80 },
  { hour: 12, productivity: 50 }, { hour: 13, productivity: 60 }, { hour: 14, productivity: 85 },
  { hour: 15, productivity: 78 }, { hour: 16, productivity: 65 }, { hour: 17, productivity: 55 },
  { hour: 18, productivity: 40 }, { hour: 19, productivity: 30 }, { hour: 20, productivity: 25 },
  { hour: 21, productivity: 20 }, { hour: 22, productivity: 12 }, { hour: 23, productivity: 6 },
];

const dailyData = [
  { day: 'Mon', hours: 7.5 }, { day: 'Tue', hours: 8.2 }, { day: 'Wed', hours: 6.8 },
  { day: 'Thu', hours: 9.1 }, { day: 'Fri', hours: 5.4 }, { day: 'Sat', hours: 3.2 }, { day: 'Sun', hours: 2.5 },
];

const weeklyTrend = [
  { week: 'Week 1', hours: 32.5 }, { week: 'Week 2', hours: 28.3 },
  { week: 'Week 3', hours: 35.8 }, { week: 'Week 4', hours: 31.2 },
];

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#1f2328'
};

export default function TimeAnalysis() {
  const peakHour = 14;

  return (
    <div className={styles.timeAnalysis}>
      <div className={styles.statsGrid}>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: '#8c959f', marginBottom: '4px' }}>Avg Daily</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: '#1f2328' }}>7.8h</div>
        </div>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: '#8c959f', marginBottom: '4px' }}>Peak Hour</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: '#1f2328' }}>{getHourLabel(peakHour)}</div>
        </div>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: '#8c959f', marginBottom: '4px' }}>This Week</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: '#1f2328' }}>31.2h</div>
        </div>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: '#8c959f', marginBottom: '4px' }}>Goal</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: '#1f2328' }}>68%</div>
        </div>
      </div>

      <div className={styles.chartGrid}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Hourly Pattern</div>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1f2328" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#1f2328" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#8c959f', fontSize: 10 }} tickFormatter={(h) => getHourLabel(h)} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c959f', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="productivity" stroke="#1f2328" strokeWidth={2} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Daily Breakdown</div>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8c959f', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c959f', fontSize: 10 }} tickFormatter={(v) => `${v}h`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="hours" fill="#1f2328" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Weekly Trend</div>
        <div className={styles.chart} style={{ height: '160px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyTrend}>
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#8c959f', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c959f', fontSize: 10 }} tickFormatter={(v) => `${v}h`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="hours" stroke="#1f2328" strokeWidth={2} dot={{ fill: '#1f2328', strokeWidth: 0, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.patternSection}>
        <div className={styles.patternCard}>
          <div className={styles.patternTitle}>Best Days</div>
          <div className={styles.dayBars}>
            {dailyData.map((day) => (
              <div key={day.day} className={styles.dayBar}>
                <div className={styles.bar} style={{ height: `${(day.hours / 10) * 60}px` }} />
                <span className={styles.dayLabel}>{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.patternCard}>
          <div className={styles.patternTitle}>Focus Distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Deep Work', value: 72 },
              { label: 'Light Tasks', value: 18 },
              { label: 'Breaks', value: 10 },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#656d76' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#1f2328' }}>{item.value}%</span>
                </div>
                <div style={{ height: '4px', background: '#d0d7de', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.value}%`, height: '100%', background: '#1f2328' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.patternCard}>
          <div className={styles.patternTitle}>Peak Hours</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { hour: '2 PM', score: 95 },
              { hour: '11 AM', score: 88 },
              { hour: '3 PM', score: 85 },
            ].map((item) => (
              <div key={item.hour} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#656d76', width: '50px' }}>{item.hour}</span>
                <div style={{ flex: 1, height: '4px', background: '#d0d7de', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.score}%`, height: '100%', background: '#1f2328' }} />
                </div>
                <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#1f2328' }}>{item.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
