export async function fetchLeetCodeStats(username: string) {
  if (!username) return { streak: 0 };

  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(
      `https://leetcode-stats-api.herokuapp.com/${username}/`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LeaderboardApp/1.0)',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) return { streak: 0 };

    const data = await response.text();
    const jsonData = JSON.parse(data);
    const streak = jsonData?.totalSolved || 0;

    if (streak) {
      return { streak };
    } else {
      return { streak: 0 };
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`LeetCode API timeout for ${username}`);
    } else {
      console.error(`Error fetching LeetCode stats for ${username}:`, error);
    }
    return { streak: 0 };
  }
}
