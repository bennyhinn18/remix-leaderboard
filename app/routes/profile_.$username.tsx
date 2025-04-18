import { ActionFunctionArgs, json, redirect, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"
import { 
  ArrowLeft, Github, Code, Book, MessageSquare, Trophy, Award, 
  Briefcase, Cpu, Code2, BookOpen, Globe, Quote,
  // Add these new imports
  GemIcon, Boxes, CircleDot, Sparkles, Leaf, Flame, 
  Droplets, Medal, Crown 
} from 'lucide-react'
import { createServerSupabase } from "~/utils/supabase.server"
import { ProfileInfo } from "~/components/profile-info"
import { MainNav } from "~/components/main-nav"
import { motion } from "framer-motion"
import { Card } from "~/components/ui/card"
import { SocialFooter } from "~/components/social-footer"
import { useState, useEffect } from "react";
import { EditProfileButton } from "~/components/edit-profile"
import { isOrganiser } from "~/utils/currentUser"

// Add this function at the top level of your file, after imports
function getTier(points: number): string {
  if (points >= 3000) return "Diamond"
  if (points >= 2600) return "Obsidian"
  if (points >= 2200) return "Pearl"
  if (points >= 1750) return "Amethyst"
  if (points >= 1350) return "Emerald"
  if (points >= 1000) return "Ruby"
  if (points >= 700) return "Sapphire"
  if (points >= 450) return "Gold"
  if (points >= 250) return "Silver"
  return "Bronze"
}

// Add the tier icon function 
function getTierIcon(tier: string) {
  switch (tier.toLowerCase()) {
    case "diamond":
      return <GemIcon className="w-4 h-4" />
    case "obsidian":
      return <Boxes className="w-4 h-4" />
    case "pearl":
      return <CircleDot className="w-4 h-4" />
    case "amethyst":
      return <Sparkles className="w-4 h-4" />
    case "emerald":
      return <Leaf className="w-4 h-4" />
    case "ruby":
      return <Flame className="w-4 h-4" />
    case "sapphire":
      return <Droplets className="w-4 h-4" />
    case "gold":
      return <Trophy className="w-4 h-4" />
    case "silver":
      return <Medal className="w-4 h-4" />
    case "bronze":
      return <Award className="w-4 h-4" />
    default:
      return <Award className="w-4 h-4" />
  }
}



export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const organiserStatus = await isOrganiser(request)
  const response = new Response();
  const supabase = createServerSupabase(request, response);
  const { data: member, error } = await supabase
    .from("members")
    .select("*")
    .eq("github_username", params.username)
    .single();

    // Fetch Duolingo streak
    const duolingoResponse = await fetch(
      `https://www.duolingo.com/2017-06-30/users?username=${member.duolingo_username}&fields=streak,streakData%7BcurrentStreak,previousStreak%7D%7D`
    );
    const duolingoData = await duolingoResponse.json();
    const userData = duolingoData.users?.[0] || {};
    const duolingo_streak = Math.max(
      userData.streak ?? 0,
      userData.streakData?.currentStreak?.length ?? 0,
      userData.streakData?.previousStreak?.length ?? 0
    );


  if (error || !member) {
    return json({ member: null, SUPABASE_URL: process.env.SUPABASE_URL, SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY, organiserStatus: false });
  }

  return json({
    member,
    duolingo_streak,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    organiserStatus
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

export default function Profile() {
  const { member, duolingo_streak, organiserStatus } = useLoaderData<typeof loader>();
  interface Profile {
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

    const fetchProfile = async () => {
      try {
        // Fetch GitHub contributions
        const githubResponse = await fetch(`https://api.github.com/users/${member.github_username}/events/public`);
        const githubEvents = await githubResponse.json();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const contributions = Array.isArray(githubEvents)
          ? githubEvents.filter(
              (event: any) =>
                new Date(event.created_at) > thirtyDaysAgo &&
                ["PushEvent", "CreateEvent", "PullRequestEvent"].includes(event.type)
            )
          : [];

        // Calculate tier based on bash points
        const tier = getTier(member.bash_points || 0);
        const tierIcon = getTierIcon(tier);
        
        setProfile({
          ...member,
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
            github: contributions.length,
            leetcode: 15,
            duolingo: duolingo_streak,
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
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfile();
  }, [duolingo_streak, member]);

  if (!profile) return <p>Loading...</p>; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
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
          {(organiserStatus) && (
            <EditProfileButton member={member} />
          )}
          <MainNav user={profile} />
        </div>

        {/* Profile Info Section */}
        <ProfileInfo profile={profile} />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
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
                  <div className="text-2xl font-bold text-purple-400">
                    {profile.streaks.github}
                  </div>
                  <div className="text-sm text-purple-400">GitHub</div>
                </div>
                <div className="bg-orange-500/20 rounded-xl p-4">
                  <Code2 className="w-5 h-5 text-orange-400 mb-2" />
                  <div className="text-2xl font-bold text-orange-400">
                    {profile.streaks.leetcode}
                  </div>
                  <div className="text-sm text-orange-400">LeetCode</div>
                </div>
                <div className="bg-green-500/20 rounded-xl p-4">
                  <Globe className="w-5 h-5 text-green-400 mb-2" />
                  <div className="text-2xl font-bold text-green-400">
                    {profile.streaks.duolingo}
                  </div>
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
    </div>
  )
}
