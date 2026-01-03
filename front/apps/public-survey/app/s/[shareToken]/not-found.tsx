export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-6 text-6xl">🔍</div>
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Survey Not Found</h1>
        <p className="text-gray-600">
          The survey you're looking for doesn't exist or has been removed.
        </p>
      </div>
    </div>
  );
}
