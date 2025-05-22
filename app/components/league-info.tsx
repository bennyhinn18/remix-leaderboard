// Add to imports
import { motion } from 'framer-motion';
import {
  Info,
  Award,
  Medal,
  Trophy,
  Droplets,
  Flame,
  Leaf,
  Sparkles,
  CircleDot,
  Boxes,
  GemIcon,
  Github,
  Code,
  MessageCircle,
  Book,
  Feather,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';

// Add this component after the tabs section
const LeagueInfoButton = ({
  currentUser,
}: {
  currentUser?: { tier: string; bash_points: number };
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed right-6 bottom-28 z-50 p-3 bg-white/10 backdrop-blur-lg text-white rounded-full shadow-lg hover:bg-white/20"
        >
          <Info className="w-5 h-5" />
        </motion.button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Basher Leagues & Points System
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Understand how the tier system works and what each badge represents
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <p className="text-gray-300">
            The Basher Leaderboard ranks members based on their accumulated
            points across different activities. As you earn points, you&apos;ll
            progress through different tiers, each with its own badge.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                tier: 'bronze',
                points: '0-249',
                icon: <Award className="w-5 h-5" />,
                class:
                  'bg-gradient-to-r from-orange-300 to-orange-500 text-orange-900',
              },
              {
                tier: 'silver',
                points: '250-449',
                icon: <Medal className="w-5 h-5" />,
              },
              {
                tier: 'gold',
                points: '450-699',
                icon: <Trophy className="w-5 h-5" />,
              },
              {
                tier: 'sapphire',
                points: '700-999',
                icon: <Droplets className="w-5 h-5" />,
              },
              {
                tier: 'ruby',
                points: '1000-1349',
                icon: <Flame className="w-5 h-5" />,
              },
              {
                tier: 'emerald',
                points: '1350-1749',
                icon: <Leaf className="w-5 h-5" />,
              },
              {
                tier: 'amethyst',
                points: '1750-2199',
                icon: <Sparkles className="w-5 h-5" />,
              },
              {
                tier: 'pearl',
                points: '2200-2599',
                icon: <CircleDot className="w-5 h-5" />,
              },
              {
                tier: 'obsidian',
                points: '2600-2999',
                icon: <Boxes className="w-5 h-5" />,
              },
              {
                tier: 'diamond',
                points: '3000+',
                icon: <GemIcon className="w-5 h-5" />,
              },
            ].map((item) => (
              <div
                key={item.tier}
                className={`flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10`}
              >
                <div
                  className={`p-3 rounded-full bg-${
                    item.tier === 'bronze' ? 'yellow-700' : item.tier
                  }-500/20`}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-medium capitalize">{item.tier}</h3>
                  <p className="text-sm text-gray-400">{item.points} points</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/20">
            <h3 className="text-lg font-medium mb-2 text-blue-400">
              How to Earn Points
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" /> Participating in
                weekly bashs
              </li>
              <li className="flex items-center gap-2">
                <Github className="w-4 h-4 text-gray-400" /> Contributing to
                projects
              </li>
              <li className="flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" /> Solving coding
                challenges
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-purple-400" /> Active
                participation in Discord
              </li>
              <li className="flex items-center gap-2">
                <Book className="w-4 h-4 text-green-400" /> Reading technical
                books
              </li>
              <li className="flex items-center gap-2">
                <Feather className="w-4 h-4 text-orange-400" /> Duolingo streak
                maintainance
              </li>
            </ul>
          </div>

          <div className="text-center text-sm text-gray-400">
            <p>
              {currentUser ? (
                <>
                  You&apos;re currently in the{' '}
                  <span className="capitalize font-medium text-blue-400">
                    {currentUser.tier}
                  </span>{' '}
                  tier with {currentUser.bash_points} points.
                  {currentUser.tier !== 'diamond' && (
                    <>
                      {' '}
                      Need{' '}
                      {getTierThreshold(currentUser.tier) -
                        currentUser.bash_points}{' '}
                      more points for the next tier!
                    </>
                  )}
                </>
              ) : (
                'Sign in to track your progress and tier!'
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Add this helper function to get the next tier threshold
function getTierThreshold(tier: string): number {
  switch (tier) {
    case 'bronze':
      return 250;
    case 'silver':
      return 450;
    case 'gold':
      return 700;
    case 'sapphire':
      return 1000;
    case 'ruby':
      return 1350;
    case 'emerald':
      return 1750;
    case 'amethyst':
      return 2200;
    case 'pearl':
      return 2600;
    case 'obsidian':
      return 3000;
    default:
      return 3000;
  }
}

export default LeagueInfoButton;
