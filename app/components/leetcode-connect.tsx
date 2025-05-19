import { useState } from "react";
import { Form, useFetcher } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, CheckCircle, ChevronRight, XCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";

interface LeetCodeConnectProps {
  hasLeetCodeUsername: boolean;
  username?: string;
  memberId?: number;
}

export default function LeetCodeConnect({ hasLeetCodeUsername, username, memberId }: LeetCodeConnectProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leetcodeUsername, setLeetcodeUsername] = useState(username || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const fetcher = useFetcher();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationError("");
    
    // Validate username format
    if (!leetcodeUsername.trim()) {
      setValidationError("Please enter a valid LeetCode username");
      setIsSubmitting(false);
      return;
    }
    
    // Check if username exists using LeetCode API
    try {
      const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${leetcodeUsername}/`);
      const data=await response.json();
      
    if (data.status === "error") {
        setValidationError("LeetCode username not found. Please check and try again.");
        setIsSubmitting(false);
        return;
    }
      
      
      // Submit the update via fetcher
      fetcher.submit(
        { 
          leetcode_username: leetcodeUsername,
          member_id: memberId?.toString() || ""
        },
        { method: "post", action: "/api/update-leetcode" }
      );
      
      setSuccessMessage("LeetCode username successfully connected!");
      
      // Close dialog after success
      setTimeout(() => {
        setIsDialogOpen(false);
        setIsSubmitting(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error validating LeetCode username:", error);
      setValidationError("Could not verify username. Please try again later.");
      setIsSubmitting(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className={`rounded-xl p-4 flex items-center justify-between ${
        hasLeetCodeUsername 
          ? "bg-green-500/10 border border-green-500/30" 
          : "bg-blue-500/10 border border-blue-500/30"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            hasLeetCodeUsername ? "bg-green-500/20" : "bg-blue-500/20"
          }`}>
            <Code2 className={`h-5 w-5 ${
              hasLeetCodeUsername ? "text-green-400" : "text-blue-400"
            }`} />
          </div>
          <div>
            <h3 className="font-medium">
              {hasLeetCodeUsername ? "LeetCode Connected" : "Connect LeetCode"}
            </h3>
            <p className="text-sm text-gray-400">
              {hasLeetCodeUsername 
                ? "Your LeetCode progress is being tracked" 
                : "Add your LeetCode username to track your progress"}
            </p>
          </div>
        </div>
        
        <Button
          variant={hasLeetCodeUsername ? "ghost" : "outline"}
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className={hasLeetCodeUsername ? "text-green-400" : "text-blue-400"}
        >
          {hasLeetCodeUsername ? "View" : "Connect"}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900 border border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-blue-400" />
              {hasLeetCodeUsername ? "Your LeetCode Profile" : "Connect Your LeetCode Account"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {hasLeetCodeUsername 
                ? "Your LeetCode progress is helping you climb the leaderboard" 
                : "Add your LeetCode username to track your coding progress and compete on the leaderboard"}
            </DialogDescription>
          </DialogHeader>
          
          {!hasLeetCodeUsername ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-2">
                  Enter your LeetCode username to connect your account
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Your LeetCode username"
                    value={leetcodeUsername}
                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? "Verifying..." : "Connect"}
                  </Button>
                </div>
                
                {validationError && (
                  <div className="mt-2 text-red-400 text-sm flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {validationError}
                  </div>
                )}
                
                {successMessage && (
                  <div className="mt-2 text-green-400 text-sm flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {successMessage}
                  </div>
                )}
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 text-sm">
                <h4 className="font-medium mb-2">Benefits of connecting your LeetCode account:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                    <span>Track your problem-solving progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                    <span>Compete on the LeetCode leaderboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                    <span>Earn additional Bash Points for consistent practice</span>
                  </li>
                </ul>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-blue-400" />
                    <span className="font-medium">{leetcodeUsername}</span>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                    Connected
                  </Badge>
                </div>
              </div>
              
              <div className="text-sm text-gray-400">
                Your LeetCode progress is now being tracked. Keep solving problems to improve your ranking!
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    fetcher.submit(
                      { 
                        leetcode_username: "",
                        member_id: memberId?.toString() || ""
                      },
                      { method: "post", action: "/api/update-leetcode" }
                    );
                    setIsDialogOpen(false);
                  }}
                >
                  Disconnect
                </Button>
                
                <Button 
                  variant="outline"
                  className="border-gray-700"
                  onClick={() => {
                    window.open(`https://leetcode.com/${leetcodeUsername}`, '_blank');
                  }}
                >
                  View LeetCode Profile
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
