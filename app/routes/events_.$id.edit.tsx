import {
  Form,
  useLoaderData,
  useNavigation,
  useParams,
} from '@remix-run/react';
import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@remix-run/node';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarIcon, Loader2, Plus, X } from 'lucide-react';
import { createSupabaseServerClient } from '~/utils/supabase.server';
import Calendar from '~/components/calendar';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { toast } from '~/hooks/use-toast';
import { cn } from '~/lib/utils';
import type { AgendaItem } from '~/types/events';
import { isOrganiser } from '~/utils/currentUser';
import { parseISO, format } from 'date-fns';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = createSupabaseServerClient(request);
  const organiserData = await isOrganiser(request);

  if (!organiserData.isOrganiser) {
    return redirect('/events');
  }

  const { data: event } = await supabase.client
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!event) {
    return redirect('/events');
  }

  return json({ event });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const response = new Response();
  const supabase = createSupabaseServerClient(request);
  const formData = await request.formData();
  const organiserData = await isOrganiser(request);
  console.log('Organiser status:', organiserData.isOrganiser);
  if (!organiserData.isOrganiser) {
    return redirect('/events');
  }

  try {
    // Validate required fields
    const requiredFields = [
      'title',
      'date',
      'time',
      'venue',
      'clanName',
      'clanScore',
    ];
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        return json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Parse agenda items
    const agendaItems: AgendaItem[] = [];
    let i = 0;
    while (formData.get(`agenda[${i}].time`)) {
      agendaItems.push({
        time: formData.get(`agenda[${i}].time`) as string,
        title: formData.get(`agenda[${i}].title`) as string,
        description: formData.get(`agenda[${i}].description`) as string,
        speaker: (formData.get(`agenda[${i}].speaker`) as string) || undefined,
      });
      i++;
    }

    const dateStr = formData.get('date') as string;
    const date = new Date(dateStr);
    const formattedDate = format(date, 'yyyy-MM-dd');

    const updatedEvent = {
      title: formData.get('title') as string,
      date: formattedDate,
      time: formData.get('time') as string,
      venue: formData.get('venue') as string,
      leading_clan: {
        name: formData.get('clanName') as string,
        avatar: '/placeholder.svg?height=50&width=50',
        score: Number(formData.get('clanScore')) || 0,
      },
      agenda: agendaItems,
    };
    console.log('Updated event:', updatedEvent);
    const { error } = await supabase.client
      .from('events')
      .update(updatedEvent)
      .eq('id', params.id);

    if (error) {
      console.error('Supabase error:', error);
      return json({ error: error.message }, { status: 500 });
    }

    return redirect(`/events`);
  } catch (error) {
    console.error('Error in action:', error);
    return json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export default function EditEvent() {
  const { event } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const params = useParams();
  const [date, setDate] = useState<Date>(parseISO(event.date));
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [agendaItems, setAgendaItems] = useState<Partial<AgendaItem>[]>(
    event.agenda
  );
  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (event?.date) {
      setDate(parseISO(event.date));
    }
    if (event?.agenda) {
      setAgendaItems(event.agenda);
    }
  }, [event]);

  const addAgendaItem = () => {
    setAgendaItems([
      ...agendaItems,
      { time: '', title: '', description: '', speaker: '' },
    ]);
  };

  const removeAgendaItem = (index: number) => {
    setAgendaItems(agendaItems.filter((_, i) => i !== index));
    const newErrors = { ...validationErrors };
    delete newErrors[`agenda[${index}].time`];
    delete newErrors[`agenda[${index}].title`];
    delete newErrors[`agenda[${index}].description`];
    setValidationErrors(newErrors);
  };

  const updateAgendaItem = (
    index: number,
    field: keyof AgendaItem,
    value: string
  ) => {
    const newItems = [...agendaItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setAgendaItems(newItems);
    if (value) {
      const newErrors = { ...validationErrors };
      delete newErrors[`agenda[${index}].${field}`];
      setValidationErrors(newErrors);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4 flex flex-col items-center justify-center">
      <Form method="post" className="space-y-6">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={event.title}
              required
              disabled={isSubmitting}
              aria-invalid={validationErrors.title ? 'true' : undefined}
            />
            {validationErrors.title && (
              <p className="text-sm text-red-500 mt-1">
                {validationErrors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground',
                      validationErrors.date && 'border-red-500'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
                  <Calendar
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date: Date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              {validationErrors.date && (
                <p className="text-sm text-red-500 mt-1">
                  {validationErrors.date}
                </p>
              )}
            </div>
            <input type="hidden" name="date" value={date?.toISOString()} />
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                name="time"
                defaultValue={event.time}
                placeholder="e.g., 09:30 - 03:00 IST"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              name="venue"
              defaultValue={event.venue}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid gap-4">
          <h3 className="font-semibold">Leading Clan Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clanName">Clan Name</Label>
              <Input
                id="clanName"
                name="clanName"
                defaultValue={event.leading_clan.name}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="clanScore">Clan Score</Label>
              <Input
                id="clanScore"
                name="clanScore"
                type="number"
                defaultValue={event.leading_clan.score}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Agenda</h3>
            <Button
              type="button"
              onClick={addAgendaItem}
              variant="outline"
              size="sm"
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <AnimatePresence>
            {agendaItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid gap-4 p-4 border rounded-lg relative"
              >
                {agendaItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => removeAgendaItem(index)}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Time Slot</Label>
                    <Input
                      value={item.time}
                      onChange={(e) =>
                        updateAgendaItem(index, 'time', e.target.value)
                      }
                      placeholder="e.g., 19:00 - 19:30"
                      required
                      disabled={isSubmitting}
                      aria-invalid={
                        validationErrors[`agenda[${index}].time`]
                          ? 'true'
                          : undefined
                      }
                    />
                    {validationErrors[`agenda[${index}].time`] && (
                      <p className="text-sm text-red-500 mt-1">
                        {validationErrors[`agenda[${index}].time`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={item.title}
                      onChange={(e) =>
                        updateAgendaItem(index, 'title', e.target.value)
                      }
                      required
                      disabled={isSubmitting}
                      aria-invalid={
                        validationErrors[`agenda[${index}].title`]
                          ? 'true'
                          : undefined
                      }
                    />
                    {validationErrors[`agenda[${index}].title`] && (
                      <p className="text-sm text-red-500 mt-1">
                        {validationErrors[`agenda[${index}].title`]}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateAgendaItem(index, 'description', e.target.value)
                    }
                    required
                    disabled={isSubmitting}
                    aria-invalid={
                      validationErrors[`agenda[${index}].description`]
                        ? 'true'
                        : undefined
                    }
                  />
                  {validationErrors[`agenda[${index}].description`] && (
                    <p className="text-sm text-red-500 mt-1">
                      {validationErrors[`agenda[${index}].description`]}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Speaker (optional)</Label>
                  <Input
                    value={item.speaker}
                    onChange={(e) =>
                      updateAgendaItem(index, 'speaker', e.target.value)
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center"
              >
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </motion.div>
            ) : (
              'Update Event'
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
}
