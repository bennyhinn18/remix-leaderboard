import { ActionFunctionArgs, json, redirect, type LoaderFunctionArgs, defer } from "@remix-run/node"
import { useLoaderData, Link, Await, useAsyncValue } from "@remix-run/react"
import { 
  ArrowLeft, Github, Code, Book, MessageSquare, Trophy, Award, 
  Briefcase, Cpu, Code2, BookOpen, Globe, Quote,
  // Add these new imports
  GemIcon, Boxes, CircleDot, Sparkles, Leaf, Flame, 
  Droplets, Medal, Crown, Bell, Settings 
} from 'lucide-react'
import { createServerSupabase } from "~/utils/supabase.server"
import { ProfileInfo } from "~/components/profile-info"
import { MainNav } from "~/components/main-nav"
import { motion } from "framer-motion"
import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { SocialFooter } from "~/components/social-footer"
import { useState, useEffect, Suspense } from "react";
import { EditProfileButton } from "~/components/edit-profile"
import { isOrganiser, getCurrentUser } from "~/utils/currentUser"
import { getCachedMember, getCachedPoints } from "~/utils/cache.server"
import  PointsGraph  from "~/components/points-graph"
import { u } from "node_modules/framer-motion/dist/types.d-6pKw1mTI"
import { getTier, getTierIcon } from "~/utils/tiers";
import { ProfileHeaderSkeleton, StatCardSkeleton, SectionSkeleton, StreaksSkeleton, ProfilePageSkeleton } from "~/components/profile-skeletons";
import { PushNotificationManager } from "~/components/push-notification-manager";
import { getUserNotifications } from "~/services/notifications.server";


export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // Get organiser status using the cached getCurrentUser function
  const organiserStatus = await isOrganiser(request);
  const response = new Response();
  const supabase = createServerSupabase(request, response);
  
  // Get current user (cached)
  const user = await getCurrentUser(request);
  
  // Fetch the profile being viewed (cached)
  const username = params.username || '';
  const member = await getCachedMember(request, username, supabase);
  
  if (!member) {
    return json({ 
      member: null, 
      SUPABASE_URL: process.env.SUPABASE_URL, 
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY, 
      organiserStatus: false,
      isOwnProfile: false 
    });
  }

  // Check if current user is viewing their own profile
  const isOwnProfile = user && member && user.id === member.user_id;
  
  // Get points history (cached)
  const pointsHistory = await getCachedPoints(request, member.id, supabase);

  // Get user notifications if member exists and it's their own profile
  let notifications: Array<any> = [];
  let unreadCount = 0;
  
  if (member?.id && isOwnProfile) {
    const notificationsResult = await getUserNotifications(request, member.id);
    if (notificationsResult.success) {
      notifications = notificationsResult.notifications;
      unreadCount = notificationsResult.unreadCount;
    }
  }

  // Function to fetch Duolingo streak data - defer this
  const fetchDuolingoStreak = async () => {
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

  // Function to fetch GitHub contributions - defer this
  const fetchGithubData = async () => {
    try {
      const githubResponse = await fetch(`https://api.github.com/users/${member.github_username}/events/public`);
      const githubEvents = await githubResponse.json();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return Array.isArray(githubEvents)
        ? githubEvents.filter(
            (event: any) =>
              new Date(event.created_at) > thirtyDaysAgo &&
              ["PushEvent", "CreateEvent", "PullRequestEvent"].includes(event.type)
          )
        : [];
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
      return [];
    }
  };

  //Fetch LeetCode data
  const fetchLeetCodeData = async () => {
    try {
      const leetCodeResponse = await fetch(`https://leetcode-stats-api.herokuapp.com/${member.leetcode_username}/`);
      
      const leetCodeData = await leetCodeResponse.json();
      return leetCodeData?.totalSolved || 0;
    } catch (error) {
      console.error("Error fetching LeetCode data:", error);
      return null;
    }
  };
 
  return defer({
    member,
    user,
    duolingoStreak: fetchDuolingoStreak(),
    githubData: fetchGithubData(),
    leetCodeData: fetchLeetCodeData(),
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    organiserStatus,
    pointsHistory: pointsHistory || [],
    isOwnProfile,
    notifications,
    unreadCount
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase(request, response);
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // Prepare the stats object
    const stats = {
      courses: Number(data.courses) || 0,
      projects: Number(data.projects) || 0,
      hackathons: Number(data.hackathons) || 0,
      internships: Number(data.internships) || 0,
      certifications: Number(data.certifications) || 0,
    };

    // Prepare the updated member object
    const updatedMember = {
      id: Number(data.id) || null,
      clan_id: Number(data.clan_id) || null,
      name: data.name || null,
      personal_email: data.personal_email || null,
      academic_email: data.academic_email || null,
      mobile_number: data.mobile_number || null,
      whatsapp_number: data.whatsapp_number || null,
      avatar_url: data.avatar_url || null,
      joined_date: data.joined_date || null,
      testimony: data.testimony || null,
      hobbies: typeof data.hobbies === "string" ? data.hobbies.split(",") : [],
      title: data.title || null,
      basher_level: data.basher_level || null,
      bash_points: Number(data.bash_points) || 0,
      clan_name: data.clan_name || null,
      basher_no: data.basher_no || null,
      primary_domain: typeof data.primary_domain === "string" ? data.primary_domain.split(",") : [],
      secondary_domain: typeof data.secondary_domain === "string" ? data.secondary_domain.split(",") : [],
      gpa: Number(data.gpa) || 0,
      weekly_bash_attendance: Number(data.weekly_bash_attendance) || 0,
      github_username: data.github_username || null,
      discord_username: data.discord_username || null,
      hackerrank_username: data.hackerrank_username || null,
      instagram_username: data.instagram_username || null,
      linkedin_url: data.linkedin_url || null,
      personal_website: data.personal_website || null,
      portfolio_url: data.portfolio_url || null,
      resume_url: data.resume_url || null,
      duolingo_username: data.duolingo_username || null,
      stats,
    };
    
await supabase.from('members').select('*').eq("github_username",params.usename)
    // Update the member's profile in the database
    const { error } = await supabase
      .from("members")
      .update(updatedMember)
      .eq("github_username", params.username);
    if (error) {
      console.error("Supabase Error:", error);
      return json({ error: error.message }, { status: 500 });
    }

    return redirect(`/profile/${params.username}`);
  } catch (error) {
    console.error("Action Function Error:", error);
    return json({ error: "An unexpected error occurred." }, { status: 500 });
  }
};

interface LoaderData {
  member: any;
  user: any;
  duolingoStreak: Promise<number>;
  githubData: Promise<any[]>;
  leetCodeData: Promise<number | null>;
  SUPABASE_URL: string | undefined;
  SUPABASE_ANON_KEY: string | undefined;
  organiserStatus: boolean;
  pointsHistory: any[];
  isOwnProfile: boolean;
  notifications: any[];
  unreadCount: number;
}

export default function Profile() {
  const { 
    member, 
    organiserStatus, 
    isOwnProfile, 
    pointsHistory, 
    user,
    duolingoStreak,
    leetCodeData,
    githubData,
    notifications,
    unreadCount
  } = useLoaderData<LoaderData>();
  interface Profile {
    id: number;
    name: string;
    github_username: string;
    points: number;
    avatar_url: string;
    title: string;
    joinedDate: Date;
    basherLevel: string;
    tierIcon?: string;
    bashPoints: number;
    clanName: string;
    basherNo: string;
    projects: number;
    certifications: number;
    internships: number;
    courses: number;
    resume_url: string;
    portfolio_url: string;
    domains: string[];
    streaks: {
      github: number;
      leetcode: number;
      duolingo: number;
      discord: number;
      books: number;
    };
    languages: { name: string; level: string }[];
    hobbies: string[];
    testimonial: string;
    gpa: number;
    socials: { platform: string; url: string }[];
    attendance: number;
  }

  const [profile, setProfile] = useState<Profile | null>(null);
  const calculatePercentage = (value: number, max: number) => (value / max) * 100;

  useEffect(() => {
    if (!member) return; // Exit early if no member

    // Set initial profile with data we already have
    const tier = getTier(member.bash_points || 0);
    const tierIcon = getTierIcon(tier);
        
    setProfile({
      ...member,
      id: member.id,
      name: member.name,
      github_username: member.github_username,
      points: member.bash_points || 0,
      avatar_url: member.avatar_url, // Provide default avatar
      title: member.title || "Basher",
      joinedDate: new Date(member.joined_date || Date.now()),
      basherLevel: tier, // Use the dynamic tier
      tierIcon: tierIcon, // Add the tier icon
      bashPoints: member.bash_points || 0,
      clanName: member.clan_name || "Byte Basher",
      basherNo: member.basher_no || "BBT2023045",
      projects: member.stats?.projects || 0,
      certifications: member.stats?.certifications || 0,
      internships: member.stats?.internships || 0,
      courses: member.stats?.courses || 0,
      resume_url: member.resume_url || "",
      portfolio_url: member.portfolio_url || "",
      domains: [...(member.primary_domain || []), ...(member.secondary_domain || [])],
      streaks: {
        github: 0, // Will be updated when GitHub data loads
        leetcode: 15,
        duolingo: 0, // Will be updated when Duolingo data loads
        discord: 60,
        books: 12,
      },
      languages: [
        { name: 'TypeScript', level: 'Expert' },
        { name: 'Python', level: 'Advanced' },
        { name: 'Rust', level: 'Intermediate' },
        { name: 'Go', level: 'Beginner' }
      ],
      hobbies: member.hobbies || [],
      testimonial: member.testimony || "No testimonial available.",
      gpa: member.gpa || 0,
      socials: [
        { platform: "github", url: `https://github.com/${member.github_username}` },
        { platform: "linkedin", url: member.linkedin_url || "#" },
        { platform: "instagram", url: member.instagram_username ? `https://instagram.com/${member.instagram_username}` : "#" },
      ],
      attendance: member.weekly_bash_attendance || 0,
    });
  }, [member]);

  // Check if the member is a legacy basher  
  const isLegacyBasher = member?.title === "Legacy Basher";

  if (!member) return <ProfilePageSkeleton />;
  if (!profile) return <ProfilePageSkeleton />; 

  return (
    <div className={`min-h-screen ${
      isLegacyBasher 
        ? "bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900" 
        : "bg-gradient-to-br from-gray-900 to-gray-800"
    } text-white`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8 flex justify-between items-center">
          <Link 
            to="/leaderboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Leaderboard
          </Link>
          {profile && (
            <MainNav 
              user={{
                id: profile.id,
                name: profile.name,
                github_username: profile.github_username,
                points: profile.bashPoints,
                basherLevel: profile.basherLevel,
                basherNo: profile.basherNo,
                clanName: profile.clanName,
                avatar_url: profile.avatar_url,
                languages: profile.languages,
                title: profile.title,
                joinedDate: profile.joinedDate,
                bashPoints: profile.bashPoints,
                projects: profile.projects,
                certifications: profile.certifications,
                internships: profile.internships,
                courses: profile.courses,
                resume_url: profile.resume_url,
                portfolio_url: profile.portfolio_url,
                domains: profile.domains,
                streaks: profile.streaks,
                hobbies: profile.hobbies,
                testimonial: profile.testimonial,
                gpa: profile.gpa,
                attendance: profile.attendance
              }}
              notifications={notifications || []}
              unreadCount={unreadCount || 0}
            />
          )}
        </div>

        {/* Profile Info Section - Pass canEdit and member props */}
        <ProfileInfo 
          profile={profile} 
          canEdit={organiserStatus || isOwnProfile} 
          member={member}
          isOrganiser={organiserStatus}
          isLegacyBasher={isLegacyBasher}
        />
         {/* Points Graph - Add this section */}
        {user && pointsHistory && pointsHistory.length > 0 && (
          <PointsGraph pointsHistory={pointsHistory} 
          isLegacyBasher={isLegacyBasher}/>
        )}
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className={`${
            isLegacyBasher 
              ? "bg-yellow-500/10 backdrop-blur-lg border border-yellow-500/30" 
              : "bg-white/5 backdrop-blur-lg"
          }backdrop-blur-lg rounded-xl p-6 text-center`}>
          <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ y: 10 }}
              animate={{ y: 0 }}
            >
          <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              >
            <Trophy className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            </motion.div>
            </motion.div>
            <div className="text-3xl font-bold text-blue-400">{profile.projects}</div>
            <div className="text-sm text-gray-400">Projects</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
          <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              >
            <Award className="w-6 h-6 text-green-400 mx-auto mb-2" />
            </motion.div>
            <div className="text-3xl font-bold text-green-400">{profile.certifications}</div>
            <div className="text-sm text-gray-400">Certifications</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
          <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              >
            <Briefcase className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            </motion.div>
            <div className="text-3xl font-bold text-purple-400">{profile.internships}</div>
            <div className="text-sm text-gray-400">Internships</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
          <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              >
            <Book className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            </motion.div>
            <div className="text-3xl font-bold text-orange-400">{profile.courses}</div>
            <div className="text-sm text-gray-400">Courses</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="space-y-6">
            {/* Push Notifications - Only display on own profile */}
            {isOwnProfile && member && (
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-400" />
                  Notifications
                </h2>
                <PushNotificationManager memberId={member.id} />
                
                <div className="mt-4">
                  <Button
                    variant="outline" 
                    size="sm"
                    className="w-full justify-center gap-2 text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                    asChild
                  >
                    <a href="/notification-preferences">
                      <Settings className="w-4 h-4" />
                      Manage All Notification Settings
                    </a>
                  </Button>
                </div>
              </div>
            )}
            
            {/* Domains */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                Domains
              </h2>
                <div className="flex flex-wrap gap-2">
                {profile.domains.map((domain, index) => (
                  <div 
                  key={index} 
                  className={`bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-l text-sm ${index < (member.primary_domain?.length || 0) ? 'font-bold' : ''}`}
                  >
                  {domain} {index < (member.primary_domain?.length || 0) ? '(Primary)' : '(Secondary)'}
                  </div>
                ))}
                </div>
            </div>

            {/* Programming Languages */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Programming Languages
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {profile.languages.map((lang) => (
                  <div key={lang.name} className="bg-white/5 rounded-lg p-3">
                    <div className="font-medium">{lang.name}</div>
                    <div className={`text-sm ${
                      lang.level === 'Expert' ? 'text-green-400' :
                      lang.level === 'Advanced' ? 'text-blue-400' :
                      lang.level === 'Intermediate' ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      {lang.level}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Performance */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Academic Performance</h2>
              <div className="space-y-4">
                <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">GPA</span>
                      <span className="text-blue-400">{profile.gpa}/10.0</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                        style={{ width: `${calculatePercentage(profile.gpa, 10)}%` }} 
                      />
                    </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Weekly Bash Attendance</span>
                    <span className="text-green-400">{profile.attendance}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-500" 
                      style={{ width: `${profile.attendance}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Active Streaks */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Active Streaks</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-500/20 rounded-xl p-4">
                  <Github className="w-5 h-5 text-purple-400 mb-2" />
                  <Suspense fallback={<div className="text-2xl font-bold text-purple-400 animate-pulse">...</div>}>
                    <Await resolve={githubData}>
                      {(data) => (
                        <div className="text-2xl font-bold text-purple-400">
                          {data?.length || profile.streaks.github}
                        </div>
                      )}
                    </Await>
                  </Suspense>
                  <div className="text-sm text-purple-400">GitHub</div>
                </div>
                <div className="bg-orange-500/20 rounded-xl p-4">
                  <Code2 className="w-5 h-5 text-orange-400 mb-2" />
                  <Suspense fallback={<div className="text-2xl font-bold text-orange-400 animate-pulse">...</div>}>
                    <Await resolve={leetCodeData}>
                      {(data) => (
                        <div className="text-2xl font-bold text-orange-400">
                          {data || profile.streaks.leetcode}
                        </div>
                      )}
                    </Await>
                  </Suspense>
                  <div className="text-sm text-orange-400">LeetCode</div>
                </div>
                <div className="bg-green-500/20 rounded-xl p-4">
                  <Globe className="w-5 h-5 text-green-400 mb-2" />
                  <Suspense fallback={<div className="text-2xl font-bold text-green-400 animate-pulse">...</div>}>
                    <Await resolve={duolingoStreak}>
                      {(streak) => (
                        <div className="text-2xl font-bold text-green-400">
                          {streak || profile.streaks.duolingo}
                        </div>
                      )}
                    </Await>
                  </Suspense>
                  <div className="text-sm text-green-400">Duolingo</div>
                </div>
                <div className="bg-indigo-500/20 rounded-xl p-4">
                  <MessageSquare className="w-5 h-5 text-indigo-400 mb-2" />
                  <div className="text-2xl font-bold text-indigo-400">
                    {profile.streaks.discord}
                  </div>
                  <div className="text-sm text-indigo-400">Discord</div>
                </div>
                <div className="bg-red-500/20 rounded-xl p-4">
                  <BookOpen className="w-5 h-5 text-red-400 mb-2" />
                  <div className="text-2xl font-bold text-red-400">
                    {profile.streaks.discord}
                  </div>
                  <div className="text-sm text-red-400">Books</div>
                </div>
              </div>
            </div>

            {/* Hobbies & Interests */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Hobbies & Interests</h2>
                <div className="flex flex-wrap gap-2">
                {profile.hobbies.map((hobby) => (
                  <span 
                  key={hobby} 
                  className="bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full text-sm"
                  >
                  {hobby}
                  </span>
                ))}
                </div>
            </div>
          </div>
        </div>
        {/* Testimonial */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-white/5 backdrop-blur-lg border-gray-300/20 p-8 relative overflow-hidden mt-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-4 left-4"
              >
                <Quote className="w-12 h-12 text-gray-300/20" />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-4 right-4 rotate-180"
              >
                <Quote className="w-12 h-12 text-gray-300/20" />
              </motion.div>
              <motion.blockquote
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-300 italic text-s text-center px-8 leading-relaxed"
              >
                {profile.testimonial}
              </motion.blockquote>
              </Card>
              <SocialFooter socials={profile.socials} />
            </motion.div>
      </div>
      {/* Legacy Basher crown badge */}
      {isLegacyBasher && (
        <motion.div 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, type: "spring" }}
        >
          <Crown className="w-5 h-5" />
          <span>Legacy Basher</span>
          <Sparkles className="w-5 h-5" />
        </motion.div>
      )}
      {/* GitHub data resolver component */}
      <Suspense fallback={null}>
        <Await resolve={githubData}>
          {(githubEvents) => {
            useEffect(() => {
              if (!githubEvents || !profile) return;
              
              // Update the profile with GitHub streak data
              setProfile(prevProfile => {
                if (!prevProfile) return null;
                return {
                  ...prevProfile,
                  streaks: {
                    ...prevProfile.streaks,
                    github: githubEvents.length
                  }
                };
              });
            }, [githubEvents]);
            
            return null; // This component only updates state, doesn't render anything
          }}
        </Await>
      </Suspense>

      {/* Duolingo data resolver component */}
      <Suspense fallback={null}>
        <Await resolve={duolingoStreak}>
          {(duolingoStreak) => {
            useEffect(() => {
              if (typeof duolingoStreak !== 'number' || !profile) return;
              
              // Update the profile with Duolingo streak data
              setProfile(prevProfile => {
                if (!prevProfile) return null;
                return {
                  ...prevProfile,
                  streaks: {
                    ...prevProfile.streaks,
                    duolingo: duolingoStreak
                  }
                };
              });
            }, [duolingoStreak]);
            
            return null; // This component only updates state, doesn't render anything
          }}
        </Await>
      </Suspense>
    </div>
  )
}
