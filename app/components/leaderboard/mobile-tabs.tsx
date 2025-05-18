import { Trophy, Book, Code, MessageCircle, Feather, Building, Github } from "lucide-react";
import { motion } from "framer-motion";

interface MobileTabsProps {
  activeTab: string;
  setActiveTab: (tab: "overall" | "bashclan" | "github" | "leetcode" | "duolingo" | "discord" | "books") => void;
}

export default function MobileTabs({ activeTab, setActiveTab }: MobileTabsProps) {
  const tabs = [
    {
      id: "overall",
      label: "Overall", 
      icon: <Trophy className="w-4 h-4" />
    },
    {
      id: "bashclan",
      label: "Clan", 
      icon: <Building className="w-4 h-4" />
    },
    {
      id: "github",
      label: "GitHub", 
      icon: <Github className="w-4 h-4" />
    },
    {
      id: "leetcode",
      label: "LeetCode", 
      icon: <Code className="w-4 h-4" />
    },
    {
      id: "duolingo",
      label: "Duolingo", 
      icon: <Feather className="w-4 h-4" />
    },
    {
      id: "discord",
      label: "Discord", 
      icon: <MessageCircle className="w-4 h-4" />
    },
    {
      id: "books",
      label: "Books", 
      icon: <Book className="w-4 h-4" />
    }
  ];

  return (
    <div className="w-full overflow-x-auto pb-2 no-scrollbar px-2 -mx-2">
      <div className="flex gap-2 min-w-max snap-x snap-mandatory">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setActiveTab(tab.id as any);
              localStorage.setItem("activeTab", tab.id);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm snap-center flex-shrink-0 ${
              activeTab === tab.id 
                ? "bg-blue-500 text-white" 
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}