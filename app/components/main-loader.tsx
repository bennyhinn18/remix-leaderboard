"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function TechLoader() {
  const [stage, setStage] = useState(0)
  const stages = ["client-request", "server-processing", "db-fetch", "response", "client-response"]

  // Cycle through animation stages
  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % stages.length)
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="page-loading-overlay">
      <div className="spinner-container">
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center w-full h-64 bg-black rounded-lg overflow-hidden">
            {/* Circuit board background */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <pattern id="circuit" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path
                    d="M10 0 L10 50 M20 0 L20 50 M30 0 L30 50 M40 0 L40 50 M0 10 L50 10 M0 20 L50 20 M0 30 L50 30 M0 40 L50 40"
                    stroke="#00ff00"
                    strokeWidth="0.5"
                    fill="none"
                  />
                </pattern>
                <rect width="100%" height="100%" fill="url(#circuit)" />
              </svg>
            </div>

            {/* Client node */}
            <motion.div
              className="absolute left-10 w-16 h-16 flex items-center justify-center rounded-lg bg-gray-800 border-2 border-blue-500 shadow-lg shadow-blue-500/20"
              animate={{
                borderColor: stage === 0 ? "#3b82f6" : "#1e3a8a",
                boxShadow: stage === 0 ? "0 0 15px 5px rgba(59, 130, 246, 0.5)" : "0 0 5px 2px rgba(59, 130, 246, 0.2)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <line x1="9" y1="2" x2="9" y2="4" />
                <line x1="15" y1="2" x2="15" y2="4" />
                <line x1="9" y1="20" x2="9" y2="22" />
                <line x1="15" y1="20" x2="15" y2="22" />
                <line x1="20" y1="9" x2="22" y2="9" />
                <line x1="20" y1="14" x2="22" y2="14" />
                <line x1="2" y1="9" x2="4" y2="9" />
                <line x1="2" y1="14" x2="4" y2="14" />
              </svg>
            </motion.div>

            {/* Server node */}
            <motion.div
              className="absolute w-16 h-16 flex items-center justify-center rounded-lg bg-gray-800 border-2 border-green-500 shadow-lg shadow-green-500/20"
              animate={{
                borderColor: stage === 1 ? "#22c55e" : "#166534",
                boxShadow: stage === 1 ? "0 0 15px 5px rgba(34, 197, 94, 0.5)" : "0 0 5px 2px rgba(34, 197, 94, 0.2)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-green-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6" y2="6" />
                <line x1="6" y1="18" x2="6" y2="18" />
              </svg>
            </motion.div>

            {/* Database node */}
            <motion.div
              className="absolute right-10 w-16 h-16 flex items-center justify-center rounded-lg bg-gray-800 border-2 border-purple-500 shadow-lg shadow-purple-500/20"
              animate={{
                borderColor: stage === 2 ? "#a855f7" : "#581c87",
                boxShadow: stage === 2 ? "0 0 15px 5px rgba(168, 85, 247, 0.5)" : "0 0 5px 2px rgba(168, 85, 247, 0.2)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-purple-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            </motion.div>

            {/* Data packets animation */}
            <AnimatePresence mode="wait">
              {stage === 0 && (
                <motion.div
                  key="client-to-server"
                  className="absolute left-28 w-4 h-4 bg-blue-500 rounded-full"
                  initial={{ x: 0, opacity: 0 }}
                  animate={{
                    x: 80,
                    opacity: [0, 1, 1, 0],
                    scale: [0.5, 1, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.2,
                    times: [0, 0.2, 0.8, 1],
                    ease: "easeInOut",
                  }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full bg-blue-400"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  />
                </motion.div>
              )}

              {stage === 1 && (
                <motion.div
                  key="server-processing"
                  className="absolute w-24 h-24 rounded-full"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{
                    scale: 1.2,
                    opacity: [0, 0.8, 0],
                    rotate: 180,
                  }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  exit={{ opacity: 0 }}
                >
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-green-500">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
                    <motion.circle
                      cx="50"
                      cy="5"
                      r="4"
                      fill="#22c55e"
                      animate={{
                        cx: [50, 95, 50, 5, 50],
                        cy: [5, 50, 95, 50, 5],
                      }}
                      transition={{
                        duration: 1.2,
                        ease: "linear",
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "loop",
                      }}
                    />
                  </svg>
                </motion.div>
              )}

              {stage === 2 && (
                <motion.div
                  key="server-to-db"
                  className="absolute w-4 h-4 bg-green-500 rounded-full"
                  initial={{ x: 0, opacity: 0 }}
                  animate={{
                    x: 80,
                    opacity: [0, 1, 1, 0],
                    scale: [0.5, 1, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.2,
                    times: [0, 0.2, 0.8, 1],
                    ease: "easeInOut",
                  }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full bg-green-400"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  />
                </motion.div>
              )}

              {stage === 3 && (
                <motion.div
                  key="response-to-client"
                  className="absolute right-28 w-4 h-4 bg-purple-500 rounded-full"
                  initial={{ x: 0, opacity: 0 }}
                  animate={{
                    x: -80,
                    opacity: [0, 1, 1, 0],
                    scale: [0.5, 1, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.2,
                    times: [0, 0.2, 0.8, 1],
                    ease: "easeInOut",
                  }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full bg-purple-400"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  />
                </motion.div>
              )}

              {stage === 4 && (
                <motion.div
                  key="client-processing"
                  className="absolute left-10 w-16 h-16"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{
                    scale: 1.1,
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  exit={{ opacity: 0 }}
                >
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-blue-500">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 3" />
                    <motion.path
                      d="M50 20 L50 80 M20 50 L80 50"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      fill="none"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        ease: "linear",
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                      style={{ transformOrigin: "center" }}
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status text */}
            <div className="absolute bottom-4 w-full text-center font-mono text-xs text-green-400">
              <AnimatePresence mode="wait">
                {stage === 0 && (
                  <motion.div
                    key="client-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <div className="text-blue-400 font-bold">CLIENT REQUEST</div>
                    <code className="text-xs opacity-70">GET /api/data HTTP/1.1</code>
                  </motion.div>
                )}

                {stage === 1 && (
                  <motion.div
                    key="server-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <div className="text-green-400 font-bold">SERVER PROCESSING</div>
                    <code className="text-xs opacity-70">Validating request parameters...</code>
                  </motion.div>
                )}

                {stage === 2 && (
                  <motion.div
                    key="db-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <div className="text-purple-400 font-bold">DATABASE QUERY</div>
                    <code className="text-xs opacity-70">SELECT * FROM bashers WHERE id = 007</code>
                  </motion.div>
                )}

                {stage === 3 && (
                  <motion.div
                    key="response-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <div className="text-blue-400 font-bold">RESPONSE</div>
                    <code className="text-xs opacity-70">{"{ status: 200, data: {...} }"}</code>
                  </motion.div>
                )}
                {stage === 4 && (
                  <motion.div
                    key="client-response-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <div className="text-blue-400 font-bold">CLIENT PROCESSING</div>
                    <code className="text-xs opacity-70">Rendering UI with received data...</code>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <p className="loading-text mt-4">Connecting to Basher Terminal...</p>
        </div>
      </div>
    </div>
  );
}
