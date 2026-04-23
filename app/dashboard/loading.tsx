export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-900 rounded-lg w-64 animate-pulse"></div>
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800/30 rounded-lg p-4 animate-pulse"
            >
              <div className="h-4 bg-gray-800 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-800 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Widgets Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main widgets */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800/30 rounded-lg p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-800 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-800 rounded"></div>
                <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                <div className="h-4 bg-gray-800 rounded w-4/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
