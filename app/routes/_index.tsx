import { json, type LoaderFunctionArgs, defer } from "@remix-run/node";
import { Link, useLoaderData, Await, useAsyncValue } from "@remix-run/react";
import { createServerSupabase } from "~/utils/supabase.server";
import { isOrganiser } from "~/utils/currentUser";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Users,
  Award, Activity, Bell, Calendar, 
  BarChart2, Github, 
  Globe, Settings, Plus,
  ChevronRight, TrendingUp, Flame, User
} from "lucide-react";
import { RecentActivitiesData, AnnouncementsData, UpcomingEventsData } from "~/components/async-data-components";
import { LoadingSkeleton } from "~/components/loading-skeletons";
import { PageTransition } from "~/components/page-transition";
import iconImage from "~/assets/bashers.png";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { MainNav } from "~/components/main-nav";
import { useState, useEffect } from "react";
import WhatsNewPanel from "~/components/WhatsNewPanel";
import LeetCodeConnect from "~/components/leetcode-connect";
import { NotificationManager } from "~/components/notification-manager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "~/components/ui/dialog";


import { getUserNotifications } from "~/services/notifications.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const organiserStatus = await isOrganiser(request);
  const response = new Response();
  const supabase = createServerSupabase(request, response);
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return json({ 
      user: null,
      member: null,
      organiserStatus: false,
      recentActivities: [],
      announcements: [],
      upcomingEvents: [],
      notifications: [],
      unreadCount: 0
    });
  }
  
  // Fetch the member profile (critical data, wait for this)
  const { data: member } = await supabase
    .from("members")
    .select("*, clan:clans(*)")
    .eq("github_username", user.user_metadata?.user_name)
    .single();
  
  // Create promise for less critical data that can load later
  const getRecentActivities = supabase
    .from("points")
    .select("*, member:members!points_member_id_fkey(name, avatar_url)")
    .order("updated_at", { ascending: false })
    .limit(5)
    .then(result => result.data || []);
    
  // Create promise for announcements
  const getAnnouncements = supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3)
    .then(result => result.data || []);
    
  // Create promise for upcoming events
  const getUpcomingEvents = supabase
    .from("events")
    .select("*")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(3)
    .then(result => result.data || []);
    
  // Get user notifications if member exists
  let notifications: Array<any> = [];
  let unreadCount = 0;
  let allMembers: Array<any> = [];
  let recentNotifications: Array<any> = [];
  
  if (member?.id) {
    const notificationsResult = await getUserNotifications(request, member.id);
    if (notificationsResult.success) {
      notifications = notificationsResult.notifications;
      unreadCount = notificationsResult.unreadCount;
    }
    
    // If user is an organiser, fetch all members for NotificationManager
    if (organiserStatus) {
      const { data: members } = await supabase
        .from("members")
        .select("id, name, github_username, avatar_url")
        .order("name");
      
      allMembers = members || [];
      
      // Also fetch recent notifications for NotificationManager
      const { data: recentNotifs } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      recentNotifications = recentNotifs || [];
    }
  }
  
  // Create promise for duolingo streak
  const getDuolingoStreak = async () => {
    if (!member?.duolingo_username) return 0;
    
    try {
      const duolingoResponse = await fetch(
        `https://www.duolingo.com/2017-06-30/users?username=${member.duolingo_username}&fields=streak,streakData%7BcurrentStreak,previousStreak%7D%7D`
      );
      const duolingoData = await duolingoResponse.json();
      const userData = duolingoData.users?.[0] || {};
      return Math.max(
        userData.streak ?? 0,
        userData.streakData?.currentStreak?.length ?? 0,
        userData.streakData?.previousStreak?.length ?? 0
      );
    } catch (error) {
      console.error("Error fetching Duolingo data:", error);
      return 0;
    }
  };
  
  // Create promise for LeetCode stats
  const getLeetCodeStats = async () => {
    if (!member?.leetcode_username) return { solved: 0 };
    
    try {
      const response = await fetch(
        `https://leetcode-stats-api.herokuapp.com/${member.leetcode_username}/`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; LeaderboardApp/1.0)"
          }
        }
      );
      
      if (!response.ok) return { solved: 0 };
      
      const data = await response.json();
      return {
        solved: data?.totalSolved || 0,
        easy: data?.easySolved || 0,
        medium: data?.mediumSolved || 0,
        hard: data?.hardSolved || 0
      };
    } catch (error) {
      console.error(`Error fetching LeetCode stats:`, error);
      return { solved: 0 };
    }
  };
    
  return defer({
    user,
    member,
    organiserStatus,
    recentActivities: getRecentActivities,
    announcements: getAnnouncements,
    upcomingEvents: getUpcomingEvents,
    duolingo_streak: getDuolingoStreak(),
    leetcode_stats: getLeetCodeStats(),
    notifications,
    unreadCount,
    allMembers,
    recentNotifications
  });
};

function getTier(points: number): string {
  if (points >= 3000) return "Diamond";
  if (points >= 2600) return "Obsidian";
  if (points >= 2200) return "Pearl";
  if (points >= 1750) return "Amethyst";
  if (points >= 1350) return "Emerald";
  if (points >= 1000) return "Ruby";
  if (points >= 700) return "Sapphire";
  if (points >= 450) return "Gold";
  if (points >= 250) return "Silver";
  return "Bronze";
}

export default function Home() {
  const { user, member, organiserStatus, recentActivities, announcements, upcomingEvents, duolingo_streak, leetcode_stats, notifications, unreadCount, allMembers, recentNotifications } = useLoaderData<typeof loader>();
  const [streakData, setStreakData] = useState({ github: 0, duolingo: 0, leetcode: 0 });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

  // For users not logged in
  if (!user) {
    return <LandingPage />;
  }
  
  // Determine user role for customization
  const userRole = member?.title || "Basher";
  const isLegacyBasher = userRole === "Legacy Basher";
  const isTeamCaptain = userRole === "Captain Bash";
  const isMentor = userRole === "Mentor";
  const isAlumni = userRole === "Alumni";
  
  // Calculate progress to next tier
  const currentTier = getTier(member?.bash_points || 0);
  const nextTierThreshold = 
    currentTier === "Bronze" ? 250 :
    currentTier === "Silver" ? 450 :
    currentTier === "Gold" ? 700 :
    currentTier === "Sapphire" ? 1000 :
    currentTier === "Ruby" ? 1350 :
    currentTier === "Emerald" ? 1750 :
    currentTier === "Amethyst" ? 2200 :
    currentTier === "Pearl" ? 2600 :
    currentTier === "Obsidian" ? 3000 : 9999;
  
  const progressToNextTier = member?.bash_points ? 
    Math.min(100, (member.bash_points / nextTierThreshold) * 100) : 0;
  
  // Fetch GitHub streak data
  useEffect(() => {
    if (!member?.github_username) return;
    
    const fetchGitHubStreak = async () => {
      try {
        const githubResponse = await fetch(
          `https://api.github.com/users/${member.github_username}/events/public`
        );
        const githubEvents = await githubResponse.json();
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const contributions = Array.isArray(githubEvents)
          ? githubEvents.filter(
              (event) => 
                new Date(event.created_at) > thirtyDaysAgo &&
                ["PushEvent", "CreateEvent", "PullRequestEvent"].includes(event.type)
            )
          : [];
          
        setStreakData(prev => ({ ...prev, github: contributions.length }));
      } catch (error) {
        console.error("Error fetching GitHub data:", error);
      }
    };
    
    // Handle Duolingo streak
    const handleDuolingoStreak = async () => {
      // Use the deferred Duolingo streak once resolved
      if (duolingo_streak instanceof Promise) {
        duolingo_streak.then(streak => {
          setStreakData(prev => ({ ...prev, duolingo: streak }));
        });
      } else if (typeof duolingo_streak === 'number') {
        setStreakData(prev => ({ ...prev, duolingo: duolingo_streak }));
      }
    };
    
    // Handle LeetCode stats
    const handleLeetCodeStats = async () => {
      if (leetcode_stats instanceof Promise) {
        leetcode_stats.then(stats => {
          setStreakData(prev => ({ ...prev, leetcode: stats.solved }));
        });
      } else if (leetcode_stats && typeof leetcode_stats.solved === 'number') {
        setStreakData(prev => ({ ...prev, leetcode: leetcode_stats.solved }));
      }
    };
    
    fetchGitHubStreak();
    handleDuolingoStreak();
    handleLeetCodeStats();
  }, [member, duolingo_streak, leetcode_stats]);

  return (
    <PageTransition>
      <div className={`min-h-screen pb-20 ${
        isLegacyBasher 
          ? "bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900" 
          : "bg-gradient-to-br from-gray-900 to-gray-800"
      } text-white`}>
        <header className="bg-black/20 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={`${iconImage}`} alt="Byte Bash Logo" className="h-10 w-10" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Byte Bash Blitz</h1>
              </div>
              <MainNav user={member} notifications={notifications} unreadCount={unreadCount} />
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 fade-in">
        {/* Welcome Section with Role-Based Greeting */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 ${
            isLegacyBasher ? "bg-yellow-500/10 border border-yellow-500/30" : 
            organiserStatus ? "bg-blue-500/10 border border-blue-500/30" : 
            "bg-white/5 border border-white/10"
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, {member?.name || 'Basher'}!
              </h2>
              <p className="text-gray-400 mt-2">
                {organiserStatus ? "Manage your community and track progress" : 
                 isLegacyBasher ? "Your legendary journey continues" :
                 isTeamCaptain ? "Lead your clan to victory" :
                 `You're currently a ${currentTier} tier Basher`}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link to="/leaderboard">
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="border-white/20">
                <Link to={`/profile/${member?.github_username}`}>
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
         {/* LeetCode Connect Component */}
         <LeetCodeConnect 
          hasLeetCodeUsername={!!member?.leetcode_username}
          username={member?.leetcode_username || ""}
          memberId={member?.id}
         />
         {/* What's New Section */}
         <WhatsNewPanel />
        {/* Stats Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-5"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-400">Bash Points</h3>
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold">{member?.bash_points || 0}</div>
            <div className="mt-2">
              <div className="text-xs text-gray-400 mb-1">
                Progress to {currentTier === "Diamond" ? "Mastery" : `${currentTier === "Bronze" ? "Silver" : currentTier === "Silver" ? "Gold" : "next tier"}`}
              </div>
              <div className="h-1.5 bg-white/10 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                  style={{ width: `${progressToNextTier}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-5"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-400">Current Streaks</h3>
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex gap-3">
              <div className="flex items-center">
                <Github className="w-4 h-4 text-white/70 mr-1.5" />
                <span className="text-lg font-medium">{streakData.github}</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-4 h-4 text-green-500 mr-1.5" />
                <span className="text-lg font-medium">{streakData.duolingo}</span>
              </div>
              <div className="flex items-center">
                <Code className="w-4 h-4 text-blue-500 mr-1.5" />
                <span className="text-lg font-medium">{streakData.leetcode}</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-400">
              <Link to={`/profile/${member?.github_username}`} className="flex items-center gap-1">
                View all streaks
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-5"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-400">Clan Status</h3>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-lg font-medium">{member?.clan?.clan_name || "No Clan"}</div>
            <div className="text-sm text-gray-400 mt-1">Rank: {member?.clan?.rank || "N/A"}</div>
            <div className="mt-2 text-xs text-blue-400">
              <Link to={`/cla
                ns/${member?.clan?.id}`} className="flex items-center gap-1">
                View clan
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-5"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-400">This Week</h3>
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-lg font-medium">Weekly Bash</div>
            <div className="text-sm text-gray-400 mt-1">Saturday, 3PM</div>
            <div className="mt-2 text-xs text-blue-400">
              <Link to="/events" className="flex items-center gap-1">
                View schedule
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Main Content Layout - Role-Based Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Feed - Visible to all */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 col-span-1 lg:col-span-2"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" /> 
                Recent Activity
              </h2>
              <Link to="/points-history" className="text-sm text-blue-400 flex items-center gap-1">
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              <Suspense fallback={<LoadingSkeleton type="activity" count={3} />}>
                <Await resolve={recentActivities}>
                  <RecentActivitiesData />
                </Await>
              </Suspense>
            </div>
          </motion.div>
          
          {/* Right Sidebar Content - Role-based panels */}
          <div className="space-y-6">
            {/* Announcements - Visible to all, manageable by organisers */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-400" /> 
                  Announcements
                </h2>
                {organiserStatus && (
                  <Button size="sm" variant="ghost" className="text-blue-400">
                    <Plus className="w-4 h-4 mr-1" /> 
                    New
                  </Button>
                )}
              </div>
              
              <div className="space-y-4">
                <Suspense fallback={<LoadingSkeleton type="announcement" count={2} />}>
                  <Await resolve={announcements}>
                    {(resolvedAnnouncements) => (
                      <AnnouncementsData 
                        onAnnouncementClick={setSelectedAnnouncement} 
                      />
                    )}
                  </Await>
                </Suspense>

                {/* Announcement dialog component */}
                <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
                  <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {selectedAnnouncement?.title}
                        </div>
                        <Badge variant="outline" className={`text-xs ${
                          selectedAnnouncement?.category === 'Important' 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                            : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {selectedAnnouncement?.category}
                        </Badge>
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="py-4">
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {selectedAnnouncement?.content}
                      </p>
                    </div>
                    
                    <DialogFooter className="flex justify-between items-center border-t border-gray-800 pt-4">
                      <div className="text-sm text-gray-400">
                        Posted on {selectedAnnouncement && new Date(selectedAnnouncement.created_at).toLocaleDateString()}
                      </div>
                      {selectedAnnouncement?.created_by && (
                        <div className="text-sm text-blue-400">
                          By: {selectedAnnouncement.created_by}
                        </div>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
            
            {/* Upcoming Events - Visible to all */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" /> 
                  Upcoming Events
                </h2>
                <Link to="/events" className="text-sm text-blue-400 flex items-center gap-1">
                  View all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="space-y-4">
                <Suspense fallback={<LoadingSkeleton type="event" count={2} />}>
                  <Await resolve={upcomingEvents}>
                    <UpcomingEventsData />
                  </Await>
                </Suspense>
              </div>
            </motion.div>
            
            {/* Organiser Controls - Only visible to organisers */}
            {organiserStatus && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-500/10 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20"
              >
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-5">
                  <Settings className="w-5 h-5 text-blue-400" /> 
                  Organiser Controls
                </h2>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/manage-points" className="bg-white/10 rounded-lg p-3 flex flex-col items-center text-center hover:bg-white/20 transition-colors">
                    <Award className="w-8 h-8 text-blue-400 mb-2" />
                    <span>Manage Points</span>
                  </Link>
                  
                  <Link to="/manage-events" className="bg-white/10 rounded-lg p-3 flex flex-col items-center text-center hover:bg-white/20 transition-colors">
                    <Calendar className="w-8 h-8 text-purple-400 mb-2" />
                    <span>Manage Events</span>
                  </Link>
                  
                  <Link to="/members" className="bg-white/10 rounded-lg p-3 flex flex-col items-center text-center hover:bg-white/20 transition-colors">
                    <Users className="w-8 h-8 text-green-400 mb-2" />
                    <span>Manage Members</span>
                  </Link>
                  
                  <Link to="/analytics" className="bg-white/10 rounded-lg p-3 flex flex-col items-center text-center hover:bg-white/20 transition-colors">
                    <BarChart2 className="w-8 h-8 text-amber-400 mb-2" />
                    <span>Analytics</span>
                  </Link>
                </div>
                
                <div className="mt-4">
                  <NotificationManager 
                    allMembers={allMembers}
                    recentNotifications={recentNotifications}
                  />
                </div>
              </motion.div>
            )}
            
            {/* Captain Tools - Only visible to team captains */}
            {isTeamCaptain && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-purple-500/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20"
              >
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-5">
                  <Users className="w-5 h-5 text-purple-400" /> 
                  Team Captain Tools
                </h2>
                
                <div className="space-y-3">
                  <Link to="/clan-management" className="bg-white/10 rounded-lg p-3 flex items-center gap-3 hover:bg-white/20 transition-colors">
                    <Users className="w-6 h-6 text-purple-400" />
                    <div>
                      <div className="font-medium">Manage Clan</div>
                      <div className="text-sm text-gray-400">Update goals and activities</div>
                    </div>
                    <ChevronRight className="ml-auto w-5 h-5 text-gray-500" />
                  </Link>
                  
                  <Link to="/assign-tasks" className="bg-white/10 rounded-lg p-3 flex items-center gap-3 hover:bg-white/20 transition-colors">
                    <Activity className="w-6 h-6 text-blue-400" />
                    <div>
                      <div className="font-medium">Assign Tasks</div>
                      <div className="text-sm text-gray-400">Delegate responsibilities</div>
                    </div>
                    <ChevronRight className="ml-auto w-5 h-5 text-gray-500" />
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
    </PageTransition>
  );
}

// Simple landing page for users who aren't logged in
function LandingPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white fade-in">
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <img src={`${iconImage }`} alt="Byte Bash Blitz Logo" className="w-24 h-24 mx-auto mb-6" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Byte Bash Blitz
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            Track your coding journey, earn points, and climb the leaderboard
          </p>
        </motion.div>
        
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link to="/login">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/20">
            <Link to="/leaderboard">View Leaderboard</Link>
          </Button>
        </div>
        
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6"
          >
            <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Compete</h3>
            <p className="text-gray-400">
              Climb the leaderboard and earn badges through coding challenges and contributions
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6"
          >
            <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Collaborate</h3>
            <p className="text-gray-400">
              Join clans, participate in team challenges, and build projects together
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6"
          >
            <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Grow</h3>
            <p className="text-gray-400">
              Track your progress, maintain streaks, and showcase your skills
            </p>
          </motion.div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}