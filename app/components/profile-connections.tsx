import { motion } from 'framer-motion';
import LeetCodeConnect from '~/components/leetcode-connect';
import RollNumberUpdate from '~/components/roll-number-update';

interface ProfileConnectionsProps {
  member: {
    id?: number;
    leetcode_username?: string;
    roll_number?: string;
  } | null;
}

export default function ProfileConnections({ member }: ProfileConnectionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Profile Connections</h2>
        <div className="text-sm text-gray-400">Connect your accounts</div>
      </div>
      
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 space-y-4">
        <LeetCodeConnect
          hasLeetCodeUsername={!!member?.leetcode_username}
          username={member?.leetcode_username || ''}
          memberId={member?.id}
        />
        
      </div>
    </motion.div>
  );
}
