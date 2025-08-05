export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'coding' | 'community' | 'special' | 'milestone' | 'event';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements?: string;
  unlock_condition?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: string;
  unlocked_at: string;
  awarded_by?: number; // Admin who awarded it
  note?: string; // Admin note
  is_visible: boolean;
}

// Type for joined user achievements with achievement details
export interface UserAchievementWithDetails extends UserAchievement {
  achievement: Achievement;
}

export interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  {
    id: 'coding',
    name: 'Coding Excellence',
    description: 'Achievements for programming skills and contributions',
    icon: '💻',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'community',
    name: 'Community Spirit',
    description: 'Achievements for community involvement and helping others',
    icon: '🤝',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'special',
    name: 'Special Recognition',
    description: 'Unique achievements for exceptional contributions',
    icon: '⭐',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'milestone',
    name: 'Milestones',
    description: 'Achievements for reaching important milestones',
    icon: '🏆',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'event',
    name: 'Event Participation',
    description: 'Achievements for participating in events and activities',
    icon: '🎉',
    color: 'from-red-500 to-rose-500'
  }
];

export const RARITY_COLORS = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-500',
  epic: 'from-purple-400 to-purple-500',
  legendary: 'from-yellow-400 to-orange-500'
};

export const RARITY_LABELS = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary'
};

// Default achievements that can be awarded
export const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'created_at' | 'updated_at'>[] = [
  {
    id: 'first_contribution',
    name: 'First Steps',
    description: 'Made your first contribution to the community',
    icon: '🎯',
    category: 'milestone',
    rarity: 'common',
    points: 10,
    requirements: 'Make your first contribution',
    is_active: true
  },
  {
    id: 'code_reviewer',
    name: 'Code Reviewer',
    description: 'Provided valuable code review feedback',
    icon: '👀',
    category: 'coding',
    rarity: 'rare',
    points: 25,
    requirements: 'Complete 5 code reviews',
    is_active: true
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Helped guide other community members',
    icon: '🧑‍🏫',
    category: 'community',
    rarity: 'epic',
    points: 50,
    requirements: 'Mentor new members',
    is_active: true
  },
  {
    id: 'hackathon_winner',
    name: 'Hackathon Champion',
    description: 'Won a community hackathon',
    icon: '🏆',
    category: 'event',
    rarity: 'legendary',
    points: 100,
    requirements: 'Win a hackathon',
    is_active: true
  },
  {
    id: 'bug_hunter',
    name: 'Bug Hunter',
    description: 'Found and reported critical bugs',
    icon: '🐛',
    category: 'coding',
    rarity: 'rare',
    points: 30,
    requirements: 'Report 3 critical bugs',
    is_active: true
  },
  {
    id: 'community_leader',
    name: 'Community Leader',
    description: 'Demonstrated exceptional leadership in the community',
    icon: '👑',
    category: 'special',
    rarity: 'legendary',
    points: 150,
    requirements: 'Exceptional leadership contribution',
    is_active: true
  },
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'One of the first members to join the community',
    icon: '🚀',
    category: 'special',
    rarity: 'epic',
    points: 75,
    requirements: 'Join within first 100 members',
    is_active: true
  },
  {
    id: 'points_milestone_100',
    name: 'Century Club',
    description: 'Earned 100 bash points',
    icon: '💯',
    category: 'milestone',
    rarity: 'common',
    points: 20,
    requirements: 'Earn 100 bash points',
    is_active: true
  },
  {
    id: 'points_milestone_500',
    name: 'Elite Basher',
    description: 'Earned 500 bash points',
    icon: '⚡',
    category: 'milestone',
    rarity: 'rare',
    points: 40,
    requirements: 'Earn 500 bash points',
    is_active: true
  },
  {
    id: 'points_milestone_1000',
    name: 'Legendary Basher',
    description: 'Earned 1000 bash points',
    icon: '🌟',
    category: 'milestone',
    rarity: 'legendary',
    points: 100,
    requirements: 'Earn 1000 bash points',
    is_active: true
  }
];
