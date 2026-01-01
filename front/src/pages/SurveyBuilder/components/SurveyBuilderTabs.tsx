// Survey Builder Tabs - M3 Expressive Design
//
// Uses the existing Tabs component with 'pills' variant for consistent styling.
// Follows M3 Expressive principles:
// - Rounded-full badges
// - Semantic color tokens
// - No shadows
//
// Tabs:
// - Questions (default) - Main survey building interface
// - Languages - Translation management

import { useTranslation } from 'react-i18next';
import { ListChecks, Globe } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { cn } from '@/lib/utils';

export type BuilderTab = 'questions' | 'languages';

interface SurveyBuilderTabsProps {
  /** Currently active tab */
  activeTab: BuilderTab;
  /** Callback when tab changes */
  onTabChange: (tab: BuilderTab) => void;
  /** Number of languages configured */
  languageCount: number;
  /** Number of questions */
  questionCount: number;
  /** Whether there are incomplete translations */
  hasIncompleteTranslations?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Tab badge component for displaying counts
 */
function TabBadge({ count, isActive }: { count: number; isActive: boolean }) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-semibold rounded-full',
        isActive ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
      )}
    >
      {count}
    </span>
  );
}

/**
 * Warning indicator dot for incomplete translations
 */
function WarningDot() {
  return <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-warning ring-2 ring-surface animate-pulse" />;
}

export function SurveyBuilderTabs({
  activeTab,
  onTabChange,
  languageCount,
  questionCount,
  hasIncompleteTranslations = false,
  className,
}: SurveyBuilderTabsProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('border-b border-outline-variant/20 bg-surface-container-lowest', className)}>
      <div className="flex items-center gap-6 px-6 py-3">
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as BuilderTab)} variant="pills">
          <TabsList className="h-11">
            {/* Questions Tab */}
            <TabsTrigger value="questions" icon={<ListChecks className="w-4 h-4" />} className="relative px-4">
              {t('surveyBuilder.tabs.questions', 'Questions')}
              <TabBadge count={questionCount} isActive={activeTab === 'questions'} />
            </TabsTrigger>

            {/* Languages Tab */}
            <TabsTrigger value="languages" icon={<Globe className="w-4 h-4" />} className="relative px-4">
              {t('surveyBuilder.tabs.languages', 'Languages')}
              <TabBadge count={languageCount} isActive={activeTab === 'languages'} />
              {hasIncompleteTranslations && <WarningDot />}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
