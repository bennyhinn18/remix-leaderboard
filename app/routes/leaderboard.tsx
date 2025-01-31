import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { GitCommit, Trophy, Github } from "lucide-react"
import { supabase } from "~/utils/supabase.server"
import { getSupabaseClient } from "~/utils/supabase.client"
import type { Member } from "~/types/database"

interface MemberWithGitHub extends Member {
  githubStreak?: number
}

export const loader = async () => {
  const { data: members } = await supabase.from("members").select("*").order("points", { ascending: false })

  // Fetch GitHub streaks for all members
  const membersWithStreaks = await Promise.all(
    (members || []).map(async (member) => ({
      ...member,
      githubStreak: 0, // We'll fetch this client-side to avoid rate limits
    })),
  )

  return json({
    members: membersWithStreaks,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  })
}

export default function Leaderboard() {
  const { members: initialMembers, SUPABASE_URL, SUPABASE_ANON_KEY } = useLoaderData<typeof loader>()
  const [members, setMembers] = useState<MemberWithGitHub[]>(initialMembers)

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return

    const supabase = getSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    const fetchMembers = async () => {
      const { data } = await supabase.from("members").select("*").order("points", { ascending: false })

      if (data) {
        // Update members with GitHub streaks
        const membersWithStreaks = await Promise.all(
          data.map(async (member) => ({
            ...member,
            githubStreak: await fetchGitHubStreak(member.github_username),
          })),
        )
        setMembers(membersWithStreaks)
      }
    }

    // Fetch initial data
    fetchMembers()

    // Set up real-time subscription
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

  // Helper function to fetch GitHub streak
  async function fetchGitHubStreak(username: string) {
    try {
      const response = await fetch(`https://api.github.com/users/${username}/events/public`)
      const events = await response.json()

      // Get contributions from the last 30 days
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
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl text-gray-900 font-bold text-center mb-8">Leaderboard</h1>

      <Tabs defaultValue="points" className="w-full text-gray-900">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="points" >
            <Trophy className="mr-2  h-4 w-4" />
            Points Leaderboard
          </TabsTrigger>
          <TabsTrigger value="github">
            <Github className="mr-2 h-4 w-4" />
            GitHub Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {members.map((member, index) => (
                <div key={member.id} className="flex items-center p-6 hover:bg-gray-50">
                  <div className="flex-shrink-0 w-12 text-2xl font-bold text-gray-500">#{index + 1}</div>
                  <div className="flex-shrink-0 h-12 w-12">
                    {member.avatar_url ? (
                      <img
                        className="h-12 w-12 rounded-full"
                        src={member.avatar_url || "/placeholder.svg"}
                        alt={member.name}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xl font-medium text-gray-600">{member.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="text-lg font-medium text-gray-900">{member.name}</div>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-semibold text-indigo-600">{member.points} pts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="github">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {[...members]
                .sort((a, b) => (b.githubStreak || 0) - (a.githubStreak || 0))
                .map((member, index) => (
                  <div key={member.id} className="flex items-center p-6 hover:bg-gray-50">
                    <div className="flex-shrink-0 w-12 text-2xl font-bold text-gray-500">#{index + 1}</div>
                    <div className="flex-shrink-0 h-12 w-12">
                      {member.avatar_url ? (
                        <img
                          className="h-12 w-12 rounded-full"
                          src={member.avatar_url || "/placeholder.svg"}
                          alt={member.name}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xl font-medium text-gray-600">{member.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="text-lg font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500">@{member.github_username}</div>
                    </div>
                    <div className="ml-4 flex items-center">
                      <GitCommit className="h-5 w-5 text-green-500 mr-2" />
                      <div className="text-2xl font-semibold text-green-600">{member.githubStreak || 0}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

