using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Common.Interfaces;

/// <summary>
/// Marker interface for commands that require namespace context and permission validation.
/// Commands implementing this interface will have namespace/user validation applied automatically
/// via the NamespaceValidationBehavior pipeline.
/// </summary>
public interface INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    static abstract NamespacePermission RequiredPermission { get; }
}

/// <summary>
/// Context object containing validated namespace and user information.
/// Available via INamespaceCommandContext after validation passes.
/// </summary>
public class NamespaceCommandContext
{
    /// <summary>
    /// The validated namespace ID.
    /// </summary>
    public Guid NamespaceId { get; init; }

    /// <summary>
    /// The authenticated user ID.
    /// </summary>
    public Guid UserId { get; init; }

    /// <summary>
    /// The namespace membership for the current user.
    /// </summary>
    public Domain.Entities.NamespaceMembership Membership { get; init; } = null!;
}

/// <summary>
/// Provides access to the validated namespace context.
/// Scoped lifetime - set by NamespaceValidationBehavior, read by handlers.
/// </summary>
public interface INamespaceCommandContext
{
    /// <summary>
    /// The validated namespace context. Null if validation hasn't run yet.
    /// </summary>
    NamespaceCommandContext? Context { get; }

    /// <summary>
    /// Sets the context (used by the pipeline behavior).
    /// </summary>
    void SetContext(NamespaceCommandContext context);
}

/// <summary>
/// Default implementation of INamespaceCommandContext.
/// Registered as scoped in DI.
/// </summary>
public class NamespaceCommandContextAccessor : INamespaceCommandContext
{
    public NamespaceCommandContext? Context { get; private set; }

    public void SetContext(NamespaceCommandContext context)
    {
        Context = context;
    }
}
