using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Responses.Commands.BulkDeleteResponses;

/// <summary>
/// Command to bulk delete multiple responses.
/// </summary>
public record BulkDeleteResponsesCommand
    : IRequest<Result<BulkDeleteResponsesResult>>,
        INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.ViewResponses;

    /// <summary>
    /// The survey ID (for authorization purposes).
    /// </summary>
    public Guid SurveyId { get; init; }

    /// <summary>
    /// The IDs of the responses to delete.
    /// </summary>
    public List<Guid> ResponseIds { get; init; } = [];
}

/// <summary>
/// Result of the bulk delete operation.
/// </summary>
public record BulkDeleteResponsesResult
{
    /// <summary>
    /// Number of responses successfully deleted.
    /// </summary>
    public int DeletedCount { get; init; }

    /// <summary>
    /// IDs of responses that failed to delete.
    /// </summary>
    public List<Guid> FailedIds { get; init; } = [];

    /// <summary>
    /// Whether all deletions were successful.
    /// </summary>
    public bool IsComplete => FailedIds.Count == 0;
}
