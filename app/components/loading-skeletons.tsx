import { motion } from "framer-motion";

export function ActivitySkeleton() {
  return (
    <div className="p-3 bg-white/5 rounded-lg animate-pulse overflow-hidden relative">
      <div className="absolute inset-0 shimmer"></div>
      <div className="flex items-center gap-3 relative">
        <div className="w-10 h-10 rounded-full bg-white/10"></div>
        <div className="flex-1">
          <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-white/10 rounded w-2/3"></div>
        </div>
        <div className="w-10 h-3 bg-white/10 rounded"></div>
      </div>
    </div>
  );
}

export function AnnouncementSkeleton() {
  return (
    <div className="p-3 bg-white/5 rounded-lg overflow-hidden relative">
      <div className="absolute inset-0 shimmer"></div>
      <div className="flex justify-between items-start relative">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-3"></div>
        <div className="h-4 w-16 bg-white/10 rounded-full"></div>
      </div>
      <div className="h-3 bg-white/10 rounded w-full mb-2"></div>
      <div className="h-3 bg-white/10 rounded w-2/3"></div>
      <div className="flex justify-between mt-3">
        <div className="h-2 bg-white/10 rounded w-1/4"></div>
        <div className="h-2 bg-white/10 rounded w-1/5"></div>
      </div>
    </div>
  );
}

export function EventSkeleton() {
  return (
    <div className="p-3 bg-white/5 rounded-lg overflow-hidden relative">
      <div className="absolute inset-0 shimmer"></div>
      <div className="flex justify-between items-start relative">
        <div className="h-4 bg-white/10 rounded w-1/2 mb-3"></div>
        <div className="h-4 w-16 bg-white/10 rounded-full"></div>
      </div>
      <div className="h-3 bg-white/10 rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-white/10 rounded w-1/3"></div>
    </div>
  );
}

export function LoadingSkeleton({ type, count = 3 }) {
  const Component = 
    type === 'activity' ? ActivitySkeleton :
    type === 'announcement' ? AnnouncementSkeleton :
    type === 'event' ? EventSkeleton : ActivitySkeleton;
  
  return (
    <motion.div 
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </motion.div>
  );
}
