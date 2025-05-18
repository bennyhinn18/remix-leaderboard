import { createServerSupabase } from "./supabase.server";
import { fetchGitHubStats } from "../services/github.server";
import { fetchDuolingoStats } from "../services/duolingo.server";
import { fetchLeetCodeStats } from "../services/leetcode.server";
// Import other services as needed

export async function updateMemberStats(request: Request, response: Response) {
  
  const supabase = createServerSupabase(request, response);
  
  // Get all members
  const { data: members, error } = await supabase
    .from("members")
    .select("id, github_username, duolingo_username,leetcode_username")
    
     
    
  if (error) {
    console.error("Error fetching members:", error);
    return;
  }
  
  
  
  // Process members in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < members.length; i += batchSize) {
    const batch = members.slice(i, i + batchSize);
    
    for (const member of batch) {
      try {
        const stats: Record<string, number> = {};
        
        // GitHub stats
        if (member.github_username) {
          const { streak } = await fetchGitHubStats(member.github_username);
          stats.github_streak = streak;
        }
        
        // Duolingo stats
        if (member.duolingo_username) {
          const { streak } = await fetchDuolingoStats(member.duolingo_username);
          stats.duolingo_streak = streak;
        }
        console.log(`stats of ${member.id}`,stats);
        // Add other services as needed
        
        //leetcode stats
        if (member.leetcode_username) {
          const { streak } = await fetchLeetCodeStats(member.leetcode_username);
          stats.leetcode_streak = streak;
        }



        // Update the stats in the database
        await supabase
          .from("member_stats")
          .upsert({
            member_id: member.id,
            ...stats,
            last_updated_at: new Date().toISOString()
          }, {
            onConflict: "member_id"
          });
          
      } catch (err) {
        console.error(`Error updating stats for member ${member.id}:`, err);
      }
    }
    
    // Add delay between batches
    if (i + batchSize < members.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}