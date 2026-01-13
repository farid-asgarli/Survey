using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Surveys.Commands.UpdateSurvey;

/// <summary>
/// Handler for updating a survey.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class UpdateSurveyCommandHandler(
    ISurveyRepository surveyRepository,
    ISurveyCategoryRepository categoryRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<UpdateSurveyCommand, Result<SurveyDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly ISurveyCategoryRepository _categoryRepository = categoryRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyDto>> Handle(
        UpdateSurveyCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        var survey = await _surveyRepository.GetByIdForUpdateAsync(
            request.SurveyId,
            cancellationToken
        );
        if (survey == null || survey.NamespaceId != ctx.NamespaceId)
        {
            return Result<SurveyDto>.NotFound("Errors.SurveyNotFound");
        }

        // Check if survey can be edited
        if (survey.Status != SurveyStatus.Draft)
        {
            return Result<SurveyDto>.Failure("Errors.OnlyDraftSurveysEditable");
        }

        // Validate category if provided
        if (request.CategoryId.HasValue)
        {
            var category = await _categoryRepository.GetByIdAsync(
                request.CategoryId.Value,
                cancellationToken
            );
            if (category == null || category.NamespaceId != ctx.NamespaceId)
            {
                return Result<SurveyDto>.Failure("Errors.CategoryNotFound");
            }
        }

        // Determine the language to update
        var languageCode = request.LanguageCode ?? survey.DefaultLanguage;

        // Update or create translation for the specified language
        survey.AddOrUpdateTranslation(
            languageCode,
            request.Title,
            request.Description,
            request.WelcomeMessage,
            request.ThankYouMessage
        );

        // Update non-localized settings
        survey.ConfigureResponseSettings(
            request.AllowAnonymousResponses,
            request.AllowMultipleResponses,
            request.MaxResponses
        );
        survey.SetSchedule(request.StartsAt, request.EndsAt);

        // Update category
        survey.SetCategory(request.CategoryId);

        _surveyRepository.Update(survey);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<SurveyDto>(survey);
        return Result<SurveyDto>.Success(dto);
    }
}
