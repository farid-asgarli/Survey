# Handler Refactoring Guide

This document explains the MediatR pipeline behavior pattern used to eliminate boilerplate in command handlers.

## The Problem

Every command handler had 25-30 lines of repeated namespace/permission validation:

```csharp
// BEFORE: Every handler started with this boilerplate
var namespaceId = _namespaceContext.CurrentNamespaceId;
if (!namespaceId.HasValue)
    return Result<T>.Failure("Namespace context is required.");

var @namespace = await _namespaceRepository.GetByIdAsync(namespaceId.Value, ct);
if (@namespace == null)
    return Result<T>.Failure("Namespace not found.");

var userId = _currentUserService.UserId;
if (!userId.HasValue)
    return Result<T>.Failure("User not authenticated.");

var membership = @namespace.Memberships.FirstOrDefault(m => m.UserId == userId.Value);
if (membership == null || !membership.HasPermission(NamespacePermission.XXX))
    return Result<T>.Failure("Permission denied.");
```

## The Solution

A MediatR pipeline behavior (`NamespaceValidationBehavior`) that runs automatically before any command implementing `INamespaceCommand`.

### Step 1: Mark Your Command

```csharp
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;

public record CreateSurveyCommand : IRequest<Result<SurveyDto>>, INamespaceCommand
{
    // Specify required permission
    public static NamespacePermission RequiredPermission => NamespacePermission.CreateSurveys;

    public string Title { get; init; } = string.Empty;
    // ... other properties
}
```

### Step 2: Inject INamespaceCommandContext in Handler

```csharp
public class CreateSurveyCommandHandler(
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,  // <-- Inject this
    IMapper mapper
) : IRequestHandler<CreateSurveyCommand, Result<SurveyDto>>
{
    public async Task<Result<SurveyDto>> Handle(
        CreateSurveyCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is pre-validated by the pipeline!
        var ctx = _commandContext.Context!;

        // Use ctx.NamespaceId, ctx.UserId, ctx.Membership directly
        var survey = Survey.Create(ctx.NamespaceId, request.Title, ctx.UserId);

        // ... business logic
    }
}
```

## Available Context Properties

| Property          | Type                  | Description                    |
| ----------------- | --------------------- | ------------------------------ |
| `ctx.NamespaceId` | `Guid`                | The validated namespace ID     |
| `ctx.UserId`      | `Guid`                | The authenticated user ID      |
| `ctx.Membership`  | `NamespaceMembership` | User's membership in namespace |

## Available Permissions

From `SurveyApp.Domain.Entities.NamespacePermission`:

- `ViewSurveys`
- `CreateSurveys`
- `ManageSurveys`
- `ManageSettings`
- `ManageMembers`
- `Owner`

## Migration Checklist

To migrate an existing handler:

1. [ ] Add `INamespaceCommand` to the command record
2. [ ] Add `static NamespacePermission RequiredPermission` property
3. [ ] Replace `INamespaceContext`, `ICurrentUserService`, `INamespaceRepository` with `INamespaceCommandContext`
4. [ ] Remove namespace/user/permission validation code
5. [ ] Use `_commandContext.Context!` for NamespaceId/UserId

## Example Migration

See these refactored handlers:

- `CreateSurveyCommand` / `CreateSurveyCommandHandler`
- `CreateTemplateCommand` / `CreateTemplateCommandHandler`
- `CreateThemeCommand` / `CreateThemeCommandHandler`

## Files Created

| File                                       | Purpose                            |
| ------------------------------------------ | ---------------------------------- |
| `Common/Interfaces/INamespaceCommand.cs`   | Marker interface + context classes |
| `Behaviors/NamespaceValidationBehavior.cs` | Pipeline behavior                  |

## Benefits

- **~25 lines saved** per handler
- **Consistent error messages** across all commands
- **Single point of change** for auth logic
- **Cleaner handlers** - focus on business logic only
