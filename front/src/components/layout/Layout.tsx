import { type ReactNode, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { NavigationRail, NavigationRailItem, NavigationBar, NavigationBarItem } from './NavigationRail';
import { AppBar } from './AppBar';
import { NamespaceSelector } from './NamespaceSelector';
import { UserMenu } from './UserMenu';
import { ToastContainer } from '@/components/ui';
import { CreateNamespaceDialog } from '@/components/features/namespaces';
import { GlobalSearch, SearchButton, KeyboardShortcutsHelp } from '@/components/features/search';
import { useNamespacesList, useViewTransitionNavigate, useTranslatedNavItems, useTranslatedPageConfig } from '@/hooks';
import { useSearchStore, useShortcutsStore, useKeyboardShortcut, useGlobalKeyboardListener, useActiveNamespace } from '@/stores';
import { Bell, Building2 } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

// Compact Namespace Selector for Navigation Rail
function CompactNamespaceSelector() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const activeNamespace = useActiveNamespace();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Get initials from namespace name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className='relative'>
      <button
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-2xl',
          'bg-primary-container text-on-primary-container',
          'transition-all duration-200 hover:scale-105'
        )}
        title={activeNamespace?.name || t('workspaces.selectWorkspace')}
      >
        {activeNamespace ? <span className='text-sm font-bold'>{getInitials(activeNamespace.name)}</span> : <Building2 className='h-5 w-5' />}
      </button>
    </div>
  );
}

// Get navigation items from centralized config
// (These will be used with translation hooks inside the component)

export function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useViewTransitionNavigate();
  const [createNamespaceOpen, setCreateNamespaceOpen] = useState(false);

  // Get translated navigation items
  const mainNavItems = useTranslatedNavItems('main');
  const secondaryNavItems = useTranslatedNavItems('secondary');
  const settingsConfig = useTranslatedPageConfig('settings');

  // Fetch namespaces for the current user - this populates the namespace store
  useNamespacesList();

  // Global keyboard listener
  useGlobalKeyboardListener();

  // Get search and shortcuts state
  const { toggleSearch, addRecentItem } = useSearchStore();
  const { toggleHelp } = useShortcutsStore();

  // Register global keyboard shortcuts
  useKeyboardShortcut('global-search', ['Mod', 'K'], toggleSearch, {
    description: 'Open search',
    category: 'general',
  });

  useKeyboardShortcut('global-search-alt', ['Mod', '/'], toggleSearch, {
    description: 'Open search (alt)',
    category: 'general',
  });

  useKeyboardShortcut('keyboard-help', ['Mod', '?'], toggleHelp, {
    description: 'Show keyboard shortcuts',
    category: 'general',
  });

  useKeyboardShortcut('go-home', ['G', 'H'], () => navigate('/'), {
    description: 'Go to dashboard',
    category: 'navigation',
  });

  useKeyboardShortcut('go-surveys', ['G', 'S'], () => navigate('/surveys'), {
    description: 'Go to surveys',
    category: 'navigation',
  });

  useKeyboardShortcut('go-templates', ['G', 'T'], () => navigate('/templates'), {
    description: 'Go to templates',
    category: 'navigation',
  });

  useKeyboardShortcut('go-settings', ['G', ','], () => navigate('/settings'), {
    description: 'Go to settings',
    category: 'navigation',
  });

  useKeyboardShortcut('go-recurring', ['G', 'R'], () => navigate('/recurring-surveys'), {
    description: 'Go to recurring surveys',
    category: 'navigation',
  });

  useKeyboardShortcut('new-survey', ['Mod', 'N'], () => navigate('/surveys?action=new'), {
    description: 'Create new survey',
    category: 'actions',
  });

  // Track page visits for recent items
  useEffect(() => {
    const path = location.pathname;

    // Track survey builder visits
    const surveyMatch = path.match(/^\/surveys\/([^/]+)\/edit$/);
    if (surveyMatch) {
      const title = document.title.replace(' - Survey App', '').replace('Edit: ', '');
      addRecentItem({
        id: surveyMatch[1],
        type: 'survey',
        title: title || 'Survey',
        url: path,
      });
    }

    // Track template visits
    const templateMatch = path.match(/^\/templates\/([^/]+)$/);
    if (templateMatch) {
      addRecentItem({
        id: templateMatch[1],
        type: 'template',
        title: document.title.replace(' - Survey App', '') || 'Template',
        url: path,
      });
    }

    // Track theme visits
    const themeMatch = path.match(/^\/themes\/([^/]+)$/);
    if (themeMatch) {
      addRecentItem({
        id: themeMatch[1],
        type: 'theme',
        title: document.title.replace(' - Survey App', '') || 'Theme',
        url: path,
      });
    }
  }, [location.pathname, addRecentItem]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className='flex h-screen w-full bg-surface overflow-hidden'>
      {/* Desktop Navigation Rail */}
      <aside className='hidden md:flex flex-col h-full'>
        <NavigationRail className='flex-1'>
          {/* Namespace Selector */}
          <div className='mb-4 mt-1'>
            <CompactNamespaceSelector />
          </div>

          {/* Main navigation items */}
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavigationRailItem
                key={item.path}
                icon={<Icon className='h-5 w-5' />}
                label={item.label}
                active={isActive(item.path)}
                onClick={() => navigate(item.path)}
              />
            );
          })}

          {/* Divider */}
          <div className='w-10 h-px bg-outline-variant/30 my-2' />

          {/* Secondary navigation items */}
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavigationRailItem
                key={item.path}
                icon={<Icon className='h-5 w-5' />}
                label={item.label}
                active={isActive(item.path)}
                onClick={() => navigate(item.path)}
              />
            );
          })}

          {/* Bottom items */}
          <div className='mt-auto mb-2 flex flex-col items-center gap-1'>
            {(() => {
              const Icon = settingsConfig.icon;
              return (
                <NavigationRailItem
                  icon={<Icon className='h-5 w-5' />}
                  label={settingsConfig.label}
                  active={isActive(settingsConfig.path)}
                  onClick={() => navigate(settingsConfig.path)}
                />
              );
            })()}
          </div>
        </NavigationRail>
      </aside>

      {/* Main content area */}
      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        {/* Top App Bar - only show on Dashboard */}
        {location.pathname === '/' && (
          <AppBar
            leading={<NamespaceSelector className='hidden sm:block' onCreateNew={() => setCreateNamespaceOpen(true)} />}
            trailing={
              <div className='flex items-center gap-1'>
                {/* Search button - show compact on smaller screens */}
                <SearchButton variant='compact' className='hidden lg:flex' />
                <SearchButton variant='icon' className='lg:hidden' />

                <button
                  aria-label={t('common.notifications')}
                  className={cn(
                    'relative p-2.5 rounded-full',
                    'hover:bg-surface-container-high transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
                  )}
                >
                  <Bell className='h-5 w-5 text-on-surface-variant' />
                  <span className='absolute top-2 right-2 h-2 w-2 rounded-full bg-error' />
                </button>
                <UserMenu onSettingsClick={() => navigate('/settings')} onLogoutClick={() => navigate('/login')} />
              </div>
            }
          />
        )}

        {/* Page content */}
        <main className='flex-1 overflow-y-auto'>{children}</main>
      </div>

      {/* Mobile Navigation Bar */}
      <NavigationBar>
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavigationBarItem
              key={item.path}
              icon={<Icon className='h-5 w-5' />}
              label={item.label}
              active={isActive(item.path)}
              onClick={() => navigate(item.path)}
            />
          );
        })}
      </NavigationBar>

      {/* Toast container */}
      <ToastContainer />

      {/* Create Namespace Dialog */}
      <CreateNamespaceDialog open={createNamespaceOpen} onOpenChange={setCreateNamespaceOpen} />

      {/* Global Search Dialog */}
      <GlobalSearch />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />
    </div>
  );
}
