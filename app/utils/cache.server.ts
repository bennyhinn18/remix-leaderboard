import { createSupabaseServerClient } from './supabase.server';

/**
 * SWR (Stale-While-Revalidate) Cache Implementation
 * 
 * This cache follows the SWR pattern:
 * 1. Return stale cached data immediately if available
 * 2. Start background revalidation for stale data
 * 3. Update cache with fresh data when revalidation completes
 * 
 * Benefits:
 * - Fast response times (always serve from cache when possible)
 * - Fresh data (background updates keep cache current)
 * - Reduced server load (duplicate requests are prevented)
 * 
 * Cache States:
 * - Fresh: Data is recent and can be served immediately
 * - Stale: Data is old but still usable, triggers background refresh
 * - Expired: Data is too old and must be refetched synchronously
 * - Revalidating: Background refresh is in progress
 */

// SWR-enabled cache implementation
type CacheEntry<T> = {
  data: T;
  expiresAt: number;
  staleAt: number; // SWR: Time when data becomes stale but still usable
  revalidating?: boolean; // Flag to prevent duplicate revalidation requests
};

export class Cache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;
  private defaultStaleTime: number;

  constructor(defaultTTLSeconds: number = 60, staleTimeSeconds: number = 30) {
    // Default TTL of 60 seconds, stale time of 30 seconds
    this.defaultTTL = defaultTTLSeconds * 1000;
    this.defaultStaleTime = staleTimeSeconds * 1000;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if the entry has completely expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // SWR: Get data with staleness information
  getWithStaleness(key: string): { data: T | null; isStale: boolean; exists: boolean } {
    const entry = this.cache.get(key);

    if (!entry) {
      return { data: null, isStale: false, exists: false };
    }

    // Check if the entry has completely expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return { data: null, isStale: false, exists: false };
    }

    // Check if the entry is stale (but still valid)
    const isStale = Date.now() > entry.staleAt;

    return { data: entry.data, isStale, exists: true };
  }

  // Check if currently revalidating
  isRevalidating(key: string): boolean {
    const entry = this.cache.get(key);
    return entry?.revalidating === true;
  }

  // Set revalidating flag
  setRevalidating(key: string, revalidating: boolean): void {
    const entry = this.cache.get(key);
    if (entry) {
      entry.revalidating = revalidating;
    }
  }

  set(key: string, data: T, ttlSeconds?: number, staleTimeSeconds?: number): void {
    const ttl = ttlSeconds !== undefined ? ttlSeconds * 1000 : this.defaultTTL;
    const staleTime = staleTimeSeconds !== undefined ? staleTimeSeconds * 1000 : this.defaultStaleTime;
    const now = Date.now();

    this.cache.set(key, {
      data,
      expiresAt: now + ttl,
      staleAt: now + staleTime,
      revalidating: false,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}

// Create specific caches for different data types with SWR configuration
export const userCache = new Cache<{ id: string; title: string }>(120, 60); // 2 min TTL, 1 min stale time
export const memberCache = new Cache<any>(60, 30); // 1 min TTL, 30s stale time  
export const pointsCache = new Cache<any[]>(30, 15); // 30s TTL, 15s stale time

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

// SWR: Helper function to get cached member data by username
export async function getCachedMember(
  request: Request,
  username: string,
  supabase?: any
) {
  const cacheKey = `member:${username}`;
  const cacheResult = memberCache.getWithStaleness(cacheKey);

  // If we have fresh data, return it immediately
  if (cacheResult.exists && !cacheResult.isStale) {
    console.log(`Fresh member data returned for: ${username}`);
    return cacheResult.data;
  }

  // If we have stale data, return it and revalidate in background
  if (cacheResult.exists && cacheResult.isStale && !memberCache.isRevalidating(cacheKey)) {
    console.log(`Stale member data returned for: ${username}, revalidating in background`);
    
    // Mark as revalidating to prevent duplicate requests
    memberCache.setRevalidating(cacheKey, true);
    
    // Start background revalidation (don't await)
    revalidateMemberData(request, username, cacheKey, supabase).catch(error => {
      console.error(`Background revalidation failed for member ${username}:`, error);
      memberCache.setRevalidating(cacheKey, false);
    });

    return cacheResult.data;
  }

  // No cached data or cache is invalid, fetch fresh data synchronously
  console.log(`No cached member data for: ${username}, fetching fresh data`);
  return await fetchAndCacheMemberData(request, username, cacheKey, supabase);
}

// Helper function to fetch and cache member data
async function fetchAndCacheMemberData(
  request: Request,
  username: string,
  cacheKey: string,
  supabase?: any
) {
  const supabaseClient = supabase || createSupabaseServerClient(request);

  try {
    const { data: member, error } = await supabaseClient.client
      .from('members')
      .select('*')
      .eq('github_username', username)
      .single();

    if (error || !member) {
      console.log(`Member not found: ${username}`);
      return null;
    }

    // Cache the member data
    memberCache.set(cacheKey, member);
    console.log(`Member data cached for: ${username}`);

    return member;
  } catch (error) {
    console.error(`Error fetching member data for ${username}:`, error);
    return null;
  }
}

// Background revalidation function for member data
async function revalidateMemberData(
  request: Request,
  username: string,
  cacheKey: string,
  supabase?: any
) {
  try {
    const freshData = await fetchAndCacheMemberData(request, username, cacheKey, supabase);
    console.log(`Background revalidation completed for member: ${username}`);
    return freshData;
  } finally {
    memberCache.setRevalidating(cacheKey, false);
  }
}

// SWR: Helper function to get cached points data by member ID (with pagination support)
export async function getCachedPoints(
  request: Request,
  memberId?: number,
  options?: {
    page?: number;
    itemsPerPage?: number;
    sortField?: string;
    sortDirection?: string;
    searchQuery?: string;
    showAllHistory?: boolean;
  },
  supabase?: any
) {
  // Create cache key that includes pagination and filter parameters
  const params = {
    memberId: memberId || 'all',
    page: options?.page || 1,
    itemsPerPage: options?.itemsPerPage || 10,
    sort: `${options?.sortField || 'updated_at'}:${options?.sortDirection || 'desc'}`,
    search: options?.searchQuery || '',
    showAll: options?.showAllHistory || false,
  };
  
  const cacheKey = `points:${JSON.stringify(params)}`;
  const cacheResult = pointsCache.getWithStaleness(cacheKey);

  // If we have fresh data, return it immediately
  if (cacheResult.exists && !cacheResult.isStale) {
    console.log(`Fresh points data returned for cache key: ${cacheKey}`);
    return cacheResult.data;
  }

  // If we have stale data, return it and revalidate in background
  if (cacheResult.exists && cacheResult.isStale && !pointsCache.isRevalidating(cacheKey)) {
    console.log(`Stale points data returned for cache key: ${cacheKey}, revalidating in background`);
    
    // Mark as revalidating to prevent duplicate requests
    pointsCache.setRevalidating(cacheKey, true);
    
    // Start background revalidation (don't await)
    revalidatePaginatedPointsData(request, params, cacheKey, supabase).catch(error => {
      console.error(`Background revalidation failed for points cache key ${cacheKey}:`, error);
      pointsCache.setRevalidating(cacheKey, false);
    });

    return cacheResult.data;
  }

  // No cached data or cache is invalid, fetch fresh data synchronously
  console.log(`No cached points data for cache key: ${cacheKey}, fetching fresh data`);
  return await fetchAndCachePaginatedPointsData(request, params, cacheKey, supabase);
}

// Helper function to fetch and cache points data (legacy - for backward compatibility)
async function fetchAndCachePointsData(
  request: Request,
  memberId: number,
  cacheKey: string,
  supabase?: any
) {
  const supabaseClient = supabase || createSupabaseServerClient(request);

  try {
    const { data: points, error } = await supabaseClient.client
      .from('points')
      .select('*')
      .eq('member_id', memberId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error(`Error fetching points for member ID ${memberId}:`, error);
      return [];
    }

    // Cache the points data
    const pointsData = points || [];
    pointsCache.set(cacheKey, pointsData);
    console.log(`Points data cached for member ID: ${memberId}`);

    return pointsData;
  } catch (error) {
    console.error(`Error fetching points data for member ID ${memberId}:`, error);
    return [];
  }
}

// Helper function to fetch and cache paginated points data
async function fetchAndCachePaginatedPointsData(
  request: Request,
  params: any,
  cacheKey: string,
  supabase?: any
) {
  const supabaseClient = supabase || createSupabaseServerClient(request);

  try {
    // Calculate offset for pagination
    const offset = (params.page - 1) * params.itemsPerPage;

    // Build the base query
    let pointsQuery = supabaseClient.client
      .from('points')
      .select('*, member:members!points_member_id_fkey(id,name,title)', { count: 'exact' });

    // Add member filter if specified
    if (params.memberId !== 'all') {
      pointsQuery = pointsQuery.eq('member_id', params.memberId);
    }

    // Add search filter if specified
    if (params.search.trim()) {
      pointsQuery = pointsQuery.or(`description.ilike.%${params.search}%,member.name.ilike.%${params.search}%`);
    }

    // Add sorting
    const [sortField, sortDirection] = params.sort.split(':');
    const ascending = sortDirection === 'asc';
    if (sortField === 'points') {
      pointsQuery = pointsQuery.order('points', { ascending });
    } else {
      pointsQuery = pointsQuery.order('updated_at', { ascending });
    }

    // Add pagination
    pointsQuery = pointsQuery.range(offset, offset + params.itemsPerPage - 1);

    const { data: points, error, count } = await pointsQuery;

    if (error) {
      console.error(`Error fetching paginated points data:`, error);
      return { data: [], totalCount: 0 };
    }

    // Cache the points data with metadata
    const result = {
      data: points || [],
      totalCount: count || 0,
      params,
    };
    
    pointsCache.set(cacheKey, result);
    console.log(`Paginated points data cached with key: ${cacheKey}`);

    return result;
  } catch (error) {
    console.error(`Error fetching paginated points data:`, error);
    return { data: [], totalCount: 0 };
  }
}

// Background revalidation function for points data (legacy)
async function revalidatePointsData(
  request: Request,
  memberId: number,
  cacheKey: string,
  supabase?: any
) {
  try {
    const freshData = await fetchAndCachePointsData(request, memberId, cacheKey, supabase);
    console.log(`Background revalidation completed for points member ID: ${memberId}`);
    return freshData;
  } finally {
    pointsCache.setRevalidating(cacheKey, false);
  }
}

// Background revalidation function for paginated points data
async function revalidatePaginatedPointsData(
  request: Request,
  params: any,
  cacheKey: string,
  supabase?: any
) {
  try {
    const freshData = await fetchAndCachePaginatedPointsData(request, params, cacheKey, supabase);
    console.log(`Background revalidation completed for paginated points with key: ${cacheKey}`);
    return freshData;
  } finally {
    pointsCache.setRevalidating(cacheKey, false);
  }
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

// SWR utility: Force revalidation of member data
export async function revalidateMember(
  request: Request,
  username: string,
  supabase?: any
): Promise<any> {
  const cacheKey = `member:${username}`;
  console.log(`Force revalidating member: ${username}`);
  
  // Clear existing cache
  memberCache.invalidate(cacheKey);
  
  // Fetch fresh data
  return await fetchAndCacheMemberData(request, username, cacheKey, supabase);
}

// SWR utility: Force revalidation of points data
export async function revalidatePoints(
  request: Request,
  memberId: number,
  supabase?: any
): Promise<any[]> {
  const cacheKey = `points:${memberId}`;
  console.log(`Force revalidating points for member ID: ${memberId}`);
  
  // Clear existing cache
  pointsCache.invalidate(cacheKey);
  
  // Fetch fresh data
  return await fetchAndCachePointsData(request, memberId, cacheKey, supabase);
}

// SWR utility: Get cached paginated points for points history page
export async function getCachedPaginatedPoints(
  request: Request,
  options: {
    memberId?: string;
    page?: number;
    itemsPerPage?: number;
    sortField?: string;
    sortDirection?: string;
    searchQuery?: string;
    showAllHistory?: boolean;
  },
  supabase?: any
) {
  return await getCachedPoints(
    request,
    options.memberId && options.memberId !== 'all' ? parseInt(options.memberId, 10) : undefined,
    {
      page: options.page,
      itemsPerPage: options.itemsPerPage,
      sortField: options.sortField,
      sortDirection: options.sortDirection,
      searchQuery: options.searchQuery,
      showAllHistory: options.showAllHistory,
    },
    supabase
  );
}

// SWR utility: Get cache statistics
export function getCacheStats() {
  const now = Date.now();
  
  return {
    memberCache: {
      size: (memberCache as any).cache.size,
      entries: Array.from((memberCache as any).cache.entries()).map((entry: any) => {
        const [key, cacheEntry] = entry;
        return {
          key,
          isStale: now > cacheEntry.staleAt,
          isExpired: now > cacheEntry.expiresAt,
          revalidating: cacheEntry.revalidating || false,
        };
      }),
    },
    pointsCache: {
      size: (pointsCache as any).cache.size,
      entries: Array.from((pointsCache as any).cache.entries()).map((entry: any) => {
        const [key, cacheEntry] = entry;
        return {
          key,
          isStale: now > cacheEntry.staleAt,
          isExpired: now > cacheEntry.expiresAt,
          revalidating: cacheEntry.revalidating || false,
        };
      }),
    },
  };
}
