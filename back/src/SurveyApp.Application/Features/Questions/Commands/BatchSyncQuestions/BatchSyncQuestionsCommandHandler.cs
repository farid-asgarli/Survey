using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Questions.Commands.BatchSyncQuestions;

/// <summary>
/// Handler for batch syncing questions in a survey.
/// Performs all operations in a single transaction for atomicity.
/// </summary>
public class BatchSyncQuestionsCommandHandler(
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    ISurveyAuthorizationService surveyAuthorizationService,
    IQuestionSettingsMapper questionSettingsMapper,
    IMapper mapper
) : IRequestHandler<BatchSyncQuestionsCommand, Result<BatchSyncQuestionsResult>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ISurveyAuthorizationService _surveyAuthorizationService =
        surveyAuthorizationService;
    private readonly IQuestionSettingsMapper _questionSettingsMapper = questionSettingsMapper;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<BatchSyncQuestionsResult>> Handle(
        BatchSyncQuestionsCommand request,
        CancellationToken cancellationToken
    )
    {
        // Validate survey access and editability using centralized service
        var surveyResult =
            await _surveyAuthorizationService.ValidateSurveyWithQuestionsEditableAsync(
                request.SurveyId,
                cancellationToken
            );
        if (!surveyResult.IsSuccess)
        {
            return Result<BatchSyncQuestionsResult>.Failure(surveyResult.Error!);
        }

        var survey = surveyResult.Value!;

        var created = new List<CreatedQuestionResult>();
        var updated = new List<QuestionDto>();
        var deleted = new List<Guid>();
        var errors = new List<BatchSyncError>();
        var idMap = new Dictionary<string, Guid>();

        // 1. Delete questions first (to avoid conflicts with order)
        foreach (var questionId in request.ToDelete)
        {
            var question = survey.Questions.FirstOrDefault(q => q.Id == questionId);
            if (question == null)
            {
                errors.Add(
                    new BatchSyncError
                    {
                        Operation = "Delete",
                        QuestionId = questionId.ToString(),
                        Message = "Errors.QuestionNotFound",
                    }
                );
                continue;
            }

            survey.RemoveQuestion(questionId);
            deleted.Add(questionId);
        }

        // 2. Create new questions
        foreach (var createData in request.ToCreate)
        {
            try
            {
                var languageCode = createData.LanguageCode ?? survey.DefaultLanguage;

                var question = survey.AddQuestion(
                    createData.Text,
                    createData.Type,
                    createData.IsRequired,
                    languageCode
                );

                // Update description if provided
                if (!string.IsNullOrEmpty(createData.Description))
                {
                    question.UpdateDescription(createData.Description, languageCode);
                }

                // Handle order if specified
                if (createData.Order.HasValue)
                {
                    question.UpdateOrder(createData.Order.Value);
                }

                // Handle settings if provided
                if (createData.Settings != null)
                {
                    var settings = _questionSettingsMapper.MapToSettings(createData.Settings);
                    if (settings != null)
                    {
                        question.UpdateSettings(settings);
                    }
                }

                // Handle NPS designation
                if (createData.IsNpsQuestion)
                {
                    question.SetAsNpsQuestion(createData.NpsType ?? NpsQuestionType.Standard);
                }

                // Track the ID mapping
                idMap[createData.TempId] = question.Id;

                // Add to context for proper change tracking
                await _surveyRepository.AddQuestionAsync(question, cancellationToken);

                created.Add(
                    new CreatedQuestionResult
                    {
                        TempId = createData.TempId,
                        RealId = question.Id,
                        Question = _mapper.Map<QuestionDto>(question),
                    }
                );
            }
            catch (Exception ex)
            {
                errors.Add(
                    new BatchSyncError
                    {
                        Operation = "Create",
                        QuestionId = createData.TempId,
                        Message = ex.Message,
                    }
                );
            }
        }

        // 3. Update existing questions
        foreach (var updateData in request.ToUpdate)
        {
            var question = survey.Questions.FirstOrDefault(q => q.Id == updateData.QuestionId);
            if (question == null)
            {
                errors.Add(
                    new BatchSyncError
                    {
                        Operation = "Update",
                        QuestionId = updateData.QuestionId.ToString(),
                        Message = "Errors.QuestionNotFound",
                    }
                );
                continue;
            }

            try
            {
                var languageCode = updateData.LanguageCode ?? survey.DefaultLanguage;

                // Update localized content via translation
                question.AddOrUpdateTranslation(
                    languageCode,
                    updateData.Text,
                    updateData.Description
                );

                // Update non-localized properties
                question.UpdateRequired(updateData.IsRequired);

                // Update order if specified
                if (updateData.Order.HasValue)
                {
                    question.UpdateOrder(updateData.Order.Value);
                }

                // Update settings if provided - preserve existing option IDs where possible
                if (updateData.Settings != null)
                {
                    var existingSettings = question.GetSettings();
                    var settings = _questionSettingsMapper.MapToSettingsPreservingIds(
                        updateData.Settings,
                        existingSettings
                    );
                    if (settings != null)
                    {
                        question.UpdateSettings(settings);
                    }
                }

                // Handle NPS designation
                if (updateData.IsNpsQuestion)
                {
                    question.SetAsNpsQuestion(updateData.NpsType ?? NpsQuestionType.Standard);
                }
                else if (question.IsNpsQuestion)
                {
                    question.RemoveNpsDesignation();
                }

                updated.Add(_mapper.Map<QuestionDto>(question));
            }
            catch (Exception ex)
            {
                errors.Add(
                    new BatchSyncError
                    {
                        Operation = "Update",
                        QuestionId = updateData.QuestionId.ToString(),
                        Message = ex.Message,
                    }
                );
            }
        }

        // 4. Reorder questions (map temp IDs to real IDs)
        var reordered = false;
        if (request.FinalOrder.Count > 0)
        {
            try
            {
                var mappedOrder = request
                    .FinalOrder.Select(id =>
                    {
                        if (id.StartsWith("temp_") && idMap.TryGetValue(id, out var realId))
                        {
                            return realId;
                        }
                        return Guid.TryParse(id, out var guidId) ? guidId : Guid.Empty;
                    })
                    .Where(id => id != Guid.Empty)
                    .ToList();

                if (mappedOrder.Count > 0)
                {
                    survey.ReorderQuestions(mappedOrder);
                    reordered = true;
                }
            }
            catch (Exception ex)
            {
                errors.Add(
                    new BatchSyncError
                    {
                        Operation = "Reorder",
                        QuestionId = null,
                        Message = ex.Message,
                    }
                );
            }
        }

        // Save all changes in a single transaction
        _surveyRepository.Update(survey);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<BatchSyncQuestionsResult>.Success(
            new BatchSyncQuestionsResult
            {
                Created = created,
                Updated = updated,
                Deleted = deleted,
                Reordered = reordered,
                Errors = errors,
            }
        );
    }
}
