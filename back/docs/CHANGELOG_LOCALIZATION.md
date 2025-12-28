# Localization Infrastructure Changelog

## [2025-12-28] - Multi-Language Support for Backend Entities

### Overview

Added comprehensive localization support for survey-related entities, enabling multi-language surveys, questions, templates, and email communications.

---

## New Files Created

### Domain Layer - Common (`src/SurveyApp.Domain/Common/`)

| File              | Description                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ILocalizable.cs` | Generic interface for entities supporting translations. Defines `DefaultLanguage` property and `Translations` collection.                        |
| `Translation.cs`  | Abstract base class for all translation entities. Contains `Id`, `LanguageCode`, `IsDefault`, `LastModifiedAt`, and `LastModifiedBy` properties. |

### Domain Layer - Translation Entities (`src/SurveyApp.Domain/Entities/`)

| File                             | Description                                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `SurveyTranslation.cs`           | Stores translated survey content: `Title`, `Description`, `WelcomeMessage`, `ThankYouMessage`              |
| `QuestionTranslation.cs`         | Stores translated question content: `Text`, `Description`, `TranslatedSettingsJson`                        |
| `SurveyTemplateTranslation.cs`   | Stores translated template content: `Name`, `Description`, `Category`, `WelcomeMessage`, `ThankYouMessage` |
| `TemplateQuestionTranslation.cs` | Stores translated template question content: `Text`, `Description`, `TranslatedSettingsJson`               |
| `EmailTemplateTranslation.cs`    | Stores translated email content: `Name`, `Subject`, `HtmlBody`, `PlainTextBody`, `DesignJson`              |
| `SurveyThemeTranslation.cs`      | Stores translated theme metadata: `Name`, `Description`                                                    |

### Domain Layer - Value Objects (`src/SurveyApp.Domain/ValueObjects/`)

| File                            | Description                                                                                                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TranslatedQuestionSettings.cs` | Value object for translated question settings including `Options`, `MinLabel`, `MaxLabel`, `MatrixRows`, `MatrixColumns`, `Placeholder`, `ValidationMessage`, `OtherLabel` |

### Infrastructure Layer - EF Configurations (`src/SurveyApp.Infrastructure/Persistence/Configurations/`)

| File                                          | Description                                                    |
| --------------------------------------------- | -------------------------------------------------------------- |
| `SurveyTranslationConfiguration.cs`           | EF Core configuration for `SurveyTranslations` table           |
| `QuestionTranslationConfiguration.cs`         | EF Core configuration for `QuestionTranslations` table         |
| `SurveyTemplateTranslationConfiguration.cs`   | EF Core configuration for `SurveyTemplateTranslations` table   |
| `TemplateQuestionTranslationConfiguration.cs` | EF Core configuration for `TemplateQuestionTranslations` table |
| `EmailTemplateTranslationConfiguration.cs`    | EF Core configuration for `EmailTemplateTranslations` table    |
| `SurveyThemeTranslationConfiguration.cs`      | EF Core configuration for `SurveyThemeTranslations` table      |

### Migration (`src/SurveyApp.Infrastructure/Migrations/`)

| File                                       | Description                                                           |
| ------------------------------------------ | --------------------------------------------------------------------- |
| `20251228170132_AddLocalizationSupport.cs` | Migration adding all translation tables and `DefaultLanguage` columns |

---

## Modified Files

### Domain Layer - Entities

#### `Survey.cs`

- Implemented `ILocalizable<SurveyTranslation>` interface
- Added `_translations` backing field
- Added `DefaultLanguage` property (default: `"en"`)
- Added `Translations` read-only collection
- Added localization methods:
  - `SetDefaultLanguage(string languageCode)`
  - `AddOrUpdateTranslation(...)` - Creates or updates a translation
  - `RemoveTranslation(string languageCode)` - Removes a translation
  - `GetTranslation(string? languageCode)` - Gets translation with fallback
  - `SetDefaultTranslation(string languageCode)` - Sets default translation
  - `GetAvailableLanguages()` - Returns list of available language codes

#### `Question.cs`

- Implemented `ILocalizable<QuestionTranslation>` interface
- Added `_translations` backing field
- Added `DefaultLanguage` property (default: `"en"`)
- Added `Translations` read-only collection
- Added localization methods:
  - `SetDefaultLanguage(string languageCode)`
  - `AddOrUpdateTranslation(...)`
  - `RemoveTranslation(string languageCode)`
  - `GetTranslation(string? languageCode)`
  - `GetLocalizedText(string? languageCode)` - Gets translated text with fallback
  - `GetLocalizedSettings(string? languageCode)` - Gets merged settings with translations

#### `QuestionSettings.cs` (Value Object)

- Added `WithTranslations(TranslatedQuestionSettings translations)` method
  - Merges translated text values (options, labels, etc.) with base settings
  - Preserves non-translatable values (numbers, styles, etc.)

### Infrastructure Layer

#### `ApplicationDbContext.cs`

- Added 6 new `DbSet` properties for translation entities:
  - `SurveyTranslations`
  - `QuestionTranslations`
  - `SurveyTemplateTranslations`
  - `TemplateQuestionTranslations`
  - `EmailTemplateTranslations`
  - `SurveyThemeTranslations`

#### `SurveyConfiguration.cs`

- Added `DefaultLanguage` property configuration (max length: 10, default: `"en"`)
- Added `Translations` navigation property with cascade delete
- Configured backing field access mode for translations collection

#### `QuestionConfiguration.cs`

- Added `DefaultLanguage` property configuration (max length: 10, default: `"en"`)
- Added `Translations` navigation property with cascade delete
- Configured backing field access mode for translations collection

---

## Database Schema Changes

### New Tables

```sql
-- Survey translations
CREATE TABLE "SurveyTranslations" (
    "Id" uuid PRIMARY KEY,
    "SurveyId" uuid NOT NULL REFERENCES "Surveys"("Id") ON DELETE CASCADE,
    "LanguageCode" varchar(10) NOT NULL,
    "IsDefault" boolean NOT NULL DEFAULT false,
    "Title" varchar(500) NOT NULL,
    "Description" varchar(2000),
    "WelcomeMessage" varchar(2000),
    "ThankYouMessage" varchar(2000),
    "LastModifiedAt" timestamptz,
    "LastModifiedBy" uuid,
    UNIQUE("SurveyId", "LanguageCode")
);

-- Question translations
CREATE TABLE "QuestionTranslations" (
    "Id" uuid PRIMARY KEY,
    "QuestionId" uuid NOT NULL REFERENCES "Questions"("Id") ON DELETE CASCADE,
    "LanguageCode" varchar(10) NOT NULL,
    "IsDefault" boolean NOT NULL DEFAULT false,
    "Text" varchar(2000) NOT NULL,
    "Description" varchar(2000),
    "TranslatedSettingsJson" jsonb,
    "LastModifiedAt" timestamptz,
    "LastModifiedBy" uuid,
    UNIQUE("QuestionId", "LanguageCode")
);

-- Similar structure for:
-- SurveyTemplateTranslations
-- TemplateQuestionTranslations
-- EmailTemplateTranslations
-- SurveyThemeTranslations
```

### Modified Tables

```sql
-- Surveys table
ALTER TABLE "Surveys" ADD COLUMN "DefaultLanguage" varchar(10) NOT NULL DEFAULT 'en';

-- Questions table
ALTER TABLE "Questions" ADD COLUMN "DefaultLanguage" varchar(10) NOT NULL DEFAULT 'en';
```

---

## Usage Examples

### Adding Translations to a Survey

```csharp
// Create a survey (default language is English)
var survey = Survey.Create(namespaceId, "Customer Satisfaction Survey", userId);

// Add Spanish translation
survey.AddOrUpdateTranslation(
    languageCode: "es",
    title: "Encuesta de Satisfacción del Cliente",
    description: "Ayúdenos a mejorar nuestros servicios",
    welcomeMessage: "¡Bienvenido a nuestra encuesta!",
    thankYouMessage: "¡Gracias por su tiempo!"
);

// Add French translation
survey.AddOrUpdateTranslation(
    languageCode: "fr",
    title: "Enquête de Satisfaction Client",
    description: "Aidez-nous à améliorer nos services"
);

// Get available languages
var languages = survey.GetAvailableLanguages(); // ["es", "fr"]

// Get specific translation (falls back to default if not found)
var spanishVersion = survey.GetTranslation("es");
var germanVersion = survey.GetTranslation("de"); // Returns default translation
```

### Adding Translations to Questions with Options

```csharp
// Add translation for a multiple choice question
question.AddOrUpdateTranslation(
    languageCode: "es",
    text: "¿Cómo calificaría nuestro servicio?",
    description: "Seleccione una opción",
    translatedSettings: TranslatedQuestionSettings.ForChoiceQuestion(
        options: ["Excelente", "Bueno", "Regular", "Malo"],
        otherLabel: "Otro (especifique)"
    )
);

// Add translation for a scale question
question.AddOrUpdateTranslation(
    languageCode: "es",
    text: "¿Qué tan probable es que nos recomiende?",
    translatedSettings: TranslatedQuestionSettings.ForScaleQuestion(
        minLabel: "Nada probable",
        maxLabel: "Muy probable"
    )
);

// Get localized question text
string localizedText = question.GetLocalizedText("es");

// Get merged settings (base settings + translated labels/options)
QuestionSettings localizedSettings = question.GetLocalizedSettings("es");
```

### Adding Translations for Matrix Questions

```csharp
question.AddOrUpdateTranslation(
    languageCode: "es",
    text: "Califique los siguientes aspectos",
    translatedSettings: TranslatedQuestionSettings.ForMatrixQuestion(
        rows: ["Calidad del producto", "Atención al cliente", "Tiempo de entrega"],
        columns: ["Muy malo", "Malo", "Neutral", "Bueno", "Excelente"]
    )
);
```

---

## API Considerations (Future Work)

When implementing API endpoints, consider:

1. **Language Resolution**: Accept `lang` query parameter or `Accept-Language` header
2. **Response DTOs**: Include resolved language and available languages
3. **Fallback Strategy**: Return default language if requested translation unavailable

Example API response structure:

```json
{
  "id": "...",
  "title": "Encuesta de Satisfacción",
  "language": "es",
  "availableLanguages": ["en", "es", "fr"],
  "questions": [...]
}
```

---

## Notes

- All translation tables cascade delete when parent entity is deleted
- Each entity can have only one translation per language (unique constraint)
- `IsDefault` flag identifies the fallback translation
- `DefaultLanguage` on parent entity matches the default translation's language code
- Translations are lightweight (no full audit fields, only `LastModifiedAt/By`)
