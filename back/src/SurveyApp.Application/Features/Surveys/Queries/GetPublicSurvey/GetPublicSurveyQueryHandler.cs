using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Surveys.Queries.GetPublicSurvey;

public class GetPublicSurveyQueryHandler(ISurveyRepository surveyRepository, IMapper mapper)
    : IRequestHandler<GetPublicSurveyQuery, Result<PublicSurveyDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<PublicSurveyDto>> Handle(
        GetPublicSurveyQuery request,
        CancellationToken cancellationToken
    )
    {
        var survey = await _surveyRepository.GetByShareTokenAsync(
            request.ShareToken,
            cancellationToken
        );
        if (survey == null)
        {
            return Result<PublicSurveyDto>.Failure("Handler.SurveyNotFound");
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
            Questions = survey
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
                })
                .ToList(),
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
                // Branding
                LogoUrl = survey.Theme.LogoUrl,
                LogoSize = (int)survey.Theme.LogoSize,
                ShowLogoBackground = survey.Theme.ShowLogoBackground,
                LogoBackgroundColor = survey.Theme.LogoBackgroundColor,
                BrandingTitle = survey.Theme.BrandingTitle,
                BrandingSubtitle = survey.Theme.BrandingSubtitle,
                // Layout
                BackgroundImageUrl = survey.Theme.BackgroundImageUrl,
                BackgroundPosition = survey.Theme.BackgroundPosition.ToString(),
            };
        }

        return Result<PublicSurveyDto>.Success(dto);
    }
}
