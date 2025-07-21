import { json, type LoaderFunctionArgs, defer } from '@remix-run/node';
import { Link, useLoaderData, Await } from '@remix-run/react';
import { createServerSupabase } from '~/utils/supabase.server';
import { isOrganiser } from '~/utils/currentUser';
import { motion } from 'framer-motion';
import {
  Trophy,
  Users,
  Award,
  Activity,
  Bell,
  Calendar,
  BarChart2,
  Github,
  Globe,
  Settings,
  Plus,
  ChevronRight,
  TrendingUp,
  Flame,
  User,
  Code,
  Sparkles,
  Star,
} from 'lucide-react';
import {
  RecentActivitiesData,
  AnnouncementsData,
  UpcomingEventsData,
} from '~/components/async-data-components';
import { LoadingSkeleton } from '~/components/loading-skeletons';
import { PageTransition } from '~/components/page-transition';
import iconImage from '~/assets/bashers.png';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { MainNav } from '~/components/main-nav';
import { useState, useEffect, useMemo, Suspense } from 'react';
import confetti from 'canvas-confetti';
import WhatsNewPanel from '~/components/WhatsNewPanel';
import { NotificationManager } from '~/components/notification-manager';
import UpdateClanScore from '~/components/update-clan-score';
import ProfileConnections from '~/components/profile-connections';
import { useError } from '~/contexts/error-context';
import { ReactErrorBoundary } from '~/components/react-error-boundary';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog';

import { getUserNotifications } from '~/services/notifications.server';


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const organiserStatus = await isOrganiser(request);
  const response = new Response();
  const supabase = createServerSupabase(request, response);

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return json({
      user: null,
      member: null,
      organiserStatus: false,
      recentActivities: [],
      announcements: [],
      upcomingEvents: [],
      notifications: [],
      unreadCount: 0,
    });
  }

  // Fetch the member profile (critical data, wait for this)
  const { data: member } = await supabase
    .from('members')
    .select('*, clan:clans(*)')
    .eq('github_username', user.user_metadata?.user_name)
    .single();

  // Create promise for less critical data that can load later
  const getRecentActivities = supabase
    .from('points')
    .select('*, member:members!points_member_id_fkey(name, avatar_url)')
    .order('updated_at', { ascending: false })
    .limit(5)
    .then((result) => result.data || []);

  // Create promise for announcements
  const getAnnouncements = supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)
    .then((result) => result.data || []);

  // Create promise for upcoming events
  const getUpcomingEvents = supabase
    .from('events')
    .select('id, title, date, leading_clan')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true })
    .limit(3)
    .then((result) => result.data || []);


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
        .from('members')
        .select('id, name, github_username, avatar_url')
        .order('name');

      allMembers = members || [];

      // Also fetch recent notifications for NotificationManager
      const { data: recentNotifs } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      recentNotifications = recentNotifs || [];
    }
  }

  // Create promise for duolingo streak
  const getDuolingoStreak = async () => {
    if (!member?.duolingo_username) return 0;

    try {
      const duolingoResponse = await fetch(
        `https://www.duolingo.com/2017-06-30/users?username=${member.duolingo_username}&fields=streak,streakData%7BcurrentStreak,previousStreak%7D%7D`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LeaderboardApp/1.0)',
          },
        }
      );
      
      if (!duolingoResponse.ok) {
        console.warn(`Duolingo API returned ${duolingoResponse.status} for ${member.duolingo_username}`);
        return 0;
      }
      
      const responseText = await duolingoResponse.text();
      if (!responseText.trim()) {
        console.warn(`Empty response from Duolingo API for ${member.duolingo_username}`);
        return 0;
      }
      
      const duolingoData = JSON.parse(responseText);
      const userData = duolingoData.users?.[0] || {};
      return Math.max(
        userData.streak ?? 0,
        userData.streakData?.currentStreak?.length ?? 0,
        userData.streakData?.previousStreak?.length ?? 0
      );
    } catch (error) {
      console.error('Error fetching Duolingo data:', error);
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
            'User-Agent': 'Mozilla/5.0 (compatible; LeaderboardApp/1.0)',
          },
        }
      );

      if (!response.ok) {
        console.warn(`LeetCode API returned ${response.status} for ${member.leetcode_username}`);
        return { solved: 0 };
      }

      const responseText = await response.text();
      if (!responseText.trim()) {
        console.warn(`Empty response from LeetCode API for ${member.leetcode_username}`);
        return { solved: 0 };
      }

      const data = JSON.parse(responseText);
      return {
        solved: data?.totalSolved || 0,
        easy: data?.easySolved || 0,
        medium: data?.mediumSolved || 0,
        hard: data?.hardSolved || 0,
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
    recentNotifications,
  });
};

function getTier(points: number): string {
  if (points >= 3000) return 'Diamond';
  if (points >= 2600) return 'Obsidian';
  if (points >= 2200) return 'Pearl';
  if (points >= 1750) return 'Amethyst';
  if (points >= 1350) return 'Emerald';
  if (points >= 1000) return 'Ruby';
  if (points >= 700) return 'Sapphire';
  if (points >= 450) return 'Gold';
  if (points >= 250) return 'Silver';
  return 'Bronze';
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const {
    user,
    member,
    organiserStatus,
    recentActivities,
    announcements,
    upcomingEvents,
    notifications,
    unreadCount,
  } = data;
  
  // Handle potentially undefined properties with proper checking
  const duolingo_streak = 'duolingo_streak' in data ? data.duolingo_streak : 0;
  const leetcode_stats = 'leetcode_stats' in data ? data.leetcode_stats : { solved: 0 };
  const allMembers = 'allMembers' in data ? data.allMembers : [];
  const recentNotifications = 'recentNotifications' in data ? data.recentNotifications : [];
  
  const { showError, showAPIError } = useError();
  const [streakData, setStreakData] = useState({
    github: 0,
    duolingo: 0,
    leetcode: 0,
  });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [isExcited, setIsExcited] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // 🎉 EVENT MODE: 3rd Badge Day - August 1st, 2025
  const eventDate = useMemo(() => new Date('2025-08-01'), []);
  const currentDate = new Date();
  const daysUntilEvent = Math.ceil((eventDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  const isEventMode = daysUntilEvent > 0 && daysUntilEvent <= 31; // Show event mode for 1 month before

  // Countdown timer effect
  useEffect(() => {
    if (!isEventMode) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const eventTime = eventDate.getTime();
      const timeLeft = eventTime - now;

      if (timeLeft > 0) {
        setCountdown({
          days: Math.floor(timeLeft / (1000 * 60 * 60 * 24)),
          hours: Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((timeLeft % (1000 * 60)) / 1000)
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isEventMode, eventDate]);

  // Handle "I'm Excited" button click
  const handleExcitement = async () => {
    if (isExcited) return;

    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b9d', '#c44569', '#f8b500', '#6c5ce7', '#a29bfe']
    });

    setIsExcited(true);

    // Add user to excited list (you can implement this API call)
    try {
      // await fetch('/api/badge-day-excitement', {
      //   method: 'POST',
      //   body: JSON.stringify({ member_id: member?.id, excited: true })
      // });
      console.log(`${member?.name} is excited for Badge Day!`);
    } catch (error) {
      console.error('Error updating excitement:', error);
    }

    // Reset after animation
    setTimeout(() => setIsExcited(false), 3000);
  };

  // For users not logged in
  if (!user) {
    return <LandingPage />;
  }

  // Determine user role for customization
  const userRole = member?.title || 'Basher';
  const isLegacyBasher = userRole === 'Legacy Basher';
  const isTeamCaptain = userRole === 'Captain Bash';
  const isMentor = userRole === 'Mentor';
  const isAlumni = userRole === 'Alumni';

  // Calculate progress to next tier
  const currentTier = getTier(member?.bash_points || 0);
  const nextTierThreshold =
    currentTier === 'Bronze'
      ? 250
      : currentTier === 'Silver'
      ? 450
      : currentTier === 'Gold'
      ? 700
      : currentTier === 'Sapphire'
      ? 1000
      : currentTier === 'Ruby'
      ? 1350
      : currentTier === 'Emerald'
      ? 1750
      : currentTier === 'Amethyst'
      ? 2200
      : currentTier === 'Pearl'
      ? 2600
      : currentTier === 'Obsidian'
      ? 3000
      : 9999;

  const progressToNextTier = member?.bash_points
    ? Math.min(100, (member.bash_points / nextTierThreshold) * 100)
    : 0;

  // Fetch GitHub streak data
  useEffect(() => {
    if (!member?.github_username) return;

    const fetchGitHubStreak = async () => {
      try {
        const githubResponse = await fetch(
          `https://api.github.com/users/${member.github_username}/events/public`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; LeaderboardApp/1.0)',
            },
          }
        );

        if (!githubResponse.ok) {
          console.warn(`GitHub API returned ${githubResponse.status} for ${member.github_username}`);
          return;
        }

        const responseText = await githubResponse.text();
        if (!responseText.trim()) {
          console.warn(`Empty response from GitHub API for ${member.github_username}`);
          return;
        }

        const githubEvents = JSON.parse(responseText);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const contributions = Array.isArray(githubEvents)
          ? githubEvents.filter(
              (event) =>
                new Date(event.created_at) > thirtyDaysAgo &&
                ['PushEvent', 'CreateEvent', 'PullRequestEvent'].includes(
                  event.type
                )
            )
          : [];

        setStreakData((prev) => ({ ...prev, github: contributions.length }));
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
        showAPIError(error, 'fetch GitHub streak data');
      }
    };

    // Handle Duolingo streak
    const handleDuolingoStreak = async () => {
      try {
        // Use the deferred Duolingo streak once resolved
        if (duolingo_streak instanceof Promise) {
          duolingo_streak.then((streak) => {
            setStreakData((prev) => ({ ...prev, duolingo: streak }));
          }).catch((error) => {
            console.error('Error loading Duolingo streak:', error);
            showAPIError(error, 'load Duolingo streak');
          });
        } else if (typeof duolingo_streak === 'number') {
          setStreakData((prev) => ({ ...prev, duolingo: duolingo_streak }));
        }
      } catch (error) {
        console.error('Error handling Duolingo streak:', error);
        showError('Failed to load Duolingo data', 'Please check your Duolingo username in your profile.');
      }
    };

    // Handle LeetCode stats
    const handleLeetCodeStats = async () => {
      try {
        if (leetcode_stats instanceof Promise) {
          leetcode_stats.then((stats) => {
            setStreakData((prev) => ({ ...prev, leetcode: stats?.solved || 0 }));
          }).catch((error) => {
            console.error('Error loading LeetCode stats:', error);
            showAPIError(error, 'load LeetCode stats');
          });
        } else if (leetcode_stats && typeof leetcode_stats === 'object' && 'solved' in leetcode_stats) {
          setStreakData((prev) => ({ ...prev, leetcode: leetcode_stats.solved || 0 }));
        }
      } catch (error) {
        console.error('Error handling LeetCode stats:', error);
        showError('Failed to load LeetCode data', 'Please check your LeetCode username in your profile.');
      }
    };

    fetchGitHubStreak();
    handleDuolingoStreak();
    handleLeetCodeStats();
  }, [member, duolingo_streak, leetcode_stats]);

  return (
    <PageTransition>
      <ReactErrorBoundary>
        <div
          className={`min-h-screen pb-20 ${
            isEventMode
              ? 'bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 relative overflow-hidden'
              : isLegacyBasher
              ? 'bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900'
              : 'bg-gradient-to-br from-gray-900 to-gray-800'
          } text-white`}
        >
        {/* 🎉 EVENT MODE: Floating particles and celebration effects */}
        {isEventMode && (
          <>
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                    y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                  }}
                />
              ))}
            </div>
            
            {/* Event countdown banner */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white py-3 text-center font-bold text-lg shadow-lg"
            >
              🎉 3rd Badge Day - {daysUntilEvent} Days to Go! 🎉
            </motion.div>
          </>
        )}

        <header className={`backdrop-blur-lg ${isEventMode ? 'bg-purple-900/30 mt-16' : 'bg-black/20'}`}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img
                  src={`${iconImage}`}
                  alt="Byte Bash Logo"
                  className="h-10 w-10"
                />
                <h1 className={`text-2xl font-bold ${
                  isEventMode 
                    ? 'bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 text-transparent bg-clip-text animate-pulse'
                    : 'bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text'
                }`}>
                  {isEventMode ? '🎉 Byte Bash Blitz - Badge Day Mode!' : 'Byte Bash Blitz'}
                </h1>
              </div>
              <MainNav
                user={member}
                notifications={notifications}
                unreadCount={unreadCount}
              />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 fade-in">
          {/* 🎉 EVENT MODE: Special Badge Day Announcement */}
          {isEventMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-2xl p-8 text-center relative overflow-hidden"
            >
              {/* Sparkle effects */}
              <div className="absolute inset-0">
                {Array.from({ length: 10 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
              
              <div className="relative z-10">
                <motion.h2 
                  className="text-4xl font-bold mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🏆 3rd Badge Day - August 1st, 2025 🏆
                </motion.h2>
                <p className="text-xl mb-6 text-purple-100">
                  The greatest community event is coming! New members will earn the prestigious <strong>"Basher"</strong> title!
                </p>
                <div className="flex justify-center items-center gap-8 mb-6">
                  <motion.div 
                    className="text-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="text-4xl font-bold text-yellow-300">{countdown.days}</div>
                    <div className="text-purple-200 text-sm">Days</div>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  >
                    <div className="text-3xl font-bold text-yellow-300">{countdown.hours}</div>
                    <div className="text-purple-200 text-sm">Hours</div>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  >
                    <div className="text-3xl font-bold text-yellow-300">{countdown.minutes}</div>
                    <div className="text-purple-200 text-sm">Minutes</div>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.6 }}
                  >
                    <div className="text-2xl font-bold text-yellow-300">{countdown.seconds}</div>
                    <div className="text-purple-200 text-sm">Seconds</div>
                  </motion.div>
                </div>
                <div className="flex justify-center gap-4">
                  <motion.div
                    animate={isExcited ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Button 
                      onClick={handleExcitement}
                      disabled={isExcited}
                      className={`font-bold transition-all duration-300 ${
                        isExcited 
                          ? 'bg-green-500 hover:bg-green-600 text-white scale-110' 
                          : 'bg-yellow-500 hover:bg-yellow-600 text-black hover:scale-105'
                      }`}
                    >
                      {isExcited ? (
                        <>
                          <span className="mr-2">🎉</span>
                          You're Excited!
                          <span className="ml-2">🎉</span>
                        </>
                      ) : (
                        <>
                          <span className="mr-2">⚡</span>
                          I'm Excited!
                          <span className="ml-2">⚡</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    📅 Event Details
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Welcome Section with Role-Based Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 ${
              isEventMode
                ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/50 shadow-lg shadow-purple-500/25'
                : isLegacyBasher
                ? 'bg-yellow-500/10 border border-yellow-500/30'
                : organiserStatus
                ? 'bg-blue-500/10 border border-blue-500/30'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {isEventMode ? '🎉 Ready for Badge Day, ' : 'Welcome back, '}
                  {(() => {
                    const names = member?.name?.trim().split(' ') || [];
                    if (names.length >= 2) {
                      return `Basher ${names[1]}`;
                    } else if (names.length === 1) {
                      return `Basher ${names[0]}`;
                    }
                    return 'Basher';
                  })()}
                  {isEventMode ? '! 🎉' : '!'}
                </h2>
                <p className="text-gray-400 mt-2">
                  {isEventMode
                    ? `Get ready for the biggest community event! ${daysUntilEvent} days until Badge Day 2025!`
                    : organiserStatus
                    ? 'Manage your community and track progress'
                    : isLegacyBasher
                    ? 'Your legendary journey continues'
                    : isTeamCaptain
                    ? 'Lead your clan to victory'
                    : `You're currently a ${currentTier} tier Basher`}
                </p>
              </div>

              <div className="flex gap-3">
                {isEventMode ? (
                  <>
                    
                    <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                      <Link to="/leaderboard">
                        🎯 Leaderboard
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="border-purple-400/50 text-purple-200 hover:bg-purple-500/20">
                      <Link to={`/profile/${member?.github_username}`}>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* LeetCode Connect Component */}
          <ProfileConnections member={member} />
          {/* What's New Section */}
          <WhatsNewPanel />

          {/* Stats Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`backdrop-blur-lg rounded-xl p-5 ${
                isEventMode 
                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/50' 
                  : 'bg-white/5'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-400">
                  Bash Points
                </h3>
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-2xl font-bold">
                {member?.bash_points || 0}
                {isEventMode && <span className="text-yellow-400 ml-1">🏆</span>}
              </div>
              <div className="mt-2">
                <div className="text-xs text-gray-400 mb-1">
                  Progress to{' '}
                  {currentTier === 'Diamond'
                    ? 'Mastery'
                    : `${
                        currentTier === 'Bronze'
                          ? 'Silver'
                          : currentTier === 'Silver'
                          ? 'Gold'
                          : 'next tier'
                      }`}
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
              className={`backdrop-blur-lg rounded-xl p-5 ${
                isEventMode 
                  ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/50' 
                  : 'bg-white/5'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-400">
                  Current Streaks
                </h3>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex gap-3">
                <div className="flex items-center">
                  <Github className="w-4 h-4 text-white/70 mr-1.5" />
                  <span className="text-lg font-medium">
                    {streakData.github}
                  </span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 text-green-500 mr-1.5" />
                  <span className="text-lg font-medium">
                    {streakData.duolingo}
                  </span>
                </div>
                <div className="flex items-center">
                  <Code className="w-4 h-4 text-blue-500 mr-1.5" />
                  <span className="text-lg font-medium">
                    {streakData.leetcode}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-400">
                <Link
                  to={`/profile/${member?.github_username}`}
                  className="flex items-center gap-1"
                >
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
                <h3 className="text-sm font-medium text-gray-400">
                  Clan Status
                </h3>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-lg font-medium">
                {member?.clan?.clan_name || 'No Clan'}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Clan Score: {member?.clan?.clan_score || 'N/A'}
              </div>
              <div className="mt-2 text-xs text-blue-400">
                <Link
                  to={`/cla
                ns/${member?.clan?.id}`}
                  className="flex items-center gap-1"
                >
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
                <Link
                  to="/points-history"
                  className="text-sm text-blue-400 flex items-center gap-1"
                >
                  View all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                <Suspense
                  fallback={<LoadingSkeleton type="activity" count={3} />}
                >
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
                  <Suspense
                    fallback={<LoadingSkeleton type="announcement" count={2} />}
                  >
                    <Await resolve={announcements}>
                      {(resolvedAnnouncements) => (
                        <AnnouncementsData
                          onAnnouncementClick={setSelectedAnnouncement}
                        />
                      )}
                    </Await>
                  </Suspense>

                  {/* Announcement dialog component */}
                  <Dialog
                    open={!!selectedAnnouncement}
                    onOpenChange={(open) =>
                      !open && setSelectedAnnouncement(null)
                    }
                  >
                    <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {selectedAnnouncement?.title}
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              selectedAnnouncement?.category === 'Important'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-blue-500/10 text-blue-400'
                            }`}
                          >
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
                          Posted on{' '}
                          {selectedAnnouncement &&
                            new Date(
                              selectedAnnouncement.created_at
                            ).toLocaleDateString()}
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
                  <Link
                    to="/events"
                    className="text-sm text-blue-400 flex items-center gap-1"
                  >
                    View all
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  <Suspense
                    fallback={<LoadingSkeleton type="event" count={2} />}
                  >
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
                    <Link
                      to="/manage-points"
                      className="bg-white/10 rounded-lg p-3 flex flex-col items-center text-center hover:bg-white/20 transition-colors"
                    >
                      <Award className="w-8 h-8 text-blue-400 mb-2" />
                      <span>Manage Points</span>
                    </Link>

                    <Link
                      to="/events/project-showcase/manage"
                      className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-3 flex flex-col items-center text-center hover:bg-purple-500/30 transition-colors relative"
                    >
                      <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
                      <span className="text-sm">Project Showcase</span>
                      <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-1">
                        NEW
                      </Badge>
                    </Link>

                    <Link
                      to="/manage-events"
                      className="bg-white/10 rounded-lg p-3 flex flex-col items-center text-center hover:bg-white/20 transition-colors"
                    >
                      <Calendar className="w-8 h-8 text-purple-400 mb-2" />
                      <span>Manage Events</span>
                    </Link>

                    <Link
                      to="/members"
                      className="bg-white/10 rounded-lg p-3 flex flex-col items-center text-center hover:bg-white/20 transition-colors"
                    >
                      <Users className="w-8 h-8 text-green-400 mb-2" />
                      <span>Manage Members</span>
                    </Link>

                    <Link
                      to="/analytics"
                      className="bg-white/10 rounded-lg p-3 flex flex-col items-center text-center hover:bg-white/20 transition-colors"
                    >
                      <BarChart2 className="w-8 h-8 text-amber-400 mb-2" />
                      <span>Analytics</span>
                    </Link>
                    <Link
                      to="/add-member"
                      className="bg-white/10 rounded-lg p-3 flex flex-col items-center text-center hover:bg-white/20 transition-colors"
                    >
                      <Plus className="w-8 h-8 text-purple-400 mb-2" />
                      <span>Add Members</span>
                    </Link>
                  </div>

                  <div className="mt-4 flex flex-col gap-4">
                    <div className="flex justify-center">
                      <NotificationManager
                        allMembers={allMembers}
                        recentNotifications={recentNotifications}
                      />
                    </div>
                    <div className="flex justify-center">
                      <div className="text-sm text-gray-400">
                        <UpdateClanScore />
                      </div>
                    </div>
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
                    <Link
                      to="/clan-management"
                      className="bg-white/10 rounded-lg p-3 flex items-center gap-3 hover:bg-white/20 transition-colors"
                    >
                      <Users className="w-6 h-6 text-purple-400" />
                      <div>
                        <div className="font-medium">Manage Clan</div>
                        <div className="text-sm text-gray-400">
                          Update goals and activities
                        </div>
                      </div>
                      <ChevronRight className="ml-auto w-5 h-5 text-gray-500" />
                    </Link>

                    <Link
                      to="/assign-tasks"
                      className="bg-white/10 rounded-lg p-3 flex items-center gap-3 hover:bg-white/20 transition-colors"
                    >
                      <Activity className="w-6 h-6 text-blue-400" />
                      <div>
                        <div className="font-medium">Assign Tasks</div>
                        <div className="text-sm text-gray-400">
                          Delegate responsibilities
                        </div>
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
      </ReactErrorBoundary>
    </PageTransition>
  );
}

// Simple landing page for users who aren't logged in
function LandingPage() {
  // 🎉 EVENT MODE: 3rd Badge Day - August 1st, 2025
  const eventDate = new Date('2025-08-01');
  const currentDate = new Date();
  const daysUntilEvent = Math.ceil((eventDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  const isEventMode = daysUntilEvent > 0 && daysUntilEvent <= 31; // Show event mode for 1 month before

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Countdown timer effect for landing page
  useEffect(() => {
    if (!isEventMode) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const eventTime = eventDate.getTime();
      const timeLeft = eventTime - now;

      if (timeLeft > 0) {
        setCountdown({
          days: Math.floor(timeLeft / (1000 * 60 * 60 * 24)),
          hours: Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((timeLeft % (1000 * 60)) / 1000)
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isEventMode, eventDate]);

  return (
    <PageTransition>
      <ReactErrorBoundary>
        <div className={`min-h-screen text-white fade-in ${
          isEventMode 
            ? 'bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900' 
            : 'bg-gradient-to-br from-gray-900 to-black'
        }`}>
        {/* Event mode banner */}
        {isEventMode && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white py-3 text-center font-bold text-lg"
          >
            🎉 3rd Badge Day - {daysUntilEvent} Days to Go! Join the Community! 🎉
          </motion.div>
        )}
        
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <img
              src={`${iconImage}`}
              alt="Byte Bash Blitz Logo"
              className="w-24 h-24 mx-auto mb-6"
            />
            <h1 className={`text-5xl font-bold text-transparent bg-clip-text ${
              isEventMode
                ? 'bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 animate-pulse'
                : 'bg-gradient-to-r from-blue-400 to-purple-500'
            }`}>
              {isEventMode ? '🎉 Byte Bash Blitz - Badge Day 2025!' : 'Byte Bash Blitz'}
            </h1>
            <p className="mt-4 text-xl text-gray-300">
              {isEventMode 
                ? 'Join the greatest community event! New members get the "Basher" title on August 1st!'
                : 'Track your coding journey, earn points, and climb the leaderboard'
              }
            </p>
            
            {/* Event countdown for landing page */}
            {isEventMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-400/50"
              >
                <div className="text-2xl font-bold text-purple-200 mb-4">Badge Day Countdown</div>
                <div className="flex justify-center items-center gap-6">
                  <motion.div 
                    className="text-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="text-3xl font-bold text-yellow-300">{countdown.days}</div>
                    <div className="text-purple-200 text-sm">Days</div>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  >
                    <div className="text-2xl font-bold text-yellow-300">{countdown.hours}</div>
                    <div className="text-purple-200 text-sm">Hours</div>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  >
                    <div className="text-2xl font-bold text-yellow-300">{countdown.minutes}</div>
                    <div className="text-purple-200 text-sm">Minutes</div>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.6 }}
                  >
                    <div className="text-xl font-bold text-yellow-300">{countdown.seconds}</div>
                    <div className="text-purple-200 text-sm">Seconds</div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className={isEventMode 
              ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold" 
              : "bg-blue-600 hover:bg-blue-700"
            }>
              <Link to="/login">
                {isEventMode ? '🎉 Join Badge Day!' : 'Get Started'}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className={isEventMode ? "border-purple-400/50 text-purple-200 hover:bg-purple-500/20" : "border-white/20"}
            >
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
                Climb the leaderboard and earn badges through coding challenges
                and contributions
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
                Join clans, participate in team challenges, and build projects
                together
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
      </ReactErrorBoundary>
    </PageTransition>
  );
}
