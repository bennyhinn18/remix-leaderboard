export async function getGitHubStreak(username: string) {
  /*{ try {
    const response = await fetch(`https://api.github.com/users/${username}/events/public`, {
      headers: {
        "Authorization": `token ${process.env.GITHUB_ACCESS_TOKEN}`,
        "Accept": "application/vnd.github.v3+json"
      }
    });

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} ${response.statusText}`);
      return 0;
    }

    const events = await response.json();

    // Get contributions from the last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Store days with contributions in a Set (ensures unique dates)
    const contributionDays = new Set<string>();

    events.forEach((event: any) => {
      if (!event.created_at) return;
      const eventDate = new Date(event.created_at);
      if (
        eventDate >= thirtyDaysAgo &&
        eventDate <= today &&
        ["PushEvent", "CreateEvent", "PullRequestEvent"].includes(event.type)
      ) {
        contributionDays.add(eventDate.toISOString().split("T")[0]); // Store date as 'YYYY-MM-DD'
      }
    });

    // Calculate the longest current streak
    let streak = 0;
    let currentDate = new Date();

    while (contributionDays.has(currentDate.toISOString().split("T")[0])) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1); // Go to the previous day
    }

    return streak;
  } catch (error) {
    console.error(`Error fetching GitHub stats for ${username}:`, error);
    }return 0;
  }*/
  return 0;
}
