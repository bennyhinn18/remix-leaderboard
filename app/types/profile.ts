export interface BasherProfile {
    id: number
    name: string
    title: string
    joinedDate: Date
    basherLevel: string
    bashPoints: number
    clanName: string
    basherNo: string
    portfolio_url?: string
    resume_url?: string
    avatar_url?: string
    github_username: string
    points: number
    projects: number
    certifications: number
    internships: number
    courses: number
    domains: string[]
    languages: Array<{
      name: string
      level: string
    }>
    streaks: {
      github: number
      leetcode: number
      duolingo: number
      discord: number
      books: number
    }
    hobbies: string[]
    testimonial: string
    gpa: number
    attendance: number
  }
  
  