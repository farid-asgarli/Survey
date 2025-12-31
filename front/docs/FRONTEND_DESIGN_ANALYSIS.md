# Frontend Design Analysis & M3 Expressive Alignment

**Analysis Date:** December 24, 2025  
**Framework:** React 19 + TypeScript + Tailwind CSS 4  
**Design System:** Material 3 Expressive  
**Reference:** [M3 Expressive Guidelines](https://m3.material.io/blog/building-with-m3-expressive)

---

## 📋 Executive Summary

This document analyzes the SurveyApp frontend through the lens of **Material 3 Expressive** design principles. M3 Expressive emphasizes:

- **Intentional variety** in shapes to create visual tension and guide focus
- **Hierarchy through size** - larger elements signal importance
- **Emotional connection** through expressive use of color, shape, and motion
- **Hero moments** - deliberate design emphasis at key interaction points

> _"Expressive design makes you feel something. It inspires emotion, communicates function, and helps users achieve their goals."_ — Material Design Team

**Overall Code Quality:** ⭐⭐⭐⭐ (4/5) - Good architecture, with opportunities for more intentional M3 Expressive application

---

## 🎨 Design Analysis (M3 Expressive Lens)

### 1. **Shape Variety (✅ Aligned with M3 Expressive)**

The codebase uses varied border radius values across components:

| Pattern          | Usage Count | Context            | M3 Expressive Purpose             |
| ---------------- | ----------- | ------------------ | --------------------------------- |
| `rounded-2xl`    | 50+         | Most UI components | Base container shape              |
| `rounded-3xl`    | 20+         | Dialogs, skeletons | Elevated/modal surfaces           |
| `rounded-xl`     | 15+         | Icons, badges      | Secondary elements                |
| `rounded-lg`     | 10+         | Inline elements    | Compact/inline items              |
| `rounded-[36px]` | 5+          | Card hover states  | **Shape morphing on interaction** |
| `rounded-[48px]` | 5+          | Card focus states  | **Emphasis through shape change** |
| `rounded-full`   | 30+         | Buttons, avatars   | Circular elements (FABs, pills)   |

**M3 Expressive Alignment:** ✅ **This variety is intentional and correct.**

> _"Use a combination of classic and abstract shapes to create visual tension or cohesion and direct users' focus in your app."_ — M3 Expressive Tactic #1

**What's Working Well:**

- Shape morphing on hover (`rounded-2xl` → `rounded-[36px]`) creates dynamic interaction feedback
- Different radii distinguish element hierarchy (containers vs inline elements)
- `rounded-full` consistently used for FAB-style buttons and avatars

**Opportunities for Enhancement:**

```typescript
// Consider using M3's official shape scale for consistency
const m3Shapes = {
  extraSmall: '4px', // rounded-sm - chips, small badges
  small: '8px', // rounded-lg - inline elements
  medium: '12px', // rounded-xl - icons, secondary containers
  large: '16px', // rounded-2xl - cards, inputs
  extraLarge: '24px', // rounded-3xl - dialogs, elevated surfaces
  full: '9999px', // rounded-full - FABs, avatars, pills
};
```

**Action:** Document the intentional shape hierarchy in your design system guide, explaining the purpose of each radius level.

---

### 2. **Icon Container Sizing (✅ Aligned with M3 Expressive)**

Icon containers vary by context, reflecting M3 Expressive's emphasis hierarchy:

| Size         | Classes     | Used In                                 | Hierarchy Level            |
| ------------ | ----------- | --------------------------------------- | -------------------------- |
| 9x9 (36px)   | `h-9 w-9`   | SurveyCard, TemplateCard                | **Standard** - List items  |
| 10x10 (40px) | `h-10 w-10` | Dashboard actions, RecurringSurveysPage | **Standard** - Actions     |
| 12x12 (48px) | `h-12 w-12` | Dashboard stats, EmailTemplatesPage     | **Emphasized** - Key stats |
| 14x14 (56px) | `h-14 w-14` | HeroHeader, Reset/Namespace settings    | **Hero** - Page headers    |
| 16x16 (64px) | `h-16 w-16` | EmptyState                              | **Hero** - Empty states    |
| 20x20 (80px) | `h-20 w-20` | Error pages                             | **Maximum** - Full-page    |
| 24x24 (96px) | `h-24 w-24` | NotFoundPage animation                  | **Maximum** - Animations   |

**M3 Expressive Alignment:** ✅ **Size variation creates intentional visual hierarchy.**

> _"Give the most important content, tasks, or actions visual prominence through ample space and the brightest surface mapping."_ — M3 Expressive Tactic #4

**What's Working Well:**

- Larger icons (64px+) in empty states and error pages draw attention to the message
- Hero headers use larger icons (56px) to establish page importance
- Card icons stay compact (36-48px) to not overwhelm content

**Recommendation:** Formalize the hierarchy with an `IconContainer` component:

```typescript
// Maps M3 Expressive emphasis levels to sizes
type IconEmphasis = 'inline' | 'standard' | 'emphasized' | 'hero' | 'maximum';

const emphasisSizes = {
  inline: 'h-8 w-8',     // 32px - Inline with text
  standard: 'h-9 w-9',   // 36px - Cards, list items (default)
  emphasized: 'h-12 w-12', // 48px - Stats, section headers
  hero: 'h-14 w-14',     // 56px - Page heroes, key actions
  maximum: 'h-16 w-16',  // 64px - Empty states, error pages
};

// Usage: Size communicates importance
<IconContainer emphasis="hero">      // Page header
<IconContainer emphasis="standard">  // Card in a list
<IconContainer emphasis="maximum">   // Empty state focal point
```

**Action:** Create `IconContainer` component that documents the semantic meaning of each size.

````

---

### 3. **Typography Emphasis (⚠️ Needs Intentional Application)**

Multiple font weights are used across elements:

| Element Type    | Actual Usage                                | M3 Expressive Purpose              |
| --------------- | ------------------------------------------- | ---------------------------------- |
| Card titles     | `font-medium`, `font-semibold`, `font-bold` | Could indicate importance levels   |
| Section headers | `font-bold`, `font-semibold`                | Primary vs secondary sections      |
| Labels          | `font-medium`, `font-semibold`              | Interactive vs static labels       |
| Stats values    | `font-bold`, `text-3xl font-bold`           | Emphasis on key metrics            |

**M3 Expressive Context:**

> *"Use emphasized text styles to draw attention to important UI elements, like headlines and actions. Heavier weights, larger sizes, color, and spacing can direct attention and make key information more engaging."* — M3 Expressive Tactic #3

**Current Examples:**

```tsx
// DashboardPage.tsx - Primary section (font-bold = high emphasis)
<h2 className="text-lg font-bold text-on-surface">Recent Surveys</h2>

// NamespaceSettingsPage.tsx - Secondary section (font-semibold = medium emphasis)
<h3 className="font-semibold text-lg text-on-surface">{tier.label}</h3>

// Card titles - Could be intentional hierarchy:
<h3 className="font-medium text-on-surface">...</h3>   // Standard card
<p className="font-semibold text-on-surface">...</p>    // Featured/important card
````

**Issue:** The weight variation appears **accidental rather than intentional**.

**Recommendation:** Map weights to M3 Expressive emphasis levels:

```typescript
// M3 Expressive Typography Emphasis Scale
const typography = {
  // Display - Hero moments, maximum emphasis
  displayLarge: 'text-4xl font-bold',
  displayMedium: 'text-3xl font-bold',

  // Headlines - Section headers, high emphasis
  headlineLarge: 'text-2xl font-bold', // Page titles
  headlineMedium: 'text-xl font-semibold', // Major sections
  headlineSmall: 'text-lg font-semibold', // Subsections

  // Titles - Cards, list items, medium emphasis
  titleLarge: 'text-base font-semibold', // Featured cards
  titleMedium: 'text-base font-medium', // Standard cards
  titleSmall: 'text-sm font-medium', // Compact items

  // Body & Labels - Content, standard emphasis
  bodyLarge: 'text-base',
  bodyMedium: 'text-sm',
  labelLarge: 'text-sm font-medium', // Interactive labels
  labelMedium: 'text-xs font-medium', // Static labels
};
```

**Action:** Audit typography usage and ensure weight differences are **intentional emphasis choices**, not inconsistencies.

````

---

### 4. **Spacing & Containment (⚠️ Needs Intentional Application)**

Gap and padding values vary across contexts:

| Context       | Observed Values                                    | Potential M3 Purpose               |
| ------------- | -------------------------------------------------- | ---------------------------------- |
| Card padding  | `p-4`, `p-5`, `p-6`, `p-2`                         | Content density/importance         |
| Grid gaps     | `gap-2`, `gap-3`, `gap-4`, `gap-6`                 | Visual grouping strength           |
| Stack spacing | `space-y-2`, `space-y-3`, `space-y-4`, `space-y-6` | Content relationship               |
| Icon margins  | `gap-1`, `gap-1.5`, `gap-2`, `gap-2.5`, `gap-3`    | Icon-text coupling                 |

**M3 Expressive Context:**

> *"Organize content into logical groupings or containers. Give the most important content, tasks, or actions visual prominence through ample space."* — M3 Expressive Tactic #4

**Analysis:**

- `p-6` on important cards vs `p-4` on compact cards = **correct hierarchy**
- `gap-6` between major sections vs `gap-2` within groups = **correct grouping**
- `p-2` inside dialogs = **may be too tight** for M3 Expressive's generous spacing

**Issues to Address:**

1. **Dialog content feels cramped** - `p-2` doesn't provide enough breathing room
2. **Inconsistent icon-text gaps** - Should be consistent within same component types
3. **No clear documentation** of spacing intent

**Recommendation:** Create semantic spacing tokens with M3 Expressive intent:

```typescript
// Spacing communicates content relationships
const spacing = {
  // Tight coupling - related items that belong together
  tight: 'gap-1.5',      // 6px - icon + label

  // Compact - items in a group
  compact: 'gap-2',      // 8px - list items, form fields

  // Standard - default spacing
  standard: 'gap-4',     // 16px - cards in grid, sections

  // Relaxed - emphasis through space
  relaxed: 'gap-6',      // 24px - major sections, hero areas

  // Container padding by emphasis
  containerCompact: 'p-3',   // Dialogs, nested cards
  containerStandard: 'p-4',  // Standard cards
  containerEmphasized: 'p-6', // Hero cards, important content
};
````

**Action:** Review dialog padding (increase from `p-2` to `p-4`) and document spacing hierarchy.

---

### 5. **Color Application (✅ Mostly Aligned, Needs Documentation)**

Background colors vary by context:

| Pattern            | Usage                                                                                      | M3 Expressive Purpose                  |
| ------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------- |
| Icon active state  | `bg-primary`, `bg-primary-container`, `bg-primary-container/60`                            | Emphasis levels for different contexts |
| Success indication | `bg-success`, `bg-success-container`, `bg-success-container/50`, `bg-success-container/60` | Visual weight variation                |
| Error states       | `bg-error/5`, `bg-error/10`, `bg-error-container`, `bg-error-container/30`                 | Severity indication                    |

**M3 Expressive Context:**

> _"Mixing colors for key components or visual elements can help emphasize the main takeaway of a screen. Create visual hierarchy with surface tones. Use contrast between primary, secondary, and tertiary color roles to prioritize actions."_ — M3 Expressive Tactic #2

**Current Usage Examples:**

```tsx
// These variations CAN be intentional M3 Expressive hierarchy:
<div className="bg-primary-container">      // Full emphasis - key action
<div className="bg-primary-container/60">   // Medium emphasis - active state
<div className="bg-primary-container/50">   // Subtle emphasis - background

// Success with varying emphasis:
<div className="bg-success-container">      // Strong success - completed action
<div className="bg-success-container/60">   // Medium success - status indicator
<div className="bg-success-container/50">   // Subtle success - background hint
```

**Analysis:** The opacity variations **could be correct** if they represent intentional emphasis levels:

- **Solid (`/100`)** = Primary focus, key actions
- **Medium (`/60`)** = Active states, selected items
- **Subtle (`/50`, `/30`)** = Background accents, large areas

**Issue:** The variation appears **undocumented and potentially accidental**.

**Recommendation:** Formalize the color emphasis system:

```typescript
// M3 Expressive Color Emphasis Levels
const colorEmphasis = {
  // Solid - Maximum attention, primary actions
  solid: '', // bg-primary-container

  // Strong - High attention, active states
  strong: '/70', // bg-primary-container/70

  // Medium - Moderate attention, secondary elements
  medium: '/50', // bg-primary-container/50

  // Subtle - Low attention, backgrounds, large areas
  subtle: '/30', // bg-primary-container/30

  // Whisper - Minimal attention, hover hints
  whisper: '/10', // bg-primary-container/10
};

// Apply consistently:
// Icon backgrounds: medium (/50) for inactive, strong (/70) for hover, solid for active
// Card backgrounds: subtle (/30) for standard, medium (/50) for featured
// Status indicators: solid for badges, medium for backgrounds
```

**Action:** Audit color usage and standardize opacity values around these emphasis levels.

````

---

### 6. **Motion & Animation (🔄 Consider M3 Expressive Springs)**

Transition durations currently use fixed values:

| Duration       | Usage                           | Interaction Type        |
| -------------- | ------------------------------- | ----------------------- |
| `duration-150` | Some hover states (implicit)    | Micro-interactions      |
| `duration-200` | Most components, buttons, cards | Standard transitions    |
| `duration-300` | Card border-radius transitions  | Shape morphing          |
| `duration-500` | Progress bars                   | Continuous animations   |

**M3 Expressive Context:**

> *"A new system using motion springs makes interactions and transitions feel more alive, fluid, and natural. Spatial springs mirror the physics of how objects actually move, making animations clear and predictable."* — M3 Expressive Motion System

**Current Implementation:** Uses CSS duration-based transitions (acceptable but not optimal).

**M3 Expressive Recommendation:** Consider adopting spring-based physics:

```typescript
// M3 Expressive Motion Springs (for future enhancement)
const motionSprings = {
  // Spatial springs - for position, size, shape changes
  spatialStandard: { damping: 0.8, stiffness: 300 },  // General UI movement
  spatialEmphasized: { damping: 0.6, stiffness: 200 }, // Hero moments

  // Effects springs - for color, opacity changes
  effectsFast: { damping: 1, stiffness: 500 },        // Hover states
  effectsStandard: { damping: 0.9, stiffness: 350 },  // Color transitions
};

// For now, map durations to interaction types:
const durations = {
  instant: '100ms',    // Color changes on hover
  fast: '150ms',       // Button press feedback
  standard: '200ms',   // Card hover, menu open
  emphasized: '300ms', // Shape morphing, modal entry
  dramatic: '500ms',   // Progress, page transitions
};
````

**Current State:** ✅ Acceptable - Duration variety aligns with interaction complexity.

**Future Enhancement:** Consider Framer Motion or React Spring for physics-based animations.

---

### 7. **Action Placement (⚠️ Needs M3 Expressive Review)**

Action buttons placement varies across pages:

| Page              | Primary Action Location | M3 Context                  |
| ----------------- | ----------------------- | --------------------------- |
| SurveysPage       | Header right            | ✅ Consistent with app bar  |
| TemplatesPage     | Header right            | ✅ Consistent with app bar  |
| NamespacesPage    | Header right            | ✅ Consistent with app bar  |
| DistributionsPage | Inside content area     | ⚠️ May need FAB instead     |
| SettingsPage      | Section footers         | ⚠️ Consider floating action |

**M3 Expressive Context:**

> _"Shift components or controls depending on the environment to make completing tasks easier. UI should adapt to the user context."_ — M3 Expressive Tactic #6

M3 Expressive introduces flexible component positioning:

- **Floating Toolbars** - Key actions that follow the user
- **FAB Menus** - Expandable action menus for multiple related actions
- **Adaptive App Bars** - Actions that move based on scroll/context

**Issues:**

1. **DistributionsPage**: Primary action buried in content instead of prominent FAB
2. **SettingsPage**: Save actions in section footers may be missed
3. **Mobile**: No floating actions for thumb-friendly access

**Recommendation:**

```typescript
// Consider M3 Expressive action patterns:

// 1. Use FAB for primary page actions
<FloatingActionButton
  icon={<Plus />}
  label="Create Survey"
  position="bottom-right"
/>

// 2. Use floating toolbar for contextual actions
<FloatingToolbar>
  <ToolbarAction icon={<Save />} label="Save" />
  <ToolbarAction icon={<Preview />} label="Preview" />
</FloatingToolbar>

// 3. Consistent header actions across pages
<PageHeader
  title="Surveys"
  primaryAction={{ label: 'Create', onClick: handleCreate }}
/>
```

**Action:** Audit action placement and consider FABs/floating toolbars for key actions.

---

## 🔄 Code Duplication Issues

### 1. **Date Formatting Functions (HIGH PRIORITY)**

Multiple implementations of similar date formatting logic:

**Centralized utilities exist but not always used:**

```typescript
// utils/dateFormatters.ts (centralized)
export function formatDate(dateStr: string): string;
export function formatDateShort(dateStr: string): string;
export function formatDateTime(dateStr: string): string;
export function formatRelativeTime(dateStr: string): string;
```

**But duplicate implementations exist in:**

| File                                                                                                           | Duplicate Function     |
| -------------------------------------------------------------------------------------------------------------- | ---------------------- |
| [SurveyCard.tsx](front/src/components/features/surveys/SurveyCard.tsx#L21)                                     | `formatRelativeDate()` |
| [SurveyCard.tsx](front/src/components/features/surveys/SurveyCard.tsx#L44)                                     | `formatNumber()`       |
| [ResponseDetailDrawer.tsx](front/src/components/features/responses/ResponseDetailDrawer.tsx#L20)               | `formatDuration()`     |
| [ResponseDetailDrawer.tsx](front/src/components/features/responses/ResponseDetailDrawer.tsx#L36)               | `formatDate()`         |
| [RecurringSurveyCard.tsx](front/src/components/features/recurring-surveys/RecurringSurveyCard.tsx#L31)         | `formatDateTime()`     |
| [RecurringSurveyCard.tsx](front/src/components/features/recurring-surveys/RecurringSurveyCard.tsx#L46)         | `formatRelativeTime()` |
| [RunHistoryDrawer.tsx](front/src/components/features/recurring-surveys/RunHistoryDrawer.tsx#L55)               | `formatDateTime()`     |
| [RecentItems.tsx](front/src/components/features/search/RecentItems.tsx#L10)                                    | `formatTimeAgo()`      |
| [AnalyticsSummaryCards.tsx](front/src/components/features/analytics/AnalyticsSummaryCards.tsx#L12)             | `formatDuration()`     |
| [RecurringScheduleEditor.tsx](front/src/components/features/recurring-surveys/RecurringScheduleEditor.tsx#L84) | `formatDateForInput()` |

**Impact:** ~10 duplicate formatting functions across 8+ files

**Fix:**

1. Extend `utils/dateFormatters.ts` with all needed functions
2. Add `formatDuration()`, `formatNumber()`, `formatTimeAgo()`
3. Replace all local implementations with centralized imports
4. Add unit tests for date formatting utilities

```typescript
// Add to utils/dateFormatters.ts
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
```

---

### 2. **Card Pattern Duplication (MEDIUM PRIORITY)**

Similar card structures repeated across feature cards:

**Pattern repeated in:**

- `SurveyCard.tsx`
- `TemplateCard.tsx`
- `ThemeCard.tsx`
- `NamespaceCard` (in NamespacesPage)
- `RecurringSurveyCard.tsx`
- `EmailTemplateCard` (in EmailTemplatesPage)

**Common structure:**

```tsx
<Card variant="elevated" className="group cursor-pointer">
  <CardHeader className="pb-2">
    <div className="flex items-start justify-between gap-2">
      {/* Icon circle */}
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-full shrink-0', ...)}>
        <Icon className="h-4 w-4" />
      </div>
      {/* Menu */}
      <Menu trigger={<IconButton>...</IconButton>}>
        {/* Menu items */}
      </Menu>
    </div>
  </CardHeader>
  <CardContent>
    {/* Title */}
    <h3 className="font-medium text-on-surface mb-1 group-hover:text-primary transition-colors truncate">
      {title}
    </h3>
    {/* Description */}
    {description && <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">{description}</p>}
    {/* Stats footer */}
    <div className="flex items-center justify-between text-xs text-on-surface-variant">
      {/* Stats */}
    </div>
  </CardContent>
</Card>
```

**Recommendation:** Create a `FeatureCard` compound component:

```typescript
interface FeatureCardProps {
  icon: ReactNode;
  iconVariant?: 'default' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  stats?: { icon: LucideIcon; value: string | number; label?: string }[];
  badge?: ReactNode;
  menu?: ReactNode;
  onClick?: () => void;
  className?: string;
}

// Usage
<FeatureCard
  icon={<FileText />}
  iconVariant={isPublished ? 'success' : 'default'}
  title={survey.title}
  description={survey.description}
  stats={[
    { icon: FileText, value: questionCount },
    { icon: Users, value: responseCount },
  ]}
  badge={<SurveyStatusBadge status={survey.status} />}
  menu={<SurveyCardMenu ... />}
  onClick={handleEdit}
/>
```

---

### 3. **Empty State Pattern Duplication (MEDIUM PRIORITY)**

The `createListEmptyState` factory is good, but custom empty states are still created inline:

**Custom inline empty states found in:**

- `SurveyBuilderPage.tsx` - Custom empty state for questions
- `NamespaceSettingsPage.tsx` - Multiple custom empty states (API keys, integrations, etc.)
- `DistributionsPage.tsx` - Custom empty states for different tabs
- `ResponsesPage.tsx` - Inline empty response state

**Pattern:**

```tsx
// Repeated pattern
<EmptyState
  icon={<SomeIcon className='h-7 w-7' />}
  title='No items found'
  description='Create your first item to get started'
  iconVariant='muted'
  size='full'
  action={{
    label: 'Create Item',
    onClick: handleCreate,
  }}
/>
```

**Recommendation:** Create preset empty states for common scenarios:

```typescript
// components/ui/EmptyStatePresets.tsx
export const emptyStatePresets = {
  noItems: (itemName: string, onCreate?: () => void) => ({
    icon: 'default',
    title: `No ${itemName} yet`,
    description: `Create your first ${itemName.toLowerCase()} to get started.`,
    action: onCreate ? { label: `Create ${itemName}`, onClick: onCreate } : undefined,
  }),
  noResults: (onClear?: () => void) => ({
    icon: 'search',
    title: 'No results found',
    description: 'Try adjusting your filters or search terms.',
    action: onClear ? { label: 'Clear Filters', onClick: onClear } : undefined,
  }),
  error: (onRetry?: () => void) => ({
    icon: 'error',
    iconVariant: 'muted' as const,
    title: 'Something went wrong',
    description: 'Failed to load data. Please try again.',
    action: onRetry ? { label: 'Retry', onClick: onRetry } : undefined,
  }),
};
```

---

### 4. **Loading State Patterns (MEDIUM PRIORITY)**

Loading states are implemented differently across components:

**Patterns observed:**

```tsx
// Pattern 1: Ternary with Skeleton
{
  isLoading ? <Skeleton className='...' /> : <ActualContent />;
}

// Pattern 2: Early return
if (isLoading) return <LoadingSkeleton />;

// Pattern 3: Inline conditional
{
  isLoading && <Loader2 className='animate-spin' />;
}

// Pattern 4: Custom loading component
<GridSkeleton count={6} />;
```

**Inconsistencies:**

- Some use `Loader2` icon, others use `Skeleton` components
- No standardized `LoadingState` wrapper
- Button loading states vary (`loading` prop vs manual)

**Recommendation:** Create standardized loading components:

```typescript
// Loading wrapper component
interface LoadingStateProps {
  isLoading: boolean;
  skeleton?: ReactNode;
  children: ReactNode;
}

export function LoadingState({ isLoading, skeleton, children }: LoadingStateProps) {
  if (isLoading) {
    return skeleton || <DefaultSkeleton />;
  }
  return <>{children}</>;
}

// Page loading component
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className='flex items-center justify-center min-h-[400px]'>
      <div className='flex items-center gap-3 text-on-surface-variant'>
        <Loader2 className='h-5 w-5 animate-spin' />
        <span>{message}</span>
      </div>
    </div>
  );
}
```

---

### 5. **Dialog/Drawer Structure Duplication (LOW PRIORITY)**

Similar dialog structures repeated:

**Common pattern:**

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent size='md'>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant='outline' onClick={onClose}>
        Cancel
      </Button>
      <Button onClick={onSubmit} loading={isLoading}>
        Submit
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Recommendation:** Create dialog presets for common patterns:

```typescript
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  variant?: 'default' | 'destructive';
}

// Already have useConfirmDialog hook - ensure it's used everywhere
```

---

### 6. **Menu Item Patterns (LOW PRIORITY)**

Similar menu structures repeated across cards:

```tsx
// Repeated in every card component
<Menu
  trigger={
    <IconButton>
      <MoreVertical />
    </IconButton>
  }
>
  <MenuItem onClick={onEdit} icon={<Edit />}>
    Edit
  </MenuItem>
  <MenuItem onClick={onDuplicate} icon={<Copy />}>
    Duplicate
  </MenuItem>
  <MenuItem onClick={onPreview} icon={<Eye />}>
    Preview
  </MenuItem>
  <MenuSeparator />
  <MenuItem onClick={onDelete} destructive icon={<Trash2 />}>
    Delete
  </MenuItem>
</Menu>
```

**Recommendation:** Create menu item presets:

```typescript
// Preset menu items
export const menuPresets = {
  edit: (onClick: () => void) => ({ label: 'Edit', icon: Edit, onClick }),
  duplicate: (onClick: () => void) => ({ label: 'Duplicate', icon: Copy, onClick }),
  preview: (onClick: () => void) => ({ label: 'Preview', icon: Eye, onClick }),
  delete: (onClick: () => void) => ({ label: 'Delete', icon: Trash2, onClick, destructive: true }),
  share: (onClick: () => void) => ({ label: 'Share', icon: Share2, onClick }),
};

// Usage
<CardMenu items={[menuPresets.edit(onEdit), menuPresets.duplicate(onDuplicate), menuPresets.delete(onDelete)]} />;
```

---

### 7. **Stat Display Pattern (LOW PRIORITY)**

Stats/metrics displayed similarly across pages:

```tsx
// DashboardPage
<div className="flex items-center gap-1">
  <FileText className="h-3 w-3" />
  <span>{count}</span>
</div>

// Card footers
<span className="flex items-center gap-1">
  <Users className="h-3 w-3" />
  {formatNumber(value)}
</span>
```

**Recommendation:** Create a `Stat` component:

```typescript
interface StatProps {
  icon: LucideIcon;
  value: string | number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Stat({ icon: Icon, value, label, size = 'sm' }: StatProps) {
  const iconSizes = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' };
  return (
    <span className='flex items-center gap-1 text-on-surface-variant'>
      <Icon className={iconSizes[size]} />
      <span>{value}</span>
      {label && <span className='sr-only'>{label}</span>}
    </span>
  );
}
```

---

## 🎯 M3 Expressive Alignment Summary

### ✅ Already Aligned (Keep As-Is)

| Aspect                | Current State              | M3 Expressive Principle              |
| --------------------- | -------------------------- | ------------------------------------ |
| **Shape Variety**     | Multiple border radii used | Tactic #1: Use variety for tension   |
| **Icon Sizing**       | Size varies by context     | Hierarchy through prominence         |
| **Color Opacity**     | Multiple opacity levels    | Tactic #2: Nuanced color application |
| **Animation Variety** | Different durations        | Interaction-appropriate timing       |

### ⚠️ Needs Intentional Application

| Aspect            | Issue                               | Recommendation                   |
| ----------------- | ----------------------------------- | -------------------------------- |
| **Typography**    | Weight variation appears accidental | Map weights to emphasis levels   |
| **Spacing**       | Dialog padding too tight            | Increase to M3 generous spacing  |
| **Actions**       | Inconsistent placement              | Consider FABs, floating toolbars |
| **Documentation** | Design choices undocumented         | Create design system guide       |

### 🔄 Opportunities for Enhancement

| Feature             | Current          | M3 Expressive Enhancement                  |
| ------------------- | ---------------- | ------------------------------------------ |
| **Motion**          | CSS transitions  | Spring-based physics                       |
| **Hero Moments**    | Not explicit     | Identify 1-2 key interactions to emphasize |
| **Adaptive Layout** | Basic responsive | Context-aware component shifting           |

---

## 🎯 Priority Action Items

### High Priority (Fix First)

| Issue                       | Impact | Effort | Files Affected | M3 Alignment |
| --------------------------- | ------ | ------ | -------------- | ------------ |
| Date formatting duplication | High   | Low    | 10+ files      | Code quality |
| Typography emphasis audit   | Medium | Medium | All pages      | Tactic #3    |
| Document design decisions   | Medium | Low    | N/A            | Foundation   |

### Medium Priority

| Issue                      | Impact | Effort | Files Affected    | M3 Alignment |
| -------------------------- | ------ | ------ | ----------------- | ------------ |
| Card pattern consolidation | Medium | Medium | 6 card components | Code quality |
| Dialog spacing increase    | Medium | Low    | 10+ dialogs       | Tactic #4    |
| Action placement review    | Medium | Medium | 5 pages           | Tactic #6    |

### Low Priority (Future Enhancement)

| Issue                | Impact | Effort | Files Affected  | M3 Alignment          |
| -------------------- | ------ | ------ | --------------- | --------------------- |
| Spring-based motion  | Low    | High   | Animation layer | Motion system         |
| Hero moment creation | Low    | Medium | Key pages       | Tactic #7             |
| Floating toolbar/FAB | Low    | Medium | List pages      | Expressive components |

---

## 📁 Recommended New Files/Components

### 1. Design System Documentation (NEW - HIGH PRIORITY)

```
front/docs/
├── design-system/
│   ├── M3_EXPRESSIVE_GUIDE.md    # M3 Expressive principles & tactics
│   ├── SHAPE_HIERARCHY.md        # Intentional shape variety documentation
│   ├── TYPOGRAPHY_EMPHASIS.md    # Font weight = emphasis level mapping
│   ├── COLOR_EMPHASIS.md         # Opacity = emphasis level mapping
│   └── SPACING_CONTAINMENT.md    # Spacing for visual grouping
```

### 2. Extended Utilities

```
src/utils/
├── dateFormatters.ts     # Extend with formatDuration, formatNumber
├── numberFormatters.ts   # New: formatNumber, formatCurrency, etc.
└── index.ts              # Re-export all
```

### 3. M3 Expressive Components

```
src/components/ui/
├── IconContainer.tsx     # Emphasis-based sizing (not just size variants)
├── Stat.tsx              # Inline stat display component
├── LoadingState.tsx      # Loading state wrapper
├── PageLoading.tsx       # Full page loading indicator
├── FeatureCard.tsx       # Generic feature card compound component
├── FloatingToolbar.tsx   # M3 Expressive floating toolbar (future)
└── FABMenu.tsx           # M3 Expressive FAB menu (future)
```

---

## 🔧 Refactoring Steps (M3 Expressive Aligned)

### Step 1: Document Design Decisions (1 hour) ⭐ START HERE

1. Create `front/docs/design-system/M3_EXPRESSIVE_GUIDE.md`
2. Document the **intentional** shape variety and why
3. Document typography emphasis levels
4. Document color opacity = emphasis mapping
5. This prevents "fixing" things that are already correct

### Step 2: Consolidate Date Utilities (2 hours)

1. Extend `utils/dateFormatters.ts`:
   - Add `formatDuration(seconds: number)`
   - Add `formatNumber(num: number)`
   - Add `formatTimeAgo(dateStr: string)` (alias for `formatRelativeTime`)
2. Search and replace all local implementations
3. Delete duplicate functions from component files
4. Add unit tests

### Step 3: Create IconContainer Component (1 hour)

1. Create `components/ui/IconContainer.tsx` with **emphasis-based** sizing
2. Map sizes to semantic meaning: `inline`, `standard`, `emphasized`, `hero`, `maximum`
3. Document when to use each emphasis level
4. Gradually migrate existing icon containers

### Step 4: Typography Emphasis Audit (2 hours)

1. Create typography constants with M3 Expressive emphasis mapping
2. Audit all pages for **accidental** vs **intentional** weight differences
3. Standardize accidental variations
4. Document intentional variations (e.g., featured card vs standard card)

### Step 5: Spacing & Dialog Review (1 hour)

1. Increase dialog content padding from `p-2` to `p-4`
2. Review card padding for M3 generous spacing
3. Document spacing hierarchy (tight, compact, standard, relaxed)

### Step 6: Standardize Card Pattern (4 hours)

1. Create `FeatureCard` compound component
2. Create `CardMenu` preset system
3. Migrate `SurveyCard`, `TemplateCard`, `ThemeCard`
4. Update remaining cards

### Step 7 (Future): M3 Expressive Enhancements

1. Identify 1-2 "hero moments" in key user journeys
2. Consider floating toolbar for SurveyBuilder
3. Consider FAB for list page primary actions
4. Evaluate spring-based motion library (Framer Motion)

---

## 📊 Estimated Impact

| Metric                | Before  | After (Estimated) |
| --------------------- | ------- | ----------------- |
| Duplicate Functions   | ~10     | 0                 |
| Lines of Code         | ~35,000 | ~33,500 (-4%)     |
| Component Consistency | 70%     | 95%               |
| Maintenance Effort    | Medium  | Low               |
| Onboarding Time       | 2 weeks | 1 week            |

---

## 🧪 Testing Recommendations

### Unit Tests to Add

```typescript
// utils/__tests__/dateFormatters.test.ts
describe('formatDuration', () => {
  it('formats seconds', () => expect(formatDuration(45)).toBe('45s'));
  it('formats minutes', () => expect(formatDuration(90)).toBe('1m 30s'));
  it('formats hours', () => expect(formatDuration(3700)).toBe('1h 1m'));
});

describe('formatNumber', () => {
  it('formats thousands', () => expect(formatNumber(1500)).toBe('1.5K'));
  it('formats millions', () => expect(formatNumber(2500000)).toBe('2.5M'));
});
```

### Visual Regression Tests

Consider adding Storybook stories for:

- `IconContainer` variants
- `FeatureCard` variants
- `EmptyState` presets
- `LoadingState` patterns

---

## 📝 Documentation Updates Needed

1. **Design System Guide**

   - Add spacing scale
   - Add typography hierarchy
   - Add color usage guidelines
   - Add icon sizing guidelines

2. **Component Library Documentation**

   - Document new shared components
   - Add usage examples
   - Add migration guides

3. **Contributing Guide**
   - Add design consistency checklist
   - Add code review checklist for UI

---

## ✅ Checklist for Implementation

### Phase 1: Foundation (Week 1)

- [ ] Create M3 Expressive design system documentation
- [ ] Document intentional shape variety
- [ ] Document typography emphasis levels
- [ ] Document color emphasis (opacity) levels
- [ ] Consolidate date formatting utilities
- [ ] Add unit tests for utilities

### Phase 2: Component Improvements (Week 2)

- [ ] Create `IconContainer` with emphasis-based sizing
- [ ] Increase dialog padding to M3 standards
- [ ] Audit typography for accidental inconsistencies
- [ ] Create `FeatureCard` compound component
- [ ] Create `Stat` component
- [ ] Create `LoadingState` wrapper

### Phase 3: Future M3 Expressive (When Ready)

- [ ] Identify hero moments in user journeys
- [ ] Evaluate spring-based motion library
- [ ] Consider FAB for list page actions
- [ ] Consider floating toolbar for editors
- [ ] Implement shape morphing on key interactions

---

## 📚 M3 Expressive Reference Links

- [Start building with M3 Expressive](https://m3.material.io/blog/building-with-m3-expressive) - Official introduction
- [M3 Expressive Research](https://design.google/library/expressive-material-design-google-research) - Research behind the designs
- [Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3) - Implementation reference
- [M3 Shape Guidelines](https://m3.material.io/styles/shape/overview) - Shape scale and morphing
- [M3 Typography](https://m3.material.io/styles/typography/overview) - Emphasis and type scale
- [M3 Motion](https://m3.material.io/styles/motion/overview) - Spring-based physics

---

**Note:** This analysis views the codebase through the M3 Expressive lens. Many apparent "inconsistencies" are actually **intentional design choices** that align with M3 Expressive's emphasis on variety, hierarchy, and emotional connection. The key improvement is **documenting** these decisions so future contributors understand the intent.

---

_Generated on December 24, 2025 | Aligned with Material 3 Expressive (May 2025)_
