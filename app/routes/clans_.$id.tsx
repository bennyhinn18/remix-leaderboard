import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"
import { motion } from "framer-motion"
import {
  Users,
  Trophy,
  ArrowLeft,
  Activity,
  Target,
  GitPullRequest,
  Book,
  Award,
  TrendingUp,
  MessageSquare,
} from "lucide-react"
import { createServerSupabase } from "~/utils/supabase.server"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Badge } from "~/components/ui/badge"
import type { Clan } from "~/types/clans"

export const loader = async ({ params,request }: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase =createServerSupabase(request, response)
  const { data: clan } = await supabase.from("clans").select("*").eq("id", params.id).single()
  
  if (!clan) {
    throw new Response("Clan not found", {
      status: 404,
      statusText: "Not Found",
    })
  }
  return json({ clan })
}

function ClanHeader({ clan }: { clan: Clan }) {
  return (
    <div className="relative h-64 rounded-2xl overflow-hidden">
      {/* Banner */}
      <div className="absolute inset-0">
        <img
          src={clan.banner_url || " "}
          alt={`${clan.clan_name} banner`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <div className="flex items-start gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/10 bg-gradient-to-br from-blue-500/20 to-purple-500/20"
          >
            <img
              src={clan.logo_url || " "}
              alt={clan.clan_name}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <h1 className="text-3xl font-bold text-white">{clan.clan_name}</h1>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                #{clan.bash_clan_no}
              </Badge>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-300 max-w-2xl"
            >
              {clan.description}
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ClanStats({ clan }: { clan: Clan }) {
  const stats = [
    { icon: Users, label: "Members", value: clan.members.length, color: "blue" },
    { icon: Trophy, label: "Hackathons Won", value: clan.hackathons_won, color: "purple" },
    { icon: Activity, label: "Avg. Attendance", value: `${clan.avg_attendance}%`, color: "green" },
    { icon: GitPullRequest, label: "Projects", value: clan.projects, color: "orange" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`p-6 rounded-2xl bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/10 border border-white/10`}
        >
          <stat.icon className={`w-6 h-6 text-${stat.color}-400 mb-2`} />
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="text-sm text-gray-400">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  )
}

function MemberList({ members }: { members: Clan["members"] }) {
  return (
    <div className="space-y-4">
      {members.map((member, index) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              {/* Add member avatar here if available */}
              <div className="w-full h-full flex items-center justify-center text-xl font-bold">
                {member.name.charAt(0)}
              </div>
            </div>
            <div>
              <div className="font-medium text-white group-hover:text-blue-400 transition-colors">{member.name}</div>
              <div className="text-sm text-gray-400">{member.role}</div>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`${
              member.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
            }`}
          >
            {member.status}
          </Badge>
        </motion.div>
      ))}
    </div>
  )
}

function ActivityTimeline({ activities }: { activities: Clan["activities"] }) {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative pl-6 pb-6 last:pb-0"
        >
          {/* Timeline line */}
          {index !== activities.length - 1 && <div className="absolute left-[11px] top-3 bottom-0 w-px bg-white/10" />}

          {/* Timeline dot */}
          <div className="absolute left-0 top-2 w-[23px] h-[23px] rounded-full border-4 border-gray-900 bg-blue-400" />

          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 capitalize">
                {activity.type}
              </Badge>
              <span className="text-sm text-gray-400">{new Date(activity.date).toLocaleDateString()}</span>
            </div>
            {activity.title && <h4 className="font-medium text-white mb-1">{activity.title}</h4>}
            {activity.description && <p className="text-sm text-gray-400">{activity.description}</p>}
            {activity.achievements && activity.achievements.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activity.achievements.map((achievement, i) => (
                  <Badge key={i} variant="secondary" className="bg-purple-500/20 text-purple-400">
                    {achievement}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function PerformanceMetrics() {
  const metrics = [
    { label: "Project Completion", value: 85 },
    { label: "Meeting Attendance", value: 92 },
    { label: "Code Quality", value: 88 },
    { label: "Team Collaboration", value: 95 },
  ]

  return (
    <div className="space-y-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{metric.label}</span>
            <span className="text-white">{metric.value}%</span>
          </div>
          <Progress value={metric.value} className="h-2" />
        </motion.div>
      ))}
    </div>
  )
}

export default function ClanPage() {
  const { clan } = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button variant="ghost" asChild className="text-gray-400 hover:text-white">
            <Link to="/clans" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Clans
            </Link>
          </Button>
        </motion.div>

        {/* Clan Header */}
        <ClanHeader clan={clan} />

        {/* Clan Stats */}
        <ClanStats clan={clan} />

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-white/10">
              Members
            </TabsTrigger>
            <TabsTrigger value="activities" className="data-[state=active]:bg-white/10">
              Activities
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-white/10">
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quotes */}
            <div className="grid gap-4">
              {clan.quotes.map((quote, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10"
                >
                  <MessageSquare className="w-5 h-5 text-blue-400 mb-2" />
                  <p className="text-lg italic text-gray-300">"{quote}"</p>
                </motion.div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-white/5 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Goals
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Monthly Projects</span>
                    <span className="text-green-400">4/5</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
              </div>

              <div className="p-6 rounded-xl bg-white/5 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  Achievements
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                    Best Team 2024
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                    Innovation Award
                  </Badge>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    Perfect Attendance
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members">
            <MemberList members={clan.members} />
          </TabsContent>

          <TabsContent value="activities">
            <ActivityTimeline activities={clan.activities} />
          </TabsContent>

          <TabsContent value="performance">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-white/5">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Monthly Performance
                </h3>
                <PerformanceMetrics />
              </div>

              <div className="p-6 rounded-xl bg-white/5">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                  <Book className="w-5 h-5 text-purple-400" />
                  Learning Progress
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Courses Completed</span>
                    <span className="text-white">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Certifications</span>
                    <span className="text-white">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Workshop Hours</span>
                    <span className="text-white">48</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

