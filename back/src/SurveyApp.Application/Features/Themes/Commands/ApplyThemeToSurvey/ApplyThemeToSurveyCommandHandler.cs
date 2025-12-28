using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Themes.Commands.ApplyThemeToSurvey;

/// <summary>
/// Handler for applying a theme to a survey.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class ApplyThemeToSurveyCommandHandler(
    ISurveyRepository surveyRepository,
    ISurveyThemeRepository themeRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<ApplyThemeToSurveyCommand, Result<SurveyDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly ISurveyThemeRepository _themeRepository = themeRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyDto>> Handle(
        ApplyThemeToSurveyCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Get survey
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null)
        {
            return Result<SurveyDto>.Failure("Handler.SurveyNotFound");
        }

        // Verify survey belongs to namespace
        if (survey.NamespaceId != ctx.NamespaceId)
        {
            return Result<SurveyDto>.Failure("Survey not found in this namespace.");
        }

        // Validate that only one theme type is specified
        if (request.ThemeId.HasValue && !string.IsNullOrEmpty(request.PresetThemeId))
        {
            return Result<SurveyDto>.Failure("Handler.CannotApplyBothThemeTypes");
        }

        // Decrement usage count of old theme (only for saved themes)
        if (survey.ThemeId.HasValue)
        {
            var oldTheme = await _themeRepository.GetByIdAsync(
                survey.ThemeId.Value,
                cancellationToken
            );
            if (oldTheme != null)
            {
                oldTheme.DecrementUsageCount();
                _themeRepository.Update(oldTheme);
            }
        }

        // If applying a saved theme, validate and increment usage
        if (request.ThemeId.HasValue)
        {
            var theme = await _themeRepository.GetByIdAsync(
                request.ThemeId.Value,
                cancellationToken
            );
            if (theme == null)
            {
                return Result<SurveyDto>.Failure("Handler.ThemeNotFound");
            }

            // Verify theme belongs to namespace
            if (theme.NamespaceId != ctx.NamespaceId)
            {
                return Result<SurveyDto>.Failure("Handler.ThemeNotFoundInNamespace");
            }

            // Increment usage count
            theme.IncrementUsageCount();
            _themeRepository.Update(theme);
        }

        // Apply theme (saved or preset) with customizations to survey
        survey.SetTheme(
            themeId: request.ThemeId,
            presetThemeId: request.PresetThemeId,
            customizations: request.ThemeCustomizations
        );
        _surveyRepository.Update(survey);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SurveyDto>.Success(_mapper.Map<SurveyDto>(survey));
    }
}
