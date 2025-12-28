# Task: Advanced Survey Features for Multi-Tenant Survey Management System (.NET 8.0)

## Overview

This document outlines advanced features to be implemented on top of the existing SurveyApp multi-tenant survey management system. The base system already includes:

- ✅ Multi-tenant namespace isolation
- ✅ User management with role-based permissions
- ✅ Survey CRUD operations with various question types
- ✅ Response collection and basic analytics
- ✅ Survey templates
- ✅ JWT authentication
- ✅ CQRS pattern with MediatR
- ✅ Soft delete and auditing

This task focuses on implementing the following advanced features to make the system competitive with SurveySparrow.

---

## Feature 1: Conditional Logic / Question Branching

### Business Context

Allow survey creators to define conditional logic that shows/hides questions based on previous answers. This enables dynamic surveys that adapt to respondent input.

### Domain Model Changes

**New Entities:**

```csharp
// SurveyApp.Domain/Entities/QuestionLogic.cs
public class QuestionLogic : Entity<Guid>
{
    public Guid QuestionId { get; private set; }           // Question this logic belongs to
    public Guid SourceQuestionId { get; private set; }     // Question whose answer triggers this
    public LogicOperator Operator { get; private set; }    // Equals, NotEquals, Contains, GreaterThan, etc.
    public string ConditionValue { get; private set; }     // Value to compare against
    public LogicAction Action { get; private set; }        // Show, Hide, Skip, Jump
    public Guid? TargetQuestionId { get; private set; }    // For Jump action
    public int Priority { get; private set; }              // Evaluation order

    // Navigation properties
    public Question Question { get; private set; }
    public Question SourceQuestion { get; private set; }
}
```

**New Enums:**

```csharp
// SurveyApp.Domain/Enums/LogicOperator.cs
public enum LogicOperator
{
    Equals,
    NotEquals,
    Contains,
    NotContains,
    GreaterThan,
    LessThan,
    GreaterThanOrEquals,
    LessThanOrEquals,
    IsEmpty,
    IsNotEmpty,
    IsAnswered,
    IsNotAnswered
}

// SurveyApp.Domain/Enums/LogicAction.cs
public enum LogicAction
{
    Show,           // Show this question if condition is met
    Hide,           // Hide this question if condition is met
    Skip,           // Skip this question and move to next
    JumpTo,         // Jump to a specific question
    EndSurvey       // End the survey immediately
}
```

### Application Layer

**Commands:**

- `AddQuestionLogicCommand` - Add conditional logic to a question
- `UpdateQuestionLogicCommand` - Modify existing logic
- `RemoveQuestionLogicCommand` - Delete logic rule
- `ReorderLogicPriorityCommand` - Change evaluation order

**Queries:**

- `GetQuestionLogicQuery` - Get all logic rules for a question
- `GetSurveyLogicMapQuery` - Get complete logic map for survey flow visualization

**Services:**

- `ILogicEvaluationService` - Evaluate conditions against answers
  - `EvaluateCondition(QuestionLogic logic, string answerValue): bool`
  - `GetVisibleQuestions(Survey survey, List<Answer> answers): List<Question>`
  - `GetNextQuestion(Survey survey, Question current, List<Answer> answers): Question?`

### DTOs

```csharp
public class QuestionLogicDto
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public Guid SourceQuestionId { get; set; }
    public string SourceQuestionText { get; set; }
    public LogicOperator Operator { get; set; }
    public string ConditionValue { get; set; }
    public LogicAction Action { get; set; }
    public Guid? TargetQuestionId { get; set; }
    public int Priority { get; set; }
}

public class SurveyLogicMapDto
{
    public Guid SurveyId { get; set; }
    public List<LogicNodeDto> Nodes { get; set; }
    public List<LogicEdgeDto> Edges { get; set; }
}
```

### API Endpoints

```
POST   /api/surveys/{surveyId}/questions/{questionId}/logic     - Add logic rule
PUT    /api/surveys/{surveyId}/questions/{questionId}/logic/{id} - Update logic rule
DELETE /api/surveys/{surveyId}/questions/{questionId}/logic/{id} - Delete logic rule
GET    /api/surveys/{surveyId}/logic-map                         - Get full logic visualization
POST   /api/surveys/{surveyId}/evaluate-logic                    - Evaluate logic for given answers
```

### Implementation Notes

- Logic evaluation should happen both on backend (for validation) and provide data for frontend evaluation
- Support complex conditions with AND/OR grouping in future iterations
- Include logic validation when publishing survey (no circular references, valid targets)

---

## Feature 2: Survey Themes and Styling

### Business Context

Allow organizations to customize the visual appearance of surveys with their branding, colors, fonts, and custom CSS.

### Domain Model Changes

**New Entity:**

```csharp
// SurveyApp.Domain/Entities/SurveyTheme.cs
public class SurveyTheme : AggregateRoot<Guid>
{
    public Guid NamespaceId { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public bool IsDefault { get; private set; }
    public bool IsPublic { get; private set; }              // Available to all namespace members

    // Color scheme
    public string PrimaryColor { get; private set; }        // #hex
    public string SecondaryColor { get; private set; }
    public string BackgroundColor { get; private set; }
    public string TextColor { get; private set; }
    public string AccentColor { get; private set; }
    public string ErrorColor { get; private set; }
    public string SuccessColor { get; private set; }

    // Typography
    public string FontFamily { get; private set; }          // Google Font name or web-safe
    public string HeadingFontFamily { get; private set; }
    public int BaseFontSize { get; private set; }           // px

    // Layout
    public ThemeLayout Layout { get; private set; }         // Classic, Card, Conversational
    public string? BackgroundImageUrl { get; private set; }
    public BackgroundImagePosition BackgroundPosition { get; private set; }
    public bool ShowProgressBar { get; private set; }
    public ProgressBarStyle ProgressBarStyle { get; private set; }

    // Branding
    public string? LogoUrl { get; private set; }
    public LogoPosition LogoPosition { get; private set; }
    public bool ShowPoweredBy { get; private set; }         // "Powered by SurveyApp"

    // Custom CSS (Enterprise feature)
    public string? CustomCss { get; private set; }

    // Button styling
    public string ButtonStyle { get; private set; }         // Rounded, Square, Pill
    public string ButtonTextColor { get; private set; }

    // Usage tracking
    public int UsageCount { get; private set; }
}

// Extend Survey entity
public class Survey
{
    // ... existing properties ...
    public Guid? ThemeId { get; private set; }
    public SurveyTheme? Theme { get; private set; }
}
```

**New Enums:**

```csharp
public enum ThemeLayout
{
    Classic,            // Traditional form layout
    Card,               // One question per card/page
    Conversational,     // Chat-like interface
    Minimal             // Clean, minimal design
}

public enum ProgressBarStyle
{
    None,
    Bar,
    Percentage,
    Steps,
    Dots
}

public enum LogoPosition
{
    TopLeft,
    TopCenter,
    TopRight,
    BottomLeft,
    BottomCenter,
    BottomRight
}

public enum BackgroundImagePosition
{
    Cover,
    Contain,
    Tile,
    Center,
    TopLeft,
    TopRight
}
```

### Application Layer

**Commands:**

- `CreateThemeCommand` - Create new theme
- `UpdateThemeCommand` - Modify theme settings
- `DeleteThemeCommand` - Remove theme
- `DuplicateThemeCommand` - Clone existing theme
- `ApplyThemeToSurveyCommand` - Apply theme to survey
- `SetDefaultThemeCommand` - Set namespace default theme

**Queries:**

- `GetThemesQuery` - List all themes in namespace
- `GetThemeByIdQuery` - Get theme details
- `GetThemePreviewQuery` - Get theme with sample survey for preview

### DTOs

```csharp
public class SurveyThemeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public bool IsDefault { get; set; }
    public ThemeColorsDto Colors { get; set; }
    public ThemeTypographyDto Typography { get; set; }
    public ThemeLayoutDto Layout { get; set; }
    public ThemeBrandingDto Branding { get; set; }
    public int UsageCount { get; set; }
}

public class ThemeColorsDto
{
    public string Primary { get; set; }
    public string Secondary { get; set; }
    public string Background { get; set; }
    public string Text { get; set; }
    public string Accent { get; set; }
    public string Error { get; set; }
    public string Success { get; set; }
}
```

### API Endpoints

```
GET    /api/themes                     - List themes
POST   /api/themes                     - Create theme
GET    /api/themes/{id}                - Get theme details
PUT    /api/themes/{id}                - Update theme
DELETE /api/themes/{id}                - Delete theme
POST   /api/themes/{id}/duplicate      - Clone theme
POST   /api/themes/{id}/set-default    - Set as namespace default
PUT    /api/surveys/{id}/theme         - Apply theme to survey
GET    /api/themes/{id}/preview        - Get preview data
GET    /api/themes/{id}/css            - Get generated CSS
```

---

## Feature 3: Webhook Integrations

### Business Context

Allow users to configure webhooks that notify external systems when survey events occur (new response, survey published, etc.).

### Domain Model Changes

**New Entities:**

```csharp
// SurveyApp.Domain/Entities/Webhook.cs
public class Webhook : AggregateRoot<Guid>
{
    public Guid NamespaceId { get; private set; }
    public string Name { get; private set; }
    public string Url { get; private set; }
    public string? Secret { get; private set; }             // For HMAC signature
    public bool IsActive { get; private set; }
    public WebhookEvent[] Events { get; private set; }      // JSON array
    public Guid? SurveyId { get; private set; }             // null = all surveys
    public Dictionary<string, string>? Headers { get; private set; }  // Custom headers
    public int RetryCount { get; private set; }             // Max retries on failure
    public int TimeoutSeconds { get; private set; }

    // Statistics
    public int TotalDeliveries { get; private set; }
    public int SuccessfulDeliveries { get; private set; }
    public int FailedDeliveries { get; private set; }
    public DateTime? LastDeliveryAt { get; private set; }
    public DateTime? LastSuccessAt { get; private set; }
    public DateTime? LastFailureAt { get; private set; }
}

// SurveyApp.Domain/Entities/WebhookDelivery.cs
public class WebhookDelivery : Entity<Guid>
{
    public Guid WebhookId { get; private set; }
    public WebhookEvent Event { get; private set; }
    public string Payload { get; private set; }             // JSON
    public int HttpStatusCode { get; private set; }
    public string? ResponseBody { get; private set; }
    public DeliveryStatus Status { get; private set; }
    public int AttemptNumber { get; private set; }
    public DateTime? DeliveredAt { get; private set; }
    public string? ErrorMessage { get; private set; }
    public long DurationMs { get; private set; }
}
```

**New Enums:**

```csharp
public enum WebhookEvent
{
    ResponseSubmitted,
    ResponseCompleted,
    ResponseStarted,
    SurveyPublished,
    SurveyClosed,
    SurveyDeleted,
    ResponseDeleted,
    QuotaReached
}

public enum DeliveryStatus
{
    Pending,
    Success,
    Failed,
    Retrying
}
```

### Application Layer

**Commands:**

- `CreateWebhookCommand`
- `UpdateWebhookCommand`
- `DeleteWebhookCommand`
- `ToggleWebhookCommand` - Enable/disable
- `TestWebhookCommand` - Send test payload
- `RetryWebhookDeliveryCommand` - Manually retry failed delivery

**Queries:**

- `GetWebhooksQuery` - List webhooks in namespace
- `GetWebhookByIdQuery`
- `GetWebhookDeliveriesQuery` - Get delivery history

**Services:**

- `IWebhookDispatcher` - Dispatches webhook events
  - `DispatchAsync(WebhookEvent event, object payload)`
  - `RetryFailedDeliveriesAsync()`

**Background Jobs:**

- `WebhookDeliveryJob` - Process queued webhook deliveries
- `WebhookRetryJob` - Retry failed deliveries with exponential backoff

### Webhook Payload Structure

```json
{
    "id": "delivery-uuid",
    "event": "response.submitted",
    "timestamp": "2025-01-15T10:30:00Z",
    "namespace": {
        "id": "ns-uuid",
        "slug": "acme"
    },
    "data": {
        "surveyId": "survey-uuid",
        "surveyTitle": "Customer Feedback",
        "responseId": "response-uuid",
        "respondentEmail": "user@example.com",
        "answers": [...]
    }
}
```

### API Endpoints

```
GET    /api/webhooks                        - List webhooks
POST   /api/webhooks                        - Create webhook
GET    /api/webhooks/{id}                   - Get webhook details
PUT    /api/webhooks/{id}                   - Update webhook
DELETE /api/webhooks/{id}                   - Delete webhook
POST   /api/webhooks/{id}/test              - Send test delivery
POST   /api/webhooks/{id}/toggle            - Enable/disable
GET    /api/webhooks/{id}/deliveries        - Get delivery history
POST   /api/webhooks/deliveries/{id}/retry  - Retry specific delivery
```

---

## Feature 4: Response Export (CSV/Excel)

### Business Context

Allow users to export survey responses in various formats for offline analysis and reporting.

### Application Layer

**New Services:**

```csharp
// SurveyApp.Application/Services/IExportService.cs
public interface IExportService
{
    Task<ExportResult> ExportToCsvAsync(ExportRequest request, CancellationToken ct);
    Task<ExportResult> ExportToExcelAsync(ExportRequest request, CancellationToken ct);
    Task<ExportResult> ExportToJsonAsync(ExportRequest request, CancellationToken ct);
    Task<ExportResult> ExportToPdfAsync(ExportRequest request, CancellationToken ct);
}

public class ExportRequest
{
    public Guid SurveyId { get; set; }
    public ExportFormat Format { get; set; }
    public ExportFilter? Filter { get; set; }
    public List<Guid>? QuestionIds { get; set; }        // null = all questions
    public bool IncludeMetadata { get; set; }           // IP, UserAgent, etc.
    public bool IncludeIncomplete { get; set; }
    public DateRange? DateRange { get; set; }
    public string? TimezoneId { get; set; }
}

public class ExportResult
{
    public byte[] Data { get; set; }
    public string FileName { get; set; }
    public string ContentType { get; set; }
    public int TotalRows { get; set; }
}

public enum ExportFormat
{
    Csv,
    Excel,
    Json,
    Pdf
}
```

**Commands:**

- `ExportResponsesCommand` - Initiate export (returns file or job ID for large exports)
- `ScheduleExportCommand` - Schedule recurring exports

**Queries:**

- `GetExportJobStatusQuery` - Check async export status

### Infrastructure Implementation

```csharp
// Use libraries:
// - CsvHelper for CSV
// - ClosedXML for Excel
// - QuestPDF for PDF

public class ExportService : IExportService
{
    public async Task<ExportResult> ExportToExcelAsync(ExportRequest request, CancellationToken ct)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Responses");

        // Headers
        worksheet.Cell(1, 1).Value = "Response ID";
        worksheet.Cell(1, 2).Value = "Submitted At";
        // ... add question headers ...

        // Data rows
        // ... populate with response data ...

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        return new ExportResult
        {
            Data = stream.ToArray(),
            FileName = $"responses-{DateTime.UtcNow:yyyyMMdd}.xlsx",
            ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };
    }
}
```

### API Endpoints

```
POST /api/surveys/{surveyId}/export           - Export responses (returns file or job)
GET  /api/surveys/{surveyId}/export/{jobId}   - Get async export status/download
GET  /api/surveys/{surveyId}/export/preview   - Preview export structure
```

---

## Feature 5: NPS (Net Promoter Score) Calculation

### Business Context

Automatically calculate and track NPS scores for surveys that include NPS-type questions (0-10 rating with "How likely are you to recommend" type).

### Domain Model Changes

**Extend Question entity:**

```csharp
public class Question
{
    // ... existing properties ...
    public bool IsNpsQuestion { get; private set; }
    public NpsQuestionType? NpsType { get; private set; }
}

public enum NpsQuestionType
{
    Standard,           // How likely to recommend
    CustomerSatisfaction, // CSAT
    CustomerEffort       // CES
}
```

**New Value Object:**

```csharp
// SurveyApp.Domain/ValueObjects/NpsScore.cs
public sealed class NpsScore : ValueObject
{
    public int Promoters { get; }           // 9-10
    public int Passives { get; }            // 7-8
    public int Detractors { get; }          // 0-6
    public int TotalResponses { get; }
    public decimal Score { get; }           // ((Promoters - Detractors) / Total) * 100

    public decimal PromoterPercentage => TotalResponses > 0 ? (decimal)Promoters / TotalResponses * 100 : 0;
    public decimal PassivePercentage => TotalResponses > 0 ? (decimal)Passives / TotalResponses * 100 : 0;
    public decimal DetractorPercentage => TotalResponses > 0 ? (decimal)Detractors / TotalResponses * 100 : 0;

    public NpsCategory Category => Score switch
    {
        >= 70 => NpsCategory.Excellent,
        >= 50 => NpsCategory.Great,
        >= 0 => NpsCategory.Good,
        _ => NpsCategory.NeedsImprovement
    };
}

public enum NpsCategory
{
    NeedsImprovement,  // Below 0
    Good,              // 0-49
    Great,             // 50-69
    Excellent          // 70+
}
```

### Application Layer

**Services:**

```csharp
public interface INpsService
{
    Task<NpsScoreDto> CalculateNpsAsync(Guid surveyId, CancellationToken ct);
    Task<NpsScoreDto> CalculateNpsForQuestionAsync(Guid questionId, CancellationToken ct);
    Task<NpsTrendDto> GetNpsTrendAsync(Guid surveyId, DateRange range, CancellationToken ct);
    Task<NpsBenchmarkDto> GetIndustryBenchmarkAsync(string industry, CancellationToken ct);
}
```

**Queries:**

- `GetSurveyNpsQuery` - Get NPS for entire survey
- `GetNpsTrendQuery` - Get NPS over time
- `GetNpsBySegmentQuery` - NPS broken down by respondent segments

### DTOs

```csharp
public class NpsScoreDto
{
    public decimal Score { get; set; }
    public int Promoters { get; set; }
    public int Passives { get; set; }
    public int Detractors { get; set; }
    public int TotalResponses { get; set; }
    public decimal PromoterPercentage { get; set; }
    public decimal PassivePercentage { get; set; }
    public decimal DetractorPercentage { get; set; }
    public string Category { get; set; }
}

public class NpsTrendDto
{
    public List<NpsTrendPointDto> DataPoints { get; set; }
    public decimal AverageScore { get; set; }
    public decimal ChangeFromPrevious { get; set; }
}
```

### API Endpoints

```
GET /api/surveys/{surveyId}/nps                    - Get NPS score
GET /api/surveys/{surveyId}/nps/trend              - Get NPS trend over time
GET /api/surveys/{surveyId}/questions/{id}/nps     - Get NPS for specific question
```

---

## Feature 6: Recurring Surveys

### Business Context

Allow surveys to be automatically sent on a schedule (daily, weekly, monthly) to a defined audience.

### Domain Model Changes

**New Entity:**

```csharp
// SurveyApp.Domain/Entities/RecurringSurvey.cs
public class RecurringSurvey : AggregateRoot<Guid>
{
    public Guid SurveyId { get; private set; }
    public Guid NamespaceId { get; private set; }
    public string Name { get; private set; }
    public bool IsActive { get; private set; }

    // Schedule
    public RecurrencePattern Pattern { get; private set; }
    public string CronExpression { get; private set; }         // For complex schedules
    public TimeOnly SendTime { get; private set; }
    public string TimezoneId { get; private set; }
    public DayOfWeek[]? DaysOfWeek { get; private set; }       // For weekly
    public int? DayOfMonth { get; private set; }               // For monthly

    // Audience
    public AudienceType AudienceType { get; private set; }
    public string[]? RecipientEmails { get; private set; }     // Static list
    public Guid? AudienceListId { get; private set; }          // Dynamic list

    // Options
    public bool SendReminders { get; private set; }
    public int ReminderDaysAfter { get; private set; }
    public int MaxReminders { get; private set; }
    public string? CustomSubject { get; private set; }
    public string? CustomMessage { get; private set; }

    // Tracking
    public DateTime? NextRunAt { get; private set; }
    public DateTime? LastRunAt { get; private set; }
    public int TotalRuns { get; private set; }
    public DateTime? EndsAt { get; private set; }              // Optional end date
    public int? MaxRuns { get; private set; }                  // Optional max iterations
}

// SurveyApp.Domain/Entities/RecurringSurveyRun.cs
public class RecurringSurveyRun : Entity<Guid>
{
    public Guid RecurringSurveyId { get; private set; }
    public int RunNumber { get; private set; }
    public DateTime ScheduledAt { get; private set; }
    public DateTime? StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public RunStatus Status { get; private set; }
    public int RecipientsCount { get; private set; }
    public int SentCount { get; private set; }
    public int FailedCount { get; private set; }
    public int ResponsesCount { get; private set; }
    public string? ErrorMessage { get; private set; }
}
```

**New Enums:**

```csharp
public enum RecurrencePattern
{
    Daily,
    Weekly,
    BiWeekly,
    Monthly,
    Quarterly,
    Custom          // Use CronExpression
}

public enum AudienceType
{
    StaticList,     // Fixed email list
    DynamicList,    // From audience management
    AllContacts,    // All contacts in namespace
    PreviousRespondents
}

public enum RunStatus
{
    Scheduled,
    Running,
    Completed,
    PartiallyCompleted,
    Failed,
    Cancelled
}
```

### Application Layer

**Commands:**

- `CreateRecurringSurveyCommand`
- `UpdateRecurringSurveyCommand`
- `DeleteRecurringSurveyCommand`
- `PauseRecurringSurveyCommand`
- `ResumeRecurringSurveyCommand`
- `TriggerImmediateRunCommand` - Run now regardless of schedule

**Queries:**

- `GetRecurringSurveysQuery`
- `GetRecurringSurveyByIdQuery`
- `GetRecurringSurveyRunsQuery` - Get run history
- `GetUpcomingRunsQuery` - Get next scheduled runs

**Background Jobs:**

- `RecurringSurveySchedulerJob` - Runs periodically to check and trigger due surveys
- `RecurringSurveyExecutorJob` - Executes individual survey runs

### API Endpoints

```
GET    /api/recurring-surveys                      - List recurring surveys
POST   /api/recurring-surveys                      - Create recurring survey
GET    /api/recurring-surveys/{id}                 - Get details
PUT    /api/recurring-surveys/{id}                 - Update
DELETE /api/recurring-surveys/{id}                 - Delete
POST   /api/recurring-surveys/{id}/pause           - Pause
POST   /api/recurring-surveys/{id}/resume          - Resume
POST   /api/recurring-surveys/{id}/trigger         - Run immediately
GET    /api/recurring-surveys/{id}/runs            - Get run history
GET    /api/recurring-surveys/{id}/runs/{runId}    - Get specific run details
```

---

## Feature 7: Multi-language Survey Support (i18n)

### Business Context

Allow surveys to be translated into multiple languages, with respondents selecting their preferred language.

### Domain Model Changes

**New Entities:**

```csharp
// SurveyApp.Domain/Entities/SurveyTranslation.cs
public class SurveyTranslation : Entity<Guid>
{
    public Guid SurveyId { get; private set; }
    public string LanguageCode { get; private set; }        // ISO 639-1 (en, es, fr, etc.)
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public string? WelcomeMessage { get; private set; }
    public string? ThankYouMessage { get; private set; }
    public bool IsComplete { get; private set; }            // All questions translated
    public TranslationStatus Status { get; private set; }
}

// SurveyApp.Domain/Entities/QuestionTranslation.cs
public class QuestionTranslation : Entity<Guid>
{
    public Guid QuestionId { get; private set; }
    public string LanguageCode { get; private set; }
    public string Text { get; private set; }
    public string? Description { get; private set; }
    public string? OptionsJson { get; private set; }        // Translated options for choice questions
}

// Extend Survey
public class Survey
{
    // ... existing properties ...
    public string DefaultLanguage { get; private set; }     // ISO 639-1
    public string[] AvailableLanguages { get; private set; } // JSON array
    public bool AutoDetectLanguage { get; private set; }
}
```

**New Enums:**

```csharp
public enum TranslationStatus
{
    Draft,
    InProgress,
    Complete,
    NeedsReview
}
```

### Application Layer

**Commands:**

- `AddSurveyLanguageCommand` - Add new language to survey
- `RemoveSurveyLanguageCommand` - Remove language
- `UpdateSurveyTranslationCommand` - Update survey-level translations
- `UpdateQuestionTranslationCommand` - Update question translations
- `AutoTranslateCommand` - Use AI/API to auto-translate (optional)
- `ImportTranslationsCommand` - Import from file (JSON/XLIFF)
- `ExportTranslationsCommand` - Export for external translation

**Queries:**

- `GetSurveyLanguagesQuery` - Get available languages
- `GetTranslationStatusQuery` - Get translation completeness
- `GetSurveyInLanguageQuery` - Get survey in specific language

**Services:**

- `ITranslationService` - Handles translation logic
  - `GetLocalizedSurvey(Guid surveyId, string languageCode)`
  - `ValidateTranslations(Guid surveyId)`
  - `GetMissingTranslations(Guid surveyId, string languageCode)`

### DTOs

```csharp
public class SurveyLanguageDto
{
    public string LanguageCode { get; set; }
    public string LanguageName { get; set; }
    public bool IsDefault { get; set; }
    public TranslationStatus Status { get; set; }
    public decimal CompletionPercentage { get; set; }
    public int TranslatedQuestions { get; set; }
    public int TotalQuestions { get; set; }
}

public class TranslationExportDto
{
    public string LanguageCode { get; set; }
    public SurveyTranslationExportDto Survey { get; set; }
    public List<QuestionTranslationExportDto> Questions { get; set; }
}
```

### API Endpoints

```
GET    /api/surveys/{id}/languages                          - List available languages
POST   /api/surveys/{id}/languages                          - Add language
DELETE /api/surveys/{id}/languages/{languageCode}           - Remove language
GET    /api/surveys/{id}/translations/{languageCode}        - Get translations
PUT    /api/surveys/{id}/translations/{languageCode}        - Update translations
POST   /api/surveys/{id}/translations/{languageCode}/auto   - Auto-translate
GET    /api/surveys/{id}/translations/export                - Export all translations
POST   /api/surveys/{id}/translations/import                - Import translations
GET    /api/public/surveys/{token}?lang={code}              - Get public survey in language
```

---

## Feature 8: Enhanced Email Distribution Service

### Business Context

Upgrade the email distribution system with templates, tracking, scheduling, and better delivery management.

### Domain Model Changes

**New Entities:**

```csharp
// SurveyApp.Domain/Entities/EmailTemplate.cs
public class EmailTemplate : AggregateRoot<Guid>
{
    public Guid NamespaceId { get; private set; }
    public string Name { get; private set; }
    public EmailTemplateType Type { get; private set; }
    public string Subject { get; private set; }
    public string HtmlBody { get; private set; }
    public string? PlainTextBody { get; private set; }
    public bool IsDefault { get; private set; }
    public string[]? AvailablePlaceholders { get; private set; }
}

// SurveyApp.Domain/Entities/EmailDistribution.cs
public class EmailDistribution : AggregateRoot<Guid>
{
    public Guid SurveyId { get; private set; }
    public Guid? EmailTemplateId { get; private set; }
    public string Subject { get; private set; }
    public string Body { get; private set; }
    public string[] Recipients { get; private set; }
    public DateTime? ScheduledAt { get; private set; }
    public DateTime? SentAt { get; private set; }
    public DistributionStatus Status { get; private set; }

    // Tracking
    public int TotalRecipients { get; private set; }
    public int SentCount { get; private set; }
    public int DeliveredCount { get; private set; }
    public int OpenedCount { get; private set; }
    public int ClickedCount { get; private set; }
    public int BouncedCount { get; private set; }
    public int UnsubscribedCount { get; private set; }
}

// SurveyApp.Domain/Entities/EmailRecipient.cs
public class EmailRecipient : Entity<Guid>
{
    public Guid DistributionId { get; private set; }
    public string Email { get; private set; }
    public string? Name { get; private set; }
    public RecipientStatus Status { get; private set; }
    public DateTime? SentAt { get; private set; }
    public DateTime? DeliveredAt { get; private set; }
    public DateTime? OpenedAt { get; private set; }
    public DateTime? ClickedAt { get; private set; }
    public string? UniqueToken { get; private set; }        // For tracking
    public string? ErrorMessage { get; private set; }
}
```

**New Enums:**

```csharp
public enum EmailTemplateType
{
    SurveyInvitation,
    SurveyReminder,
    ThankYou,
    Custom
}

public enum DistributionStatus
{
    Draft,
    Scheduled,
    Sending,
    Sent,
    PartiallyFailed,
    Failed,
    Cancelled
}

public enum RecipientStatus
{
    Pending,
    Sent,
    Delivered,
    Opened,
    Clicked,
    Bounced,
    Unsubscribed,
    Failed
}
```

### Application Layer

**Services:**

```csharp
public interface IEmailDistributionService
{
    Task<Guid> CreateDistributionAsync(CreateDistributionRequest request, CancellationToken ct);
    Task ScheduleDistributionAsync(Guid distributionId, DateTime scheduledAt, CancellationToken ct);
    Task SendDistributionAsync(Guid distributionId, CancellationToken ct);
    Task CancelDistributionAsync(Guid distributionId, CancellationToken ct);
    Task<DistributionStatsDto> GetStatsAsync(Guid distributionId, CancellationToken ct);
    Task SendReminderAsync(Guid distributionId, CancellationToken ct);
    Task TrackOpenAsync(string token, CancellationToken ct);
    Task TrackClickAsync(string token, CancellationToken ct);
}
```

### Placeholders for Templates

```
{{respondent.name}}
{{respondent.email}}
{{survey.title}}
{{survey.description}}
{{survey.link}}
{{survey.deadline}}
{{sender.name}}
{{namespace.name}}
{{unsubscribe.link}}
```

### API Endpoints

```
GET    /api/email-templates                           - List templates
POST   /api/email-templates                           - Create template
PUT    /api/email-templates/{id}                      - Update template
DELETE /api/email-templates/{id}                      - Delete template

POST   /api/surveys/{id}/distributions                - Create distribution
GET    /api/surveys/{id}/distributions                - List distributions
GET    /api/surveys/{id}/distributions/{distId}       - Get distribution details
POST   /api/surveys/{id}/distributions/{distId}/send  - Send now
POST   /api/surveys/{id}/distributions/{distId}/schedule - Schedule
DELETE /api/surveys/{id}/distributions/{distId}       - Cancel/delete
GET    /api/surveys/{id}/distributions/{distId}/stats - Get tracking stats

GET    /api/track/open/{token}                        - Track email open (1x1 pixel)
GET    /api/track/click/{token}                       - Track link click
```

---

## Feature 9: Enhanced Anonymous Links with Tracking

### Business Context

Improve the anonymous link system to support URL parameters for pre-filling, tracking sources, and unique respondent identification without compromising anonymity.

### Domain Model Changes

**Extend Survey:**

```csharp
public class Survey
{
    // ... existing properties ...

    // Link Settings
    public bool AllowUrlPrefill { get; private set; }       // Allow ?field=value params
    public string[]? AllowedPrefillFields { get; private set; }
    public bool TrackSource { get; private set; }           // Track utm_source, etc.
    public bool RequireUniqueLink { get; private set; }     // One-time use links
    public int? LinkExpirationDays { get; private set; }
}

// SurveyApp.Domain/Entities/SurveyLink.cs
public class SurveyLink : Entity<Guid>
{
    public Guid SurveyId { get; private set; }
    public string Token { get; private set; }               // Unique token
    public SurveyLinkType Type { get; private set; }
    public string? Name { get; private set; }               // For identification
    public string? Source { get; private set; }             // utm_source
    public string? Medium { get; private set; }             // utm_medium
    public string? Campaign { get; private set; }           // utm_campaign
    public Dictionary<string, string>? PrefillData { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime? ExpiresAt { get; private set; }
    public int? MaxUses { get; private set; }
    public int UsageCount { get; private set; }
    public string? Password { get; private set; }           // Optional password protection
}

// SurveyApp.Domain/Entities/LinkClick.cs
public class LinkClick : Entity<Guid>
{
    public Guid SurveyLinkId { get; private set; }
    public DateTime ClickedAt { get; private set; }
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    public string? Referrer { get; private set; }
    public string? Country { get; private set; }            // From IP geolocation
    public Guid? ResponseId { get; private set; }           // If completed
}
```

**New Enums:**

```csharp
public enum SurveyLinkType
{
    Public,             // Standard public link
    Unique,             // One-time use
    Campaign,           // With tracking params
    Embedded,           // For iframe embedding
    QrCode              // Specifically for QR codes
}
```

### Application Layer

**Commands:**

- `CreateSurveyLinkCommand` - Create custom link
- `UpdateSurveyLinkCommand`
- `DeactivateSurveyLinkCommand`
- `GenerateQrCodeCommand` - Generate QR code for link
- `GenerateBulkLinksCommand` - Generate multiple unique links

**Queries:**

- `GetSurveyLinksQuery` - List all links for survey
- `GetLinkAnalyticsQuery` - Get click/completion stats per link
- `GetLinkByTokenQuery`

### DTOs

```csharp
public class SurveyLinkDto
{
    public Guid Id { get; set; }
    public string Token { get; set; }
    public string FullUrl { get; set; }
    public SurveyLinkType Type { get; set; }
    public string? Name { get; set; }
    public string? Source { get; set; }
    public bool IsActive { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int UsageCount { get; set; }
    public int? MaxUses { get; set; }
    public int ResponseCount { get; set; }
}

public class LinkAnalyticsDto
{
    public Guid LinkId { get; set; }
    public int TotalClicks { get; set; }
    public int UniqueClicks { get; set; }
    public int Responses { get; set; }
    public decimal ConversionRate { get; set; }
    public Dictionary<string, int> ClicksByCountry { get; set; }
    public Dictionary<string, int> ClicksByDevice { get; set; }
    public List<LinkClickTrendDto> ClickTrend { get; set; }
}
```

### API Endpoints

```
GET    /api/surveys/{id}/links                    - List survey links
POST   /api/surveys/{id}/links                    - Create custom link
PUT    /api/surveys/{id}/links/{linkId}           - Update link
DELETE /api/surveys/{id}/links/{linkId}           - Deactivate link
GET    /api/surveys/{id}/links/{linkId}/analytics - Get link analytics
POST   /api/surveys/{id}/links/{linkId}/qr        - Generate QR code
POST   /api/surveys/{id}/links/bulk               - Generate bulk unique links
GET    /api/s/{token}                             - Short link redirect
GET    /api/s/{token}/qr.png                      - QR code image
```

---

## Implementation Guidelines

### Package Dependencies

Add these NuGet packages for the new features:

```xml
<!-- Excel Export -->
<PackageReference Include="ClosedXML" Version="0.102.2" />

<!-- CSV Export -->
<PackageReference Include="CsvHelper" Version="31.0.0" />

<!-- PDF Generation -->
<PackageReference Include="QuestPDF" Version="2024.3.0" />

<!-- QR Code Generation -->
<PackageReference Include="QRCoder" Version="1.5.1" />

<!-- Email -->
<PackageReference Include="MailKit" Version="4.3.0" />

<!-- Background Jobs -->
<PackageReference Include="Hangfire.AspNetCore" Version="1.8.9" />

<!-- IP Geolocation (optional) -->
<PackageReference Include="MaxMind.GeoIP2" Version="5.2.0" />
```

### Database Migrations

After implementing each feature, generate migrations:

```bash
dotnet ef migrations add Add{FeatureName} -p src/SurveyApp.Infrastructure -s src/SurveyApp.API --context ApplicationDbContext
```

### Background Job Setup

Configure Hangfire for recurring jobs:

```csharp
// Program.cs
builder.Services.AddHangfire(config => config
    .UsePostgreSqlStorage(connectionString));
builder.Services.AddHangfireServer();

// Configure recurring jobs
RecurringJob.AddOrUpdate<RecurringSurveySchedulerJob>(
    "recurring-survey-scheduler",
    x => x.ExecuteAsync(),
    "*/5 * * * *"); // Every 5 minutes

RecurringJob.AddOrUpdate<WebhookRetryJob>(
    "webhook-retry",
    x => x.ExecuteAsync(),
    "*/15 * * * *"); // Every 15 minutes
```

### Feature Flags

Consider implementing feature flags for gradual rollout:

```csharp
public interface IFeatureFlags
{
    bool IsEnabled(string featureName, Guid? namespaceId = null);
}

// Features
public static class Features
{
    public const string QuestionLogic = "question-logic";
    public const string SurveyThemes = "survey-themes";
    public const string Webhooks = "webhooks";
    public const string ExportPdf = "export-pdf";
    public const string NpsCalculation = "nps-calculation";
    public const string RecurringSurveys = "recurring-surveys";
    public const string MultiLanguage = "multi-language";
}
```

---

## Testing Requirements

For each feature, implement:

1. **Unit Tests** - Domain logic, services
2. **Integration Tests** - Repository operations, API endpoints
3. **Performance Tests** - Export large datasets, webhook delivery

Example test structure:

```
tests/
  SurveyApp.Domain.Tests/
    Entities/
      QuestionLogicTests.cs
      SurveyThemeTests.cs
  SurveyApp.Application.Tests/
    Features/
      Logic/
        LogicEvaluationServiceTests.cs
      Export/
        ExportServiceTests.cs
  SurveyApp.API.Tests/
    Controllers/
      WebhooksControllerTests.cs
```

---

## Priority Order

Recommended implementation order based on user value and complexity:

1. **Response Export (CSV/Excel)** - High value, moderate complexity
2. **Webhook Integrations** - High value for integrations
3. **NPS Scoring** - Quick win, adds analytics value
4. **Enhanced Email Distribution** - Improves existing feature
5. **Enhanced Anonymous Links** - Improves existing feature
6. **Survey Themes** - Visual customization
7. **Conditional Logic** - Complex but powerful
8. **Multi-language Support** - Complex, enterprise feature
9. **Recurring Surveys** - Complex scheduling

---

## Success Criteria

Each feature should:

- ✅ Follow existing code patterns and architecture
- ✅ Include full CQRS implementation (Commands/Queries/Handlers)
- ✅ Have FluentValidation validators
- ✅ Include proper error handling with Result pattern
- ✅ Respect namespace isolation
- ✅ Enforce permission checks
- ✅ Include Swagger documentation
- ✅ Have audit trail support
- ✅ Include soft delete where applicable
