'use client';

import { Link, useLocation } from '@remix-run/react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Star, UserCircle } from 'lucide-react';
import { cn } from '~/lib/utils';
const navItems = [
  {
    icon: Trophy,
    label: 'Leaderboard',
    href: '/leaderboard',
    color: 'text-amber-400',
    gradientFrom: 'from-amber-500/20',
    gradientTo: 'to-amber-600/20',
  },
  {
    icon: Calendar,
    label: 'Events',
    href: '/events',
    color: 'text-blue-400',
    gradientFrom: 'from-blue-500/20',
    gradientTo: 'to-blue-600/20',
  },
  {
    icon: Star,
    label: 'Credits',
    href: '/credits',
    color: 'text-purple-400',
    gradientFrom: 'from-purple-500/20',
    gradientTo: 'to-purple-600/20',
  },
  {
    icon: UserCircle,
    label: 'Profile',
    href: '/profile',
    color: 'text-green-400',
    gradientFrom: 'from-green-500/20',
    gradientTo: 'to-green-600/20',
  },
];

export function BottomNav() {
  const location = useLocation();
  if (
    location.pathname.startsWith('/profile/') ||
    location.pathname.startsWith('/clans/')
  ) {
    return null;
  }
  return (
    <>
      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-900/95 to-gray-900/98 backdrop-blur-xl rounded-t-2xl border-t border-white/10"
      >
        <div className="flex justify-around items-center gap-4 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className="relative flex flex-col items-center gap-1 p-2 group"
                aria-label={item.label}
              >
                <motion.span
                  initial={false}
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    color: isActive
                      ? 'rgb(96, 165, 250)'
                      : 'rgb(156, 163, 175)',
                  }}
                  className="relative z-10"
                >
                  <Icon className="w-6 h-6" />
                </motion.span>

                <span
                  className={cn(
                    'text-xs font-medium',
                    isActive ? 'text-blue-400' : 'text-gray-400'
                  )}
                >
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 bg-blue-500/10 rounded-xl w-full"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </motion.nav>

      {/* Desktop Side Navigation */}
      <motion.nav
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden md:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col gap-4 z-50"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'relative group flex items-center',
                'transition-all duration-300 ease-in-out'
              )}
              aria-label={item.label}
            >
              <motion.div
                className={cn(
                  'flex items-center gap-2 p-3 rounded-xl',
                  'bg-gradient-to-br border border-white/10',
                  isActive
                    ? `${item.gradientFrom} ${item.gradientTo}`
                    : 'from-gray-800/50 to-gray-900/50'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon
                  className={cn(
                    'w-6 h-6',
                    isActive
                      ? item.color
                      : 'text-gray-400 group-hover:text-white'
                  )}
                />

                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    width: isActive ? 'auto' : 0,
                  }}
                  className={cn(
                    'text-sm font-medium whitespace-nowrap overflow-hidden',
                    isActive ? item.color : 'text-gray-400'
                  )}
                >
                  {item.label}
                </motion.span>
              </motion.div>

              {/* Tooltip for inactive items */}
              {!isActive && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="absolute left-full ml-2 px-2 py-1 text-sm font-medium text-white bg-gray-900 rounded-md border border-white/10 pointer-events-none"
                >
                  {item.label}
                </motion.div>
              )}
            </Link>
          );
        })}
      </motion.nav>
    </>
  );
}
