/**
 * DecorativeBlobs - M3 Expressive Design
 * Animated background decorative elements for the register page
 */
export function DecorativeBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large tertiary blob */}
      <div
        className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-tertiary/30 to-primary/20 blur-3xl animate-pulse"
        style={{ animationDuration: '4s' }}
      />
      {/* Secondary blob */}
      <div
        className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full bg-linear-to-tr from-primary/25 to-secondary/15 blur-3xl animate-pulse"
        style={{ animationDuration: '5s', animationDelay: '1s' }}
      />
      {/* Primary accent */}
      <div
        className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-linear-to-tl from-primary-container/40 to-tertiary-container/30 blur-3xl animate-pulse"
        style={{ animationDuration: '6s', animationDelay: '2s' }}
      />
    </div>
  );
}
