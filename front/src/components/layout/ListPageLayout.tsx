import { type ReactNode, type HTMLAttributes, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Layout, PageHeader, type PageHeaderProps } from '../layout';
import { FAB } from '../ui/FAB';
import { ViewModeToggle, type ViewMode } from '../ui/ViewModeToggle';
import { SearchInput } from '../ui/SearchInput';
import { ActiveFiltersBar, type ActiveFilter } from '../ui/ActiveFiltersBar';

/**
 * Context for sharing list page state between compound components.
 */
interface ListPageContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilters: ActiveFilter[];
  onClearAllFilters?: () => void;
}

const ListPageContext = createContext<ListPageContextValue | null>(null);

function useListPageContext(): ListPageContextValue {
  const context = useContext(ListPageContext);
  if (!context) {
    throw new Error('ListPageLayout compound components must be used within a ListPageLayout');
  }
  return context;
}

/**
 * Props for the ListPageLayout component.
 */
export interface ListPageLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Children to render */
  children: ReactNode;

  // View mode state
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;

  // Search state
  searchQuery?: string;
  onSearchChange?: (query: string) => void;

  // Active filters for display
  activeFilters?: ActiveFilter[];
  onClearAllFilters?: () => void;
}

/**
 * A compound component layout for list pages that provides a consistent structure.
 * Handles the common pattern of: Layout > Header > Filters > Content > FAB > Dialogs.
 *
 * @example
 * ```tsx
 * <ListPageLayout
 *   viewMode={viewMode}
 *   onViewModeChange={setViewMode}
 *   searchQuery={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   activeFilters={activeFilters}
 *   onClearAllFilters={clearAllFilters}
 * >
 *   <ListPageLayout.Header
 *     title="Surveys"
 *     description="Manage your surveys"
 *     icon={<FileText className="h-6 w-6 text-primary" />}
 *   />
 *
 *   <ListPageLayout.Toolbar>
 *     <Tabs value={filter} onValueChange={setFilter}>
 *       <TabsList>...</TabsList>
 *     </Tabs>
 *   </ListPageLayout.Toolbar>
 *
 *   <ListPageLayout.Content>
 *     {content}
 *   </ListPageLayout.Content>
 *
 *   <ListPageLayout.FAB onClick={handleCreate} />
 * </ListPageLayout>
 * ```
 */
function ListPageLayout({
  children,
  viewMode = 'grid',
  onViewModeChange = () => {},
  searchQuery = '',
  onSearchChange = () => {},
  activeFilters = [],
  onClearAllFilters,
  className,
  ...props
}: ListPageLayoutProps) {
  const contextValue: ListPageContextValue = {
    viewMode,
    setViewMode: onViewModeChange,
    searchQuery,
    setSearchQuery: onSearchChange,
    activeFilters,
    onClearAllFilters,
  };

  return (
    <ListPageContext.Provider value={contextValue}>
      <Layout>
        <div className={cn('flex flex-col h-full', className)} {...props}>
          {children}
        </div>
      </Layout>
    </ListPageContext.Provider>
  );
}

/**
 * Header section of the list page.
 */
function Header(props: PageHeaderProps) {
  return <PageHeader {...props} />;
}

/**
 * Toolbar section containing filters, search, and view mode toggle.
 */
export interface ListPageToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Primary content (usually tabs or filter buttons) */
  children: ReactNode;
  /** Whether to show the search input */
  showSearch?: boolean;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
  /** Whether to show the view mode toggle */
  showViewModeToggle?: boolean;
  /** Additional actions to render after the search/toggle */
  actions?: ReactNode;
}

function Toolbar({ children, showSearch = true, searchPlaceholder, showViewModeToggle = true, actions, className, ...props }: ListPageToolbarProps) {
  const { t } = useTranslation();
  const { viewMode, setViewMode, searchQuery, setSearchQuery } = useListPageContext();

  return (
    <div className={cn('px-4 md:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-4 border-b border-outline-variant/30', className)} {...props}>
      {/* Primary content (tabs, filter buttons, etc.) */}
      {children}

      {/* Right side: search, view toggle, actions */}
      <div className="flex items-center gap-3 sm:ml-auto">
        {showSearch && <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder={searchPlaceholder ?? t('common.searchDots')} />}

        {showViewModeToggle && (
          <div className="hidden md:block">
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>
        )}

        {actions}
      </div>
    </div>
  );
}

/**
 * Active filters bar that displays below the toolbar.
 */
function FiltersBar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { activeFilters, onClearAllFilters } = useListPageContext();

  if (activeFilters.length === 0) return null;

  return (
    <div className={cn('px-4 md:px-6 pb-4', className)} {...props}>
      <ActiveFiltersBar filters={activeFilters} onClearAll={onClearAllFilters} />
    </div>
  );
}

/**
 * Main content area of the list page.
 */
export interface ListPageContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function Content({ children, className, ...props }: ListPageContentProps) {
  return (
    <div className={cn('flex-1 overflow-auto p-4 md:px-6 md:pb-6', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * FAB (Floating Action Button) for mobile create actions.
 */
export interface ListPageFABProps {
  /** Icon to display in the FAB */
  icon: ReactNode;
  /** Optional label for extended FAB */
  label?: string;
  /** Click handler */
  onClick?: () => void;
  /** Only show on mobile */
  mobileOnly?: boolean;
}

function ListPageFAB({ mobileOnly = true, icon, label, onClick }: ListPageFABProps) {
  return <FAB className={mobileOnly ? 'md:hidden' : undefined} icon={icon} label={label} onClick={onClick} />;
}

/**
 * Container for dialogs at the end of the page.
 */
interface ListPageDialogsProps {
  children: ReactNode;
}

function Dialogs({ children }: ListPageDialogsProps) {
  return <>{children}</>;
}

// Attach compound components
ListPageLayout.Header = Header;
ListPageLayout.Toolbar = Toolbar;
ListPageLayout.FiltersBar = FiltersBar;
ListPageLayout.Content = Content;
ListPageLayout.FAB = ListPageFAB;
ListPageLayout.Dialogs = Dialogs;

export { ListPageLayout, useListPageContext };
