import { type LoaderFunctionArgs } from '@remix-run/node';
import { AttendanceService, type AttendanceFilters } from '~/services/attendance.server';
import { isOrganiser } from '~/utils/currentUser';
import { createServerSupabase } from '~/utils/supabase.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const organiserStatus = await isOrganiser(request);
  
  if (!organiserStatus) {
    throw new Response('Unauthorized', { status: 403 });
  }

  const response = new Response();
  const supabase = createServerSupabase(request, response);
  
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  const format = searchParams.get('format') as 'csv' | 'json' || 'csv';
  
  const filters: AttendanceFilters = {
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    eventIds: searchParams.getAll('eventIds').filter(Boolean),
    memberIds: searchParams.getAll('memberIds').map(id => parseInt(id)).filter(id => !isNaN(id)),
    clanIds: searchParams.getAll('clanIds').map(id => parseInt(id)).filter(id => !isNaN(id)),
    eventTypes: searchParams.getAll('eventTypes').filter(Boolean),
    eventStatuses: searchParams.getAll('eventStatuses').filter(Boolean),
    memberTitles: searchParams.getAll('memberTitles').filter(Boolean),
  };

  try {
    const data = await AttendanceService.exportAttendanceData(supabase, filters, format);
    
    const headers = new Headers();
    
    if (format === 'csv') {
      headers.set('Content-Type', 'text/csv');
      headers.set('Content-Disposition', `attachment; filename="attendance-data-${new Date().toISOString().split('T')[0]}.csv"`);
      return new Response(data as string, { headers });
    } else {
      headers.set('Content-Type', 'application/json');
      headers.set('Content-Disposition', `attachment; filename="attendance-data-${new Date().toISOString().split('T')[0]}.json"`);
      return new Response(JSON.stringify(data, null, 2), { headers });
    }
  } catch (error) {
    console.error('Export error:', error);
    return new Response('Export failed', { status: 500 });
  }
}
