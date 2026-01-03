// @survey/ui-primitives - Low-level UI building blocks
// These are "atoms" - fundamental, translation-agnostic components
//
// Components should NOT use i18n/useTranslation internally.
// All text should come from props or children.

// Utilities
export { cn } from "./utils";
export type { ClassValue } from "clsx";

// Component categories - uncomment as you migrate
// export * from "./buttons";
// export * from "./inputs";
// export * from "./feedback";
// export * from "./layout";
// export * from "./display";

// ============================================================================
// Migration Map: apps/admin/src/components/ui → packages/ui-primitives/src
// ============================================================================
//
// buttons/
//   Button.tsx      ← Button.tsx
//   IconButton.tsx  ← IconButton.tsx
//   FAB.tsx         ← FAB.tsx
//
// inputs/
//   Input.tsx       ← Input.tsx
//   Textarea.tsx    ← Textarea.tsx
//   Select.tsx      ← Select.tsx
//   Checkbox.tsx    ← Checkbox.tsx
//   Radio.tsx       ← Radio.tsx
//   Switch.tsx      ← Switch.tsx
//
// feedback/
//   Badge.tsx       ← Badge.tsx
//   Progress.tsx    ← Progress.tsx
//   Skeleton.tsx    ← Skeleton.tsx
//
// layout/
//   Card.tsx        ← Card.tsx
//   Dialog.tsx      ← Dialog.tsx
//   Drawer.tsx      ← Drawer.tsx
//   Tabs.tsx        ← Tabs.tsx
//
// display/
//   Avatar.tsx      ← Avatar.tsx
//   Chip.tsx        ← Chip.tsx
//   Tooltip.tsx     ← Tooltip.tsx
// ============================================================================
