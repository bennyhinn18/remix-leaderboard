"use client"

import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { useEffect, useState } from "react"
import { Trophy, Github, Code, Search, Award, Medal,  X, Building, Feather, MessageCircle, Book, Sparkles, GemIcon, Boxes, CircleDot, Leaf, Flame, Droplets, Crown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { initSupabase } from "~/utils/supabase.client"
import iconImage from "~/assets/bashers.png"
import { createServerSupabase } from "~/utils/supabase.server"

import ClanTopOneCard from "~/components/leaderboard/clantopcard"
import TopThreeCard from "~/components/leaderboard/topthreecard"
import ClanCard from "~/components/leaderboard/clancard"
import RegularCard from "~/components/leaderboard/regularcard"

interface MemberWithStats {
  id: string
  name: string
  github_username: string
  avatar_url: string
  bash_points: number
  githubStreak?: number
  leetcodeStreak?: number
  bashClanPoints?: number 
  discordPoints?: number
  bookRead?: number
  duolingoStreak?: number
  tier: "diamond" | "obsidian" | "pearl" | "amethyst" | "emerald" | "ruby" | "sapphire" | "gold" | "silver" | "bronze"
  originalRank?: number
  stats?: {
    projects?: number
  }
}

function getTier(points: number): MemberWithStats["tier"] {
  if (points >= 3000) return "diamond"
  if (points >= 2600) return "obsidian"
  if (points >= 2200) return "pearl"
  if (points >= 1750) return "amethyst"
  if (points >= 1350) return "emerald"
  if (points >= 1000) return "ruby"
  if (points >= 700) return "sapphire"
  if (points >= 450) return "gold"
  if (points >= 250) return "silver"
  return "bronze"
}

function getTierIcon(tier: string) {
  switch (tier) {
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
    case "platinum":
      return <Crown className="w-4 h-4" />
    default:
      return <Award className="w-4 h-4" />
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase = createServerSupabase(request, response)

  // Fetch all members
  // const { data: members } = await supabase.from("members").select("*")

  // Fetch Duolingo streaks for each member
  // const membersWithDuolingoStreaks = await Promise.all(
  //   members.map(async (member) => {
  //     if (member.duolingo_username) {
  //       try {
  //         const duolingoResponse = await fetch(
  //           `https://www.duolingo.com/2017-06-30/users?username=${member.duolingo_username}&fields=streak,streakData%7BcurrentStreak,previousStreak%7D%7D`
  //         )
  //         const duolingoData = await duolingoResponse.json()
  //         const userData = duolingoData.users?.[0] || {}
  //         const duolingo_streak = Math.max(
  //           userData.streak ?? 0,
  //           userData.streakData?.currentStreak?.length ?? 0,
  //           userData.streakData?.previousStreak?.length ?? 0
  //         )
  //         return { ...member, duolingoStreak: duolingo_streak }
  //       } catch (error) {
  //         console.error(`Error fetching Duolingo streak for ${member.duolingo_username}:`, error)
  //         return { ...member, duolingoStreak: 0 }
  //       }
  //     }
  //     return { ...member, duolingoStreak: 0 }
  //   })
  // )

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




export default function Leaderboard() {
  const { members: initialMembers, SUPABASE_URL, SUPABASE_ANON_KEY } = useLoaderData<typeof loader>()
  const [members, setMembers] = useState<MemberWithStats[]>(
    initialMembers.map((m) => ({ ...m, tier: getTier(m.bash_points) }))
  )
  const [activeTab, setActiveTab] = useState<"overall" | "bashclan" | "github" | "leetcode" | "duolingo" | "discord" | "books">("overall")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [currentUser, setCurrentUser] = useState<MemberWithStats | null>(null)
  interface Clan {
    id: string
    name: string
    clan_name: string
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
            }
            setCurrentUser(userWithTier)
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
    const savedTab = localStorage.getItem("activeTab") as "overall" | "bashclan" | "github" | "leetcode" | "duolingo" | "discord" | "books" | null
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
    if (activeTab === "discord") return (b.discordPoints || 0) - (a.discordPoints || 0)
    if (activeTab === "books") return (b.bookRead || 0) - (a.bookRead || 0)
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
              <div className="text-lg font-semibold text-white">Hello {currentUser?.name || "Basher's"}</div>
              <div className="text-sm text-gray-400">How&apos;s your learning journey?</div>
            </div>
          </div>

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
                {["overall", "bashclan", "github", "leetcode", "duolingo", "discord", "books"].map((tab) => (
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
                  {tab === "bashclan" && <Building className="w-4 h-4" />}
                  {tab === "github" && <Github className="w-4 h-4" />}
                  {tab === "leetcode" && <Code className="w-4 h-4" />}
                  {tab === "duolingo" && <Feather className="w-4 h-4" />}
                  {tab === "discord" && <MessageCircle className="w-4 h-4" />}
                  {tab === "books" && <Book className="w-4 h-4" />}
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
          const averagePointsA =
            a.members.reduce((acc, member) => acc + member.bash_points, 0) /
            (a.members.length);
          const averagePointsB =
            b.members.reduce((acc, member) => acc + member.bash_points, 0) /
            (b.members.length);
          return averagePointsB - averagePointsA;
          })
          .map((clan, index) => {
            const totalPoints = clan.members.reduce(
          (acc, member) => acc + member.bash_points,
          0
            );
            const pointsPercentage = totalPoints / (clan.members.length * 100) * 100;
            return index === 0 ? (
          <ClanTopOneCard key={clan.id} clan={clan} index={index} pointsPercentage={pointsPercentage} />
            ) : (
          <ClanCard key={clan.id} clan={clan} index={index} pointsPercentage={pointsPercentage} />
            );
          })}
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
              duolingoStreak={member.duolingoStreak || 0}
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
              duolingoStreak={member.duolingoStreak || 0}
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

