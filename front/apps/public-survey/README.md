# Public Survey App

The public-facing survey respondent application built with Next.js 15 (App Router).

## Overview

This app provides the survey-taking experience for respondents. It's designed for:

- **SEO optimization** - Server-side rendering with dynamic metadata
- **Performance** - Minimal bundle size, edge-optimized
- **Accessibility** - Full keyboard navigation, screen reader support
- **i18n** - Multi-language support (en, az, ru)

## Features

- 🚀 **SSR/SSG** - Server-side rendering for optimal SEO
- 🖼️ **Dynamic OG Images** - Auto-generated Open Graph images per survey
- 🌐 **i18n** - Server-side language detection + URL-based language switching
- 💾 **Progress Persistence** - Auto-save progress to localStorage
- 🎨 **Theming** - Full theme support with CSS custom properties
- 📱 **Responsive** - Mobile-first design
- ⚡ **Edge Runtime** - OG image generation on the edge

## Routes

| Route                             | Description                |
| --------------------------------- | -------------------------- |
| `/`                               | Landing page (placeholder) |
| `/s/[shareToken]`                 | Survey page with SSR       |
| `/s/[shareToken]/opengraph-image` | Dynamic OG image           |

## Environment Variables

```env
# API URL for the backend
NEXT_PUBLIC_API_URL=http://localhost:5001

# Base URL for this app (used for meta tags, canonical URLs)
NEXT_PUBLIC_BASE_URL=http://localhost:3001

# Default language (en, az, ru)
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
```

## Development

```bash
# From monorepo root
pnpm dev --filter=@survey/public-survey

# Or from this directory
pnpm dev
```

The app runs on http://localhost:3001 by default.

## Architecture

```
app/
├── layout.tsx          # Root layout with fonts, viewport config
├── page.tsx            # Landing page
├── globals.css         # Global styles with Material Design 3 tokens
└── s/
    └── [shareToken]/
        ├── page.tsx           # Survey page (SSR)
        ├── survey-client.tsx  # Client-side survey logic
        ├── loading.tsx        # Loading skeleton
        ├── error.tsx          # Error boundary
        ├── not-found.tsx      # 404 page
        └── opengraph-image.tsx # Dynamic OG image (Edge)

components/
├── SurveyShell.tsx     # Theme wrapper
├── WelcomeView.tsx     # Survey intro
├── QuestionsView.tsx   # Question rendering
├── ThankYouView.tsx    # Completion screen
├── ErrorView.tsx       # Error display
├── ProgressBar.tsx     # Progress indicator
└── LoadingSkeleton.tsx # Loading placeholder

lib/
├── config.ts           # Environment config
├── i18n.ts             # Translation utilities & language detection
├── logic-evaluator.ts  # Conditional logic engine
└── progress-persistence.ts # localStorage persistence

locales/                # 🌐 Translation files (JSON)
├── en.json             # English translations
├── az.json             # Azerbaijani translations
├── ru.json             # Russian translations
└── index.ts            # Locale exports with types

store/
└── survey-store.ts     # Zustand store for survey state
```

## Internationalization (i18n)

Translations are stored in JSON files under `/locales/`:

```
locales/
├── en.json   # English (default)
├── az.json   # Azerbaijani
├── ru.json   # Russian
└── index.ts  # Type-safe exports
```

### Adding a New Language

1. Create a new JSON file: `locales/de.json`
2. Copy structure from `en.json` and translate
3. Add import/export in `locales/index.ts`
4. Add language code to `SUPPORTED_LANGUAGES` in `lib/config.ts`

### Adding New Translation Keys

1. Add key to all JSON files (`en.json`, `az.json`, `ru.json`)
2. The `TranslationKey` type auto-generates from JSON structure
3. Use with `t('new.key.path', lang)` or `t('key', lang, { param: value })`

### Translation Format

```json
{
  "namespace": {
    "key": "Simple text",
    "withParam": "Hello {name}!",
    "nested": {
      "deep": "Nested value"
    }
  }
}
```

## Shared Packages

This app uses shared packages from the monorepo:

- `@survey/types` - TypeScript types
- `@survey/ui` - Question renderers, theme utilities
- `@survey/ui-primitives` - Base UI components
- `@survey/validation` - Answer validation
- `@survey/api-client` - API utilities

## Build

```bash
pnpm build
```

## Deployment

The app is designed to be deployed to edge platforms like Vercel or Cloudflare Pages for global low-latency delivery.
