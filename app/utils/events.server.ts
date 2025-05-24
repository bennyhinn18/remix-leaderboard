import { supabase } from '~/utils/supabase.server';
import type { Event } from '~/types/events';

export async function getEvents() {
  const { data: events, error } = await supabase
    .from('events')
    .select(
      `
      *,
      agenda_items (
        id,
        title,
        duration,
        presenter,
        description,
        order_index
      )
    `
    )
    .order('date', { ascending: true });

  if (error) throw error;

  return events.map((event: any) => ({
    ...event,
    createdAt: new Date(event.created_at),
    date: new Date(event.date),
    agenda: event.agenda_items
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map((item: any) => ({
        id: item.id,
        eventId: event.id,
        title: item.title,
        duration: item.duration,
        presenter: item.presenter,
        description: item.description,
        orderIndex: item.order_index,
      })),
  }));
}

export async function createEvent(
  event: Omit<Event, 'id' | 'createdAt' | 'attendees'>
) {
  const { data: newEvent, error: eventError } = await supabase
    .from('events')
    .insert([
      {
        title: event.title,
        description: event.description,
        date: event.date.toISOString(),
        location: event.location,
        leading_clan: event.leadingClan,
        status: event.status,
        max_capacity: event.maxCapacity,
        image_url: event.imageUrl,
      },
    ])
    .select()
    .single();

  if (eventError) throw eventError;

  if (event.agenda && event.agenda.length > 0) {
    const { error: agendaError } = await supabase.from('agenda_items').insert(
      event.agenda.map((item, index) => ({
        event_id: newEvent.id,
        title: item.title,
        duration: item.duration,
        presenter: item.presenter,
        description: item.description,
        order_index: index,
      }))
    );

    if (agendaError) {
      // Rollback event creation if agenda items insertion fails
      await supabase.from('events').delete().eq('id', newEvent.id);
      throw agendaError;
    }
  }

  return newEvent;
}
