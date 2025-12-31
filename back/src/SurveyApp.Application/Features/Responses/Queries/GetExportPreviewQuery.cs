using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Responses.Queries;

/// <summary>
/// Query to get export preview information.
/// </summary>
public record GetExportPreviewQuery : IRequest<Result<ExportPreviewDto>>
{
    /// <summary>
    /// The survey ID to get export preview for.
    /// </summary>
    public Guid SurveyId { get; init; }
}

/// <summary>
/// Handler for getting export preview information.
/// </summary>
public class GetExportPreviewQueryHandler(
    ISurveyRepository surveyRepository,
    IExportService exportService,
    INamespaceContext namespaceContext
) : IRequestHandler<GetExportPreviewQuery, Result<ExportPreviewDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IExportService _exportService = exportService;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<ExportPreviewDto>> Handle(
        GetExportPreviewQuery request,
        CancellationToken cancellationToken
    )
    {
        // Verify survey exists and belongs to current namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);

        if (survey == null)
        {
            return Result<ExportPreviewDto>.Failure("Errors.SurveyNotFound", "SURVEY_NOT_FOUND");
        }

        if (survey.NamespaceId != _namespaceContext.CurrentNamespaceId)
        {
            return Result<ExportPreviewDto>.Failure(
                "Survey not found in current namespace.",
                "SURVEY_NOT_FOUND"
            );
        }

        try
        {
            var preview = await _exportService.GetExportPreviewAsync(
                request.SurveyId,
                cancellationToken
            );
            return Result<ExportPreviewDto>.Success(preview);
        }
        catch (Exception ex)
        {
            return Result<ExportPreviewDto>.Failure(
                $"Failed to get export preview: {ex.Message}",
                "PREVIEW_FAILED"
            );
        }
    }
}
