'use client';

import { MoodEntry } from '@/lib/types';
import styles from './MoodDetector.module.css';

interface MoodDetectorProps {
  currentMood?: MoodEntry;
  moodHistory?: MoodEntry[];
}

const moodDistribution = [
  { mood: 'focused', label: 'Focused', percent: 35 },
  { mood: 'energized', label: 'Energized', percent: 25 },
  { mood: 'contemplative', label: 'Contemplative', percent: 18 },
  { mood: 'fatigue', label: 'Fatigue', percent: 10 },
  { mood: 'frustrated', label: 'Frustrated', percent: 8 },
  { mood: 'celebrating', label: 'Celebrating', percent: 4 },
];

const recentCommits = [
  { message: 'Implement dark mode toggle', date: 'Today' },
  { message: 'Resolve memory leak in handler', date: 'Yesterday' },
  { message: 'Simplify API parsing', date: '2 days ago' },
  { message: 'Add user authentication', date: '3 days ago' },
  { message: 'Improve button states', date: '4 days ago' },
];

export default function MoodDetector({ currentMood, moodHistory }: MoodDetectorProps) {
  const displayMood = currentMood?.mood || 'focused';
  const displayConfidence = currentMood?.confidence || 72;

  return (
    <div className={styles.moodDetector}>
      <div className={styles.currentMood}>
        <div className={styles.moodTitle}>{displayMood}</div>
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
            {moodDistribution.map((mood) => (
              <div key={mood.mood} className={styles.moodItem}>
                <span className={styles.moodName}>{mood.label}</span>
                <span className={styles.moodPercent}>{mood.percent}%</span>
                <div className={styles.moodBar}>
                  <div className={styles.moodBarFill} style={{ width: `${mood.percent * 2}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.moodCard}>
          <div className={styles.cardTitle}>Recent Commits</div>
          <div className={styles.commitList}>
            {recentCommits.map((commit, index) => (
              <div key={index} className={styles.commitItem}>
                <div className={styles.commitMessage}>{commit.message}</div>
                <div className={styles.commitDate}>{commit.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.moodCard}>
          <div className={styles.cardTitle}>Mood Over Time</div>
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Weekly mood trend visualization
          </div>
        </div>
      </div>
    </div>
  );
}
