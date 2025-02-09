export interface ClanMember {
    id: number
    name: string
    role: string
    status: string
    bash_crew: number
}

export interface ClanActivity {
    id: number
    date: string
    type: string
    title?: string
    description?: string
    achievements?: string[]
    participants?: number[]
    resources?: string[]
}

export interface Clan {
    id: number
    created_at: string
    clan_name: string
    quotes: string[]
    projects: number
    hackathons_won: number
    workshops: number
    avg_attendance: number
    members: ClanMember[]
    activities: ClanActivity[]
    description: string
    logo_url: string
    banner_url: string | null
    bash_clan_no: string
}
