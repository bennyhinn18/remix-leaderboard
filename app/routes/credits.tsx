import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { motion } from "framer-motion"
import { Crown, Star } from "lucide-react"
import { Card } from "~/components/ui/card"
import { supabase } from "~/utils/supabase.server"

// Types for our awards data
interface Award {
  icon: string
  title: string
  description: string
  gradient: string
  borderGradient: string
}

interface TopMember {
  id: number
  name: string
  clan_name: string
  avatar_url?: string
  points: number
}

interface LoaderData {
  topBasher: TopMember | null
  topLeader: TopMember | null
  currentMonth: string
  awards: Award[]
}

export const loader = async ({}: LoaderFunctionArgs) => {
  // Get the current month
  const currentMonth = new Date().toLocaleString("default", { month: "long" })

  // Fetch top basher (member with highest points)
  const { data: topBasherData } = await supabase
    .from("members")
    .select(`
      id,
      name,
      avatar_url,
      bash_points,
      clan_name:clans!name
    `)
    .order("points", { ascending: false })
    .limit(1)
    .single()

  // Fetch top leader (member with leader role and highest points)
  const { data: topLeaderData } = await supabase
    .from("members")
    .select(`
      id,
      name,
      avatar_url,
      points,
      clans!inner (
        name
      )
    `)
    .eq("role", "leader")
    .order("points", { ascending: false })
    .limit(1)
    .single()

  // Static awards data
  const awards: Award[] = [
    {
      icon: "👑",
      title: "Best Basher",
      description: "Awarded to members who consistently demonstrate exceptional coding skills",
      gradient: "from-amber-500/20 to-yellow-500/20",
      borderGradient: "from-amber-500/30 to-yellow-500/30",
    },
    {
      icon: "⭐",
      title: "Best Leader",
      description: "Recognizes outstanding leadership and mentorship within the community",
      gradient: "from-blue-500/20 to-purple-500/20",
      borderGradient: "from-blue-500/30 to-purple-500/30",
    },
    {
      icon: "🏆",
      title: "Best Clan",
      description: "Honors clans with exceptional teamwork and achievements",
      gradient: "from-green-500/20 to-emerald-500/20",
      borderGradient: "from-green-500/30 to-emerald-500/30",
    },
    {
      icon: "💫",
      title: "Best Profile",
      description: "Celebrates members with outstanding profile customization and activity",
      gradient: "from-pink-500/20 to-rose-500/20",
      borderGradient: "from-pink-500/30 to-rose-500/30",
    },
  ]

  return new Response(
    JSON.stringify({
      topBasher: topBasherData && Array.isArray(topBasherData) && topBasherData.length > 0
        ? {
            ...topBasherData[0],
            clan_name: topBasherData[0].clan_name,
          }
        : null,
      topLeader: topLeaderData && Array.isArray(topLeaderData) && topLeaderData.length > 0
        ? {
            ...topLeaderData[0],
            clan_name: topLeaderData[0].clan_name,
          }
        : null,
      currentMonth,
      awards,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function Credits() {
  const { topBasher, topLeader, currentMonth, awards } = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Hall of Fame Section */}
        <motion.div initial="hidden" animate="show" variants={container} className="space-y-8">
          <motion.h1
            variants={item}
            className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400"
          >
            Hall of Fame
          </motion.h1>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Best Basher Card */}
            <motion.div variants={item} whileHover={{ scale: 1.02 }} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity" />
              <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-0">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-amber-500/10">
                      <Crown className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-amber-400">Best Basher</h3>
                      {topBasher ? (
                        <>
                          <p className="text-2xl font-bold mt-1">{topBasher.name}</p>
                          <p className="text-gray-400">{topBasher.clan_name}</p>
                          <p className="text-amber-400/80 text-sm mt-1">{topBasher.points.toLocaleString()} points</p>
                        </>
                      ) : (
                        <p className="text-gray-400 mt-1">No basher found</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Best Leader Card */}
            <motion.div variants={item} whileHover={{ scale: 1.02 }} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity" />
              <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-0">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <Star className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-400">Best Leader</h3>
                      {topLeader ? (
                        <>
                          <p className="text-2xl font-bold mt-1">{topLeader.name}</p>
                          <p className="text-gray-400">{topLeader.clan_name}</p>
                          <p className="text-blue-400/80 text-sm mt-1">{topLeader.points.toLocaleString()} points</p>
                        </>
                      ) : (
                        <p className="text-gray-400 mt-1">No leader found</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Monthly Achievers Section */}
        <motion.div initial="hidden" animate="show" variants={container} className="space-y-8">
          <motion.div variants={item} className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-purple-400">{currentMonth} Achievers</h2>
            <p className="text-gray-400">Recognizing excellence in our community</p>
          </motion.div>

          <motion.div variants={container} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {awards.map((award) => (
              <motion.div key={award.title} variants={item} whileHover={{ scale: 1.05 }} className="relative group">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${award.borderGradient} opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity`}
                />
                <Card className={`relative overflow-hidden bg-gradient-to-br ${award.gradient} border-0`}>
                  <motion.div
                    className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                    animate={{ opacity: [0, 0.1, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  />
                  <div className="p-6 space-y-4">
                    <div className="text-4xl">{award.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold">{award.title}</h3>
                      <p className="text-sm text-gray-300 mt-2">{award.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

