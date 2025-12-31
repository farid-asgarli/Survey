# M3 Expressive Compliance - Refactoring Plan

**Generated:** December 30, 2025  
**Total Components Analyzed:** 141  
**Files with Violations:** 24

---

## 📊 Executive Summary

| Priority    | Violation Type        | Count | Impact                                   |
| ----------- | --------------------- | ----- | ---------------------------------------- |
| 🔴 Critical | Shadows (non-overlay) | 22    | High - Breaks M3 design system           |
| 🟡 High     | Custom Buttons        | 3     | Medium - Inconsistent UX                 |
| 🟡 High     | Wrong Button Shapes   | 4     | Medium - Brand inconsistency             |
| 🟠 Medium   | Native Form Elements  | 9     | Low - Already using UI components mostly |

**Estimated Total Refactoring Time:** ~8-10 hours

---

## 🚨 Violations by Priority

### 🔴 CRITICAL PRIORITY - Shadows (Fix Immediately)

Shadows are forbidden in M3 Expressive except for:

- ✅ Toasts/Snackbars
- ✅ Dialog/Menu overlays (acceptable for visual hierarchy)

**True Violations (22 instances in 14 files):**

| File                        | Line(s)            | Shadow Class              | Severity                       |
| --------------------------- | ------------------ | ------------------------- | ------------------------------ |
| `ResponseTrendChart.tsx`    | 95                 | `shadow-lg`               | 🔴 Critical - Tooltip          |
| `CreateLinkDialog.tsx`      | 80                 | `shadow-md`               | 🔴 Critical - Type indicator   |
| `BlockEditor.tsx`           | 88, 94             | `shadow-md`, `shadow-lg`  | 🔴 Critical - Selection state  |
| `BlockPalette.tsx`          | 89                 | `shadow-sm`               | 🔴 Critical - Hover state      |
| `VisualEmailEditor.tsx`     | 774, 834, 890      | `shadow-lg`, `shadow-md`  | 🔴 Critical - Containers       |
| `WelcomeScreen.tsx`         | 74                 | `shadow-sm`               | 🔴 Critical - Logo             |
| `AddQuestionMenu.tsx`       | 185                | `shadow-2xl`              | 🟡 Acceptable - Menu overlay   |
| `QuestionEditor.tsx`        | 184, 192, 206, 258 | `shadow-sm`               | 🔴 Critical - Tabs/containers  |
| `GlobalSearch.tsx`          | 189                | `shadow-xl`               | 🟡 Acceptable - Overlay        |
| `KeyboardShortcutsHelp.tsx` | 80                 | `shadow-xl`               | 🟡 Acceptable - Overlay        |
| `RecentItems.tsx`           | 174                | `shadow-xl`               | 🟡 Acceptable - Overlay        |
| `ThemeLivePreview.tsx`      | 80, 167            | `shadow-sm`, `shadow-md`  | 🔴 Critical - Preview elements |
| `AppLoadingScreen.tsx`      | 54, 235            | `shadow-2xl`, `shadow-lg` | 🔴 Critical - Loading logo     |
| `ImageUploader.tsx`         | 229, 241           | `shadow-sm`               | 🔴 Critical - Tab indicator    |
| `Tabs.tsx`                  | 156, 157           | `shadow-md`, `shadow-sm`  | 🔴 Critical - Tab variants     |
| `OfflineIndicator.tsx`      | 112                | `shadow-lg`               | 🟡 Acceptable - Toast-like     |

**Acceptable Shadows (excluded from count):**

- Dialog.tsx, Menu.tsx, GettingStartedWizard.tsx, OnboardingWizard.tsx, DatePicker.tsx, TimePicker.tsx → Overlay components

---

### 🟡 HIGH PRIORITY - Custom Buttons & Wrong Shapes

#### Custom `<button className>` (Should use Button component)

| File                        | Line | Issue                             | Fix                       |
| --------------------------- | ---- | --------------------------------- | ------------------------- |
| `MembersManagement.tsx`     | 224  | Custom button with `rounded-full` | Replace with `IconButton` |
| `OptionListEditor.tsx`      | 115  | Custom grab handle button         | Keep as-is (drag handle)  |
| `GlobalSearch.tsx`          | 210  | Close button                      | Replace with `IconButton` |
| `KeyboardShortcutsHelp.tsx` | 94   | Close button                      | Replace with `IconButton` |

#### Wrong Border Radius on Buttons

| File                        | Line | Current              | Should Be                |
| --------------------------- | ---- | -------------------- | ------------------------ |
| `QuestionEditor.tsx`        | 234  | `rounded-lg`         | `rounded-full`           |
| `GlobalSearch.tsx`          | 210  | `rounded-lg`         | `rounded-full`           |
| `KeyboardShortcutsHelp.tsx` | 94   | `rounded-xl`         | `rounded-full`           |
| `ThemeEditorDrawer.tsx`     | 160  | `rounded-xl` preview | Config only (acceptable) |

---

### 🟠 MEDIUM PRIORITY - Native Form Elements

**Most detections are FALSE POSITIVES** - using `<Input`, `<Select`, `<Textarea` UI components.

**True native elements to fix:**

| File                     | Line                    | Element                      | Fix                                |
| ------------------------ | ----------------------- | ---------------------------- | ---------------------------------- |
| `RecipientImporter.tsx`  | 236                     | `<input type='file'>`        | Keep (hidden file input)           |
| `BlockSettingsPanel.tsx` | 48, 375, 615            | `<input type="color">`       | Keep (color picker)                |
| `AvatarUpload.tsx`       | 245                     | `<input type="file">`        | Keep (hidden file input)           |
| `VisualEmailEditor.tsx`  | 927, 937, 947, 957      | `<input type="color/range">` | Keep (specialized inputs)          |
| `QuestionRenderers.tsx`  | 91, 185, 209, 243, etc. | Native inputs                | **REVIEW** - Public survey theming |

**Note:** `QuestionRenderers.tsx` uses native inputs intentionally for public surveys with custom theming. This is acceptable but should be documented.

---

## 🎯 Top 5 Files for Immediate Refactoring

### 1. `VisualEmailEditor.tsx` - **Priority: Critical**

**Location:** `components/features/email-templates/visual-editor/VisualEmailEditor.tsx`

| Violations | Count |
| ---------- | ----- |
| Shadows    | 3     |
| Total      | 3     |

**Estimated Time:** 30 minutes

**Refactoring Steps:**

1. Line 774: Remove `shadow-lg` from preview container → use `border-2 border-outline-variant`
2. Line 834: Remove `shadow-lg` from container → use `border-2 border-outline-variant`
3. Line 890: Remove `shadow-md` from floating button → use `border-2`

---

### 2. `QuestionEditor.tsx` - **Priority: Critical**

**Location:** `components/features/questions/QuestionEditor.tsx`

| Violations   | Count |
| ------------ | ----- |
| Shadows      | 4     |
| Wrong radius | 1     |
| Total        | 5     |

**Estimated Time:** 45 minutes

**Refactoring Steps:**

1. Lines 184, 192: Remove `shadow-sm` from tab triggers → use border instead
2. Lines 206, 258: Remove `shadow-sm` from containers → use `border-2 border-outline-variant`
3. Line 234: Change `rounded-lg` to `rounded-full` on button

---

### 3. `BlockEditor.tsx` - **Priority: Critical**

**Location:** `components/features/email-templates/visual-editor/BlockEditor.tsx`

| Violations | Count |
| ---------- | ----- |
| Shadows    | 2     |
| Total      | 2     |

**Estimated Time:** 20 minutes

**Refactoring Steps:**

1. Line 88: Remove `shadow-md` from selection state → use `ring-2 ring-primary`
2. Line 94: Remove `shadow-lg` from toolbar → use `border-2 border-outline-variant`

---

### 4. `Tabs.tsx` (UI Component) - **Priority: Critical**

**Location:** `components/ui/Tabs.tsx`

| Violations | Count |
| ---------- | ----- |
| Shadows    | 2     |
| Total      | 2     |

**Estimated Time:** 30 minutes

**Impact:** HIGH - Used across multiple components

**Refactoring Steps:**

1. Line 156: Remove `shadow-md` from pills variant → use `ring-2 ring-primary`
2. Line 157: Remove `shadow-sm` from segmented variant → use `bg-surface-container-lowest`

---

### 5. `AppLoadingScreen.tsx` - **Priority: High**

**Location:** `components/ui/AppLoadingScreen.tsx`

| Violations | Count |
| ---------- | ----- |
| Shadows    | 2     |
| Total      | 2     |

**Estimated Time:** 20 minutes

**Refactoring Steps:**

1. Line 54: Remove `shadow-2xl shadow-primary/30` → brand styling without shadow
2. Line 235: Remove `shadow-lg` → use border-based elevation

---

## 📅 Refactoring Schedule

### Day 1: Critical UI Components (2 hours)

**Goal:** Fix design system violations in core UI components that affect multiple features

| Order | Component              | Time   | Dependencies       |
| ----- | ---------------------- | ------ | ------------------ |
| 1     | `Tabs.tsx`             | 30 min | None - high impact |
| 2     | `AppLoadingScreen.tsx` | 20 min | None               |
| 3     | `ImageUploader.tsx`    | 20 min | None               |
| 4     | `ThemeLivePreview.tsx` | 30 min | None               |

**Deliverable:** Core UI components compliant

---

### Day 2: Email Template Editor (2 hours)

**Goal:** Fix the Visual Email Editor and related components

| Order | Component               | Time   | Dependencies      |
| ----- | ----------------------- | ------ | ----------------- |
| 1     | `VisualEmailEditor.tsx` | 45 min | None              |
| 2     | `BlockEditor.tsx`       | 20 min | VisualEmailEditor |
| 3     | `BlockPalette.tsx`      | 15 min | VisualEmailEditor |

**Deliverable:** Email template editor compliant

---

### Day 3: Question & Survey Components (2 hours)

**Goal:** Fix question editor and related survey components

| Order | Component                | Time   | Dependencies |
| ----- | ------------------------ | ------ | ------------ |
| 1     | `QuestionEditor.tsx`     | 45 min | None         |
| 2     | `ResponseTrendChart.tsx` | 15 min | None         |
| 3     | `CreateLinkDialog.tsx`   | 20 min | None         |
| 4     | `WelcomeScreen.tsx`      | 15 min | None         |

**Deliverable:** Survey builder components compliant

---

### Day 4: Search & Navigation (1.5 hours)

**Goal:** Fix search overlays and custom buttons

| Order | Component                   | Time   | Dependencies         |
| ----- | --------------------------- | ------ | -------------------- |
| 1     | `GlobalSearch.tsx`          | 30 min | None                 |
| 2     | `KeyboardShortcutsHelp.tsx` | 20 min | None                 |
| 3     | `MembersManagement.tsx`     | 20 min | IconButton component |

**Deliverable:** All search/navigation components compliant

---

## ✅ Success Metrics

After refactoring, the codebase should achieve:

- [ ] 0 shadow classes in non-overlay components
- [ ] All buttons use `rounded-full`
- [ ] All custom `<button>` replaced with `Button` or `IconButton`
- [ ] All cards use `rounded-2xl` or `rounded-3xl`
- [ ] Design token consistency across all components

---

## 🔧 Recommended Fixes Reference

### Shadow Replacement Patterns

```tsx
// ❌ Before (shadow for elevation)
className="bg-surface shadow-lg"

// ✅ After (M3 border elevation)
className="bg-surface border-2 border-outline-variant"

// ❌ Before (shadow for selection)
className={isSelected ? 'shadow-md' : ''}

// ✅ After (ring for selection)
className={isSelected ? 'ring-2 ring-primary' : ''}

// ❌ Before (shadow for hover)
className="hover:shadow-sm"

// ✅ After (background change for hover)
className="hover:bg-surface-container-high"
```

### Button Shape Fixes

```tsx
// ❌ Before
<button className="rounded-lg px-4 py-2">

// ✅ After
<Button variant="tonal">
// or
<IconButton variant="standard">
```

---

## 📝 Notes

1. **Overlay exceptions:** Shadows on `Dialog`, `Menu`, `DatePicker`, `TimePicker` are acceptable for overlay components
2. **Public survey inputs:** `QuestionRenderers.tsx` uses native inputs for theme customization - document this decision
3. **Color pickers:** Native `<input type="color">` is acceptable - no UI component replacement needed
4. **File inputs:** Hidden `<input type="file">` is required for file upload functionality

---

## 🚀 Next Steps

1. Review this plan with the team
2. Start with Day 1 tasks (UI components)
3. Test each component after refactoring
4. Update component documentation
5. Run `analyze-codebase.ps1 -ExportToFile` to verify 0 violations
