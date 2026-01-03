# @survey/ui-primitives

Low-level UI building blocks (atoms) for the survey platform.

## Philosophy

This package contains **translation-agnostic** primitive components. They:

- Have **no internal text** - all labels come from props or children
- Use **CVA (class-variance-authority)** for variant styling
- Are **composable** - can be combined to build higher-level components
- Are **accessible** - follow WAI-ARIA patterns

## Installation

This is an internal workspace package. Add it to your app's dependencies:

```json
{
  "dependencies": {
    "@survey/ui-primitives": "workspace:*"
  }
}
```

## Usage

```tsx
import { Button, IconButton, cn } from "@survey/ui-primitives";

// Button with variants
<Button variant="filled" size="lg">
  Click me
</Button>

// IconButton
<IconButton variant="standard" aria-label="Close">
  <XIcon />
</IconButton>

// cn utility for class merging
<div className={cn("base-class", isActive && "active-class")} />
```

## Migration Guide

When migrating components from `apps/admin/src/components/ui`:

1. **Remove i18n dependencies**

   ```tsx
   // ❌ Before
   const { t } = useTranslation();
   <span>{t('button.submit')}</span>

   // ✅ After
   <span>{children}</span>
   ```

2. **Replace hardcoded text with props**

   ```tsx
   // ❌ Before
   placeholder = "Search...";

   // ✅ After
   placeholder = { placeholder }; // passed as prop
   ```

3. **Update imports**

   ```tsx
   // ❌ Before
   import { cn } from "@/lib/utils";

   // ✅ After
   import { cn } from "./utils";
   ```

4. **Export from index.ts**
   ```tsx
   export { Button, buttonVariants } from "./Button";
   ```

## Package Structure

```
src/
  index.ts          # Main exports
  utils.ts          # cn() and other utilities
  Button.tsx        # Button component
  IconButton.tsx    # IconButton component
  Input.tsx         # Input component
  ...
```

## Dependencies

- `class-variance-authority` - Variant styling
- `@radix-ui/react-slot` - Polymorphic component support
- `clsx` + `tailwind-merge` - Class name utilities
