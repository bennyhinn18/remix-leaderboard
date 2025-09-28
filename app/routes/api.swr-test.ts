import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { getCachedMember, getCachedPoints, revalidateMember, revalidatePoints } from '~/utils/cache.server';

export async function loader({ request }: LoaderFunctionArgs) {
  // Only allow in development for security
  if (process.env.NODE_ENV !== 'development') {
    return json({ error: 'SWR test only available in development' }, { status: 403 });
  }

  const url = new URL(request.url);
  const username = url.searchParams.get('username') || 'demo-user';
  const action = url.searchParams.get('action') || 'get';
  const memberId = parseInt(url.searchParams.get('memberId') || '1');

  try {
    let result: any = {};
    const startTime = Date.now();

    switch (action) {
      case 'get-member':
        result.member = await getCachedMember(request, username);
        break;
      
      case 'get-points':
        result.points = await getCachedPoints(request, memberId);
        break;
      
      case 'revalidate-member':
        result.member = await revalidateMember(request, username);
        result.forced = true;
        break;
      
      case 'revalidate-points':
        result.points = await revalidatePoints(request, memberId);
        result.forced = true;
        break;
      
      default:
        result.member = await getCachedMember(request, username);
        result.points = await getCachedPoints(request, memberId);
    }

    const endTime = Date.now();

    return json({
      message: `SWR Cache Test - ${action}`,
      username,
      memberId,
      responseTime: `${endTime - startTime}ms`,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    return json({ 
      error: 'SWR test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}