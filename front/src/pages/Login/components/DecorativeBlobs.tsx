/**
 * DecorativeBlobs Component
 *
 * Provides animated background blobs for the login page illustration panel.
 * Uses Material Design 3 expressive style with gradient effects.
 */
export function DecorativeBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large primary blob */}
      <div
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-linear-to-br from-primary/30 to-tertiary/20 blur-3xl animate-pulse"
        style={{ animationDuration: '4s' }}
      />
      {/* Secondary blob */}
      <div
        className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-linear-to-tr from-secondary/25 to-primary/15 blur-3xl animate-pulse"
        style={{ animationDuration: '5s', animationDelay: '1s' }}
      />
      {/* Tertiary accent */}
      <div
        className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-linear-to-tl from-tertiary-container/40 to-primary-container/30 blur-3xl animate-pulse"
        style={{ animationDuration: '6s', animationDelay: '2s' }}
      />
    </div>
  );
}
