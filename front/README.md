# Survey Platform Monorepo

A modern survey platform built with a monorepo architecture using Turborepo and pnpm workspaces.

## 📁 Project Structure

```
survey-platform/
├── apps/
│   ├── admin/              # Vite + React admin dashboard
│   └── public-survey/      # Next.js public survey app
├── packages/
│   ├── types/              # Shared TypeScript types
│   ├── validation/         # Shared Zod validation schemas
│   ├── api-client/         # Shared API client utilities
│   └── ui/                 # Shared UI components (Phase 2)
├── package.json            # Root package.json with workspace scripts
├── pnpm-workspace.yaml     # pnpm workspace configuration
├── turbo.json              # Turborepo configuration
└── tsconfig.json           # Root TypeScript config with project references
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

### Installation

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install all dependencies
pnpm install

# Build all packages (required before running apps)
pnpm build
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run only the admin app
pnpm dev:admin

# Run only the public survey app
pnpm dev:public
```

### Building

```bash
# Build all apps and packages
pnpm build

# Build specific app
pnpm build:admin
pnpm build:public
```

### Other Commands

```bash
# Lint all packages
pnpm lint

# Type check all packages
pnpm typecheck

# Clean all build artifacts
pnpm clean

# Format code
pnpm format
```

## 📦 Packages

### `@survey/types`

Shared TypeScript types and enums used across all apps.

```typescript
import { QuestionType, PublicSurvey } from "@survey/types";
```

### `@survey/validation`

Zod schemas and validation utilities for survey answers.

```typescript
import { validateAnswer, validateAllAnswers } from "@survey/validation";
```

### `@survey/api-client`

API client utilities for interacting with the survey backend.

```typescript
import { fetchPublicSurvey, submitSurveyResponse } from "@survey/api-client";
```

### `@survey/ui`

Shared UI components and theme utilities (to be expanded in Phase 2).

```typescript
import { generateThemeCSSVariables, cn } from "@survey/ui";
```

## 🏗️ Apps

### Admin (`@survey/admin`)

The admin dashboard built with:

- Vite + React 19
- React Router DOM v7
- Zustand + TanStack Query
- Tailwind CSS 4

**Port:** 3000

### Public Survey (`@survey/public-survey`)

The public survey experience built with:

- Next.js 16.1 (App Router)
- Server-side rendering for SEO
- Zustand for client state
- Tailwind CSS 4

**Port:** 3001

## 🔧 Configuration

### Environment Variables

#### Admin (`apps/admin/.env`)

```env
VITE_API_URL=http://localhost:5000
```

#### Public Survey (`apps/public-survey/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📝 Architecture Decisions

This monorepo follows the architecture outlined in [SEPARATION.md](./SEPARATION.md):

1. **Separate apps for different concerns:**
   - Admin: Complex SPA with heavy client state
   - Public Survey: SSR-optimized for SEO and performance

2. **Shared packages to avoid duplication:**
   - Types, validation, and UI components are shared
   - Single source of truth for domain models

3. **Turborepo for efficient builds:**
   - Caching for faster rebuilds
   - Parallel task execution
   - Dependency-aware build ordering

## 🛣️ Roadmap

### Phase 1: Monorepo Setup ✅

- [x] Initialize Turborepo with pnpm workspaces
- [x] Create shared packages structure
- [x] Configure apps for monorepo

### Phase 2: Extract Shared Code (Next)

- [ ] Extract QuestionRenderers to `@survey/ui`
- [ ] Extract theme system to `@survey/ui`
- [ ] Move validation schemas to `@survey/validation`

### Phase 3: Complete Public Survey App

- [ ] Implement all question type renderers
- [ ] Add full i18n support
- [ ] Implement response submission flow
- [ ] Add OG image generation

### Phase 4: Deployment

- [ ] Configure CI/CD pipelines
- [ ] Set up preview deployments
- [ ] Configure production deployment

## 📄 License

Private - All rights reserved.
