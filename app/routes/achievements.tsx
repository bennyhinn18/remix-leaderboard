import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  ArrowLeft,
  Filter,
  Search,
  Award,
  Star,
  Lock,
  Calendar
} from 'lucide-react';
import { createSupabaseServerClient} from '~/utils/supabase.server';
import { getCurrentUser } from '~/utils/currentUser';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { MainNav } from '~/components/main-nav';
import { PageTransition } from '~/components/page-transition';
import { AchievementBadge } from '~/components/achievements';
import { AchievementService } from '~/services/achievements.server';
import { 
  Achievement, 
  UserAchievementWithDetails, 
  ACHIEVEMENT_CATEGORIES, 
  RARITY_LABELS
} from '~/types/achievements';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const response = new Response();
    const supabase = createSupabaseServerClient(request);
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      throw new Response('Unauthorized', { status: 401 });
    }

    // Get user's member record
    const { data: member } = await supabase.client
      .from('members')
      .select('*')
      .eq('id', currentUser?.member_id)
      .single();

    if (!member) {
      throw new Response('Member not found', { status: 404 });
    }

    // Initialize achievement service
    const achievementService = new AchievementService(supabase.client);

    // Get all achievements from database
    const allAchievements = await achievementService.getAllAchievements();

    // Get user's achievements from database
    const userAchievements = await achievementService.getUserAchievements(member.id);

    // Check and auto-award milestone achievements
    await achievementService.checkAndAwardMilestoneAchievements(member.id);

    return json({
      member,
      allAchievements,
      userAchievements,
      user: member
    });
  } catch (error) {
    console.error('Achievements loader error:', error);
    throw new Response('Internal Server Error', { status: 500 });
  }
};

export default function AchievementsPage() {
  const { member, allAchievements, userAchievements, user } = useLoaderData<typeof loader>();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const unlockedAchievementIds = userAchievements.map(ua => ua.achievement_id);
  
  const filteredAchievements = allAchievements.filter((achievement) => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || achievement.category === categoryFilter;
    const matchesRarity = rarityFilter === 'all' || achievement.rarity === rarityFilter;
    
    const isUnlocked = unlockedAchievementIds.includes(achievement.id);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'unlocked' && isUnlocked) ||
                         (statusFilter === 'locked' && !isUnlocked);

    return matchesSearch && matchesCategory && matchesRarity && matchesStatus;
  });

  const stats = {
    total: allAchievements.length,
    unlocked: userAchievements.length,
    locked: allAchievements.length - userAchievements.length,
    legendary: userAchievements.filter(ua => ua.achievement.rarity === 'legendary').length,
    totalPoints: userAchievements.reduce((sum, ua) => sum + ua.achievement.points, 0)
  };

  const completionRate = stats.total > 0 ? (stats.unlocked / stats.total) * 100 : 0;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white pb-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <Link
                to={`/profile/${member.github_username}`}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Profile
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                Achievements
              </h1>
              <p className="text-gray-400 mt-2">
                Your collection of digital badges and accomplishments
              </p>
            </div>
            <MainNav user={user as any} notifications={[]} unreadCount={0} />
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold">{stats.unlocked}</div>
                  <div className="text-xs text-gray-400">Unlocked</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold">{stats.locked}</div>
                  <div className="text-xs text-gray-400">Locked</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold">{stats.legendary}</div>
                  <div className="text-xs text-gray-400">Legendary</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold">{Math.round(completionRate)}%</div>
                  <div className="text-xs text-gray-400">Complete</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold">{stats.totalPoints}</div>
                  <div className="text-xs text-gray-400">Points</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card className="bg-white/5 border-gray-700 p-6 mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Overall Progress</h3>
              <span className="text-sm font-medium">{stats.unlocked} / {stats.total}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
              <motion.div 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </div>
            <p className="text-sm text-gray-400">
              {completionRate === 100 
                ? 'Congratulations! You\'ve unlocked all achievements!' 
                : `${stats.locked} achievements remaining`
              }
            </p>
          </Card>

          {/* Recent Unlocks */}
          {userAchievements.length > 0 && (
            <Card className="bg-white/5 border-gray-700 p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Unlocks
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {userAchievements
                  .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
                  .slice(0, 8)
                  .map((userAchievement) => (
                    <AchievementBadge
                      key={userAchievement.id}
                      achievement={userAchievement.achievement}
                      unlockedAt={userAchievement.unlocked_at}
                      size="md"
                    />
                  ))}
              </div>
            </Card>
          )}

          {/* Filters */}
          <Card className="bg-white/5 border-gray-700 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search achievements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-gray-600"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-48 bg-white/10 border-gray-600">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Categories</SelectItem>
                  {ACHIEVEMENT_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={rarityFilter} onValueChange={setRarityFilter}>
                <SelectTrigger className="w-full lg:w-48 bg-white/10 border-gray-600">
                  <SelectValue placeholder="All Rarities" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Rarities</SelectItem>
                  {Object.entries(RARITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48 bg-white/10 border-gray-600">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unlocked">Unlocked</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Achievements Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
            {filteredAchievements.map((achievement) => {
              const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
              const isUnlocked = !!userAchievement;

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <AchievementBadge
                    achievement={achievement}
                    unlockedAt={userAchievement?.unlocked_at}
                    locked={!isUnlocked}
                    size="lg"
                  />
                  
                  <div className="mt-3 text-center">
                    <h4 className={`text-sm font-medium ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                      {achievement.name}
                    </h4>
                    <Badge 
                      className="text-xs mt-1"
                      variant={isUnlocked ? 'default' : 'secondary'}
                    >
                      {RARITY_LABELS[achievement.rarity]}
                    </Badge>
                    {isUnlocked && userAchievement && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(userAchievement.unlocked_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredAchievements.length === 0 && (
            <Card className="bg-white/5 border-gray-700 p-12">
              <div className="text-center">
                <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No achievements found</h3>
                <p className="text-gray-500">Try adjusting your filters to see more results</p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setRarityFilter('all');
                    setStatusFilter('all');
                  }}
                  variant="outline"
                  className="mt-4 border-gray-600"
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
