import { motion } from "framer-motion"
import { User, Award, Trophy, Medal, Sparkles, GemIcon, Boxes, CircleDot, Leaf, Flame, Droplets, Crown } from "lucide-react"
import { Link } from "@remix-run/react"

type MemberWithStats = {
  originalRank: number;
  avatar_url: string | null;
  name: string;
  github_username: string;
  tier: string;
  bash_points: number;
  bashClanPoints?: number;
  githubStreak?: number;
  leetcodeStreak?: number;
  duolingoStreak?: number;
  discordPoints?: number;
  bookRead?: number;
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

function getTierStyles(tier: string) {
  switch (tier) {
    case "diamond":
      return "bg-gradient-to-r from-cyan-300 to-cyan-500 text-cyan-900"
    case "obsidian":
      return "bg-gradient-to-r from-gray-800 to-black text-white"
    case "pearl":
      return "bg-gradient-to-r from-pink-100 to-pink-400 text-pink-900"
    case "amethyst":
      return "bg-gradient-to-r from-purple-300 to-purple-500 text-purple-900"
    case "emerald":
      return "bg-gradient-to-r from-green-300 to-green-500 text-green-900"
    case "ruby":
      return "bg-gradient-to-r from-red-300 to-red-500 text-red-900"
    case "sapphire":
      return "bg-gradient-to-r from-blue-300 to-blue-500 text-blue-900"
    case "gold":
      return "bg-gradient-to-r from-amber-300 to-amber-500 text-amber-900"
    case "silver":
      return "bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900"
    case "platinum":
      return "bg-gradient-to-r from-slate-300 to-slate-500 text-slate-900"
    default:
      return "bg-gradient-to-r from-orange-300 to-orange-500 text-orange-900"
  }
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
  duolingoStreak: number
  isCurrentUser: boolean
}) => {
  // console.log("Active Tab:", activeTab);
  // console.log("Member Duolingo Streak:", member.duolingoStreak);
  // console.log("Member Object:", member);

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
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {activeTab === "overall"
                ? member.bash_points
                : activeTab === "bashclan"
                ? member.bashClanPoints || 0
                : activeTab === "github"
                ? member.githubStreak || 0
                : activeTab === "leetcode"
                ? member.leetcodeStreak
                : activeTab === "duolingo"
                ? member.duolingoStreak || "0"
                : activeTab === "discord"
                ? member.discordPoints || 0
                : activeTab === "books"
                ? member.bookRead || 0
                : 0}{" "}
            </div>
            <div className="text-sm text-gray-400">
              {" "}
              {activeTab === "overall"
                ? "Points"
                : activeTab === "github"
                ? "Commits"
                : activeTab === "leetcode"
                ? "Problems"
                : activeTab === "duolingo"
                ? "Streak"
                : activeTab === "discord"
                ? "Activity"
                : "Read"}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default RegularCard;