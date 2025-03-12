export interface Member {
  tier(tier: string): import("clsx").ClassValue
  duolingo_streak: number
  discord_messages: number
  leetcode_streak: number
  github_streak: number
  github_username: string
  id: number
  created_at: string
  name: string
  bash_points: number
  avatar_url?: string
  description?: string
}

export interface MemberWithStats {
  id: string
  name: string
  github_username: string
  avatar_url: string
  bash_points: number
  githubStreak?: number
  leetcodeStreak?: number
  bashClanPoints?: number 
  duolingoStreak?: number
  tier: "diamond" | "platinum" | "gold" | "silver" | "bronze"
  originalRank?: number
  // league?: string
}

export type MemberInput = Pick<Member, "name">
export type PointsUpdate = {
  memberId: number
  points: number
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string
          avatar_url: string
          created_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string
          avatar_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string
          avatar_url?: string
          created_at?: string
        }
      }
    }
  }
}
