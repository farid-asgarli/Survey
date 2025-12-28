# Localization Migration - Translation-Only Architecture

## Overview

This document tracks the migration from a **dual-storage model** (main fields + translations) to a **translation-only model** where all localizable content is stored exclusively in translation tables.

**Date Started:** December 28, 2025  
**Status:** ✅ All localizable entities completed (Survey, Question, SurveyTheme, EmailTemplate, SurveyTemplate, TemplateQuestion)

---

## Architecture Change

### Before (Dual Storage)

```
Survey
├── Title (column)           ← stored directly
├── Description (column)     ← stored directly
├── WelcomeMessage (column)  ← stored directly
├── ThankYouMessage (column) ← stored directly
├── DefaultLanguage
└── Translations[]
    ├── { lang: "es", title: "...", ... }
    └── { lang: "fr", title: "...", ... }
```

### After (Translation-Only) ✅

```
Survey
├── DefaultLanguage = "en"
├── Title (computed property → from default translation)
├── Description (computed property → from default translation)
├── WelcomeMessage (computed property → from default translation)
├── ThankYouMessage (computed property → from default translation)
└── Translations[]
    ├── { lang: "en", title: "...", isDefault: true }  ← Single source of truth
    ├── { lang: "es", title: "...", isDefault: false }
    └── { lang: "fr", title: "...", isDefault: false }
```

---

## Completed Changes

### 0. Domain Layer - Common Components

#### `TranslationManager<T>` ✅ (NEW)

Created a generic helper class to eliminate repetitive localization code across entities.

**File:** `src/SurveyApp.Domain/Common/TranslationManager.cs`

**Purpose:** Encapsulates common translation operations using composition pattern.

**Methods:**
| Method | Description |
|--------|-------------|
| `Get(languageCode)` | Get translation with fallback to default |
| `GetDefault()` | Get the default translation |
| `Find(languageCode)` | Find by exact language code (no fallback) |
| `Add(translation)` | Add a translation (first becomes default) |
| `Remove(languageCode)` | Remove with validation and default promotion |
| `SetDefault(languageCode)` | Change the default translation |
| `GetAvailableLanguages()` | List all language codes |
| `HasTranslation(languageCode)` | Check if translation exists |
| `Count` | Number of translations |

**Usage in entities:**

```csharp
private TranslationManager<SurveyTranslation>? _translationManager;

private TranslationManager<SurveyTranslation> TranslationHelper =>
    _translationManager ??= new TranslationManager<SurveyTranslation>(
        _translations,
        lang => DefaultLanguage = lang
    );

// Delegate common operations
public void RemoveTranslation(string languageCode) =>
    TranslationHelper.Remove(languageCode);

public SurveyTranslation? GetTranslation(string? languageCode) =>
    TranslationHelper.Get(languageCode);
```

**Benefits:**

- Eliminates ~50 lines of duplicated code per entity
- Single source of truth for translation logic
- Uses composition (no inheritance conflicts)
- Fully type-safe with generics
- Lazy initialization for minimal overhead

---

### 1. Domain Layer - Entities

#### `Survey.cs` ✅

- **Removed** backing fields: `Title`, `Description`, `WelcomeMessage`, `ThankYouMessage`
- **Added** computed properties that resolve from default translation:
  ```csharp
  public string Title => GetDefaultTranslation()?.Title ?? string.Empty;
  public string? Description => GetDefaultTranslation()?.Description;
  public string? WelcomeMessage => GetDefaultTranslation()?.WelcomeMessage;
  public string? ThankYouMessage => GetDefaultTranslation()?.ThankYouMessage;
  ```
- **Refactored** to use `TranslationManager<SurveyTranslation>` for common operations
- **Updated** factory methods to create default translation automatically:
  ```csharp
  public static Survey Create(
      Guid namespaceId,
      string title,
      Guid createdBy,
      string languageCode = "en",
      string? description = null,
      string? welcomeMessage = null,
      string? thankYouMessage = null)
  ```
- **Updated** mutation methods to work with translations:
  - `UpdateTitle(string title, string? languageCode = null)`
  - `UpdateDescription(string? description, string? languageCode = null)`
  - `UpdateWelcomeMessage(string? message, string? languageCode = null)`
  - `UpdateThankYouMessage(string? message, string? languageCode = null)`
  - `UpdateDetails(string title, string? description, string? languageCode = null)`
- **Delegated** common operations to `TranslationHelper`:
  - `RemoveTranslation()` → `TranslationHelper.Remove()`
  - `GetTranslation()` → `TranslationHelper.Get()`
  - `GetDefaultTranslation()` → `TranslationHelper.GetDefault()`
  - `SetDefaultTranslation()` → `TranslationHelper.SetDefault()`
  - `GetAvailableLanguages()` → `TranslationHelper.GetAvailableLanguages()`
- **Updated** `AddQuestion()` to accept optional `languageCode` parameter

#### `Question.cs` ✅

- **Removed** backing fields: `Text`, `Description`
- **Added** computed properties:
  ```csharp
  public string Text => GetDefaultTranslation()?.Text ?? string.Empty;
  public string? Description => GetDefaultTranslation()?.Description;
  ```
- **Refactored** to use `TranslationManager<QuestionTranslation>` for common operations
- **Updated** factory method:
  ```csharp
  public static Question Create(
      Guid surveyId,
      string text,
      QuestionType type,
      int order,
      bool isRequired = false,
      string languageCode = "en",
      string? description = null)
  ```
- **Updated** mutation methods:
  - `UpdateText(string text, string? languageCode = null)`
  - `UpdateDescription(string? description, string? languageCode = null)`
- **Delegated** common operations to `TranslationHelper`:
  - `RemoveTranslation()`, `GetTranslation()`, `GetDefaultTranslation()`

---

### 2. Application Layer - DTOs

#### `SurveyDto.cs` ✅

Added localization metadata:

```csharp
public string DefaultLanguage { get; set; } = "en";
public string Language { get; set; } = "en";
public IReadOnlyList<string> AvailableLanguages { get; set; } = [];
```

#### `SurveyListItemDto` ✅

Added:

```csharp
public string DefaultLanguage { get; set; } = "en";
```

#### `PublicSurveyDto` ✅

Added:

```csharp
public string Language { get; set; } = "en";
public IReadOnlyList<string> AvailableLanguages { get; set; } = [];
```

---

### 3. Application Layer - Commands

#### `CreateSurveyCommand.cs` ✅

Added:

```csharp
public string LanguageCode { get; init; } = "en";
```

#### `CreateSurveyCommandHandler.cs` ✅

- Updated to pass language code to `Survey.Create()`
- Removed separate calls to `UpdateDescription()`, `SetWelcomeMessage()`, `SetThankYouMessage()` (now handled in factory)

#### `UpdateSurveyCommand.cs` ✅

Added:

```csharp
public string? LanguageCode { get; init; }
```

#### `UpdateSurveyCommandHandler.cs` ✅

- Updated to use `AddOrUpdateTranslation()` instead of individual setters

#### `CreateQuestionCommand.cs` ✅

Added:

```csharp
public string? LanguageCode { get; init; }
```

#### `CreateQuestionCommandHandler.cs` ✅

- Updated to pass language code to `Survey.AddQuestion()`
- Updated description update to use language code

#### `UpdateQuestionCommand.cs` ✅

Added:

```csharp
public string? LanguageCode { get; init; }
```

#### `UpdateQuestionCommandHandler.cs` ✅

- Updated to use `AddOrUpdateTranslation()` instead of direct property setters

---

### 4. Application Layer - Queries

#### `GetPublicSurveyQuery.cs` ✅

Added:

```csharp
public string? LanguageCode { get; init; }
```

#### `GetPublicSurveyQueryHandler.cs` ✅

- Updated to resolve localized content based on requested language
- Uses `GetLocalizedTitle()`, `GetLocalizedDescription()`, etc.
- Returns `Language` and `AvailableLanguages` in response

#### `GetSurveysQueryHandler.cs` ✅

- Added `Type`, `CxMetricType`, and `DefaultLanguage` to the DTO mapping

---

### 5. Application Layer - Validators

#### `CreateSurveyCommandValidator.cs` ✅

Added language code validation:

```csharp
private static readonly string[] SupportedLanguages = ["en", "es", "fr", "de", ...];

RuleFor(x => x.LanguageCode)
    .NotEmpty()
    .Length(2, 10)
    .Must(code => SupportedLanguages.Contains(code.ToLowerInvariant()));
```

---

### 6. Application Layer - Mappings

#### `MappingProfile.cs` ✅

Updated Survey mappings to include:

```csharp
.ForMember(d => d.Language, opt => opt.MapFrom(s => s.DefaultLanguage))
.ForMember(d => d.AvailableLanguages, opt => opt.MapFrom(s => s.GetAvailableLanguages()))
```

---

### 7. Infrastructure Layer - EF Configurations

#### `SurveyConfiguration.cs` ✅

Added property ignores for computed properties:

```csharp
builder.Ignore(s => s.Title);
builder.Ignore(s => s.Description);
builder.Ignore(s => s.WelcomeMessage);
builder.Ignore(s => s.ThankYouMessage);
```

#### `QuestionConfiguration.cs` ✅

Added property ignores:

```csharp
builder.Ignore(q => q.Text);
builder.Ignore(q => q.Description);
```

#### `SurveyThemeConfiguration.cs` ✅

Added property ignores and DefaultLanguage property:

```csharp
builder.Ignore(x => x.Name);
builder.Ignore(x => x.Description);
builder.Property(x => x.DefaultLanguage).IsRequired().HasMaxLength(10).HasDefaultValue("en");
```

#### `SurveyThemeTranslationConfiguration.cs` ✅

Updated relationship to use backing field:

```csharp
builder
    .HasOne(t => t.Theme)
    .WithMany("_translations")
    .HasForeignKey(t => t.ThemeId)
    .OnDelete(DeleteBehavior.Cascade);
```

---

### 8. Database Migration

#### `20251228172032_RemoveLocalizableColumnsFromEntities.cs` ✅

```csharp
// Drops columns from Surveys table:
- Title
- Description
- WelcomeMessage
- ThankYouMessage

// Drops columns from Questions table:
- Text
- Description
```

**Note:** The database needs to be re-initialized since existing data would be lost.

---

### 9. SurveyTheme Entity Migration ✅

#### `SurveyTheme.cs` ✅

- **Implemented** `ILocalizable<SurveyThemeTranslation>` interface
- **Added** `DefaultLanguage` property with default value "en"
- **Added** `_translations` backing field
- **Removed** backing fields: `Name`, `Description`
- **Added** computed properties:
  ```csharp
  public string Name => GetDefaultTranslation()?.Name ?? string.Empty;
  public string? Description => GetDefaultTranslation()?.Description;
  ```
- **Refactored** to use `TranslationManager<SurveyThemeTranslation>` for common operations
- **Updated** factory method:
  ```csharp
  public static SurveyTheme Create(
      Guid namespaceId,
      string name,
      string languageCode = "en",
      string? description = null)
  ```
- **Updated** mutation methods:
  - `UpdateName(string name, string? languageCode = null)`
  - `UpdateDescription(string? description, string? languageCode = null)`
  - `Duplicate(string newName, string? languageCode = null)`
- **Added** localization methods:
  - `SetDefaultLanguage(string languageCode)`
  - `AddOrUpdateTranslation(string languageCode, string name, string? description = null)`
  - `RemoveTranslation(string languageCode)` → `TranslationHelper.Remove()`
  - `GetTranslation(string? languageCode)` → `TranslationHelper.Get()`
  - `GetDefaultTranslation()` → `TranslationHelper.GetDefault()`
  - `GetLocalizedName(string? languageCode = null)`
  - `GetLocalizedDescription(string? languageCode = null)`
  - `SetDefaultTranslation(string languageCode)`
  - `GetAvailableLanguages()`

---

### 10. EmailTemplate Entity Migration ✅

#### `EmailTemplate.cs` ✅

- **Implemented** `ILocalizable<EmailTemplateTranslation>` interface
- **Added** `DefaultLanguage` property with default value "en"
- **Added** `_translations` backing field
- **Removed** backing fields: `Name`, `Subject`, `HtmlBody`, `PlainTextBody`, `DesignJson`
- **Added** computed properties:
  ```csharp
  public string Name => GetDefaultTranslation()?.Name ?? string.Empty;
  public string Subject => GetDefaultTranslation()?.Subject ?? string.Empty;
  public string HtmlBody => GetDefaultTranslation()?.HtmlBody ?? string.Empty;
  public string? PlainTextBody => GetDefaultTranslation()?.PlainTextBody;
  public string? DesignJson => GetDefaultTranslation()?.DesignJson;
  ```
- **Refactored** to use `TranslationManager<EmailTemplateTranslation>` for common operations
- **Updated** factory method:
  ```csharp
  public static EmailTemplate Create(
      Guid namespaceId,
      string name,
      EmailTemplateType type,
      string subject,
      string htmlBody,
      string languageCode = "en",
      string? plainTextBody = null,
      string? designJson = null)
  ```
- **Updated** mutation methods:
  - `UpdateName(string name, string? languageCode = null)`
  - `UpdateSubject(string subject, string? languageCode = null)`
  - `UpdateHtmlBody(string htmlBody, string? languageCode = null)`
  - `UpdatePlainTextBody(string? plainTextBody, string? languageCode = null)`
  - `UpdateDesignJson(string? designJson, string? languageCode = null)`
  - `Render(Dictionary<string, string> values, string? languageCode = null)` - now supports language
- **Added** localization methods:
  - `SetDefaultLanguage(string languageCode)`
  - `AddOrUpdateTranslation(languageCode, name, subject, htmlBody, plainTextBody, designJson)`
  - `RemoveTranslation(string languageCode)` → `TranslationHelper.Remove()`
  - `GetTranslation(string? languageCode)` → `TranslationHelper.Get()`
  - `GetDefaultTranslation()` → `TranslationHelper.GetDefault()`
  - `GetLocalizedName(string? languageCode = null)`
  - `GetLocalizedSubject(string? languageCode = null)`
  - `GetLocalizedHtmlBody(string? languageCode = null)`
  - `GetLocalizedPlainTextBody(string? languageCode = null)`
  - `SetDefaultTranslation(string languageCode)`
  - `GetAvailableLanguages()`

#### `EmailTemplateConfiguration.cs` ✅

Added property ignores and DefaultLanguage:

```csharp
builder.Ignore(x => x.Name);
builder.Ignore(x => x.Subject);
builder.Ignore(x => x.HtmlBody);
builder.Ignore(x => x.PlainTextBody);
builder.Ignore(x => x.DesignJson);
builder.Property(x => x.DefaultLanguage).IsRequired().HasMaxLength(10).HasDefaultValue("en");
```

#### `EmailTemplateTranslationConfiguration.cs` ✅

Updated relationship to use backing field:

```csharp
builder
    .HasOne(t => t.EmailTemplate)
    .WithMany("_translations")
    .HasForeignKey(t => t.EmailTemplateId)
    .OnDelete(DeleteBehavior.Cascade);
```

---

### 11. SurveyTemplate Entity Migration ✅

#### `SurveyTemplate.cs` ✅

- **Implemented** `ILocalizable<SurveyTemplateTranslation>` interface
- **Added** `DefaultLanguage` property with default value "en"
- **Added** `_translations` backing field
- **Removed** backing fields: `Name`, `Description`, `Category`, `WelcomeMessage`, `ThankYouMessage`
- **Added** computed properties:
  ```csharp
  public string Name => GetDefaultTranslation()?.Name ?? string.Empty;
  public string? Description => GetDefaultTranslation()?.Description;
  public string? Category => GetDefaultTranslation()?.Category;
  public string? WelcomeMessage => GetDefaultTranslation()?.WelcomeMessage;
  public string? ThankYouMessage => GetDefaultTranslation()?.ThankYouMessage;
  ```
- **Refactored** to use `TranslationManager<SurveyTemplateTranslation>` for common operations
- **Updated** factory method:
  ```csharp
  public static SurveyTemplate Create(
      Guid namespaceId,
      string name,
      Guid createdBy,
      string languageCode = "en",
      string? description = null,
      string? category = null,
      string? welcomeMessage = null,
      string? thankYouMessage = null)
  ```
- **Updated** `CreateFromSurvey()` to accept optional language code and copy localized content
- **Updated** mutation methods:
  - `UpdateName(string name, string? languageCode = null)`
  - `UpdateDescription(string? description, string? languageCode = null)`
  - `UpdateCategory(string? category, string? languageCode = null)`
  - `SetWelcomeMessage(string? message, string? languageCode = null)`
  - `SetThankYouMessage(string? message, string? languageCode = null)`
- **Added** localization methods:
  - `AddOrUpdateTranslation(languageCode, name, description, category, welcomeMessage, thankYouMessage)`
  - `RemoveTranslation(string languageCode)` → `TranslationHelper.Remove()`
  - `GetTranslation(string? languageCode)` → `TranslationHelper.Get()`
  - `GetDefaultTranslation()` → `TranslationHelper.GetDefault()`
  - `GetLocalizedName(string? languageCode = null)`
  - `GetLocalizedDescription(string? languageCode = null)`
  - `GetLocalizedCategory(string? languageCode = null)`
  - `GetLocalizedWelcomeMessage(string? languageCode = null)`
  - `GetLocalizedThankYouMessage(string? languageCode = null)`
  - `SetDefaultTranslation(string languageCode)`
  - `GetAvailableLanguages()`
- **Updated** `AddQuestion()` to accept optional `languageCode` parameter
- **Updated** `CreateSurvey()` to accept optional `languageCode` parameter and copy localized content

#### `SurveyTemplateConfiguration.cs` ✅

Added property ignores and DefaultLanguage:

```csharp
builder.Ignore(t => t.Name);
builder.Ignore(t => t.Description);
builder.Ignore(t => t.Category);
builder.Ignore(t => t.WelcomeMessage);
builder.Ignore(t => t.ThankYouMessage);
builder.Property(t => t.DefaultLanguage).IsRequired().HasMaxLength(10).HasDefaultValue("en");
```

#### `SurveyTemplateTranslationConfiguration.cs` ✅

Updated relationship to use backing field:

```csharp
builder
    .HasOne(t => t.Template)
    .WithMany("_translations")
    .HasForeignKey(t => t.TemplateId)
    .OnDelete(DeleteBehavior.Cascade);
```

---

### 12. TemplateQuestion Entity Migration ✅

#### `TemplateQuestion.cs` ✅

- **Implemented** `ILocalizable<TemplateQuestionTranslation>` interface
- **Added** `DefaultLanguage` property with default value "en"
- **Added** `_translations` backing field
- **Removed** backing fields: `Text`, `Description`
- **Added** computed properties:
  ```csharp
  public string Text => GetDefaultTranslation()?.Text ?? string.Empty;
  public string? Description => GetDefaultTranslation()?.Description;
  ```
- **Refactored** to use `TranslationManager<TemplateQuestionTranslation>` for common operations
- **Updated** factory method:
  ```csharp
  public static TemplateQuestion Create(
      Guid templateId,
      string text,
      QuestionType type,
      int order,
      bool isRequired = false,
      string languageCode = "en",
      string? description = null,
      string? settingsJson = null)
  ```
- **Updated** mutation methods:
  - `UpdateText(string text, string? languageCode = null)`
  - `UpdateDescription(string? description, string? languageCode = null)`
- **Added** localization methods:
  - `AddOrUpdateTranslation(languageCode, text, description, translatedSettings)`
  - `RemoveTranslation(string languageCode)` → `TranslationHelper.Remove()`
  - `GetTranslation(string? languageCode)` → `TranslationHelper.Get()`
  - `GetDefaultTranslation()` → `TranslationHelper.GetDefault()`
  - `GetLocalizedText(string? languageCode = null)`
  - `GetLocalizedDescription(string? languageCode = null)`
  - `GetLocalizedSettings(string? languageCode = null)`
  - `SetDefaultTranslation(string languageCode)`
  - `GetAvailableLanguages()`

#### `TemplateQuestionConfiguration.cs` ✅

Added property ignores and DefaultLanguage:

```csharp
builder.Ignore(q => q.Text);
builder.Ignore(q => q.Description);
builder.Property(q => q.DefaultLanguage).IsRequired().HasMaxLength(10).HasDefaultValue("en");
```

#### `TemplateQuestionTranslationConfiguration.cs` ✅

Updated relationship to use backing field:

```csharp
builder
    .HasOne(t => t.TemplateQuestion)
    .WithMany("_translations")
    .HasForeignKey(t => t.TemplateQuestionId)
    .OnDelete(DeleteBehavior.Cascade);
```

---

## Remaining Work (Not Yet Done)

### Entities to Migrate (Same Pattern)

- [x] ~~`SurveyTemplate`~~ ✅ Completed - Has `Name`, `Description`, `Category`, `WelcomeMessage`, `ThankYouMessage`
- [x] ~~`TemplateQuestion`~~ ✅ Completed - Has `Text`, `Description`
- [x] ~~`EmailTemplate`~~ ✅ Completed - Has `Name`, `Subject`, `HtmlBody`, `PlainTextBody`, `DesignJson`
- [x] ~~`SurveyTheme`~~ ✅ Completed - Has `Name`, `Description`

### Additional Tasks

- [x] ~~Update remaining handlers that reference these entities~~ ✅ All handlers updated (Template, Theme, EmailTemplate)
- [x] ~~Update remaining DTOs for templates, themes, email templates~~ ✅ All DTOs updated
- [x] ~~Add API endpoint support for `Accept-Language` header~~ ✅ LanguageContextMiddleware added
- [x] ~~Add bulk translation management endpoints~~ ✅ TranslationsController added
- [x] ~~Consider adding a `TranslationService` for common operations~~ → Created `TranslationManager<T>`

---

## API Language Support

### Language Context Middleware

The `LanguageContextMiddleware` automatically extracts language preference from requests and makes it available via `ILanguageContext`.

**Priority order:**

1. Query parameter: `?lang=es`
2. `X-Language` header
3. `Accept-Language` header (with quality parsing)

**Supported languages:** en, es, fr, de, it, pt, nl, pl, ru, zh, ja, ko, ar, hi, tr

**Usage in handlers:**

```csharp
public class MyQueryHandler(ILanguageContext languageContext)
{
    public async Task<Result<MyDto>> Handle(MyQuery request, CancellationToken ct)
    {
        var lang = languageContext.GetLanguageOrDefault("en");
        var localizedTitle = survey.GetLocalizedTitle(lang);
        // ...
    }
}
```

### Bulk Translation Management API

**Get all translations:**

```
GET /api/surveys/{surveyId}/translations
```

Response:

```json
{
  "surveyId": "...",
  "defaultLanguage": "en",
  "translations": [
    { "languageCode": "en", "title": "...", "isDefault": true },
    { "languageCode": "es", "title": "...", "isDefault": false }
  ],
  "questions": [
    {
      "questionId": "...",
      "order": 1,
      "translations": [...]
    }
  ]
}
```

**Bulk update translations:**

```
PUT /api/surveys/{surveyId}/translations
Content-Type: application/json

{
  "translations": [
    { "languageCode": "en", "title": "Survey", "isDefault": true },
    { "languageCode": "es", "title": "Encuesta", "isDefault": false },
    { "languageCode": "fr", "title": "Enquête", "isDefault": false }
  ]
}
```

**Update single translation:**

```
PUT /api/surveys/{surveyId}/translations/{languageCode}
Content-Type: application/json

{
  "title": "Encuesta de Satisfacción",
  "description": "Ayúdenos a mejorar"
}
```

---

## Usage Examples

### Creating a Survey (English default)

```csharp
var survey = Survey.Create(
    namespaceId: namespaceId,
    title: "Customer Satisfaction Survey",
    createdBy: userId,
    languageCode: "en",
    description: "Help us improve",
    welcomeMessage: "Welcome!",
    thankYouMessage: "Thank you!"
);
```

### Adding a Translation

```csharp
survey.AddOrUpdateTranslation(
    languageCode: "es",
    title: "Encuesta de Satisfacción",
    description: "Ayúdenos a mejorar",
    welcomeMessage: "¡Bienvenido!",
    thankYouMessage: "¡Gracias!"
);
```

### Getting Localized Content

```csharp
// Get Spanish title (falls back to default if not found)
var spanishTitle = survey.GetLocalizedTitle("es");

// Get all available languages
var languages = survey.GetAvailableLanguages(); // ["en", "es"]
```

### Public Survey API Request

```
GET /api/surveys/public/{token}?lang=es
```

Response includes:

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

## File Summary

| Layer          | File                                           | Status                                |
| -------------- | ---------------------------------------------- | ------------------------------------- |
| Domain         | `TranslationManager.cs`                        | ✅ Complete (NEW)                     |
| Domain         | `Survey.cs`                                    | ✅ Complete (uses TranslationManager) |
| Domain         | `Question.cs`                                  | ✅ Complete (uses TranslationManager) |
| Domain         | `SurveyTheme.cs`                               | ✅ Complete (uses TranslationManager) |
| Domain         | `EmailTemplate.cs`                             | ✅ Complete (uses TranslationManager) |
| Domain         | `SurveyTemplate.cs`                            | ✅ Complete (uses TranslationManager) |
| Domain         | `TemplateQuestion.cs`                          | ✅ Complete (uses TranslationManager) |
| Application    | `SurveyDto.cs`                                 | ✅ Complete                           |
| Application    | `QuestionDto.cs`                               | ✅ Complete (no changes needed)       |
| Application    | `SurveyThemeDto.cs`                            | ✅ Complete                           |
| Application    | `EmailTemplateDto.cs`                          | ✅ Complete                           |
| Application    | `SurveyTemplateDto.cs`                         | ✅ Complete                           |
| Application    | `CreateSurveyCommand(Handler)`                 | ✅ Complete                           |
| Application    | `UpdateSurveyCommand(Handler)`                 | ✅ Complete                           |
| Application    | `CreateQuestionCommand(Handler)`               | ✅ Complete                           |
| Application    | `UpdateQuestionCommand(Handler)`               | ✅ Complete                           |
| Application    | `GetPublicSurveyQuery(Handler)`                | ✅ Complete                           |
| Application    | `GetSurveysQueryHandler`                       | ✅ Complete                           |
| Application    | `MappingProfile.cs`                            | ✅ Complete                           |
| Application    | `CreateSurveyCommandValidator`                 | ✅ Complete                           |
| Application    | `CreateTemplateCommand(Handler)`               | ✅ Complete                           |
| Application    | `UpdateTemplateCommand(Handler)`               | ✅ Complete                           |
| Application    | `CreateSurveyFromTemplateCommand(Handler)`     | ✅ Complete                           |
| Application    | `CreateTemplateFromSurveyCommand(Handler)`     | ✅ Complete                           |
| Application    | `CreateThemeCommand(Handler)`                  | ✅ Complete                           |
| Application    | `UpdateThemeCommand(Handler)`                  | ✅ Complete                           |
| Application    | `DuplicateThemeCommand(Handler)`               | ✅ Complete                           |
| Application    | `CreateEmailTemplateCommand(Handler)`          | ✅ Complete                           |
| Application    | `UpdateEmailTemplateCommand(Handler)`          | ✅ Complete                           |
| Application    | `ILanguageContext.cs`                          | ✅ Complete (NEW)                     |
| Application    | `GetSurveyTranslationsQuery(Handler)`          | ✅ Complete (NEW)                     |
| Application    | `BulkUpdateSurveyTranslationsCommand(Handler)` | ✅ Complete (NEW)                     |
| Infrastructure | `SurveyConfiguration.cs`                       | ✅ Complete                           |
| Infrastructure | `QuestionConfiguration.cs`                     | ✅ Complete                           |
| Infrastructure | `SurveyThemeConfiguration.cs`                  | ✅ Complete                           |
| Infrastructure | `SurveyThemeTranslationConfiguration.cs`       | ✅ Complete                           |
| Infrastructure | `EmailTemplateConfiguration.cs`                | ✅ Complete                           |
| Infrastructure | `EmailTemplateTranslationConfiguration.cs`     | ✅ Complete                           |
| Infrastructure | `SurveyTemplateConfiguration.cs`               | ✅ Complete                           |
| Infrastructure | `SurveyTemplateTranslationConfiguration.cs`    | ✅ Complete                           |
| Infrastructure | `TemplateQuestionConfiguration.cs`             | ✅ Complete                           |
| Infrastructure | `TemplateQuestionTranslationConfiguration.cs`  | ✅ Complete                           |
| Infrastructure | Migration                                      | ✅ Created                            |
| Infrastructure | `SurveyRepository.cs`                          | ✅ Complete (includes translations)   |
| Infrastructure | `SurveyTemplateRepository.cs`                  | ✅ Complete (includes translations)   |
| Infrastructure | `SurveyThemeRepository.cs`                     | ✅ Complete (includes translations)   |
| Infrastructure | `EmailTemplateRepository.cs`                   | ✅ Complete (includes translations)   |
| Infrastructure | `RecurringSurveyRepository.cs`                 | ✅ Complete (includes translations)   |
| Infrastructure | `QuestionLogicRepository.cs`                   | ✅ Complete (includes translations)   |
| Infrastructure | `SurveyResponseRepository.cs`                  | ✅ Complete (includes translations)   |
| Infrastructure | `SurveyLinkRepository.cs`                      | ✅ Complete (includes translations)   |
| API            | `LanguageContext.cs`                           | ✅ Complete (NEW)                     |
| API            | `LanguageContextMiddleware.cs`                 | ✅ Complete (NEW)                     |
| API            | `TranslationsController.cs`                    | ✅ Complete (NEW)                     |

---

## Repository Query Updates

Since computed properties (`Title`, `Name`, `Description`, `Subject`, `Category`, `Text`) are now resolved from translations at runtime and ignored by EF Core, repository methods have been updated in two ways:

### 1. Search/Filter Queries - Query Through Translation Tables

Methods that search or filter by localizable fields now query through translation tables directly:

| Repository                  | Method               | Change                                                          |
| --------------------------- | -------------------- | --------------------------------------------------------------- |
| `SurveyRepository`          | `GetPagedAsync`      | Search by `Title`/`Description` via `SurveyTranslations`        |
| `SurveyTemplateRepository`  | `GetPagedAsync`      | Search by `Name`/`Description` via `SurveyTemplateTranslations` |
| `SurveyTemplateRepository`  | `ExistsByNameAsync`  | Check `Name` via `SurveyTemplateTranslations`                   |
| `SurveyTemplateRepository`  | `GetByCategoryAsync` | Filter by `Category` via `SurveyTemplateTranslations`           |
| `SurveyTemplateRepository`  | `GetCategoriesAsync` | Get distinct categories via `SurveyTemplateTranslations`        |
| `SurveyThemeRepository`     | `GetPagedAsync`      | Search by `Name`/`Description` via `SurveyThemeTranslations`    |
| `SurveyThemeRepository`     | `ExistsByNameAsync`  | Check `Name` via `SurveyThemeTranslations`                      |
| `EmailTemplateRepository`   | `GetPagedAsync`      | Search by `Name`/`Subject` via `EmailTemplateTranslations`      |
| `EmailTemplateRepository`   | `ExistsByNameAsync`  | Check `Name` via `EmailTemplateTranslations`                    |
| `RecurringSurveyRepository` | `GetPagedAsync`      | Search by `Survey.Title` via `SurveyTranslations`               |

### 2. Include Translations - Eager Loading

All repository methods that return entities now include translations to ensure computed properties work correctly:

| Repository                  | Methods                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `SurveyRepository`          | All methods - `.Include(s => s.Translations)`, `.ThenInclude(q => q.Translations)` for questions            |
| `SurveyTemplateRepository`  | All methods - `.Include(t => t.Translations)`, `.ThenInclude(q => q.Translations)` for template questions   |
| `SurveyThemeRepository`     | All methods - `.Include(t => t.Translations)`                                                               |
| `EmailTemplateRepository`   | All methods - `.Include(t => t.Translations)`                                                               |
| `RecurringSurveyRepository` | All methods - `.ThenInclude(s => s.Translations)` for survey                                                |
| `QuestionLogicRepository`   | All methods - `.ThenInclude(q => q.Translations)` for questions                                             |
| `SurveyResponseRepository`  | `GetWithAnswersAsync`, `GetByIdWithAnswersAsync` - `.ThenInclude(q => q.Translations)` for answer questions |
| `SurveyLinkRepository`      | All methods - `.ThenInclude(s => s.Translations)` for survey                                                |

### Implementation Pattern - Search Queries

```csharp
// Before (fails because Name is a computed property ignored by EF)
var query = _context.SurveyThemes
    .Where(t => t.Name.Contains(searchTerm));

// After (queries through translations table)
var matchingThemeIds = await _context.SurveyThemeTranslations
    .Where(t => t.Name.Contains(searchTerm))
    .Select(t => t.ThemeId)
    .Distinct()
    .ToListAsync(cancellationToken);

var query = _context.SurveyThemes
    .Where(t => matchingThemeIds.Contains(t.Id));
```

### Implementation Pattern - Eager Loading

```csharp
// Before (computed properties return empty strings)
return await _context.Surveys
    .Include(s => s.Questions)
    .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

// After (translations loaded, computed properties work)
return await _context.Surveys
    .Include(s => s.Translations)
    .Include(s => s.Questions)
    .ThenInclude(q => q.Translations)
    .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
```

### Ordering Changes

Methods that used `ThenBy(t => t.Name)` for ordering have been changed to `ThenByDescending(t => t.CreatedAt)` since `Name` is a computed property that cannot be used in SQL queries.

| Repository                | Methods Affected                                                              |
| ------------------------- | ----------------------------------------------------------------------------- |
| `SurveyThemeRepository`   | `GetByNamespaceIdAsync`, `GetPublicThemesByNamespaceIdAsync`, `GetPagedAsync` |
| `EmailTemplateRepository` | `GetByNamespaceIdAsync`, `GetByTypeAsync`, `GetPagedAsync`                    |

---

## Notes

1. **Database Re-initialization Required** - The migration drops columns, so existing data needs migration or the DB needs to be re-initialized.

2. **Backward Compatibility** - Not maintained (as per user request). Old API contracts that don't include `languageCode` will use the default language.

3. **Translation Loading** - All repository methods now include `Include(x => x.Translations)` to ensure computed properties work correctly.

4. **Global Query Filters** - EF Core warnings about query filters on translation entities are informational and don't affect functionality.

5. **Repository Search Queries** - All repository methods that search by localizable fields now query through translation tables to avoid EF Core translation errors.

6. **Nested Translations** - When including related entities with translations (e.g., Survey with Questions), use `ThenInclude(q => q.Translations)` to load nested translations.
