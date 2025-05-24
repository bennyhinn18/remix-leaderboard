import { createCookieSessionStorage, redirect } from '@remix-run/node';
import { supabase } from './supabase.server';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'sb_auth',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: ['s3cr3t'], // Replace with your actual secret
    secure: process.env.NODE_ENV === 'production',
  },
});
export async function name() {}

export async function createUserSession(
  accessToken: string,
  refreshToken: string,
  redirectTo: string
) {
  const session = await sessionStorage.getSession();
  session.set('accessToken', accessToken);
  session.set('refreshToken', refreshToken);

  await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}

export async function getUserSession(request: Request) {
  const { data } = await supabase.auth.getSession();
  console.log('session', data.session?.access_token);
  const accessToken = data.session?.access_token;

  if (!accessToken) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) return null;

  return user;
}

export async function requireUser(request: Request) {
  const user = await getUserSession(request);
  if (!user) {
    throw redirect('/login');
  }
  return user;
}

export async function logout(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );
  return redirect('/login', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}
