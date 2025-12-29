# Frontend Localization Migration

## Overview

This document tracks the frontend migration to support the **translation-only architecture** implemented in the backend. The backend now stores all localizable content exclusively in translation tables, and the frontend types have been updated to reflect this.

**Date Started:** December 28, 2025  
**Status:** ✅ Survey, Question, SurveyTemplate, SurveyTheme, and EmailTemplate entities completed (Phases 1-3, 5)

---

## ⚠️ Breaking Changes

This migration includes **breaking changes** - `languageCode` is now **required** in all create/update requests:

- `CreateSurveyRequest.languageCode` - **Required**
- `UpdateSurveyRequest.languageCode` - **Required**
- `CreateQuestionRequest.languageCode` - **Required**
- `UpdateQuestionRequest.languageCode` - **Required**
- `CreateSurveyFromTemplateRequest.languageCode` - **Required**
- `CreateTemplateRequest.languageCode` - **Required**
- `CreateTemplateFromSurveyRequest.languageCode` - Optional (uses source survey's language if not provided)
- `CreateThemeRequest.languageCode` - Optional (uses current UI language if not provided)

All UI components and hooks have been updated to provide the required `languageCode`.

---

## Architecture Summary

The backend has migrated from a dual-storage model (main fields + translations) to a translation-only model. The frontend now receives:

1. **Localized content** based on the requested language (`Accept-Language` header or `?lang=` query param)
2. **Metadata** about available translations (`defaultLanguage`, `language`, `availableLanguages`)

### API Request Flow

```
Frontend Request
    ↓
    Headers: Accept-Language: es
    OR
    Query: ?lang=es
    ↓
Backend Response
    ↓
    {
      "title": "Encuesta de Satisfacción",  // Spanish content
      "language": "es",                      // Current language
      "defaultLanguage": "en",               // Survey's default
      "availableLanguages": ["en", "es", "fr"]
    }
```

---

## Completed Changes

### 1. Type Definitions

#### `Survey` Interface (`types/models.ts`)

Added localization fields:

```typescript
export interface Survey {
  // ... existing fields ...

  // Localization - added for translation-only architecture
  /** The default language code for this survey */
  defaultLanguage: string;
  /** The language of the returned content (based on request) */
  language: string;
  /** List of available language codes for this survey */
  availableLanguages: string[];
}
```

#### `CreateSurveyRequest` Interface

Added **required** language code:

```typescript
export interface CreateSurveyRequest {
  // ... existing fields ...
  /** Language code for the initial translation */
  languageCode: string; // Required!
}
```

#### `UpdateSurveyRequest` Interface

Added **required** language code:

```typescript
export interface UpdateSurveyRequest {
  // ... existing fields ...
  /** Language code for the translation to update */
  languageCode: string; // Required!
}
```

#### `CreateQuestionRequest` & `UpdateQuestionRequest` Interfaces

Added **required** language code to both:

```typescript
/** Language code for the initial/update translation */
languageCode: string; // Required!
```

#### `PublicSurvey` Interface (`types/public-survey.ts`)

Added localization fields:

```typescript
export interface PublicSurvey {
  // ... existing fields ...
  /** The language of the returned content (based on request) */
  language: string;
  /** List of available language codes for this survey */
  availableLanguages: string[];
}
```

---

### 2. Translation Management Types (`types/api.ts`)

Added types for the bulk translation management API:

```typescript
/** DTO for a single survey translation */
export interface SurveyTranslationDto {
  languageCode: string;
  title: string;
  description?: string;
  welcomeMessage?: string;
  thankYouMessage?: string;
  isDefault: boolean;
}

/** DTO for a single question translation */
export interface QuestionTranslationItemDto {
  languageCode: string;
  text: string;
  description?: string;
  isDefault: boolean;
}

/** DTO containing all translations for a question */
export interface QuestionTranslationsDto {
  questionId: string;
  order: number;
  defaultLanguage: string;
  translations: QuestionTranslationItemDto[];
}

/** Response DTO containing all translations for a survey */
export interface SurveyTranslationsResponse {
  surveyId: string;
  defaultLanguage: string;
  translations: SurveyTranslationDto[];
  questions: QuestionTranslationsDto[];
}

/** Request to bulk update all translations for a survey */
export interface BulkUpdateSurveyTranslationsRequest {
  translations: SurveyTranslationDto[];
}

/** Request to update a single translation for a survey */
export interface UpdateSurveyTranslationRequest {
  title: string;
  description?: string;
  welcomeMessage?: string;
  thankYouMessage?: string;
}

/** Result DTO for bulk translation operations */
export interface BulkTranslationResultDto {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  errors: string[];
  languages: string[];
}
```

---

### 3. API Endpoints (`config/api.ts`)

Added translation management endpoints:

```typescript
translations: {
  survey: (surveyId: string) => `/api/surveys/${surveyId}/translations`,
  surveyByLang: (surveyId: string, languageCode: string) =>
    `/api/surveys/${surveyId}/translations/${languageCode}`,
},
```

---

### 4. API Service (`services/api.ts`)

Added `translationsApi` with methods for:

```typescript
export const translationsApi = {
  /** Get all translations for a survey (including question translations) */
  getAll: (surveyId: string) => Promise<SurveyTranslationsResponse>,

  /** Bulk update all translations for a survey */
  bulkUpdate: (surveyId: string, data: BulkUpdateSurveyTranslationsRequest) => Promise<BulkTranslationResultDto>,

  /** Update a single translation for a survey */
  updateByLanguage: (surveyId: string, languageCode: string, data: UpdateSurveyTranslationRequest) => Promise<SurveyTranslationDto>,

  /** Add a new translation for a survey */
  add: (surveyId: string, data: SurveyTranslationDto) => Promise<SurveyTranslationDto>,

  /** Delete a translation for a survey */
  delete: (surveyId: string, languageCode: string) => Promise<void>,
};
```

### 5. UI Components

#### `CreateSurveyDialog`

- Added `languageCode` state initialized from current UI language
- Added language selector dropdown in footer
- Passes `languageCode` in form data on submit

#### `useSurveyBuilderSave` Hook

- Updated to pass `survey.defaultLanguage` when saving survey metadata
- Updated to pass `languageCode` to `calculateQuestionChanges`

#### `calculateQuestionChanges` Function

- Now requires `languageCode` parameter
- Includes `languageCode` in all create/update question requests

---

### 6. SurveyTemplate Types (`types/models.ts`)

#### `SurveyTemplate` Interface

Added localization fields:

```typescript
export interface SurveyTemplate {
  // ... existing fields ...

  // Localization - added for translation-only architecture
  /** The default language code for this template */
  defaultLanguage: string;
  /** The language of the returned content (based on request) */
  language: string;
  /** List of available language codes for this template */
  availableLanguages: string[];
}
```

#### `TemplateQuestion` Interface

Added localization field:

```typescript
export interface TemplateQuestion {
  // ... existing fields ...

  // Localization - added for translation-only architecture
  /** The default language code for this template question */
  defaultLanguage: string;
}
```

#### `CreateTemplateRequest` Interface

Added **required** language code:

```typescript
export interface CreateTemplateRequest {
  // ... existing fields ...
  /** Language code for the initial translation */
  languageCode: string; // Required!
}
```

#### `CreateTemplateFromSurveyRequest` Interface

Added optional language code:

```typescript
export interface CreateTemplateFromSurveyRequest {
  // ... existing fields ...
  /** Language code for the initial translation (uses source survey's language if not provided) */
  languageCode?: string;
}
```

#### `UpdateTemplateRequest` Interface

Added optional language code:

```typescript
export interface UpdateTemplateRequest {
  // ... existing fields ...
  /** Language code for the translation to update */
  languageCode?: string;
}
```

### 7. SurveyTemplate UI Components

#### `CreateTemplateDialog`

- Added `languageCode` field to form with validation
- Added language selector dropdown in footer
- Passes `languageCode` in form data on submit

#### `useCreateTemplate` Hook

- Updated to accept `languageCode` in mutation data
- Passes `languageCode` to `templatesApi.create()`

#### `useCreateTemplateFromSurvey` Hook

- Updated to accept optional `languageCode` in mutation data
- Passes `languageCode` to `templatesApi.createFromSurvey()`

#### `TemplatesPage`

- Updated `handleCreateTemplate` to pass `languageCode` when creating templates

---

### 8. SurveyTheme Types (`types/models.ts`)

#### `SurveyTheme` Interface

Added localization fields:

```typescript
export interface SurveyTheme {
  // ... existing fields ...

  // Localization - added for translation-only architecture
  /** The default language code for this theme */
  defaultLanguage: string;
  /** The language of the returned content (based on request) */
  language: string;
  /** List of available language codes for this theme */
  availableLanguages: string[];
}
```

#### `CreateThemeRequest` Interface (`services/api.ts`)

Added optional language code:

```typescript
export interface CreateThemeRequest {
  // ... existing fields ...
  /** Language code for the initial translation */
  languageCode?: string;
}
```

### 9. SurveyTheme UI Components

#### `ThemesPage`

- Updated `handleSaveTheme` to pass `languageCode` when creating/updating themes
- Uses existing theme's `defaultLanguage` when editing, or `getCurrentLanguage()` when creating new

---

### 10. EmailTemplate Types (`types/models.ts`)

#### `EmailTemplate` Interface

Added localization fields:

```typescript
export interface EmailTemplate {
  // ... existing fields ...

  // Localization - added for translation-only architecture
  /** The default language code for this email template */
  defaultLanguage: string;
  /** The language of the returned content (based on request) */
  language: string;
  /** List of available language codes for this email template */
  availableLanguages: string[];
}
```

#### `EmailTemplateSummary` Interface

Added localization field:

```typescript
export interface EmailTemplateSummary {
  // ... existing fields ...

  // Localization - added for translation-only architecture
  /** The default language code for this email template */
  defaultLanguage: string;
}
```

#### `CreateEmailTemplateRequest` Interface

Added optional language code:

```typescript
export interface CreateEmailTemplateRequest {
  // ... existing fields ...
  /** Language code for the initial translation */
  languageCode?: string;
}
```

#### `UpdateEmailTemplateRequest` Interface

Added optional language code:

```typescript
export interface UpdateEmailTemplateRequest {
  // ... existing fields ...
  /** Language code for the translation to update */
  languageCode?: string;
}
```

### 11. EmailTemplate UI Components

#### `CreateEmailTemplateDialog`

- Added `languageCode` state initialized from current UI language
- Added language selector dropdown in dialog footer
- Passes `languageCode` in form data on submit
- Resets `languageCode` when dialog closes

#### `VisualEmailEditor`

- Updated `handleSave` to pass `template.defaultLanguage` when saving

#### `EmailTemplateEditor` (Code Editor)

- Updated `handleSave` to pass `template.defaultLanguage` when saving

#### `emailTemplatesApi.duplicate`

- Updated to include `designJson` in duplicated template
- Now passes `original.defaultLanguage` as `languageCode` when creating duplicate

---

## Usage Examples

### Creating a Survey with Spanish as Default

```typescript
import { surveysApi } from '@/services';

const survey = await surveysApi.create(namespaceId, {
  title: 'Encuesta de Satisfacción',
  description: 'Ayúdenos a mejorar',
  languageCode: 'es', // Required - Default language will be Spanish
});
```

### Updating Survey Content in a Specific Language

```typescript
// Update Spanish translation
await surveysApi.update(surveyId, {
  surveyId,
  title: 'Nueva Encuesta de Satisfacción',
  languageCode: 'es',
});

// Add French translation
await translationsApi.add(surveyId, {
  languageCode: 'fr',
  title: 'Enquête de satisfaction',
  description: 'Aidez-nous à nous améliorer',
  isDefault: false,
});
```

### Getting Survey Translations

```typescript
// Get all translations
const translations = await translationsApi.getAll(surveyId);
console.log(translations.availableLanguages); // ['en', 'es', 'fr']
```

### Displaying Language Selector (Future UI)

```tsx
function LanguageSelector({ survey }: { survey: Survey }) {
  const { i18n } = useTranslation();

  return (
    <select
      value={survey.language}
      onChange={(e) => {
        /* Switch language */
      }}
    >
      {survey.availableLanguages.map((lang) => (
        <option key={lang} value={lang}>
          {getLanguageName(lang)}
        </option>
      ))}
    </select>
  );
}
```

---

## File Summary

| File                                                                  | Change                                                                      | Status |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------ |
| `types/models.ts`                                                     | Added `defaultLanguage`, `language`, `availableLanguages` to Survey         | ✅     |
| `types/models.ts`                                                     | Added **required** `languageCode` to Create/Update Survey/Question requests | ✅     |
| `types/models.ts`                                                     | Added **required** `languageCode` to `CreateSurveyFromTemplateRequest`      | ✅     |
| `types/models.ts`                                                     | Added `defaultLanguage`, `language`, `availableLanguages` to SurveyTemplate | ✅     |
| `types/models.ts`                                                     | Added `defaultLanguage` to TemplateQuestion                                 | ✅     |
| `types/models.ts`                                                     | Added **required** `languageCode` to `CreateTemplateRequest`                | ✅     |
| `types/models.ts`                                                     | Added optional `languageCode` to `CreateTemplateFromSurveyRequest`          | ✅     |
| `types/models.ts`                                                     | Added optional `languageCode` to `UpdateTemplateRequest`                    | ✅     |
| `types/public-survey.ts`                                              | Added `language`, `availableLanguages` to PublicSurvey                      | ✅     |
| `types/api.ts`                                                        | Added translation management types                                          | ✅     |
| `config/api.ts`                                                       | Added `translations` endpoints                                              | ✅     |
| `services/api.ts`                                                     | Added `translationsApi` service                                             | ✅     |
| `services/api.ts`                                                     | Updated `createSurveyFromTemplate` to require `languageCode`                | ✅     |
| `services/api.ts`                                                     | Updated `templatesApi.create` to require `languageCode`                     | ✅     |
| `services/api.ts`                                                     | Updated `templatesApi.createFromSurvey` to accept optional `languageCode`   | ✅     |
| `services/api.ts`                                                     | Updated `templatesApi.update` to accept optional `languageCode`             | ✅     |
| `lib/validations.ts`                                                  | Added `languageCode` to `createTemplateSchema`                              | ✅     |
| `components/features/surveys/CreateSurveyDialog`                      | Added language selector, `languageCode` in form data                        | ✅     |
| `components/features/templates/CreateTemplateDialog`                  | Added language selector, `languageCode` in form data                        | ✅     |
| `components/features/templates/UseTemplateDialog`                     | Added language selector, `languageCode` in form data                        | ✅     |
| `pages/Surveys/SurveysPage.tsx`                                       | Pass `languageCode` when creating survey                                    | ✅     |
| `pages/Templates/TemplatesPage.tsx`                                   | Pass `languageCode` when creating survey from template                      | ✅     |
| `pages/Templates/TemplatesPage.tsx`                                   | Pass `languageCode` when creating template                                  | ✅     |
| `pages/SurveyBuilder/hooks/useSurveyBuilderSave.ts`                   | Pass `languageCode` when saving                                             | ✅     |
| `hooks/queries/useSurveys.ts`                                         | `useDuplicateSurvey` now passes `languageCode` from original survey         | ✅     |
| `hooks/queries/useQuestions.ts`                                       | `calculateQuestionChanges` now requires `languageCode`                      | ✅     |
| `hooks/queries/useTemplates.ts`                                       | `useCreateSurveyFromTemplate` updated to require `languageCode`             | ✅     |
| `hooks/queries/useTemplates.ts`                                       | `useCreateTemplate` updated to require `languageCode`                       | ✅     |
| `hooks/queries/useTemplates.ts`                                       | `useCreateTemplateFromSurvey` updated to accept optional `languageCode`     | ✅     |
| `hooks/queries/useTemplates.ts`                                       | `useUpdateTemplate` updated to accept optional `languageCode`               | ✅     |
| `types/models.ts`                                                     | Added `defaultLanguage`, `language`, `availableLanguages` to SurveyTheme    | ✅     |
| `services/api.ts`                                                     | Added optional `languageCode` to `CreateThemeRequest`                       | ✅     |
| `pages/Themes/ThemesPage.tsx`                                         | Pass `languageCode` when creating/updating themes                           | ✅     |
| `types/models.ts`                                                     | Added `defaultLanguage`, `language`, `availableLanguages` to EmailTemplate  | ✅     |
| `types/models.ts`                                                     | Added `defaultLanguage` to EmailTemplateSummary                             | ✅     |
| `types/models.ts`                                                     | Added optional `languageCode` to `CreateEmailTemplateRequest`               | ✅     |
| `types/models.ts`                                                     | Added optional `languageCode` to `UpdateEmailTemplateRequest`               | ✅     |
| `services/api.ts`                                                     | Updated `emailTemplatesApi.duplicate` to pass `languageCode`                | ✅     |
| `components/features/email-templates/CreateEmailTemplateDialog`       | Added language selector, `languageCode` in form data                        | ✅     |
| `components/features/email-templates/visual-editor/VisualEmailEditor` | Pass `languageCode` when saving                                             | ✅     |
| `components/features/email-templates/EmailTemplateEditor`             | Pass `languageCode` when saving                                             | ✅     |
| `pages/EmailTemplates/mocks.ts`                                       | Updated mock data with `defaultLanguage` field                              | ✅     |

---

## Remaining Work (Future Phases)

### Phase 4: UI Components

- [ ] Add language selector to survey builder
- [ ] Add translation management panel in survey settings
- [ ] Update public survey page to show language switcher

### Phase 5: Other Entities

- [x] ~~Migrate EmailTemplate types (if needed)~~ ✅ Completed

### Phase 6: Enhanced Features

- [ ] Add translation progress indicator
- [ ] Add auto-translation integration (optional)
- [ ] Add translation export/import

---

## Notes

1. **Breaking Changes**: The `languageCode` fields are now **required**. All code must provide a valid language code when creating or updating surveys/questions.

2. **API Headers**: The API client already sends `Accept-Language` header based on `getCurrentLanguage()` from i18n, so localized responses work automatically.

3. **Default Language Selection**: When creating a new survey, the language selector defaults to the user's current UI language.

4. **Survey Builder**: When editing a survey, the `defaultLanguage` from the survey is used for all save operations.

5. **Required Fields**: The `defaultLanguage`, `language`, and `availableLanguages` fields on Survey are now required in TypeScript. The backend always returns these values.
