"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  Users,
  Home,
  UserCircle,
  Book,
  Mail,
  Globe,
  LogOut,
  Building,
  Moon,
  Sun,
  ChevronDown,
} from "lucide-react"
import { Button } from "~/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "~/components/ui/dropdown-menu"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
// import { useTheme } from "~/providers/theme-provider"
import type { NavigationItem, UserNavigation } from "~/types/navigation"

const navigation: NavigationItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "View Clans",
    href: "/clans",
    icon: Building,
    items: [
      {
        title: "Aura 7f",
        href: "/clans/aura-7f",
      },
      {
        title: "Belmonts",
        href: "/clans/belmonts",
      },
      {
        title: "Lumina",
        href: "/clans/lumina",
      },
      {
        title: "Shadastria Adepti",
        href: "/clans/shadastria-adepti",
      },
    ],
  },
  {
    title: "Bashers",
    href: "/bashers",
    icon: Users,
  },
]

const bottomNav: NavigationItem[] = [
  {
    title: "Contact",
    href: "/contact",
    icon: Mail,
  },
  {
    title: "Website",
    href: "https://bbt.com",
    icon: Globe,
  },
  {
    title: "Handbook",
    href: "/handbook",
    icon: Book,
  },
]

interface MainNavProps {
  user: UserNavigation
}

export function MainNav({ user }: MainNavProps) {
  const [open, setOpen] = React.useState(false)
//   const { theme, toggleTheme } = useTheme()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className="relative h-14 w-14 rounded-full bg-[#4dc4f9]/10 hover:bg-[#4dc4f9]/20 transition-colors"
        >
          <Menu className="h-8 w-8 text-[#4dc4f9]" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0 flex flex-col bg-white dark:bg-gray-950">
        <SheetHeader className="p-4 border-b border-[#4dc4f9]/10">
          <div className="flex items-center gap-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bashers-QUqKBsOsaxWS2xsmkPl295pRAvng84.png"
              alt="Bashers Logo"
              className="h-8 w-8"
            />
            <div className="flex flex-col">
              <SheetTitle className="text-lg font-bold text-black dark:text-white">Byte Bash Blitz</SheetTitle>
              <p className="text-sm text-[#4dc4f9]">{user.username}'s Clan</p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <div key={item.title}>
                  {item.items ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between hover:bg-[#4dc4f9]/10 text-black dark:text-white"
                        >
                          <span className="flex items-center gap-2">
                            {item.icon && <item.icon className="h-5 w-5 text-[#4dc4f9]" />}
                            {item.title}
                          </span>
                          <ChevronDown className="h-4 w-4 text-[#4dc4f9]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        alignOffset={-8}
                        className="w-[230px] bg-white dark:bg-gray-950"
                      >
                        <DropdownMenuLabel className="text-[#4dc4f9]">Select Clan</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {item.items.map((subItem: NavigationItem) => (
                          <DropdownMenuItem key={subItem.title} asChild>
                            <Link href={subItem.href || "#"} className="text-black dark:text-white">
                              {subItem.title}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 hover:bg-[#4dc4f9]/10 text-black dark:text-white"
                      asChild
                    >
                      <Link href={item.href || "#"}>
                        {item.icon && <item.icon className="h-5 w-5 text-[#4dc4f9]" />}
                        {item.title}
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </nav>

            <nav className="mt-4 space-y-2">
              {bottomNav.map((item) => (
                <Button
                  key={item.title}
                  variant="ghost"
                  className="w-full justify-start gap-2 hover:bg-[#4dc4f9]/10 text-black dark:text-white"
                  asChild
                >
                  <Link href={item.href || "#"}>
                    {item.icon && <item.icon className="h-5 w-5 text-[#4dc4f9]" />}
                    {item.title}
                  </Link>
                </Button>
              ))}
              {/* <Button
                variant="ghost"
                className="w-full justify-start gap-2 hover:bg-[#4dc4f9]/10 text-black dark:text-white"
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 text-[#4dc4f9]" />
                ) : (
                  <Sun className="h-5 w-5 text-[#4dc4f9]" />
                )}
                {theme === "dark" ? "Dark" : "Light"} Mode
              </Button> */}
            </nav>
          </div>
        </ScrollArea>

        <div className="mt-auto border-t border-[#4dc4f9]/10 p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black dark:text-white">{user.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 hover:bg-red-500/10 hover:text-red-500 text-black dark:text-white"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

