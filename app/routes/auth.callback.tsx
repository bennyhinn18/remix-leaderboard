import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { createServerSupabase } from '~/utils/supabase.server';

async function checkOrgMembership(accessToken: string) {
  const response = await fetch('https://api.github.com/user/orgs', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch organization data');
  }

  const orgs = await response.json();
  return orgs.some((org: { login: string }) => org.login === 'Byte-Bash-Blitz');
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase(request, response);
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return redirect('/login');
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !session) {
    return redirect('/login?error=auth');
  }

  try {
    // Check organization membership
    const isMember = await checkOrgMembership(session.provider_token!);

    if (!isMember) {
      await supabase.auth.signOut();
      return redirect('/login?error=not-member');
    }

    return redirect('/leaderboard', {
      headers: response.headers,
    });
  } catch (error) {
    console.error('Error checking organization membership:', error);
    await supabase.auth.signOut();
    return redirect('/login?error=org-check-failed');
  }
};

export default function AuthCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Processing authentication...</p>
    </div>
  );
}
