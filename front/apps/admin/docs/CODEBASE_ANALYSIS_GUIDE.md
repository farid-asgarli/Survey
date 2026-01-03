# Codebase Analysis Guide - Identify Refactoring Candidates

> **How to audit your existing dashboard code and prioritize refactoring work**

---

## 🎯 Analysis Goals

1. **Identify duplicate components** (multiple implementations of buttons, cards, etc.)
2. **Find M3 Expressive violations** (wrong shapes, shadows, arbitrary colors)
3. **Detect missing components** (features not using design system)
4. **Prioritize refactoring work** (high-impact vs low-impact)

---

## 📋 Step 1: Manual Quick Scan

### A. Survey the Component Structure

Run this in your terminal to see what you have:

```bash
# List all component files
cd front/src
find components -name "*.tsx" -o -name "*.jsx" | sort

# Count components by directory
echo "UI Components:"
find components/ui -name "*.tsx" | wc -l

echo "Feature Components:"
find components/features -name "*.tsx" | wc -l

echo "Layout Components:"
find components/layout -name "*.tsx" | wc -l

echo "Page Components:"
find pages -name "*.tsx" | wc -l
```

### B. Search for Common Violations

```bash
# Find potential shadow usage (M3 violation)
grep -r "shadow-" src/components --include="*.tsx" --include="*.jsx"

# Find wrong border radius on buttons
grep -r "rounded-lg\|rounded-xl" src/components --include="*.tsx" | grep -i button

# Find arbitrary colors (not using CSS custom properties)
grep -r "bg-\[#\|text-\[#" src/components --include="*.tsx"

# Find native form elements (should use Input component)
grep -r "<input\|<select\|<textarea" src/components --include="*.tsx"

# Find inline style props (should use Tailwind classes)
grep -r 'style={{' src/components --include="*.tsx"

# Find custom button implementations (should use Button component)
grep -r '<button className' src/components --include="*.tsx"
```

---

## 📊 Step 2: Component Inventory Analysis

### Prompt for Claude

```
I need to audit my codebase to identify refactoring candidates.

Here's my project structure:
[Paste output of: tree -L 3 src/components]

Phase 1 - Component Inventory:
1. List all components in /components/ui
2. List all components in /components/features
3. List all components in /components/layout
4. Compare against COMPONENT_INDEX.md
5. Identify components that:
   - Exist but aren't in COMPONENT_INDEX.md
   - Are duplicates (similar functionality)
   - Should exist but don't

Create a table:
| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| Button | /components/ui/Button.tsx | ✅ Exists | - |
| CustomButton | /components/features/CustomButton.tsx | ❌ Duplicate | Should use Button |

Wait for my confirmation before proceeding to Phase 2.
```

---

## 🔍 Step 3: Design System Compliance Scan

### Prompt for Claude

```
Phase 2 - Design System Compliance:

For each component in our inventory, scan for M3 Expressive violations.

Check each file for:
1. Wrong border radius:
   - Buttons with rounded-lg, rounded-xl, rounded-2xl (should be rounded-full)
   - Cards with rounded-lg, rounded-xl (should be rounded-2xl)
   - Inputs with rounded-lg, rounded-full (should be rounded-2xl)

2. Shadows:
   - Any use of shadow-* classes (forbidden except toasts)
   - Any box-shadow in inline styles

3. Border width:
   - Buttons/inputs/cards with border or border-1 (should be border-2)

4. Colors:
   - bg-[#...] or text-[#...] (should use semantic tokens)
   - bg-blue-500, bg-gray-100 (should use CSS custom properties)

5. Gradients:
   - bg-gradient-to-* (forbidden in M3 Expressive)

6. Transforms for elevation:
   - translate-y, translateY (forbidden for depth)
   - scale transforms (only allowed for press feedback: active:scale-[0.98])

Create a violations report:
| Component | Violation Type | Line(s) | Severity | Fix |
|-----------|---------------|---------|----------|-----|
| SurveyCard | Wrong radius | 12 | High | Change rounded-xl to rounded-2xl |

Severity levels:
- Critical: Completely breaks design system (gradients, shadows)
- High: Wrong shapes, arbitrary colors
- Medium: Missing states, no TypeScript types
- Low: Minor spacing issues

Start with components in /components/ui first.
```

---

## 🎨 Step 4: Component Usage Analysis

### Prompt for Claude

```
Phase 3 - Component Usage:

Analyze feature components to see if they're using design system components correctly.

For each file in /components/features:
1. Does it import from /components/ui? (✅ Good)
2. Does it create custom styled divs? (❌ Bad)
3. Does it use native form elements? (❌ Bad)
4. Does it have custom button styling? (❌ Bad)

Example analysis:
File: /components/features/surveys/SurveyCard.tsx
✅ Imports Card from /components/ui
❌ Has custom button: <button className="px-4 py-2 bg-blue-500">
❌ Uses native input: <input type="text" className="border">
✅ Uses Badge component

Recommendation: Replace custom button with Button component, replace native input with Input component.

Create a usage report:
| Feature Component | ✅ Using UI Components | ❌ Custom Implementations | Priority |
|-------------------|----------------------|--------------------------|----------|
| SurveyCard | Card, Badge | button, input | High |

Priority:
- High: User-facing components (cards, forms, lists)
- Medium: Internal components (utilities, helpers)
- Low: Experimental or temporary components
```

---

## 📈 Step 5: Generate Refactoring Plan

### Prompt for Claude

```
Phase 4 - Refactoring Plan:

Based on the analysis, create a prioritized refactoring plan.

Group violations by:
1. **Critical** (breaks design system completely)
   - Shadows (except toasts)
   - Gradients
   - Transforms for elevation

2. **High Priority** (user-facing violations)
   - Wrong button shapes (not rounded-full)
   - Wrong card shapes (not rounded-2xl)
   - Custom buttons instead of Button component
   - Native inputs instead of Input component
   - Arbitrary colors

3. **Medium Priority** (consistency issues)
   - Inconsistent spacing
   - Missing loading/error states
   - No TypeScript types

4. **Low Priority** (minor issues)
   - Component not in COMPONENT_INDEX.md
   - Minor prop naming inconsistencies

For each priority group, estimate:
- Number of files affected
- Estimated time to fix
- Dependencies (what must be done first)

Format:
## Critical Priority (Fix Immediately)
1. Remove all shadows from Card components
   - Files: Card.tsx, SurveyCard.tsx, StatCard.tsx
   - Estimated time: 30 minutes
   - Dependencies: None
   - Impact: High (3 components, used in 10+ places)

## High Priority (Fix This Week)
...

## Medium Priority (Fix This Month)
...

## Low Priority (Fix When Convenient)
...
```

---

## 🔧 Step 6: Detailed File Analysis

### For Each Component That Needs Refactoring

```
Analyze [ComponentName] for refactoring:

Current file: [Paste the component code]

Questions:
1. What design system violations exist?
2. Which UI components from COMPONENT_INDEX.md should be used?
3. Can this component be simplified by composing existing components?
4. What's the refactoring strategy?
   a. Complete rewrite?
   b. Incremental fixes?
   c. Replace with existing component?

Provide:
1. List of specific violations (with line numbers)
2. Recommended UI components to use
3. Before/After code comparison for key sections
4. Step-by-step refactoring instructions

Format:
### Violations
- Line 12: Using `rounded-xl` (should be `rounded-2xl`)
- Line 15: Using `bg-blue-500` (should be `bg-primary`)
- Line 20: Custom button (should use Button component)

### Recommended Components
- Card (with variant="interactive")
- Button (with variant="filled")
- Badge (with variant based on status)

### Refactoring Strategy
1. Replace custom div with Card component
2. Replace custom button with Button component
3. Replace inline colors with semantic tokens
4. Add proper TypeScript types

### Before/After
[Show key sections]
```

---

## 📝 Example Analysis Session

### Example: Analyzing Dashboard Stats

```
You: "I want to analyze the dashboard stats section for refactoring."

You: "Here's the current code:"
[Paste code]

Claude: "Analysis of dashboard stats:

VIOLATIONS:
Critical:
- None

High Priority:
- Line 15: Using bg-purple-50 instead of bg-primary-container
- Line 18: Using rounded-2xl for icon container (should use IconContainer component)
- Line 25: Custom stat card structure (should use Stat component)

Medium Priority:
- No loading state
- No TypeScript interfaces
- Hardcoded colors for each stat type

COMPONENTS TO USE:
✅ Stat component from /components/ui/Stat.tsx
✅ IconContainer component from /components/ui/IconContainer.tsx

REFACTORING STRATEGY:
1. Replace each custom stat card with Stat component
2. Replace custom icon wrappers with IconContainer
3. Use semantic variants (success, warning, info)
4. Add TypeScript interface for stats data
5. Add loading state with LoadingState component

ESTIMATED TIME: 1 hour
PRIORITY: High (user-facing, dashboard is main page)

Would you like me to show the before/after code?"

You: "Yes, show me the refactored version."

Claude: [Shows refactored code using Stat and IconContainer]

You: "Perfect. Add this to the refactoring plan."
```

---

## 📊 Analysis Output Template

### Create This Document

```markdown
# Codebase Analysis - Dashboard Module

Date: [Today's date]

## Executive Summary

- Total components analyzed: X
- Components with violations: Y
- Components to refactor: Z
- Estimated total refactoring time: N hours

## Component Inventory

### UI Components (/components/ui)

| Component    | Status         | In Index? | Violations         |
| ------------ | -------------- | --------- | ------------------ |
| Button       | ✅ Compliant   | ✅ Yes    | None               |
| Card         | ⚠️ Needs fixes | ✅ Yes    | Wrong shadow usage |
| CustomButton | ❌ Duplicate   | ❌ No     | Should not exist   |

### Feature Components (/components/features)

| Component  | Uses UI Components? | Custom Implementations      | Priority |
| ---------- | ------------------- | --------------------------- | -------- |
| SurveyCard | Partial             | Custom button, native input | High     |
| StatCard   | No                  | Custom everything           | High     |

### Layout Components (/components/layout)

| Component      | Status          | Notes                    |
| -------------- | --------------- | ------------------------ |
| NavigationRail | ✅ Compliant    | -                        |
| PageHeader     | ⚠️ Minor issues | Missing TypeScript types |

## Violation Summary

### Critical (0 files)

None

### High Priority (5 files)

1. SurveyCard.tsx - Custom button, wrong card radius
2. StatCard.tsx - Custom stat implementation, arbitrary colors
3. CreateSurveyDialog.tsx - Native inputs, custom buttons
4. FilterTabs.tsx - Custom tab buttons, wrong shapes
5. SurveyList.tsx - No loading/error states

### Medium Priority (8 files)

[List files]

### Low Priority (3 files)

[List files]

## Detailed Analysis

### Critical Components

None

### High Priority Components

#### 1. SurveyCard.tsx

**Location**: `/components/features/surveys/SurveyCard.tsx`
**Violations**:

- Line 12: Using `rounded-xl` (should be `rounded-2xl`)
- Line 25: Custom button `<button className="...">` (should use Button component)
- Line 30: Using `bg-blue-500` (should use semantic token)

**Components to Use**:

- Card (variant="interactive")
- Button (variant="filled", "outlined")
- Badge (for status)

**Estimated Time**: 30 minutes
**Dependencies**: None
**Impact**: High (used in 10+ places)

**Refactoring Steps**:

1. Import Card, Button, Badge from /components/ui
2. Replace custom div with Card component
3. Replace custom buttons with Button component
4. Replace `bg-blue-500` with `bg-primary`
5. Add proper TypeScript interface
6. Test in all usage locations

[Continue for other components...]

## Refactoring Plan

### Week 1: Critical & High Priority UI Components

**Goal**: Fix design system violations in core UI components

- [ ] Day 1: Refactor Button component (if needed)
- [ ] Day 1: Refactor Card component (remove shadows)
- [ ] Day 2: Refactor Input, Textarea, Select components
- [ ] Day 3: Create missing UI components (Stat, IconContainer)
- [ ] Day 4-5: Update COMPONENT_INDEX.md, test components

**Estimated Time**: 3-4 days
**Deliverable**: Compliant UI component library

### Week 2: High Priority Feature Components

**Goal**: Refactor user-facing feature components

- [ ] Day 1: Refactor SurveyCard
- [ ] Day 2: Refactor StatCard → use Stat component
- [ ] Day 3: Refactor CreateSurveyDialog
- [ ] Day 4: Refactor FilterTabs
- [ ] Day 5: Refactor SurveyList (add states)

**Estimated Time**: 1 week
**Deliverable**: Dashboard page with compliant components

### Week 3: Medium Priority Components

**Goal**: Improve consistency and add missing features

- [ ] Add loading states to all lists
- [ ] Add error states with EmptyState component
- [ ] Add TypeScript types to all components
- [ ] Standardize spacing and colors

**Estimated Time**: 1 week
**Deliverable**: Complete, consistent dashboard module

### Week 4: Low Priority & Polish

**Goal**: Final cleanup and documentation

- [ ] Update COMPONENT_INDEX.md with all components
- [ ] Add missing accessibility features
- [ ] Performance optimization
- [ ] Documentation and examples

**Estimated Time**: 3-4 days
**Deliverable**: Production-ready dashboard module

## Success Metrics

After refactoring, the codebase should:

- ✅ 0 Critical violations
- ✅ 0 High Priority violations
- ✅ All buttons use rounded-full
- ✅ All cards use rounded-2xl base
- ✅ No shadows (except toasts)
- ✅ No arbitrary colors
- ✅ All feature components compose UI components
- ✅ All components have TypeScript types
- ✅ All lists have loading/error/empty states
- ✅ All components in COMPONENT_INDEX.md

## Next Steps

1. Review this analysis with the team
2. Confirm priorities and timeline
3. Start with Week 1 refactoring
4. Use CLAUDE_PROMPTS.md for refactoring sessions
5. Update this document as work progresses
```

---

## 🎯 Quick Analysis Workflow

### 1. Run Searches (5 minutes)

```bash
# In your project root
cd front/src

# M3 Expressive violations
echo "=== SHADOWS (should be 0 except toasts) ==="
grep -r "shadow-" components --include="*.tsx" | grep -v "Toast"

echo "=== WRONG BUTTON SHAPES ==="
grep -r "rounded-lg\|rounded-xl" components --include="*.tsx" | grep -i "button"

echo "=== ARBITRARY COLORS ==="
grep -r "bg-\[#\|text-\[#\|bg-blue-\|bg-gray-\|bg-purple-" components --include="*.tsx" | head -20

echo "=== NATIVE FORM ELEMENTS ==="
grep -r "<input\|<select\|<textarea" components --include="*.tsx" | wc -l

echo "=== CUSTOM BUTTONS ==="
grep -r '<button className' components --include="*.tsx" | wc -l
```

### 2. Ask Claude for Analysis (10 minutes)

```
Analyze my codebase for refactoring:

Search results:
[Paste the output from above commands]

Create a summary:
1. How many components have M3 violations?
2. What are the top 3 most common violations?
3. Which 5 components should I refactor first?
4. Estimated time to fix high-priority issues?

Format as a quick action plan.
```

### 3. Deep Dive on Priority Components (30 minutes per component)

```
Let's refactor [ComponentName]:

Current code:
[Paste component]

1. List all violations
2. Show which UI components to use from COMPONENT_INDEX.md
3. Show refactored version
4. Explain the changes

Follow COMPOSITION_PATTERNS.md for correct approach.
```

---

## 🚀 Automated Analysis Script (Optional)

If you want a Node.js script to automate some of this:

```javascript
// analyze.js
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const violations = {
  shadows: [],
  wrongRadius: [],
  arbitraryColors: [],
  nativeElements: [],
  customButtons: [],
};

// Search for violations
const files = glob.sync('src/components/**/*.{tsx,jsx}');

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, i) => {
    if (line.includes('shadow-') && !file.includes('Toast')) {
      violations.shadows.push({ file, line: i + 1, content: line.trim() });
    }
    if (line.match(/rounded-(sm|md|lg|xl)/) && line.toLowerCase().includes('button')) {
      violations.wrongRadius.push({ file, line: i + 1, content: line.trim() });
    }
    if (line.match(/bg-\[#|text-\[#|bg-blue-|bg-gray-|bg-purple-/)) {
      violations.arbitraryColors.push({ file, line: i + 1, content: line.trim() });
    }
    if (line.match(/<input|<select|<textarea/)) {
      violations.nativeElements.push({ file, line: i + 1, content: line.trim() });
    }
    if (line.match(/<button className/)) {
      violations.customButtons.push({ file, line: i + 1, content: line.trim() });
    }
  });
});

// Generate report
console.log('# Codebase Analysis Report\n');
console.log(`Analyzed ${files.length} files\n`);

console.log('## M3 Expressive Violations\n');
console.log(`### Shadows (${violations.shadows.length})`);
violations.shadows.slice(0, 5).forEach((v) => {
  console.log(`- ${v.file}:${v.line}: ${v.content}`);
});

console.log(`\n### Wrong Border Radius (${violations.wrongRadius.length})`);
violations.wrongRadius.slice(0, 5).forEach((v) => {
  console.log(`- ${v.file}:${v.line}: ${v.content}`);
});

console.log(`\n### Arbitrary Colors (${violations.arbitraryColors.length})`);
violations.arbitraryColors.slice(0, 5).forEach((v) => {
  console.log(`- ${v.file}:${v.line}: ${v.content}`);
});

console.log(`\n### Native Form Elements (${violations.nativeElements.length})`);
console.log('Should use Input, Select, Textarea components');

console.log(`\n### Custom Buttons (${violations.customButtons.length})`);
console.log('Should use Button component from /components/ui');

// Priority calculation
const priorityFiles = new Set();
[...violations.shadows, ...violations.wrongRadius, ...violations.arbitraryColors].forEach((v) => priorityFiles.add(v.file));

console.log('\n## High Priority Files (Top 10)\n');
const fileCounts = {};
priorityFiles.forEach((file) => {
  const count =
    violations.shadows.filter((v) => v.file === file).length +
    violations.wrongRadius.filter((v) => v.file === file).length +
    violations.arbitraryColors.filter((v) => v.file === file).length;
  fileCounts[file] = count;
});

Object.entries(fileCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([file, count]) => {
    console.log(`- ${file} (${count} violations)`);
  });
```

Run with:

```bash
node analyze.js > ANALYSIS_REPORT.md
```

---

## 📋 Summary

**To generate a refactoring analysis:**

1. **Quick Scan** (5 min): Run grep commands to find violations
2. **Component Inventory** (10 min): Ask Claude to list all components
3. **Compliance Check** (20 min): Ask Claude to identify M3 violations
4. **Usage Analysis** (15 min): Check if features use UI components
5. **Generate Plan** (15 min): Ask Claude to prioritize and estimate
6. **Deep Dive** (30 min each): Analyze priority components in detail

**Total time for initial analysis**: ~2-3 hours

**Output**: Detailed refactoring plan with priorities, estimates, and step-by-step instructions.

---

**Start with the Quick Scan searches, paste results to Claude, and use the prompts in this guide!**
