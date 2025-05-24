import { useMobile } from '~/hooks/useMobile';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Rocket, Crown, Star } from 'lucide-react';
import { Link } from '@remix-run/react';

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
};

interface Clan {
  id: string;
  clan_name: string;
  members: MemberWithStats[];
  logo_url?: string;
}

interface ClanCardProps {
  clan: Clan;
  index: number;
  pointsPercentage: number;
}

// Mobile version of the component
const ClanTopOneCard = ({ clan, index }: ClanCardProps) => {
  const [sparklePositions, setSparklePositions] = useState<
    Array<{ x: number; y: number; size: number; delay: number }>
  >([]);
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useMobile(); // Ensure this hook works

  // Calculate points percentage for the clan
  const totalPoints = clan.members.reduce(
    (acc, member) => acc + member.bash_points,
    0
  );
  const pointsPercentage = totalPoints / clan.members.length;

  // Generate random sparkle positions
  useEffect(() => {
    const newPositions = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
    }));
    setSparklePositions(newPositions);
  }, []);

  // Mobile version of the component
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-20 w-full max-w-sm mx-auto"
      >
        {/* Main Card Content */}
        <motion.div className="relative rounded-2xl overflow-hidden backdrop-blur-sm bg-gradient-to-br from-purple-900/60 via-indigo-900/60 to-purple-900/60 border border-purple-500/30 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          <div className="p-6 flex flex-col items-center gap-6">
            {/* Rank Trophy and Clan Name */}
            <div className="flex items-center gap-4 w-full">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      boxShadow: '0 0 20px 5px rgba(250,204,21,0.3)',
                    }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center"
                  >
                    <Trophy className="w-8 h-8 text-yellow-900" />
                  </motion.div>
                  <motion.div
                    animate={{
                      rotate: 360,
                      opacity: 0.5,
                    }}
                    transition={{
                      rotate: {
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'linear',
                      },
                    }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-yellow-400/50"
                  />
                </div>
                <motion.span className="text-3xl font-bold mt-1 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-amber-500">
                  #1
                </motion.span>
              </motion.div>

              <div className="flex-1">
                <Link
                  to={`/clans/${clan.id}`}
                  className="inline-block text-3xl font-extrabold hover:underline bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300"
                >
                  {clan.clan_name}
                </Link>

                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 bg-purple-900/50 px-2 py-1 rounded-full">
                    <Sparkles className="w-3 h-3 text-purple-300" />
                    <span className="text-sm text-purple-200">
                      {clan.members.length} members
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Points */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              whileTap={{ scale: 0.95 }}
              className="w-full"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px 0px rgba(139,92,246,0.3)',
                    '0 0 30px 5px rgba(139,92,246,0.5)',
                    '0 0 20px 0px rgba(139,92,246,0.3)',
                  ],
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                className="bg-gradient-to-br from-indigo-600/50 to-purple-700/50 backdrop-blur-sm p-4 rounded-xl border border-indigo-500/30 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <Rocket className="w-6 h-6 text-indigo-300" />
                  <div className="text-lg text-indigo-200">Points</div>
                </div>
                <motion.span
                  animate={{
                    textShadow: '0 0 8px rgba(139,92,246,0.8)',
                  }}
                  className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300"
                >
                  {pointsPercentage.toFixed(0)}
                </motion.span>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-purple-900/80 py-3 px-4 text-center"
          >
            <motion.p
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-2xl font-medium text-purple-100"
            >
              <span className="font-bold text-yellow-300">Master</span> Clan
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // Desktop version
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-3xl min-h-[80vh] flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background with gradient */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 z-0" /> */}

      {/* Animated sparkles in background */}
      {sparklePositions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white z-10"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            width: `${pos.size}px`,
            height: `${pos.size}px`,
            opacity: 0.4,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: pos.delay,
          }}
        />
      ))}

      {/* Hall of Fame Header */}
      {/* <div className="absolute top-8 left-0 right-0 text-center z-20">
        <motion.h1
          className="text-5xl font-bold mb-2"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400">
            Hall of Fame
          </span>
        </motion.h1>
        <motion.p
          className="text-gray-300 text-lg"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Celebrating our community's brightest stars
        </motion.p>
      </div> */}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-20 w-full max-w-5xl mx-auto px-8"
      >
        {/* Champion Banner */}
        {/* <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-6xl font-extrabold mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-fuchsia-400 to-amber-300">
              Current Champion
            </span>
          </h2>
          <p className="text-gray-300 text-xl">The undisputed leader of this season</p>
        </motion.div> */}

        {/* Main Card Content */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="relative rounded-2xl overflow-hidden backdrop-blur-sm bg-gradient-to-br from-purple-900/60 via-indigo-900/60 to-purple-900/60 border border-purple-500/30 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
        >
          {/* Crown decoration */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="absolute -top-30 left-1/2 transform -translate-x-1/2"
          >
            <Crown className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]" />
          </motion.div>

          <div className="p-10 flex flex-col md:flex-row items-center gap-10">
            {/* Rank Trophy */}
            <motion.div
              whileHover={{ rotate: [0, -5, 5, -5, 5, 0], scale: 1.1 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    boxShadow: isHovered
                      ? [
                          '0 0 20px 5px rgba(250,204,21,0.3)',
                          '0 0 30px 10px rgba(250,204,21,0.5)',
                          '0 0 20px 5px rgba(250,204,21,0.3)',
                        ]
                      : '0 0 20px 5px rgba(250,204,21,0.3)',
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center"
                >
                  <Trophy className="w-16 h-16 text-yellow-900" />
                </motion.div>
                <motion.div
                  animate={{
                    rotate: 360,
                    opacity: isHovered ? [0.5, 0.8, 0.5] : 0.5,
                  }}
                  transition={{
                    rotate: {
                      duration: 20,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'linear',
                    },
                    opacity: { duration: 2, repeat: Number.POSITIVE_INFINITY },
                  }}
                  className="absolute inset-0 rounded-full border-4 border-dashed border-yellow-400/50"
                />
              </div>
              <motion.span
                animate={{ scale: isHovered ? [1, 1.1, 1] : 1 }}
                transition={{
                  duration: 1,
                  repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
                }}
                className="text-6xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-amber-500"
              >
                #1
              </motion.span>
            </motion.div>

            {/* Clan Logo */}
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px 0px rgba(139,92,246,0.3)',
                    '0 0 30px 5px rgba(139,92,246,0.5)',
                    '0 0 20px 0px rgba(139,92,246,0.3)',
                  ],
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                className="w-48 h-48 rounded-2xl overflow-hidden"
              >
                {clan.logo_url ? (
                  <img
                    src={clan.logo_url || '/placeholder.svg'}
                    alt={clan.clan_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
                    <span className="text-7xl font-bold text-white">
                      {clan.clan_name.charAt(0)}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Animated stars around logo */}
              <AnimatePresence>
                {isHovered && (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="absolute"
                        style={{
                          top: `${
                            Math.sin(i * ((Math.PI * 2) / 5)) * 100 + 50
                          }%`,
                          left: `${
                            Math.cos(i * ((Math.PI * 2) / 5)) * 100 + 50
                          }%`,
                        }}
                      >
                        <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                      </motion.div>
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Clan Info */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <Link
                  to={`/clans/${clan.id}`}
                  className="inline-block text-5xl font-extrabold hover:underline bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300"
                >
                  {clan.clan_name}
                </Link>

                <div className="flex items-center gap-4 mt-3 justify-center md:justify-start">
                  <div className="flex items-center gap-2 bg-purple-900/50 px-4 py-2 rounded-full">
                    <Sparkles className="w-5 h-5 text-purple-300" />
                    <span className="text-xl text-purple-200">
                      {clan.members.length} members
                    </span>
                  </div>
                </div>

                {/* {clan.description && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="mt-4 text-gray-300 max-w-md"
                  >
                    {clan.description}
                  </motion.p>
                )} */}
              </motion.div>
            </div>

            {/* Total Points */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              whileHover={{ scale: 1.1 }}
              className="relative"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px 0px rgba(139,92,246,0.3)',
                    '0 0 30px 5px rgba(139,92,246,0.5)',
                    '0 0 20px 0px rgba(139,92,246,0.3)',
                  ],
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                className="bg-gradient-to-br from-indigo-600/50 to-purple-700/50 backdrop-blur-sm p-6 rounded-2xl border border-indigo-500/30"
              >
                <div className="flex flex-col items-center">
                  <Rocket className="w-8 h-8 text-indigo-300 mb-2" />
                  <motion.span
                    animate={{
                      scale: isHovered ? [1, 1.1, 1] : 1,
                      textShadow: isHovered
                        ? '0 0 8px rgba(139,92,246,0.8)'
                        : 'none',
                    }}
                    transition={{
                      duration: 1,
                      repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
                    }}
                    className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300"
                  >
                    {pointsPercentage.toFixed(0)}
                  </motion.span>
                  <div className="text-xl text-indigo-200 mt-1">Points</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Challenge Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-purple-900/80 py-4 px-6 text-center"
          >
            <motion.p
              animate={{
                scale: isHovered ? [1, 1.02, 1] : 1,
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-xl font-medium text-purple-100"
            >
              <span className="font-bold text-yellow-300">Master</span> Clan
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ClanTopOneCard;
