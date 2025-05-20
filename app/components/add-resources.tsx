"use client"

import { useActionData, Form } from "@remix-run/react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { LucideX, LucideCheck, LucideLoader, LucideAlertCircle, LucideChevronDown } from "lucide-react"

interface Domain {
  id: number
  name: string
}

interface AddResourceProps {
  domains: Domain[]
  onClose: () => void
}

interface ActionData {
  errors?: {
    domainId?: string
    websiteName?: string
    websiteUrl?: string
    memberName?: string
  }
  success?: boolean
}

export default function AddResource({ domains, onClose }: AddResourceProps) {
  const actionData = useActionData<ActionData>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)
  const [typedTitle, setTypedTitle] = useState("")
  const fullTitle = "Add Learning Resource"
  const [cursorVisible, setCursorVisible] = useState(true)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const formContainerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null);

  // Typing animation for title
  useEffect(() => {
    if (typedTitle.length < fullTitle.length) {
      const timeout = setTimeout(() => {
        setTypedTitle(fullTitle.slice(0, typedTitle.length + 1))
      }, 50)
      return () => clearTimeout(timeout)
    }
  }, [typedTitle, fullTitle])

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  // Check if form needs scroll indicator
  useEffect(() => {
    const checkScroll = () => {
      if (formContainerRef.current) {
        const { scrollHeight, clientHeight } = formContainerRef.current
        setShowScrollIndicator(scrollHeight > clientHeight)
      }
    }

    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [])

  useEffect(() => {
    if (actionData?.success) {
      formRef.current?.reset();
      onClose();
      // You might want to add a toast notification here
    }
  }, [actionData, onClose]);

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }

  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  }

  const formFieldVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.3,
      },
    }),
  }

  const scrollToBottom = () => {
    if (formContainerRef.current) {
      formContainerRef.current.scrollTo({
        top: formContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-[#0a0a0a] rounded-xl shadow-2xl w-full max-w-2xl border border-[#00ff9d]/50 relative overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Terminal window header - fixed */}
          <div className="sticky top-0 z-10 bg-[#0a0a0a]">
            <div className="h-8 bg-[#111] border-b border-[#00ff9d]/30 flex items-center px-3">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full bg-red-500 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={onClose}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onClose()
                    }
                  }}
                  aria-label="Close"
                ></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 text-xs text-[#00ff9d]/70">
                user@bytebashblitz:~/add-resource
              </div>
            </div>

            <div className="p-6 pb-4 flex justify-between items-center border-b border-[#00ff9d]/20">
              <div className="flex items-center">
                <span className="text-[#00ff9d]/70 mr-2">$</span>
                <h1 className="text-2xl font-bold text-[#00ff9d]">
                  {typedTitle}
                  <span
                    className={`ml-1 inline-block h-5 w-2.5 bg-[#00ff9d] ${
                      cursorVisible && typedTitle.length >= fullTitle.length ? "opacity-100" : "opacity-0"
                    }`}
                  ></span>
                </h1>
              </div>
              <motion.button
                onClick={onClose}
                className="text-[#00ff9d]/70 hover:text-[#00ff9d] bg-[#111] h-8 w-8 rounded-md flex items-center justify-center"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 50, 50, 0.2)" }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close"
              >
                <LucideX size={18} />
              </motion.button>
            </div>

            <div className="px-6 pt-4 terminal-text text-sm">
              <span className="text-[#00ff9d]/70">$</span> ./submit-resource.sh --interactive
            </div>

            {/* Scroll indicator */}
            {showScrollIndicator && (
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[#00ff9d]/70 animate-bounce z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <LucideChevronDown size={20} />
              </motion.div>
            )}
          </div>

          {/* Scrollable form container */}
          <div
            ref={formContainerRef}
            className="overflow-y-auto flex-grow px-6 py-4 custom-scrollbar"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#00ff9d30 transparent",
            }}
          >
            <Form method="post" className="space-y-6" id="resource-form" onSubmit={() => setIsSubmitting(true)}>
              <motion.div
                variants={formFieldVariants}
                initial="hidden"
                animate="visible"
                custom={0}
                className="form-field"
              >
                <div className="flex items-center mb-1">
                  <span className="text-[#00ff9d]/70 mr-2 text-sm">$</span>
                  <label htmlFor="domainId" className="block text-sm font-medium text-[#00ff9d] mb-1">
                    SELECT_DOMAIN
                  </label>
                </div>
                <div className="relative">
                  <select
                    id="domainId"
                    name="domainId"
                    className={`w-full px-4 py-3 border rounded-md shadow-sm bg-[#111] text-[#00ff9d] 
                      focus:outline-none focus:ring-1 transition-all
                      ${
                        activeField === "domainId"
                          ? "border-[#00ff9d] ring-[#00ff9d]/30"
                          : "border-[#00ff9d]/30 hover:border-[#00ff9d]/50"
                      }
                      ${actionData?.errors?.domainId ? "border-[#ff5555]" : ""}`}
                    defaultValue=""
                    onFocus={() => setActiveField("domainId")}
                    onBlur={() => setActiveField(null)}
                  >
                    <option value="" disabled className="text-gray-500">
                      Select a domain
                    </option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id} className="bg-[#111] text-[#00ff9d]">
                        {domain.name}
                      </option>
                    ))}
                  </select>
                  {activeField === "domainId" && (
                    <motion.div
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ff9d]/70"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className="inline-block animate-pulse">_</span>
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {actionData?.errors?.domainId && (
                    <motion.div
                      className="mt-2 flex items-start gap-2 text-[#ff5555] text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <LucideAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <p>{actionData.errors.domainId}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                variants={formFieldVariants}
                initial="hidden"
                animate="visible"
                custom={1}
                className="form-field"
              >
                <div className="flex items-center mb-1">
                  <span className="text-[#00ff9d]/70 mr-2 text-sm">$</span>
                  <label htmlFor="websiteName" className="block text-sm font-medium text-[#00ff9d]">
                    RESOURCE_NAME
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="websiteName"
                    name="websiteName"
                    className={`w-full px-4 py-3 border rounded-md shadow-sm bg-[#111] text-[#00ff9d] 
                      focus:outline-none focus:ring-1 transition-all
                      ${
                        activeField === "websiteName"
                          ? "border-[#00ff9d] ring-[#00ff9d]/30"
                          : "border-[#00ff9d]/30 hover:border-[#00ff9d]/50"
                      }
                      ${actionData?.errors?.websiteName ? "border-[#ff5555]" : ""}`}
                    placeholder="e.g., MDN Web Docs"
                    onFocus={() => setActiveField("websiteName")}
                    onBlur={() => setActiveField(null)}
                  />
                  {activeField === "websiteName" && (
                    <motion.div
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ff9d]/70"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className="inline-block animate-pulse">_</span>
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {actionData?.errors?.websiteName && (
                    <motion.div
                      className="mt-2 flex items-start gap-2 text-[#ff5555] text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <LucideAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <p>{actionData.errors.websiteName}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                variants={formFieldVariants}
                initial="hidden"
                animate="visible"
                custom={2}
                className="form-field"
              >
                <div className="flex items-center mb-1">
                  <span className="text-[#00ff9d]/70 mr-2 text-sm">$</span>
                  <label htmlFor="websiteUrl" className="block text-sm font-medium text-[#00ff9d]">
                    RESOURCE_URL
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="url"
                    id="websiteUrl"
                    name="websiteUrl"
                    className={`w-full px-4 py-3 border rounded-md shadow-sm bg-[#111] text-[#00ff9d] 
                      focus:outline-none focus:ring-1 transition-all
                      ${
                        activeField === "websiteUrl"
                          ? "border-[#00ff9d] ring-[#00ff9d]/30"
                          : "border-[#00ff9d]/30 hover:border-[#00ff9d]/50"
                      }
                      ${actionData?.errors?.websiteUrl ? "border-[#ff5555]" : ""}`}
                    placeholder="https://developer.mozilla.org"
                    onFocus={() => setActiveField("websiteUrl")}
                    onBlur={() => setActiveField(null)}
                  />
                  {activeField === "websiteUrl" && (
                    <motion.div
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ff9d]/70"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className="inline-block animate-pulse">_</span>
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {actionData?.errors?.websiteUrl && (
                    <motion.div
                      className="mt-2 flex items-start gap-2 text-[#ff5555] text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <LucideAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <p>{actionData.errors.websiteUrl}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                variants={formFieldVariants}
                initial="hidden"
                animate="visible"
                custom={3}
                className="border-t border-[#00ff9d]/20 pt-6"
              >
                <div className="flex items-center mb-4">
                  <span className="text-[#00ff9d]/70 mr-2 text-sm">$</span>
                  <h2 className="text-lg font-medium text-[#00ff9d]">USER_INFO</h2>
                </div>

                <div className="form-field">
                  <div className="flex items-center mb-1">
                    <span className="text-[#00ff9d]/70 mr-2 text-sm">$</span>
                    <label htmlFor="memberName" className="block text-sm font-medium text-[#00ff9d]">
                      YOUR_NAME
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      id="memberName"
                      name="memberName"
                      className={`w-full px-4 py-3 border rounded-md shadow-sm bg-[#111] text-[#00ff9d] 
                        focus:outline-none focus:ring-1 transition-all
                        ${
                          activeField === "memberName"
                            ? "border-[#00ff9d] ring-[#00ff9d]/30"
                            : "border-[#00ff9d]/30 hover:border-[#00ff9d]/50"
                        }
                        ${actionData?.errors?.memberName ? "border-[#ff5555]" : ""}`}
                      placeholder="Your name"
                      onFocus={() => setActiveField("memberName")}
                      onBlur={() => setActiveField(null)}
                    />
                    {activeField === "memberName" && (
                      <motion.div
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ff9d]/70"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <span className="inline-block animate-pulse">_</span>
                      </motion.div>
                    )}
                  </div>
                  <AnimatePresence>
                    {actionData?.errors?.memberName && (
                      <motion.div
                        className="mt-2 flex items-start gap-2 text-[#ff5555] text-sm"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <LucideAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <p>{actionData.errors.memberName}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Add some extra space at the bottom for better scrolling */}
              <div className="h-4"></div>
            </Form>
          </div>

          {/* Terminal footer - fixed */}
          <div className="sticky bottom-0 bg-[#0a0a0a] border-t border-[#00ff9d]/20 p-6">
            <div className="flex justify-between">
              <motion.button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-[#00ff9d]/50 rounded-md text-[#00ff9d] bg-[#111] 
                  hover:bg-[#1a1a1a] hover:border-[#00ff9d] transition-all flex items-center gap-2"
                whileHover={{ scale: 1.02, boxShadow: "0 0 8px rgba(0, 255, 157, 0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                <LucideX size={16} />
                <span>CANCEL</span>
              </motion.button>

              <motion.button
                type="submit"
                form="resource-form"
                className="px-6 py-2.5 bg-[#00ff9d] text-black rounded-md hover:bg-[#00cc7d] 
                  disabled:opacity-50 disabled:hover:bg-[#00ff9d] transition-all flex items-center gap-2 font-medium"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02, boxShadow: "0 0 12px rgba(0, 255, 157, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                onClick={scrollToBottom}
              >
                {isSubmitting ? (
                  <>
                    <LucideLoader size={16} className="animate-spin" />
                    <span>PROCESSING...</span>
                  </>
                ) : (
                  <>
                    <LucideCheck size={16} />
                    <span>SUBMIT</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Terminal decoration - command line at bottom */}
            <div className="mt-4 text-[#00ff9d]/70 text-sm flex items-center">
              <span className="mr-2">$</span>
              <span className="animate-pulse">_</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
