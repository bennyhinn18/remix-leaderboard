"use client"

import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"
import { useEffect, useState } from "react"
import { Trophy, Github, Code, Search, Star, Award, Crown, Medal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createServerSupabase } from "~/utils/supabase.server"
import { initSupabase } from "~/utils/supabase.client"
import type { Member } from "~/types/database"
import iconImage from "~/assets/bashers.png"

interface MemberWithStats extends Member {
  githubStreak?: number
  leetcodeStreak?: number
  tier: "diamond" | "platinum" | "gold"
}

function getTier(points: number): MemberWithStats["tier"] {
  if (points >= 1000) return "diamond"
  if (points >= 5) return "platinum"
  return "gold"
}

function getTierIcon(tier: string) {
  switch (tier) {
    case "diamond":
      return <Star className="w-4 h-4" />
    case "platinum":
      return <Award className="w-4 h-4" />
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
    default:
      return "bg-gradient-to-r from-amber-300 to-amber-500 text-amber-900"
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase =createServerSupabase(request, response)
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  const { data: members } = await supabase.from("members").select("*").order("bash_points", { ascending: false })

  return json({
    members: members || [],
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  })
}

const TopThreeCard = ({ member, index, activeTab }: { member: MemberWithStats; index: number; activeTab: string }) => {
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
      className={`relative overflow-hidden rounded-2xl border ${styles.border} ${styles.glow}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
        className={`${styles.background} p-6`}
      >
        <div className="flex items-center gap-6">
          {/* Rank */}
          <div className="flex flex-col items-center">
            {styles.icon}
            <span className={`text-3xl font-bold mt-2 ${styles.text}`}>#{index + 1}</span>
          </div>

          {/* Avatar */}
          <motion.div whileHover={{ scale: 1.1 }} className="relative w-20 h-20">
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/40">
              {member.avatar_url ? (
                <img
                  src={`https://api.dicebear.com/9.x/dylan/svg?seed=${member.name}` || member.avatar_url}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{member.name.charAt(0)}</span>
                </div>
              )}
            </div>
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
                <p className="">{member.name}</p>
                
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
                  ? member.github_streak || 0
                  : member.leetcodeStreak}{" "}
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

const RegularCard = ({ member, index, activeTab }: { member: MemberWithStats; index: number; activeTab: string }) => {
  return (
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className={`relative overflow-hidden rounded-2xl `}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      
    >
      <div className="relative bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center gap-4">
        {/* Rank */}
        <div className="flex flex-col items-center">
         
          <span className={`text-3xl font-bold `}>#{index + 1}</span>
        </div>

        {/* Avatar */}
        <motion.div whileHover={{ scale: 1.1 }} className="relative w-20 h-20">
          <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden ">
            {member.avatar_url ? (
              <img
                src={`https://api.dicebear.com/9.x/dylan/svg?seed=${member.name}` || member.avatar_url}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{member.name.charAt(0)}</span>
              </div>
            )}
          </div>
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
              <p className="">{member.name}</p>
              
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
          <div className={'text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400'}>
            {activeTab === "overall"
              ? member.bash_points
              : activeTab === "github"
                ? member.github_streak || 0
                : member.leetcodeStreak}{" "}
          </div>
          <div className={"text-sm  text-gray-400"}>
            {" "}
            {activeTab === "overall" ? "Points" : activeTab === "github" ? "Commits" : "Problems"}
          </div>
        </motion.div>
      </div>
    </motion.div>
  </motion.div>
  )
}

export default function Leaderboard() {
  const { members: initialMembers, SUPABASE_URL, SUPABASE_ANON_KEY } = useLoaderData<typeof loader>()
  const [members, setMembers] = useState<MemberWithStats[]>(
    initialMembers.map((m) => ({ ...m, tier: getTier(m.bash_points) })),
  )
  const [activeTab, setActiveTab] = useState<"overall" | "github" | "leetcode">("overall")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return

    const supabase = initSupabase(SUPABASE_URL, SUPABASE_ANON_KEY)

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
          })),
        )
        setMembers(membersWithStats)
      }
    }

    fetchMembers()

    const channel = supabase
      .channel("members")
      .on("postgres_changes", { event: "*", schema: "public", table: "members" }, () => {
        fetchMembers()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [SUPABASE_URL, SUPABASE_ANON_KEY])

  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab") as "overall" | "github" | "leetcode" | null
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

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.github_username?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
  )

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (activeTab === "overall") return b.bash_points - a.bash_points
    if (activeTab === "github") return (b.githubStreak || 0) - (a.githubStreak || 0)
    if (activeTab === "leetcode") return (b.leetcodeStreak || 0) - (a.leetcodeStreak || 0)
    return 0
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black dark:from-white dark:to-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl "
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
              <div className="text-lg font-semibold text-white">Hello Gavi!!!</div>
              <div className="text-sm text-gray-400">How&apos;s your learning journey?</div>
            </div>
            </div>

          {/* Search and Tabs */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {["overall", "github", "leetcode"].map((tab) => (
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
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="popLayout">
          <motion.div layout className="space-y-6">
            {/* Top 3 Section */}
            <div className="space-y-4">
              {sortedMembers.slice(0, 3).map((member, index) => (
                <TopThreeCard key={member.id} member={member} index={index} activeTab={activeTab} />
              ))}
            </div>

            {/* Rest of the Leaderboard */}
            <div className="space-y-4 mt-8">
              {sortedMembers.slice(3).map((member, index) => (
                <RegularCard key={member.id} member={member} index={index + 3} activeTab={activeTab} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

