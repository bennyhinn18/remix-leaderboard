import { motion, AnimatePresence } from 'framer-motion';
import { Github, TrendingUp, BarChart3, X } from 'lucide-react';

export type GitHubDisplayMode = 'streak' | 'commits' | 'both';

interface GitHubOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: GitHubDisplayMode) => void;
  currentMode: GitHubDisplayMode;
}

export function GitHubOptionsModal({ 
  isOpen, 
  onClose, 
  onSelectMode, 
  currentMode 
}: GitHubOptionsModalProps) {
  if (!isOpen) return null;

  const options = [
    {
      mode: 'streak' as const,
      title: 'GitHub Streak',
      description: 'Show current contribution streak',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      mode: 'commits' as const,
      title: 'Total Commits',
      description: 'Show total commits (last 30 days)',
      icon: <Github className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      mode: 'both' as const,
      title: 'Show Both',
      description: 'Display streak and commits together',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <Github className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">GitHub Display</h3>
                <p className="text-sm text-gray-400">Choose what to show</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option) => (
              <motion.button
                key={option.mode}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onSelectMode(option.mode);
                  onClose();
                }}
                className={`w-full p-4 rounded-xl border transition-all text-left ${
                  currentMode === option.mode
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`bg-gradient-to-r ${option.color} p-2 rounded-lg`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white flex items-center gap-2">
                      {option.title}
                      {currentMode === option.mode && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {option.description}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-500 text-center">
              <strong>Tip:</strong> Long press or right-click the GitHub tab to open this menu
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}