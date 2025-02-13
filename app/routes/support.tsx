"use client"

import { json, type ActionFunctionArgs } from "@remix-run/node"
import { Form, useActionData, useNavigation } from "@remix-run/react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import {
  HelpCircle,
  Mail,
  MessageSquare,
  Book,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
} from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Card } from "~/components/ui/card"

const faqs = [
  {
    question: "How do I earn points?",
    answer:
      "You can earn points through various activities: completing daily challenges, participating in weekly bashes, contributing to community projects, and maintaining coding streaks on platforms like GitHub and LeetCode.",
  },
  {
    question: "What are the different basher levels?",
    answer:
      "There are three main levels: Gold (0-2000 points), Platinum (2000-2400 points), and Diamond (2400+ points). Each level unlocks new features and privileges in the community.",
  },
  {
    question: "How do clans work?",
    answer:
      "Clans are collaborative groups of bashers who work together on projects and challenges. You can join a clan or create your own once you reach the Platinum level. Clans compete in monthly tournaments and special events.",
  },
  {
    question: "What are coding companions?",
    answer:
      "Coding companions are AI-powered assistants that help you with coding challenges, provide learning resources, and offer personalized feedback on your progress. Each companion specializes in different programming domains.",
  },
  {
    question: "How do I redeem my credits?",
    answer:
      "Credits can be redeemed in the marketplace for profile customizations, exclusive challenges, mentor sessions, and special event access. Visit the Credits page to see all available rewards.",
  },
]

const resources = [
  {
    title: "Documentation",
    description: "Comprehensive guides",
    icon: Book,
    href: "https://basher-handbook.notion.site/",
  },
  {
    title: "Community Chat",
    description: "Join our Discord community",
    icon: MessageSquare,
    href: "https://discord.gg/bytebash",
  },
  {
    title: "Email Support",
    description: "Get help from our support team",
    icon: Mail,
    href: "mailto:support@bytebash.dev",
  },
]

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const email = formData.get("email")
  const subject = formData.get("subject")
  const message = formData.get("message")

  if (!email || !subject || !message) {
    return json({ error: "All fields are required" })
  }

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  try {
    // Here you would typically send the support request to your backend
    return json({ success: true })
  } catch (error) {
    return json({ error: "Failed to send message. Please try again." })
  }
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-b border-white/10 last:border-0"
    >
      <motion.button
        className="w-full py-4 flex items-center justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-white">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-blue-400" />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-gray-400">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Support() {
  const actionData = useActionData<{ error?: string; success?: boolean }>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <Button variant="ghost" onClick={() => window.history.back()} className="absolute top-10 left-4 gap-6">
          <ChevronLeft className="w-6 h-6 rotate-90 text-blue-400" />
          <h1 className="text-2xl font-bold">Support Center</h1>
        </Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto"
          >
            <HelpCircle className="w-8 h-8 text-blue-400" />
          </motion.div>
          <p className="text-gray-400 max-w-xl mx-auto">
            Get help with your ByteBash journey. Browse our FAQ, check out our resources, or reach out to our support
            team.
          </p>
        </motion.div>

        {/* Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {resources.map((resource) => (
            <motion.a
              key={resource.title}
              href={resource.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group"
            >
              <Card className="p-6 bg-gradient-to-br from-white/5 to-white/0 border-white/10 hover:border-blue-500/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    <resource.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white flex items-center gap-2">
                      {resource.title}
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </h3>
                    <p className="text-sm text-gray-400">{resource.description}</p>
                  </div>
                </div>
              </Card>
            </motion.a>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <Card className="bg-white/5 border-white/10 p-4">
            <div className="divide-y divide-white/10">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold">Contact Support</h2>
          <Card className="p-6 bg-white/5 border-white/10">
            <Form method="post" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="What's your question about?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  className="bg-white/5 border-white/10 text-white min-h-[150px]"
                  placeholder="Describe your issue in detail..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Message"}
              </Button>

              <AnimatePresence mode="wait">
                {actionData?.error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {actionData.error}
                  </motion.div>
                )}
                {actionData?.success && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-green-400 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Message sent successfully! We&apos;ll get back to you soon.
                  </motion.div>
                )}
              </AnimatePresence>
            </Form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

