"use client"

import { useActionData, Form } from "@remix-run/react"
import { motion } from "framer-motion"
import { Crown, Star, Users, Award } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"

interface ActionData {
  success?: boolean;
  error?: string;
}

export function UpdateChampionsForm() {
  const actionData = useActionData<ActionData>()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition flex items-center">
          <span>Update Champions</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-5 h-5 ml-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.582M4 4l16 16" />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-400">Update Monthly Champions</DialogTitle>
        </DialogHeader>
        <Form method="post" className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="best_basher" className="text-white flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                Best Basher
              </Label>
              <Input
                id="best_basher"
                name="best_basher"
                placeholder="Enter basher name"
                className="bg-white/5 border-white/10 text-white"
                required
              />
              <Input
                id="basher_clan_name"
                name="basher_clan_name"
                placeholder="Enter basher's clan"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="best_leader" className="text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-400" />
                Best Leader
              </Label>
              <Input
                id="best_leader"
                name="best_leader"
                placeholder="Enter leader name"
                className="bg-white/5 border-white/10 text-white"
                required
              />
              <Input
                id="leader_clan_name"
                name="leader_clan_name"
                placeholder="Enter leader's clan"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="best_clan" className="text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-green-400" />
                Best Clan
              </Label>
              <Input
                id="best_clan"
                name="best_clan"
                placeholder="Enter clan name"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="best_profile" className="text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-pink-400" />
                Best Profile
              </Label>
              <Input
                id="best_profile"
                name="best_profile"
                placeholder="Enter profile name"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors">
              Update Champions
            </Button>
          </motion.div>

          {actionData?.error && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm">
              {actionData.error}
            </motion.p>
          )}
          {actionData?.success && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-green-400 text-sm">
              Champions updated successfully!
            </motion.p>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  )
}

