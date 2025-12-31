# 🔍 Backend Analysis Report: Security Vulnerabilities, Architecture Issues, and Improvements

Based on my thorough analysis of the backend codebase, here are the findings organized by priority:

---

## 🚨 CRITICAL Security Issues

### 1. **Wrong Permission for DeleteResponse** - DeleteResponseCommand.cs

```csharp
public static NamespacePermission RequiredPermission => NamespacePermission.ViewResponses;
```

**Issue:** Delete operation requires only `ViewResponses` permission - users who can only _view_ responses can _delete_ them.

**Fix:** Change to `ManageResponses` or create a `DeleteResponses` permission.

---

### 2. **Race Condition in MaxResponses Check** - SubmitSurveyResponseCommandHandler.cs

```csharp
if (survey.MaxResponses.HasValue)
{
    var responseCount = await _responseRepository.GetResponseCountAsync(survey.Id, cancellationToken);
    if (responseCount >= survey.MaxResponses.Value)
    {
        return Result<SurveyResponseDto>.Failure("Application.Survey.MaxResponsesReached");
    }
}
// ... later: await _responseRepository.AddAsync(response, cancellationToken);
```

**Issue:** TOCTOU (Time-of-check to Time-of-use) race condition. Multiple concurrent submissions can exceed `MaxResponses` limit.

**Fix:** Use a database-level constraint or distributed lock:

```csharp
// Option 1: Use optimistic concurrency with a version column
// Option 2: Use a database constraint
// Option 3: Wrap in a distributed lock using Redis or DB lock
```

---

## ⚠️ HIGH Priority Issues

### 3. **IDOR in Email Distribution Operations** - EmailDistributionsController.cs

```csharp
[HttpPost("{distId:guid}/schedule")]
public async Task<IActionResult> ScheduleDistribution(
    Guid surveyId,    // ← Ignored!
    Guid distId,
    [FromBody] ScheduleDistributionDto request)
{
    var command = new ScheduleDistributionCommand
    {
        DistributionId = distId,  // Only distId used, surveyId not validated
        ScheduledAt = request.ScheduledAt,
    };
```

**Issue:** `surveyId` from URL is not validated against the distribution. Attacker could manipulate distributions from other surveys.

**Fix:** Either:

1. Remove `surveyId` from route (use `/api/distributions/{distId}/schedule`)
2. Add `SurveyId` to command and validate in handler

**Same issue in:** `SendDistribution`, `CancelDistribution`, `DeleteDistribution`

---

### 4. **Missing File Content Validation (Polyglot Attack)** - FilesController.cs

```csharp
// Validate content type
if (!AllowedImageTypes.Contains(file.ContentType))  // ← MIME type can be spoofed!

// Validate extension
var extension = Path.GetExtension(file.FileName);   // ← Extension can be faked
```

**Issue:** Only checks MIME type header and file extension, not actual file content. Malicious files can be uploaded with fake headers.

**Fix:** Add magic byte (file signature) validation:

```csharp
private static readonly Dictionary<string, byte[]> FileSignatures = new()
{
    { ".jpg", new byte[] { 0xFF, 0xD8, 0xFF } },
    { ".png", new byte[] { 0x89, 0x50, 0x4E, 0x47 } },
    { ".gif", new byte[] { 0x47, 0x49, 0x46 } },
};
```

**Note:** SVG is especially dangerous - it can contain JavaScript for stored XSS.

---

### 5. **Missing Class-Level Authorization** - ResponsesController.cs

```csharp
[ApiController]
[Route("api/[controller]")]
public class ResponsesController(IMediator mediator) : ControllerBase  // ← No [Authorize]!
```

**Issue:** No class-level `[Authorize]` attribute. Individual endpoints have it, but new endpoints could accidentally be left unprotected.

**Fix:** Add `[Authorize]` at class level for consistency.

---

### 6. **Email Tracking Endpoints Without Rate Limiting** - EmailDistributionsController.cs

```csharp
[HttpGet("open/{token}")]
public async Task<IActionResult> TrackOpen(string token)
{
    await _mediator.Send(new TrackOpenCommand(token));
    // Return a 1x1 transparent GIF
```

**Issue:** No rate limiting on anonymous tracking endpoints. Can be abused to:

- Enumerate valid tracking tokens
- Artificially inflate open/click metrics
- DoS attack via excessive requests

**Fix:** Add rate limiting middleware for `/api/track/*` endpoints.

---

### 7. **Public File Access Without Ownership Check** - FilesController.cs

```csharp
[HttpGet("{fileId}/download")]
[AllowAnonymous] // Allow public access to files (for survey display)
public async Task<IActionResult> DownloadFile(string fileId, ...)
```

**Issue:** Any file ID can be accessed if known, potentially exposing private survey assets.

**Fix:** Either:

1. Associate files with surveys and check survey visibility
2. Use unpredictable signed URLs with expiration

---

## 📊 MEDIUM Priority Issues

### 8. **IP Address Exposed in DTO** - SurveyResponseDto.cs

```csharp
public class SurveyResponseDto
{
    // ...
    public string? IpAddress { get; set; }  // ← PII exposed
```

**Issue:** IP addresses are PII under GDPR. Exposing to all users with `ViewResponses` permission may violate privacy regulations.

**Fix:** Create separate DTOs for analytics use cases with explicit consent.

---

### 9. **Namespace OwnerId Exposed** - NamespaceDto.cs

```csharp
public Guid? OwnerId { get; set; }  // ← Internal relationship exposed
```

**Issue:** Exposes internal user relationships unnecessarily.

---

### 10. **Category Parameter Path Traversal Risk** - FilesController.cs

The `category` query parameter is used in filename generation but not sanitized for path traversal characters.

---

## 🔄 Code Duplication Issues

### 11. **Duplicated `CreateQuestionSettings` Method**

Found in 4 handlers with identical or near-identical code:

| File                                | Lines   |
| ----------------------------------- | ------- |
| CreateSurveyCommandHandler.cs       | 123-129 |
| CreateQuestionCommandHandler.cs     | 99-105  |
| UpdateQuestionCommandHandler.cs     | 99-105  |
| BatchSyncQuestionsCommandHandler.cs | 276-281 |

**Fix:** Extract to a shared `IQuestionSettingsMapper` service.

---

### 12. **Duplicated Survey Validation Pattern**

Same pattern in 13+ handlers:

```csharp
if (survey == null || survey.NamespaceId != ctx.NamespaceId)
{
    return Result<...>.Failure("Handler.SurveyNotFound");
}
```

**Fix:** Create `ISurveyAuthorizationService` or extend `NamespaceValidationBehavior` to validate entity ownership.

---

### 13. **Duplicated Draft Status Check**

Same pattern in 6+ handlers:

```csharp
if (survey.Status != SurveyStatus.Draft)
{
    return Result<...>.Failure("Errors.OnlyDraftSurveysEditable");
}
```

**Note:** Domain has `ThrowIfNotEditable()` but handlers duplicate the check at the application layer.

---

## 🏗️ Architecture Recommendations

### 14. **Mixed Exception Types in Domain**

Domain throws inconsistent exception types:

- `DomainException` (proper domain exception)
- `InvalidOperationException`
- `ArgumentException`

**Locations:**

- LanguageCode.cs - `ArgumentException`
- Email.cs - `ArgumentException`
- Domain services using `InvalidOperationException`

**Fix:** Standardize on `DomainException` for business rule violations.

---

### 15. **No Generic Repository Base**

Each repository defines its own `GetByIdAsync`, `AddAsync`, `Update`, `Delete` methods. Consider a `IRepository<T>` base interface.

---

### 16. **Missing Specification Pattern**

Complex query logic is embedded in repositories. Consider Ardalis.Specification for complex filters.

---

### 17. **No Outbox Pattern for Domain Events**

Domain events use `AddDomainEvent()` but there's no outbox pattern for reliable delivery if the app crashes after DB commit.

---

## ✅ Positive Patterns (Already Done Well)

1. **Rich Domain Models** - Survey entity (863 lines) has proper encapsulation with behavior
2. **Result Pattern** - Clean success/failure handling without exceptions
3. **MediatR Pipeline Behaviors** - Good separation of cross-cutting concerns
4. **Private constructors with factory methods** - Proper encapsulation
5. **CQRS separation** - Commands and queries properly separated
6. **Namespace Permission System** - Well-implemented via `INamespaceCommand` + `NamespaceValidationBehavior`
7. **Global Exception Handler** - ExceptionHandlingMiddleware.cs properly maps exceptions

---

## 📋 Recommended Action Items (Priority Order)

| #   | Issue                                              | Effort | Impact   |
| --- | -------------------------------------------------- | ------ | -------- |
| 1   | Fix DeleteResponse permission                      | Low    | Critical |
| 2   | Add MaxResponses race condition fix                | Medium | Critical |
| 3   | Add surveyId validation in distribution commands   | Low    | High     |
| 4   | Add file magic byte validation                     | Medium | High     |
| 5   | Add rate limiting on tracking endpoints            | Medium | High     |
| 6   | Add class-level [Authorize] on ResponsesController | Low    | Medium   |
| 7   | Extract `CreateQuestionSettings` to shared service | Low    | Medium   |
| 8   | Remove IP from public DTOs                         | Low    | Medium   |
| 9   | Standardize domain exceptions                      | Medium | Low      |

Would you like me to implement any of these fixes?
