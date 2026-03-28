'use client';

import { GitHubData, MoodEntry } from '@/lib/types';
import styles from './GitHubGrowth.module.css';

interface GitHubGrowthProps {
  data?: GitHubData;
}

const languages = [
  { name: 'TypeScript', percent: 45 },
  { name: 'Python', percent: 28 },
  { name: 'Rust', percent: 15 },
  { name: 'Go', percent: 8 },
  { name: 'Other', percent: 4 },
];

const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function getCellLevel(count: number): string {
  if (count === 0) return styles.cellLevel0;
  if (count <= 2) return styles.cellLevel1;
  if (count <= 5) return styles.cellLevel2;
  if (count <= 9) return styles.cellLevel3;
  return styles.cellLevel4;
}

export default function GitHubGrowth({ data }: GitHubGrowthProps) {
  if (!data) {
    return (
      <div className={styles.githubGrowth}>
        <div className={styles.heroStats}>
          <div className={styles.section}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Streak</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>0</div>
          </div>
          <div className={styles.section}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>This Week</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>0</div>
          </div>
          <div className={styles.section}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>This Month</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>0</div>
          </div>
          <div className={styles.section}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>0</div>
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Connect GitHub to view contributions</div>
        </div>
      </div>
    );
  }

  const contributionsMatrix: (number | null)[][] = [];
  const weeks = 53;
  const daysPerWeek = 7;

  for (let w = 0; w < weeks; w++) {
    contributionsMatrix[w] = [];
    for (let d = 0; d < daysPerWeek; d++) {
      const dayIndex = w * 7 + d;
      if (dayIndex < data.contributionsByDay.length) {
        contributionsMatrix[w][d] = data.contributionsByDay[dayIndex]?.count || 0;
      } else {
        contributionsMatrix[w][d] = null;
      }
    }
  }

  return (
    <div className={styles.githubGrowth}>
      <div className={styles.heroStats}>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Current Streak</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {data.currentStreak}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>days</div>
        </div>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>This Week</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {data.commitsThisWeek}
          </div>
        </div>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>This Month</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {data.commitsThisMonth}
          </div>
        </div>
        <div className={styles.section}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {data.totalContributions}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{data.totalContributions} contributions in the last year</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className={styles.dayLabels}>
            {dayLabels.map((label, i) => (
              <div key={i} style={{ height: '10px', display: 'flex', alignItems: 'center' }}>{label}</div>
            ))}
          </div>
          <div className={styles.contributionGraph}>
            {contributionsMatrix.map((week, weekIndex) =>
              week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`${styles.contributionCell} ${day !== null ? getCellLevel(day) : ''}`}
                  title={day !== null ? `${day} contributions` : ''}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className={styles.commitsSection}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Recent Commits</div>
          <div className={styles.commitList}>
            {data.recentCommits.slice(0, 6).map((commit, index) => (
              <div key={index} className={styles.commitItem}>
                <div style={{ flex: 1 }}>
                  <div className={styles.commitMessage}>{commit.message}</div>
                  <div className={styles.commitMeta}>{commit.repo} · {commit.date}</div>
                </div>
                <div className={styles.commitMood}>{commit.mood}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Languages</div>
          <div className={styles.languageBars}>
            {languages.map((lang) => (
              <div key={lang.name} className={styles.languageItem}>
                <span className={styles.languageName}>{lang.name}</span>
                <div className={styles.languageBar}>
                  <div className={styles.languageFill} style={{ width: `${lang.percent}%` }} />
                </div>
                <span className={styles.languagePercent}>{lang.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
