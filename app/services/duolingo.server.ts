export async function fetchDuolingoStats(username: string) {
  if (!username) return { streak: 0 };

  try {
    const response = await fetch(
      `https://www.duolingo.com/2017-06-30/users?username=${username}&fields=streak,streakData%7BcurrentStreak,previousStreak%7D%7D`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LeaderboardApp/1.0)',
        },
      }
    );

    if (!response.ok) {
      console.warn(`Duolingo API returned ${response.status} for ${username}`);
      return { streak: 0 };
    }

    const responseText = await response.text();
    if (!responseText.trim()) {
      console.warn(`Empty response from Duolingo API for ${username}`);
      return { streak: 0 };
    }

    const data = JSON.parse(responseText);
    const userData = data.users?.[0] || {};

    const streak = Math.max(
      userData.streak ?? 0,
      userData.streakData?.currentStreak?.length ?? 0,
      userData.streakData?.previousStreak?.length ?? 0
    );

    return { streak };
  } catch (error) {
    console.error(`Error fetching Duolingo stats for ${username}:`, error);
    return { streak: 0 };
  }
}
