"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "~/components/ui/button"
import { Github, Linkedin, Instagram, Share2, Check } from "lucide-react"
import { useState } from "react"
import type { BasherProfile } from "~/types/profile"

interface SocialFooterProps {
  socials: BasherProfile["socials"]
}

export function SocialFooter({ socials }: SocialFooterProps) {
  const [showShareSuccess, setShowShareSuccess] = useState(false)

  const socialIcons = {
    github: Github,
    linkedin: Linkedin,
    instagram: Instagram,
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Check out my BBT Profile",
        url: window.location.href,
      })
      setShowShareSuccess(true)
      setTimeout(() => setShowShareSuccess(false), 2000)
    } catch (error) {
      // Fallback to clipboard copy if Web Share API is not available
      await navigator.clipboard.writeText(window.location.href)
      setShowShareSuccess(true)
      setTimeout(() => setShowShareSuccess(false), 2000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 border-t border-[#4dc4f9]/10"
    >
      <div className="flex gap-2">
        {socials.map((social, index) => {
          const Icon = socialIcons[social.platform as keyof typeof socialIcons]
          return (
            <motion.div
              key={social.platform}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="text-[#4dc4f9] hover:bg-[#4dc4f9]/10"
                onClick={() => window.open(social.url, "_blank")}
              >
                <Icon className="w-5 h-5" />
              </Button>
            </motion.div>
          )
        })}
      </div>

      <div className="relative">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="icon" className="text-[#4dc4f9] hover:bg-[#4dc4f9]/10" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
        </motion.div>

        <AnimatePresence>
          {showShareSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-12 right-0 bg-[#4dc4f9] text-black px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Copied!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

