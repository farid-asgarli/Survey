import { StrictMode, useEffect, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import './i18n'; // Initialize i18n
import App from './App.tsx';
import { useEnvironmentStore } from './stores/environmentStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// App initialization component
function AppInitializer({ children }: { children: ReactNode }) {
  const fetchEnv = useEnvironmentStore((s) => s.fetchEnvironmentData);

  useEffect(() => {
    // Fetch environment data on mount
    fetchEnv();
  }, [fetchEnv]);

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppInitializer>
        <App />
      </AppInitializer>
    </QueryClientProvider>
  </StrictMode>
);
