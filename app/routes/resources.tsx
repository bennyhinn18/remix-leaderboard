"use client"

import { ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { createServerSupabase } from "~/utils/supabase.server"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import AddResource from "~/components/add-resources"
import AddProject from "~/components/add-project"
import ProjectList from "~/components/project-list"

interface Domain {
  id: number
  name: string
  focus: string
}

interface LoaderData {
  domains: Domain[]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase = createServerSupabase(request, response)

  // Fetch domains
  const { data: domain, error } = await supabase
    .from("domains")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  // Fetch projects
  const { data: projectsData } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch members
  const { data: membersData } = await supabase
    .from("members")
    .select("id, name")
    .order("name", { ascending: true });

  return json({
    domains: domain || [],
    projects: projectsData || [],
    members: membersData || [],
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response();
  const supabase = createServerSupabase(request, response);

  const formData = await request.formData();
  
  const domainId = formData.get("domainId");
  const websiteName = formData.get("websiteName");
  const websiteUrl = formData.get("websiteUrl");
  const memberName = formData.get("memberName");

  // Validate inputs
  const errors: Record<string, string> = {};
  if (!domainId) errors.domainId = "Domain is required";
  if (!websiteName) errors.websiteName = "Resource name is required";
  if (!websiteUrl) errors.websiteUrl = "URL is required";
  if (!memberName) errors.memberName = "Your name is required";

  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 });
  }

  // Insert into database
  const { error } = await supabase
    .from("resources")
    .insert({
      domain_id: Number(domainId),
      website_name: websiteName!.toString(),
      website_url: websiteUrl!.toString(),
      membername: memberName!.toString(),
      added_at: new Date().toISOString(),
    });

  if (error) {
    return json({ errors: { form: error.message } }, { status: 500 });
  }

  return json({ success: true });
}

export default function ResourcesPage() {
  const { domains } = useLoaderData<LoaderData>()
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [typedText, setTypedText] = useState("")
  const fullText = "Computer Science Terminal"
  const [cursorVisible, setCursorVisible] = useState(true)
  const { projects, members } = useLoaderData<typeof loader>();

  // Typing animation effect
  useEffect(() => {
    if (typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1))
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [typedText, fullText])

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  // Staggered animation for domain cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#00ff9d] font-mono px-4 py-8 relative overflow-hidden">
      {/* Terminal background grid */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="h-full w-full bg-grid-pattern"></div>
      </div>

      {/* Scanline effect */}
      <div className="scanline"></div>

      <div className="relative z-10">
        <div className="terminal-header mb-8 border-b border-[#00ff9d]/30 pb-4">
          <Link to="/leaderboard">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <div className="ml-4 text-xs text-[#00ff9d]/70">user@bytebashblitz:~</div>
          </div>
          </Link>

          <motion.div
            className="flex flex-col items-center justify-center relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center justify-center w-full">
              <span className="text-[#00ff9d]/70 mr-2">$</span>
              <motion.h1
          className="text-3xl md:text-5xl font-bold text-center text-[#00ff9d] flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
              >
          <span className="inline-block">💻</span> {typedText}
          <span
            className={`ml-1 inline-block h-6 w-3 bg-[#00ff9d] ${cursorVisible ? "opacity-100" : "opacity-0"}`}
          ></span>
              </motion.h1>
            </div>
          </motion.div>
        </div>

        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <motion.button
            onClick={() => setShowResourceModal(true)}
            className="bg-[#00ff9d] hover:bg-[#00cc7d] text-black font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 15px rgba(0, 255, 157, 0.7)",
              textShadow: "0 0 8px rgba(0, 0, 0, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span>➕</span>
            <span>Add Resource</span>
          </motion.button>

          <motion.button
            onClick={() => setShowProjectForm(true)}
            className="bg-[#00ccff] hover:bg-[#00a3cc] text-black font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 15px rgba(0, 204, 255, 0.7)",
              textShadow: "0 0 8px rgba(0, 0, 0, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span>🚀</span>
            <span>Add Project</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {showProjectForm && <AddProject domains={domains} onClose={() => setShowProjectForm(false)} />}

          {showResourceModal && <AddResource domains={domains} onClose={() => setShowResourceModal(false)} />}
        </AnimatePresence>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {domains.map((domain, index) => (
            <motion.div
              key={domain.id}
              className="bg-[#111] border border-[#00ff9d]/50 rounded-xl shadow-xl overflow-hidden terminal-card"
              variants={itemVariants}
              whileHover={{
                y: -5,
                boxShadow: "0 0 20px rgba(0, 255, 157, 0.3)",
                borderColor: "rgba(0, 255, 157, 0.8)",
              }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="p-6 relative">
                <div className="absolute top-3 right-3 text-xs text-[#00ff9d]/50">ID: {domain.id}</div>
                <div className="flex items-center mb-3">
                  <span className="text-[#00ff9d]/70 mr-2">$</span>
                  <h2 className="text-2xl font-bold text-[#00ff9d]">{domain.name}</h2>
                </div>
                <p className="text-[#00ff9d]/80 text-sm ml-4 border-l-2 border-[#00ff9d]/30 pl-2">{domain.focus}</p>
              </div>

              <div className="px-6 py-4 bg-[#0a0a0a] border-t border-[#00ff9d]/30">
                <Link
                  to={`/resources/${domain.id}`}
                  className="text-[#00ccff] hover:text-[#00ffff] flex items-center gap-2 group"
                >
                  <span className="inline-block transition-transform group-hover:translate-x-1">▶</span>
                  <span className="group-hover:underline">cd ./resources/{domain.id}</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <ProjectList initialProjects={projects} initialMembers={members} />;
      </div>
    </div>
  )
}
