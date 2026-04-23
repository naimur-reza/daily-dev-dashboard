export default function JournalLoading() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-800 rounded w-40 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-800 rounded w-32 animate-pulse"></div>
        </div>

        {/* Journal Entries Skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800/60 rounded-xl p-5 animate-pulse"
            >
              {/* Date */}
              <div className="h-4 bg-gray-800 rounded w-48 mb-4"></div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j}>
                    <div className="h-3 bg-gray-800 rounded w-16 mb-2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-800 rounded"></div>
                      <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-800 rounded w-4/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
