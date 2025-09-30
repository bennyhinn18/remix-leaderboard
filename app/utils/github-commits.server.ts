import { json } from '@remix-run/node';

interface GitHubCommitsResponse {
  total_count: number;
  commits: Array<{
    sha: string;
    commit: {
      message: string;
      author: {
        name: string;
        email: string;
        date: string;
      };
    };
    author: {
      login: string;
      avatar_url: string;
    } | null;
  }>;
}

interface CachedCommitData {
  commits: number;
  lastFetch: number;
}

// In-memory cache for GitHub commits (3 hours = 10800000 ms)
const commitCache = new Map<string, CachedCommitData>();
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

/**
 * Fetches GitHub commits for a user with caching
 */
export async function getGitHubCommits(username: string): Promise<number> {
  const now = Date.now();
  const cached = commitCache.get(username);
  
  // Return cached data if it's still valid
  if (cached && (now - cached.lastFetch) < CACHE_DURATION) {
    return cached.commits;
  }

  try {
    // Calculate date range for the last 30 days to get recent commits
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const since = thirtyDaysAgo.toISOString();

    // GitHub API endpoint to search for commits by author
    const url = `https://api.github.com/search/commits?q=author:${username}+author-date:>${since}&sort=author-date&order=desc&per_page=100`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.cloak-preview+json',
        'User-Agent': 'ByteBashBlitz-Leaderboard',
        // Add GitHub token if available for higher rate limits
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        })
      }
    });

    if (!response.ok) {
      console.warn(`GitHub API error for ${username}: ${response.status} ${response.statusText}`);
      // Return cached data even if expired, or 0 if no cache
      return cached?.commits || 0;
    }

    const data: GitHubCommitsResponse = await response.json();
    const commitCount = data.total_count || 0;

    // Cache the result
    commitCache.set(username, {
      commits: commitCount,
      lastFetch: now
    });

    return commitCount;
  } catch (error) {
    console.error(`Error fetching GitHub commits for ${username}:`, error);
    // Return cached data even if expired, or 0 if no cache
    return cached?.commits || 0;
  }
}

/**
 * Batch fetch GitHub commits for multiple users
 */
export async function batchGetGitHubCommits(usernames: string[]): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  
  // Use Promise.allSettled to handle individual failures gracefully
  const promises = usernames.map(async (username) => {
    const commits = await getGitHubCommits(username);
    return { username, commits };
  });

  const settled = await Promise.allSettled(promises);
  
  settled.forEach((result) => {
    if (result.status === 'fulfilled') {
      results[result.value.username] = result.value.commits;
    }
  });

  return results;
}

/**
 * Clear expired cache entries (can be called periodically)
 */
export function cleanupCommitCache(): void {
  const now = Date.now();
  for (const [key, value] of commitCache.entries()) {
    if ((now - value.lastFetch) > CACHE_DURATION) {
      commitCache.delete(key);
    }
  }
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats() {
  const now = Date.now();
  const entries = Array.from(commitCache.entries());
  const valid = entries.filter(([, data]) => (now - data.lastFetch) < CACHE_DURATION);
  const expired = entries.filter(([, data]) => (now - data.lastFetch) >= CACHE_DURATION);
  
  return {
    totalEntries: entries.length,
    validEntries: valid.length,
    expiredEntries: expired.length,
    cacheSize: commitCache.size
  };
}