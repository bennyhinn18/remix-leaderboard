import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog"
import { Share2 } from 'lucide-react'
import { useState } from "react"

interface ShareCardProps {
  member: {
    name: string
    avatar_url?: string
    github_username: string
    points: number
    tier: string
    projects?: number
    certifications?: number
    internships?: number
    courses?: number
    hackathons?: number
    domains?: string[]
    languages?: Array<{
      name: string
      level: string
    }>
    gpa?: number
    attendance?: number
    streaks?: {
      github?: number
      leetcode?: number
      duolingo?: number
      discord?: number
      books?: number
    }
    hobbies?: string[]
    testimonial?: string
  }
}

export function ShareCard({ member }: ShareCardProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${member.github_username}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${member.name}'s ByteBash Profile`,
          text: `Check out ${member.name}'s ByteBash profile!`,
          url
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Error copying to clipboard:', err)
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Share2 className="w-5 h-5 text-gray-600" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl p-8 overflow-hidden">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-700">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url || "/placeholder.svg"}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl font-bold">{member.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{member.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-purple-500 bg-opacity-20 rounded-full text-purple-300 text-sm">
                  {member.tier} Basher
                </span>
                <span className="px-3 py-1 bg-yellow-500 bg-opacity-20 rounded-full text-yellow-300 text-sm">
                  {member.points} Points
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-300">{member.projects || 0}</div>
              <div className="text-sm text-gray-400">Projects</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-300">{member.certifications || 0}</div>
              <div className="text-sm text-gray-400">Certifications</div>
            </div>
          </div>

          {/* Streaks */}
          {member.streaks && (
            <div className="mb-8">
              <h3 className="text-sm text-gray-400 mb-3">Active Streaks</h3>
              <div className="grid grid-cols-3 gap-3">
                {member.streaks.github && (
                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <div className="text-xl font-bold text-purple-300">{member.streaks.github}</div>
                    <div className="text-xs text-gray-400">GitHub</div>
                  </div>
                )}
                {member.streaks.leetcode && (
                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <div className="text-xl font-bold text-orange-300">{member.streaks.leetcode}</div>
                    <div className="text-xs text-gray-400">LeetCode</div>
                  </div>
                )}
                {member.streaks.discord && (
                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <div className="text-xl font-bold text-indigo-300">{member.streaks.discord}</div>
                    <div className="text-xs text-gray-400">Discord</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {copied ? 'Copied!' : 'Share Profile'}
          </button>

          {/* Watermark */}
          <div className="absolute bottom-4 right-4 text-sm text-gray-500">
            ByteBash
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
