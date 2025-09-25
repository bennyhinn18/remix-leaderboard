import { type LoaderFunctionArgs } from '@remix-run/node';
import { AttendanceService, type AttendanceFilters } from '~/services/attendance.server';
import { isOrganiser } from '~/utils/currentUser';
import { createSupabaseServerClient} from '~/utils/supabase.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createSupabaseServerClient(request);

  // Create attendance service instance
  const attendanceService = new AttendanceService(supabase.client);

  // Parse search parameters for filtering
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
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

  const format = (searchParams.get('format') as 'csv' | 'json') || 'csv';

  try {
    const exportData = await attendanceService.exportAttendanceData(filters, format);

    if (format === 'json') {
      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="attendance-data-${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    } else {
      return new Response(exportData as string, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="attendance-data-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Response('Export failed', { status: 500 });
  }
};
