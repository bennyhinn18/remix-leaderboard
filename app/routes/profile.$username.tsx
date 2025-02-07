import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"
import { ArrowLeft, Github, Code, Book, Globe2, MessageSquare, Trophy, Award, Briefcase } from 'lucide-react'
import { supabase } from "~/utils/supabase.server"
import { ProfileInfo } from "~/components/profile-info"
import type { BasherProfile } from "~/types/profile"

export async function loader({ params }: LoaderFunctionArgs) {
  const { username } = params
  
  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('github_username', username)
    .single()

  if (!member) {
    throw new Response("Not Found", { status: 404 })
  }

  // Fetch GitHub data
  const githubResponse = await fetch(`https://api.github.com/users/${username}/events/public`)
  const githubEvents = await githubResponse.json()
  
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const contributions = githubEvents.filter((event: any) => {
    const eventDate = new Date(event.created_at)
    return eventDate > thirtyDaysAgo && 
      (event.type === 'PushEvent' || 
       event.type === 'CreateEvent' || 
       event.type === 'PullRequestEvent')
  })

  const profile: BasherProfile = {
    ...member,
    title: "Captain Bash",
    joinedDate: new Date(member.created_at),
    basherLevel: member.points >= 2500 ? "Diamond" : member.points >= 2400 ? "Platinum" : "Gold",
    bashPoints: member.points,
    clanName: "Terminal Tigers",
    basherNo: "BBT2023045",
    projects: 12,
    certifications: 5,
    internships: 2,
    courses: 15,
    domains: ['Full Stack Development', 'DevOps & Cloud Computing'],
    languages: [
      { name: 'TypeScript', level: 'Expert' },
      { name: 'Python', level: 'Advanced' },
      { name: 'Rust', level: 'Intermediate' },
      { name: 'Go', level: 'Beginner' }
    ],
    streaks: {
      github: contributions.length,
      leetcode: 15,
      duolingo: 45,
      discord: 60,
      books: 12
    },
    hobbies: ['Photography', 'Chess', 'Guitar', 'Hiking'],
    testimonial: "Being part of this community has transformed my approach to learning and collaboration. The weekly bashes have been instrumental in my growth as a developer.",
    gpa: 3.8,
    attendance: 92
  }

  return json({ profile })
}

export default function Profile() {
  const { profile } = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            to="/leaderboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Leaderboard
          </Link>
        </div>

        {/* Profile Info Section */}
        <ProfileInfo profile={profile} />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
            <Trophy className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-blue-400">{profile.projects}</div>
            <div className="text-sm text-gray-400">Projects</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
            <Award className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-green-400">{profile.certifications}</div>
            <div className="text-sm text-gray-400">Certifications</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
            <Briefcase className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-purple-400">{profile.internships}</div>
            <div className="text-sm text-gray-400">Internships</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
            <Book className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-orange-400">{profile.courses}</div>
            <div className="text-sm text-gray-400">Courses</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="space-y-6">
            {/* Domains */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe2 className="w-5 h-5" />
                Domains
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.domains.map((domain) => (
                  <div 
                    key={domain} 
                    className="bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg text-sm"
                  >
                    {domain}
                  </div>
                ))}
              </div>
            </div>

            {/* Programming Languages */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Programming Languages
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {profile.languages.map((lang) => (
                  <div key={lang.name} className="bg-white/5 rounded-lg p-3">
                    <div className="font-medium">{lang.name}</div>
                    <div className={`text-sm ${
                      lang.level === 'Expert' ? 'text-green-400' :
                      lang.level === 'Advanced' ? 'text-blue-400' :
                      lang.level === 'Intermediate' ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      {lang.level}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Performance */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Academic Performance</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">GPA</span>
                    <span className="text-blue-400">{profile.gpa}/4.0</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                      style={{ width: `${(profile.gpa / 4) * 100}%` }} 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Weekly Bash Attendance</span>
                    <span className="text-green-400">{profile.attendance}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-500" 
                      style={{ width: `${profile.attendance}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Active Streaks */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Active Streaks</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-500/20 rounded-lg p-4">
                  <Github className="w-5 h-5 text-purple-400 mb-2" />
                  <div className="text-2xl font-bold text-purple-400">
                    {profile.streaks.github}
                  </div>
                  <div className="text-sm text-purple-400">days on GitHub</div>
                </div>
                <div className="bg-orange-500/20 rounded-lg p-4">
                  <Code className="w-5 h-5 text-orange-400 mb-2" />
                  <div className="text-2xl font-bold text-orange-400">
                    {profile.streaks.leetcode}
                  </div>
                  <div className="text-sm text-orange-400">days on LeetCode</div>
                </div>
                <div className="bg-green-500/20 rounded-lg p-4">
                  <Globe2 className="w-5 h-5 text-green-400 mb-2" />
                  <div className="text-2xl font-bold text-green-400">
                    {profile.streaks.duolingo}
                  </div>
                  <div className="text-sm text-green-400">days on Duolingo</div>
                </div>
                <div className="bg-indigo-500/20 rounded-lg p-4">
                  <MessageSquare className="w-5 h-5 text-indigo-400 mb-2" />
                  <div className="text-2xl font-bold text-indigo-400">
                    {profile.streaks.discord}
                  </div>
                  <div className="text-sm text-indigo-400">days on Discord</div>
                </div>
              </div>
            </div>

            {/* Hobbies & Interests */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Hobbies & Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.hobbies.map((hobby) => (
                  <span 
                    key={hobby} 
                    className="bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full text-sm"
                  >
                    {hobby}
                  </span>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <div className="text-gray-300 italic relative">
                <span className="text-4xl text-gray-500 absolute -top-4 -left-2">"</span>
                {profile.testimonial}
                <span className="text-4xl text-gray-500 absolute -bottom-8 -right-2">"</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
