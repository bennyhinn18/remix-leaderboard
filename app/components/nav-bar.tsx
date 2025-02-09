"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "@remix-run/react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Calendar, Users, Menu, X, Star, PanelLeftOpen, PanelRightOpen } from "lucide-react"
import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import { cn } from "~/lib/utils"

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
  description?: string
}

const navItems: NavItem[] = [
  {
    icon: <Trophy className="w-5 h-5" />,
    label: "Leaderboard",
    href: "/leaderboard",
    description: "View rankings and achievements",
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "Profiles",
    href: "/profiles",
    description: "Browse member profiles",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    label: "Events",
    href: "/events",
    description: "Upcoming challenges and meetups",
  },
  {
    icon: <Star className="w-5 h-5" />,
    label: "Credits",
    href: "/credits",
    description: "Earn and spend your credits",
  },
]

export function NavBar() {
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [])

  const NavLink = ({ item, showLabel = true }: { item: NavItem; showLabel?: boolean }) => {
    const isActive = location.pathname === item.href

    return (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group",
          isActive
            ? "text-white bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20"
            : "text-gray-400 hover:text-white hover:bg-white/10",
        )}
      >
        {isActive && (
          <motion.div
            layoutId="active-nav"
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-lg"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative z-10">{item.icon}</span>
        {showLabel && (
          <div className="relative z-10 flex-1">
            <div className="font-medium">{item.label}</div>
            {isDesktopSidebarOpen && item.description && (
              <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                {item.description}
              </div>
            )}
          </div>
        )}
        {isActive && !showLabel && (
          <motion.div
            layoutId="active-dot"
            className="absolute right-2 w-1.5 h-1.5 rounded-full bg-blue-500"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </Link>
    )
  }

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <>
        <motion.aside
          initial={{ width: "64px" }}
          animate={{ width: isDesktopSidebarOpen ? "280px" : "64px" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed left-0 top-0 bottom-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-r border-white/10",
            "flex flex-col backdrop-blur-xl",
          )}
        >
          <div className="flex items-center justify-between p-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isDesktopSidebarOpen ? 1 : 0 }}
              className="flex items-center gap-2 px-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
              {isDesktopSidebarOpen && <span className="font-semibold text-white">ByteBash</span>}
            </motion.div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
              className="text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label={isDesktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDesktopSidebarOpen ? 0 : 180 }}
                transition={{ duration: 0.2 }}
              >
                {isDesktopSidebarOpen ? <PanelLeftOpen className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
              </motion.div>
            </Button>
          </div>
          <ScrollArea className="flex-1 py-6">
            <div className="px-3 py-2">
              {isDesktopSidebarOpen && (
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 px-4 text-lg font-semibold tracking-tight text-white"
                >
                  Navigation
                </motion.h2>
              )}
              <div className="space-y-1">
                {navItems.map((item) => (
                  <NavLink key={item.href} item={item} showLabel={isDesktopSidebarOpen} />
                ))}
              </div>
            </div>
          </ScrollArea>
        </motion.aside>
        <div className={cn("transition-all duration-300", isDesktopSidebarOpen ? "ml-[280px]" : "ml-16")}>
          {/* Content margin adjuster */}
        </div>
      </>
    )
  }

  // Mobile Bottom Bar and Sidebar
  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-white/10 backdrop-blur-xl z-50">
        <div className="flex items-center justify-around p-3">
          {navItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors relative",
                  isActive ? "text-white" : "text-gray-400",
                )}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-nav-mobile"
                    className="absolute -bottom-3 w-12 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </Button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 w-64 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-l border-white/10 backdrop-blur-xl z-40 md:hidden"
            >
              <ScrollArea className="h-full py-6">
                <div className="px-3 py-2">
                  <h2 className="mb-6 px-4 text-lg font-semibold tracking-tight text-white">Navigation</h2>
                  <div className="space-y-1">
                    {navItems.map((item) => (
                      <NavLink key={item.href} item={item} />
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </motion.div>

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  )
}

