import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { createServerSupabase } from '~/utils/supabase.server';
import { motion } from 'framer-motion';
import {
  Crown,
  ChevronLeft,
  Trophy,
  ArrowRight,
  Sparkles,
  Github,
  User,
  Code,
  Globe,
} from 'lucide-react';
import { Badge } from '~/components/ui/badge';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase(request, response);

  // Fetch all Legacy Bashers, ordered by points
  const { data: legacyBashers } = await supabase
    .from('members')
    .select('*')
    .eq('title', 'Legacy Basher')
    .order('bash_points', { ascending: false });

  return json({
    legacyBashers: legacyBashers || [],
  });
};

export default function LegacyBashers() {
  const { legacyBashers } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 text-white">
      {/* Animated particles in the background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-yellow-300/30"
            animate={{
              x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
              y: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
              scale: [0.5, 1.5, 0.5],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-yellow-500/20">
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
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-amber-500">
                Legacy Bashers
              </h1>
              <p className="text-yellow-300/80 text-sm">Hall of Fame</p>
            </div>

            <div className="w-24">{/* Empty div for alignment */}</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Intro Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-block mb-6"
            animate={{
              rotate: [0, 10, -10, 0],
              y: [0, -5, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <Crown className="w-16 h-16 text-yellow-400" />
          </motion.div>
          <h2 className="text-4xl font-bold mb-4">The Legacy Legends</h2>
          <p className="text-yellow-200/80 max-w-2xl mx-auto">
            Legacy Bashers represent our most dedicated and accomplished
            members. Their exceptional contributions and commitment have earned
            them legendary status within our community.
          </p>
        </motion.div>

        {/* Legacy Bashers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {legacyBashers.length > 0 ? (
            legacyBashers.map((basher, index) => (
              <motion.div
                key={basher.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <Link
                  to={`/profile/${basher.github_username}`}
                  className="block"
                >
                  <div className="relative bg-gradient-to-br from-yellow-900/40 to-amber-900/40 backdrop-blur-md rounded-2xl overflow-hidden border border-yellow-500/30 shadow-lg shadow-amber-500/20">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-yellow-400 to-amber-600 w-24 h-24 -mt-8 -mr-8 rounded-full opacity-20"></div>
                    <div className="absolute top-4 right-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="text-yellow-400"
                      >
                        <Sparkles className="w-6 h-6" />
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400/50 shadow-lg shadow-amber-500/20">
                          {basher.avatar_url ? (
                            <img
                              src={basher.avatar_url}
                              alt={basher.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-yellow-900">
                              <User className="w-8 h-8 text-yellow-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {basher.name}
                          </h3>
                          <div className="flex items-center gap-1 text-yellow-300">
                            <Github className="w-4 h-4" />
                            <span className="text-sm">
                              @{basher.github_username}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <Badge className="bg-amber-500/20 text-amber-300 border border-amber-400/30">
                          <Crown className="w-3 h-3 mr-1" />
                          Legacy Basher
                        </Badge>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-black/20 rounded-lg p-2 text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Trophy className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="text-xl font-bold text-amber-300">
                            {basher.bash_points}
                          </div>
                          <div className="text-xs text-amber-200/70">
                            Points
                          </div>
                        </div>

                        <div className="bg-black/20 rounded-lg p-2 text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Code className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="text-xl font-bold text-amber-300">
                            {basher.stats?.projects || 0}
                          </div>
                          <div className="text-xs text-amber-200/70">
                            Projects
                          </div>
                        </div>

                        <div className="bg-black/20 rounded-lg p-2 text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Globe className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="text-xl font-bold text-amber-300">
                            {basher.weekly_bash_attendance || 0}%
                          </div>
                          <div className="text-xs text-amber-200/70">
                            Attendance
                          </div>
                        </div>
                      </div>

                      {/* Testimony snippet if available */}
                      {basher.testimony && (
                        <div className="bg-black/20 rounded-lg p-3 mb-4">
                          <p className="text-sm italic text-yellow-100/80 line-clamp-2">
                            &quot;{basher.testimony}&quot;
                          </p>
                        </div>
                      )}

                      {/* View Profile button */}
                      <div className="mt-4 text-right">
                        <span className="inline-flex items-center text-sm font-medium text-yellow-300 group-hover:text-yellow-100 transition-colors">
                          View Full Profile
                          <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            <ArrowRight className="ml-1 w-4 h-4" />
                          </motion.span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-20">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="mb-4 inline-block"
              >
                <Crown className="w-16 h-16 text-yellow-500/50" />
              </motion.div>
              <h3 className="text-2xl font-bold text-yellow-500/70">
                No Legacy Bashers Yet
              </h3>
              <p className="text-yellow-300/50 mt-2">
                Continue your journey to become the first Legacy Basher!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Decorative footer */}
      <footer className="py-8 text-center text-yellow-300/50 border-t border-yellow-500/20 mt-10 bg-black/20">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Crown className="w-4 h-4" />
          <span>Byte Bash Blitz Legacy</span>
          <Crown className="w-4 h-4" />
        </div>
        <p className="text-sm">Honoring those who&apos;ve shaped our community</p>
      </footer>
    </div>
  );
}
