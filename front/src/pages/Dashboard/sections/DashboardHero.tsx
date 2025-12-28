import { useTranslation } from 'react-i18next';
import { Plus, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { useViewTransitionNavigate } from '@/hooks';

interface DashboardHeroProps {
  firstName: string;
  greeting: string;
  namespaceName?: string;
}

export function DashboardHero({ firstName, greeting, namespaceName }: DashboardHeroProps) {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();

  return (
    <div className="bg-primary-container/30 border-b-2 border-primary/15">
      <div className="px-5 md:px-6 py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">{namespaceName || t('dashboard.personalWorkspace')}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
              {greeting}, {firstName}!
            </h1>
            <p className="text-on-surface-variant mt-2 text-lg">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/surveys')}>
              <Eye className="h-4 w-4" />
              {t('common.viewAll')}
            </Button>
            <Button variant="filled" onClick={() => navigate('/surveys?create=true')}>
              <Plus className="h-4 w-4" />
              {t('dashboard.newSurvey')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
