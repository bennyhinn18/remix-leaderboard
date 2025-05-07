export async function fetchGitHubStats(username: string) {
  try {
    console.log("Fetching GitHub stats for", username);
    const response = await fetch(`https://api.github.com/users/${username}/events/public`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    if (!response.ok) return { streak: 0 };

    const events = await response.json();
    
    // Calculate streak logic
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const contributionDays = new Set<string>();
    
    events.forEach((event: any) => {
      if (!event.created_at) return;
      const eventDate = new Date(event.created_at);
      if (
        eventDate >= thirtyDaysAgo &&
        ["PushEvent", "CreateEvent", "PullRequestEvent"].includes(event.type)
      ) {
        contributionDays.add(eventDate.toISOString().split("T")[0]);
      }
    });
    
    let streak = 0;
    let currentDate = new Date();
    while (contributionDays.has(currentDate.toISOString().split("T")[0])) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return { streak };
  } catch (error) {
    console.error(`Error fetching GitHub stats for ${username}:`, error);
    return { streak: 0 };
  }
}