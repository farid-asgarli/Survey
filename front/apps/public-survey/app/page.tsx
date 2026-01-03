export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <main className="max-w-lg px-6 py-12 text-center">
        <div className="mb-8 text-6xl">📋</div>
        <h1 className="mb-4 text-3xl font-bold text-on-surface">Survey Platform</h1>
        <p className="mb-8 text-lg text-on-surface/70">
          This is the public survey application. To take a survey, you need a valid survey link.
        </p>
        <div className="rounded-lg border border-outline/30 bg-surface-container p-4">
          <p className="text-sm text-on-surface/70">Survey links follow the format:</p>
          <code className="mt-2 block text-primary font-mono">/s/[share-token]</code>
        </div>
      </main>
    </div>
  );
}
