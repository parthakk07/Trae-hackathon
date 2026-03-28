'use client';

import { useState } from 'react';
import { formatDuration } from '@/lib/utils';
import styles from './Productivity.module.css';

interface ProductivityProps {
  productiveTime?: number;
  tabSwitches?: number;
  procrastinationTime?: number;
}

const categories = [
  { id: 'deep-work', name: 'Deep Work', time: 180 },
  { id: 'meetings', name: 'Meetings', time: 65 },
  { id: 'learning', name: 'Learning', time: 45 },
  { id: 'procrastination', name: 'Procrastination', time: 30 },
  { id: 'break', name: 'Break', time: 40 },
];

const webUsage = [
  { title: 'GitHub', url: 'github.com', duration: 95, category: 'productive' },
  { title: 'Stack Overflow', url: 'stackoverflow.com', duration: 45, category: 'productive' },
  { title: 'YouTube', url: 'youtube.com', duration: 35, category: 'unproductive' },
  { title: 'Twitter', url: 'twitter.com', duration: 20, category: 'unproductive' },
  { title: 'Notion', url: 'notion.so', duration: 30, category: 'productive' },
  { title: 'Reddit', url: 'reddit.com', duration: 15, category: 'unproductive' },
];

export default function Productivity({
  productiveTime = 245,
  tabSwitches = 23,
  procrastinationTime = 45
}: ProductivityProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filteredUsage = activeFilter === 'All'
    ? webUsage
    : webUsage.filter(site => site.category === activeFilter.toLowerCase());

  return (
    <div className={styles.productivity}>
      <div className={styles.statsRow}>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Deep Work</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {formatDuration(productiveTime)}
          </div>
        </div>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Tab Switches</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {tabSwitches}
          </div>
        </div>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Productive Sites</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {webUsage.filter(w => w.category === 'productive').length}
          </div>
        </div>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Unproductive</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {formatDuration(procrastinationTime)}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Activity Categories</div>
        <div className={styles.categoryGrid}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`${styles.categoryCard} ${activeCategory === cat.id ? styles.categoryCardActive : ''}`}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            >
              <div className={styles.categoryName}>{cat.name}</div>
              <div className={styles.categoryTime}>{formatDuration(cat.time)}</div>
            </div>
          ))}
        </div>

        <div className={styles.sectionTitle} style={{ marginTop: '24px' }}>Tab Analysis</div>
        <div className={styles.tabStats}>
          <div className={styles.tabStat}>
            <div className={styles.tabStatValue}>{tabSwitches}</div>
            <div className={styles.tabStatLabel}>Total Tab Switches</div>
          </div>
          <div className={styles.tabStat}>
            <div className={styles.tabStatValue}>{Math.max(0, Math.round((8 - tabSwitches / 4)))}</div>
            <div className={styles.tabStatLabel}>Focus Score</div>
          </div>
          <div className={styles.tabStat}>
            <div className={styles.tabStatValue}>{tabSwitches > 30 ? 'Distracted' : 'Focused'}</div>
            <div className={styles.tabStatLabel}>Status</div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span>Web Usage</span>
          <div className={styles.filterButtons}>
            {['All', 'Productive', 'Unproductive'].map(filter => (
              <button
                key={filter}
                className={`${styles.filterBtn} ${activeFilter === filter ? styles.filterBtnActive : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.usageList}>
          {filteredUsage.map((site, index) => (
            <div key={index} className={styles.usageItem}>
              <div className={styles.usageInfo}>
                <div className={styles.usageTitle}>{site.title}</div>
                <div className={styles.usageUrl}>{site.url}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={styles.usageDuration}>{formatDuration(site.duration)}</div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: site.category === 'productive' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)',
                  color: 'var(--text-secondary)'
                }}>
                  {site.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
