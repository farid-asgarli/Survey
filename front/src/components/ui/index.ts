// UI Components Barrel Export

// Base components
export { Button, buttonVariants } from './Button';
export type { ButtonProps } from './Button';

// Azure AD Login Button
export { AzureAdLoginButton } from './AzureAdLoginButton';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants } from './Card';

export { Input, inputVariants } from './Input';
export type { InputProps } from './Input';

export { Textarea, textareaVariants } from './Textarea';
export type { TextareaProps } from './Textarea';

export { Select } from './Select';
export type { SelectOption, SelectProps } from './Select';

// Date picker components
export { DatePicker, DateRangePicker, DEFAULT_PRESETS } from './DatePicker';
export type { DatePickerProps, DateRangePickerProps, DatePreset } from './DatePicker';

// Time picker components
export { TimePicker } from './TimePicker';
export type { TimePickerProps } from './TimePicker';

// Action components
export { FAB, fabVariants } from './FAB';
export { IconButton, iconButtonVariants } from './IconButton';

// Selection components
export { Checkbox } from './Checkbox';
export type { CheckboxProps } from './Checkbox';
export { Radio, RadioGroup } from './Radio';
export { Switch } from './Switch';
export { SelectionCard, SelectionCardLabel, SelectionCardDescription, SelectionCardIcon, SelectionCardGroup, SelectionField } from './SelectionCard';
export type { SelectionCardSize, SelectionCardShape } from './SelectionCard';

// Display components
export { Chip, chipVariants } from './Chip';
export { Badge, badgeVariants } from './Badge';
export { Avatar, AvatarGroup } from './Avatar';
export { ListItem, ListItemIcon, ListDivider, ListSectionHeader } from './ListItem';
export { IconContainer, iconContainerVariants } from './IconContainer';
export type { IconContainerProps } from './IconContainer';
export { Stat, statVariants } from './Stat';
export type { StatProps } from './Stat';

// Feedback components
export { LinearProgress, CircularProgress, LoadingDots, LoadingIndicator } from './Progress';
export { LoadingState, PageLoading, InlineLoading } from './LoadingState';
export type { LoadingStateProps, PageLoadingProps, InlineLoadingProps } from './LoadingState';
export { AppLoadingScreen, LoadingSpinner, PageTransitionLoader } from './AppLoadingScreen';
export type { AppLoadingScreenProps, LoadingSpinnerProps } from './AppLoadingScreen';
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonSurveyCard,
  SkeletonListItem,
  SkeletonStatsCard,
  SkeletonPageHeader,
  SkeletonPage,
  SkeletonForm,
  SkeletonChart,
} from './Skeleton';
export { ToastContainer, Snackbar, toast, useToastStore } from './Toast';

// Empty states & Error handling
export { EmptyState, EmptyStateSurveys, EmptyStateResponses, EmptyStateTemplates, EmptyStateSearch, EmptyStateError, presetIcons } from './EmptyState';
export type { EmptyStateAction, EmptyStateProps } from './EmptyState';
export { OfflineIndicator, useOnlineStatus, OnlineOnly } from './OfflineIndicator';

// Overlay components
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from './Dialog';

export { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter, DrawerHandle } from './Drawer';

export { OverlayHeader } from './HeroHeader';
export type { OverlayHeaderProps, OverlayHeaderVariant } from './HeroHeader';

export { Menu, MenuItem, MenuSeparator } from './Menu';

// Navigation components
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
export { Breadcrumbs, useBreadcrumbs, createBreadcrumbsFromPath } from './Breadcrumbs';
export type { BreadcrumbItem } from './Breadcrumbs';

// List page components
export { ViewModeToggle } from './ViewModeToggle';
export type { ViewMode } from './ViewModeToggle';
export { SearchInput } from './SearchInput';
export { ActiveFiltersBar } from './ActiveFiltersBar';
export type { ActiveFilter } from './ActiveFiltersBar';
export { ListContainer, ListGrid, GridSkeleton } from './ListContainer';
export { ListEmptyState, createListEmptyState } from './ListEmptyState';
export type { ListEmptyStateConfig, ListEmptyStateProps, InlineListEmptyStateProps } from './ListEmptyState';

// Utility components
export { Tooltip, Divider } from './Tooltip';

// Color & Number inputs
export { ColorPicker, ColorSwatch, presetColors } from './ColorPicker';
export type { ColorPickerProps } from './ColorPicker';
export { NumberStepper, numberStepperVariants } from './NumberStepper';
export type { NumberStepperProps } from './NumberStepper';
export { SegmentedButtonGroup, SegmentedButton } from './SegmentedButton';
export type { SegmentedButtonGroupProps, SegmentedButtonProps } from './SegmentedButton';

// Media components
export { ImageUploader } from './ImageUploader';
export type { ImageUploaderProps } from './ImageUploader';

// Internationalization
export { LanguageSwitcher } from './LanguageSwitcher';

// Onboarding
export { OnboardingWizard } from './OnboardingWizard';
export { GettingStartedWizard } from './GettingStartedWizard';
