# Survey Backend API Documentation

This document provides a comprehensive reference for all DTOs, Commands, and Queries used in the `SurveysController` and related Survey API endpoints.

---

## Table of Contents

1. [Controller Overview](#controller-overview)
2. [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
   - [SurveyDto](#surveydto)
   - [SurveyDetailsDto](#surveydetailsdto)
   - [SurveyListItemDto](#surveylistitemdto)
   - [PublicSurveyDto](#publicsurveydto)
   - [PublicSurveyThemeDto](#publicsurveythemedto)
   - [PagedResponse](#pagedresponse)
   - [QuestionDto & PublicQuestionDto](#questiondto--publicquestiondto)
   - [QuestionSettingsDto](#questionsettingsdto)
   - [Analytics DTOs](#analytics-dtos)
   - [Export DTOs](#export-dtos)
   - [NPS DTOs](#nps-dtos)
3. [Commands](#commands)
   - [CreateSurveyCommand](#createsurveycommand)
   - [UpdateSurveyCommand](#updatesurveycommand)
   - [PublishSurveyCommand](#publishsurveycommand)
   - [DuplicateSurveyCommand](#duplicatesurveycommand)
   - [CloseSurveyCommand](#closesurveycommand)
   - [DeleteSurveyCommand](#deletesurveycommand)
   - [ExportResponsesCommand](#exportresponsescommand)
   - [ApplyThemeToSurveyCommand](#applythemetosurveycommand)
4. [Queries](#queries)
   - [GetSurveysQuery](#getsurveysquery)
   - [GetSurveyByIdQuery](#getsurveybyidquery)
   - [GetPublicSurveyQuery](#getpublicsurveyquery)
   - [GetSurveyAnalyticsQuery](#getsurveyanalyticsquery)
   - [GetExportPreviewQuery](#getexportpreviewquery)
   - [GetSurveyNpsQuery](#getsurveynpsquery)
   - [GetNpsTrendQuery](#getnpstrendquery)
   - [GetQuestionNpsQuery](#getquestionnpsquery)
5. [Enums](#enums)
6. [Validators](#validators)

---

## Controller Overview

**File Path:** `back/src/SurveyApp.API/Controllers/SurveysController.cs`

The `SurveysController` handles all survey-related operations including CRUD, publishing, analytics, export, and NPS metrics.

### Endpoints Summary

| Method | Route                                          | Description                   |
| ------ | ---------------------------------------------- | ----------------------------- |
| GET    | `/api/surveys`                                 | Get all surveys (paged)       |
| GET    | `/api/surveys/{id}`                            | Get survey by ID              |
| GET    | `/api/surveys/public/{shareToken}`             | Get public survey (anonymous) |
| POST   | `/api/surveys`                                 | Create new survey             |
| PUT    | `/api/surveys/{id}`                            | Update survey                 |
| POST   | `/api/surveys/{id}/publish`                    | Publish survey                |
| POST   | `/api/surveys/{id}/duplicate`                  | Duplicate survey              |
| POST   | `/api/surveys/{id}/close`                      | Close survey                  |
| DELETE | `/api/surveys/{id}`                            | Delete survey                 |
| GET    | `/api/surveys/{id}/analytics`                  | Get analytics                 |
| POST   | `/api/surveys/{id}/export`                     | Export responses              |
| GET    | `/api/surveys/{id}/export/preview`             | Get export preview            |
| PUT    | `/api/surveys/{id}/theme`                      | Apply theme                   |
| GET    | `/api/surveys/{id}/nps`                        | Get NPS summary               |
| GET    | `/api/surveys/{id}/nps/trend`                  | Get NPS trend                 |
| GET    | `/api/surveys/{id}/questions/{questionId}/nps` | Get question NPS              |

---

## DTOs (Data Transfer Objects)

### SurveyDto

**File Path:** `back/src/SurveyApp.Application/DTOs/SurveyDto.cs`

Core DTO for survey data.

```csharp
public class SurveyDto
{
    public Guid Id { get; set; }
    public Guid NamespaceId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public SurveyType Type { get; set; }
    public CxMetricType? CxMetricType { get; set; }
    public SurveyStatus Status { get; set; }
    public string? WelcomeMessage { get; set; }
    public string? ThankYouMessage { get; set; }
    public string AccessToken { get; set; } = null!;
    public DateTime? PublishedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public DateTime? StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }
    public bool AllowAnonymousResponses { get; set; }
    public bool AllowMultipleResponses { get; set; }
    public int? MaxResponses { get; set; }
    public Guid? ThemeId { get; set; }
    public string? PresetThemeId { get; set; }
    public string? ThemeCustomizations { get; set; }
    public int QuestionCount { get; set; }
    public int ResponseCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public string DefaultLanguage { get; set; } = "en";
    public string Language { get; set; } = "en";
    public IReadOnlyList<string> AvailableLanguages { get; set; } = [];
}
```

---

### SurveyDetailsDto

**File Path:** `back/src/SurveyApp.Application/DTOs/SurveyDto.cs`

Extended DTO with questions included.

```csharp
public class SurveyDetailsDto : SurveyDto
{
    public IReadOnlyList<QuestionDto> Questions { get; set; } = [];
}
```

---

### SurveyListItemDto

**File Path:** `back/src/SurveyApp.Application/DTOs/SurveyDto.cs`

Lightweight DTO for list views.

```csharp
public class SurveyListItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public SurveyType Type { get; set; }
    public CxMetricType? CxMetricType { get; set; }
    public SurveyStatus Status { get; set; }
    public int QuestionCount { get; set; }
    public int ResponseCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public string DefaultLanguage { get; set; } = "en";
}
```

---

### PublicSurveyDto

**File Path:** `back/src/SurveyApp.Application/DTOs/SurveyDto.cs`

DTO for public survey respondents (no authentication required).

```csharp
public class PublicSurveyDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? WelcomeMessage { get; set; }
    public string? ThankYouMessage { get; set; }
    public bool AllowAnonymousResponses { get; set; }
    public bool IsAnonymous { get; set; }
    public IReadOnlyList<PublicQuestionDto> Questions { get; set; } = [];
    public PublicSurveyThemeDto? Theme { get; set; }
    public string Language { get; set; } = "en";
    public IReadOnlyList<string> AvailableLanguages { get; set; } = [];
}
```

---

### PublicSurveyThemeDto

**File Path:** `back/src/SurveyApp.Application/DTOs/SurveyDto.cs`

Simplified theme DTO for public survey respondents.

```csharp
public class PublicSurveyThemeDto
{
    // Primary colors
    public string PrimaryColor { get; set; } = "#6750A4";
    public string? OnPrimaryColor { get; set; }
    public string? PrimaryContainerColor { get; set; }
    public string? OnPrimaryContainerColor { get; set; }

    // Secondary colors
    public string SecondaryColor { get; set; } = "#625B71";
    public string? OnSecondaryColor { get; set; }
    public string? SecondaryContainerColor { get; set; }
    public string? OnSecondaryContainerColor { get; set; }

    // Surface colors
    public string? SurfaceColor { get; set; }
    public string? SurfaceContainerLowestColor { get; set; }
    public string? SurfaceContainerLowColor { get; set; }
    public string? SurfaceContainerColor { get; set; }
    public string? SurfaceContainerHighColor { get; set; }
    public string? SurfaceContainerHighestColor { get; set; }
    public string? OnSurfaceColor { get; set; }
    public string? OnSurfaceVariantColor { get; set; }

    // Outline colors
    public string? OutlineColor { get; set; }
    public string? OutlineVariantColor { get; set; }

    // Legacy colors
    public string? BackgroundColor { get; set; }
    public string? TextColor { get; set; }

    // Typography
    public string? FontFamily { get; set; }
    public string? HeadingFontFamily { get; set; }
    public int? BaseFontSize { get; set; }

    // Button styling
    public int ButtonStyle { get; set; }
    public string? ButtonTextColor { get; set; }

    // Branding
    public string? LogoUrl { get; set; }
    public int? LogoSize { get; set; }
    public bool? ShowLogoBackground { get; set; }
    public string? LogoBackgroundColor { get; set; }
    public string? BrandingTitle { get; set; }
    public string? BrandingSubtitle { get; set; }

    // Layout
    public string? BackgroundImageUrl { get; set; }
    public string? BackgroundPosition { get; set; }
    public bool ShowProgressBar { get; set; } = true;
    public int ProgressBarStyle { get; set; }

    // Additional branding
    public bool ShowPoweredBy { get; set; } = true;
}
```

---

### PagedResponse

**File Path:** `back/src/SurveyApp.Application/DTOs/Common/PagedResponse.cs`

Generic pagination wrapper.

```csharp
public class PagedResponse<T>
{
    public IReadOnlyList<T> Items { get; init; } = [];
    public int PageNumber { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public static PagedResponse<T> Create(
        IReadOnlyList<T> items,
        int pageNumber,
        int pageSize,
        int totalCount);

    public static PagedResponse<T> FromTuple(
        (IReadOnlyList<T> Items, int TotalCount) tuple,
        int pageNumber,
        int pageSize);

    public PagedResponse<TNew> Map<TNew>(Func<T, TNew> mapper);

    public static PagedResponse<T> Empty(
        int pageNumber = 1,
        int pageSize = 20);
}
```

---

### QuestionDto & PublicQuestionDto

**File Path:** `back/src/SurveyApp.Application/DTOs/QuestionDto.cs`

```csharp
public class QuestionDto
{
    public Guid Id { get; set; }
    public Guid SurveyId { get; set; }
    public string Text { get; set; } = null!;
    public QuestionType Type { get; set; }
    public int Order { get; set; }
    public bool IsRequired { get; set; }
    public string? Description { get; set; }
    public QuestionSettingsDto? Settings { get; set; }
    public bool IsNpsQuestion { get; set; }
    public NpsQuestionType? NpsType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class PublicQuestionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = null!;
    public QuestionType Type { get; set; }
    public int Order { get; set; }
    public bool IsRequired { get; set; }
    public string? Description { get; set; }
    public QuestionSettingsDto? Settings { get; set; }
    public bool IsNpsQuestion { get; set; }
    public NpsQuestionType? NpsType { get; set; }
}
```

---

### QuestionSettingsDto

**File Path:** `back/src/SurveyApp.Application/DTOs/QuestionDto.cs`

```csharp
public record QuestionOptionDto
{
    public Guid Id { get; init; }
    public string Text { get; init; } = null!;
    public int Order { get; init; }
}

public record QuestionSettingsDto
{
    public IReadOnlyList<QuestionOptionDto>? Options { get; init; }
    public int? MinValue { get; init; }
    public int? MaxValue { get; init; }
    public string? MinLabel { get; init; }
    public string? MaxLabel { get; init; }
    public IReadOnlyList<string>? AllowedFileTypes { get; init; }
    public long? MaxFileSize { get; init; }
    public IReadOnlyList<string>? MatrixRows { get; init; }
    public IReadOnlyList<string>? MatrixColumns { get; init; }
    public string? Placeholder { get; init; }
    public bool AllowOther { get; init; }
    public int? MaxLength { get; init; }
    public int? MinLength { get; init; }
    public int? MaxSelections { get; init; }
    public string? ValidationPattern { get; init; }
    public string? ValidationMessage { get; init; }
    public string? ValidationPreset { get; init; }
    public RatingStyle? RatingStyle { get; init; }
    public YesNoStyle? YesNoStyle { get; init; }
}
```

---

### Analytics DTOs

**File Path:** `back/src/SurveyApp.Application/DTOs/AnalyticsDto.cs`

```csharp
public class SurveyAnalyticsDto
{
    public Guid SurveyId { get; set; }
    public string SurveyTitle { get; set; } = null!;
    public int TotalResponses { get; set; }
    public int CompletedResponses { get; set; }
    public int PartialResponses { get; set; }
    public decimal CompletionRate { get; set; }
    public double AverageCompletionTimeSeconds { get; set; }
    public DateTime? FirstResponseAt { get; set; }
    public DateTime? LastResponseAt { get; set; }
    public Dictionary<DateTime, int>? ResponsesByDate { get; set; }
    public IReadOnlyList<QuestionAnalyticsDto> Questions { get; set; } = [];
}

public class QuestionAnalyticsDto
{
    public Guid QuestionId { get; set; }
    public string QuestionText { get; set; } = null!;
    public string QuestionType { get; set; } = null!;
    public int TotalAnswers { get; set; }
    public int SkippedCount { get; set; }
    public IReadOnlyList<AnswerOptionStatsDto>? AnswerOptions { get; set; }
    public double? AverageRating { get; set; }
    public double? AverageValue { get; set; }
    public int? MinValue { get; set; }
    public int? MaxValue { get; set; }
    public IReadOnlyList<string>? SampleAnswers { get; set; }
    public int OtherCount { get; set; }
    public IReadOnlyList<string>? OtherResponses { get; set; }
}

public class AnswerOptionStatsDto
{
    public Guid OptionId { get; set; }
    public string Option { get; set; } = null!;
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}
```

---

### Export DTOs

**File Path:** `back/src/SurveyApp.Application/DTOs/ExportDto.cs`

```csharp
public enum ExportFormat
{
    Csv,
    Excel,
    Json,
}

public class ExportRequest
{
    public Guid SurveyId { get; set; }
    public ExportFormat Format { get; set; }
    public ExportFilter? Filter { get; set; }
    public List<Guid>? QuestionIds { get; set; }
    public bool IncludeMetadata { get; set; }
    public bool IncludeIncomplete { get; set; }
    public string? TimezoneId { get; set; }
}

public class ExportFilter
{
    public DateRange? DateRange { get; set; }
    public string? RespondentEmail { get; set; }
    public bool? IsComplete { get; set; }
}

public class DateRange
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class ExportResult
{
    public byte[] Data { get; set; } = [];
    public string FileName { get; set; } = null!;
    public string ContentType { get; set; } = null!;
    public int TotalRows { get; set; }
}

public class ExportPreviewDto
{
    public Guid SurveyId { get; set; }
    public string SurveyTitle { get; set; } = null!;
    public int TotalResponses { get; set; }
    public int CompletedResponses { get; set; }
    public int IncompleteResponses { get; set; }
    public List<ExportColumnDto> Columns { get; set; } = [];
    public List<string> AvailableFormats { get; set; } = ["Csv", "Excel", "Json"];
}

public class ExportColumnDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Type { get; set; } = null!;
    public bool IsDefault { get; set; } = true;
}
```

---

### NPS DTOs

**File Path:** `back/src/SurveyApp.Application/DTOs/NpsDto.cs`

```csharp
public class NpsScoreDto
{
    public decimal Score { get; set; }                    // -100 to 100
    public int Promoters { get; set; }                    // Scores 9-10
    public int Passives { get; set; }                     // Scores 7-8
    public int Detractors { get; set; }                   // Scores 0-6
    public int TotalResponses { get; set; }
    public decimal PromoterPercentage { get; set; }
    public decimal PassivePercentage { get; set; }
    public decimal DetractorPercentage { get; set; }
    public string Category { get; set; } = null!;         // NeedsImprovement, Good, Great, Excellent
    public string CategoryDescription { get; set; } = null!;
}

public class NpsTrendDto
{
    public Guid SurveyId { get; set; }
    public List<NpsTrendPointDto> DataPoints { get; set; } = [];
    public decimal AverageScore { get; set; }
    public decimal ChangeFromPrevious { get; set; }
    public string TrendDirection { get; set; } = null!;   // Up, Down, Stable
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
}

public class NpsTrendPointDto
{
    public DateTime Date { get; set; }
    public decimal Score { get; set; }
    public int ResponseCount { get; set; }
    public int Promoters { get; set; }
    public int Passives { get; set; }
    public int Detractors { get; set; }
}

public class NpsSegmentDto
{
    public string SegmentName { get; set; } = null!;
    public string? SegmentValue { get; set; }
    public NpsScoreDto NpsScore { get; set; } = null!;
}

public class NpsBySegmentDto
{
    public Guid SurveyId { get; set; }
    public NpsScoreDto OverallScore { get; set; } = null!;
    public List<NpsSegmentDto> Segments { get; set; } = [];
    public string SegmentType { get; set; } = null!;
}

public class NpsQuestionDto
{
    public Guid QuestionId { get; set; }
    public string QuestionText { get; set; } = null!;
    public NpsQuestionType NpsType { get; set; }
    public NpsScoreDto Score { get; set; } = null!;
}

public class SurveyNpsSummaryDto
{
    public Guid SurveyId { get; set; }
    public string SurveyTitle { get; set; } = null!;
    public NpsScoreDto? OverallScore { get; set; }
    public List<NpsQuestionDto> Questions { get; set; } = [];
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}
```

---

## Commands

### CreateSurveyCommand

**File Path:** `back/src/SurveyApp.Application/Features/Surveys/Commands/CreateSurvey/CreateSurveyCommand.cs`

```csharp
public record CreateSurveyCommand : IRequest<Result<SurveyDto>>, INamespaceCommand
{
    public static NamespacePermission RequiredPermission => NamespacePermission.CreateSurveys;

    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public SurveyType Type { get; init; } = SurveyType.Classic;
    public CxMetricType? CxMetricType { get; init; }
    public string? WelcomeMessage { get; init; }
    public string? ThankYouMessage { get; init; }
    public bool IsAnonymous { get; init; }
    public int? MaxResponses { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public List<CreateQuestionDto> Questions { get; init; } = [];
    public string LanguageCode { get; init; } = "en";
}

public record CreateQuestionDto
{
    public string Text { get; init; } = string.Empty;
    public string? Description { get; init; }
    public QuestionType Type { get; init; }
    public bool IsRequired { get; init; }
    public int Order { get; init; }
    public QuestionSettingsDto? Settings { get; init; }
}
```

**Validator:** `back/src/SurveyApp.Application/Validators/Surveys/CreateSurveyCommandValidator.cs`

| Property        | Validation Rules                             |
| --------------- | -------------------------------------------- |
| Title           | NotEmpty, MinLength(3), MaxLength(200)       |
| Description     | MaxLength(2000)                              |
| WelcomeMessage  | MaxLength(1000)                              |
| ThankYouMessage | MaxLength(1000)                              |
| LanguageCode    | NotEmpty, Length(2-10), Must be supported    |
| MaxResponses    | GreaterThan(0) when present                  |
| StartDate       | LessThan(EndDate) when both present          |
| EndDate         | GreaterThan(UtcNow) when present             |
| Questions       | Each validated by CreateQuestionDtoValidator |

---

### UpdateSurveyCommand

**File Path:** `back/src/SurveyApp.Application/Features/Surveys/Commands/UpdateSurvey/UpdateSurveyCommand.cs`

```csharp
public record UpdateSurveyCommand : IRequest<Result<SurveyDto>>, INamespaceCommand
{
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;

    public Guid SurveyId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? WelcomeMessage { get; init; }
    public string? ThankYouMessage { get; init; }
    public bool AllowAnonymousResponses { get; init; }
    public bool AllowMultipleResponses { get; init; }
    public int? MaxResponses { get; init; }
    public DateTime? StartsAt { get; init; }
    public DateTime? EndsAt { get; init; }
    public string? LanguageCode { get; init; }
}
```

**Validator:** `back/src/SurveyApp.Application/Validators/Surveys/UpdateSurveyCommandValidator.cs`

| Property        | Validation Rules                       |
| --------------- | -------------------------------------- |
| SurveyId        | NotEmpty                               |
| Title           | NotEmpty, MinLength(3), MaxLength(200) |
| Description     | MaxLength(2000)                        |
| WelcomeMessage  | MaxLength(1000)                        |
| ThankYouMessage | MaxLength(1000)                        |
| MaxResponses    | GreaterThan(0) when present            |
| StartsAt        | LessThan(EndsAt) when both present     |

---

### PublishSurveyCommand

**File Path:** `back/src/SurveyApp.Application/Features/Surveys/Commands/PublishSurvey/PublishSurveyCommand.cs`

```csharp
public record PublishSurveyCommand(Guid SurveyId) : IRequest<Result<SurveyDto>>, INamespaceCommand
{
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;
}
```

---

### DuplicateSurveyCommand

**File Path:** `back/src/SurveyApp.Application/Features/Surveys/Commands/DuplicateSurvey/DuplicateSurveyCommand.cs`

```csharp
public record DuplicateSurveyCommand : IRequest<Result<SurveyDto>>
{
    public Guid SurveyId { get; init; }
    public string? NewTitle { get; init; }  // Optional, defaults to "(Copy)" suffix
}
```

---

### CloseSurveyCommand

**File Path:** `back/src/SurveyApp.Application/Features/Surveys/Commands/CloseSurvey/CloseSurveyCommand.cs`

```csharp
public record CloseSurveyCommand(Guid SurveyId) : IRequest<Result<SurveyDto>>, INamespaceCommand
{
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;
}
```

---

### DeleteSurveyCommand

**File Path:** `back/src/SurveyApp.Application/Features/Surveys/Commands/DeleteSurvey/DeleteSurveyCommand.cs`

```csharp
public record DeleteSurveyCommand(Guid SurveyId) : IRequest<Result<Unit>>, INamespaceCommand
{
    public static NamespacePermission RequiredPermission => NamespacePermission.DeleteSurveys;
}
```

---

### ExportResponsesCommand

**File Path:** `back/src/SurveyApp.Application/Features/Responses/Commands/ExportResponsesCommand.cs`

```csharp
public record ExportResponsesCommand : IRequest<Result<ExportResult>>
{
    public Guid SurveyId { get; init; }
    public ExportFormat Format { get; init; }
    public ExportFilter? Filter { get; init; }
    public List<Guid>? QuestionIds { get; init; }
    public bool IncludeMetadata { get; init; }
    public bool IncludeIncomplete { get; init; }
    public string? TimezoneId { get; init; }
}
```

**Validator:** `back/src/SurveyApp.Application/Validators/Responses/ExportResponsesCommandValidator.cs`

| Property               | Validation Rules                       |
| ---------------------- | -------------------------------------- |
| SurveyId               | NotEmpty                               |
| Format                 | IsInEnum                               |
| Filter.DateRange       | EndDate >= StartDate when both present |
| Filter.RespondentEmail | MaxLength(256)                         |
| TimezoneId             | Must be valid timezone ID              |
| QuestionIds            | Each must be non-empty GUID            |

---

### ApplyThemeToSurveyCommand

**File Path:** `back/src/SurveyApp.Application/Features/Themes/Commands/ApplyThemeToSurvey/ApplyThemeToSurveyCommand.cs`

```csharp
public record ApplyThemeToSurveyCommand : IRequest<Result<SurveyDto>>, INamespaceCommand
{
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;

    public Guid SurveyId { get; init; }
    public Guid? ThemeId { get; init; }           // null to remove theme
    public string? PresetThemeId { get; init; }
    public string? ThemeCustomizations { get; init; }
}
```

**Validator:** `back/src/SurveyApp.Application/Validators/Themes/ApplyThemeToSurveyCommandValidator.cs`

| Property | Validation Rules |
| -------- | ---------------- |
| SurveyId | NotEmpty         |
| ThemeId  | NotEmpty         |

---

## Queries

### GetSurveysQuery

**File Path:** `back/src/SurveyApp.Application/Features/Surveys/Queries/GetSurveys/GetSurveysQuery.cs`

```csharp
public record GetSurveysQuery : PagedQuery, IRequest<Result<PagedResponse<SurveyListItemDto>>>
{
    public SurveyStatus? Status { get; init; }
    public string? SearchTerm { get; init; }
    public string? SortBy { get; init; }
    public bool SortDescending { get; init; } = true;
}

// Base class
public abstract record PagedQuery : IPagedQuery
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
```

---

### GetSurveyByIdQuery

**File Path:** `back/src/SurveyApp.Application/Features/Surveys/Queries/GetSurveyById/GetSurveyByIdQuery.cs`

```csharp
public record GetSurveyByIdQuery(Guid SurveyId) : IRequest<Result<SurveyDetailsDto>>;
```

---

### GetPublicSurveyQuery

**File Path:** `back/src/SurveyApp.Application/Features/Surveys/Queries/GetPublicSurvey/GetPublicSurveyQuery.cs`

```csharp
public record GetPublicSurveyQuery(
    string ShareToken,
    string? LanguageCode = null
) : IRequest<Result<PublicSurveyDto>>;
```

---

### GetSurveyAnalyticsQuery

**File Path:** `back/src/SurveyApp.Application/Features/Surveys/Queries/GetSurveyAnalytics/GetSurveyAnalyticsQuery.cs`

```csharp
public record GetSurveyAnalyticsQuery(Guid SurveyId) : IRequest<Result<SurveyAnalyticsDto>>;
```

---

### GetExportPreviewQuery

**File Path:** `back/src/SurveyApp.Application/Features/Responses/Queries/GetExportPreviewQuery.cs`

```csharp
public record GetExportPreviewQuery(Guid SurveyId) : IRequest<Result<ExportPreviewDto>>;
```

---

### GetSurveyNpsQuery

**File Path:** `back/src/SurveyApp.Application/Features/Nps/Queries/GetSurveyNps/GetSurveyNpsQuery.cs`

```csharp
public record GetSurveyNpsQuery(Guid SurveyId) : IRequest<Result<SurveyNpsSummaryDto>>;
```

**Validator:** `back/src/SurveyApp.Application/Features/Nps/Queries/GetSurveyNps/GetSurveyNpsQueryValidator.cs`

| Property | Validation Rules |
| -------- | ---------------- |
| SurveyId | NotEmpty         |

---

### GetNpsTrendQuery

**File Path:** `back/src/SurveyApp.Application/Features/Nps/Queries/GetNpsTrend/GetNpsTrendQuery.cs`

```csharp
public record GetNpsTrendQuery : IRequest<Result<NpsTrendDto>>
{
    public Guid SurveyId { get; init; }
    public DateTime FromDate { get; init; }
    public DateTime ToDate { get; init; }
    public NpsTrendGroupBy GroupBy { get; init; } = NpsTrendGroupBy.Week;
}
```

**Validator:** `back/src/SurveyApp.Application/Features/Nps/Queries/GetNpsTrend/GetNpsTrendQueryValidator.cs`

| Property  | Validation Rules                  |
| --------- | --------------------------------- |
| SurveyId  | NotEmpty                          |
| FromDate  | LessThan(ToDate)                  |
| ToDate    | LessThanOrEqualTo(UtcNow + 1 day) |
| DateRange | Maximum 365 days                  |

---

### GetQuestionNpsQuery

**File Path:** `back/src/SurveyApp.Application/Features/Nps/Queries/GetQuestionNps/GetQuestionNpsQuery.cs`

```csharp
public record GetQuestionNpsQuery(Guid SurveyId, Guid QuestionId) : IRequest<Result<NpsScoreDto>>;
```

**Validator:** `back/src/SurveyApp.Application/Features/Nps/Queries/GetQuestionNps/GetQuestionNpsQueryValidator.cs`

| Property   | Validation Rules |
| ---------- | ---------------- |
| SurveyId   | NotEmpty         |
| QuestionId | NotEmpty         |

---

## Enums

### SurveyStatus

**File Path:** `back/src/SurveyApp.Domain/Enums/SurveyStatus.cs`

```csharp
public enum SurveyStatus
{
    Draft = 0,
    Published = 1,
    Closed = 2,
    Archived = 3
}
```

### SurveyType

**File Path:** `back/src/SurveyApp.Domain/Enums/SurveyType.cs`

```csharp
public enum SurveyType
{
    Classic = 0,
    CustomerExperience = 1,
    Conversational = 2,
    Research = 3,
    Assessment360 = 4,
}
```

### CxMetricType

**File Path:** `back/src/SurveyApp.Domain/Enums/CxMetricType.cs`

```csharp
public enum CxMetricType
{
    NPS = 0,   // Net Promoter Score (0-10)
    CES = 1,   // Customer Effort Score (1-7)
    CSAT = 2,  // Customer Satisfaction (1-5)
}
```

### QuestionType

**File Path:** `back/src/SurveyApp.Domain/Enums/QuestionType.cs`

```csharp
public enum QuestionType
{
    SingleChoice = 0,
    MultipleChoice = 1,
    Text = 2,
    LongText = 3,
    Rating = 4,
    Scale = 5,
    Matrix = 6,
    Date = 7,
    DateTime = 71,
    FileUpload = 8,
    YesNo = 9,
    Dropdown = 10,
    NPS = 11,
    Checkbox = 12,
    Number = 13,
    ShortText = 14,
    Email = 15,
    Phone = 16,
    Url = 17,
    Ranking = 18,
}
```

### RatingStyle

**File Path:** `back/src/SurveyApp.Domain/Enums/RatingStyle.cs`

```csharp
public enum RatingStyle
{
    Stars = 0,
    Hearts = 1,
    Thumbs = 2,
    Smileys = 3,
    Numbers = 4,
}
```

### YesNoStyle

**File Path:** `back/src/SurveyApp.Domain/Enums/YesNoStyle.cs`

```csharp
public enum YesNoStyle
{
    Text = 0,
    Thumbs = 1,
    Toggle = 2,
    CheckX = 3,
}
```

### NpsQuestionType

**File Path:** `back/src/SurveyApp.Domain/Enums/NpsQuestionType.cs`

```csharp
public enum NpsQuestionType
{
    Standard = 0,
    CustomerSatisfaction = 1,
    CustomerEffort = 2,
}
```

### NpsTrendGroupBy

**File Path:** `back/src/SurveyApp.Application/Services/INpsService.cs`

```csharp
public enum NpsTrendGroupBy
{
    Day,
    Week,
    Month,
}
```

### ExportFormat

**File Path:** `back/src/SurveyApp.Application/DTOs/ExportDto.cs`

```csharp
public enum ExportFormat
{
    Csv,
    Excel,
    Json,
}
```

---

## Validators

### PaginationDefaults

**File Path:** `back/src/SurveyApp.Application/Common/PaginationDefaults.cs`

```csharp
public static class PaginationDefaults
{
    public const int DefaultPageNumber = 1;
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 100;
    public const int MinPageSize = 1;
}
```

### PagedQueryValidator

**File Path:** `back/src/SurveyApp.Application/Validators/Common/PagedQueryValidator.cs`

Base validator for all paginated queries:

```csharp
public abstract class PagedQueryValidator<T> : LocalizedValidator<T>
    where T : PagedQuery
{
    protected void AddPaginationRules()
    {
        RuleFor(x => x.PageNumber).ValidPageNumber();  // >= 1
        RuleFor(x => x.PageSize).ValidPageSize();       // 1-100
    }
}
```

---

## Summary

This documentation covers all aspects of the Survey API:

- **8 DTOs** for survey data representation
- **8 Commands** for write operations
- **8 Queries** for read operations
- **10 Enums** for type safety
- **6 Validators** with FluentValidation rules

All files are located under `/Users/faridasgarli/Desktop/Survey/back/src/`.
