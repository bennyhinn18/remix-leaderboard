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

