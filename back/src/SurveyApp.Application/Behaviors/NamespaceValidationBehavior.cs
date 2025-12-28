using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Behaviors;

/// <summary>
/// MediatR pipeline behavior that validates namespace context and permissions
/// for commands implementing INamespaceCommand.
///
/// This eliminates ~25 lines of boilerplate from each handler by:
/// 1. Validating namespace context is set
/// 2. Checking user is authenticated
/// 3. Loading namespace from repository
/// 4. Verifying user has required permission
///
/// If validation passes, the context is made available via INamespaceCommandContext.
/// If validation fails, returns Result.Failure without calling the handler.
/// </summary>
public class NamespaceValidationBehavior<TRequest, TResponse>(
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService,
    INamespaceRepository namespaceRepository,
    INamespaceCommandContext commandContext
) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken
    )
    {
        // Only process commands that implement INamespaceCommand
        if (request is not INamespaceCommand)
        {
            return await next();
        }

        // Get the required permission from the command type
        var commandType = request.GetType();
        var permissionProperty = commandType
            .GetInterfaces()
            .First(i => i == typeof(INamespaceCommand))
            .GetProperty(nameof(INamespaceCommand.RequiredPermission));

        // Use reflection to get the static property value
        var requiredPermission = GetRequiredPermission(commandType);

        // Validate namespace context
        var namespaceId = namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return CreateFailureResult("Errors.NamespaceRequired", "NAMESPACE_REQUIRED");
        }

        // Validate user authentication
        var userId = currentUserService.UserId;
        if (!userId.HasValue)
        {
            return CreateFailureResult("Errors.UserNotAuthenticated", "UNAUTHORIZED");
        }

        // Load namespace
        var @namespace = await namespaceRepository.GetByIdAsync(
            namespaceId.Value,
            cancellationToken
        );
        if (@namespace == null)
        {
            return CreateFailureResult("Errors.NamespaceNotFound", "NAMESPACE_NOT_FOUND");
        }

        // Check permission
        var membership = @namespace.Memberships.FirstOrDefault(m => m.UserId == userId.Value);
        if (membership == null)
        {
            return CreateFailureResult("Errors.NotNamespaceMember", "NOT_A_MEMBER");
        }

        if (!membership.HasPermission(requiredPermission))
        {
            return CreateFailureResult(
                $"Errors.InsufficientPermission|{requiredPermission}",
                "FORBIDDEN"
            );
        }

        // Set the validated context for the handler to use
        commandContext.SetContext(
            new NamespaceCommandContext
            {
                NamespaceId = namespaceId.Value,
                UserId = userId.Value,
                Membership = membership,
            }
        );

        // Continue to handler
        return await next();
    }

    private static NamespacePermission GetRequiredPermission(Type commandType)
    {
        // The RequiredPermission is a static abstract property on INamespaceCommand
        // We need to get it from the concrete command type
        var property = commandType.GetProperty(
            nameof(INamespaceCommand.RequiredPermission),
            System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static
        );

        if (property != null)
        {
            return (NamespacePermission)property.GetValue(null)!;
        }

        // Fallback: try to find it via interface map
        var interfaceMap = commandType.GetInterfaceMap(typeof(INamespaceCommand));
        var methodIndex = Array.FindIndex(
            interfaceMap.InterfaceMethods,
            m => m.Name == "get_RequiredPermission"
        );

        if (methodIndex >= 0)
        {
            var targetMethod = interfaceMap.TargetMethods[methodIndex];
            return (NamespacePermission)targetMethod.Invoke(null, null)!;
        }

        // Default to view permission if unable to determine
        return NamespacePermission.ViewSurveys;
    }

    private static TResponse CreateFailureResult(string error, string errorCode)
    {
        var responseType = typeof(TResponse);

        // Handle Result<T> types
        if (
            responseType.IsGenericType
            && responseType.GetGenericTypeDefinition() == typeof(Result<>)
        )
        {
            var resultType = responseType.GetGenericArguments()[0];
            var failureMethod = typeof(Result<>)
                .MakeGenericType(resultType)
                .GetMethod(
                    nameof(Result<object>.Failure),
                    new[] { typeof(string), typeof(string) }
                );

            return (TResponse)failureMethod!.Invoke(null, new object[] { error, errorCode })!;
        }

        // Handle non-generic Result type
        if (responseType == typeof(Result))
        {
            return (TResponse)(object)Result.Failure(error, errorCode);
        }

        throw new InvalidOperationException(
            $"Cannot create failure result for response type {responseType.Name}. "
                + "INamespaceCommand should only be used with Result<T> or Result response types."
        );
    }
}
