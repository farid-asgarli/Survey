import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface PublicSurveyLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function PublicSurveyLayout({ children, title }: PublicSurveyLayoutProps) {
  const { t } = useTranslation();

  // Update page title
  useEffect(() => {
    if (title) {
      document.title = `${title} | Survey`;
    } else {
      document.title = 'Survey';
    }
    return () => {
      document.title = 'Survey App';
    };
  }, [title]);

  return (
    <div className="min-h-screen bg-surface">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto min-h-screen flex flex-col">
        {/* Main content */}
        <main className="flex-1 flex flex-col justify-center py-8">{children}</main>

        {/* Footer */}
        <footer className="py-6 text-center">
          <p className="text-sm text-on-surface-variant/50">{t('publicSurveyPage.poweredBy')}</p>
        </footer>
      </div>
    </div>
  );
}
