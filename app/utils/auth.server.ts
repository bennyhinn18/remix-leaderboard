import { redirect } from '@remix-run/node';
import { Octokit } from '@octokit/rest';
/*
if (!process.env.GITHUB_CLIENT_ID) throw new Error("GITHUB_CLIENT_ID is required")
if (!process.env.GITHUB_CLIENT_SECRET) throw new Error("GITHUB_CLIENT_SECRET is required")
if (!process.env.GITHUB_CALLBACK_URL) throw new Error("GITHUB_CALLBACK_URL is required")
*/
export async function checkOrganizationMembership(accessToken: string) {
  const octokit = new Octokit({ auth: accessToken });

  try {
    const { data: user } = await octokit.users.getAuthenticated();
    console.log('Authenticated user:', user.login);

    const { data: membership } = await octokit.orgs.getMembershipForUser({
      org: 'Byte-Bash-Blitz',
      username: user.login,
    });

    console.log('Organization membership:', membership);
    return membership.state === 'active';
  } catch (error) {
    console.error('Error checking organization membership:', error);
    return false;
  }
}

// This is now a simplified version that just redirects to login
// since we're handling auth state on the client
export async function requireUser(request: Request) {
  throw redirect('/login');
}
