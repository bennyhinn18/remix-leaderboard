
import { json, redirect, type ActionFunctionArgs ,type LoaderFunctionArgs } from "@remix-run/node"
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react"
import { createServerSupabase } from "~/utils/supabase.server"
import type { Member } from "~/types/database"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, Users, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useState } from "react"
import { isOrganiser } from "~/utils/currentUser"


export const loader = async ({ request }: LoaderFunctionArgs) => {
    
    const roleData = await isOrganiser(request);
    console.log("Role Data",roleData);  
    
    if (!roleData) {
        console.log("Not an organiser or mentor");
        return redirect("/not-authorised");
    }
    
    const response = new Response();
    
    const supabase = createServerSupabase(request, response);
    const { data: members } = await supabase.from("members").select("*").order("name");
  
    return json({ members });
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const memberId = formData.get("memberId");
    const points = formData.get("points");
    const action = formData.get("action");
    const response = new Response();
    const supabase = createServerSupabase(request, response);

    if (!memberId || !points || !action) {
        return json({ error: "Missing required fields" });
    }

    const { data: currentPoints, error: pointsError } = await supabase
        .from("members")
        .select("bash_points")
        .eq("id", memberId)
        .single();

    if (pointsError || !currentPoints) {
        return json({ error: "Failed to fetch current points" });
    }

    const newPoints =
        action === "add"
            ? (currentPoints.bash_points || 0) + Number(points)
            : (currentPoints.bash_points || 0) - Number(points);

    const { error } = await supabase
        .from("members")
        .update({ bash_points: newPoints })
        .eq("id", memberId);

    if (error) {
        return json({ error: error.message });
    }

    return json({ success: true });
}

export default function ManagePoints() {
    const { members } = useLoaderData<typeof loader>();
    const actionData = useActionData<{ error?: string; success?: boolean }>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-12 px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4"
                    >
                        <Users className="w-8 h-8 text-blue-400" />
                    </motion.div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Manage Points
                    </h1>
                    <p className="text-gray-400 mt-2">Reward or deduct points from members</p>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                >
                    <Form method="post" className="space-y-6">
                        {/* Member Selection */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
                            <label htmlFor="memberId" className="block text-sm font-medium text-gray-300">
                                Select Member
                            </label>
                            <div className="relative">
                                <select
                                    id="memberId"
                                    name="memberId"
                                    required
                                    onChange={(e) => {
                                        const member = members?.find((m) => m.id === Number(e.target.value));
                                        setSelectedMember(member || null);
                                    }}
                                    className="block w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white 
                                        placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none"
                                >
                                    <option value="" className="bg-gray-800">Select a member...</option>
                                    {members?.map((member: Member) => (
                                        <option key={member.id} value={member.id} className="bg-gray-800">
                                            {member.name} (Current: {member.bash_points} pts)
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <Users className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Selected Member Card */}
                        <AnimatePresence mode="wait">
                            {selectedMember && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-4 rounded-lg bg-white/5 border border-white/10"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                            <span className="text-xl font-bold">{selectedMember.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-white">{selectedMember.name}</h3>
                                            <p className="text-sm text-gray-400">Current Points: {selectedMember.bash_points}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Points Input */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-2"
                        >
                            <label htmlFor="points" className="block text-sm font-medium text-gray-300">
                                Points
                            </label>
                            <input
                                type="number"
                                id="points"
                                name="points"
                                min="1"
                                required
                                className="block w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white 
                                    placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Enter points amount"
                            />
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                name="action"
                                value="add"
                                disabled={isSubmitting}
                                className="relative flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r 
                                    from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 
                                    focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50 transition-all duration-200"
                            >
                                <AnimatePresence mode="wait">
                                    {isSubmitting ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Add Points
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                name="action"
                                value="subtract"
                                disabled={isSubmitting}
                                className="relative flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r 
                                    from-red-500 to-rose-600 text-white font-medium hover:from-red-600 hover:to-rose-700 
                                    focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 transition-all duration-200"
                            >
                                <AnimatePresence mode="wait">
                                    {isSubmitting ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            <Minus className="w-5 h-5" />
                                            Subtract Points
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </motion.div>
                    </Form>

                    {/* Feedback Messages */}
                    <AnimatePresence mode="wait">
                        {actionData?.error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400"
                            >
                                <AlertCircle className="w-5 h-5" />
                                {actionData.error}
                            </motion.div>
                        )}
                        {actionData?.success && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2 text-green-400"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Points updated successfully!
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    );
}