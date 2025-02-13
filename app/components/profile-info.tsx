"use client"

import { motion } from "framer-motion"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Briefcase, FileText, Star, Share2, Github } from 'lucide-react'
import type { BasherProfile } from "~/types/profile"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog"
import { useState } from "react"

interface ProfileInfoProps {
  profile: BasherProfile
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name}'s ByteBash Profile`,
          text: `Check out ${profile.name}'s ByteBash profile!`,
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
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start px-4 sm:px-8 py-6 sm:py-10 rounded-2xl bg-gradient-to-r from-[#4dc4f9]/5 via-purple-500/5 to-amber-500/5 dark:from-[#4dc4f9]/10 dark:via-purple-500/10 dark:to-amber-500/10"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 sm:justify-between">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-800"
          >
            {profile.avatar_url ? (
              <img
                src={`https://api.dicebear.com/9.x/dylan/svg?seed=${profile.name}` || profile.avatar_url}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-amber-500/20">
                <span className="text-3xl font-bold text-white">
                  {profile.name.charAt(0)}
                </span>
              </div>
            )}
          </motion.div>

          <div className="text-center sm:text-left w-full sm:w-auto">
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-2xl sm:text-4xl font-bold text-white mb-2"
            >
              {profile.name}
            </motion.h1>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4"
            >
              <Badge variant="secondary" className="bg-[#4dc4f9]/10 text-[#4dc4f9] hover:bg-[#4dc4f9]/20">
                {profile.title}
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">
                {profile.basherLevel} Basher
              </Badge>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col hidden sm:block sm:flex-row items-center gap-2 sm:gap-4"
            >
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <span className="text-amber-500 font-semibold">
                  {profile.bashPoints.toLocaleString()} Points
                </span>
              </div>
              <div className="text-gray-500">
                Joined {format(new Date(profile.joinedDate), "MMMM yyyy")}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-end gap-3"
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/10"
              >
                <Share2 className="w-5 h-5 text-gray-400" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <div className="w-[90vw] sm:max-w-md p-4 sm:p-8 relative bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl">
                {/* Share Card Content */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800">
                    {profile.avatar_url ? (
                      <img
                        src={`https://api.dicebear.com/9.x/dylan/svg?seed=${profile.name}` || profile.avatar_url}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl font-bold">{profile.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{profile.name}</h3>
                    <div className="text-sm text-gray-400">{profile.basherLevel} Basher</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-500">
                      {profile.bashPoints.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Points</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {profile.projects}
                    </div>
                    <div className="text-sm text-gray-400">Projects</div>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleShare}
                >
                  {copied ? 'Copied!' : 'Share Profile'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="text-right">
            <div className="text-sm text-emerald-500">
              {profile.clanName} · No. {profile.basherNo}
            </div>
          </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:hidden sm:flex-row items-end text-right gap-2 sm:gap-4"
            >
              <div className="flex text-amber-500 font-semibold gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              {profile.bashPoints.toLocaleString()} Points
              </div>
              <div className="text-gray-500">
              Joined {format(new Date(profile.joinedDate), "MMMM yyyy")}
              </div>
            </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap justify-center gap-2 sm:gap-4 w-full"
      >
        {profile.portfolio_url && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="bg-[#4dc4f9]/10 border-[#4dc4f9]/20 text-[#4dc4f9] hover:bg-[#4dc4f9]/20"
              onClick={() => window.open(profile.portfolio_url, "_blank")}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              View Portfolio
            </Button>
          </motion.div>
        )}
        {profile.resume_url && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="bg-[#4dc4f9]/10 border-[#4dc4f9]/20 text-[#4dc4f9] hover:bg-[#4dc4f9]/20"
              onClick={() => window.open(profile.resume_url, "_blank")}
            >
              <FileText className="w-4 h-4 mr-2" />
              View Resume
            </Button>
          </motion.div>
        )}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className="bg-[#4dc4f9]/10 border-[#4dc4f9]/20 text-[#4dc4f9] hover:bg-[#4dc4f9]/20"
            onClick={() => window.open(`https://github.com/${profile.github_username}`, "_blank")}
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub Profile
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
