"use client"

import { motion } from "framer-motion"
import { Card } from "~/components/ui/card"
import { Code2, Rocket, Sparkles, Star, Zap } from "lucide-react"
import { Skeleton } from "~/components/ui/skeleton"

interface WeekAnnouncementProps {
  leadingClan?: {
    name: string
    score: number
  }
  isLoading?: boolean
}

export function WeekAnnouncement({ leadingClan, isLoading }: WeekAnnouncementProps) {
  // Array of decorative icons that will float around
  const icons = [
    { Icon: Star, position: "top-10 left-10", delay: 0 },
    { Icon: Rocket, position: "top-20 right-20", delay: 0.2 },
    { Icon: Code2, position: "bottom-10 left-20", delay: 0.4 },
    { Icon: Sparkles, position: "bottom-20 right-10", delay: 0.6 },
    { Icon: Zap, position: "top-1/2 left-1/2", delay: 0.8 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-12"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 border-0">
        {/* Animated background effect */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 0% 0%, #4F46E5 0%, transparent 50%)",
              "radial-gradient(circle at 100% 100%, #4F46E5 0%, transparent 50%)",
              "radial-gradient(circle at 0% 100%, #4F46E5 0%, transparent 50%)",
              "radial-gradient(circle at 100% 0%, #4F46E5 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY }}
        />

        {/* Floating icons */}
        {icons.map(({ Icon, position, delay }, index) => (
          <motion.div
            key={index}
            className={`absolute ${position} text-white/20`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay,
              duration: 0.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
        ))}

        <div className="relative p-8 md:p-12">
          {/* Main announcement text */}
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-3/4 mx-auto bg-white/10" />
              <Skeleton className="h-8 w-1/4 mx-auto bg-white/10" />
            </div>
          ) : (
            <>
              <motion.h2
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.3,
                  type: "spring",
                  stiffness: 100,
                }}
                className="text-6xl md:text-8xl font-bold text-center text-white mb-4"
              >
                This Week is{" "}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text"
                >
                  {leadingClan?.name || "Loading..."}
                </motion.span>
              </motion.h2>

              {/* Score display */}
              {leadingClan && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center items-center gap-2"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.7,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="text-xl font-semibold text-blue-300"
                  >
                    Current Score:
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.8,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="text-2xl font-bold text-white"
                  >
                    {leadingClan.score.toLocaleString()}
                  </motion.div>
                </motion.div>
              )}

              {/* WB Week text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex justify-center items-center mt-4"
              >
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text"
                >
                  WB Week
                </motion.span>
              </motion.div>
            </>
          )}

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 rounded-full blur-2xl" />
        </div>
      </Card>
    </motion.div>
  )
}

