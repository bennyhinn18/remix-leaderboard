'use client';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from '@remix-run/react';
import { useAuth } from '~/contexts/auth';
import { checkOrganizationMembership } from '~/utils/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return redirect('/login?error=no-code');
  }

  try {
    const response = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: process.env.GITHUB_CALLBACK_URL,
        }),
      }
    );

    const data = await response.json();
    const { access_token: accessToken } = data;

    if (!accessToken) {
      return redirect('/login?error=no-token');
    }

    // Check organization membership
    const isMember = await checkOrganizationMembership(accessToken);
    if (!isMember) {
      return redirect('/login?error=organization');
    }

    // Return the token to be handled client-side
    return json({ accessToken });
  } catch (error) {
    console.error('Authentication error:', error);
    return redirect('/login?error=unknown');
  }
}

export function AuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('access_token');

  useEffect(() => {
    if (accessToken) {
      login(accessToken);
      navigate('/');
    }
  }, [accessToken, login, navigate]);

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=read:org`
  );
  return redirect(url.toString());
}

export default AuthCallback;
