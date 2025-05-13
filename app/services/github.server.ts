// export async function fetchGitHubStats(username: string) {
//   if (!username) return { streak: 0 };
  
//   try {
//     console.log(`Fetching GitHub stats for ${username} using contributions API`);
    
//     const response = await fetch(`https://github-contributions-api.deno.dev/${username}.json`);
    
//     if (!response.ok) {
//       console.warn(`Contributions API returned ${response.status}: ${response.statusText}`);
//       return { streak: 0 };
//     }

//     const data = await response.json();
    
//     // Extract and flatten contributions from nested structure
//     let allContributions = [];
    
//     // Check if contributions exists and handle its structure
//     if (data.contributions) {
//       if (Array.isArray(data.contributions)) {
//         // Handle directly accessible contributions array
//         allContributions = data.contributions;
//       }
//     } else {
//       // Handle nested structure if it's directly in the data
//       if (Array.isArray(data)) {
//         data.forEach(week => {
//           if (Array.isArray(week)) {
//             allContributions = allContributions.concat(week);
//           }
//         });
//       }
//     }

//     console.log(`Parsed ${allContributions.length} contributions for ${username}`);
    
//     if (allContributions.length === 0) {
//       return { streak: 0 };
//     }

//     // Sort contributions by date (newest first)
//     allContributions.sort((a, b) => 
//       new Date(b.date).getTime() - new Date(a.date).getTime()
//     );
    
//     // Debug: Log a few of the most recent contributions
//     console.log("Most recent contributions:", allContributions.slice(allContributions.length-3, allContributions.length));

//     // Calculate current streak
//     let streak = 0;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Normalize to start of day
    
//     // Format date as YYYY-MM-DD
//     const formatDate = (date) => {
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');
//       return `${year}-${month}-${day}`;
//     };
    
//     // Start checking from today and go backward
//     let checkDate = new Date(today);
    
//     // We'll check the last 100 days at most
//     for (let i = 0; i < allContributions.length; i++) {
//       const dateStr = formatDate(checkDate);
      
//       console.log(`Checking contributions for ${dateStr}`);
//       // Find this date in contributions
//       const dayContribution = allContributions.flat().find(c => c.date === dateStr);
//       console.log(`Checking contributions for ${dateStr}`, dayContribution);
//       if (dayContribution) {
//         if (dayContribution.contributionCount > 0) {
//           streak++;
//           console.log(`Found contribution on ${dateStr}: ${dayContribution.contributionCount}`);
//         } else {
//           // Day found with zero contributions, streak ends
//           console.log(`No contributions on ${dateStr}, streak ends`);
//           break;
//         }
//       } else {
//         // Day not found in data, streak ends
//         console.log(`No data for ${dateStr}, streak ends`);
//         break;
//       }
      
//       // Move to previous day
//       checkDate.setDate(checkDate.getDate() - 1);
//     }

//     console.log(`Calculated GitHub streak for ${username}: ${streak}`);
//     return { streak };
//   } catch (error) {
//     console.error(`Error fetching GitHub stats for ${username}:`, error);
//     return { streak: 0 };
//   }
// }
export async function fetchGitHubStats(username: string) {
  if (!username) return { streak: 0 };
  
  try {
    console.log(`Fetching GitHub stats for ${username} using contributions API`);
    
    const response = await fetch(`https://github-contributions-api.deno.dev/${username}.json`);
    
    if (!response.ok) {
      console.warn(`Contributions API returned ${response.status}: ${response.statusText}`);
      return { streak: 0 };
    }

    const data = await response.json();

    data.totalContributions = data.totalContributions || 0;
    console.log(`Parsed ${data.totalContributions} contributions for ${username}`);
    return { streak: data.totalContributions };
      } catch (error) {
        console.error(`Error fetching GitHub stats for ${username}:`, error);
        return { streak: 0 };
      }}