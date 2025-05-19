import { motion } from "framer-motion";
import { Gem, Award } from "lucide-react";
import { getTierIcon, getTierColorScheme, getTierThreshold } from "~/utils/tiers";

interface LeagueBadgesProps {
  currentUserTier: string;
  daysToNextLeague?: number;
  currentUser?: any;
}

export default function LeagueBadges({ currentUserTier, daysToNextLeague = 2, currentUser }: LeagueBadgesProps) {
  // All available tiers/leagues
  const tiers = [
    { name: 'bronze', color: 'from-amber-700 to-amber-500' },
    { name: 'silver', color: 'from-gray-400 to-gray-200' },
    { name: 'gold', color: 'from-yellow-500 to-yellow-300' },
    { name: 'sapphire', color: 'from-blue-700 to-blue-500' },
    { name: 'ruby', color: 'from-red-700 to-red-500' },
    { name: 'emerald', color: 'from-green-700 to-green-500' },
    { name: 'amethyst', color: 'from-purple-700 to-purple-500' },
    { name: 'pearl', color: 'from-gray-200 to-white' },
    { name: 'obsidian', color: 'from-gray-900 to-gray-700' },
    { name: 'diamond', color: 'from-blue-400 to-blue-200' }
  ];

  // Find current tier index
  const currentTierIndex = tiers.findIndex(t => t.name === currentUserTier);
  
  // Function to check if tier should be shown as active, locked, or current
  const getTierStatus = (tierIndex: number) => {
    if (tierIndex === currentTierIndex) return 'current';
    if (tierIndex < currentTierIndex) return 'active';
    if (tierIndex === currentTierIndex + 1) return 'next';
    return 'locked';
  };

  return (
    <div className="flex flex-col items-center w-full mb-4 md:mb-8">
      {/* League name and timer */}
      <div className="mb-4 md:mb-6 text-center">
        <h2 className="text-xl md:text-2xl font-bold capitalize mb-1 md:mb-2">
          {currentUserTier} League
        </h2>
        <div className="text-xs md:text-sm text-gray-300 max-w-xs md:max-w-xl mx-auto">
          {currentUser ? (
            <>
              <div>
                {/* <span className="capitalize font-medium text-blue-400">{currentUser.tier}</span> tier: {currentUser.bash_points} points */}
              </div>
              {currentUser.tier !== "diamond" && (
                <div className="mt-1">
                  Need <span className="font-semibold text-green-400">{getTierThreshold(currentUser.tier) - currentUser.bash_points}</span> more for next tier!
                </div>
              )}
            </>
          ) : (
            <>
              Top 5 advance to the next league
              <div className="font-bold mt-1">{daysToNextLeague} days</div>
            </>
          )}
        </div>
      </div>

      {/* League badges */}
      <div className="flex justify-start md:justify-center gap-2 w-full max-w-3xl overflow-x-auto px-2 md:px-4 py-2 no-scrollbar -mx-2 snap-x snap-mandatory">
        {tiers.map((tier, index) => {
          const status = getTierStatus(index);
          
          return (
            <motion.div
              key={tier.name}
              whileHover={status !== 'locked' ? { scale: 1.1 } : {}}
              className={`relative flex-shrink-0 snap-center ${status === 'locked' ? 'opacity-40' : ''}`}
            >
              <div 
                className={`w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-b ${tier.color} flex items-center justify-center
                  ${status === 'current' ? 'ring-4 ring-yellow-400' : ''}
                  ${status === 'next' ? 'ring-2 ring-blue-400' : ''}`}
              >
                {status === 'current' && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-xs text-black px-2 py-0.5 rounded-full font-bold">
                    YOU
                  </div>
                )}
                {status === 'locked' ? (
                  <div className="text-white/70">
                    <Award className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                ) : (
                  <div className="text-white">
                    {getTierIcon(tier.name)}
                  </div>
                )}
              </div>
              <div className={`text-[10px] md:text-xs text-center mt-1 capitalize ${status === 'locked' ? 'text-gray-500' : 'text-gray-200'}`}>
                {tier.name}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
