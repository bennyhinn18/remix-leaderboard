import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { getGitHubCommits, batchGetGitHubCommits } from '~/utils/github-commits.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const username = url.searchParams.get('username');
  const usernames = url.searchParams.get('usernames');

  try {
    if (username) {
      // Single user request
      const commits = await getGitHubCommits(username);
      return json({ 
        success: true, 
        data: { [username]: commits },
        cached: true, // Always true since we use caching
        timestamp: new Date().toISOString()
      });
    } else if (usernames) {
      // Batch request for multiple users
      const usernameList = usernames.split(',').map(u => u.trim()).filter(Boolean);
      if (usernameList.length === 0) {
        return json({ success: false, error: 'No valid usernames provided' }, { status: 400 });
      }
      
      if (usernameList.length > 50) {
        return json({ success: false, error: 'Too many usernames (max 50)' }, { status: 400 });
      }

      const commitsData = await batchGetGitHubCommits(usernameList);
      return json({ 
        success: true, 
        data: commitsData,
        cached: true,
        timestamp: new Date().toISOString(),
        count: Object.keys(commitsData).length
      });
    } else {
      return json({ success: false, error: 'Username or usernames parameter required' }, { status: 400 });
    }
  } catch (error) {
    console.error('GitHub commits API error:', error);
    return json(
      { 
        success: false, 
        error: 'Failed to fetch GitHub commits',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}