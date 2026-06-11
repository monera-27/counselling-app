export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };
  return (
    <div
      className={`animate-spin rounded-full border-gray-300 border-t-primary-600 ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

// Skeleton loader for content
export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  );
}