I need you to check #file:queryUtils.ts and look for possible improvements, optimizations, etc. based on React 19 and the best practices.CHECK THE BACKEND AS WELL and UPDATE it if RECOMMENDED and NEEDED (IF THAT IS THE WAY). BREAKING CHANGES ARE WELCOME as this project is WIP and suggest improvement if these two are related. See if the functions etc. are properly implemented.

DO NOT MAKE ASSUMPTIONS, NEED PROPER AND QUALITY IMPLEMENTATION.

Provide:

1. ✅ What's good
2. ⚠️ Issues (Critical/High/Medium/Low)
3. 🔧 Fixes (before/after code)
4. 💡 Improvements
5. ⭐ Rating (1-5 stars)

And then, apply the fixes you recommend.

CHECK FOR BACKEND AND FRONTEND (npx tsc -p tsconfig.app.json) ERRORS/ WARNINGS AND FIX THEM AT THE END.

---

#file:useQuestionLogic.ts

CHECK THE BACKEND and UPDATE it if RECOMMENDED and NEEDED (IF THAT IS THE WAY). BREAKING CHANGES ARE WELCOME (DO BREAKING CHANGES PLEASE IF NEEDED AS IT WILL LEAD TO CLEANER CODE) as this project is WIP.
DO NOT MAKE ASSUMPTIONS, NEED PROPER AND QUALITY IMPLEMENTATION.

Audit this React 19 custom hook for best practices and issues:

**1. NAMING & STRUCTURE**

- ✓ Starts with "use" prefix
- ✓ Returns appropriate type (value, tuple, object)
- ✓ Has proper TypeScript types
- ✓ Has JSDoc comments

**2. REACT 19 FEATURES**

- ✓ Uses React 19 features correctly (use, useActionState, useFormStatus, useOptimistic)
- ✓ Doesn't use deprecated patterns
- ✓ Leverages new capabilities where appropriate

**3. DEPENDENCY ARRAYS**

- ✓ All useEffect/useMemo/useCallback have correct dependencies
- ✓ No missing dependencies
- ✓ No unnecessary dependencies
- ✓ Uses useCallback for function dependencies

**4. PERFORMANCE**

- ✓ Memoization used appropriately (not over-memoized)
- ✓ No unnecessary re-renders
- ✓ Heavy computations are memoized
- ✓ Refs used for values that shouldn't trigger re-renders

**5. CLEANUP**

- ✓ useEffect cleanup functions present where needed
- ✓ Event listeners removed
- ✓ Timers/intervals cleared
- ✓ Async operations cancelled
- ✓ Subscriptions unsubscribed

**6. ERROR HANDLING**

- ✓ Handles edge cases (null, undefined, empty arrays)
- ✓ Catches async errors
- ✓ Provides error state if needed
- ✓ Fails gracefully

**7. ANTI-PATTERNS**

- ✗ No conditional hooks (hooks in if/loops)
- ✗ No setting state in render
- ✗ No infinite loops (setState in useEffect without deps)
- ✗ No stale closures
- ✗ No direct DOM manipulation (use refs)

**8. BEST PRACTICES**

- ✓ Single responsibility (does one thing well)
- ✓ Composable (can combine with other hooks)
- ✓ Testable (no hidden dependencies)
- ✓ Reusable (not tied to specific component)

**9. REACT QUERY / EXTERNAL STATE**

- ✓ If fetching data: Consider using React Query instead
- ✓ If managing global state: Should this be Zustand/Context?
- ✓ Not reinventing existing solutions

**10. ACCESSIBILITY**

- ✓ If managing focus: Handles keyboard navigation
- ✓ If managing modals/dialogs: Traps focus appropriately
- ✓ Announces state changes to screen readers if needed

Provide:

1. ✅ What's good (praise what's done right)
2. ⚠️ Issues found (categorized by severity: Critical/High/Medium/Low)
3. 🔧 Specific fixes with before/after code
4. 💡 Improvement suggestions (optional optimizations)
5. ⭐ Overall rating (1-5 stars) with justification

Format issues as:
**[SEVERITY] Issue Title**

- Problem: What's wrong
- Impact: Why it matters
- Fix: How to fix it (with code)

Then apply the best recommended fixes.

CHECK FOR BACKEND AND FRONTEND (npx tsc -p tsconfig.app.json) ERRORS/ WARNINGS AND FIX THEM AT THE END.

---

BREAKING CHANGES ARE WELCOME as this project is WIP and suggest improvement if these two are related. See if the functions etc. are properly implemented.

DO NOT MAKE ASSUMPTIONS, NEED PROPER AND QUALITY IMPLEMENTATION.

CHECK FOR BACKEND AND FRONTEND (npx tsc -p tsconfig.app.json) ERRORS/ WARNINGS AND FIX THEM AT THE END.

IMPLEMENT THAT ARCHITECTURAL FIX ACROSS THE CODEBASE PLEASE.

---

PLEASE COMPARE #file:EmailDistributionsController.cs IN DETAIL in back and front, find out the mismatches IN REQUEST AND RESPONSE MODELS, and if any do the recommended actions.

CHECK THE BACKEND and UPDATE it if RECOMMENDED and NEEDED (IF THAT IS THE WAY). BREAKING CHANGES ARE WELCOME (DO BREAKING CHANGES PLEASE IF NEEDED AS IT WILL LEAD TO CLEANER CODE) as this project is STILL IN DEVELOPMENT.
DO NOT MAKE ASSUMPTIONS, NEED PROPER AND QUALITY IMPLEMENTATION.

BASED ON THE BEST PRACTICES, IF BACKEND IS BETTER, MATCH FRONT TO BACK, OTHERWISE, VICE-VERSA. IF NEITHER IS GOOD, THEN RESTRUCTURE BOTH.
