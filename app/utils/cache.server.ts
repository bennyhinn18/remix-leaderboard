import { createServerSupabase } from './supabase.server';

// Simple in-memory cache implementation
type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

export class Cache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;

  constructor(defaultTTLSeconds: number = 60) {
    // Default TTL of 60 seconds
    this.defaultTTL = defaultTTLSeconds * 1000;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if the entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T, ttlSeconds?: number): void {
    const ttl =
      (ttlSeconds !== undefined ? ttlSeconds : this.defaultTTL) * 1000;

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}

// Create specific caches for different data types
export const userCache = new Cache<{ id: string; title: string }>(120); // 2 minutes cache for user data
export const memberCache = new Cache<any>(60); // 1 minute cache for member data
export const pointsCache = new Cache<any[]>(30); // 30 seconds cache for points data

// Helper function to get cached user by request fingerprint
export function getCacheKeyFromRequest(
  request: Request,
  suffix: string = ''
): string {
  // Create a unique fingerprint for the request based on headers that might identify the user
  const authHeader = request.headers.get('authorization') || '';
  const cookie = request.headers.get('cookie') || '';

  const fingerprint = `${authHeader}|${cookie}`;
  return `${fingerprint}${suffix ? ':' + suffix : ''}`;
}

// Helper function to get cached member data by username
export async function getCachedMember(
  request: Request,
  username: string,
  supabase?: any
) {
  const cacheKey = `member:${username}`;
  const cachedMember = memberCache.get(cacheKey);

  if (cachedMember) {
    return cachedMember;
  }
  // If no supabase instance is provided, create one
  const supabaseClient =
    supabase || createServerSupabase(request, new Response());

  // Fetch the member data
  const { data: member, error } = await supabaseClient
    .from('members')
    .select('*')
    .eq('github_username', username)
    .single();

  if (error || !member) {
    return null;
  }
  // Cache the member data
  memberCache.set(cacheKey, member);
  console.log(`Member data cached for: ${username}`);

  return member;
}

// Helper function to get cached points data by member ID
export async function getCachedPoints(
  request: Request,
  memberId: number,
  supabase?: any
) {
  const cacheKey = `points:${memberId}`;
  const cachedPoints = pointsCache.get(cacheKey);

  if (cachedPoints) {
    return cachedPoints;
  }

  // If no supabase instance is provided, create one
  const supabaseClient =
    supabase || createServerSupabase(request, new Response());

  // Fetch the points data
  const { data: points, error } = await supabaseClient
    .from('points')
    .select('*')
    .eq('member_id', memberId)
    .order('updated_at', { ascending: true });

  if (error) {
    return [];
  }

  // Cache the points data
  pointsCache.set(cacheKey, points || []);

  return points || [];
}

// Helper function to clear all caches - useful for development and debugging
// export function clearAllCaches() {
//   userCache.invalidateAll();
//   memberCache.invalidateAll();
//   pointsCache.invalidateAll();
//   console.log('All caches cleared');
// }

// Helper function to clear cache for a specific member
export function clearMemberCache(username: string) {
  const cacheKey = `member:${username}`;
  memberCache.invalidate(cacheKey);
  console.log(`Cache cleared for member: ${username}`);
}

// Function to clear member points cache by member ID
export function clearMemberPointsCache(memberId: number) {
  const pointsCacheKey = `points:${memberId}`;
  pointsCache.invalidate(pointsCacheKey);
  console.log(`Cleared points cache for member ID: ${memberId}`);
}

// Function to clear all member-related caches (comprehensive cache clearing)
export function clearAllMemberCaches(username: string, memberId?: number) {
  clearMemberCache(username);
  if (memberId) {
    clearMemberPointsCache(memberId);
  }
  console.log(`Cleared all caches for member: ${username} (ID: ${memberId})`);
}
