import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, useFetcher, Form } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Users, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

import { createServerSupabase } from '~/utils/supabase.server';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { useToast } from '~/hooks/use-toast';
import { isOrganiser } from '~/utils/currentUser';
import { redirect } from '@remix-run/node';

interface ManagementData {
  currentEvent: {
    id: number;
    event_id: string;
    event_name: string;
    description: string;
    event_date: string;
    venue: string;
    max_slots: number;
    hosting_clan_id: number;
    status: string;
  };
  allocatedSlots: any[];
  eligibleMembers: any[];
  stats: {
    totalSlots: number;
    allocatedSlots: number;
    availableSlots: number;
    eligibleMembers: number;
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const organiserStatus = await isOrganiser(request);
  
  if (!organiserStatus) {
    return redirect('/events/project-showcase');
  }

  const response = new Response();
  const supabase = createServerSupabase(request, response);
  
    // Get event ID from URL params (default to current open event)
  const url = new URL(request.url);
  let eventId = url.searchParams.get('event');
  
  // If no event specified in URL, get the currently open event
  if (!eventId) {
    const { data: openEvent } = await supabase
      .from('project_showcase_events')
      .select('event_id')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (openEvent) {
      eventId = openEvent.event_id;
    } else {
      return json({ error: 'No open event available' }, { status: 400 });
    }
  }
  
  // If no event specified in URL, get the currently open event
  if (!eventId) {
    const { data: openEvent } = await supabase
      .from('project_showcase_events')
      .select('event_id')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (openEvent) {
      eventId = openEvent.event_id;
    } else {
      // No open event found, redirect to events management
      return redirect('/events/project-showcase/events');
    }
  }

  // Get event details
  const { data: eventData } = await supabase
    .from('project_showcase_events')
    .select('*')
    .eq('event_id', eventId)
    .single();

  if (!eventData) {
    return redirect('/events/project-showcase/events');
  }

  // Get allocated slots with member details for this event
  const { data: allocatedSlots } = await supabase
    .from('project_showcase_slots_with_members')
    .select('*')
    .eq('event_id', eventId)
    .order('slot_number');

  // Get all eligible members
  const { data: eligibleMembers } = await supabase
    .from('members')
    .select('id, name, github_username, title, avatar_url, bash_points, clan_name, basher_no')
    .in('title', ['Basher', 'Captain Bash', 'Legacy Basher', 'Organiser'])
    .order('name');

  const stats = {
    totalSlots: eventData.max_slots,
    allocatedSlots: allocatedSlots?.length || 0,
    availableSlots: eventData.max_slots - (allocatedSlots?.length || 0),
    eligibleMembers: eligibleMembers?.length || 0,
  };

  return json({
    currentEvent: eventData,
    allocatedSlots: allocatedSlots || [],
    eligibleMembers: eligibleMembers || [],
    stats,
  }, { headers: response.headers });
}

export async function action({ request }: ActionFunctionArgs) {
  const organiserStatus = await isOrganiser(request);
  
  if (!organiserStatus) {
    return json({ error: 'Unauthorized' }, { status: 403 });
  }

  const response = new Response();
  const supabase = createServerSupabase(request, response);
  const formData = await request.formData();
  const intent = formData.get('intent');
  
  // Get event ID from URL params
  const url = new URL(request.url);
  const eventId = url.searchParams.get('event') || 'project-showcase-2025';

  if (intent === 'manual_allocate') {
    const memberId = Number(formData.get('memberId'));
    const slotNumber = Number(formData.get('slotNumber'));

    // Get member details
    const { data: member } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (!member) {
      return json({ error: 'Member not found' }, { status: 404 });
    }

    // Check if slot number is available
    const { data: existingSlot } = await supabase
      .from('project_showcase_slots')
      .select('*')
      .eq('slot_number', slotNumber)
      .eq('event_id', eventId)
      .single();

    if (existingSlot) {
      return json({ error: 'Slot number already allocated' }, { status: 400 });
    }

    // Check if member already has a slot
    const { data: memberSlot } = await supabase
      .from('project_showcase_slots')
      .select('*')
      .eq('member_id', memberId)
      .eq('event_id', eventId)
      .single();

    if (memberSlot) {
      return json({ error: 'Member already has a slot allocated' }, { status: 400 });
    }

    // Allocate the slot
    const { error } = await supabase
      .from('project_showcase_slots')
      .insert({
        member_id: memberId,
        member_name: member.name,
        member_github_username: member.github_username,
        member_title: member.title,
        slot_number: slotNumber,
        event_id: eventId,
        event_name: 'Project Showcase Event',
        status: 'allocated'
      });

    if (error) {
      return json({ error: 'Failed to allocate slot' }, { status: 500 });
    }

    return json({ success: true, message: `Slot #${slotNumber} allocated to ${member.name}` });
  }

  if (intent === 'clear_all_slots') {
    const { error } = await supabase
      .from('project_showcase_slots')
      .delete()
      .eq('event_id', eventId);

    if (error) {
      return json({ error: 'Failed to clear slots' }, { status: 500 });
    }

    return json({ success: true, message: 'All slots cleared successfully' });
  }

  if (intent === 'export_slots') {
    const { data: slots } = await supabase
      .from('project_showcase_slots_with_members')
      .select('*')
      .eq('event_id', eventId)
      .order('slot_number');

    return json({ success: true, data: slots, message: 'Slots exported successfully' });
  }

  if (intent === 'update_slot_status') {
    const slotId = Number(formData.get('slotId'));
    const status = formData.get('status') as string;

    const { error } = await supabase
      .from('project_showcase_slots')
      .update({ status })
      .eq('id', slotId);

    if (error) {
      return json({ error: 'Failed to update slot status' }, { status: 500 });
    }

    return json({ success: true, message: 'Slot status updated successfully' });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

export default function ProjectShowcaseManagement() {
  const { currentEvent, allocatedSlots, eligibleMembers, stats } = useLoaderData<typeof loader>() as ManagementData;
  const fetcher = useFetcher();
  const { toast } = useToast();

  const [selectedMember, setSelectedMember] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [showManualAllocation, setShowManualAllocation] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Generate available slot numbers
  const allocatedNumbers = allocatedSlots.map(slot => slot.slot_number);
  const availableSlotNumbers = Array.from({ length: currentEvent.max_slots }, (_, i) => i + 1)
    .filter(num => !allocatedNumbers.includes(num));

  // Get members without slots
  const allocatedMemberIds = allocatedSlots.map(slot => slot.member_id);
  const availableMembers = eligibleMembers.filter(member => !allocatedMemberIds.includes(member.id));

  useEffect(() => {
    if (fetcher.data) {
      const data = fetcher.data as any;
      if (data.success) {
        toast({
          title: 'Success!',
          description: data.message,
          duration: 3000,
        });

        if (data.data) {
          // Handle export data
          const blob = new Blob([JSON.stringify(data.data, null, 2)], {
            type: 'application/json'
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `project-showcase-slots-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }

        setShowManualAllocation(false);
        setShowClearConfirm(false);
        setSelectedMember('');
        setSelectedSlot('');
      } else if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
      }
    }
  }, [fetcher.data, toast]);

  const handleManualAllocation = () => {
    if (!selectedMember || !selectedSlot) {
      toast({
        title: 'Error',
        description: 'Please select both member and slot number',
        variant: 'destructive',
      });
      return;
    }

    fetcher.submit(
      { 
        intent: 'manual_allocate', 
        memberId: selectedMember, 
        slotNumber: selectedSlot 
      },
      { method: 'post' }
    );
  };

  const handleClearAllSlots = () => {
    fetcher.submit(
      { intent: 'clear_all_slots' },
      { method: 'post' }
    );
  };

  const handleExportSlots = () => {
    fetcher.submit(
      { intent: 'export_slots' },
      { method: 'post' }
    );
  };

  const handleStatusUpdate = (slotId: number, status: string) => {
    fetcher.submit(
      { intent: 'update_slot_status', slotId: slotId.toString(), status },
      { method: 'post' }
    );
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
                {currentEvent.event_name} - Management
              </h1>
              <p className="text-gray-300 mt-2">Organiser control panel for slot allocation and event management</p>
              <div className="mt-3 flex gap-2">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  Event ID: {currentEvent.event_id}
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  Status: {currentEvent.status}
                </Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  {new Date(currentEvent.event_date).toLocaleDateString()} at {currentEvent.venue}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => window.location.href = '/events/project-showcase/events'}
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
              >
                All Events
              </Button>
              <Button
                onClick={() => window.location.href = `/events/project-showcase?event=${currentEvent.event_id}`}
                variant="outline"
                className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20"
              >
                View Public Page
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-green-500/50 text-green-300 hover:bg-green-500/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-blue-500/20 border-blue-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Total Slots</p>
                <p className="text-2xl font-bold">{stats.totalSlots}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
          <Card className="bg-green-500/20 border-green-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Allocated</p>
                <p className="text-2xl font-bold">{stats.allocatedSlots}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          <Card className="bg-yellow-500/20 border-yellow-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm">Available</p>
                <p className="text-2xl font-bold">{stats.availableSlots}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>
          <Card className="bg-purple-500/20 border-purple-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Eligible Members</p>
                <p className="text-2xl font-bold">{stats.eligibleMembers}</p>
              </div>
              <UserPlus className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <Dialog open={showManualAllocation} onOpenChange={setShowManualAllocation}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Manual Allocation
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Manual Slot Allocation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Member</Label>
                  <Select value={selectedMember} onValueChange={setSelectedMember}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Choose a member" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {availableMembers.map(member => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.name} (@{member.github_username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Select Slot Number</Label>
                  <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Choose a slot" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {availableSlotNumbers.map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          Slot #{num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleManualAllocation}
                  disabled={!selectedMember || !selectedSlot || fetcher.state === 'submitting'}
                  className="w-full"
                >
                  Allocate Slot
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleExportSlots}
            variant="outline"
            disabled={fetcher.state === 'submitting'}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>

          <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Slots
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  Confirm Clear All Slots
                </DialogTitle>
              </DialogHeader>
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-red-200">
                  This action cannot be undone. All allocated slots will be permanently removed.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClearAllSlots}
                  disabled={fetcher.state === 'submitting'}
                >
                  Yes, Clear All
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Allocated Slots Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4">Allocated Slots ({allocatedSlots.length})</h2>
            
            {allocatedSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No slots allocated yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-2">Slot #</th>
                      <th className="text-left p-2">Member</th>
                      <th className="text-left p-2">Title</th>
                      <th className="text-left p-2">Clan</th>
                      <th className="text-left p-2">Points</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Allocated At</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocatedSlots.map((slot) => (
                      <tr key={slot.id} className="border-b border-gray-700/50">
                        <td className="p-2">
                          <Badge className="bg-yellow-500/20 text-yellow-300">
                            #{slot.slot_number}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            {slot.avatar_url && (
                              <img
                                src={slot.avatar_url}
                                alt={slot.member_name}
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                            <div>
                              <p className="font-medium">{slot.member_name}</p>
                              <p className="text-sm text-gray-400">@{slot.member_github_username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{slot.member_title}</Badge>
                        </td>
                        <td className="p-2">{slot.clan_name || 'N/A'}</td>
                        <td className="p-2">{slot.bash_points}</td>
                        <td className="p-2">
                          <Select
                            value={slot.status}
                            onValueChange={(value) => handleStatusUpdate(slot.id, value)}
                          >
                            <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="allocated">Allocated</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          {new Date(slot.allocated_at).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <fetcher.Form method="post" className="inline">
                            <input type="hidden" name="intent" value="remove_slot" />
                            <input type="hidden" name="slotId" value={slot.id} />
                            <Button
                              type="submit"
                              variant="destructive"
                              size="sm"
                              disabled={fetcher.state === 'submitting'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </fetcher.Form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
