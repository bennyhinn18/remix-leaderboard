import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Sparkles, Trophy, Zap } from 'lucide-react';

interface SlotPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onAllocate: () => void;
  isAnimating: boolean;
  allocatedSlot?: number;
}

export function SlotPicker({ 
  isVisible, 
  onClose, 
  onAllocate, 
  isAnimating, 
  allocatedSlot 
}: SlotPickerProps) {
  const [displayNumber, setDisplayNumber] = useState<number>(1);
  const [animationPhase, setAnimationPhase] = useState<'spinning' | 'slowing' | 'stopped'>('spinning');

  // Slot machine animation effect
  useEffect(() => {
    if (!isAnimating) return;

    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    // Fast spinning phase
    interval = setInterval(() => {
      setDisplayNumber(Math.floor(Math.random() * 25) + 1);
    }, 100);

    // Switch to slowing phase after 2 seconds
    timeout = setTimeout(() => {
      clearInterval(interval);
      setAnimationPhase('slowing');

      // Slower spinning
      interval = setInterval(() => {
        setDisplayNumber(Math.floor(Math.random() * 25) + 1);
      }, 300);

      // Stop after another second
      setTimeout(() => {
        clearInterval(interval);
        setAnimationPhase('stopped');
        if (allocatedSlot) {
          setDisplayNumber(allocatedSlot);
        }
      }, 1000);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isAnimating, allocatedSlot]);

  // Reset state when visibility changes
  useEffect(() => {
    if (isVisible) {
      setDisplayNumber(1);
      setAnimationPhase('spinning');
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-md w-full mx-4"
        >
          <Card className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 border-purple-500/30 p-8 text-center text-white">
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-6"
            >
              <div className="flex justify-center mb-4">
                <motion.div
                  animate={isAnimating ? { 
                    scale: [1, 1.2, 1],
                    rotate: [0, 360]
                  } : {}}
                  transition={{
                    duration: 0.8,
                    repeat: isAnimating ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full"
                >
                  {animationPhase === 'stopped' ? (
                    <Trophy className="w-8 h-8 text-white" />
                  ) : (
                    <Sparkles className="w-8 h-8 text-white" />
                  )}
                </motion.div>
              </div>
              
              <h3 className="text-2xl font-bold mb-2">
                {animationPhase === 'stopped' ? 'Congratulations!' : 'Picking Your Slot...'}
              </h3>
              
              <p className="text-gray-300">
                {animationPhase === 'stopped' 
                  ? 'Your presentation slot has been allocated!'
                  : 'The slot machine is determining your presentation slot'
                }
              </p>
            </motion.div>

            {/* Slot Machine Display */}
            <motion.div
              className="mb-8"
              animate={isAnimating ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{
                duration: 0.3,
                repeat: isAnimating ? Infinity : 0,
                repeatType: "reverse"
              }}
            >
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 mx-auto max-w-32">
                <motion.div
                  key={displayNumber}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl font-bold text-white"
                >
                  {displayNumber.toString().padStart(2, '0')}
                </motion.div>
              </div>
              
              <div className="mt-4">
                <motion.div
                  className="flex justify-center gap-1"
                  animate={isAnimating ? {
                    opacity: [0.3, 1, 0.3]
                  } : { opacity: 1 }}
                  transition={{
                    duration: 1,
                    repeat: isAnimating ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  {[1, 2, 3].map((dot) => (
                    <div
                      key={dot}
                      className="w-2 h-2 bg-yellow-400 rounded-full"
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* Status Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                {animationPhase === 'spinning' && (
                  <div className="flex items-center justify-center gap-2 text-yellow-300">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">Generating random slot...</span>
                  </div>
                )}
                
                {animationPhase === 'slowing' && (
                  <div className="flex items-center justify-center gap-2 text-orange-300">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    <span className="font-medium">Almost there...</span>
                  </div>
                )}
                
                {animationPhase === 'stopped' && allocatedSlot && (
                  <div className="text-green-300">
                    <div className="font-bold text-lg mb-1">
                      Slot #{allocatedSlot.toString().padStart(2, '0')} Allocated!
                    </div>
                    <div className="text-sm">
                      Get ready to showcase your project!
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex gap-3 justify-center"
            >
              {animationPhase === 'stopped' ? (
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Great! Close
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isAnimating}
                    className="border-gray-500 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  
                  {!isAnimating && (
                    <Button
                      onClick={onAllocate}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Allocation
                    </Button>
                  )}
                </>
              )}
            </motion.div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
