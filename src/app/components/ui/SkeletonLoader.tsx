// SkeletonLoader.tsx
export function SkeletonLoader({ delay = 0 }: { delay?: number }) {
    return (
      <div
        className="relative w-full h-[400px] rounded-[10px] overflow-hidden shadow animate-pulse bg-gray-300"
        style={{ animationDelay: `${delay}ms` }}
      >
        {/* Simulate the dark overlay text block at bottom center */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 h-16 flex items-center justify-center">
          <div className="h-6 w-2/3 bg-gray-400 rounded"></div>
        </div>
      </div>
    );
  }
  