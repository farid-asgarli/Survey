import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout';
import { Skeleton } from '@/components/ui';
import { User, Shield, Palette, Bell, Sparkles, Key, Accessibility, Globe, LayoutDashboard, Hammer, ChevronRight, Info } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { useUserPreferences } from '@/hooks';
import { cn } from '@/lib/utils';
import {
  ProfileSection,
  SecuritySection,
  AppearanceSection,
  NotificationsSection,
  ApiKeysSection,
  AccessibilitySection,
  RegionalSection,
  DashboardSection,
  SurveyBuilderSection,
  AboutSection,
} from './sections';

// ============================================================
// Loading skeleton for settings
// ============================================================
function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full rounded-3xl" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}

// ============================================================
// Sidebar Navigation Item
// ============================================================
interface NavItemProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, description, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        isActive ? 'bg-primary text-on-primary shadow-sm' : 'hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
          isActive ? 'bg-white/20' : 'bg-surface-container'
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-sm truncate', isActive ? 'text-on-primary' : 'text-on-surface')}>{label}</p>
        {description && <p className={cn('text-xs truncate', isActive ? 'text-on-primary/70' : 'text-on-surface-variant')}>{description}</p>}
      </div>
      <ChevronRight className={cn('h-4 w-4 shrink-0 transition-transform', isActive ? 'text-on-primary/70' : 'text-on-surface-variant/50')} />
    </button>
  );
}

// ============================================================
// Settings Section Groups
// ============================================================
interface SettingsGroup {
  titleKey: string;
  items: {
    id: string;
    labelKey: string;
    descriptionKey?: string;
    icon: React.ElementType;
  }[];
}

const settingsGroups: SettingsGroup[] = [
  {
    titleKey: 'settings.groups.account',
    items: [
      { id: 'profile', labelKey: 'settings.profile.title', descriptionKey: 'settings.profile.description', icon: User },
      { id: 'security', labelKey: 'settings.security.title', descriptionKey: 'settings.security.description', icon: Shield },
      { id: 'api', labelKey: 'apiKeys.title', descriptionKey: 'apiKeys.description', icon: Key },
    ],
  },
  {
    titleKey: 'settings.groups.preferences',
    items: [
      { id: 'appearance', labelKey: 'settings.appearance.title', descriptionKey: 'settings.appearance.description', icon: Palette },
      { id: 'dashboard', labelKey: 'settings.dashboard.title', descriptionKey: 'settings.dashboard.description', icon: LayoutDashboard },
      { id: 'surveyBuilder', labelKey: 'settings.surveyBuilder.title', descriptionKey: 'settings.surveyBuilder.description', icon: Hammer },
    ],
  },
  {
    titleKey: 'settings.groups.personalization',
    items: [
      { id: 'accessibility', labelKey: 'settings.accessibility.title', descriptionKey: 'settings.accessibility.description', icon: Accessibility },
      { id: 'regional', labelKey: 'settings.regional.title', descriptionKey: 'settings.regional.description', icon: Globe },
      { id: 'notifications', labelKey: 'notifications.title', descriptionKey: 'notifications.description', icon: Bell },
    ],
  },
  {
    titleKey: 'settings.groups.about',
    items: [{ id: 'about', labelKey: 'settings.about.title', descriptionKey: 'settings.about.description', icon: Info }],
  },
];

// ============================================================
// Main Settings Page
// ============================================================
export function SettingsPage() {
  const { t } = useTranslation();
  const { isLoading: isAuthLoading } = useAuthStore();
  const [activeSection, setActiveSection] = useState('profile');

  // Fetch user preferences from backend
  const { isLoading: isPreferencesLoading } = useUserPreferences();

  const isLoading = isAuthLoading || isPreferencesLoading;

  // Get current section info
  const allItems = settingsGroups.flatMap((g) => g.items);
  const currentItem = allItems.find((item) => item.id === activeSection);

  const renderContent = () => {
    if (isLoading) return <SettingsSkeleton />;

    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'appearance':
        return <AppearanceSection />;
      case 'dashboard':
        return <DashboardSection />;
      case 'surveyBuilder':
        return <SurveyBuilderSection />;
      case 'accessibility':
        return <AccessibilitySection />;
      case 'regional':
        return <RegionalSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'security':
        return <SecuritySection />;
      case 'api':
        return <ApiKeysSection />;
      case 'about':
        return <AboutSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <Layout>
      <div className="flex h-full overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-outline-variant/30 bg-surface-container-lowest">
          {/* Sidebar Header */}
          <div className="shrink-0 px-4 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-on-surface">{t('settings.title')}</h1>
                <p className="text-xs text-on-surface-variant">{t('settings.description')}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            {settingsGroups.map((group, groupIndex) => (
              <div key={group.titleKey} className={cn(groupIndex > 0 && 'mt-6')}>
                <h2 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/70">{t(group.titleKey)}</h2>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavItem
                      key={item.id}
                      icon={item.icon}
                      label={t(item.labelKey)}
                      isActive={activeSection === item.id}
                      onClick={() => setActiveSection(item.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile Header + Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header with dropdown */}
          <div className="lg:hidden shrink-0 px-4 pt-4 pb-2 border-b border-outline-variant/30 bg-surface-container-lowest">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-on-surface">{t('settings.title')}</h1>
              </div>
            </div>
            {/* Mobile section selector */}
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {settingsGroups.map((group) => (
                <optgroup key={group.titleKey} label={t(group.titleKey)}>
                  {group.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {t(item.labelKey)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
              {/* Section Header */}
              {currentItem && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <currentItem.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-on-surface">{t(currentItem.labelKey)}</h2>
                      {currentItem.descriptionKey && <p className="text-sm text-on-surface-variant">{t(currentItem.descriptionKey)}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Section Content */}
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
