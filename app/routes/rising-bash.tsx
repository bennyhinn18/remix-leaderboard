import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useParams, Link } from '@remix-run/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  Star,
  Award,
  Rocket,
  AlertCircle,
  Medal,
  Search,
  X,
  ArrowUpCircle,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Input } from '~/components/ui/input';

interface RisingBash {
  id: number;
  name: string;
  team: string;
  isNew: boolean;
}

export function loader({ params }: LoaderFunctionArgs) {
  const memberId = params.id ? parseInt(params.id, 10) : null;

  // List of Rising Bash members
  const risingBashMembers: RisingBash[] = [
    { id: 1, name: 'Mohamed Rashid', team: 'BC2', isNew: true },
    { id: 2, name: 'Jobrits Shenin', team: 'BC3', isNew: true },
    { id: 3, name: 'Francis Sahaya Kenilan', team: 'BC4', isNew: true },
    { id: 4, name: 'Abinaya', team: 'BC2', isNew: true },
    { id: 5, name: 'Abinaya MK', team: 'BC3', isNew: true },
  ];

  // Find the specified member if ID is provided
  const selectedMember = memberId
    ? risingBashMembers.find((member) => member.id === memberId) || null
    : null;

  return json({
    risingBashMembers,
    selectedMember,
  });
}

export default function RisingBash() {
  const { risingBashMembers, selectedMember } = useLoaderData<typeof loader>();
  const params = useParams();
  const isPersonalizedView = !!params.id;

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTeamFilter, setActiveTeamFilter] = useState<string | null>(null);
  const [highlightedMember, setHighlightedMember] = useState<number | null>(
    selectedMember ? selectedMember.id : null
  );
  const [showRisingBashBanner, setShowRisingBashBanner] = useState(
    !isPersonalizedView
  );
  const [showPersonalizedBanner, setShowPersonalizedBanner] =
    useState(isPersonalizedView);

  // Team colors
  const teamColors = {
    BC1: {
      bg: 'from-blue-500/20 to-blue-600/20',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      button: 'bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30',
    },
    BC2: {
      bg: 'from-purple-500/20 to-purple-600/20',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      button: 'bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30',
    },
    BC3: {
      bg: 'from-green-500/20 to-green-600/20',
      border: 'border-green-500/30',
      text: 'text-green-400',
      button: 'bg-green-500/20 border-green-500/30 hover:bg-green-500/30',
    },
    BC4: {
      bg: 'from-amber-500/20 to-amber-600/20',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      button: 'bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30',
    },
  };

  // Filter members based on search and team filter
  const filteredMembers = risingBashMembers.filter((member) => {
    // If in personalized view and search is empty, only show the selected member
    if (
      isPersonalizedView &&
      !searchTerm &&
      !activeTeamFilter &&
      selectedMember
    ) {
      return member.id === selectedMember.id;
    }

    const matchesSearch = member.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTeam = activeTeamFilter
      ? member.team === activeTeamFilter
      : true;

    return matchesSearch && matchesTeam;
  });

  // Sort members alphabetically
  const sortedMembers = [...filteredMembers].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Trigger confetti effect on load (smaller than for official bashers)
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: isPersonalizedView ? 100 : 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#4299E1', '#76E4F7', '#48BB78', '#90CDF4'],
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-900 text-white">
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
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link
              to="/rookie-basher"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Official Bashers
            </Link>

            <div className="text-center">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 lg:text-4xl">
                Rising Bash
              </h1>
              <p className="text-blue-300/80 text-sm">Future Potential</p>
            </div>

            <Link
              to="/leaderboard"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              To Leaderboard
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
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="relative overflow-hidden mb-8"
            >
              <motion.div
                className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-xl p-6 border border-blue-500/30 relative overflow-hidden"
                initial={{ y: -20 }}
                animate={{
                  y: 0,
                  transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 24,
                  },
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
                    <ArrowUpCircle className="w-8 h-8 text-blue-400 mr-2" />
                    <h2 className="text-2xl font-bold">
                      Hello {selectedMember.name}!
                    </h2>
                  </div>

                  <p className="text-center text-gray-200 max-w-3xl mx-auto">
                    You've been selected as a Rising Bash! While you haven't
                    been officially selected as a Basher yet, we see great
                    potential in you.
                  </p>

                  <div className="mt-6 text-center">
                    <motion.div
                      className="inline-block"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                    >
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-1.5 text-base border-none text-white">
                        <ArrowUpCircle className="w-4 h-4 mr-2" />
                        Rising Star!
                      </Badge>
                    </motion.div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-xl"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-500/10 blur-xl"></div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rising Bash Message */}
        <AnimatePresence>
          {showRisingBashBanner && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="relative overflow-hidden"
            >
              <motion.div
                className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-xl p-6 mb-8 border border-blue-500/30 relative overflow-hidden"
                initial={{ y: -20 }}
                animate={{
                  y: 0,
                  transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 24,
                  },
                }}
              >
                <button
                  onClick={() => setShowRisingBashBanner(false)}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>

                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-blue-400 mr-2" />
                    <h2 className="text-2xl font-bold">Hey Rising Bash(s)!</h2>
                  </div>

                  <div className="text-center text-gray-200 max-w-3xl mx-auto space-y-4">
                    <p>
                      You've not been officially selected as Bashers yet, but
                      you're not out either. You've been given the title "Rising
                      Bash", a special recognition for those who showed
                      potential but didn't quite make the top 20. Over the next
                      few months, you'll journey alongside the community. While
                      you won't have full Basher privileges yet, you're invited
                      to attend all Weekly Bashes and key community events.
                    </p>
                    <p>
                      We truly see promise in you. This is a chance to step up,
                      prove your involvement and possibly earn your place as a
                      Basher. If any of the officially selected Bashers fail to
                      stay active, their spot could open up, for someone like
                      you.
                    </p>
                    <p>
                      This opportunity is yours to accept or decline. Reach out
                      to the community organisers if you're good to go, we're
                      looking forward to seeing how you choose to move forward!
                    </p>
                    <p className="italic text-right">
                      Organisers,
                      <br />
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
                        repeatType: 'reverse',
                      }}
                    >
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1.5 text-base border-none">
                        <ArrowUpCircle className="w-4 h-4 mr-2" /> Keep Rising!
                      </Badge>
                    </motion.div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-xl"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-xl"></div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Link to Official Bashers */}
        <div className="mb-8">
          <div className="bg-purple-500/10 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Officially Selected Bashers
                </h3>
                <p className="text-gray-300 mt-1">
                  View the full list of officially selected Bashers for the
                  2024–28 batch.
                </p>
              </div>
              <Link
                to="/rookie-basher"
                className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 px-6 py-2 rounded-full flex items-center gap-2 transition-colors"
              >
                Officially Selected Bashers
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
                    !activeTeamFilter
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  All Teams
                </button>

                {Object.keys(teamColors).map((team) => (
                  <button
                    key={team}
                    onClick={() =>
                      setActiveTeamFilter(
                        team === activeTeamFilter ? null : team
                      )
                    }
                    className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                      activeTeamFilter === team
                        ? teamColors[team as keyof typeof teamColors].button
                        : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'
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
            {isPersonalizedView &&
            selectedMember &&
            !searchTerm &&
            !activeTeamFilter
              ? 'Your Journey as a Rising Bash Begins!'
              : 'Rising Bash Members'}
          </h2>

          {sortedMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedMembers.map((member, index) => {
                const isSelected =
                  selectedMember && member.id === selectedMember.id;
                const shouldHighlight =
                  isSelected || highlightedMember === member.id;

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: isSelected ? 1.02 : 1,
                    }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.5,
                    }}
                    whileHover={{ scale: 1.02 }}
                    className="relative"
                    onMouseEnter={() => setHighlightedMember(member.id)}
                    onMouseLeave={() => setHighlightedMember(null)}
                  >
                    <div
                      className={`h-full backdrop-blur-md rounded-xl p-5 border overflow-hidden ${
                        isSelected
                          ? 'ring-2 ring-blue-400 border-blue-400/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/5'
                          : shouldHighlight
                          ? 'ring-2 ring-blue-400 border-transparent bg-white/5'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      {member.isNew && (
                        <Badge className="absolute top-3 right-3 bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Rising
                        </Badge>
                      )}

                      {isSelected && (
                        <Badge className="absolute top-3 right-20 bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          <Star className="w-3 h-3 mr-1" /> You
                        </Badge>
                      )}

                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30'
                              : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30'
                          }`}
                        >
                          <span className="font-bold">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{member.name}</h3>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <Badge
                          className={`${
                            teamColors[member.team as keyof typeof teamColors]
                              .button
                          } ${
                            teamColors[member.team as keyof typeof teamColors]
                              .text
                          }`}
                        >
                          {member.team}
                        </Badge>

                        <div className="flex -space-x-1">
                          <motion.div
                            animate={
                              shouldHighlight
                                ? {
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 10, -10, 0],
                                  }
                                : {}
                            }
                            transition={{
                              duration: 0.6,
                              repeat: isSelected ? Infinity : 0,
                              repeatDelay: isSelected ? 2 : 0,
                            }}
                          >
                            <ArrowUpCircle className="w-5 h-5 text-blue-400" />
                          </motion.div>
                          <motion.div
                            animate={
                              shouldHighlight
                                ? {
                                    scale: [1, 1.2, 1],
                                    rotate: [0, -10, 10, 0],
                                  }
                                : {}
                            }
                            transition={{
                              duration: 0.6,
                              delay: 0.1,
                              repeat: isSelected ? Infinity : 0,
                              repeatDelay: isSelected ? 2 : 0,
                            }}
                          >
                            <Medal className="w-5 h-5 text-purple-400" />
                          </motion.div>
                          <motion.div
                            animate={
                              shouldHighlight
                                ? {
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 10, -10, 0],
                                  }
                                : {}
                            }
                            transition={{
                              duration: 0.6,
                              delay: 0.2,
                              repeat: isSelected ? Infinity : 0,
                              repeatDelay: isSelected ? 2 : 0,
                            }}
                          >
                            <Rocket className="w-5 h-5 text-cyan-400" />
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
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 animate-gradient-x"></div>
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
              <h3 className="text-xl font-medium text-gray-300">
                No results found
              </h3>
              <p className="text-gray-400 mt-2">
                Try adjusting your search or filters
              </p>
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
          {isPersonalizedView &&
          selectedMember &&
          !searchTerm &&
          !activeTeamFilter ? (
            <>
              <h2 className="text-2xl font-bold mb-4">
                Your Rising Bash Journey Begins!
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                {selectedMember.name}, while you've not been officially selected
                as a Basher yet, we see great potential in you. This is your
                chance to step up and prove yourself. We look forward to seeing
                your involvement and growth in the community!
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">
                Rising Stars with Potential!
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                These promising individuals have shown notable potential during
                the selection process. While they didn't make the official
                Basher list, they've been given a special opportunity to grow
                and potentially earn a Basher spot in the future. We believe in
                their abilities and look forward to their continued involvement!
              </p>
            </>
          )}

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-full text-purple-300 font-medium hover:bg-purple-500/20 transition-colors"
            >
              View Existing Bashers
              <ExternalLink className="w-5 h-5" />
            </Link>

            <Link
              to="/rookie-basher"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white font-medium hover:from-blue-600 hover:to-cyan-600 transition-colors"
            >
              <Star className="w-5 h-5" />
              View New Bashers
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
        <p className="text-sm">Growing stronger with every new member!</p>
      </footer>
    </div>
  );
}
