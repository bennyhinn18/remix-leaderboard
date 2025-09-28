import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, useFetcher, useNavigation } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  Users, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Shuffle,
  CheckCircle2,
  Star,
  Zap,
  Presentation,
  Settings
} from 'lucide-react';

import { SlotPicker } from '~/components/project-showcase/slot-picker';
import { SlotDisplay } from '~/components/project-showcase/slot-display';

import { createSupabaseServerClient } from '~/utils/supabase.server';
import { initSupabase } from '~/utils/supabase.client';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Card } from '~/components/ui/card';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { useToast } from '~/hooks/use-toast';
import { MainNav } from '~/components/main-nav';
import { isOrganiser } from '~/utils/currentUser';

interface SlotAllocation {
  id: number;
  slot_number: number;
  member_id: number;
  member_name: string;
  member_github_username: string;
  member_title: string;
  allocated_at: string;
  status: 'allocated' | 'confirmed' | 'cancelled';
  avatar_url?: string;
  bash_points?: number;
  clan_name?: string;
  basher_no?: string;
}

interface EligibleMember {
  id: number;
  name: string;
  github_username: string;
  title: string;
  avatar_url?: string;
  bash_points: number;
  clan_name?: string;
  basher_no?: string;
}

interface ProjectShowcaseData {
  isOrganiser: boolean;
  currentMember: EligibleMember | null;
  allocatedSlots: SlotAllocation[];
  eligibleMembers: EligibleMember[];
  isEligible: boolean;
  hasSlot: boolean;
  availableSlots: number;
  currentEvent: any;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = createSupabaseServerClient(request);
  
  // Get current user
  const { data: { user } } = await supabase.client.auth.getUser();
  
  const organiserData = await isOrganiser(request);
  
  // First, get the currently open event
  const { data: openEvent } = await supabase.client
    .from('project_showcase_events')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // If no open event, return empty state
  if (!openEvent) {
    return json({
      isOrganiser: organiserData.isOrganiser,
      currentMember: null,
      allocatedSlots: [],
      eligibleMembers: [],
      isEligible: false,
      hasSlot: false,
      availableSlots: 0,
      currentEvent: null,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    }, { headers: response.headers });
  }

  let currentMember: EligibleMember | null = null;
  let isEligible = false;
  let hasSlot = false;

  if (user) {
    const githubUsername = user.user_metadata?.user_name || 
      user.identities?.find((i: any) => i.provider === 'github')?.identity_data?.user_name;

    if (githubUsername) {
      // Get current member details
      const { data: memberData } = await supabase.client
        .from('members')
        .select('*')
        .eq('github_username', githubUsername)
        .single();

      if (memberData) {
        currentMember = {
          id: memberData.id,
          name: memberData.name,
          github_username: memberData.github_username,
          title: memberData.title || 'Member',
          avatar_url: memberData.avatar_url,
          bash_points: memberData.bash_points || 0,
          clan_name: memberData.clan_name,
          basher_no: memberData.basher_no,
        };

        // Check if member is eligible (specific titles: Basher, Captain Bash, Legacy Basher, Organiser)
        const eligibleTitles = ['Basher', 'Captain Bash', 'Legacy Basher', 'Organiser'];
        isEligible = eligibleTitles.includes(memberData.title) || false;

        // Check if member already has a slot for the current open event
        const { data: existingSlot } = await supabase.client
          .from('project_showcase_slots')
          .select('*')
          .eq('member_id', memberData.id)
          .eq('event_id', openEvent.event_id)
          .single();

        hasSlot = !!existingSlot;
      }
    }
  }

  // Get all eligible members (those with eligible titles)
  const { data: eligibleMembers } = await supabase.client
    .from('members')
    .select('id, name, github_username, title, avatar_url, bash_points, clan_name, basher_no')
    .in('title', ['Basher', 'Captain Bash', 'Legacy Basher', 'Organiser'])
    .order('name');

  // Get allocated slots for the current open event
  const { data: allocatedSlots } = await supabase.client
    .from('project_showcase_slots_with_members')
    .select('*')
    .eq('event_id', openEvent.event_id)
    .order('slot_number');

  const availableSlots = openEvent.max_slots - (allocatedSlots?.length || 0);

  return json({
    isOrganiser: organiserData.isOrganiser,
    currentMember,
    allocatedSlots: allocatedSlots || [],
    eligibleMembers: eligibleMembers || [],
    isEligible,
    hasSlot,
    availableSlots,
    currentEvent: openEvent,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  }, { headers: response.headers });
}

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response();
  const supabase = createSupabaseServerClient(request);
  const formData = await request.formData();
  const intent = formData.get('intent');

  // Get the currently open event
  const { data: openEvent } = await supabase.client
    .from('project_showcase_events')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!openEvent) {
    return json({ error: 'No open event available for slot allocation' }, { status: 400 });
  }

  if (intent === 'allocate_slot') {
    const memberId = Number(formData.get('memberId'));
    
    // Get member details
    const { data: member } = await supabase.client
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (!member) {
      return json({ error: 'Member not found' }, { status: 404 });
    }

    // Check if member is eligible
    const eligibleTitles = ['Basher', 'Captain Bash', 'Legacy Basher', 'Organiser'];
    const isEligibleMember = eligibleTitles.includes(member.title);
    
    if (!isEligibleMember) {
      return json({ error: 'Member is not eligible for lot allocation' }, { status: 400 });
    }

    // Check if member already has a slot for the current event
    const { data: existingSlot } = await supabase.client
      .from('project_showcase_slots')
      .select('*')
      .eq('member_id', memberId)
      .eq('event_id', openEvent.event_id)
      .single();

    if (existingSlot) {
      return json({ error: 'Member already has a slot allocated' }, { status: 400 });
    }

    // Get available slot numbers for the current event
    const { data: allocatedSlots } = await supabase.client
      .from('project_showcase_slots')
      .select('slot_number')
      .eq('event_id', openEvent.event_id);

    const allocatedNumbers = allocatedSlots?.map(slot => slot.slot_number) || [];
    const availableNumbers = Array.from({ length: openEvent.max_slots }, (_, i) => i + 1)
      .filter(num => !allocatedNumbers.includes(num));

    if (availableNumbers.length === 0) {
      return json({ error: 'No slots available' }, { status: 400 });
    }

    // Randomly select a slot number
    const randomSlotNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];

    // Allocate the slot
    const { error } = await supabase.client
      .from('project_showcase_slots')
      .insert({
        member_id: memberId,
        member_name: member.name,
        member_github_username: member.github_username,
        member_title: member.title,
        slot_number: randomSlotNumber,
        event_id: openEvent.event_id,
        event_name: openEvent.event_name,
        status: 'allocated'
      });

    if (error) {
      console.error('Error allocating slot:', error);
      return json({ error: 'Failed to allocate slot' }, { status: 500 });
    }

    return json({ 
      success: true, 
      slotNumber: randomSlotNumber,
      message: `Congratulations! You've been allocated slot #${randomSlotNumber}` 
    });
  }

  if (intent === 'remove_slot') {
    const organiserData = await isOrganiser(request);
    if (!organiserData.isOrganiser) {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const slotId = Number(formData.get('slotId'));
    
    const { error } = await supabase.client
      .from('project_showcase_slots')
      .delete()
      .eq('id', slotId);

    if (error) {
      return json({ error: 'Failed to remove slot' }, { status: 500 });
    }

    return json({ success: true, message: 'Slot removed successfully' });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

export default function ProjectShowcase() {
  const { 
    isOrganiser,
    currentMember, 
    allocatedSlots, 
    eligibleMembers,
    isEligible, 
    hasSlot, 
    availableSlots,
    currentEvent,
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  } = useLoaderData<typeof loader>() as ProjectShowcaseData;

  const fetcher = useFetcher();
  const navigation = useNavigation();
  const { toast } = useToast();

  const [isSlotPickerVisible, setIsSlotPickerVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slots, setSlots] = useState<SlotAllocation[]>(allocatedSlots);

  const isLoading = navigation.state === 'loading' || fetcher.state === 'submitting';

  // Calculate available slot numbers for the current event
  const getAvailableSlotNumbers = () => {
    if (!currentEvent) return [];
    
    const allocatedNumbers = slots.map(slot => slot.slot_number);
    const availableNumbers = Array.from({ length: currentEvent.max_slots }, (_, i) => i + 1)
      .filter(num => !allocatedNumbers.includes(num));
    
    return availableNumbers;
  };

  // Update slots when data changes
  useEffect(() => {
    setSlots(allocatedSlots);
  }, [allocatedSlots]);

  // Handle fetcher submission result
  useEffect(() => {
    if (fetcher.data) {
      const data = fetcher.data as any;
      if (data.success) {
        toast({
          title: 'Success!',
          description: data.message,
          duration: 5000,
        });

        if (data.slotNumber) {
          // Trigger confetti for slot allocation
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } else if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
      }
    }
  }, [fetcher.data, toast]);

  const handleSlotAllocation = () => {
    if (!currentMember) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to allocate a slot',
        variant: 'destructive',
      });
      return;
    }

    setIsAnimating(true);
    setIsSlotPickerVisible(true);

    // Simulate slot machine animation
    setTimeout(() => {
      fetcher.submit(
        { intent: 'allocate_slot', memberId: currentMember.id.toString() },
        { method: 'post' }
      );
      setIsAnimating(false);
    }, 3000);
  };

  const handleRemoveSlot = (slotId: number) => {
    fetcher.submit(
      { intent: 'remove_slot', slotId: slotId.toString() },
      { method: 'post' }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Navigation */}
      {currentMember && (
        <MainNav
          user={{
            id: currentMember.id,
            name: currentMember.name,
            github_username: currentMember.github_username,
            points: currentMember.bash_points,
            basherLevel: currentMember.title,
            basherNo: currentMember.basher_no || '',
            clanName: currentMember.clan_name || '',
            avatar_url: currentMember.avatar_url,
            languages: [],
            title: currentMember.title,
            joinedDate: new Date(),
            bashPoints: currentMember.bash_points,
            projects: 0,
            certifications: 0,
            internships: 0,
            courses: 0,
            resume_url: '',
            portfolio_url: '',
            domains: [],
            streaks: { github: 0, leetcode: 0, duolingo: 0, discord: 0, books: 0 },
            hobbies: [],
            testimonial: '',
            gpa: 0,
            attendance: 0,
          }}
          notifications={[]}
          unreadCount={0}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Event Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {!currentEvent ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-4 rounded-full">
                  <Presentation className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-400 mb-4">
                No Active Event
              </h1>
              <p className="text-xl text-gray-500 max-w-3xl mx-auto mb-6">
                There are currently no open Project Showcase events. Check back later or contact an organiser.
              </p>
              {isOrganiser && (
                <Button
                  onClick={() => window.location.href = '/events/project-showcase/events'}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Manage Events
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full">
                  <Presentation className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
                {currentEvent.event_name}
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
                {currentEvent.description || "An exclusive opportunity for Bashers to present their innovative projects and showcase their skills to the community."}
              </p>
              
              <div className="text-center mb-4">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-lg px-4 py-2">
                  🔴 Event Active - Slots Available!
                </Badge>
              </div>
              
              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4">
                  <div className="flex items-center justify-center gap-2 text-blue-300">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">
                      {new Date(currentEvent.event_date).toLocaleDateString()}
                      {currentEvent.event_time && ` at ${currentEvent.event_time}`}
                    </span>
                  </div>
                </Card>
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4">
                  <div className="flex items-center justify-center gap-2 text-green-300">
                    <MapPin className="w-5 h-5" />
                    <span className="font-medium">{currentEvent.venue}</span>
                  </div>
                </Card>
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4">
                  <div className="flex items-center justify-center gap-2 text-purple-300">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">{availableSlots}/{currentEvent.max_slots} Slots Available</span>
                  </div>
                </Card>
              </div>
            </>
          )}
        </motion.div>

        {/* Only show event content if there's an active event */}
        {currentEvent && (
          <>
            {/* Event Instructions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400" />
                  Event Guidelines
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-blue-300 mb-2">Eligibility</h3>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Must have "Basher" title</li>
                      <li>• Active community member</li>
                      <li>• Project ready for presentation</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-300 mb-2">Presentation Format</h3>
                    <ul className="text-gray-300 space-y-1">
                      <li>• {currentEvent.presentation_duration || 10} minutes presentation</li>
                      <li>• {currentEvent.qa_duration || 5} minutes Q&A</li>
                      <li>• Live demo encouraged</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-200 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      <strong>Important:</strong> Lots are allocated randomly to ensure fairness. Once allocated, prepare your best presentation!
                    </p>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-200 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <strong>Event Date:</strong> {new Date(currentEvent.event_date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} {currentEvent.event_time && `at ${currentEvent.event_time}`}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

        {/* Slot Allocation Section */}
        {currentMember && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Lot Allocation</h2>
              
              {!isEligible ? (
                <Alert className="max-w-2xl mx-auto">
                  <AlertDescription className="text-yellow-200">
                    Sorry, only members with "Basher" title are eligible for the Project Showcase. 
                    Continue contributing to the community to earn your Basher status!
                  </AlertDescription>
                </Alert>
              ) : hasSlot ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="w-16 h-16 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-400">Lot Allocated!</h3>
                  <p className="text-gray-300">
                    You already have a lot allocated for the Project Showcase. Check the list below for your slot number.
                  </p>
                </div>
              ) : availableSlots > 0 ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Ready to Secure Your Spot?</h3>
                    <p className="text-gray-300 mb-4">
                      {availableSlots} slots remaining out of 25. Click below to randomly allocate your presentation slot!
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleSlotAllocation}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-8 text-lg"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="flex items-center gap-2"
                      >
                        <Shuffle className="w-6 h-6" />
                        Allocating Slot...
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6" />
                        Pick My Slot
                      </div>
                    )}
                  </Button>
                </div>
              ) : (
                <Alert className="max-w-2xl mx-auto">
                  <AlertDescription className="text-red-200">
                    All 25 slots have been allocated! Better luck next time.
                  </AlertDescription>
                </Alert>
              )}
            </Card>
          </motion.div>
        )}

        {!currentMember && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Join the Showcase</h2>
              <p className="text-gray-300 mb-6">
                Log in with your GitHub account to check your eligibility and allocate a presentation slot.
              </p>
              <Button
                onClick={() => window.location.href = '/auth/github'}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Login with GitHub
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Slot Animation */}
        <SlotPicker
          isVisible={isSlotPickerVisible}
          onClose={() => setIsSlotPickerVisible(false)}
          onAllocate={() => {
            if (!currentMember) return;
            fetcher.submit(
              { intent: 'allocate_slot', memberId: currentMember.id.toString() },
              { method: 'post' }
            );
          }}
          isAnimating={isAnimating}
          allocatedSlot={(fetcher.data as any)?.slotNumber}
          availableSlots={getAvailableSlotNumbers()}
          maxSlots={currentEvent?.max_slots || 25}
        />

        {/* Allocated Slots List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Allocated Slots ({slots.length}/{currentEvent?.max_slots || 25})
              </h2>
              <div className="flex items-center gap-2">
                {isOrganiser && (
                  <>
                    <Button
                      onClick={() => window.location.href = '/events/project-showcase/manage'}
                      variant="outline"
                      className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Event
                    </Button>
                    <Button
                      onClick={() => window.location.href = '/events/project-showcase/events'}
                      variant="outline"
                      className="border-green-500/50 text-green-300 hover:bg-green-500/20"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      All Events
                    </Button>
                  </>
                )}
                <Badge variant="secondary" className={
                  isOrganiser 
                    ? "bg-purple-500/20 text-purple-300" 
                    : "bg-blue-500/20 text-blue-300"
                }>
                  {isOrganiser ? "Organiser View" : "Participant View"}
                </Badge>
              </div>
            </div>

            {slots.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">No Slots Allocated Yet</h3>
                <p className="text-gray-500">Be the first to secure your presentation slot!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {slots.map((slot, index) => (
                  <SlotDisplay
                    key={slot.id}
                    slot={slot}
                    index={index}
                    isOrganiser={isOrganiser}
                    onRemove={handleRemoveSlot}
                  />
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Event Information Link */}
        {currentEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-12 text-center"
          >
            <a
              href="https://bytebashblitz.org/events/project-showcase"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              View Full Event Details
            </a>
          </motion.div>
        )}
        
            </>
        )}
      </div>
    </div>
  );
}
