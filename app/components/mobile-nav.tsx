"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Trophy, Star, Calendar, Users, User } from "lucide-react"
import { cn } from "~/lib/utils"

interface NavItem {
  icon: typeof Trophy
  href: string
  label: string
}

const navItems: NavItem[] = [
  { icon: Trophy, href: "/leaderboard", label: "Leaderboard" },
  { icon: Star, href: "/credits", label: "Credits" },
  { icon: Calendar, href: "/events", label: "Events" },
  { icon: Users, href: "/companions", label: "Companions" },
  { icon: User, href: "/profile", label: "Profile" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t dark:border-gray-800">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-3 text-sm transition-colors relative group",
                isActive
                  ? "text-blue-500"
                  : "text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400",
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-opacity",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                )}
              />
              <item.icon className="h-5 w-5 relative z-10" />
              <span className="relative z-10 text-xs">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

