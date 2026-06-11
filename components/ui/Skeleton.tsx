export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse w-full" />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
      <SkeletonText lines={2} />
    </div>
  );
}