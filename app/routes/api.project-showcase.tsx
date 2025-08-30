import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { createServerSupabase } from '~/utils/supabase.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = createServerSupabase(request, response);
  
  const url = new URL(request.url);
  let eventId = url.searchParams.get('eventId');
  
  // If no eventId provided, get the currently open event
  if (!eventId) {
    const { data: openEvent } = await supabase
      .from('project_showcase_events')
      .select('event_id, max_slots')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (!openEvent) {
      return json({ error: 'No open event available' }, { status: 404 });
    }
    
    eventId = openEvent.event_id;
  }

  // Get event details to get max_slots
  const { data: eventData } = await supabase
    .from('project_showcase_events')
    .select('max_slots')
    .eq('event_id', eventId)
    .single();

  const maxSlots = eventData?.max_slots || 25;

  try {
    // Get allocated slots with member details
    const { data: slots, error: slotsError } = await supabase
      .from('project_showcase_slots_with_members')
      .select('*')
      .eq('event_id', eventId)
      .order('slot_number');

    if (slotsError) {
      console.error('Error fetching slots:', slotsError);
      return json({ error: 'Failed to fetch slots' }, { status: 500 });
    }

    // Get total eligible members count
    const { count: eligibleCount, error: countError } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .ilike('title', '%basher%');

    if (countError) {
      console.error('Error counting eligible members:', countError);
    }

    // Get event stats
    const stats = {
      totalSlots: maxSlots,
      allocatedSlots: slots?.length || 0,
      availableSlots: maxSlots - (slots?.length || 0),
      eligibleMembers: eligibleCount || 0,
      lastUpdated: new Date().toISOString(),
    };

    return json({
      success: true,
      data: {
        slots: slots || [],
        stats,
        eventId,
      }
    }, { 
      headers: {
        ...response.headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return json(
      { error: 'Internal server error' }, 
      { status: 500, headers: response.headers }
    );
  }
}

// Handle POST requests for webhook notifications
export async function action({ request }: LoaderFunctionArgs) {
  // This could be used for webhook notifications from Supabase
  // or for triggering real-time updates
  return json({ success: true });
}
