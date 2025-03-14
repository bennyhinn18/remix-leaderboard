import { motion } from "framer-motion";
import { Link } from "@remix-run/react";

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

const ClanCard = ({ clan, index }: ClanCardProps) => {
    // Calculate points percentage for the clan
    const totalPoints = clan.members.reduce(
      (acc, member) => acc + member.bash_points,
      0
    );
    const pointsPercentage = (totalPoints / (clan.members.length * 100)) * 100;
  
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
                  {pointsPercentage.toFixed(0)}
                </span>
                <div className="text-sm text-gray-400">Points</div>
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


export default ClanCard;