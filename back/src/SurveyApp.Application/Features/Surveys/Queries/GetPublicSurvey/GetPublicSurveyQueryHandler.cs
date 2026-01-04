using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.Specifications;
using SurveyApp.Domain.Specifications.Surveys;

namespace SurveyApp.Application.Features.Surveys.Queries.GetPublicSurvey;

public class GetPublicSurveyQueryHandler(
    ISpecificationRepository<Survey> surveySpecRepository,
    ISurveyRepository surveyRepository,
    ISurveyLinkRepository surveyLinkRepository,
    IMapper mapper
) : IRequestHandler<GetPublicSurveyQuery, Result<PublicSurveyDto>>
{
    private readonly ISpecificationRepository<Survey> _surveySpecRepository = surveySpecRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly ISurveyLinkRepository _surveyLinkRepository = surveyLinkRepository;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<PublicSurveyDto>> Handle(
        GetPublicSurveyQuery request,
        CancellationToken cancellationToken
    )
    {
        // First, try to find the survey by its AccessToken (direct share token)
        var spec = new SurveyByAccessTokenSpec(request.ShareToken, includeTheme: true);
        var survey = await _surveySpecRepository.FirstOrDefaultAsync(spec, cancellationToken);

        // If not found, check if it's a SurveyLink token
        if (survey == null)
        {
            var surveyLink = await _surveyLinkRepository.GetByTokenAsync(
                request.ShareToken,
                cancellationToken
            );

            if (surveyLink != null)
            {
                // Use the domain's IsValid() method for comprehensive validation
                if (!surveyLink.IsValid())
                {
                    // Provide specific error messages for different failure reasons
                    if (!surveyLink.IsActive)
                    {
                        return Result<PublicSurveyDto>.Failure(
                            "Application.SurveyLink.LinkDeactivated"
                        );
                    }

                    if (
                        surveyLink.ExpiresAt.HasValue
                        && DateTime.UtcNow > surveyLink.ExpiresAt.Value
                    )
                    {
                        return Result<PublicSurveyDto>.Failure("Errors.SurveyLinkExpired");
                    }

                    // Check for unique (one-time) link that was already used
                    if (
                        surveyLink.Type == Domain.Enums.SurveyLinkType.Unique
                        && surveyLink.UsageCount >= 1
                    )
                    {
                        return Result<PublicSurveyDto>.Failure(
                            "Application.SurveyLink.LinkAlreadyUsed"
                        );
                    }

                    // Check for max uses reached (for non-unique links with limits)
                    if (
                        surveyLink.MaxUses.HasValue
                        && surveyLink.UsageCount >= surveyLink.MaxUses.Value
                    )
                    {
                        return Result<PublicSurveyDto>.Failure(
                            "Application.SurveyLink.MaxUsageReached"
                        );
                    }

                    // Fallback for any other invalid state
                    return Result<PublicSurveyDto>.Failure("Application.SurveyLink.LinkInvalid");
                }

                // Get the survey associated with this link
                var publicSpec = new SurveyForPublicSpec(surveyLink.SurveyId);
                survey = await _surveySpecRepository.FirstOrDefaultAsync(
                    publicSpec,
                    cancellationToken
                );
            }
        }

        if (survey == null)
        {
            return Result<PublicSurveyDto>.NotFound("Errors.SurveyNotFound");
        }

        // Check if survey is accepting responses
        if (!survey.IsAcceptingResponses)
        {
            return Result<PublicSurveyDto>.Failure(
                "This survey is not currently accepting responses."
            );
        }

        // Determine the language to use
        var languageCode = request.LanguageCode ?? survey.DefaultLanguage;

        var dto = new PublicSurveyDto
        {
            Id = survey.Id,
            Title = survey.GetLocalizedTitle(languageCode),
            Description = survey.GetLocalizedDescription(languageCode),
            WelcomeMessage = survey.GetLocalizedWelcomeMessage(languageCode),
            ThankYouMessage = survey.GetLocalizedThankYouMessage(languageCode),
            IsAnonymous = survey.IsAnonymous,
            Language = languageCode,
            AvailableLanguages = survey.GetAvailableLanguages(),
            Questions =
            [
                .. survey
                    .Questions.OrderBy(q => q.Order)
                    .Select(q => new PublicQuestionDto
                    {
                        Id = q.Id,
                        Text = q.GetLocalizedText(languageCode),
                        Description = q.GetLocalizedDescription(languageCode),
                        Type = q.Type,
                        IsRequired = q.IsRequired,
                        Order = q.Order,
                        Settings = _mapper.Map<DTOs.QuestionSettingsDto>(
                            q.GetLocalizedSettings(languageCode)
                        ),
                        IsNpsQuestion = q.IsNpsQuestion,
                        NpsType = q.NpsType,
                    }),
            ],
        };

        // Include theme if present
        if (survey.Theme != null)
        {
            dto.Theme = new PublicSurveyThemeDto
            {
                // Primary
                PrimaryColor = survey.Theme.PrimaryColor,
                OnPrimaryColor = survey.Theme.OnPrimaryColor,
                PrimaryContainerColor = survey.Theme.PrimaryContainerColor,
                OnPrimaryContainerColor = survey.Theme.OnPrimaryContainerColor,
                // Secondary
                SecondaryColor = survey.Theme.SecondaryColor,
                OnSecondaryColor = survey.Theme.OnSecondaryColor,
                SecondaryContainerColor = survey.Theme.SecondaryContainerColor,
                OnSecondaryContainerColor = survey.Theme.OnSecondaryContainerColor,
                // Surface
                SurfaceColor = survey.Theme.SurfaceColor,
                SurfaceContainerLowestColor = survey.Theme.SurfaceContainerLowestColor,
                SurfaceContainerLowColor = survey.Theme.SurfaceContainerLowColor,
                SurfaceContainerColor = survey.Theme.SurfaceContainerColor,
                SurfaceContainerHighColor = survey.Theme.SurfaceContainerHighColor,
                SurfaceContainerHighestColor = survey.Theme.SurfaceContainerHighestColor,
                OnSurfaceColor = survey.Theme.OnSurfaceColor,
                OnSurfaceVariantColor = survey.Theme.OnSurfaceVariantColor,
                // Outline
                OutlineColor = survey.Theme.OutlineColor,
                OutlineVariantColor = survey.Theme.OutlineVariantColor,
                // Legacy
                BackgroundColor = survey.Theme.BackgroundColor,
                TextColor = survey.Theme.TextColor,
                // Typography
                FontFamily = survey.Theme.FontFamily,
                HeadingFontFamily = survey.Theme.HeadingFontFamily,
                BaseFontSize = survey.Theme.BaseFontSize,
                // Button styling
                ButtonStyle = (int)survey.Theme.ButtonStyle,
                ButtonTextColor = survey.Theme.ButtonTextColor,
                // Branding
                LogoUrl = survey.Theme.LogoUrl,
                LogoSize = (int)survey.Theme.LogoSize,
                ShowLogoBackground = survey.Theme.ShowLogoBackground,
                LogoBackgroundColor = survey.Theme.LogoBackgroundColor,
                BrandingTitle = survey.Theme.BrandingTitle,
                BrandingSubtitle = survey.Theme.BrandingSubtitle,
                ShowPoweredBy = survey.Theme.ShowPoweredBy,
                // Layout
                BackgroundImageUrl = survey.Theme.BackgroundImageUrl,
                BackgroundPosition = survey.Theme.BackgroundPosition.ToString(),
                ShowProgressBar = survey.Theme.ShowProgressBar,
                ProgressBarStyle = (int)survey.Theme.ProgressBarStyle,
            };
        }

        return Result<PublicSurveyDto>.Success(dto);
    }
}
