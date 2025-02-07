"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "@remix-run/react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Calendar, Users, Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import { cn } from "~/lib/utils"

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
}

const navItems: NavItem[] = [
  {
    icon: <Trophy className="w-5 h-5" />,
    label: "Leaderboard",
    href: "/leaderboard",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    label: "Events",
    href: "/events",
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "Profiles",
    href: "/profiles",
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
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative",
          isActive
            ? "text-white bg-gradient-to-r from-blue-500/20 to-indigo-500/20"
            : "text-gray-400 hover:text-white hover:bg-white/10",
        )}
      >
        {isActive && (
          <motion.div
            layoutId="active-nav"
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative z-10">{item.icon}</span>
        {showLabel && <span className="relative z-10 font-medium">{item.label}</span>}
      </Link>
    )
  }

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <>
        <motion.aside
          initial={{ width: "64px" }}
          animate={{ width: isDesktopSidebarOpen ? "256px" : "64px" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed left-0 top-0 bottom-0 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-800",
            "flex flex-col",
          )}
        >
          <div className="flex items-center justify-end p-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
              className="text-gray-400 hover:text-white"
              aria-label={isDesktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isDesktopSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
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
        <div className={cn("transition-all duration-300", isDesktopSidebarOpen ? "ml-64" : "ml-16")}>
          {/* Content margin adjuster */}
        </div>
      </>
    )
  }

  // Mobile Bottom Bar and Sidebar
  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-800 z-50">
        <div className="flex items-center justify-around p-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                  isActive ? "text-white" : "text-gray-400",
                )}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-nav-mobile"
                    className="absolute bottom-0 w-12 h-0.5 bg-blue-500"
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
              className="fixed inset-y-0 right-0 w-64 bg-gradient-to-b from-gray-900 to-gray-800 border-l border-gray-800 z-40 md:hidden"
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
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  )
}

