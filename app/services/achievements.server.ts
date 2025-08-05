import { SupabaseClient } from '@supabase/supabase-js';
import { Achievement, UserAchievement, UserAchievementWithDetails } from '~/types/achievements';

export class AchievementService {
  constructor(private supabase: SupabaseClient) {}

  // Get all active achievements
  async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await this.supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('points', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Get user's achievements with achievement details
  async getUserAchievements(userId: number): Promise<UserAchievementWithDetails[]> {
    const { data, error } = await this.supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .eq('is_visible', true)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get user's achievements for a specific category
  async getUserAchievementsByCategory(userId: number, category: string): Promise<UserAchievementWithDetails[]> {
    const { data, error } = await this.supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements!inner(*)
      `)
      .eq('user_id', userId)
      .eq('is_visible', true)
      .eq('achievement.category', category)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Award achievement to user
  async awardAchievement(
    userId: number, 
    achievementId: string, 
    awardedBy: number,
    note?: string
  ): Promise<UserAchievement> {
    // Check if user already has this achievement
    const { data: existing } = await this.supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    if (existing) {
      throw new Error('User already has this achievement');
    }

    const { data, error } = await this.supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        awarded_by: awardedBy,
        note: note || null,
        unlocked_at: new Date().toISOString(),
        is_visible: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Bulk award achievement to multiple users
  async bulkAwardAchievement(
    userIds: number[], 
    achievementId: string, 
    awardedBy: number,
    note?: string
  ): Promise<UserAchievement[]> {
    // Get users who don't already have this achievement
    const { data: existingUsers } = await this.supabase
      .from('user_achievements')
      .select('user_id')
      .eq('achievement_id', achievementId)
      .in('user_id', userIds);

    const existingUserIds = existingUsers?.map(ua => ua.user_id) || [];
    const newUserIds = userIds.filter(id => !existingUserIds.includes(id));

    if (newUserIds.length === 0) {
      throw new Error('All selected users already have this achievement');
    }

    const achievements = newUserIds.map(userId => ({
      user_id: userId,
      achievement_id: achievementId,
      awarded_by: awardedBy,
      note: note || null,
      unlocked_at: new Date().toISOString(),
      is_visible: true
    }));

    const { data, error } = await this.supabase
      .from('user_achievements')
      .insert(achievements)
      .select();

    if (error) throw error;
    return data || [];
  }

  // Remove achievement from user
  async removeAchievement(userId: number, achievementId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_achievements')
      .delete()
      .eq('user_id', userId)
      .eq('achievement_id', achievementId);

    if (error) throw error;
  }

  // Hide achievement from user's profile
  async hideAchievement(userId: number, achievementId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_achievements')
      .update({ is_visible: false })
      .eq('user_id', userId)
      .eq('achievement_id', achievementId);

    if (error) throw error;
  }

  // Get achievement statistics
  async getAchievementStats(): Promise<{
    totalAchievements: number;
    totalUnlocks: number;
    popularAchievements: Array<{
      achievement: Achievement;
      unlock_count: number;
    }>;
    recentAwards: Array<{
      user_achievement: UserAchievement;
      achievement: Achievement;
      member_name: string;
    }>;
  }> {
    // Get total achievements count
    const { count: totalAchievements } = await this.supabase
      .from('achievements')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get total unlocks count
    const { count: totalUnlocks } = await this.supabase
      .from('user_achievements')
      .select('*', { count: 'exact', head: true })
      .eq('is_visible', true);

    // Get popular achievements
    const { data: popularData } = await this.supabase
      .from('user_achievements')
      .select(`
        achievement_id,
        achievement:achievements(*),
        count
      `)
      .eq('is_visible', true)
      .order('count', { ascending: false })
      .limit(5);

    // Get recent awards
    const { data: recentData } = await this.supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*),
        member:members!user_achievements_user_id_fkey(name)
      `)
      .eq('is_visible', true)
      .order('unlocked_at', { ascending: false })
      .limit(10);

    return {
      totalAchievements: totalAchievements || 0,
      totalUnlocks: totalUnlocks || 0,
      popularAchievements: popularData?.map(item => ({
        achievement: item.achievement,
        unlock_count: item.count
      })) || [],
      recentAwards: recentData?.map(item => ({
        user_achievement: item,
        achievement: item.achievement,
        member_name: item.member.name
      })) || []
    };
  }

  // Check if user has specific achievement
  async userHasAchievement(userId: number, achievementId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    return !!data;
  }

  // Auto-award achievements based on conditions
  async checkAndAwardMilestoneAchievements(userId: number): Promise<UserAchievement[]> {
    // Get member's current bash points
    const { data: member } = await this.supabase
      .from('members')
      .select('bash_points')
      .eq('id', userId)
      .single();

    if (!member) return [];

    const bashPoints = member.bash_points || 0;
    const awarded: UserAchievement[] = [];

    // Check milestone achievements
    const milestones = [
      { points: 100, achievementId: 'points_milestone_100' },
      { points: 500, achievementId: 'points_milestone_500' },
      { points: 1000, achievementId: 'points_milestone_1000' }
    ];

    for (const milestone of milestones) {
      if (bashPoints >= milestone.points) {
        const hasAchievement = await this.userHasAchievement(userId, milestone.achievementId);
        if (!hasAchievement) {
          try {
            const achievement = await this.awardAchievement(
              userId, 
              milestone.achievementId, 
              userId, // Auto-awarded, so user is the awarder
              'Automatically awarded for reaching milestone'
            );
            awarded.push(achievement);
          } catch (error) {
            // Achievement might already exist, continue
            console.log(`Achievement ${milestone.achievementId} already exists for user ${userId}`);
          }
        }
      }
    }

    return awarded;
  }
}
