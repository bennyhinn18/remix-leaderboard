"use client"

import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"
import { useEffect, useState } from "react"
import { Trophy, Github, Code, Search, Star, Award, Crown, Medal, User,  X, Building, Feather } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { initSupabase } from "~/utils/supabase.client"
// import type { Member } from "~/types/database"
// import type { JSX } from "react" // Import JSX
import iconImage from "~/assets/bashers.png"
import { createServerSupabase } from "~/utils/supabase.server"

interface MemberWithStats {
  id: string
  name: string
  github_username: string
  avatar_url: string
  bash_points: number
  githubStreak?: number
  leetcodeStreak?: number
  bashClanPoints?: number 
  duolingoStreak?: number
  tier: "diamond" | "platinum" | "gold" | "silver" | "bronze"
  originalRank?: number
  stats?: {
    projects?: number
  }
  // league?: string
}

interface Clan {
  id: string
  clan_name: string
  members: MemberWithStats[]
  logo_url?: string
}

interface ClanCardProps {
  clan: Clan;
  index: number;
}


// interface League {
//   name: string
//   color: string
//   minPoints: number
//   icon: JSX.Element
//   background: string
//   textColor: string
// }

// const LEAGUES: Record<string, League> = {
//   bronze: {
//     name: "Bronze League",
//     color: "orange",
//     minPoints: 0,
//     icon: <Star className="w-6 h-6" />,
//     background: "bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500",
//     textColor: "text-orange-900",
//   },silver: {
//     name: "Silver League",
//     color: "gray",
//     minPoints: 100,
//     icon: <Award className="w-6 h-6" />,
//     background: "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500",
//     textColor: "text-gray-900",
//   },gold: {
//     name: "Gold League",
//     color: "amber",
//     minPoints: 200,
//     icon: <Trophy className="w-6 h-6" />,
//     background: "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600",
//     textColor: "text-amber-900",
//   },
  
//   platinum: {
//     name: "Platinum League",
//     color: "slate",
//     minPoints: 500,
//     icon: <Medal className="w-6 h-6" />,
//     background: "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500",
//     textColor: "text-slate-900",
//   },
//   diamond: {
//     name: "Diamond League",
//     color: "cyan",
//     minPoints: 1000,
//     icon: <Crown className="w-6 h-6" />,
//     background: "bg-gradient-to-br from-cyan-300 via-cyan-400 to-cyan-600",
//     textColor: "text-cyan-900",
//   },
  
  
// }

// function getLeague(points: number): string {
//   if (points >= LEAGUES.diamond.minPoints) return "diamond"
//   if (points >= LEAGUES.platinum.minPoints) return "platinum"
//   if (points >= LEAGUES.gold.minPoints) return "gold"
//   if (points >= LEAGUES.silver.minPoints) return "silver"
//   return "bronze"
// }

function getTier(points: number): MemberWithStats["tier"] {
  if (points >= 1000) return "diamond"
  if (points >= 500) return "platinum"
  if (points >= 200) return "gold"
  if (points >= 100) return "silver"
  return "bronze"
}

function getTierIcon(tier: string) {
  switch (tier) {
    case "diamond":
      return <Star className="w-4 h-4" />
    case "platinum":
      return <Award className="w-4 h-4" />
    case "gold":
      return <Trophy className="w-4 h-4" />
    case "silver":
      return <Medal className="w-4 h-4" />
    default:
      return <Trophy className="w-4 h-4" />
  }
}

function getTierStyles(tier: string) {
  switch (tier) {
    case "diamond":
      return "bg-gradient-to-r from-cyan-300 to-cyan-500 text-cyan-900"
    case "platinum":
      return "bg-gradient-to-r from-slate-300 to-slate-500 text-slate-900"
    case "gold":
      return "bg-gradient-to-r from-amber-300 to-amber-500 text-amber-900"
    case "silver":
      return "bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900"
    default:
      return "bg-gradient-to-r from-orange-300 to-orange-500 text-orange-900"
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response =new  Response()
  const supabase=createServerSupabase(request,response)
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return json({
    user,
    members: [],
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  })
}

const TopThreeCard = ({
  member,
  index,
  activeTab,
  searchQuery,
  isCurrentUser,
}: {
  member: MemberWithStats
  index: number
  activeTab: string
  searchQuery: string
  isCurrentUser: boolean
}) => {
  const getRankStyles = (rank: number) => {
    switch (rank) {
      case 0:
        return {
          background: "bg-gradient-to-br from-cyan-300 via-cyan-400 to-cyan-600",
          icon: <Crown className="w-6 h-6 text-cyan-900" />,
          text: "text-cyan-900",
          glow: "shadow-lg shadow-cyan-500/50",
          border: "border-cyan-400",
        }
      case 1:
        return {
          background: "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500",
          icon: <Medal className="w-6 h-6 text-slate-900" />,
          text: "text-slate-900",
          glow: "shadow-lg shadow-slate-500/50",
          border: "border-slate-400",
        }
      case 2:
        return {
          background: "bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700",
          icon: <Trophy className="w-6 h-6 text-amber-100" />,
          text: "text-amber-100",
          glow: "shadow-lg shadow-amber-500/50",
          border: "border-amber-500",
        }
      default:
        return {
          background: "bg-white/10",
          icon: null,
          text: "text-gray-400",
          glow: "",
          border: "border-white/20",
        }
    }
  }

  const styles = getRankStyles(index)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-2xl border ${styles.border} ${isCurrentUser ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900" : ""} ${styles.glow}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
        className={`${styles.background} p-6`}
      >
        <div className="flex items-center gap-6">
          {/* Rank */}
          <div className="flex flex-col items-center text-white">
            {styles.icon}
            <span className={`text-3xl font-bold mt-2 ${styles.text}`}>
              #{searchQuery ? member.originalRank : index + 1}
            </span>
          </div>

          {/* Avatar */}
          <motion.div whileHover={{ scale: 1.1 }} className="relative w-20 h-20 hidden sm:block">
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/40">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url || "/placeholder.svg"}
                  alt={member.name}
                  className="w-full h-full object-cover text-white"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{member.name.charAt(0)}</span>
                </div>
              )}
            </div>
            {isCurrentUser && (
              <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </motion.div>

          {/* Info */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <Link
                to={`/profile/${member.github_username}`}
                className="text-xl font-bold hover:underline decoration-2 underline-offset-4"
              >
                <p className="text-white flex items-center gap-2">
                  {member.name}
                  {isCurrentUser && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">You</span>
                  )}
                </p>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm hidden sm:block ${styles.text}`}>@{member.github_username}</span>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm ${getTierStyles(member.tier)}`}
                >
                  {getTierIcon(member.tier)}
                  {member.tier.charAt(0).toUpperCase() + member.tier.slice(1)}
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            className="text-center"
          >
            <div className={`text-4xl font-bold ${styles.text}`}>
              {activeTab === "overall"
              ? member.bash_points
              : activeTab === "github"
              ? member.githubStreak || 0
              : activeTab === "leetcode"
              ? member.leetcodeStreak
              : activeTab === "duolingo"
              ? member.duolingoStreak || 0
              : member.bashClanPoints || 0}{" "}
            </div>
            <div className={`text-sm ${styles.text}`}>
              {" "}
              {activeTab === "overall" ? "Points" : activeTab === "github" ? "Commits" : "Problems"}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const RegularCard = ({
  member,
  index,
  activeTab,
  searchQuery,
  isCurrentUser,
}: {
  member: MemberWithStats
  index: number
  activeTab: string
  searchQuery: string
  isCurrentUser: boolean
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-2xl ${isCurrentUser ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900" : ""}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      >
        <div className="relative bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center gap-4">
          {/* Rank */}
          <div className="flex flex-col items-center">
            <span className={`text-3xl font-bold text-white`}>{searchQuery ? member.originalRank : index + 1}</span>
          </div>

          {/* Avatar */}
          <motion.div whileHover={{ scale: 1.1 }} className="relative w-20 h-20">
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden ">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url || "/placeholder.svg"}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{member.name.charAt(0)}</span>
                </div>
              )}
            </div>
            {isCurrentUser && (
              <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </motion.div>

          {/* Info */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <Link
                to={`/profile/${member.github_username}`}
                className="text-xl font-bold hover:underline decoration-2 underline-offset-4"
              >
                <p className="text-white flex items-center gap-2">
                  {member.name}
                  {isCurrentUser && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">You</span>
                  )}
                </p>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm hidden sm:block text-gray-400`}>@{member.github_username}</span>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm ${getTierStyles(member.tier)}`}
                >
                  {getTierIcon(member.tier)}
                  {member.tier.charAt(0).toUpperCase() + member.tier.slice(1)}
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            className="text-center"
          >
            <div
              className={
                "text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
              }
            >
                {activeTab === "overall"
                ? member.bash_points
                : activeTab === "github"
                  ? member.githubStreak || 0
                  : activeTab === "leetcode"
                  ? member.leetcodeStreak
                  : activeTab === "duolingo"
                  ? member.duolingoStreak || 0
                  : member.bashClanPoints || 0}{" "}
            </div>
            <div className={"text-sm text-gray-400"}>
              {" "}
              {activeTab === "overall" ? "Points" : activeTab === "github" ? "Commits" : "Problems"}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const ClanCard = ({ clan, index }: ClanCardProps) => {
  // Calculate total projects for the clan
  const totalProjects = clan.members.reduce(
    (acc, member) => acc + (member.stats?.projects ?? 0),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      >
        <div className="relative rounded-xl p-4 flex items-center gap-4">
          {/* Rank */}
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-white">{index + 1}</span>
          </div>

          {/* Clan Logo */}
          <motion.div whileHover={{ scale: 1.1 }} className="relative w-20 h-20">
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden">
              {clan.logo_url ? (
                <img
                  src={clan.logo_url || "/placeholder.svg"}
                  alt={clan.clan_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{clan.clan_name.charAt(0)}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Clan Name */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <Link to={`/clans/${clan.id}`} className="text-xl font-bold text-white hover:underline">
                {clan.clan_name}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-400">
                  {clan.members.length} members
                </span>
              </div>
            </motion.div>
          </div>

          {/* Total Projects */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            className="text-center"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {totalProjects}
              </span>
              <div className="text-sm text-gray-400">Projects</div>
            </div>
          </motion.div>
        </div>

        {/* Clan Members
        <div className="space-y-4 mt-4">
          {clan.members.map((member, memberIndex) => (
            <RegularCard
              key={member.id}
              member={member}
              index={memberIndex}
              activeTab="bashclan"
              searchQuery=""
              isCurrentUser={false}
            />
          ))}
        </div> */}
      </motion.div>
    </motion.div>
  );
};

export default function Leaderboard() {
  const { members: initialMembers, SUPABASE_URL, SUPABASE_ANON_KEY } = useLoaderData<typeof loader>()
  const [members, setMembers] = useState<MemberWithStats[]>(
    initialMembers.map((m) => ({ ...m, tier: getTier(m.bash_points) }))
  )
  const [activeTab, setActiveTab] = useState<"overall" | "github" | "leetcode" | "bashclan" | "duolingo">("overall")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [currentUser, setCurrentUser] = useState<MemberWithStats | null>(null)
  // const [currentLeague, setCurrentLeague] = useState<string>("bronze")
  // const [leagues, setLeagues] = useState<Record<string, MemberWithStats[]>>({})
  interface Clan {
    id: string
    name: string
    members: MemberWithStats[]
  }

  const [clans, setClans] = useState<Clan[]>([])

  // Fetch members and current user
  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return

    const supabase = initSupabase(SUPABASE_URL, SUPABASE_ANON_KEY)

    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        // Get the GitHub username from the user metadata or identity providers
        const githubUsername =
          user.user_metadata?.user_name ||
          user.identities?.find((i: any) => i.provider === "github")?.identity_data?.user_name

        if (githubUsername) {
          // Find the member with matching GitHub username
          const { data: memberData } = await supabase
            .from("members")
            .select("*")
            .eq("github_username", githubUsername)
            .single()

          if (memberData) {
            const userWithTier = {
              ...memberData,
              tier: getTier(memberData.bash_points),
              // league: getLeague(memberData.bash_points),
            }
            setCurrentUser(userWithTier)
            // setCurrentLeague(userWithTier.league || "bronze")
          }
        }
      }
    }

    const fetchMembers = async () => {
      const { data } = await supabase.from("members").select("*").order("bash_points", { ascending: false })

      if (data) {
        const membersWithStats = await Promise.all(
          data.map(async (member) => ({
            ...member,
            tier: getTier(member.bash_points),
            tierIcon: getTierIcon(getTier(member.bash_points)),
            githubStreak: await fetchGitHubStreak(member.github_username),
            leetcodeStreak: 0,
          }))
        )
        setMembers(membersWithStats)
      }

        // // Group members by league
        // const leagueGroups: Record<string, MemberWithStats[]> = {}
        // membersWithStats.forEach((member) => {
        //   const league = member.league || "bronze"
        //   if (!leagueGroups[league]) {
        //     leagueGroups[league] = []
        //   }
        //   leagueGroups[league].push(member)
        // })

        // setLeagues(leagueGroups)
    }

    const fetchClans = async () => {
      const { data: clans } = await supabase.from("clans").select("*");
      if (clans) {
        for (const clan of clans) {
          const { data: members } = await supabase
            .from("members")
            .select("*")
            .eq("clan_id", clan.id);
          clan.members = members || [];
        }
        setClans(clans);
      }
    };

    fetchCurrentUser()
    fetchMembers()
    fetchClans()

    const channel = supabase
      .channel("members")
      .on("postgres_changes", { event: "*", schema: "public", table: "members" }, () => {
        fetchMembers()
        fetchCurrentUser()
        fetchClans()
      })
      .subscribe()

   return () => {
      channel.unsubscribe()
    }
  }, [SUPABASE_URL, SUPABASE_ANON_KEY])

  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab") as "overall" | "github" | "leetcode" | "bashclan" | "duolingo" | null
    if (savedTab) {
      setActiveTab(savedTab)
    }
  }, [])

  async function fetchGitHubStreak(username: string) {
    /*try {
      const response = await fetch(`https://api.github.com/users/${username}/events/public`)
      const events = await response.json()

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const contributions = events.filter((event: any) => {
        const eventDate = new Date(event.created_at)
        return (
          eventDate > thirtyDaysAgo &&
          (event.type === "PushEvent" || event.type === "CreateEvent" || event.type === "PullRequestEvent")
        )
      })

      return contributions.length
    } catch (error) {
      console.error(`Error fetching GitHub stats for ${username}:`, error)
      return 0
    }*/
    return 0 // Keeping the original functionality
  }

  // Get members for the current league
  // const leagueMembers = leagues[currentLeague] || []

  // Filter and sort members based on search and active tab
  const filteredMembers = members
    .map((member, index) => ({ ...member, originalRank: index + 1 }))
    .filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.github_username?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
    )

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (activeTab === "overall") return b.bash_points - a.bash_points
    if (activeTab === "github") return (b.githubStreak || 0) - (a.githubStreak || 0)
    if (activeTab === "leetcode") return (b.leetcodeStreak || 0) - (a.leetcodeStreak || 0)
    if (activeTab === "bashclan") return (b.bashClanPoints || 0) - (a.bashClanPoints || 0)
    if (activeTab === "duolingo") return (b.duolingoStreak || 0) - (a.duolingoStreak || 0)
    return 0
  })

  return (
    <div className="min-h-screen pb-[78px] bg-gradient-to-b from-gray-900 to-black dark:from-white dark:to-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <img src={iconImage || "/placeholder.svg"} alt="Basher Logo" className="w-16 h-16" />
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Leaderboard
              </h1>
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-lg font-semibold text-white">Hello Basher&apos;s</div>
              <div className="text-sm text-gray-400">How&apos;s your learning journey?</div>
            </div>
          </div>

          {/* League Selection */}
          {/* <div className="mt-6">
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const leagueKeys = Object.keys(LEAGUES)
                  const currentIndex = leagueKeys.indexOf(currentLeague)
                  if (currentIndex > 0) {
                    setCurrentLeague(leagueKeys[currentIndex - 1])
                  }
                }}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                disabled={Object.keys(LEAGUES).indexOf(currentLeague) === 0}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>

              <div className={`text-center px-8 py-3 rounded-xl ${LEAGUES[currentLeague]?.background}`}>
                <div className="flex items-center justify-center gap-2">
                  {LEAGUES[currentLeague]?.icon}
                  <h2 className={`text-2xl font-bold ${LEAGUES[currentLeague]?.textColor}`}>
                    {LEAGUES[currentLeague]?.name}
                  </h2>
                </div>
                <p className={`text-sm ${LEAGUES[currentLeague]?.textColor}`}>{leagueMembers.length} members</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const leagueKeys = Object.keys(LEAGUES)
                  const currentIndex = leagueKeys.indexOf(currentLeague)
                  if (currentIndex < leagueKeys.length - 1) {
                    setCurrentLeague(leagueKeys[currentIndex + 1])
                  }
                }}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                disabled={Object.keys(LEAGUES).indexOf(currentLeague) === Object.keys(LEAGUES).length - 1}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div> */}

          {/* Search and Tabs */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-full flex items-center">
              {showSearch ? (
                <div className="w-full flex items-center">
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white z-10"
                    onClick={() => {
                      setSearchQuery("")
                      setShowSearch(false)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSearch(true)}
                  className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 mr-4"
                >
                  <Search className="w-5 h-5" />
                </motion.button>
              )}

                <div className="flex relative w-full gap-2 overflow-x-auto">
                {["overall", "github", "leetcode", "bashclan", "duolingo"].map((tab) => (
                  <motion.button
                  key={tab}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setActiveTab(tab as typeof activeTab)
                    localStorage.setItem("activeTab", tab)
                  }}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-colors ${
                    activeTab === tab ? "bg-blue-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                  >
                  {tab === "overall" && <Trophy className="w-4 h-4" />}
                  {tab === "github" && <Github className="w-4 h-4" />}
                  {tab === "leetcode" && <Code className="w-4 h-4" />}
                  {tab === "bashclan" && <Building className="w-4 h-4" />}
                  {tab === "duolingo" && <Feather className="w-4 h-4" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="popLayout">
          <motion.div layout className="space-y-6">
        {activeTab === "bashclan" ? (
          <div className="space-y-4">
            {clans
          .sort((a, b) => {
            const totalProjectsA = a.members.reduce(
              (acc, member) => acc + (member.stats?.projects ?? 0),
              0
            );
            const totalProjectsB = b.members.reduce(
              (acc, member) => acc + (member.stats?.projects ?? 0),
              0
            );
            return totalProjectsB - totalProjectsA;
          })
          .map((clan, index) => (
            <ClanCard key={clan.id} clan={clan} index={index} />
          ))}
          </div>
        ) : (
          <>
            {/* Top 3 Section */}
            <div className="space-y-4">
          {sortedMembers
            .filter((member) => member.originalRank <= 3)
            .map((member, index) =>
              activeTab === "overall" ? (
            <TopThreeCard
              key={member.id}
              member={member}
              index={member.originalRank - 1}
              activeTab={activeTab}
              searchQuery={searchQuery}
              isCurrentUser={currentUser?.id === member.id}
            />
              ) : (
            <RegularCard
              key={member.id}
              member={member}
              index={index}
              activeTab={activeTab}
              searchQuery={searchQuery}
              isCurrentUser={currentUser?.id === member.id}
            />
              )
            )}
            </div>

            {/* Rest of the Leaderboard */}
            <div className="space-y-4 mt-8">
          {sortedMembers
            .filter((member) => member.originalRank > 3)
            .map((member, index) => (
              <RegularCard
            key={member.id}
            member={member}
            index={index + 3}
            activeTab={activeTab}
            searchQuery={searchQuery}
            isCurrentUser={currentUser?.id === member.id}
              />
            ))}
            </div>
          </>
        )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

