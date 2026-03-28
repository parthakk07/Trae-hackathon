import { GitHubData, MoodEntry } from './types';
import { detectMoodFromCommit } from './utils';

const GITHUB_API_REST = 'https://api.github.com';

const RATE_LIMIT_INFO = {
  authenticated: { perHour: 5000, description: '5,000 requests/hour with token' },
  unauthenticated: { perHour: 60, description: '60 requests/hour without token' }
};

export interface GitHubError {
  type: 'rate_limit' | 'invalid_token' | 'invalid_username' | 'network_error' | 'unknown';
  message: string;
}

interface GitHubApiResponse<T> {
  success: boolean;
  data?: T;
  error?: GitHubError;
}

async function handleApiResponse<T>(response: Response): Promise<GitHubApiResponse<T>> {
  if (response.status === 403) {
    const retryAfter = response.headers.get('X-RateLimit-Remaining');
    if (retryAfter === '0') {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : new Date();
      return {
        success: false,
        error: {
          type: 'rate_limit',
          message: `GitHub API rate limit exceeded. Reset at ${resetDate.toLocaleTimeString()}. Consider using a personal access token for higher limits.`
        }
      };
    }
    return {
      success: false,
      error: {
        type: 'invalid_token',
        message: 'Invalid or expired token. Please check your personal access token.'
      }
    };
  }

  if (response.status === 404) {
    return {
      success: false,
      error: {
        type: 'invalid_username',
        message: 'GitHub user not found. Please check the username and try again.'
      }
    };
  }

  if (response.status === 401) {
    return {
      success: false,
      error: {
        type: 'invalid_token',
        message: 'Authentication failed. Please check your personal access token.'
      }
    };
  }

  if (!response.ok) {
    return {
      success: false,
      error: {
        type: 'unknown',
        message: `GitHub API error: ${response.status} ${response.statusText}`
      }
    };
  }

  const data = await response.json();
  return { success: true, data };
}

export async function fetchGitHubData(
  token: string | undefined,
  username: string,
  onError?: (error: GitHubError) => void
): Promise<GitHubData | null> {
  if (!username || username.trim() === '') {
    const error: GitHubError = { type: 'invalid_username', message: 'Please enter a GitHub username.' };
    onError?.(error);
    return null;
  }

  const isAuthenticated = token && token.trim() !== '';
  console.log(`Fetching GitHub data for ${username} (${isAuthenticated ? 'authenticated' : 'unauthenticated'})`);

  if (isAuthenticated) {
    console.log(`Using token: ${token.substring(0, 4)}...${token.substring(token.length - 4)}`);
  }

  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json'
    };
    if (isAuthenticated) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const userResponse = await fetch(`${GITHUB_API_REST}/users/${username}`, { headers });
    const userResult = await handleApiResponse<any>(userResponse);

    if (!userResult.success || !userResult.data) {
      const error = userResult.error || { type: 'unknown', message: 'Failed to fetch user data' };
      onError?.(error);
      return null;
    }

    const userData = userResult.data;
    console.log(`Found user: ${userData.login}, avatar: ${userData.avatar_url}`);

    const eventsResponse = await fetch(
      `${GITHUB_API_REST}/users/${username}/events?per_page=100`,
      { headers }
    );
    const eventsData = await eventsResponse.json().catch(() => []);

    const contributionsByDay: { date: string; count: number }[] = [];
    const contributionCounts: Record<string, number> = {};

    (eventsData as any[]).forEach((event: { type: string; created_at: string }) => {
      if (['PushEvent', 'CreateEvent', 'PullRequestEvent', 'IssueCommentEvent'].includes(event.type)) {
        const date = event.created_at.split('T')[0];
        contributionCounts[date] = (contributionCounts[date] || 0) + 1;
      }
    });

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const today = new Date();

    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      contributionsByDay.push({
        date: dateStr,
        count: contributionCounts[dateStr] || 0
      });
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = contributionsByDay.length - 1; i >= 0; i--) {
      const day = contributionsByDay[i];
      if (day.count > 0) {
        tempStreak++;
        if (i >= contributionsByDay.length - 7) {
          currentStreak = tempStreak;
        }
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 0;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;

    const commitsThisWeek = contributionsByDay.slice(-7).reduce((sum, day) => sum + day.count, 0);
    const commitsThisMonth = contributionsByDay.slice(-30).reduce((sum, day) => sum + day.count, 0);

    const reposResponse = await fetch(
      `${GITHUB_API_REST}/users/${username}/repos?sort=pushed&per_page=10`,
      { headers }
    );
    const reposData = await reposResponse.ok ? await reposResponse.json() : [];

    const recentCommits: { message: string; date: string; repo: string; mood: MoodEntry['mood'] }[] = [];

    for (const repo of (reposData as any[]).slice(0, 5)) {
      try {
        const commitsResponse = await fetch(
          `${GITHUB_API_REST}/repos/${username}/${repo.name}/commits?per_page=5`,
          { headers }
        );
        if (commitsResponse.ok) {
          const commits = await commitsResponse.json();
          for (const commit of (commits as any[])) {
            if (commit.commit?.message) {
              const moodResult = detectMoodFromCommit(commit.commit.message);
              recentCommits.push({
                message: commit.commit.message.split('\n')[0],
                date: commit.commit.author?.date?.split('T')[0] || '',
                repo: repo.name,
                mood: moodResult.mood
              });
              if (recentCommits.length >= 20) break;
            }
          }
        }
      } catch (e) {
        continue;
      }
      if (recentCommits.length >= 20) break;
    }

    const dayOfWeekCounts: Record<string, number> = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    contributionsByDay.forEach((day) => {
      const dayOfWeek = new Date(day.date).getDay();
      dayOfWeekCounts[dayNames[dayOfWeek]] = (dayOfWeekCounts[dayNames[dayOfWeek]] || 0) + day.count;
    });

    let mostProductiveDay = 'Monday';
    let maxCount = 0;
    for (const [day, count] of Object.entries(dayOfWeekCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostProductiveDay = day;
      }
    }

    return {
      username,
      avatarUrl: userData.avatar_url,
      totalContributions: Object.values(contributionCounts).reduce((a, b) => a + b, 0),
      currentStreak,
      longestStreak,
      contributionsByDay,
      commitsThisWeek,
      commitsThisMonth,
      mostProductiveDay,
      recentCommits
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching GitHub data:', errorMessage);

    const gitHubError: GitHubError = {
      type: 'network_error',
      message: `Network error: ${errorMessage}. Please check your internet connection and try again.`
    };
    onError?.(gitHubError);
    return null;
  }
}

export function validateGitHubToken(token: string): { valid: boolean; message: string } {
  if (!token || token.trim() === '') {
    return { valid: true, message: 'No token provided - using unauthenticated mode (60 requests/hour)' };
  }

  if (token.startsWith('ghp_') || token.startsWith('github_pat_')) {
    return { valid: true, message: `Token valid - authenticated mode (5,000 requests/hour)` };
  }

  return { valid: false, message: 'Invalid token format. Token should start with ghp_ or github_pat_' };
}

export function getRateLimitInfo() {
  return RATE_LIMIT_INFO;
}
