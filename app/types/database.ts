export interface Member {
  tier(tier: any): import("clsx").ClassValue
  duolingo_streak: boolean
  discord_messages: boolean
  leetcode_streak: boolean
  github_streak: boolean
  github_username: ReactNode
  tier: any
  tier: any
  github_username: any
  discord_messages: number
  discord_messages: number
  duolingo_streak: number
  duolingo_streak: number
  [x: string]: number
  github_username: any
  duolingo_streak: number
  discord_messages: number
  tier(tier: any): import("clsx").ClassValue
  leetcode_streak: number
  github_streak: number
  github_streak: number
  id: number
  created_at: string
  name: string
  bash_points: number
  avatar_url?: string
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

