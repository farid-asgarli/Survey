import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AzureAdProvider } from '@/components/AzureAdProvider';
import { OfflineIndicator, PageTransitionLoader } from '@/components/ui';

// Eager load auth pages for better UX
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, AzureCallbackPage, NotFoundPage, RouteErrorPage } from '@/pages';

// Lazy load main app pages for code splitting
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const SurveysPage = lazy(() => import('@/pages/Surveys/SurveysPage').then((m) => ({ default: m.SurveysPage })));
const SurveyBuilderPage = lazy(() => import('@/pages/SurveyBuilder/SurveyBuilderPage').then((m) => ({ default: m.SurveyBuilderPage })));
const SurveyPreviewPage = lazy(() => import('@/pages/SurveyPreview/SurveyPreviewPage').then((m) => ({ default: m.SurveyPreviewPage })));
const ResponsesPage = lazy(() => import('@/pages/Responses').then((m) => ({ default: m.ResponsesPage })));
const AnalyticsPage = lazy(() => import('@/pages/Analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const TemplatesPage = lazy(() => import('@/pages/Templates/TemplatesPage').then((m) => ({ default: m.TemplatesPage })));
const ThemesPage = lazy(() => import('@/pages/Themes/ThemesPage').then((m) => ({ default: m.ThemesPage })));
const DistributionsPage = lazy(() => import('@/pages/Distributions/DistributionsPage').then((m) => ({ default: m.DistributionsPage })));
const EmailTemplatesPage = lazy(() => import('@/pages/EmailTemplates/EmailTemplatesPage').then((m) => ({ default: m.EmailTemplatesPage })));
const EmailTemplateEditorPage = lazy(() => import('@/pages/EmailTemplateEditor/EmailTemplateEditorPage').then((m) => ({ default: m.EmailTemplateEditorPage })));
const RecurringSurveysPage = lazy(() => import('@/pages/RecurringSurveys/RecurringSurveysPage').then((m) => ({ default: m.RecurringSurveysPage })));
const SettingsPage = lazy(() => import('@/pages/Settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const NamespacesPage = lazy(() => import('@/pages/Namespaces/NamespacesPage').then((m) => ({ default: m.NamespacesPage })));
const NamespaceSettingsPage = lazy(() => import('@/pages/NamespaceSettings/NamespaceSettingsPage').then((m) => ({ default: m.NamespaceSettingsPage })));

// Public survey page (no auth required)
const PublicSurveyPage = lazy(() => import('@/pages/PublicSurvey/PublicSurveyPage').then((m) => ({ default: m.PublicSurveyPage })));

// Dev pages (lazy loaded, only in development)
const DevTestPage = lazy(() => import('@/pages/DevTest/DevTestPage').then((m) => ({ default: m.DevTestPage })));

// Loading fallback component
function PageLoader() {
  return <PageTransitionLoader />;
}

// Suspense wrapper for lazy-loaded pages
function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// Root layout with error boundary and offline indicator
function RootLayout() {
  return (
    <ErrorBoundary>
      <Outlet />
      <OfflineIndicator position='bottom' />
    </ErrorBoundary>
  );
}

// Create the router with data router API
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      // Public survey route (no auth required, accessible to respondents)
      {
        path: '/s/:shareToken',
        element: (
          <SuspenseWrapper>
            <PublicSurveyPage />
          </SuspenseWrapper>
        ),
      },

      // Public routes (redirect to dashboard if authenticated)
      {
        path: '/login',
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: '/reset-password',
        element: (
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        ),
      },

      // Azure AD SSO callback route
      {
        path: '/auth/azure-callback',
        element: <AzureCallbackPage />,
      },

      // Protected routes (require authentication)
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <DashboardPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: '/surveys',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <SurveysPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: '/surveys/:id/edit',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <SurveyBuilderPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: '/surveys/:id/preview',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <SurveyPreviewPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: '/responses',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <ResponsesPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: '/analytics',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <AnalyticsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: '/analytics/:surveyId',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <AnalyticsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: '/templates',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <TemplatesPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: '/themes',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <ThemesPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: '/distributions',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <DistributionsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: '/email-templates',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <EmailTemplatesPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: '/email-templates/:id/edit',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <EmailTemplateEditorPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: '/recurring-surveys',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <RecurringSurveysPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <SettingsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },

      // Workspace routes
      {
        path: '/workspaces',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <NamespacesPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: '/workspaces/:id/settings',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <NamespaceSettingsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },

      // 404 page
      {
        path: '/404',
        element: <NotFoundPage />,
      },

      // Dev test page (development only)
      ...(import.meta.env.DEV
        ? [
            {
              path: '/dev/test',
              element: (
                <SuspenseWrapper>
                  <DevTestPage />
                </SuspenseWrapper>
              ),
            },
          ]
        : []),

      // Catch-all redirect to 404
      {
        path: '*',
        element: <Navigate to='/404' replace />,
      },
    ],
  },
]);

function App() {
  return (
    <AzureAdProvider>
      <RouterProvider router={router} />
    </AzureAdProvider>
  );
}

export default App;
