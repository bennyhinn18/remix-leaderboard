// Profile page loading skeletons


export function ProfileHeaderSkeleton() {
  return (
    <div className="mb-8 bg-white/5 backdrop-blur-lg rounded-xl p-6 relative">
      <div className="absolute inset-0 shimmer"></div>
      <div className="flex items-start gap-6 relative">
        {/* Avatar placeholder */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-white/10"></div>

        <div className="flex-1 space-y-4">
          <div className="h-8 bg-white/10 rounded w-48"></div>
          <div className="h-4 bg-white/10 rounded w-32"></div>
          <div className="h-4 bg-white/10 rounded w-60"></div>

          <div className="flex gap-2 pt-2">
            <div className="h-8 w-24 bg-white/10 rounded-md"></div>
            <div className="h-8 w-24 bg-white/10 rounded-md"></div>
          </div>
        </div>

        {/* Right-side stats */}
        <div className="hidden sm:flex flex-col items-end gap-3">
          <div className="h-6 bg-white/10 rounded w-24"></div>
          <div className="h-10 bg-white/10 rounded-lg w-32"></div>
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center relative">
      <div className="absolute inset-0 shimmer"></div>
      <div className="w-6 h-6 bg-white/10 rounded-full mx-auto mb-2"></div>
      <div className="h-8 bg-white/10 rounded-md w-12 mx-auto mb-2"></div>
      <div className="h-4 bg-white/10 rounded w-16 mx-auto"></div>
    </div>
  );
}

export function SectionSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div
      className="bg-white/5 backdrop-blur-lg rounded-xl p-6 relative"
      style={{ height: `${height}px` }}
    >
      <div className="absolute inset-0 shimmer"></div>
      <div className="h-6 bg-white/10 rounded-md w-32 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-white/10 rounded w-full"></div>
        <div className="h-4 bg-white/10 rounded w-3/4"></div>
        <div className="h-4 bg-white/10 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function StreaksSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 relative">
      <div className="absolute inset-0 shimmer"></div>
      <div className="h-6 bg-white/10 rounded-md w-32 mb-4"></div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white/10 rounded-xl p-4">
            <div className="w-5 h-5 bg-white/20 rounded mb-2"></div>
            <div className="h-6 bg-white/20 rounded w-8 mb-1"></div>
            <div className="h-3 bg-white/20 rounded w-12"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8 flex justify-between items-center">
          <div className="h-6 bg-white/10 rounded w-40"></div>
          <div className="h-6 bg-white/10 rounded w-60"></div>
        </div>

        {/* Profile Header */}
        <ProfileHeaderSkeleton />

        {/* Points Graph */}
        <div
          className="mt-8 bg-white/5 backdrop-blur-lg rounded-xl p-6 relative"
          style={{ height: '200px' }}
        >
          <div className="absolute inset-0 shimmer"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="space-y-6">
            <SectionSkeleton height={150} />
            <SectionSkeleton height={200} />
            <SectionSkeleton height={150} />
          </div>
          <div className="space-y-6">
            <StreaksSkeleton />
            <SectionSkeleton height={150} />
          </div>
        </div>
      </div>
    </div>
  );
}
