import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams, Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { 
  ChevronLeft, Star, Award, Users, Rocket, 
  PartyPopper, Medal, Sparkles, Search, X, Check,
  ExternalLink
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

interface Rookie {
  id: number;
  name: string;
  team: string;
  isNew: boolean;
}

export function loader({ params }: LoaderFunctionArgs) {
  const memberId = params.id ? parseInt(params.id, 10) : null;
  
  // List of rookies who are now becoming bashers - ONLY official bashers
  const rookiesToBashers: Rookie[] = [
    { id: 1, name: "Aadhithya Mahesh", team: "BC2", isNew: true },
    { id: 2, name: "Abishake", team: "BC4", isNew: true },
    { id: 3, name: "Akshaya A", team: "BC3", isNew: true },
    { id: 4, name: "Akshaya Libin Sibcy", team: "BC3", isNew: true },
    { id: 5, name: "Alisha", team: "BC1", isNew: true },
    { id: 6, name: "Ancy", team: "BC2", isNew: true },
    { id: 7, name: "Andrea Betrina", team: "BC2", isNew: true },
    { id: 8, name: "Anitus", team: "BC1", isNew: true },
    { id: 9, name: "Aparna Suresh", team: "BC3", isNew: true },
    { id: 10, name: "Arthi", team: "BC1", isNew: true },
    { id: 11, name: "Buele Sujarsha", team: "BC1", isNew: true },
    { id: 12, name: "Danu Peter", team: "BC4", isNew: true },
    { id: 13, name: "Dhanush", team: "BC4", isNew: true },
    { id: 14, name: "Geo Nithin", team: "BC2", isNew: true },
    { id: 15, name: "Lifnan Shijo", team: "BC1", isNew: true },
    { id: 16, name: "Muhilan Raj", team: "BC4", isNew: true },
    { id: 17, name: "Nithisha", team: "BC3", isNew: true },
    { id: 18, name: "Samuel Morris", team: "BC2", isNew: true },
    { id: 19, name: "Shailu Mirsha", team: "BC1", isNew: true },
    { id: 20, name: "Shivani", team: "BC3", isNew: true },
    { id: 21, name: "Sowmiya", team: "BC2", isNew: true },
  ];

  // Find the specified member if ID is provided
  const selectedMember = memberId 
    ? rookiesToBashers.find(rookie => rookie.id === memberId) || null
    : null;

  return json({ 
    rookiesToBashers,
    selectedMember
  });
}

export default function RookieBashers() {
  const { rookiesToBashers, selectedMember } = useLoaderData<typeof loader>();
  const params = useParams();
  const isPersonalizedView = !!params.id;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTeamFilter, setActiveTeamFilter] = useState<string | null>(null);
  const [highlightedMember, setHighlightedMember] = useState<number | null>(
    selectedMember ? selectedMember.id : null
  );
  const [showCongratsBanner, setShowCongratsBanner] = useState(!isPersonalizedView);
  const [showPersonalizedBanner, setShowPersonalizedBanner] = useState(isPersonalizedView);
  
  // Team colors
  const teamColors = {
    "BC1": {
      bg: "from-blue-500/20 to-blue-600/20",
      border: "border-blue-500/30",
      text: "text-blue-400",
      button: "bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30",
    },
    "BC2": {
      bg: "from-purple-500/20 to-purple-600/20",
      border: "border-purple-500/30",
      text: "text-purple-400",
      button: "bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30",
    },
    "BC3": {
      bg: "from-green-500/20 to-green-600/20",
      border: "border-green-500/30",
      text: "text-green-400",
      button: "bg-green-500/20 border-green-500/30 hover:bg-green-500/30",
    },
    "BC4": {
      bg: "from-amber-500/20 to-amber-600/20",
      border: "border-amber-500/30",
      text: "text-amber-400",
      button: "bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30",
    },
  };

  // Filter members based on search and team filter
  const filteredMembers = rookiesToBashers.filter(member => {
    // If in personalized view and search is empty, only show the selected member
    if (isPersonalizedView && !searchTerm && !activeTeamFilter && selectedMember) {
      return member.id === selectedMember.id;
    }
    
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = activeTeamFilter ? member.team === activeTeamFilter : true;
    
    return matchesSearch && matchesTeam;
  });

  // Sort members alphabetically
  const sortedMembers = [...filteredMembers].sort((a, b) => a.name.localeCompare(b.name));

  // Trigger confetti effect on load
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: isPersonalizedView ? 150 : 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4299E1', '#9F7AEA', '#48BB78', '#F6AD55']
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white">
      {/* Animated particles in the background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/20"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              scale: [0.5, Math.random() + 0.5, 0.5],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link 
              to="/leaderboard"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Leaderboard
            </Link>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 lg:text-4xl">
                Rookie to Bashers
              </h1>
              <p className="text-purple-300/80 text-sm">2024–28 Batch</p>
            </div>
            
            <Link 
              to="/rising-bash"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              View Rising Bash
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Personalized banner for individual member */}
        <AnimatePresence>
          {showPersonalizedBanner && selectedMember && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="relative overflow-hidden mb-8"
            >
              <motion.div 
                className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-md rounded-xl p-6 border border-yellow-500/30 relative overflow-hidden"
                initial={{ y: -20 }}
                animate={{ 
                  y: 0,
                  transition: { 
                    type: "spring",
                    stiffness: 300,
                    damping: 24
                  }
                }}
              >
                <button 
                  onClick={() => setShowPersonalizedBanner(false)}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <PartyPopper className="w-8 h-8 text-amber-400 mr-2" />
                    <h2 className="text-2xl font-bold">
                      Congratulations {selectedMember.name}!
                    </h2>
                  </div>
                  
                  <p className="text-center text-gray-200 max-w-3xl mx-auto">
                    You've been officially selected to become a Basher! Your hard work, dedication, and positive attitude have impressed everyone in the community.
                  </p>
                  
                  <div className="mt-6 text-center">
                    <motion.div
                      className="inline-block"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-1.5 text-base border-none text-white">
                        <Check className="w-4 h-4 mr-2" />
                        Welcome to the Team!
                      </Badge>
                    </motion.div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 blur-xl"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/10 blur-xl"></div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Regular congratulations banner (only shown in non-personalized view) */}
        <AnimatePresence>
          {showCongratsBanner && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="relative overflow-hidden"
            >
              <motion.div 
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-6 mb-8 border border-purple-500/30 relative overflow-hidden"
                initial={{ y: -20 }}
                animate={{ 
                  y: 0,
                  transition: { 
                    type: "spring",
                    stiffness: 300,
                    damping: 24
                  }
                }}
              >
                <button 
                  onClick={() => setShowCongratsBanner(false)}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <PartyPopper className="w-8 h-8 text-pink-400 mr-2" />
                    <h2 className="text-2xl font-bold">Congratulations, Bashers of the 2024–28 Batch!</h2>
                  </div>
                  
                  <div className="text-center text-gray-200 max-w-3xl mx-auto space-y-4">
                    <p>
                      So excited to welcome you officially into the Byte Bash Blitz community! Your consistent effort and eagerness in completing all assigned tasks truly reflect your drive to grow, and this achievement is something to be proud of.
                    </p>
                    <p>
                      But remember, this is just the beginning of your journey. Becoming a Basher isn't the final goal, it's the starting point. From here, your contributions and involvement should only grow stronger. We encourage you to engage actively in community initiatives, interact with senior Bashers and make the most of this space we proudly call our second home.
                    </p>
                    <p>
                      This is a place where your curiosity, willingness to learn and spirit of collaboration will shape your growth. Don't hesitate to ask questions, explore new ideas, and push your limits.
                    </p>
                    <p>
                      Also, a gentle reminder, continued involvement is key. A drop in participation may lead to your spot being offered to someone from the "Rising Bash" list, who are equally eager to contribute. So stay consistent, stay curious and keep progressing! Once again, congratulations and welcome aboard, Bashers!
                    </p>
                    <p className="italic text-right">
                      Organisers,<br/>
                      Byte Bash Blitz
                    </p>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <motion.div
                      className="inline-block"
                      animate={{ 
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1.5 text-base border-none">
                        <Check className="w-4 h-4 mr-2" /> Welcome to BYTE BASH BLITZ!
                      </Badge>
                    </motion.div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 blur-xl"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 blur-xl"></div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Link to Rising Bash page */}
        <div className="mb-8">
          <div className="bg-blue-500/10 backdrop-blur-md rounded-xl p-6 border border-blue-500/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-blue-300 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Rising Bash Members
                </h3>
                <p className="text-gray-300 mt-1">
                  Check out our Rising Bash members who've shown great potential and might become full Bashers in the future!
                </p>
              </div>
              <Link 
                to="/rising-bash" 
                className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 px-6 py-2 rounded-full flex items-center gap-2 transition-colors"
              >
                View Rising Bash
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Search and filter */}
        <div className="mb-8">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border-white/10 pl-10 text-white"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTeamFilter(null)}
                  className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                    !activeTeamFilter ? 
                    'bg-white/10 border-white/30 text-white' : 
                    'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  All Teams
                </button>
                
                {Object.keys(teamColors).map((team) => (
                  <button
                    key={team}
                    onClick={() => setActiveTeamFilter(team === activeTeamFilter ? null : team)}
                    className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                      activeTeamFilter === team ? 
                      teamColors[team as keyof typeof teamColors].button : 
                      'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isPersonalizedView && selectedMember && !searchTerm && !activeTeamFilter 
              ? "Congratulations on Your Achievement!"
              : "Official Bashers"}
          </h2>
          
          {sortedMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedMembers.map((member, index) => {
                const isSelected = selectedMember && member.id === selectedMember.id;
                const shouldHighlight = isSelected || highlightedMember === member.id;
                
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: isSelected ? 1.02 : 1
                    }}
                    transition={{ 
                      delay: index * 0.05,
                      duration: 0.5
                    }}
                    whileHover={{ scale: 1.02 }}
                    className="relative"
                    onMouseEnter={() => setHighlightedMember(member.id)}
                    onMouseLeave={() => setHighlightedMember(null)}
                  >
                    <div className={`h-full backdrop-blur-md rounded-xl p-5 border overflow-hidden ${
                      isSelected 
                        ? 'ring-2 ring-yellow-400 border-yellow-400/30 bg-gradient-to-r from-yellow-500/10 to-amber-500/5'
                        : shouldHighlight 
                          ? 'ring-2 ring-purple-400 border-transparent bg-white/5'
                          : 'border-white/10 bg-white/5'
                    }`}>
                      {member.isNew && (
                        <Badge className="absolute top-3 right-3 bg-pink-500/20 text-pink-400 border border-pink-500/30">
                          New
                        </Badge>
                      )}
                      
                      {isSelected && (
                        <Badge className="absolute top-3 right-16 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          <Star className="w-3 h-3 mr-1" /> You
                        </Badge>
                      )}
                      
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isSelected
                            ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30'
                            : `${teamColors[member.team as keyof typeof teamColors].bg} ${teamColors[member.team as keyof typeof teamColors].border}`
                        }`}>
                          <span className="font-bold">{member.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{member.name}</h3>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Badge className={`${teamColors[member.team as keyof typeof teamColors].button} ${teamColors[member.team as keyof typeof teamColors].text}`}>
                          {member.team}
                        </Badge>
                        
                        <div className="flex -space-x-1">
                          <motion.div
                            animate={shouldHighlight ? {
                              scale: [1, 1.2, 1],
                              rotate: [0, 10, -10, 0]
                            } : {}}
                            transition={{ duration: 0.6, repeat: isSelected ? Infinity : 0, repeatDelay: isSelected ? 2 : 0 }}
                          >
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                          </motion.div>
                          <motion.div
                            animate={shouldHighlight ? {
                              scale: [1, 1.2, 1],
                              rotate: [0, -10, 10, 0]
                            } : {}}
                            transition={{ duration: 0.6, delay: 0.1, repeat: isSelected ? Infinity : 0, repeatDelay: isSelected ? 2 : 0 }}
                          >
                            <Medal className="w-5 h-5 text-purple-400" />
                          </motion.div>
                          <motion.div
                            animate={shouldHighlight ? {
                              scale: [1, 1.2, 1],
                              rotate: [0, 10, -10, 0]
                            } : {}}
                            transition={{ duration: 0.6, delay: 0.2, repeat: isSelected ? Infinity : 0, repeatDelay: isSelected ? 2 : 0 }}
                          >
                            <Rocket className="w-5 h-5 text-blue-400" />
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Animated gradient overlay when selected or hovered */}
                      {shouldHighlight && (
                        <motion.div 
                          className="absolute inset-0 -z-10 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className={`absolute inset-0 ${
                            isSelected 
                              ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 animate-gradient-x-slow' 
                              : 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-gradient-x'
                          }`}></div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300">No results found</h3>
              <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </motion.div>

        {/* Closing message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          {isPersonalizedView && selectedMember && !searchTerm && !activeTeamFilter ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Your Basher Journey Begins Now!</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                {selectedMember.name}, we're thrilled to have you join the Basher community! 
                Your skills, dedication, and enthusiasm make you a perfect addition to our team.
                We can't wait to see all the amazing contributions you'll make!
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Ready to Make an Impact!</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                These exceptional individuals have demonstrated their skills, determination, and 
                community spirit. We're excited to see their contributions as full-fledged Bashers.
                The journey is just beginning!
              </p>
            </>
          )}
          
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
            >
              <Star className="w-5 h-5" />
              View Leaderboard
            </Link>
            
            <Link
              to="/rising-bash"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-full text-blue-300 font-medium hover:bg-blue-500/20 transition-colors"
            >
              Visit Rising Bash
              <ExternalLink className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-gray-400/60 border-t border-white/10 mt-10 bg-black/20">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Award className="w-4 h-4" />
          <span>Byte Bash Blitz</span>
          <Award className="w-4 h-4" />
        </div>
        <p className="text-sm">Growing stronger with every new Basher!</p>
      </footer>
    </div>
  );
}