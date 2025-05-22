import {
  GemIcon,
  Boxes,
  CircleDot,
  Sparkles,
  Leaf,
  Flame,
  Droplets,
  Trophy,
  Medal,
  Award,
  Crown,
} from 'lucide-react';

// Define tier thresholds once to ensure consistency
const TIER_THRESHOLDS = {
  diamond: 3000,
  obsidian: 2600,
  pearl: 2200,
  amethyst: 1750,
  emerald: 1350,
  ruby: 1000,
  sapphire: 700,
  gold: 450,
  silver: 250,
  bronze: 0,
};

type TierType =
  | 'diamond'
  | 'obsidian'
  | 'pearl'
  | 'amethyst'
  | 'emerald'
  | 'ruby'
  | 'sapphire'
  | 'gold'
  | 'silver'
  | 'bronze'
  | 'platinum';

interface TierOptions {
  uppercase?: boolean;
}

/**
 * Determines the tier based on points
 * @param points The number of points
 * @param options Configuration options
 * @returns The tier as a string, with case determined by options
 */
export function getTier(points: number, options: TierOptions = {}): string {
  let tier: TierType;

  if (points >= TIER_THRESHOLDS.diamond) tier = 'diamond';
  else if (points >= TIER_THRESHOLDS.obsidian) tier = 'obsidian';
  else if (points >= TIER_THRESHOLDS.pearl) tier = 'pearl';
  else if (points >= TIER_THRESHOLDS.amethyst) tier = 'amethyst';
  else if (points >= TIER_THRESHOLDS.emerald) tier = 'emerald';
  else if (points >= TIER_THRESHOLDS.ruby) tier = 'ruby';
  else if (points >= TIER_THRESHOLDS.sapphire) tier = 'sapphire';
  else if (points >= TIER_THRESHOLDS.gold) tier = 'gold';
  else if (points >= TIER_THRESHOLDS.silver) tier = 'silver';
  else tier = 'bronze';

  // Return with proper casing based on options
  return options.uppercase
    ? tier.charAt(0).toUpperCase() + tier.slice(1)
    : tier;
}

/**
 * Gets the icon component for a specific tier
 * @param tier The tier string
 * @returns A React component for the tier's icon
 */
export function getTierIcon(tier: string) {
  const lowerTier = tier.toLowerCase();

  switch (lowerTier) {
    case 'diamond':
      return <GemIcon className="w-4 h-4" />;
    case 'obsidian':
      return <Boxes className="w-4 h-4" />;
    case 'pearl':
      return <CircleDot className="w-4 h-4" />;
    case 'amethyst':
      return <Sparkles className="w-4 h-4" />;
    case 'emerald':
      return <Leaf className="w-4 h-4" />;
    case 'ruby':
      return <Flame className="w-4 h-4" />;
    case 'sapphire':
      return <Droplets className="w-4 h-4" />;
    case 'gold':
      return <Trophy className="w-4 h-4" />;
    case 'silver':
      return <Medal className="w-4 h-4" />;
    case 'platinum':
      return <Crown className="w-4 h-4" />;
    default:
      return <Award className="w-4 h-4" />;
  }
}

/**
 * Gets the CSS classes for tier styling
 * @param tier The tier string
 * @returns CSS classes for the tier
 */
export function getTierStyles(tier: string) {
  const lowerTier = tier.toLowerCase();

  switch (lowerTier) {
    case 'diamond':
      return 'bg-gradient-to-r from-cyan-300 to-cyan-500 text-cyan-900';
    case 'obsidian':
      return 'bg-gradient-to-r from-gray-800 to-black text-white';
    case 'pearl':
      return 'bg-gradient-to-r from-pink-100 to-pink-400 text-pink-900';
    case 'amethyst':
      return 'bg-gradient-to-r from-purple-300 to-purple-500 text-purple-900';
    case 'emerald':
      return 'bg-gradient-to-r from-green-300 to-green-500 text-green-900';
    case 'ruby':
      return 'bg-gradient-to-r from-red-300 to-red-500 text-red-900';
    case 'sapphire':
      return 'bg-gradient-to-r from-blue-300 to-blue-500 text-blue-900';
    case 'gold':
      return 'bg-gradient-to-r from-amber-300 to-amber-500 text-amber-900';
    case 'silver':
      return 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900';
    case 'platinum':
      return 'bg-gradient-to-r from-slate-300 to-slate-500 text-slate-900';
    default:
      return 'bg-gradient-to-r from-orange-300 to-orange-500 text-orange-900';
  }
}

/**
 * Gets the color scheme for tier UI elements
 * @param tier The tier string
 * @returns CSS classes for the tier color scheme
 */
export function getTierColorScheme(tier: string) {
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

/**
 * Gets the threshold for the next tier
 * @param tier The current tier
 * @returns The points needed for the next tier
 */
export function getTierThreshold(tier: string): number {
  const lowerTier = tier.toLowerCase();

  switch (lowerTier) {
    case 'bronze':
      return TIER_THRESHOLDS.silver;
    case 'silver':
      return TIER_THRESHOLDS.gold;
    case 'gold':
      return TIER_THRESHOLDS.sapphire;
    case 'sapphire':
      return TIER_THRESHOLDS.ruby;
    case 'ruby':
      return TIER_THRESHOLDS.emerald;
    case 'emerald':
      return TIER_THRESHOLDS.amethyst;
    case 'amethyst':
      return TIER_THRESHOLDS.pearl;
    case 'pearl':
      return TIER_THRESHOLDS.obsidian;
    case 'obsidian':
      return TIER_THRESHOLDS.diamond;
    default:
      return TIER_THRESHOLDS.diamond;
  }
}
