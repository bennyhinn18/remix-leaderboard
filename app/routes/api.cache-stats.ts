import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { getCacheStats } from '~/utils/cache.server';

export async function loader({ request }: LoaderFunctionArgs) {
  // Only allow in development for security
  if (process.env.NODE_ENV !== 'development') {
    return json({ error: 'Cache stats only available in development' }, { status: 403 });
  }

  const stats = getCacheStats();
  
  return json({
    message: 'SWR Cache Statistics',
    timestamp: new Date().toISOString(),
    ...stats,
  });
}