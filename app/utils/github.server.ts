export async function getGitHubStreak(username: string) {
    try {
      const response = await fetch(`https://api.github.com/users/${username}/events/public`)
      const events = await response.json()
      
      // Get contributions from the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const contributions = events.filter((event: any) => {
        const eventDate = new Date(event.created_at)
        return eventDate > thirtyDaysAgo && 
          (event.type === 'PushEvent' || 
           event.type === 'CreateEvent' || 
           event.type === 'PullRequestEvent')
      })
  
      return contributions.length
    } catch (error) {
      console.error(`Error fetching GitHub stats for ${username}:`, error)
      return 0
    }
  }
  