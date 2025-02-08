import { motion } from "framer-motion"
import { Heart, MessageSquare, UserPlus, Users } from "lucide-react"
import { Button } from "~/components/ui/button"

const companions = [
  {
    name: "Alice Chen",
    role: "Full Stack Developer",
    avatar: "/placeholder.svg?height=100&width=100",
    status: "online",
    level: 42,
    matchRate: 95,
  },
  {
    name: "Bob Smith",
    role: "UI/UX Designer",
    avatar: "/placeholder.svg?height=100&width=100",
    status: "offline",
    level: 38,
    matchRate: 88,
  },
  {
    name: "Carol Johnson",
    role: "Backend Developer",
    avatar: "/placeholder.svg?height=100&width=100",
    status: "online",
    level: 45,
    matchRate: 92,
  },
]

export default function Companions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-pink-500/10">
            <Heart className="w-8 h-8 text-pink-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Coding Companions</h1>
            <p className="text-gray-400">Find your perfect coding partner</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Your Companion Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-400">Active Companions</div>
                <div className="font-semibold">3/5</div>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-3/5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" />
              </div>
              <Button className="w-full bg-white/10 hover:bg-white/20">
                <UserPlus className="w-4 h-4 mr-2" />
                Find New Companions
              </Button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5">
                <div className="text-2xl font-bold text-purple-400">85%</div>
                <div className="text-sm text-gray-400">Match Rate</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <div className="text-2xl font-bold text-blue-400">12</div>
                <div className="text-sm text-gray-400">Sessions</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6"
        >
          <h2 className="text-xl font-semibold">Your Companions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companions.map((companion, index) => (
              <motion.div
                key={companion.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 relative group"
              >
                <div className="absolute top-3 right-3">
                  <div
                    className={`w-3 h-3 rounded-full ${companion.status === "online" ? "bg-green-500" : "bg-gray-500"}`}
                  />
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10">
                    <img
                      src={companion.avatar || "/placeholder.svg"}
                      alt={companion.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{companion.name}</h3>
                    <p className="text-sm text-gray-400">{companion.role}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>Level {companion.level}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-400">Match Rate</div>
                    <div className="font-semibold text-green-400">{companion.matchRate}%</div>
                  </div>
                  <div className="mt-4">
                    <Button variant="secondary" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

