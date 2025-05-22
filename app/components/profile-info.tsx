'use client';

import { motion } from 'framer-motion';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import {
  Briefcase,
  FileText,
  Share2,
  Github,
  Crown,
} from 'lucide-react';
import type { BasherProfile } from '~/types/profile';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogTrigger } from '~/components/ui/dialog';
import { useState } from 'react';
import { Link } from '@remix-run/react';
import { EditProfileButton } from '~/components/edit-profile';

interface ProfileInfoProps {
  profile: BasherProfile;
  canEdit?: boolean;
  member?: any;
  isOrganiser?: boolean;
  isLegacyBasher?: boolean; // Add this new prop
}

// Add this function at the top of your file, after imports
function getTierColorScheme(tier: string) {
  const lowerTier = tier.toLowerCase();

  switch (lowerTier) {
    case 'diamond':
      return 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20';
    case 'obsidian':
      return 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20';
    case 'pearl':
      return 'bg-pink-500/10 text-pink-400 hover:bg-pink-500/20';
    case 'amethyst':
      return 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20';
    case 'emerald':
      return 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20';
    case 'ruby':
      return 'bg-red-500/10 text-red-400 hover:bg-red-500/20';
    case 'sapphire':
      return 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20';
    case 'gold':
      return 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20';
    case 'silver':
      return 'bg-slate-400/10 text-slate-300 hover:bg-slate-400/20';
    case 'bronze':
      return 'bg-yellow-700/10 text-yellow-600 hover:bg-yellow-700/20';
    default:
      return 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20';
  }
}

export function ProfileInfo({
  profile,
  canEdit = false,
  member,
  isOrganiser = false,
  isLegacyBasher = false,
}: ProfileInfoProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name}'s ByteBash Profile`,
          text: `Check out ${profile.name}'s ByteBash profile!`,
          url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex justify-between items-center px-4 sm:px-8 py-6 sm:py-10 rounded-2xl ${
          isLegacyBasher
            ? 'bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-amber-500/10 border border-yellow-400/30'
            : 'bg-gradient-to-r from-[#4dc4f9]/5 via-purple-500/5 to-amber-500/5 dark:from-[#4dc4f9]/10 dark:via-purple-500/10 dark:to-amber-500/10'
        }`}
      >
        {/* Animated crown for Legacy Bashers */}
        {isLegacyBasher && (
          <motion.div
            className="absolute -top-6 right-10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              animate={{
                y: [0, -5, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'mirror',
              }}
            >
              <Crown className="w-12 h-12 text-yellow-400 filter drop-shadow-lg" />
            </motion.div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center sm:items-start gap-4 sm:gap-6 sm:justify-between">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-24 h-24 rounded-2xl overflow-hidden ${
              isLegacyBasher
                ? 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/20'
                : 'bg-gray-800'
            }`}
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-amber-500/20">
                <span className="text-3xl font-bold text-white">
                  {profile.name.charAt(0)}
                </span>
              </div>
            )}
          </motion.div>

          <div className="text-center sm:text-left w-full sm:w-auto">
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-2xl sm:text-4xl font-bold text-white"
            >
              {profile.name}
            </motion.h1>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4"
            >
              <Badge
                variant="secondary"
                className="bg-[#4dc4f9]/10  text-[#4dc4f9] hover:bg-[#4dc4f9]/20"
              >
                {profile.title}
              </Badge>
              <Badge
                variant="secondary"
                className={getTierColorScheme(profile.basherLevel)}
              >
                <div className="flex items-center gap-2">
                  {profile.tierIcon} {/* Display the tier icon */}
                  <span className="font-medium">
                    {profile.basherLevel} Basher
                  </span>
                </div>
              </Badge>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col hidden sm:block sm:flex-row items-center gap-2 sm:gap-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-amber-500 font-semibold">
                  {profile.tierIcon}
                </span>
                <Link to={`points-history`} className="flex items-center gap-2">
                  <span className="text-amber-500 font-semibold">
                    {profile.bashPoints.toLocaleString()} Points
                  </span>
                </Link>
              </div>
              <div className="text-gray-500">
                Joined {format(new Date(profile.joinedDate), 'MMMM yyyy')}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-end gap-3"
        >
          <div className="flex items-center gap-2">
            {/* Edit Button - Show if user can edit (organiser OR own profile) */}
            {canEdit && member && (
              <EditProfileButton
                member={member}
                isOrganiser={isOrganiser} // Pass this prop to EditProfileButton
              />
            )}

            {/* Share Button - Keep existing */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-white/10"
                >
                  <Share2 className="w-5 h-5 text-gray-400" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <div className="w-[90vw] sm:max-w-md p-4 sm:p-8 relative bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl">
                  {/* Share Card Content */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-bold">
                            {profile.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{profile.name}</h3>
                      <div className="text-sm text-gray-400">
                        {profile.basherLevel} Basher
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-amber-500">
                        {profile.bashPoints.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Points</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-500">
                        {profile.projects}
                      </div>
                      <div className="text-sm text-gray-400">Projects</div>
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleShare}>
                    {copied ? 'Copied!' : 'Share Profile'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="text-right">
            <div className="text-sm text-emerald-500">{profile.basherNo}</div>
            <div className="text-sm text-emerald-500">{profile.clanName}</div>
          </div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:hidden sm:flex-row items-end text-right gap-2 sm:gap-4"
          >
            <div className="flex text-amber-500 font-semibold gap-2">
              {profile.tierIcon}
              {/* <Star className="w-5 h-5 text-amber-500" /> */}
              {profile.bashPoints.toLocaleString()} Points
            </div>

            <div className="text-gray-500">
              Joined {format(new Date(profile.joinedDate), "MMM''yy")}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap justify-center gap-2 sm:gap-4 w-full"
      >
        {profile.portfolio_url && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="bg-[#4dc4f9]/10 border-[#4dc4f9]/20 text-[#4dc4f9] hover:bg-[#4dc4f9]/20"
              onClick={() => window.open(profile.portfolio_url, '_blank')}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              View Portfolio
            </Button>
          </motion.div>
        )}
        {profile.resume_url && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="bg-[#4dc4f9]/10 border-[#4dc4f9]/20 text-[#4dc4f9] hover:bg-[#4dc4f9]/20"
              onClick={() => window.open(profile.resume_url, '_blank')}
            >
              <FileText className="w-4 h-4 mr-2" />
              View Resume
            </Button>
          </motion.div>
        )}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className="bg-[#4dc4f9]/10 border-[#4dc4f9]/20 text-[#4dc4f9] hover:bg-[#4dc4f9]/20"
            onClick={() =>
              window.open(
                `https://github.com/${profile.github_username}`,
                '_blank'
              )
            }
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub Profile
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
