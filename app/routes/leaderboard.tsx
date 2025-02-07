import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { useEffect, useState } from "react"
import { Menu, Trophy, Github, Code } from "lucide-react"
import { supabase } from "~/utils/supabase.server"
import { getSupabaseClient } from "~/utils/supabase.client"
import type { Member } from "~/types/database"
import styles from "~/styles/leaderboard.module.css"

interface MemberWithStats extends Member {
  githubStreak?: number
  leetcodeStreak?: number
  tier: "diamond" | "platinum" | "gold"
}

function getTier(points: number): MemberWithStats["tier"] {
  if (points >= 2500) return "diamond"
  if (points >= 2400) return "platinum"
  return "gold"
}

export const loader = async () => {
  const { data: members } = await supabase.from("members").select("*").order("points", { ascending: false })

  return json({
    members: members || [],
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  })
}

export default function Leaderboard() {
  const { members: initialMembers, SUPABASE_URL, SUPABASE_ANON_KEY } = useLoaderData<typeof loader>()
  const [members, setMembers] = useState<MemberWithStats[]>(
    initialMembers.map((m) => ({ ...m, tier: getTier(m.points) })),
  )
  const [activeTab, setActiveTab] = useState<"overall" | "github" | "leetcode">("overall")

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return

    const supabase = getSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    const fetchMembers = async () => {
      const { data } = await supabase.from("members").select("*").order("points", { ascending: false })

      if (data) {
        const membersWithStats = await Promise.all(
          data.map(async (member) => ({
            ...member,
            tier: getTier(member.points),
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
   return 0
  }

  return (
    <div className={`min-h-screen bgPattern`}>
      {/* Header */}
        <div className="flex justify-between bg-gradient-to-br from-blue-300 to-blue-400 items-center p-6">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Menu className="w-6 h-6 text-gray-800" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-800">Leaderboard</h1>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-800">Hello Gavi!!!</div>
            <div className="text-sm text-gray-700">How's your learning journey?</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-100 to-blue-400">
          <div className="max-w-4xl bg-gradient-to-br from-blue-100 to-blue-400 mx-auto px-4 py-8">
          
          {/* Tabs */}
          <div className="flex gap-4 mb-8 overflow-auto">
            <button
              onClick={() => {
                setActiveTab("overall")
                localStorage.setItem("activeTab", "overall")
              }}
              className={`flex items-center gap-2 px-6 py-2 rounded-full transition-colors ${
                activeTab === "overall" ? "bg-white text-gray-800" : "bg-white/20 text-gray-800 hover:bg-white/30"
              }`}
            >
              <Trophy className="w-4 h-4" />
              Overall
            </button>
            <button
              onClick={() => {
                setActiveTab("github")
                localStorage.setItem("activeTab", "github")
              }}
              className={`flex items-center gap-2 px-6 py-2 rounded-full transition-colors ${
                activeTab === "github" ? "bg-white text-gray-800" : "bg-white/20 text-gray-800 hover:bg-white/30"
              }`}
            >
              <Github className="w-4 h-4" />
              GitHub Streak
            </button>
            <button
              onClick={() => {
                setActiveTab("leetcode")
                localStorage.setItem("activeTab", "leetcode")
              }}
              className={`flex items-center gap-2 px-6 py-2 rounded-full transition-colors ${
                activeTab === "leetcode" ? "bg-white text-gray-800" : "bg-white/20 text-gray-800 hover:bg-white/30"
              }`}
            >
              <Code className="w-4 h-4" />
              LeetCode Streak
            </button>
          </div>
          {/* Leaderboard */}
          <div className="space-y-4">
            {members
              .sort((a, b) => {
                if (activeTab === "overall") {
                  return b.points - a.points
                } else if (activeTab === "github") {
                  return (b.githubStreak || 0) - (a.githubStreak || 0)
                } else {
                  return (b.leetcodeStreak || 0) - (a.leetcodeStreak || 0)
                }
              })
              .map((member, index) => (
                <div key={member.id} className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-lg">
                  {/* Rank */}
                  <div
                    className={`text-2xl font-bold w-12 ${
                      index === 0
                        ? styles.rank1
                        : index === 1
                          ? styles.rank2
                          : index === 2
                            ? styles.rank3
                            : "text-gray-400"
                    }`}
                  >
                    #{index + 1}
                  </div>
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full hidden sm:block">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url || "/placeholder.svg"}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-600">{member.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                      <span
                        className={`${styles.tierBadge} ${styles[`tier${member.tier.charAt(0).toUpperCase()}${member.tier.slice(1)}`]}`}
                      >
                        {member.tier.charAt(0).toUpperCase() + member.tier.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">@{member.github_username}</p>
                  </div>
                  {/* Score */}
                  <div className="flex items-center gap-2">
                    <div className="text-sm hidden sm:block text-gray-500">
                      {activeTab === "overall" ? "Points" : activeTab === "github" ? "Commits" : "Problems"}:
                    </div>
                    <div className="text-2xl font-bold text-amber-500">
                      {activeTab === "overall" && member.points}
                      {activeTab === "github" && (member.githubStreak || 0)}
                      {activeTab === "leetcode" && (member.leetcodeStreak || 0)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
                </div>
        </div>
    </div>
  )
}

