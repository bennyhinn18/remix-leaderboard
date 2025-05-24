import { createServerSupabase } from './supabase.server';
import { userCache, getCacheKeyFromRequest } from './cache.server';

interface User {
  id: string;
  title: string;
}

async function getCurrentUser(request: Request): Promise<User | null> {
  // Check cache first
  const cacheKey = getCacheKeyFromRequest(request, 'currentUser');
  const cachedUser = userCache.get(cacheKey);

  if (cachedUser) {
    return cachedUser;
  }

  const response = new Response();
  const supabase = createServerSupabase(request, response);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('Error fetching user:', error);
    return null;
  }

  const { data, error: roleError } = await supabase
    .from('members')
    .select('title,id')
    .eq('github_username', user?.user_metadata.user_name)
    .single();

  if (roleError || !data) {
    console.error('Error fetching user role:', roleError);
    return null;
  }

  // Store in cache
  const userData = { id: user.id, title: data.title, member_id: data.id };
  userCache.set(cacheKey, userData);

  return userData;
}

async function isOrganiser(request: Request): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user?.title === 'Organiser';
}

async function isMentor(request: Request): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user?.title === 'Mentor';
}

// Added function to invalidate user cache
function invalidateUserCache(request: Request): void {
  const cacheKey = getCacheKeyFromRequest(request, 'currentUser');
  userCache.invalidate(cacheKey);
}

export { getCurrentUser, isOrganiser, isMentor, invalidateUserCache };
