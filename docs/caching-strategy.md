# Caching Strategy Documentation

## Overview

This document outlines the caching strategies implemented in the Remix Leaderboard application to improve performance and reduce API calls.

## Main Caching Mechanisms

### In-Memory Server-Side Cache

The application uses an in-memory cache system implemented in `cache.server.ts` that provides:

1. **User data caching** - Caches user authentication and role information
2. **Member data caching** - Caches profile information for users
3. **Points history caching** - Caches leaderboard points data

### Cache Configuration

Each cache type has different TTL (Time To Live) values:

- User data: 120 seconds (2 minutes)
- Member data: 60 seconds (1 minute)
- Points data: 30 seconds

### APIs That Use Caching

- `getCurrentUser()` - Caches user authentication data
- `getCachedMember()` - Caches member profile data
- `getCachedPoints()` - Caches points history data

## Implementation Details

### Cache Keys

Cache keys are created using:
- Request fingerprints (for user data)
- Username (for member data)
- Member ID (for points data)

### Cache Invalidation

The cache can be invalidated in several ways:
- Automatically through TTL expiration
- Manually using `invalidateUserCache()` function
- Full cache clearing with `invalidateAll()`

## Performance Benefits

- Reduced database queries
- Faster page loads
- Lower API rate limiting issues
- Better user experience with reduced loading times

## Best Practices

When making changes:

1. Always check if there's a cached version before fetching from the database
2. Invalidate cache entries when data is updated
3. Set appropriate TTL values based on how frequently the data changes
4. Use deferred loading for non-critical data

## Deferred Loading

The application uses Remix's defer/await pattern for:
- GitHub contribution data
- Duolingo streak data
- Other external API calls

## Suspense and Loading States

The UI uses Suspense boundaries with skeleton loaders for:
- Profile header
- Stats cards
- Activity sections
- Streaks display

## Maintenance

To maintain optimal performance:
1. Monitor memory usage on the server
2. Adjust TTL settings if needed
3. Consider moving to a distributed cache like Redis for production environments
