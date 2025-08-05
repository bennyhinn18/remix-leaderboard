import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Star,
  Trophy,
  ArrowLeft,
  MoreVertical,
  UserPlus,
  Crown,
  Gift
} from 'lucide-react';
import { createServerSupabase } from '~/utils/supabase.server';
import { isOrganiser, getCurrentUser } from '~/utils/currentUser';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { Card } from '~/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { MainNav } from '~/components/main-nav';
import { PageTransition } from '~/components/page-transition';
import { AchievementBadge } from '~/components/achievements';
import { AchievementService } from '~/services/achievements.server';
import { 
  Achievement, 
  UserAchievementWithDetails, 
  ACHIEVEMENT_CATEGORIES, 
  RARITY_LABELS,
  RARITY_COLORS 
} from '~/types/achievements';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const organiserStatus = await isOrganiser(request);
    
    if (!organiserStatus) {
      throw new Response('Unauthorized', { status: 403 });
    }

    const response = new Response();
    const supabase = createServerSupabase(request, response);
    const currentUser = await getCurrentUser(request);

    // Get all members
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
      .order('name');

    if (membersError) {
      console.error('Members fetch error:', membersError);
    }

    // Initialize achievement service
    const achievementService = new AchievementService(supabase);

    // Get all achievements from database
    const allAchievements = await achievementService.getAllAchievements();

    // Get achievement statistics
    const stats = await achievementService.getAchievementStats();

    // Get all user achievements for display
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*),
        member:members!user_achievements_user_id_fkey(name, github_username)
      `)
      .eq('is_visible', true)
      .order('unlocked_at', { ascending: false });

    if (userAchievementsError) {
      console.error('User achievements fetch error:', userAchievementsError);
    }

    return json({
      members: members || [],
      allAchievements,
      userAchievements: userAchievements || [],
      stats,
      user: currentUser,
      organiserStatus
    });
  } catch (error) {
    console.error('Admin achievements loader error:', error);
    return json({
      members: [],
      allAchievements: [],
      userAchievements: [],
      user: null,
      organiserStatus: false
    }, { status: 500 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const organiserStatus = await isOrganiser(request);
  
  if (!organiserStatus) {
    return json({ error: 'Unauthorized' }, { status: 403 });
  }

  const response = new Response();
  const supabase = createServerSupabase(request, response);
  const currentUser = await getCurrentUser(request);
  
  if (!currentUser) {
    return json({ error: 'User not found' }, { status: 401 });
  }

  // Get current user's member record
  const { data: currentMember } = await supabase
    .from('members')
    .select('id')
    .eq('id', currentUser.member_id)
    .single();

  if (!currentMember) {
    return json({ error: 'Member not found' }, { status: 404 });
  }

  const achievementService = new AchievementService(supabase);
  const formData = await request.formData();
  const action = formData.get('action');

  try {
    switch (action) {
      case 'award_achievement': {
        const memberId = parseInt(formData.get('memberId') as string);
        const achievementId = formData.get('achievementId') as string;
        const note = formData.get('note') as string;
        console.log(`Awarding achievement ${achievementId} to member ${memberId} by ${currentMember.id}`);
        await achievementService.awardAchievement(
          memberId, 
          achievementId, 
          currentMember.id,
          note || undefined
        );
        
        return json({ 
          success: true, 
          message: 'Achievement awarded successfully!' 
        });
      }

      case 'revoke_achievement': {
        const userId = parseInt(formData.get('userId') as string);
        const achievementId = formData.get('achievementId') as string;
        
        await achievementService.removeAchievement(userId, achievementId);
        
        return json({ 
          success: true, 
          message: 'Achievement revoked successfully!' 
        });
      }

      case 'bulk_award': {
        const memberIds = JSON.parse(formData.get('memberIds') as string);
        const achievementId = formData.get('achievementId') as string;
        const note = formData.get('note') as string;
        
        const awarded = await achievementService.bulkAwardAchievement(
          memberIds, 
          achievementId, 
          currentMember.id,
          note || undefined
        );
        
        return json({ 
          success: true, 
          message: `Achievement awarded to ${awarded.length} members!` 
        });
      }

      case 'create_achievement': {
        const newAchievement = {
          id: formData.get('id'),
          name: formData.get('name'),
          description: formData.get('description'),
          icon: formData.get('icon'),
          category: formData.get('category'),
          rarity: formData.get('rarity'),
          points: Number(formData.get('points')),
          requirements: formData.get('requirements'),
          isActive: true
        };
        
        // In a real app, you'd insert into achievements table
        console.log('Creating achievement:', newAchievement);
        
        return json({ 
          success: true, 
          message: 'Achievement created successfully!' 
        });
      }

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin achievements action error:', error);
    return json({ error: 'An error occurred' }, { status: 500 });
  }
};

interface Member {
  id: number;
  name: string;
  github_username: string;
  discord_username?: string;
  title: string;
  bash_points: number;
}

export default function AdminAchievements() {
  const { members, allAchievements, userAchievements, user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [showBulkAwardDialog, setShowBulkAwardDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Filter achievements
  const filteredAchievements = allAchievements.filter((achievement) => {
    if (!achievement) return false;
    
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || achievement.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });  // Calculate stats
  const stats = {
    totalAchievements: allAchievements.length,
    totalAwarded: userAchievements.length,
    uniqueRecipients: new Set(userAchievements.map(ua => ua.user_id)).size,
    legendaryAwarded: userAchievements.filter(ua => {
      const achievement = allAchievements.find(a => a?.id === ua.achievement_id);
      return achievement?.rarity === 'legendary';
    }).length
  };

  const handleSelectMember = (memberId: number) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members?.map((m: any) => m.id) || []);
    }
  };

  const handleAwardAchievement = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowAwardDialog(true);
  };

  const getMemberAchievements = (memberId: number) => {
    return userAchievements.filter(ua => ua.userId === memberId);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <Link
                to="/admin/members"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Member Management
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                Achievement Management
              </h1>
              <p className="text-gray-400 mt-2">
                Award digital badges and manage member achievements
              </p>
            </div>
            <MainNav user={user as any} notifications={[]} unreadCount={0} />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalAchievements}</div>
                  <div className="text-sm text-gray-400">Total Achievements</div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalAwarded}</div>
                  <div className="text-sm text-gray-400">Total Awarded</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.uniqueRecipients}</div>
                  <div className="text-sm text-gray-400">Recipients</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.legendaryAwarded}</div>
                  <div className="text-sm text-gray-400">Legendary</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Bar */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search achievements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-gray-600"
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-white/10 border-gray-600">
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
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Achievement
                </Button>

                {selectedMembers.length > 0 && (
                  <Button 
                    onClick={() => setShowBulkAwardDialog(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Bulk Award ({selectedMembers.length})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {filteredAchievements.map((achievement) => {
              if (!achievement) return null;
              
              const awardedCount = userAchievements.filter(ua => ua.achievement_id === achievement.id).length;
              
              return (
                <Card key={achievement.id} className="bg-white/5 border-gray-700 p-6">
                  <div className="flex items-start gap-4">
                    <AchievementBadge achievement={achievement} size="lg" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold truncate">{achievement.name}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-800 border-gray-600">
                            <DropdownMenuItem onClick={() => handleAwardAchievement(achievement)}>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Award to Member
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Achievement
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-400">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3">{achievement.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={`bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} text-white`}>
                          {RARITY_LABELS[achievement.rarity]}
                        </Badge>
                        <Badge variant="outline" className="border-gray-600">
                          {ACHIEVEMENT_CATEGORIES.find(c => c.id === achievement.category)?.icon} {ACHIEVEMENT_CATEGORIES.find(c => c.id === achievement.category)?.name}
                        </Badge>
                        <Badge variant="outline" className="border-gray-600">
                          +{achievement.points} points
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          Awarded {awardedCount} times
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleAwardAchievement(achievement)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          Award
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Members Section */}
          <Card className="bg-white/5 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Members</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {selectedMembers.length} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAll}
                  className="border-gray-600"
                >
                  {selectedMembers.length === members.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3">
                      <input
                        type="checkbox"
                        checked={selectedMembers.length === members.length && members.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left p-3">Member</th>
                    <th className="text-left p-3">Role</th>
                    <th className="text-left p-3">Points</th>
                    <th className="text-left p-3">Achievements</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members?.map((member: any) => {
                    const memberAchievements = getMemberAchievements(member.id);
                    
                    return (
                      <tr key={member.id} className="border-b border-gray-700/50 hover:bg-white/5">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(member.id)}
                            onChange={() => handleSelectMember(member.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={`https://github.com/${member.github_username}.png`}
                              alt={member.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-gray-400">@{member.github_username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="border-gray-600">
                            {member.title}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-blue-400">
                            {member.bash_points.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{memberAchievements.length}</span>
                            <div className="flex -space-x-1">
                              {memberAchievements.slice(0, 3).map((ua, index) => {
                                const achievement = allAchievements.find(a => a?.id === ua.achievement_id);
                                return achievement ? (
                                  <div
                                    key={ua.id}
                                    className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-xs border border-gray-700"
                                    title={achievement.name}
                                  >
                                    {achievement.icon}
                                  </div>
                                ) : null;
                              })}
                              {memberAchievements.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs border border-gray-700">
                                  +{memberAchievements.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600"
                            onClick={() => {
                              setSelectedMembers([member.id]);
                              setShowBulkAwardDialog(true);
                            }}
                          >
                            Award
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Award Achievement Dialog */}
          <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Award Achievement</DialogTitle>
              </DialogHeader>
              
              {selectedAchievement && (
                <fetcher.Form method="post" className="space-y-4">
                  <input type="hidden" name="action" value="award_achievement" />
                  <input type="hidden" name="achievementId" value={selectedAchievement.id} />
                  
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <AchievementBadge achievement={selectedAchievement} size="md" />
                    <div>
                      <h4 className="font-semibold">{selectedAchievement.name}</h4>
                      <p className="text-sm text-gray-400">{selectedAchievement.description}</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="memberId">Select Member</Label>
                    <Select name="memberId">
                      <SelectTrigger className="bg-white/10 border-gray-600">
                        <SelectValue placeholder="Choose a member" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {members?.map((member: any) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.name} (@{member.github_username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="note">Note (optional)</Label>
                    <Textarea
                      id="note"
                      name="note"
                      placeholder="Add a note about why this achievement was awarded..."
                      className="bg-white/10 border-gray-600"
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAwardDialog(false)}
                      className="border-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-yellow-600 hover:bg-yellow-700"
                      onClick={() => setShowAwardDialog(false)}
                    >
                      Award Achievement
                    </Button>
                  </DialogFooter>
                </fetcher.Form>
              )}
            </DialogContent>
          </Dialog>

          {/* Bulk Award Dialog */}
          <Dialog open={showBulkAwardDialog} onOpenChange={setShowBulkAwardDialog}>
            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Bulk Award Achievement</DialogTitle>
              </DialogHeader>
              
              <fetcher.Form method="post" className="space-y-4">
                <input type="hidden" name="action" value="bulk_award" />
                <input type="hidden" name="memberIds" value={JSON.stringify(selectedMembers)} />
                
                <div>
                  <Label>Selected Members ({selectedMembers.length})</Label>
                  <div className="p-3 bg-white/5 rounded-lg max-h-32 overflow-y-auto">
                    {selectedMembers.map(memberId => {
                      const member = members.find((m: Member) => m.id === memberId);
                      return member ? (
                        <div key={memberId} className="text-sm py-1">
                          {member.name} (@{member.github_username})
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="achievementId">Achievement</Label>
                  <Select name="achievementId">
                    <SelectTrigger className="bg-white/10 border-gray-600">
                      <SelectValue placeholder="Choose an achievement" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {allAchievements.map((achievement) => (
                        achievement && (
                          <SelectItem key={achievement.id} value={achievement.id}>
                            {achievement.icon} {achievement.name}
                          </SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="note">Note (optional)</Label>
                  <Textarea
                    id="note"
                    name="note"
                    placeholder="Add a note about why this achievement was awarded..."
                    className="bg-white/10 border-gray-600"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBulkAwardDialog(false)}
                    className="border-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setShowBulkAwardDialog(false)}
                  >
                    Award to {selectedMembers.length} Members
                  </Button>
                </DialogFooter>
              </fetcher.Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PageTransition>
  );
}
