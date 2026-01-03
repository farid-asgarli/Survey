import { ClipboardList } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <main className="max-w-lg text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
            <ClipboardList className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold text-on-surface font-heading">Survey Platform</h1>

        {/* Description */}
        <p className="mb-8 text-lg text-on-surface-variant">
          This is the public survey application. To take a survey, you need a valid survey link from the survey administrator.
        </p>

        {/* Info box */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
          <p className="text-sm text-on-surface-variant mb-3">Survey links follow the format:</p>
          <code className="block px-4 py-2 rounded-lg bg-surface-container text-primary font-mono text-sm">/s/[share-token]</code>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-on-surface-variant/50">Powered by Survey Platform</p>
      </main>
    </div>
  );
}
