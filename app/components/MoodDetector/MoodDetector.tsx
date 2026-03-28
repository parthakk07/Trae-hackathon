'use client';

import { MoodEntry, GitHubData } from '@/lib/types';
import styles from './MoodDetector.module.css';

interface MoodDetectorProps {
  currentMood?: MoodEntry;
  githubData?: GitHubData;
}

const moodLabels: Record<string, string> = {
  energized: 'Energized',
  focused: 'Focused',
  contemplative: 'Contemplative',
  frustrated: 'Frustrated',
  fatigue: 'Fatigue',
  celebrating: 'Celebrating'
};

export default function MoodDetector({ currentMood, githubData }: MoodDetectorProps) {
  const displayMood = currentMood?.mood || 'focused';
  const displayConfidence = currentMood?.confidence || 72;

  const recentCommits = githubData?.recentCommits || [];
  const commitsWithMood = recentCommits.slice(0, 10);

  const moodCounts: Record<string, number> = {};
  commitsWithMood.forEach(commit => {
    moodCounts[commit.mood] = (moodCounts[commit.mood] || 0) + 1;
  });

  const totalMoodCommits = Object.values(moodCounts).reduce((a, b) => a + b, 0);
  const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
    mood,
    label: moodLabels[mood] || mood,
    percent: totalMoodCommits > 0 ? Math.round((count / totalMoodCommits) * 100) : 0
  })).sort((a, b) => b.percent - a.percent);

  if (moodDistribution.length === 0) {
    moodDistribution.push(
      { mood: 'focused', label: 'Focused', percent: 35 },
      { mood: 'energized', label: 'Energized', percent: 25 },
      { mood: 'contemplative', label: 'Contemplative', percent: 18 },
      { mood: 'fatigue', label: 'Fatigue', percent: 10 },
      { mood: 'frustrated', label: 'Frustrated', percent: 8 },
      { mood: 'celebrating', label: 'Celebrating', percent: 4 }
    );
  }

  const formatCommitDate = (dateStr: string): string => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.moodDetector}>
      <div className={styles.currentMood}>
        <div className={styles.moodTitle}>{moodLabels[displayMood] || displayMood}</div>
        <div className={styles.moodConfidence}>{displayConfidence}% confidence from commit analysis</div>
        <div className={styles.moodMeter}>
          <div className={styles.meterTrack}>
            <div className={styles.meterFill} style={{ width: `${displayConfidence}%` }} />
          </div>
        </div>
      </div>

      <div className={styles.moodGrid}>
        <div className={styles.moodCard}>
          <div className={styles.cardTitle}>Mood Distribution</div>
          <div className={styles.moodList}>
            {moodDistribution.map((item) => (
              <div key={item.mood} className={styles.moodItem}>
                <span className={styles.moodName}>{item.label}</span>
                <span className={styles.moodPercent}>{item.percent}%</span>
                <div className={styles.moodBar}>
                  <div className={styles.moodBarFill} style={{ width: `${item.percent * 2}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.moodCard}>
          <div className={styles.cardTitle}>Recent Commits</div>
          <div className={styles.commitList}>
            {commitsWithMood.length > 0 ? (
              commitsWithMood.map((commit, index) => (
                <div key={index} className={styles.commitItem}>
                  <div className={styles.commitMessage}>{commit.message}</div>
                  <div className={styles.commitDate}>
                    {commit.date ? formatCommitDate(commit.date) : 'Unknown date'}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>No commit data available.</p>
                <p className={styles.emptyHint}>Connect GitHub to see your commit mood analysis.</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.moodCard}>
          <div className={styles.cardTitle}>Mood Insights</div>
          <div className={styles.insightsList}>
            {moodDistribution.slice(0, 3).map((item, index) => (
              <div key={item.mood} className={styles.insightItem}>
                <span className={styles.insightRank}>#{index + 1}</span>
                <span className={styles.insightMood}>{item.label}</span>
                <span className={styles.insightPercent}>{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
