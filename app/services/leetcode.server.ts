export async function fetchLeetCodeStats(username: string) {
    if (!username) return { streak: 0 };
    
    try {
        const response = await fetch(
        `https://leetcode-stats-api.herokuapp.com/${username}/`,
        {
            headers: {
            "User-Agent": "Mozilla/5.0 (compatible; LeaderboardApp/1.0)"
            }
        }
        );
        
        if (!response.ok) return { streak: 0 };
        
        const data = await response.text();
        const jsonData = JSON.parse(data);
        const streak = jsonData?.totalSolved|| 0;

        if (streak) {
            return { streak };
        } 
        else {
        return { streak: 0 };
        }
    } catch (error) {
        console.error(`Error fetching LeetCode stats for ${username}:`, error);
        return { streak: 0 };
    }
    }