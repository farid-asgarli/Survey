using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.SurveyLinks.Queries.GetLinkByToken;

/// <summary>
/// Handler for getting a survey link by its token.
/// </summary>
public class GetLinkByTokenQueryHandler(
    ISurveyLinkRepository surveyLinkRepository,
    ISurveyRepository surveyRepository
) : IRequestHandler<GetLinkByTokenQuery, Result<LinkByTokenResult>>
{
    private readonly ISurveyLinkRepository _surveyLinkRepository = surveyLinkRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;

    public async Task<Result<LinkByTokenResult>> Handle(
        GetLinkByTokenQuery request,
        CancellationToken cancellationToken
    )
    {
        // Get the link by token
        var link = await _surveyLinkRepository.GetByTokenAsync(request.Token, cancellationToken);
        if (link == null)
        {
            return Result<LinkByTokenResult>.Failure("Invalid survey link.");
        }

        // Get the survey
        var survey = await _surveyRepository.GetByIdAsync(link.SurveyId, cancellationToken);
        if (survey == null)
        {
            return Result<LinkByTokenResult>.Failure("Survey not found.");
        }

        // Check validity
        string? invalidReason = null;
        bool isValid = true;

        if (!link.IsActive)
        {
            isValid = false;
            invalidReason = "This survey link has been deactivated.";
        }
        else if (link.ExpiresAt.HasValue && DateTime.UtcNow > link.ExpiresAt.Value)
        {
            isValid = false;
            invalidReason = "This survey link has expired.";
        }
        else if (link.MaxUses.HasValue && link.UsageCount >= link.MaxUses.Value)
        {
            isValid = false;
            invalidReason = "This survey link has reached its maximum usage limit.";
        }
        else if (!survey.CanAcceptResponses)
        {
            isValid = false;
            invalidReason = "This survey is not currently accepting responses.";
        }

        return Result<LinkByTokenResult>.Success(
            new LinkByTokenResult
            {
                LinkId = link.Id,
                SurveyId = survey.Id,
                SurveyTitle = survey.Title,
                IsValid = isValid,
                InvalidReason = invalidReason,
                RequiresPassword = !string.IsNullOrEmpty(link.Password),
            }
        );
    }
}
