# Architectural Analysis: Admin + Public Survey Application

## 📊 Current State Analysis

Based on my exploration, here's what you have:

| Aspect             | Current State                                 |
| ------------------ | --------------------------------------------- |
| **Framework**      | Vite + React 19 + TypeScript                  |
| **Routing**        | React Router DOM v7 (SPA)                     |
| **State**          | Zustand (global) + TanStack Query (server)    |
| **Styling**        | Tailwind CSS 4 + Material Design 3 Expressive |
| **Auth**           | JWT + Azure AD SSO                            |
| **i18n**           | react-i18next (client-side)                   |
| **Code Splitting** | Lazy loading via `React.lazy()`               |

### Application Structure

**Admin Section** (~95% of codebase):

- Dashboard, Surveys, Templates, Themes, Analytics, Distributions, Email Templates, Settings, Namespaces
- Protected routes requiring authentication
- Complex CRUD operations, drag-and-drop, form builders

**Public Section** (~5% of codebase):

- Single route: `/s/:shareToken`
- Survey respondent experience (anonymous or tracked)
- Self-contained with its own store (publicSurveyStore.ts)
- No authentication required

---

## 🔍 Analysis of Your Questions

### 1. Should Admin and Public Survey Be Separate Projects?

**My Recommendation: YES, but with nuance**

#### Arguments FOR Separation:

| Factor                      | Impact                                                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **SEO Requirements**        | Public surveys need meta tags, OG images, structured data. Currently, your index.html has no dynamic SEO — a significant limitation |
| **Bundle Size**             | Public users download admin code chunks (vendors, icons) they'll never use                                                          |
| **Security Surface**        | Smaller attack surface when public app has minimal code                                                                             |
| **Deployment Independence** | Scale public surveys independently during high-traffic campaigns                                                                    |
| **Performance Budget**      | Public surveys can have aggressive performance targets without admin bloat                                                          |
| **Team Scalability**        | Different teams can own each app                                                                                                    |

#### Arguments AGAINST Separation:

| Factor                   | Impact                                                             |
| ------------------------ | ------------------------------------------------------------------ |
| **Shared Components**    | `QuestionRenderers.tsx`, theme system, validation logic are shared |
| **Maintenance Overhead** | Two repos, two CI/CD pipelines, version sync complexity            |
| **Type Consistency**     | Need shared types package (monorepo or npm package)                |
| **Current Size**         | Public survey is small (~10 files) — separation may be premature   |

#### Verdict: **Separate, but via Monorepo**

Use a **monorepo structure** (pnpm workspaces, Turborepo, or Nx) to get benefits of both:

```
survey-platform/
├── apps/
│   ├── admin/          # Vite + React (current app minus public)
│   └── public-survey/  # Next.js (new)
├── packages/
│   ├── ui/             # Shared components (QuestionRenderers, theme)
│   ├── types/          # Shared TypeScript types
│   ├── validation/     # Zod schemas, validation logic
│   └── api-client/     # Shared API utilities
└── turbo.json
```

---

### 2. Should You Switch from Vite to Next.js?

**My Recommendation: Keep Vite for Admin, Use Next.js for Public Survey**

#### Vite vs Next.js Comparison for YOUR Use Case:

| Capability             | Admin Needs                  | Public Survey Needs                      | Vite           | Next.js     |
| ---------------------- | ---------------------------- | ---------------------------------------- | -------------- | ----------- |
| **SSR**                | ❌ Not needed                | ✅ Critical for SEO                      | ❌ No (SPA)    | ✅ Yes      |
| **Dynamic Meta Tags**  | ❌ Not needed                | ✅ Survey title, description in `<head>` | ❌ No          | ✅ Yes      |
| **Build Speed**        | ✅ Important (large app)     | ⚪ Less important                        | ✅ Excellent   | ⚪ Good     |
| **HMR Speed**          | ✅ Critical for DX           | ⚪ Less important                        | ✅ Excellent   | ⚪ Good     |
| **Client State**       | ✅ Heavy (Zustand, builders) | ⚪ Light                                 | ✅ Natural fit | ✅ Works    |
| **Static Export**      | ❌ Not useful                | ⚪ Possible but limited                  | ✅ Yes         | ✅ Yes      |
| **Image Optimization** | ⚪ Nice to have              | ✅ Theme logos, backgrounds              | ❌ Manual      | ✅ Built-in |
| **API Routes**         | ❌ Have backend              | ⚪ Could proxy                           | ❌ No          | ✅ Yes      |
| **Edge Runtime**       | ❌ Not needed                | ✅ Global survey delivery                | ❌ No          | ✅ Yes      |

#### Why Keep Vite for Admin:

1. **No SSR benefit** — Admin is behind auth, not indexed by search engines
2. **Complex client state** — Survey builder, drag-and-drop work better as pure SPA
3. **Faster builds** — Vite is significantly faster for large apps
4. **Migration cost** — Rewriting admin in Next.js provides minimal benefit

#### Why Next.js for Public Survey:

1. **SEO is critical** — Survey URLs get shared on social media
2. **Dynamic `<head>`** — Each survey needs unique title/description/OG image:

```tsx
// With Next.js App Router
export async function generateMetadata({ params }) {
  const survey = await getSurvey(params.shareToken);
  return {
    title: survey.title,
    description: survey.description,
    openGraph: {
      title: survey.title,
      images: [survey.theme?.ogImageUrl],
    },
  };
}
```

3. **Faster initial load** — Server-rendered HTML appears instantly
4. **Edge caching** — Deploy to Vercel Edge/Cloudflare for global low-latency
5. **Smaller bundle** — Only survey-taking code, no admin overhead

---

### 3. Feasibility Assessment

#### Next.js for Public Survey: **Highly Feasible**

| Migration Task                     | Complexity | Notes                                         |
| ---------------------------------- | ---------- | --------------------------------------------- |
| Move `PublicSurveyPage` to Next.js | 🟢 Low     | Mostly copy-paste, adjust routing             |
| Convert `publicSurveyStore`        | 🟢 Low     | Zustand works in Next.js                      |
| Shared question renderers          | 🟡 Medium  | Extract to shared package                     |
| Shared types                       | 🟢 Low     | Already well-defined in public-survey.ts      |
| Theme system                       | 🟡 Medium  | CSS variables work, extract theme logic       |
| i18n                               | 🟡 Medium  | Use `next-intl` or Next.js i18n routing       |
| API calls                          | 🟢 Low     | Move to server components or keep client-side |

#### Next.js for Admin: **Not Recommended**

| Migration Task   | Complexity | Notes                             |
| ---------------- | ---------- | --------------------------------- |
| Survey Builder   | 🔴 High    | Heavy client state, drag-and-drop |
| Protected Routes | 🟡 Medium  | Need middleware + client auth     |
| 150+ Components  | 🔴 High    | Massive migration effort          |
| Azure AD SSO     | 🟡 Medium  | Works but needs adaptation        |
| ROI              | 🔴 Low     | Effort doesn't justify benefit    |

---

## 🎯 Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     survey-platform (Monorepo)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │   apps/admin        │    │  apps/public-survey │        │
│  │   ──────────        │    │  ─────────────────  │        │
│  │   Vite + React      │    │  Next.js 15         │        │
│  │   React Router      │    │  App Router         │        │
│  │   admin.survey.com  │    │  survey.com/s/*     │        │
│  │                     │    │                     │        │
│  │  • Dashboard        │    │  • Survey taking    │        │
│  │  • Survey Builder   │    │  • Thank you page   │        │
│  │  • Analytics        │    │  • SSR + SEO        │        │
│  │  • Templates        │    │  • Edge optimized   │        │
│  │  • Distributions    │    │                     │        │
│  │  • Settings         │    │                     │        │
│  └─────────────────────┘    └─────────────────────┘        │
│           │                          │                      │
│           └──────────┬───────────────┘                      │
│                      ▼                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              packages/ (Shared)                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │   │
│  │  │   ui     │ │  types   │ │validation│ │  api   │  │   │
│  │  │Question  │ │PublicQ   │ │  Zod     │ │ client │  │   │
│  │  │Renderers │ │Themes    │ │ schemas  │ │ utils  │  │   │
│  │  │Theme     │ │Answers   │ │          │ │        │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Backend API    │
                    │  (Unchanged)    │
                    └─────────────────┘
```

---

## 📋 Implementation Roadmap

### Phase 1: Monorepo Setup (1-2 days)

1. Initialize Turborepo or pnpm workspaces
2. Move current app to `apps/admin`
3. Create `packages/types` with shared types

### Phase 2: Extract Shared Code (2-3 days)

1. Create `packages/ui` with question renderers
2. Create `packages/validation` with Zod schemas
3. Update imports in admin app

### Phase 3: Build Public Survey App (3-5 days)

1. Create `apps/public-survey` with Next.js 15 (App Router)
2. Implement `/s/[shareToken]` route with SSR
3. Add dynamic metadata generation
4. Migrate public survey components
5. Set up i18n with server-side language detection

### Phase 4: Deployment & DNS (1 day)

1. Deploy admin to `admin.yourdomain.com`
2. Deploy public to `yourdomain.com` with `/s/*` routes
3. Or use path-based routing with reverse proxy

---

## 💡 Additional Suggestions

### 1. **Public Survey Performance Optimizations**

```tsx
// Next.js: Streaming + Suspense for fast first paint
export default async function SurveyPage({ params }) {
  return (
    <Suspense fallback={<SurveyShell />}>
      <Survey shareToken={params.shareToken} />
    </Suspense>
  );
}
```

### 2. **Consider Survey Embed Support**

With Next.js, you can easily add iframe embed support:

```
/s/[shareToken]       → Full page survey
/embed/[shareToken]   → Embeddable (no header/footer)
```

### 3. **Add OG Image Generation**

```tsx
// apps/public-survey/app/s/[shareToken]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export default async function OGImage({ params }) {
  const survey = await getSurvey(params.shareToken);
  return new ImageResponse(
    (
      <div
        style={
          {
            /* branded design */
          }
        }
      >
        {survey.title}
      </div>
    )
  );
}
```

### 4. **Current SEO Gap**

Your current index.html is static — a major limitation for shared survey links. This alone justifies Next.js for public surveys.

---

## Summary

| Question                    | Answer                                                             |
| --------------------------- | ------------------------------------------------------------------ |
| Separate projects?          | **Yes** — via monorepo with shared packages                        |
| Switch to Next.js entirely? | **No** — keep Vite for admin                                       |
| Next.js for public survey?  | **Yes** — SSR, SEO, and performance benefits are significant       |
| Feasibility?                | **High** — public survey is isolated, migration is straightforward |

The recommended path gives you:

- ✅ SEO for public surveys
- ✅ Fast admin development with Vite
- ✅ Shared code without duplication
- ✅ Independent scaling and deployment
- ✅ Smaller bundles for each app
