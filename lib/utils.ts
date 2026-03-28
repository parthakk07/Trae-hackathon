import { MoodEntry, ProductivityEntry, TimeAnalysis, GitHubData } from './types';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function getHourLabel(hour: number): string {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

const moodKeywords: Record<string, string[]> = {
  energized: ['awesome', 'amazing', 'great', 'love', 'excited', 'fantastic', 'brilliant', 'perfect'],
  focused: ['fix', 'refactor', 'implement', 'complete', 'finish', 'done', 'working', 'resolved', 'optimize'],
  contemplative: ['思考', 'consider', 'maybe', 'might', 'could', 'perhaps', 'updating', 'reviewing'],
  frustrated: ['fix', 'bug', 'error', 'issue', 'problem', 'broken', 'fail', 'stuck', 'annoying', 'ugh'],
  fatigue: ['简单', 'easy', 'quick', 'simple', 'minor', 'tiny', 'small', 'tweak'],
  celebrating: ['🎉', 'celebrate', 'milestone', 'release', 'launch', 'published', 'deployed']
};

export function detectMoodFromCommit(message: string): { mood: MoodEntry['mood']; confidence: number } {
  const lowerMessage = message.toLowerCase();
  let bestMood: MoodEntry['mood'] = 'focused';
  let highestScore = 0;
  let totalMatches = 0;

  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        score++;
        totalMatches++;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMood = mood as MoodEntry['mood'];
    }
  }

  const confidence = totalMatches > 0 ? Math.min(95, 40 + (totalMatches * 15)) : 50;
  return { mood: bestMood, confidence };
}

export function categorizeWebsite(url: string): 'productive' | 'neutral' | 'unproductive' {
  const productive = ['github.com', 'stackoverflow.com', 'docs.', 'developer.', 'api.', 'medium.com', 'dev.to', 'gitlab.com', 'bitbucket.org', 'notion.so', 'figma.com', 'aws.amazon.com', 'vercel.com', 'netlify.com'];
  const unproductive = ['youtube.com', 'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'tiktok.com', 'reddit.com', '9gag.com', 'netflix.com', 'twitch.tv', 'discord.com'];

  for (const site of productive) {
    if (url.includes(site)) return 'productive';
  }
  for (const site of unproductive) {
    if (url.includes(site)) return 'unproductive';
  }
  return 'neutral';
}

export function getMoodEmoji(mood: MoodEntry['mood']): string {
  const emojis: Record<MoodEntry['mood'], string> = {
    energized: '🚀',
    focused: '💪',
    contemplative: '🤔',
    frustrated: '😤',
    fatigue: '😴',
    celebrating: '🎉'
  };
  return emojis[mood];
}

export function getMoodLabel(mood: MoodEntry['mood']): string {
  const labels: Record<MoodEntry['mood'], string> = {
    energized: 'Energized',
    focused: 'Focused',
    contemplative: 'Contemplative',
    frustrated: 'Frustrated',
    fatigue: 'Fatigue',
    celebrating: 'Celebrating'
  };
  return labels[mood];
}

export function generateMockGitHubData(username: string): GitHubData {
  const today = new Date();
  const contributionsByDay = [];
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const count = Math.random() > 0.3 ? Math.floor(Math.random() * 15) + 1 : 0;
    contributionsByDay.push({ date: date.toISOString().split('T')[0], count });

    if (count > 0) {
      tempStreak++;
      if (i <= 7) currentStreak = tempStreak;
    } else {
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      tempStreak = 0;
    }
  }
  if (tempStreak > longestStreak) longestStreak = tempStreak;

  const commitMessages = [
    'feat: add user authentication flow',
    'fix: resolve memory leak in data handler',
    'refactor: simplify API response parsing',
    'docs: update README with new features',
    'fix: handle edge case in form validation',
    'feat: implement dark mode toggle',
    'style: improve button hover states',
    'perf: optimize database queries',
    'test: add unit tests for auth module',
    'fix: correct typo in error message'
  ];

  const recentCommits = Array.from({ length: 10 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const moodResult = detectMoodFromCommit(commitMessages[i % commitMessages.length]);
    return {
      message: commitMessages[i % commitMessages.length],
      date: date.toISOString().split('T')[0],
      repo: 'dev-reality/app',
      mood: moodResult.mood
    };
  });

  return {
    username,
    avatarUrl: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 1000000)}`,
    totalContributions: contributionsByDay.reduce((sum, d) => sum + d.count, 0),
    currentStreak,
    longestStreak,
    contributionsByDay,
    commitsThisWeek: contributionsByDay.slice(-7).reduce((sum, d) => sum + d.count, 0),
    commitsThisMonth: contributionsByDay.slice(-30).reduce((sum, d) => sum + d.count, 0),
    mostProductiveDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][Math.floor(Math.random() * 5)],
    recentCommits
  };
}
