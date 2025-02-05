export interface Member {
  id: number
  created_at: string
  name: string
  points: number
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

