"use client"

import { json, redirect, type ActionFunctionArgs } from "@remix-run/node"
import { Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  UserPlus,
  Check,
  AlertCircle,
  Mail,
  Phone,
  Github,
  Instagram,
  Linkedin,
  Globe,
  BookOpen,
  MessageSquare,
  Calendar,
  Users,
  Award,
  Sparkles,
  Code,
  Rocket,
  Zap,
} from "lucide-react"
import { createServerSupabase } from "~/utils/supabase.server"
import { useState, useEffect } from "react"
import { isOrganiser } from '~/utils/currentUser';

export const loader = async ({ request }: { request: Request }) => {
  const response = new Response()
  const supabase = createServerSupabase(request, response)
  const organiserStatus = await isOrganiser(request);
    if (!organiserStatus) {
      return redirect('/not-authorised');
    }

  // Fetch domains from the domains table
  const { data: domains, error: domainsError } = await supabase.from("domains").select("id, name").order("name")

  // Fetch clans from the clans table
  const { data: clans, error: clansError } = await supabase.from("clans").select("id, clan_name").order("clan_name")

  if (domainsError) {
    console.error("Error fetching domains:", domainsError)
  }

  if (clansError) {
    console.error("Error fetching clans:", clansError)
  }

  return json({
    domains: domains || [],
    clans: clans || [],
  })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const response = new Response()
  const supabase = createServerSupabase(request, response)

  // Extract form data
  const name = formData.get("name")
  const roll_number = formData.get("roll_number")
  const personal_email = formData.get("personal_email")
  const academic_email = formData.get("academic_email")
  const mobile_number = formData.get("mobile_number")
  const whatsapp_number = formData.get("whatsapp_number")
  const discord_username = formData.get("discord_username")
  const github_username = formData.get("github_username")
  const instagram_username = formData.get("instagram_username")
  const portfolio_url = formData.get("portfolio_url")
  const linkedin_url = formData.get("linkedin_url")
  const title = formData.get("title")
  const clan_name = formData.get("clan_name")
  const basher_no = formData.get("basher_no")
  const joined_date = formData.get("joined_date")
  const duolingo_username = formData.get("duolingo_username")

  // Get primary and secondary domains (multiple values)
  const primary_domain = formData.getAll("primary_domain")
  const secondary_domain = formData.getAll("secondary_domain")

  // Get clan_id from clan_name
  let clan_id
  if (clan_name) {
    const { data: clanData } = await supabase.from("clans").select("id").eq("clan_name", clan_name).single()

    if (clanData) {
      clan_id = clanData.id
    }
  }

  // Validate required fields
  if (!name) {
    return json({ error: "Name is required" })
  }

  if (!roll_number) {
    return json({ error: "Roll number is required" })
  }

  // Check if roll number already exists
  const { data: existingMember } = await supabase
    .from("members")
    .select("id")
    .eq("roll_number", roll_number)
    .maybeSingle()

  if (existingMember) {
    return json({ error: "A member with this roll number already exists" })
  }

  // Insert new member
  const { error } = await supabase.from("members").insert([
    {
      name: name.toString(),
      roll_number: roll_number.toString(),
      personal_email: personal_email?.toString() || null,
      academic_email: academic_email?.toString() || null,
      mobile_number: mobile_number?.toString() || null,
      whatsapp_number: whatsapp_number?.toString() || null,
      discord_username: discord_username?.toString() || null,
      github_username: github_username?.toString() || null,
      instagram_username: instagram_username?.toString() || null,
      portfolio_url: portfolio_url?.toString() || null,
      linkedin_url: linkedin_url?.toString() || null,
      title: title?.toString() || "Basher",
      clan_name: clan_name?.toString() || null,
      basher_no: basher_no?.toString() || null,
      joined_date: joined_date ? new Date(joined_date.toString()).toISOString() : null,
      primary_domain: primary_domain.length > 0 ? primary_domain.map((d) => d.toString()) : null,
      secondary_domain: secondary_domain.length > 0 ? secondary_domain.map((d) => d.toString()) : null,
      clan_id: clan_id || null,
      duolingo_username: duolingo_username?.toString() || null,
      bash_points: 0,
    },
  ])

  if (error) {
    return json({ error: error.message })
  }

  return json({ success: true })
}

// Particle component for background animation
const Particle = ({ index }: { index: number }) => {
  const randomSize = Math.floor(Math.random() * 8) + 4
  const randomDelay = Math.random() * 5
  const randomDuration = Math.random() * 10 + 10
  const randomX = Math.random() * 100

  return (
    <motion.div
      className="absolute rounded-full bg-violet-400/20"
      style={{
        width: randomSize,
        height: randomSize,
        left: `${randomX}%`,
        top: -20,
      }}
      animate={{
        y: ["0vh", "100vh"],
        opacity: [0, 0.8, 0],
      }}
      transition={{
        duration: randomDuration,
        repeat: Number.POSITIVE_INFINITY,
        delay: randomDelay,
        ease: "linear",
      }}
    />
  )
}

export default function AddMember() {
  const actionData = useActionData<{ error?: string; success?: boolean }>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"
  const { domains, clans } = useLoaderData<typeof loader>()

  const [selectedPrimaryDomains, setSelectedPrimaryDomains] = useState<string[]>([])
  const [selectedSecondaryDomains, setSelectedSecondaryDomains] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [showSuccessConfetti, setShowSuccessConfetti] = useState(false)

  const titles = ["Basher", "Captain Bash", "Organiser", "Mentor", "Legacy Basher", "Rookie", "Null Basher"]

  // Show confetti when form submission is successful
  useEffect(() => {
    if (actionData?.success) {
      setShowSuccessConfetti(true)
      const timer = setTimeout(() => setShowSuccessConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [actionData])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  const handlePrimaryDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (e.target.checked) {
      setSelectedPrimaryDomains([...selectedPrimaryDomains, value])
    } else {
      setSelectedPrimaryDomains(selectedPrimaryDomains.filter((domain) => domain !== value))
    }
  }

  const handleSecondaryDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (e.target.checked) {
      setSelectedSecondaryDomains([...selectedSecondaryDomains, value])
    } else {
      setSelectedSecondaryDomains(selectedSecondaryDomains.filter((domain) => domain !== value))
    }
  }

  // Generate particles for background
  const particles = Array.from({ length: 30 }).map((_, index) => <Particle key={index} index={index} />)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 text-white relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">{particles}</div>

      {/* Glowing orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"></div>

      {/* Success confetti */}
      {showSuccessConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 100 }).map((_, i) => {
            const size = Math.random() * 10 + 5
            const color = ["bg-violet-500", "bg-purple-500", "bg-indigo-500", "bg-pink-500", "bg-fuchsia-500"][
              Math.floor(Math.random() * 5)
            ]
            return (
              <motion.div
                key={i}
                className={`absolute rounded-md ${color}`}
                style={{
                  width: size,
                  height: size,
                  left: `${Math.random() * 100}%`,
                  top: `-5%`,
                }}
                initial={{ y: 0, opacity: 1, rotate: 0 }}
                animate={{
                  y: `${100 + Math.random() * 20}vh`,
                  opacity: [1, 1, 0],
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  ease: [0.1, 0.25, 0.3, 1],
                }}
              />
            )
          })}
        </div>
      )}

      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          {/* Header with fun animation */}
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block p-4 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 backdrop-blur-md mb-6 relative"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 3,
                }}
                className="relative z-10"
              >
                <Sparkles className="w-12 h-12 text-violet-300" />
              </motion.div>

              {/* Animated rings around icon */}
              <motion.div
                className="absolute inset-0 rounded-full border border-violet-400/30"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-fuchsia-400/20"
                animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
              />
            </motion.div>

            <motion.h1
              className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Join Byte Bash Blitz
            </motion.h1>

            <motion.p
              className="mt-3 text-lg text-violet-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Become a part of our awesome coding community!
            </motion.p>

            {/* Floating elements animation */}
            <div className="relative h-24 mt-6">
              {[
                { emoji: "🚀", delay: 0, x: -40 },
                { emoji: "💻", delay: 0.3, x: -20 },
                { emoji: "🎮", delay: 0.6, x: 0 },
                { emoji: "🤖", delay: 0.9, x: 20 },
                { emoji: "🎯", delay: 1.2, x: 40 },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="absolute text-3xl"
                  initial={{
                    x: `${item.x}%`,
                    y: 0,
                    opacity: 0,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    delay: item.delay,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 2,
                  }}
                >
                  {item.emoji}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Decorative elements inside card */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-2xl"></div>

            <Form method="post" className="space-y-8 relative z-10">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Basic Information */}
                <motion.div variants={itemVariants} className="space-y-5">
                  <div className="flex items-center gap-3 text-violet-300 mb-4">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <UserPlus className="w-6 h-6" />
                    </motion.div>
                    <h2 className="text-xl font-semibold">Basic Information</h2>
                  </div>

                  <div className="group">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-violet-200 mb-1.5 group-hover:text-white transition-colors"
                    >
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="block w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-violet-300/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 group-hover:bg-white/10"
                        placeholder="Enter your full name"
                      />
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label
                      htmlFor="roll_number"
                      className="block text-sm font-medium text-violet-200 mb-1.5 group-hover:text-white transition-colors"
                    >
                      Roll Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="roll_number"
                        name="roll_number"
                        required
                        className="block w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-violet-300/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 group-hover:bg-white/10"
                        placeholder="Enter your roll number"
                      />
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label
                      htmlFor="basher_no"
                      className="block text-sm font-medium text-violet-200 mb-1.5 group-hover:text-white transition-colors"
                    >
                      Basher Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="basher_no"
                        name="basher_no"
                        className="block w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-violet-300/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 group-hover:bg-white/10"
                        placeholder="BBB-001"
                      />
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label
                      htmlFor="joined_date"
                      className="block text-sm font-medium text-violet-200 mb-1.5 group-hover:text-white transition-colors"
                    >
                      Joined Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-violet-400" />
                      </div>
                      <input
                        type="date"
                        id="joined_date"
                        name="joined_date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="block w-full rounded-lg bg-white/5 border border-white/10 pl-10 px-4 py-3 text-white placeholder-violet-300/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 group-hover:bg-white/10"
                      />
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-violet-200 mb-1.5 group-hover:text-white transition-colors"
                    >
                      Title
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Award className="h-5 w-5 text-violet-400" />
                      </div>
                      <select
                        id="title"
                        name="title"
                        defaultValue="Basher"
                        className="block w-full rounded-lg bg-white/5 border border-white/10 pl-10 px-4 py-3 text-white placeholder-violet-300/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 group-hover:bg-white/10 appearance-none"
                      >
                        {titles.map((title) => (
                          <option key={title} value={title} className="bg-violet-900">
                            {title}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <motion.div
                          animate={{ y: [0, 3, 0] }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
                        >
                          <svg
                            className="h-4 w-4 text-violet-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      </div>
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label
                      htmlFor="clan_name"
                      className="block text-sm font-medium text-violet-200 mb-1.5 group-hover:text-white transition-colors"
                    >
                      Clan
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-violet-400" />
                      </div>
                      <select
                        id="clan_name"
                        name="clan_name"
                        className="block w-full rounded-lg bg-white/5 border border-white/10 pl-10 px-4 py-3 text-white placeholder-violet-300/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 group-hover:bg-white/10 appearance-none"
                      >
                        <option value="" className="bg-violet-900">
                          Select a clan
                        </option>
                        {clans.map((clan) => (
                          <option key={clan.id} value={clan.clan_name} className="bg-violet-900">
                            {clan.clan_name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <motion.div
                          animate={{ y: [0, 3, 0] }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
                        >
                          <svg
                            className="h-4 w-4 text-violet-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      </div>
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Contact Information */}
                <motion.div variants={itemVariants} className="space-y-5">
                  <div className="flex items-center gap-3 text-violet-300 mb-4">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Mail className="w-6 h-6" />
                    </motion.div>
                    <h2 className="text-xl font-semibold">Contact Information</h2>
                  </div>

                  <div className="group">
                    <label
                      htmlFor="personal_email"
                      className="block text-sm font-medium text-violet-200 mb-1.5 group-hover:text-white transition-colors"
                    >
                      Personal Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-violet-400" />
                      </div>
                      <input
                        type="email"
                        id="personal_email"
                        name="personal_email"
                        className="block w-full rounded-lg bg-white/5 border border-white/10 pl-10 px-4 py-3 text-white placeholder-violet-300/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 group-hover:bg-white/10"
                        placeholder="your.email@example.com"
                      />
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label
                      htmlFor="academic_email"
                      className="block text-sm font-medium text-violet-200 mb-1.5 group-hover:text-white transition-colors"
                    >
                      Academic Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-violet-400" />
                      </div>
                      <input
                        type="email"
                        id="academic_email"
                        name="academic_email"
                        className="block w-full rounded-lg bg-white/5 border border-white/10 pl-10 px-4 py-3 text-white placeholder-violet-300/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 group-hover:bg-white/10"
                        placeholder="your.academic@university.edu"
                      />
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label
                      htmlFor="mobile_number"
                      className="block text-sm font-medium text-violet-200 mb-1.5 group-hover:text-white transition-colors"
                    >
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-violet-400" />
                      </div>
                      <input
                        type="tel"
                        id="mobile_number"
                        name="mobile_number"
                        className="block w-full rounded-lg bg-white/5 border border-white/10 pl-10 px-4 py-3 text-white placeholder-violet-300/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 group-hover:bg-white/10"
                        placeholder="+1 (123) 456-7890"
                      />
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label
                      htmlFor="whatsapp_number"
                      className="block text-sm font-medium text-violet-200 mb-1.5 group-hover:text-white transition-colors"
                    >
                      WhatsApp Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MessageSquare className="h-5 w-5 text-violet-400" />
                      </div>
                      <input
                        type="tel"
                        id="whatsapp_number"
                        name="whatsapp_number"
                        className="block w-full rounded-lg bg-white/5 border border-white/10 pl-10 px-4 py-3 text-white placeholder-violet-300/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 group-hover:bg-white/10"
                        placeholder="+91 00000 00000"
                      />
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Social & Professional Profiles */}
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
                <div className="flex items-center gap-3 text-violet-300 mb-4">
                  <motion.div whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }} transition={{ duration: 0.5 }}>
                    <Globe className="w-6 h-6" />
                  </motion.div>
                  <h2 className="text-xl font-semibold">Social & Professional Profiles</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div variants={itemVariants} className="group">
                    <label
                      htmlFor="discord_username"
                      className="block text-sm font-medium text-violet-200 mb-1.5 group-hover:text-white transition-colors"
                    >
                      Discord Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MessageSquare className="h-5 w-5 text-violet-400" />
                      </div>
                      <input
                        type="text"
                        id="discord_username"
                        name="discord_username"
                        className="block w-full rounded-lg bg-white/5 border border-white/10 pl-10 px-4 py-3 text-white placeholder-violet-300/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 group-hover:bg-white/10"
                        placeholder="username#1234"
                      />
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="group">
                    <label
                      htmlFor="github_username"
                      className="block text-sm font-medium text-violet-200 mb-1.5 group-hover:text-white transition-colors"
                    >
                      GitHub Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Github className="h-5 w-5 text-violet-400" />
                      </div>
                      <input
                        type="text"
                        id="github_username"
                        name="github_username"
                        className="block w-full rounded-lg bg-white/5 border border-white/10 pl-10 px-4 py-3 text-white placeholder-violet-300/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 group-hover:bg-white/10"
                        placeholder="github-username"
                      />
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="group">
                    <label
                      htmlFor="instagram_username"
                      className="block text-sm font-medium text-violet-200 mb-1.5 group-hover:text-white transition-colors"
                    >
                      Instagram Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Instagram className="h-5 w-5 text-violet-400" />
                      </div>
                      <input
                        type="text"
                        id="instagram_username"
                        name="instagram_username"
                        className="block w-full rounded-lg bg-white/5 border border-white/10 pl-10 px-4 py-3 text-white placeholder-violet-300/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 group-hover:bg-white/10"
                        placeholder="instagram_username"
                      />
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="group">
                    <label
                      htmlFor="duolingo_username"
                      className="block text-sm font-medium text-violet-200 mb-1.5 group-hover:text-white transition-colors"
                    >
                      Duolingo Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BookOpen className="h-5 w-5 text-violet-400" />
                      </div>
                      <input
                        type="text"
                        id="duolingo_username"
                        name="duolingo_username"
                        className="block w-full rounded-lg bg-white/5 border border-white/10 pl-10 px-4 py-3 text-white placeholder-violet-300/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 group-hover:bg-white/10"
                        placeholder="duolingo_username"
                      />
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="group">
                    <label
                      htmlFor="linkedin_url"
                      className="block text-sm font-medium text-violet-200 mb-1.5 group-hover:text-white transition-colors"
                    >
                      LinkedIn URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Linkedin className="h-5 w-5 text-violet-400" />
                      </div>
                      <input
                        type="url"
                        id="linkedin_url"
                        name="linkedin_url"
                        className="block w-full rounded-lg bg-white/5 border border-white/10 pl-10 px-4 py-3 text-white placeholder-violet-300/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 group-hover:bg-white/10"
                        placeholder="https://linkedin.com/in/username"
                      />
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="group">
                    <label
                      htmlFor="portfolio_url"
                      className="block text-sm font-medium text-violet-200 mb-1.5 group-hover:text-white transition-colors"
                    >
                      Portfolio URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-violet-400" />
                      </div>
                      <input
                        type="url"
                        id="portfolio_url"
                        name="portfolio_url"
                        className="block w-full rounded-lg bg-white/5 border border-white/10 pl-10 px-4 py-3 text-white placeholder-violet-300/50 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 group-hover:bg-white/10"
                        placeholder="https://yourportfolio.com"
                      />
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Technical Information */}
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
                <div className="flex items-center gap-3 text-violet-300 mb-4">
                  <motion.div whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }} transition={{ duration: 0.5 }}>
                    <Code className="w-6 h-6" />
                  </motion.div>
                  <h2 className="text-xl font-semibold">Technical Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div variants={itemVariants} className="space-y-3">
                    <label htmlFor="primary_domain_group" className="block text-sm font-medium text-violet-200">Primary Domain</label>
                    <div id="primary_domain_group" className="max-h-40 overflow-y-auto p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200">
                      {domains.map((domain) => (
                        <div key={domain.id} className="flex items-center mb-3 group">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              id={`primary_${domain.id}`}
                              name="primary_domain"
                              value={domain.name}
                              onChange={handlePrimaryDomainChange}
                              className="h-4 w-4 rounded border-white/10 text-violet-500 focus:ring-violet-500/20 bg-white/5"
                            />
                            <div className="absolute -inset-0.5 rounded-sm bg-violet-500/20 scale-0 group-hover:scale-100 transition-transform duration-200" />
                          </div>
                          <label
                            htmlFor={`primary_${domain.id}`}
                            className="ml-3 block text-sm text-violet-100 group-hover:text-white transition-colors duration-200"
                          >
                            {domain.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedPrimaryDomains.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedPrimaryDomains.map((domain) => (
                          <motion.span
                            key={domain}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-500/20 text-violet-200 border border-violet-500/30"
                          >
                            {domain}
                            <motion.span
                              whileHover={{ rotate: 90 }}
                              transition={{ duration: 0.2 }}
                              className="ml-1.5 cursor-pointer"
                              onClick={() =>
                                setSelectedPrimaryDomains(selectedPrimaryDomains.filter((d) => d !== domain))
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </motion.span>
                          </motion.span>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-3">
                    <label htmlFor="secondary_domain_group" className="block text-sm font-medium text-violet-200">Secondary Domain</label>
                    <div id="secondary_domain_group" className="max-h-40 overflow-y-auto p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200">
                      {domains.map((domain) => (
                        <div key={domain.id} className="flex items-center mb-3 group">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              id={`secondary_${domain.id}`}
                              name="secondary_domain"
                              value={domain.name}
                              onChange={handleSecondaryDomainChange}
                              className="h-4 w-4 rounded border-white/10 text-violet-500 focus:ring-violet-500/20 bg-white/5"
                            />
                            <div className="absolute -inset-0.5 rounded-sm bg-violet-500/20 scale-0 group-hover:scale-100 transition-transform duration-200" />
                          </div>
                          <label
                            htmlFor={`secondary_${domain.id}`}
                            className="ml-3 block text-sm text-violet-100 group-hover:text-white transition-colors duration-200"
                          >
                            {domain.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedSecondaryDomains.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedSecondaryDomains.map((domain) => (
                          <motion.span
                            key={domain}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-500/20 text-violet-200 border border-violet-500/30"
                          >
                            {domain}
                            <motion.span
                              whileHover={{ rotate: 90 }}
                              transition={{ duration: 0.2 }}
                              className="ml-1.5 cursor-pointer"
                              onClick={() =>
                                setSelectedSecondaryDomains(selectedSecondaryDomains.filter((d) => d !== domain))
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </motion.span>
                          </motion.span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-6"
              >
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full relative flex items-center justify-center px-4 py-6 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:from-violet-700 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 transition-all duration-200 overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-white/20 to-violet-500/0"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 1.5,
                      ease: "linear",
                      repeatDelay: 0.5,
                    }}
                  />

                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="submitting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <motion.div
                          className="h-6 w-6 rounded-full border-2 border-white/30 border-t-white"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        />
                      </motion.div>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 text-lg"
                      >
                        <Rocket className="w-6 h-6" />
                        Join Byte Bash Blitz
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, 0, -5, 0],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatDelay: 2,
                          }}
                          className="ml-1"
                        >
                          <Zap className="w-5 h-5 text-yellow-300" />
                        </motion.div>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </Form>

            {/* Feedback Messages */}
            <AnimatePresence mode="wait">
              {actionData?.error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-300"
                >
                  <motion.div animate={{ rotate: [0, 10, -10, 10, 0] }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </motion.div>
                  <span className="font-medium">{actionData.error}</span>
                </motion.div>
              )}
              {actionData?.success && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-300"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      rotate: [0, 0, 0, 0, 0, 0, 360],
                    }}
                    transition={{ duration: 1, delay: 0.2 }}
                  >
                    <Check className="w-6 h-6 text-green-400" />
                  </motion.div>
                  <span className="font-medium">Member added successfully!</span>
                  <motion.span
                    animate={{
                      scale: [1, 1.5, 1],
                      rotate: [0, 10, 0, -10, 0],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: 3,
                      repeatDelay: 0.2,
                    }}
                    className="ml-1 text-xl"
                  >
                    🎉
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Decorative elements */}
          <div className="relative h-20">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${i * 20 - 10}%`,
                  bottom: `-${i * 5}px`,
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: `rgba(139, 92, 246, ${0.2 + i * 0.1})`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
