using System.Threading.RateLimiting;

namespace SurveyApp.API.Extensions;

/// <summary>
/// Extension methods for configuring rate limiting.
/// </summary>
public static class RateLimitingExtensions
{
    /// <summary>
    /// Adds rate limiting services with predefined policies.
    /// </summary>
    public static IServiceCollection AddRateLimitingPolicies(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.AddPolicy("fixed", CreateFixedWindowPolicy);
            options.AddPolicy("per-namespace", CreatePerNamespacePolicy);
            options.AddPolicy("auth", CreateAuthPolicy);
            options.AddPolicy("tracking", CreateTrackingPolicy);
        });

        return services;
    }

    private static RateLimitPartition<string> CreateFixedWindowPolicy(HttpContext httpContext)
    {
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 10,
            }
        );
    }

    private static RateLimitPartition<string> CreatePerNamespacePolicy(HttpContext httpContext)
    {
        return RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: httpContext.Request.Headers["X-Namespace-Id"].ToString() ?? "default",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 1000,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 4,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 20,
            }
        );
    }

    private static RateLimitPartition<string> CreateAuthPolicy(HttpContext httpContext)
    {
        return RateLimitPartition.GetTokenBucketLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new TokenBucketRateLimiterOptions
            {
                TokenLimit = 10,
                ReplenishmentPeriod = TimeSpan.FromMinutes(1),
                TokensPerPeriod = 10,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 5,
            }
        );
    }

    private static RateLimitPartition<string> CreateTrackingPolicy(HttpContext httpContext)
    {
        return RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 6,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 5,
            }
        );
    }
}
