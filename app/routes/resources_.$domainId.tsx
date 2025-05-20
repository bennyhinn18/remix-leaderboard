"use client"

import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { createServerSupabase } from "~/utils/supabase.server"
import { LucideExternalLink, LucideChevronLeft, LucideCalendar, LucideUser, LucidePlus } from "lucide-react"

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase = createServerSupabase(request, response)
  const domainId = Number(params.domainId)

  // Fetch domain
  const { data: domain, error: domainError } = await supabase.from("domains").select("*").eq("id", domainId).single()

  if (domainError || !domain) {
    throw new Response("Domain not found", { status: 404 })
  }

  // Fetch resources with member info
  const { data: resources = [], error: resourcesError } = await supabase
    .from("resources")
    .select(`
      *,
      member:members (name)
    `)
    .eq("domain_id", domainId)
    .order("added_at", { ascending: false })

  if (resourcesError) {
    console.error("Error fetching resources:", resourcesError)
    // Instead of throwing, we'll return empty resources array
    return json({ domain, resources: [] })
  }

  return json({ domain, resources })
}

type LoaderData = {
  domain: {
    id: number
    name: string
    focus: string
  }
  resources: Array<{
    id: number
    website_name: string
    website_url: string
    added_at: string
    member?: { name: string } | null
  }>
}

export default function DomainResources() {
  const { domain, resources } = useLoaderData<LoaderData>()
  const [typedText, setTypedText] = useState("")
  const [cursorVisible, setCursorVisible] = useState(true)
  const [loadingResources, setLoadingResources] = useState(true)
  const [activeResourceId, setActiveResourceId] = useState<number | null>(null)

  // Typing animation for domain name
  useEffect(() => {
    if (typedText.length < domain.name.length) {
      const timeout = setTimeout(() => {
        setTypedText(domain.name.slice(0, typedText.length + 1))
      }, 70)
      return () => clearTimeout(timeout)
    }
  }, [typedText, domain.name])

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  // Simulate loading resources
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoadingResources(false)
    }, 800)
    return () => clearTimeout(timeout)
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  }

  // Terminal loading animation
  const LoadingAnimation = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-[#00ff9d] font-mono mb-4">
        <span className="inline-block">$</span> loading resources
        <span className="inline-block ml-1 animate-pulse">_</span>
      </div>
      <div className="w-64 h-6 bg-[#111] rounded-sm overflow-hidden border border-[#00ff9d]/30">
        <motion.div
          className="h-full bg-[#00ff9d]/30"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#00ff9d] font-mono px-4 py-8 relative overflow-hidden">
      {/* Terminal background grid */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="h-full w-full bg-grid-pattern"></div>
      </div>

      {/* Scanline effect */}
      <div className="scanline"></div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="terminal-header mb-8 border-b border-[#00ff9d]/30 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <div className="ml-4 text-xs text-[#00ff9d]/70">user@bytebashblitz:~/resources</div>
            </div>

            <Link
              to="/resources"
              className="inline-flex items-center text-[#00ccff] hover:text-[#00ffff] mb-6 transition-colors group"
            >
              <LucideChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
              <span className="group-hover:underline">cd ..</span>
            </Link>

            <div className="flex items-center mt-4">
              <span className="text-[#00ff9d]/70 mr-2">$</span>
              <motion.h1
                className="text-3xl font-bold text-[#00ff9d]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <span>{typedText}</span>
                <span
                  className={`ml-1 inline-block h-6 w-3 bg-[#00ff9d] ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                ></span>
              </motion.h1>
            </div>
            <motion.p
              className="text-[#00ff9d]/80 ml-6 mt-2 border-l-2 border-[#00ff9d]/30 pl-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {domain.focus}
            </motion.p>
          </div>

          {loadingResources ? (
            <LoadingAnimation />
          ) : resources.length === 0 ? (
            <motion.div
              className="bg-[#111] rounded-lg border border-[#00ff9d]/30 p-8 text-center max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-[#00ff9d]/60 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="terminal-text mb-4">
                <span className="text-[#00ff9d]/70">$</span> find ./resources -type f
                <div className="mt-2 text-[#ff5555]">No files found in directory.</div>
              </div>
              <h2 className="text-xl font-medium text-[#00ff9d] mb-2">No resources yet</h2>
              <p className="text-[#00ff9d]/80 mb-6">Be the first to add a learning resource for this domain!</p>
              <Link
                to={`/add-resource?domainId=${domain.id}`}
                className="inline-flex items-center px-6 py-3 border border-[#00ff9d] text-base font-medium rounded-md 
                text-black bg-[#00ff9d] hover:bg-[#00cc7d] transition-colors shadow-glow"
              >
                <LucidePlus className="w-4 h-4 mr-2" />
                Add Resource
              </Link>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {resources.map((resource) => (
                <motion.div
                  key={resource.id}
                  className={`bg-[#111] rounded-lg border overflow-hidden terminal-card
                    ${activeResourceId === resource.id ? "border-[#00ff9d]" : "border-[#00ff9d]/30"}`}
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 0 20px rgba(0, 255, 157, 0.2)",
                    borderColor: "rgba(0, 255, 157, 0.8)",
                  }}
                  onMouseEnter={() => setActiveResourceId(resource.id)}
                  onMouseLeave={() => setActiveResourceId(null)}
                >
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-[#00ff9d]/70 mr-2">$</span>
                        <h2 className="text-xl font-semibold text-[#00ff9d]">{resource.website_name}</h2>
                      </div>
                      <div className="text-xs text-[#00ff9d]/50 bg-[#0a0a0a] px-2 py-1 rounded">ID: {resource.id}</div>
                    </div>

                    <div className="terminal-text mb-4 text-sm">
                      <span className="text-[#00ff9d]/70">$</span> curl{" "}
                      {resource.website_url.replace(/^https?:\/\//, "")}
                    </div>

                    <a
                      href={resource.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00ccff] hover:text-[#00ffff] hover:underline break-all mb-4 flex items-center group"
                    >
                      <span>Visit Resource</span>
                      <LucideExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <div className="mt-auto pt-4 border-t border-[#00ff9d]/20 flex items-center justify-between">
                      <div className="text-sm text-[#00ff9d]/70 flex items-center">
                        <LucideUser className="w-3 h-3 mr-1" />
                        <span>{resource.member?.name ?? "Unknown"}</span>
                      </div>
                      <div className="text-xs text-[#00ff9d]/50 flex items-center">
                        <LucideCalendar className="w-3 h-3 mr-1" />
                        <span>{new Date(resource.added_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
