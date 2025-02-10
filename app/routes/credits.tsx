"use client"

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Crown, Star, Award, Users } from "lucide-react"
import { Card } from "~/components/ui/card"
import { supabase } from "~/utils/supabase.server"
import { useEffect, useState } from "react"
import type React from "react" // Added import for React
import { UpdateChampionsForm } from "~/components/update-champions-form"

interface Credit {
  id: number
  month_date: string
  best_basher: string
  best_leader: string
  best_clan: string
  best_profile: string
  basher_clan_name: string
  leader_clan_name: string
  month: string
}

interface Award {
  icon: string
  title: string
  name: string
  description: string
  gradient: string
  borderGradient: string
  lucideIcon: "crown" | "star" | "users" | "award" // Changed to string identifier
}

export const loader = async ({}: LoaderFunctionArgs) => {
  const { data: creditData, error } = await supabase
    .from("credits")
    .select("*")
    .order("month_date", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error("Error fetching credits:", error)
  }

  const [basherDetails, leaderDetails] = await Promise.all([
    supabase.from("members").select("avatar_url, points").eq("name", creditData?.best_basher).single(),
    supabase.from("members").select("avatar_url, points").eq("name", creditData?.best_leader).single(),
  ])

  const awards: Award[] = [
    {
      icon: "👑",
      title: "Best Basher",
      name: creditData?.best_basher || "",
      description: "Awarded to members who consistently demonstrate exceptional coding skills",
      gradient: "from-amber-500/20 to-yellow-500/20",
      borderGradient: "from-amber-500/30 to-yellow-500/30",
      lucideIcon: "crown",
    },
    {
      icon: "⭐",
      title: "Best Leader",
      name: creditData?.best_leader || "",
      description: "Recognizes outstanding leadership and mentorship within the community",
      gradient: "from-blue-500/20 to-purple-500/20",
      borderGradient: "from-blue-500/30 to-purple-500/30",
      lucideIcon: "star",
    },
    {
      icon: "🏆",
      title: "Best Clan",
      name: creditData?.best_clan || "",
      description: "Honors clans with exceptional teamwork and achievements",
      gradient: "from-green-500/20 to-emerald-500/20",
      borderGradient: "from-green-500/30 to-emerald-500/30",
      lucideIcon: "users",
    },
    {
      icon: "💫",
      title: "Best Profile",
      name: creditData?.best_profile || "",
      description: "Celebrates members with outstanding profile customization and activity",
      gradient: "from-pink-500/20 to-rose-500/20",
      borderGradient: "from-pink-500/30 to-rose-500/30",
      lucideIcon: "award",
    },
  ]

  return json({
    credits: creditData,
    basherDetails: basherDetails?.data,
    leaderDetails: leaderDetails?.data,
    awards,
  })
}

// Helper function to render Lucide icons
function getLucideIcon(iconName: Award["lucideIcon"]) {
  switch (iconName) {
    case "crown":
      return <Crown className="w-6 h-6" />
    case "star":
      return <Star className="w-6 h-6" />
    case "users":
      return <Users className="w-6 h-6" />
    case "award":
      return <Award className="w-6 h-6" />
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const data = {
    month_date: new Date().toISOString(),
    month: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
    best_basher: formData.get("best_basher"),
    best_leader: formData.get("best_leader"),
    best_clan: formData.get("best_clan"),
    best_profile: formData.get("best_profile"),
    basher_clan_name: formData.get("basher_clan_name"),
    leader_clan_name: formData.get("leader_clan_name"),
  }

  // Validate required fields
  const requiredFields = [
    "best_basher",
    "best_leader",
    "best_clan",
    "best_profile",
    "basher_clan_name",
    "leader_clan_name",
  ]

  for (const field of requiredFields) {
    if (!data[field as keyof typeof data]) {
      return json({ error: `${field.replace("_", " ")} is required` })
    }
  }

  try {
    const { error } = await supabase.from("credits").insert([data])

    if (error) throw error

    return json({ success: true })
  } catch (error) {
    console.error("Error updating champions:", error)
    return json({ error: "Failed to update champions" })
  }
}

function AchievementCard({
  title,
  name,
  clanName,
  icon,
  gradient,
  points,
  avatarUrl,
  delay = 0,
}: {
  title: string
  name: string
  clanName: string
  icon: React.ReactNode
  gradient: string
  points?: number
  avatarUrl?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="relative group"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}
      />
      <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-0">
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5`}
          initial={false}
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl || "/placeholder.svg"} alt={name} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  {icon}
                </div>
              )}
              <motion.div
                className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100"
                initial={false}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                style={{
                  background: `linear-gradient(45deg, ${gradient.split(" ")[1]} 0%, transparent 100%)`,
                  filter: "blur(8px)",
                  zIndex: -1,
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
              <p className="text-2xl font-bold mt-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {name}
              </p>
              <p className="text-gray-400">{clanName}</p>
              {points && <p className="text-sm mt-1 text-gray-400">{points.toLocaleString()} points</p>}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function ParticleBackground() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight * 0.4,
    })

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight * 0.4,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <motion.div
      className="absolute inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {dimensions.width > 0 &&
        [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
              opacity: Math.random() * 0.5 + 0.3,
            }}
            animate={{
              y: [null, Math.random() * -100],
              opacity: [null, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              delay: Math.random() * 2,
            }}
          />
        ))}
    </motion.div>
  )
}

export default function Credits() {
  const { credits, basherDetails, leaderDetails, awards } = useLoaderData<typeof loader>()
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])
  const [isMounted, setIsMounted] = useState(false)
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfVisibility = new Date(currentDate.getFullYear(), currentDate.getMonth(), 10);

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center space-y-2 p-6 pb-0"
          >
        <h1 className="text-3xl font-bold text-purple-400">Hall of Fame</h1>
        <p className="text-gray-400">Celebrating our community&apos;s brightest stars</p>
        <div className="flex justify-end">
          {currentDate >= startOfMonth && currentDate <= endOfVisibility && <UpdateChampionsForm />}
        </div>
        </motion.div> 

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-24">
        <section className="space-y-12">
        <motion.div
        style={{ opacity, scale }}
        className="relative h-[40vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900" />
        <div className="relative z-10 text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400"
          >
            {credits?.month} Champions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            <p className="text-gray-400">Recognizing this month&apos;s outstanding achievements</p>
          </motion.p>
        </div>

        {isMounted && <ParticleBackground />}
      </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            <AchievementCard
              title="Best Basher"
              name={credits?.best_basher || ""}
              clanName={credits?.basher_clan_name || ""}
              icon={<Crown className="w-8 h-8 text-amber-400" />}
              gradient="from-amber-500 to-orange-500"
              points={basherDetails?.points}
              avatarUrl={basherDetails?.avatar_url}
              delay={0.1}
            />
            <AchievementCard
              title="Best Leader"
              name={credits?.best_leader || ""}
              clanName={credits?.leader_clan_name || ""}
              icon={<Star className="w-8 h-8 text-blue-400" />}
              gradient="from-blue-500 to-purple-500"
              points={leaderDetails?.points}
              avatarUrl={leaderDetails?.avatar_url}
              delay={0.2}
            />
          </div>
        </section>

        <section className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-2"
          >
            <h2 className="text-3xl font-bold text-purple-400">Monthly Awards</h2>
            <p className="text-gray-400">Recognizing excellence in our community</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {awards.map((award, index) => (
              <motion.div
                key={award.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${award.borderGradient} opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity`}
                />
                <Card className={`relative overflow-hidden bg-gradient-to-br ${award.gradient} border-0 h-full`}>
                  <motion.div
                    className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                    animate={{ opacity: [0, 0.1, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  />
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl">{award.icon}</span>
                      {getLucideIcon(award.lucideIcon)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{award.title}</h3>
                      <p className="text-2xl font-bold mt-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {award.name}
                      </p>
                      <p className="text-sm text-gray-300 mt-2">{award.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

