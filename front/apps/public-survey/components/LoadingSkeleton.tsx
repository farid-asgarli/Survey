/**
 * Loading Skeleton - Survey loading placeholder
 * Matches admin preview styling with M3 Expressive design
 */

export function LoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-pulse">
      {/* Progress bar skeleton */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between mb-2">
          <div className="h-4 w-20 bg-surface-container-high rounded" />
          <div className="h-4 w-10 bg-surface-container-high rounded" />
        </div>
        <div className="h-1.5 sm:h-2 bg-surface-container-high rounded-full" />
      </div>

      {/* Question counter chip skeleton */}
      <div className="mb-4 sm:mb-6">
        <div className="h-8 w-36 bg-surface-container-high rounded-full" />
      </div>

      {/* Question card skeleton */}
      <div className="bg-surface-container-low rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-outline-variant/30">
        {/* Question title */}
        <div className="space-y-3 mb-4 sm:mb-6">
          <div className="h-6 sm:h-7 bg-surface-container-high rounded w-3/4" />
          <div className="h-4 bg-surface-container-high rounded w-1/2" />
        </div>

        {/* Answer options skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 sm:h-14 bg-surface-container-high rounded-xl sm:rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Navigation skeleton */}
      <div className="flex justify-between mt-6 sm:mt-8 gap-4">
        <div className="h-11 w-24 sm:w-28 bg-surface-container-high rounded-full" />
        <div className="h-11 w-24 sm:w-28 bg-surface-container-high rounded-full" />
      </div>
    </div>
  );
}
