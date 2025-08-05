import { motion } from 'framer-motion';
import { Trophy, Award, Star, Lock } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Link } from '@remix-run/react';
import { 
  Achievement, 
  UserAchievement, 
  ACHIEVEMENT_CATEGORIES, 
  RARITY_COLORS, 
  RARITY_LABELS 
} from '~/types/achievements';

interface ProfileAchievementsProps {
  userAchievements: (UserAchievement & { achievement: Achievement })[];
  totalAchievements: number;
  memberName: string;
  compact?: boolean;
}

export function ProfileAchievements({ 
  userAchievements, 
  totalAchievements, 
  memberName,
  compact = false 
}: ProfileAchievementsProps) {
  const unlockedCount = userAchievements.length;
  const completionRate = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;

  const recentAchievements = userAchievements
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, compact ? 3 : 6);

  const legendaryAchievements = userAchievements.filter(
    ua => ua.achievement.rarity === 'legendary'
  );

  if (compact) {
    return (
      <Card className="bg-white/5 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Achievements</h3>
              <p className="text-sm text-gray-400">
                {unlockedCount} of {totalAchievements} unlocked
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="border-gray-600">
            <Link to={`/achievements`}>
              View All
            </Link>
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm font-medium">{Math.round(completionRate)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {recentAchievements.map((userAchievement) => (
              <AchievementBadge
                key={userAchievement.id}
                achievement={userAchievement.achievement}
                unlockedAt={userAchievement.unlockedAt}
                size="sm"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No achievements yet</p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">{unlockedCount}</div>
              <div className="text-sm text-gray-400">Achievements</div>
            </div>
          </div>
        </Card>

        <Card className="bg-white/5 border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">{legendaryAchievements.length}</div>
              <div className="text-sm text-gray-400">Legendary</div>
            </div>
          </div>
        </Card>

        <Card className="bg-white/5 border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
              <div className="text-sm text-gray-400">Complete</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card className="bg-white/5 border-gray-700 p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Achievements</h3>
        {recentAchievements.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentAchievements.map((userAchievement) => (
              <AchievementBadge
                key={userAchievement.id}
                achievement={userAchievement.achievement}
                unlockedAt={userAchievement.unlockedAt}
                size="md"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Lock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500">No achievements unlocked yet</p>
            <p className="text-sm text-gray-600 mt-2">
              Start contributing to earn your first achievement!
            </p>
          </div>
        )}
      </Card>

      {/* Categories Overview */}
      <Card className="bg-white/5 border-gray-700 p-6">
        <h3 className="text-xl font-semibold mb-4">Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENT_CATEGORIES.map((category) => {
            const categoryAchievements = userAchievements.filter(
              ua => ua.achievement.category === category.id
            );
            
            return (
              <div
                key={category.id}
                className="p-4 bg-white/5 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-gray-400">
                      {categoryAchievements.length} unlocked
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{category.description}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

interface AchievementBadgeProps {
  achievement: Achievement;
  unlockedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  locked?: boolean;
}

export function AchievementBadge({ 
  achievement, 
  unlockedAt, 
  size = 'md',
  locked = false 
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-xs',
    md: 'w-20 h-20 text-sm',
    lg: 'w-24 h-24 text-base'
  };

  const iconSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const rarityGradient = locked 
    ? 'from-gray-600 to-gray-700' 
    : RARITY_COLORS[achievement.rarity];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative group cursor-pointer"
    >
      <div
        className={`
          ${sizeClasses[size]} 
          bg-gradient-to-br ${rarityGradient}
          rounded-xl flex flex-col items-center justify-center
          border-2 border-white/20 shadow-lg
          ${locked ? 'opacity-50' : ''}
        `}
      >
        {locked ? (
          <Lock className={`${iconSizes[size]} text-gray-300`} />
        ) : (
          <span className={iconSizes[size]}>{achievement.icon}</span>
        )}
        
        {!locked && (
          <Badge 
            className={`absolute -top-1 -right-1 text-xs px-1 py-0 bg-gradient-to-r ${rarityGradient} border-0`}
          >
            {RARITY_LABELS[achievement.rarity]}
          </Badge>
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl max-w-xs">
          <h4 className="font-semibold text-white">{achievement.name}</h4>
          <p className="text-sm text-gray-300 mt-1">{achievement.description}</p>
          {achievement.points && (
            <p className="text-xs text-yellow-400 mt-2">+{achievement.points} points</p>
          )}
          {unlockedAt && (
            <p className="text-xs text-gray-400 mt-1">
              Unlocked {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
          {locked && achievement.requirements && (
            <p className="text-xs text-gray-400 mt-1">
              Requirement: {achievement.requirements}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
