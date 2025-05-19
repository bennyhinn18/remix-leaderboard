import * as React from "react"
import { Link } from "@remix-run/react"
import { Trophy, Star, Mail, Globe, LogOut, Building, ChevronDown, Book, PanelRightOpen, Calendar, UserCheck } from "lucide-react"
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
import type { BasherProfile } from "~/types/profile"
import iconImage from "~/assets/bashers.png";
import { NotificationDropdown } from "~/components/notification-dropdown"

const navigation = [
  {
    title: "Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
  {
    title: "Credits",
    href: "/credits",
    icon: Star,
  },
  {
    title: "Events",
    href: "/events",
    icon: Calendar,
    description: "Upcoming challenges and meetups",
  },
  {
    title: "Clans",
    href: "/clans",
    icon: Building,
    items: [
      {
        title: "Aura 7f",
        href: `/clans/1`,
        id: "aura-7f",
        members: 24,
      },
      {
        title: "Belmonts",
        href: `/clans/2`,
        members: 18,
      },
      {
        title: "Lumina",
        href: `/clans/3`,
        members: 21,
      },
      {
        title: "Shadastria Adepti",
        href: `/clans/4`,
        members: 16,
      },
    ],
  },
  {
    title: "Clan",
    href: "/clans",
    icon: UserCheck,
  },
  {
    title: "Legacy-Bashers",
    href: "/legacy-bashers",
    icon: UserCheck,
  },
]

const bottomNav = [
  {
    title: "Contact",
    href: "/support",
    icon: Mail,
  },
  {
    title: "Website",
    href: "https://bytebashblitz.org/",
    icon: Globe,
  },
  {
    title: "Handbook",
    href: "https://basher-handbook.notion.site/",
    icon: Book,
    external: true,
  },
]

interface MainNavProps {
  user: BasherProfile;
  notifications?: Array<any>;
  unreadCount?: number;
}

export function MainNav({ user, notifications = [], unreadCount = 0 }: MainNavProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className="relative h-14 w-14 rounded-full bg-[#4dc4f9]/10 hover:bg-[#4dc4f9]/20 transition-colors"
        >
          <PanelRightOpen className="h-8 w-8 text-[#4dc4f9]" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[280px] p-0 flex flex-col bg-gradient-to-br from-gray-900 to-black text-white"
      >
        <SheetHeader className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="space-y-2 relative w-12 h-12">
            <img
              src={iconImage}
              alt="Byte Bash Logo"
              className="w-full h-full object-cover"
            />
            </div>
            <div className="flex flex-col flex-1">
              <SheetTitle className="text-lg font-bold text-white">Byte Bash Blitz</SheetTitle>
              <p className="text-sm text-blue-400">{user.basherLevel} Basher</p>
            </div>
            <NotificationDropdown 
              memberId={user.id} 
              notifications={notifications} 
              unreadCount={unreadCount} 
            />
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
                        <Button variant="ghost" className="w-full justify-between hover:bg-white/5 text-white">
                          <span className="flex items-center gap-2">
                            {item.icon && React.createElement(item.icon, { className: "h-5 w-5 text-blue-400" })}
                            {item.title}
                          </span>
                          <ChevronDown className="h-4 w-4 text-blue-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        alignOffset={-8}
                        className="w-[230px] bg-gray-900/95 backdrop-blur-xl border border-white/10"
                      >
                        <DropdownMenuLabel className="text-blue-400">Select Clan</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        {item.items.map((subItem) => (
                          <DropdownMenuItem key={subItem.title} asChild>
                            <Link
                              to={subItem.href}
                              className="text-white hover:text-blue-400 flex justify-between items-center"
                            >
                              {subItem.title}
                              <span className="text-sm text-gray-400">{subItem.members} members</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-white/5 text-white" asChild>
                      <Link to={item.href}>
                        {item.icon && <item.icon className="h-5 w-5 text-blue-400" />}
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
                  className="w-full justify-start gap-2 hover:bg-white/5 text-white"
                  asChild
                >
                  <Link to={item.href}>
                    {item.icon && <item.icon className="h-5 w-5 text-blue-400" />}
                    {item.title}
                  </Link>
                </Button>
              ))}
            </nav>
          </div>
        </ScrollArea>

        <div className="mt-auto border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10 rounded-lg border border-white/10">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <div className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs">{user.basherNo}</div>
              </div>
              <p className="text-xs text-gray-400 truncate">{user.clanName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 hover:bg-red-500/10 hover:text-red-400 text-white group"
          >
            <LogOut className="h-5 w-5 group-hover:text-red-400" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

