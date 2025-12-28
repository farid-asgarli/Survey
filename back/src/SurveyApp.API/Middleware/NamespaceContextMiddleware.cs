using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.API.Middleware;

public class NamespaceContextMiddleware(RequestDelegate next)
{
    private readonly RequestDelegate _next = next;
    private const string NamespaceHeader = "X-Namespace-Id";
    private const string NamespaceSlugHeader = "X-Namespace-Slug";

    public async Task InvokeAsync(
        HttpContext context,
        INamespaceContext namespaceContext,
        INamespaceRepository namespaceRepository
    )
    {
        // Try to get namespace from header
        if (context.Request.Headers.TryGetValue(NamespaceHeader, out var namespaceIdHeader))
        {
            if (Guid.TryParse(namespaceIdHeader, out var namespaceId))
            {
                var ns = await namespaceRepository.GetByIdAsync(namespaceId);
                if (ns != null)
                {
                    namespaceContext.SetNamespaceId(ns.Id);
                }
            }
        }
        else if (
            context.Request.Headers.TryGetValue(NamespaceSlugHeader, out var namespaceSlugHeader)
        )
        {
            var slug = namespaceSlugHeader.ToString();
            if (!string.IsNullOrEmpty(slug))
            {
                var ns = await namespaceRepository.GetBySlugAsync(slug);
                if (ns != null)
                {
                    namespaceContext.SetNamespaceId(ns.Id);
                }
            }
        }

        // Also try route parameter
        if (context.Request.RouteValues.TryGetValue("namespaceId", out var routeNamespaceId))
        {
            if (Guid.TryParse(routeNamespaceId?.ToString(), out var namespaceId))
            {
                var ns = await namespaceRepository.GetByIdAsync(namespaceId);
                if (ns != null)
                {
                    namespaceContext.SetNamespaceId(ns.Id);
                }
            }
        }

        await _next(context);
    }
}

public static class NamespaceContextMiddlewareExtensions
{
    public static IApplicationBuilder UseNamespaceContext(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<NamespaceContextMiddleware>();
    }
}
