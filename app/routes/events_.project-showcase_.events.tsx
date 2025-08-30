import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useFetcher, Form, Link } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Users,
  MapPin,
  Clock,
  Trophy,
  Eye,
  Copy,
  Archive,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

import { createServerSupabase } from '~/utils/supabase.server';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { useToast } from '~/hooks/use-toast';
import { isOrganiser } from '~/utils/currentUser';

interface ShowcaseEvent {
  id: number;
  event_id: string;
  event_name: string;
  description: string;
  event_date: string;
  event_time: string;
  venue: string;
  max_slots: number;
  hosting_clan_id: number;
  hosting_clan_name: string;
  status: 'draft' | 'open' | 'closed' | 'completed' | 'cancelled';
  allocated_slots: number;
  available_slots: number;
  created_at: string;
  presentation_duration: number;
  qa_duration: number;
}

interface LoaderData {
  events: ShowcaseEvent[];
  clans: Array<{ id: number; clan_name: string; }>;
  error?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const organiserStatus = await isOrganiser(request);
  
  if (!organiserStatus) {
    return redirect('/events/project-showcase');
  }

  const response = new Response();
  const supabase = createServerSupabase(request, response);

  try {
    // Test basic connection first
    const { data: testQuery } = await supabase
      .from('members')
      .select('id')
      .limit(1);

    // Try to get events table
    const { data: events, error: eventsError } = await supabase
      .from('project_showcase_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      // If table doesn't exist, return empty data
      return json({
        events: [],
        clans: [],
        error: `Events table error: ${eventsError.message}`
      }, { headers: response.headers });
    }

    // Get all clans for dropdown
    const { data: clans } = await supabase
      .from('clans')
      .select('id, clan_name')
      .order('clan_name');

    // Simple return without complex slot counting for now
    return json({
      events: (events || []).map(event => ({
        ...event,
        allocated_slots: 0, // Temporary placeholder
        available_slots: event.max_slots,
        hosting_clan_name: 'Unknown' // Temporary placeholder
      })),
      clans: clans || [],
    }, { headers: response.headers });

  } catch (error) {
    console.error('Loader error:', error);
    return json({
      events: [],
      clans: [],
      error: `General error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { headers: response.headers });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const organiserStatus = await isOrganiser(request);
  
  if (!organiserStatus) {
    console.log('❌ ACTION: Unauthorized access attempt');
    return json({ error: 'Unauthorized' }, { status: 403 });
  }

  const response = new Response();
  const supabase = createServerSupabase(request, response);
  const formData = await request.formData();
  const intent = formData.get('intent');

  console.log('🚀 ACTION: Starting action with intent:', intent);

  if (intent === 'create_event') {
    const eventName = formData.get('eventName') as string;
    const description = formData.get('description') as string;
    const eventDate = formData.get('eventDate') as string;
    const eventTime = formData.get('eventTime') as string;
    const venue = formData.get('venue') as string;
    const maxSlots = Number(formData.get('maxSlots'));
    const hostingClanId = Number(formData.get('hostingClanId'));
    const presentationDuration = Number(formData.get('presentationDuration')) || 10;
    const qaDuration = Number(formData.get('qaDuration')) || 5;

    // Generate unique event ID
    const eventId = `project-showcase-${Date.now()}`;

    console.log('📝 CREATE_EVENT: Data to insert:', {
      event_id: eventId,
      event_name: eventName,
      description,
      event_date: eventDate,
      event_time: eventTime,
      venue,
      max_slots: maxSlots,
      hosting_clan_id: hostingClanId,
      presentation_duration: presentationDuration,
      qa_duration: qaDuration,
      status: 'draft'
    });

    const { data, error } = await supabase
      .from('project_showcase_events')
      .insert({
        event_id: eventId,
        event_name: eventName,
        description,
        event_date: eventDate,
        event_time: eventTime,
        venue,
        max_slots: maxSlots,
        hosting_clan_id: hostingClanId,
        presentation_duration: presentationDuration,
        qa_duration: qaDuration,
        status: 'draft'
      });

    console.log('💾 CREATE_EVENT: Supabase response:', { data, error });

    if (error) {
      console.error('❌ CREATE_EVENT: Failed with error:', error);
      return json({ error: `Failed to create event: ${error.message}` }, { status: 500 });
    }

    console.log('✅ CREATE_EVENT: Success');
    return json({ success: true, message: 'Event created successfully!' });
  }

  if (intent === 'update_status') {
    const eventId = formData.get('eventId') as string;
    const status = formData.get('status') as string;

    console.log('🔄 UPDATE_STATUS: Updating event:', { eventId, status });

    const { data, error } = await supabase
      .from('project_showcase_events')
      .update({ status })
      .eq('id', eventId);

    console.log('💾 UPDATE_STATUS: Supabase response:', { data, error });

    if (error) {
      console.error('❌ UPDATE_STATUS: Failed with error:', error);
      return json({ error: `Failed to update event status: ${error.message}` }, { status: 500 });
    }

    console.log('✅ UPDATE_STATUS: Success');
    return json({ success: true, message: 'Event status updated successfully!' });
  }

  if (intent === 'delete_event') {
    const eventId = formData.get('eventId') as string;

    console.log('🗑️ DELETE_EVENT: Deleting event:', eventId);

    // First delete all related slots
    const { data: slotsData, error: slotsError } = await supabase
      .from('project_showcase_slots')
      .delete()
      .eq('showcase_event_id', eventId);

    console.log('💾 DELETE_EVENT: Slots deletion response:', { slotsData, slotsError });

    // Then delete the event
    const { data, error } = await supabase
      .from('project_showcase_events')
      .delete()
      .eq('id', eventId);

    console.log('💾 DELETE_EVENT: Event deletion response:', { data, error });

    if (error) {
      console.error('❌ DELETE_EVENT: Failed with error:', error);
      return json({ error: `Failed to delete event: ${error.message}` }, { status: 500 });
    }

    console.log('✅ DELETE_EVENT: Success');
    return json({ success: true, message: 'Event deleted successfully!' });
  }

  if (intent === 'duplicate_event') {
    const sourceEventId = formData.get('eventId') as string;

    console.log('📋 DUPLICATE_EVENT: Duplicating event:', sourceEventId);

    // Get source event
    const { data: sourceEvent, error: fetchError } = await supabase
      .from('project_showcase_events')
      .select('*')
      .eq('id', sourceEventId)
      .single();

    console.log('💾 DUPLICATE_EVENT: Source event fetch response:', { sourceEvent, fetchError });

    if (fetchError || !sourceEvent) {
      console.error('❌ DUPLICATE_EVENT: Source event not found:', fetchError);
      return json({ error: 'Source event not found' }, { status: 404 });
    }

    // Create duplicate with new ID
    const newEventId = `project-showcase-${Date.now()}`;
    const duplicateData = {
      ...sourceEvent,
      id: undefined,
      event_id: newEventId,
      event_name: `${sourceEvent.event_name} (Copy)`,
      status: 'draft',
      created_at: undefined,
      updated_at: undefined
    };

    console.log('📝 DUPLICATE_EVENT: Data to insert:', duplicateData);

    const { data, error } = await supabase
      .from('project_showcase_events')
      .insert(duplicateData);

    console.log('💾 DUPLICATE_EVENT: Supabase insert response:', { data, error });

    if (error) {
      console.error('❌ DUPLICATE_EVENT: Failed with error:', error);
      return json({ error: `Failed to duplicate event: ${error.message}` }, { status: 500 });
    }

    console.log('✅ DUPLICATE_EVENT: Success');
    return json({ success: true, message: 'Event duplicated successfully!' });
  }

  console.log('❌ ACTION: Invalid action intent:', intent);
  return json({ error: 'Invalid action' }, { status: 400 });
}

export default function ShowcaseEventsManagement() {
  const { events, clans, error } = useLoaderData<typeof loader>() as LoaderData;
  const fetcher = useFetcher();
  const { toast } = useToast();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    if (fetcher.data) {
      const data = fetcher.data as any;
      if (data.success) {
        toast({
          title: 'Success!',
          description: data.message,
          duration: 3000,
        });
        setShowCreateDialog(false);
        setShowDeleteConfirm(null);
        // Reload the page to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
      }
    }
  }, [fetcher.data, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'open': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'closed': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'open': return <CheckCircle2 className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      case 'completed': return <Trophy className="w-4 h-4" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4" />;
      default: return <Edit className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Settings className="w-8 h-8 text-purple-400" />
                Project Showcase Events Management
              </h1>
              <p className="text-gray-300 mt-2">Create and manage multiple project showcase events</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => window.location.href = '/events/project-showcase'}
                variant="outline"
                className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20"
              >
                View Current Event
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-green-500/50 text-green-300 hover:bg-green-500/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Create Event Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New Showcase Event
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project Showcase Event</DialogTitle>
              </DialogHeader>
              <fetcher.Form method="post" className="space-y-4" onSubmit={(e) => {
                console.log('📝 Client: Submitting create event form');
                const formData = new FormData(e.currentTarget);
                console.log('📝 Client: Form data:', Object.fromEntries(formData.entries()));
              }}>
                <input type="hidden" name="intent" value="create_event" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Event Name</Label>
                    <Input
                      name="eventName"
                      placeholder="e.g., Project Showcase Spring 2025"
                      className="bg-gray-800 border-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <Label>Venue</Label>
                    <Input
                      name="venue"
                      placeholder="e.g., Main Auditorium"
                      className="bg-gray-800 border-gray-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    name="description"
                    placeholder="Event description and details..."
                    className="bg-gray-800 border-gray-700"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Event Date</Label>
                    <Input
                      name="eventDate"
                      type="date"
                      className="bg-gray-800 border-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <Label>Event Time</Label>
                    <Input
                      name="eventTime"
                      type="time"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label>Max Slots</Label>
                    <Input
                      name="maxSlots"
                      type="number"
                      defaultValue={25}
                      min={1}
                      max={100}
                      className="bg-gray-800 border-gray-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Hosting Clan</Label>
                    <Select name="hostingClanId">
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select clan" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {clans.map(clan => (
                          <SelectItem key={clan.id} value={clan.id.toString()}>
                            {clan.clan_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Presentation Duration (min)</Label>
                    <Input
                      name="presentationDuration"
                      type="number"
                      defaultValue={10}
                      min={5}
                      max={30}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label>Q&A Duration (min)</Label>
                    <Input
                      name="qaDuration"
                      type="number"
                      defaultValue={5}
                      min={2}
                      max={15}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={fetcher.state === 'submitting'}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Create Event
                  </Button>
                </div>
              </fetcher.Form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Events List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 p-6 hover:scale-105 transition-all duration-300">
                {/* Event Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{event.event_name}</h3>
                    <p className="text-sm text-gray-400">{event.event_id}</p>
                  </div>
                  <Badge className={getStatusColor(event.status)}>
                    {getStatusIcon(event.status)}
                    <span className="ml-1 capitalize">{event.status}</span>
                  </Badge>
                </div>

                {/* Event Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.event_date).toLocaleDateString()}
                    {event.event_time && ` at ${event.event_time}`}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <MapPin className="w-4 h-4" />
                    {event.venue}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Users className="w-4 h-4" />
                    {event.allocated_slots}/{event.max_slots} slots filled
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Clock className="w-4 h-4" />
                    {event.presentation_duration}min + {event.qa_duration}min Q&A
                  </div>
                  {event.hosting_clan_name && (
                    <div className="text-sm text-purple-300">
                      Hosted by {event.hosting_clan_name}
                    </div>
                  )}
                </div>

                {/* Description */}
                {event.description && (
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {event.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Slot Allocation</span>
                    <span>{Math.round((event.allocated_slots / event.max_slots) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.allocated_slots / event.max_slots) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20"
                    onClick={() => window.location.href = `/events/project-showcase/manage?event=${event.event_id}`}
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Manage
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500/50 text-green-300 hover:bg-green-500/20"
                    onClick={() => window.location.href = `/events/project-showcase?event=${event.event_id}`}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>

                  <fetcher.Form method="post" className="inline">
                    <input type="hidden" name="intent" value="duplicate_event" />
                    <input type="hidden" name="eventId" value={event.id} />
                    <Button
                      type="submit"
                      size="sm"
                      variant="outline"
                      className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
                      onClick={() => console.log('📋 Client: Duplicating event', event.id, event.event_name)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Duplicate
                    </Button>
                  </fetcher.Form>

                  {/* Status Change */}
                  <Select
                    value={event.status}
                    onValueChange={(value) => {
                      console.log('🔄 Client: Updating status for event', event.id, 'to', value);
                      fetcher.submit(
                        { intent: 'update_status', eventId: event.id.toString(), status: value },
                        { method: 'post' }
                      );
                    }}
                  >
                    <SelectTrigger className="w-24 h-8 bg-gray-700 border-gray-600 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Delete Button */}
                  <Dialog 
                    open={showDeleteConfirm === event.id} 
                    onOpenChange={(open) => setShowDeleteConfirm(open ? event.id : null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700 text-white">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-400">
                          <AlertTriangle className="w-5 h-5" />
                          Delete Event
                        </DialogTitle>
                      </DialogHeader>
                      <Alert className="border-red-500/50 bg-red-500/10">
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription className="text-red-200">
                          This will permanently delete "{event.event_name}" and all associated slot allocations. This action cannot be undone.
                        </AlertDescription>
                      </Alert>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(null)}
                        >
                          Cancel
                        </Button>
                        <fetcher.Form method="post" className="inline">
                          <input type="hidden" name="intent" value="delete_event" />
                          <input type="hidden" name="eventId" value={event.id} />
                          <Button
                            type="submit"
                            variant="destructive"
                            disabled={fetcher.state === 'submitting'}
                          >
                            Delete Event
                          </Button>
                        </fetcher.Form>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {events.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Events Created</h3>
            <p className="text-gray-500 mb-4">Create your first project showcase event to get started!</p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Event
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
