import { json, type ActionFunctionArgs } from "@remix-run/node"
import { useLoaderData, useNavigation, Link } from "@remix-run/react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Trophy, Star, ChevronRight, Activity, Sparkles } from "lucide-react"
import { createServerSupabase } from "~/utils/supabase.server"
import { CreateClanForm } from "~/components/create-clan-form"

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const clanName = formData.get("clan_name")
  const description = formData.get("description")
  const quote1 = formData.get("quote1")
  const quote2 = formData.get("quote2")
  const logoUrl = formData.get("logo_url")
  const bannerUrl = formData.get("banner_url")
  const response = new Response()
  const supabase =createServerSupabase(request, response)
  // Validate required fields
  if (!clanName || !description || !quote1) {
    return json({ error: "Missing required fields" })
  }

  const quotes = [quote1.toString()]
  if (quote2) quotes.push(quote2.toString())

  try {
    const { error } = await supabase.from("clans").insert([
      {
        clan_name: clanName,
        description,
        quotes,
        logo_url: logoUrl || null,
        banner_url: bannerUrl || null,
        members: [],
        activities: [],
        projects: 0,
        hackathons_won: 0,
        workshops: 0,
        avg_attendance: 0,
      },
    ])

    if (error) throw error

    return json({ success: true })
  } catch (error) {
    return json({ error: "Failed to create clan" })
  }
}

interface ClanMember {
  id: number
  name: string
  role: string
  status: string
  bash_crew: number
}

interface ClanActivity {
  id: number
  date: string
  type: string
  title?: string
  description?: string
  achievements?: string[]
  participants?: number[]
  resources?: string[]
}

interface Clan {
  id: number
  created_at: string
  clan_name: string
  quotes: string[]
  projects: number
  hackathons_won: number
  workshops: number
  avg_attendance: number
  members: ClanMember[]
  activities: ClanActivity[]
  description: string
  logo_url: string
  banner_url: string | null
  bash_clan_no: string
}

export const loader = async ({ request }: ActionFunctionArgs) => {
  const response = new Response()
  const supabase = createServerSupabase(request, response)
  const { data: clans } = await supabase.from("clans").select("*")
  if (clans) {
    for (const clan of clans) {
      const { data: members } = await supabase
        .from("members")
        .select("*")
        .eq("clan_id", clan.id)
      clan.members = members || []
    }
  }
  return json({ clans })
}

function ClanCard({ clan }: { clan: Clan }) {
  return (
    <Link to={`/clans/${clan.id}`} prefetch="intent" className="block">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-white/10 p-6 cursor-pointer group"
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <img
              src={clan.logo_url}
              alt={`${clan.clan_name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                {clan.clan_name}
              </h3>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
            </div>
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{clan.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">{clan.members.length} members</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">{clan.avg_attendance}% attendance</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export default function Clans() {
  const { clans } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  const totalMembers = clans ? clans.reduce((acc, clan) => acc + clan.members.length, 0) : 0
  const avgAttendance = clans ? clans.reduce((acc, clan) => acc + clan.avg_attendance, 0) / clans.length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8 pb-[78px]"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20"
            >
              <Users className="w-8 h-8 text-blue-400" />
            </motion.div>
            <div>
              <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
              >
          Clans
              </motion.h1>
              <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400"
              >
          Explore our coding clans and their achievements
              </motion.p>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="mt-4 sm:mt-0">
            <CreateClanForm />
          </motion.div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
              transition={{ duration: 0.3 }}
            />
            <Users className="w-6 h-6 text-blue-400 mb-2 relative z-10" />
            <div className="text-2xl font-bold relative z-10">{clans ? clans.length : 0}</div>
            <div className="text-sm text-gray-400 relative z-10">Active Clans</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
              transition={{ duration: 0.3 }}
            />
            <Trophy className="w-6 h-6 text-purple-400 mb-2 relative z-10" />
            <div className="text-2xl font-bold relative z-10">{totalMembers}</div>
            <div className="text-sm text-gray-400 relative z-10">Total Members</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-orange-500/10 border border-white/10 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
              transition={{ duration: 0.3 }}
            />
            <Activity className="w-6 h-6 text-pink-400 mb-2 relative z-10" />
            <div className="text-2xl font-bold relative z-10">{avgAttendance.toFixed(1)}%</div>
            <div className="text-sm text-gray-400 relative z-10">Average Attendance</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-white/10 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
              transition={{ duration: 0.3 }}
            />
            <Star className="w-6 h-6 text-orange-400 mb-2 relative z-10" />
            <div className="text-2xl font-bold relative z-10">
              {clans ? clans.reduce((acc, clan) => acc + clan.hackathons_won, 0) : 0}
            </div>
            <div className="text-sm text-gray-400 relative z-10">Hackathons Won</div>
          </motion.div>
        </div>

        {/* Clans Grid with Enhanced Animation */}
        <AnimatePresence mode="popLayout">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clans &&
              clans.map((clan, index) => (
                <motion.div
                  key={clan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <ClanCard clan={clan} />
                </motion.div>
              ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {(!clans || clans.length === 0) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Clans Yet</h3>
            <p className="text-gray-400 mb-6">Be the first to create a clan and start your journey!</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

