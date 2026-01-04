export { useAuth } from './useAuth';
export { useAzureAuth, useAzureAdEnabled } from './useAzureAuth';
export { useAzureAdPhoto } from './useAzureAdPhoto';
export type { UseAzureAdPhotoReturn } from './useAzureAdPhoto';
export { useUserAvatar } from './useUserAvatarUrl';
export type { UseUserAvatarReturn } from './useUserAvatarUrl';
export { useNamespace } from './useNamespace';
export { useViewTransitionNavigate } from './useViewTransitionNavigate';
export { useConfirmDialog, useDeleteConfirm } from './useConfirmDialog';
export { useInfiniteScroll, useInfiniteScrollStatus } from './useInfiniteScroll';
export { useListPage } from './useListPage';
export type { FilterConfig, UseListPageOptions, UseListPageReturn, PaginationState } from './useListPage';
export { useEntityAction, useConfirmableAction, useEntityActions } from './useEntityActions';
export type { EntityActionConfig, ConfirmableActionConfig, EntityActionsConfig } from './useEntityActions';
export { useFilteredList, FilterMatchers, SortComparators } from './useFilteredList';
export type { FilterFieldConfig, SearchConfig, SortConfig, UseFilteredListOptions, UseFilteredListReturn } from './useFilteredList';
export { useListPageState } from './useListPageState';
export type { ExtendedFilterConfig, UseListPageStateOptions, UseListPageStateReturn } from './useListPageState';
export { useDebounce, useDebouncedCallback, useDebounceState } from './useDebounce';
export type { UseDebounceStateOptions, UseDebounceStateReturn } from './useDebounce';
export { useDialogState, useMultiDialogState } from './useDialogState';
export type { UseDialogStateOptions, UseDialogStateReturn } from './useDialogState';
export { useDrawerState, useExtendedDrawerState } from './useDrawerState';
export type { DrawerMode, UseDrawerStateOptions, UseDrawerStateReturn, ExtendedDrawerMode, UseExtendedDrawerStateReturn } from './useDrawerState';
export { useCopyToClipboard } from './useCopyToClipboard';
export { useTranslatedPageConfig, useTranslatedNavItems, usePageLabel, getPageLabelKey } from './useTranslatedNav';
export type { TranslatedPageConfig } from './useTranslatedNav';
export {
  useKeyboardShortcuts,
  useEditorShortcuts,
  useEscapeKey,
  createUndoRedoShortcuts,
  createEscapeShortcut,
  createEnterShortcut,
} from './useKeyboardShortcuts';
export type { KeyboardShortcut, ModifierKey, UseKeyboardShortcutsOptions, UndoRedoShortcutsConfig } from './useKeyboardShortcuts';
export { useAutoSave, useEditorAutoSave } from './useAutoSave';
export type { UseAutoSaveOptions, UseAutoSaveReturn } from './useAutoSave';

// React Query utilities
export {
  createQueryKeys,
  createExtendedQueryKeys,
  useInvalidatingMutation,
  useUpdatingMutation,
  useOptimisticMutation,
  useCacheHelpers,
  STALE_TIMES,
  GC_TIMES,
} from './queries/queryUtils';
export type {
  EntityQueryKeys,
  InvalidatingMutationOptions,
  UpdatingMutationOptions,
  OptimisticMutationOptions,
  ApiProblemDetails,
} from './queries/queryUtils';

// React Query hooks
export * from './queries/useUser';
export * from './queries/useNamespaces';
export * from './queries/useSurveys';
export * from './queries/useQuestions';
export * from './queries/useThemes';
export * from './queries/useQuestionLogic';
export * from './queries/useLinks';
export * from './queries/useDistributions';
export * from './queries/useEmailTemplates';
export * from './queries/useResponses';
export * from './queries/useSearch';
export * from './queries/useRecurringSurveys';
export * from './queries/useAnalytics';
export * from './queries/usePreferences';
export * from './queries/useTranslations';

// Translation content hooks
export * from './useTranslatedContent';
export * from './useQuestionEditorTranslation';

// Date/Time formatting
export { useDateTimeFormatter, getDateTimePreferences } from './useDateTimeFormatter';
export type { DateTimeFormatterFunctions } from './useDateTimeFormatter';

// Media Query / Responsive hooks
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeDesktop,
  usePrefersReducedMotion,
  usePrefersDarkMode,
} from './useMediaQuery';

// Drag and Drop
export { useSortableList, reorderArray } from './useSortableList';
export type { UseSortableListOptions, UseSortableListReturn } from './useSortableList';
