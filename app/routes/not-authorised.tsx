'use client';

import { Link } from '@remix-run/react';
import { motion } from 'framer-motion';
import { AlertOctagon, ArrowLeft, ShieldOff, Lock } from 'lucide-react';
import { Button } from '~/components/ui/button';

const funnyMessages = [
  "Looks like you're trying to sneak into the cool kids' club! 🕵️‍♂️",
  "Hold up! This area is more exclusive than a cat's personal space! 🐱",
  'Error 401: Your access card seems to be made of cardboard! 🎨',
  "Nice try, but our AI bouncer says 'nope'! 🤖",
  'Unauthorized? More like un-awesome-orized! 😎',
];

export default function NotAuthorized() {
  // Get a random funny message
  const randomMessage =
    funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated Lock Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            duration: 1,
          }}
          className="relative w-32 h-32 mx-auto mb-8"
        >
          {/* Animated shield background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.5, 0.3, 0.5],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'reverse',
            }}
            className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"
          />

          {/* Main icon container */}
          <div className="relative bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full w-full h-full flex items-center justify-center border border-red-500/30">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: 'reverse',
              }}
            >
              <ShieldOff className="w-12 h-12 text-red-400" />
            </motion.div>
          </div>

          {/* Orbiting locks */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8,
                delay: i * 0.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
            >
              <motion.div
                className="absolute"
                style={{
                  top: '0%',
                  left: '50%',
                  transform: `rotate(${i * 120}deg) translateY(-40px)`,
                }}
              >
                <Lock className="w-4 h-4 text-red-400" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
            Access Denied!
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg"
          >
            {randomMessage}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-gray-500 flex items-center justify-center gap-2"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Error Code: 401 Unauthorized</span>
          </motion.div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Button
            asChild
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
          >
            <Link to="/leaderboard" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Safety
            </Link>
          </Button>
        </motion.div>

        {/* Binary Rain Effect */}
        <div className="fixed inset-0 pointer-events-none select-none overflow-hidden">
          {typeof window !== 'undefined' &&
            [...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -100, x: Math.random() * window.innerWidth }}
                animate={{ y: window.innerHeight + 100 }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 2,
                }}
                className="absolute text-red-500/20 font-mono text-xs"
              >
                {Math.random().toString(2).slice(2, 10)}
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}
