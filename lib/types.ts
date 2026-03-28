export interface MoodEntry {
  date: Date;
  mood: 'energized' | 'focused' | 'contemplative' | 'frustrated' | 'fatigue' | 'celebrating';
  confidence: number;
  trigger?: string;
}

export interface ProductivityEntry {
  id: string;
  timestamp: Date;
  category: 'deep-work' | 'meetings' | 'learning' | 'procrastination' | 'break';
  duration: number;
  source: 'extension' | 'manual';
  details?: string;
  url?: string;
  title?: string;
}

export interface FocusSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  completed: boolean;
  interruptions: number;
}

export interface WebUsageEntry {
  id: string;
  timestamp: Date;
  url: string;
  title: string;
  duration: number;
  category: 'productive' | 'neutral' | 'unproductive';
  tabSwitched: boolean;
}

export interface GitHubData {
  username: string;
  avatarUrl: string;
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  contributionsByDay: { date: string; count: number }[];
  commitsThisWeek: number;
  commitsThisMonth: number;
  mostProductiveDay: string;
  recentCommits: {
    message: string;
    date: string;
    repo: string;
    mood: MoodEntry['mood'];
  }[];
}

export interface DashboardStats {
  productiveTimeToday: number;
  productiveTimeWeek: number;
  focusScore: number;
  currentMood: MoodEntry['mood'];
  tabSwitchesToday: number;
  procrastinationTime: number;
  streakDays: number;
}

export interface TimeAnalysis {
  hourlyBreakdown: { hour: number; productivity: number }[];
  dailyBreakdown: { day: string; hours: number }[];
  weeklyComparison: { week: string; thisWeek: number; lastWeek: number }[];
  peakHour: number;
}
