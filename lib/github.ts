import { GitHubData, MoodEntry } from './types';
import { detectMoodFromCommit } from './utils';

const GITHUB_API_GRAPHQL = 'https://api.github.com/graphql';

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionsCollection {
  totalCommitContributions: number;
  contributionCalendar: {
    totalContributions: number;
    weeks: ContributionWeek[];
  };
}

const COMMIT_MOOD_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
      repositories(first: 20, orderBy: {field: PUSHED_AT, direction: DESC}) {
        nodes {
          name
          pushedAt
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 10) {
                  nodes {
                    message
                    committedDate
                    author {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchGitHubData(token: string, username: string): Promise<GitHubData | null> {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const to = new Date().toISOString();
    const from = oneYearAgo.toISOString();

    const response = await fetch(GITHUB_API_GRAPHQL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: COMMIT_MOOD_QUERY,
        variables: { username, from, to }
      })
    });

    if (!response.ok) {
      console.error('GitHub API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return null;
    }

    const { user } = data.data;
    if (!user || !user.contributionsCollection) {
      return null;
    }

    const { contributionCalendar } = user.contributionsCollection;
    const { repositories } = user;

    const contributionsByDay = contributionCalendar.weeks
      .flatMap((week: ContributionWeek) => week.contributionDays)
      .map((day: ContributionDay) => ({
        date: day.date,
        count: day.contributionCount
      }));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date().toISOString().split('T')[0];

    for (let i = contributionsByDay.length - 1; i >= 0; i--) {
      const day = contributionsByDay[i];
      if (day.date <= today) {
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
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;

    const recentCommits: { message: string; date: string; repo: string; mood: MoodEntry['mood'] }[] = [];
    const repoNodes = repositories?.nodes || [];

    for (const repo of repoNodes) {
      if (repo.defaultBranchRef?.target?.history?.nodes) {
        for (const commit of repo.defaultBranchRef.target.history.nodes) {
          if (commit.message && commit.committedDate) {
            const moodResult = detectMoodFromCommit(commit.message);
            recentCommits.push({
              message: commit.message.split('\n')[0],
              date: commit.committedDate.split('T')[0],
              repo: repo.name,
              mood: moodResult.mood
            });
            if (recentCommits.length >= 20) break;
          }
        }
      }
      if (recentCommits.length >= 20) break;
    }

    const commitsThisWeek = contributionsByDay
      .slice(-7)
      .reduce((sum: number, day: { count: number }) => sum + day.count, 0);

    const commitsThisMonth = contributionsByDay
      .slice(-30)
      .reduce((sum: number, day: { count: number }) => sum + day.count, 0);

    const dayOfWeekCounts: Record<string, number> = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    contributionsByDay.forEach((day: { date: string; count: number }) => {
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
      avatarUrl: `https://avatars.githubusercontent.com/u/${username}`,
      totalContributions: contributionCalendar.totalContributions,
      currentStreak,
      longestStreak,
      contributionsByDay,
      commitsThisWeek,
      commitsThisMonth,
      mostProductiveDay,
      recentCommits
    };
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return null;
  }
}

export function validateGitHubToken(token: string): boolean {
  return token.startsWith('ghp_') || token.startsWith('github_pat_');
}
