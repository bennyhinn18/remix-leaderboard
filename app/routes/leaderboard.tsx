'use client';

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { useEffect, useState, useRef } from 'react';
import {
  Trophy,
  Github,
  Code,
  Building,
  Feather,
  MessageCircle,
  Book,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initSupabase } from '~/utils/supabase.client';
import iconImage from '~/assets/bashers.png';
import { createSupabaseServerClient } from '~/utils/supabase.server';

import ClanTopOneCard from '~/components/leaderboard/clantopcard';
import TopThreeCard from '~/components/leaderboard/topthreecard';
import ClanCard from '~/components/leaderboard/clancard';
import RegularCard from '~/components/leaderboard/regularcard';
import { getTier, getTierIcon } from '~/utils/tiers';
interface MemberWithStats {
  id: string;
  name: string;
  github_username: string;
  avatar_url: string;
  bash_points: number;
  title?: string;
  githubStreak?: number;
  leetcodeStreak?: number;
  bashClanPoints?: number;
  discordPoints?: number;
  bookRead?: number;
  duolingoStreak?: number;
  tier:
    | 'diamond'
    | 'obsidian'
    | 'pearl'
    | 'amethyst'
    | 'emerald'
    | 'ruby'
    | 'sapphire'
    | 'gold'
    | 'silver'
    | 'bronze';
  originalRank?: number;
  stats?: {
    projects?: number;
  };
  clan_id?: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const supabase = createSupabaseServerClient(request);

  const {
    data: { user },
  } = await supabase.client.auth.getUser();
  return json({
    user,
    members: [],
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  });
};

export default function Leaderboard() {
  const {
    members: initialMembers,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    user,
  } = useLoaderData<typeof loader>();
  const [members, setMembers] = useState<MemberWithStats[]>([]);
  const [activeTab, setActiveTab] = useState<
    | 'overall'
    | 'bashclan'
    | 'leetcode'
    | 'github'
    | 'discord'
    | 'duolingo'
    | 'books'
  >('overall');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [currentUser, setCurrentUser] = useState<MemberWithStats | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(true);
  const currentUserRef = useRef<HTMLDivElement | null>(null);
  const [userPosition, setUserPosition] = useState<
    'above' | 'below' | 'visible'
  >('below');

  interface Clan {
    id: string;
    name: string;
    clan_name: string;
     members: MemberWithStats[];
  }

  const [clans, setClans] = useState<Clan[]>([]);

  const scrollToCurrentUser = () => {
    if (currentUserRef.current) {
      currentUserRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Flash animation effect
      currentUserRef.current.classList.add('highlight-pulse');
      setTimeout(() => {
        currentUserRef.current?.classList.remove('highlight-pulse');
      }, 2000);
    }
  };

  const checkUserPosition = () => {
    if (!currentUserRef.current) return;

    const rect = currentUserRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (rect.top < 0) {
      setUserPosition('above');
    } else if (rect.top > viewportHeight) {
      setUserPosition('below');
    } else {
      setUserPosition('visible');
    }
  };

  // Fetch members and current user
  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

    const supabase = initSupabase(SUPABASE_URL, SUPABASE_ANON_KEY);

    const fetchCurrentUser = async () => {
      if (user) {
        const githubUsername =
          user.user_metadata?.user_name ||
          user.identities?.find((i: any) => i.provider === 'github')
            ?.identity_data?.user_name;

        if (githubUsername) {
          const { data: memberData } = await supabase
            .from('members')
            .select('*')
            .eq('github_username', githubUsername)
            .single();

          if (memberData) {
            const userWithTier = {
              ...memberData,
              tier: getTier(memberData.bash_points),
            };
            setCurrentUser(userWithTier);
          }
        }
      }
    };

    // Replace the fetchMembers function in your useEffect with this:

    const fetchMembers = async () => {
      // Fetch members
      const { data: members } = await supabase
        .from('members')
        .select('*')
        .or(
          'title.eq.Basher,title.eq.Organiser,title.eq.Captain Bash,title.eq.Mentor'
        )
        .order('bash_points', { ascending: false });

      if (!members) return;

      // Fetch all member stats
      const { data: memberStats } = await supabase
        .from('member_stats')
        .select('*');

      // Combine member data with their stats
      const membersWithStats = members.map((member) => {
        const stats =
          memberStats?.find((stat) => stat.member_id === member.id) || {};

        return {
          ...member,
          tier: getTier(member.bash_points),
          tierIcon: getTierIcon(getTier(member.bash_points)),
          leetcodeStreak: stats.leetcode_streak || 0,
          githubStreak: stats.github_streak || 0,
          discordPoints: stats.discord_points || 0,
          duolingoStreak: stats.duolingo_streak || 0,
          bookRead: stats.books_read || 0,
        };
      });

      setMembers(membersWithStats);

      // Fetch clans using the already fetched member data
      fetchClans(membersWithStats);
    };

    const fetchClans = async (membersData: MemberWithStats[]) => {
      // Fetch clan data only, without members
      const { data: clans } = await supabase.from('clans').select('*');

      if (clans) {
        // Map through clans and assign members using filter
        const clansWithMembers = clans.map((clan) => {
          const clanMembers = membersData.filter(
            (member) => member.clan_id === clan.id
          );
      
          return {
            ...clan,
            members: clanMembers,
          };
        });

        setClans(clansWithMembers);
      }
    };

    fetchCurrentUser();
    fetchMembers();

    const channel = supabase
      .channel('members')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        () => {
          fetchMembers();
          fetchCurrentUser();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [SUPABASE_URL, SUPABASE_ANON_KEY]);

  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab') as
      | 'overall'
      | 'bashclan'
      | 'leetcode'
      | 'github'
      | 'discord'
      | 'duolingo'
      | 'books'
      | null;
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', checkUserPosition);
    // Check initial position
    checkUserPosition();

    return () => {
      window.removeEventListener('scroll', checkUserPosition);
    };
  }, [currentUser]);

  const filteredMembers = members
    .map((member, index) => ({ ...member, originalRank: index + 1 }))
    .filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.github_username?.toLowerCase() || '').includes(
          searchQuery.toLowerCase()
        )
    );

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (activeTab === 'overall') return b.bash_points - a.bash_points;
    if (activeTab === 'github')
      return (b.githubStreak || 0) - (a.githubStreak || 0);
    if (activeTab === 'leetcode')
      return (b.leetcodeStreak || 0) - (a.leetcodeStreak || 0);
    if (activeTab === 'bashclan')
      return (b.bashClanPoints || 0) - (a.bashClanPoints || 0);
    if (activeTab === 'duolingo')
      return (b.duolingoStreak || 0) - (a.duolingoStreak || 0);
    if (activeTab === 'discord')
      return (b.discordPoints || 0) - (a.discordPoints || 0);
    if (activeTab === 'books') return (b.bookRead || 0) - (a.bookRead || 0);
    return 0;
  });

  return (
    <div className="min-h-screen pb-[78px] bg-gradient-to-b from-gray-900 to-black dark:from-white dark:to-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img
                src={iconImage || '/placeholder.svg'}
                alt="Basher Logo"
                className="w-16 h-16"
              />
            </Link>
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Leaderboard
              </h1>
            </div>
            {/* {currentUser && <LeagueInfoButton currentUser={currentUser} />} */}
            <div className="hidden sm:block text-right">
              <div className="text-lg font-semibold text-white">
                Hello{' '}
                {`Basher ${currentUser?.name?.split(' ')[0] || ''}`.trim() ||
                  "Basher's"}
              </div>
              <div className="text-sm text-gray-400">
                How&apos;s your learning journey?
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-full flex items-center">
              {/* {showSearch ? (
                <div className="relative">
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-60 pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white z-10"
                  onClick={() => {
                    setSearchQuery("")
                    setShowSearch(false)
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSearch(true)}
                  className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 mr-4"
                >
                  <Search className="w-5 h-5" />
                </motion.button>
              )} */}

              <div className="flex relative w-full gap-2 overflow-x-auto no-scrollbar">
                {[
                  'overall',
                  'bashclan',
                  'leetcode',
                  'github',
                  'discord',
                  'duolingo',
                  'books',
                ].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActiveTab(tab as typeof activeTab);
                      localStorage.setItem('activeTab', tab);
                    }}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-colors ${
                      activeTab === tab
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {tab === 'overall' && <Trophy className="w-4 h-4" />}
                    {tab === 'bashclan' && <Building className="w-4 h-4" />}
                    {tab === 'leetcode' && <Code className="w-4 h-4" />}
                    {tab === 'github' && <Github className="w-4 h-4" />}
                    {tab === 'discord' && <MessageCircle className="w-4 h-4" />}
                    {tab === 'duolingo' && <Feather className="w-4 h-4" />}
                    {tab === 'books' && <Book className="w-4 h-4" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {currentUser && showScrollButton && activeTab !== 'bashclan' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scrollToCurrentUser()}
          className={`fixed bottom-28 right-6 z-50 flex items-center gap-2 px-4 py-2 text-white rounded-full shadow-lg ${
            userPosition === 'visible' ? 'hidden' : 'bg-blue-500'
          }`}
        >
          {/*<User className="w-4 h-4" />
           <span>Find Me</span> */}
          {userPosition === 'above' ? (
            <ArrowUp className="w-4 h-4 animate-bounce" />
          ) : userPosition === 'below' ? (
            <ArrowDown className="w-4 h-4 animate-bounce" />
          ) : null}
        </motion.button>
      )}

      <div className="max-w-7xl mx-auto px-4 pb-8 sm:py-8">
        <AnimatePresence mode="popLayout">
          <motion.div layout className="space-y-6">
            {activeTab === 'bashclan' ? (
              <div className="space-y-4 mt-8">
                {clans
                  .sort((a, b) => {
                    const averagePointsA =
                      a.members.reduce(
                        (acc, member) => acc + member.bash_points,
                        0
                      ) / a.members.length;
                    const averagePointsB =
                      b.members.reduce(
                        (acc, member) => acc + member.bash_points,
                        0
                      ) / b.members.length;
                    return averagePointsB - averagePointsA;
                  })
                  .map((clan, index) => {
                    const totalPoints = clan.members.reduce(
                      (acc, member) => acc + member.bash_points,
                      0
                    );
                    const pointsPercentage =
                      (totalPoints / (clan.members.length * 100)) * 100;

                    // Ensure originalRank is assigned a number
                    const updatedClan = {
                      ...clan,
                      members: clan.members.map((member, memberIndex) => ({
                        ...member,
                        originalRank: member.originalRank ?? memberIndex + 1,
                      })),
                    };

                    return index === 0 ? (
                      <ClanTopOneCard
                        key={clan.id}
                        clan={updatedClan}
                        index={index}
                        pointsPercentage={pointsPercentage}
                      />
                    ) : (
                      <ClanCard
                        key={clan.id}
                        clan={updatedClan}
                        index={index}
                        pointsPercentage={pointsPercentage}
                      />
                    );
                  })}
              </div>
            ) : (
              <>
                <div className="space-y-4"></div>

                <div className="space-y-4 mt-8">
                  {sortedMembers
                    .filter((member) => member.originalRank)
                    .map((member, index) =>
                      activeTab === 'overall' && member.originalRank <= 3 ? (
                        <TopThreeCard
                          key={member.id}
                          member={member}
                          index={index}
                          activeTab={activeTab}
                          searchQuery={searchQuery}
                          isCurrentUser={currentUser?.id === member.id}
                          ref={
                            currentUser?.id === member.id
                              ? currentUserRef
                              : null
                          }
                        />
                      ) : (
                        <RegularCard
                          key={member.id}
                          member={member}
                          index={index}
                          activeTab={activeTab}
                          searchQuery={searchQuery}
                          duolingoStreak={member.duolingoStreak || 0}
                          isCurrentUser={currentUser?.id === member.id}
                          ref={
                            currentUser?.id === member.id
                              ? currentUserRef
                              : null
                          }
                        />
                      )
                    )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
