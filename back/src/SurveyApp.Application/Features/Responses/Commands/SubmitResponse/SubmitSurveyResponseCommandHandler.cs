using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Common;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Application.Features.Responses.Commands.SubmitResponse;

public class SubmitSurveyResponseCommandHandler(
    ISurveyRepository surveyRepository,
    ISurveyLinkRepository surveyLinkRepository,
    ISurveyResponseRepository responseRepository,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    IMapper mapper,
    ILogger<SubmitSurveyResponseCommandHandler> logger,
    IDbContextDebugService dbContextDebugService
) : IRequestHandler<SubmitSurveyResponseCommand, Result<SurveyResponseDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly ISurveyLinkRepository _surveyLinkRepository = surveyLinkRepository;
    private readonly ISurveyResponseRepository _responseRepository = responseRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IMapper _mapper = mapper;
    private readonly ILogger<SubmitSurveyResponseCommandHandler> _logger = logger;
    private readonly IDbContextDebugService _dbContextDebugService = dbContextDebugService;

    public async Task<Result<SurveyResponseDto>> Handle(
        SubmitSurveyResponseCommand request,
        CancellationToken cancellationToken
    )
    {
        // Determine which flow to use
        if (request.ResponseId.HasValue)
        {
            return await HandleNewFlow(request, cancellationToken);
        }
        else if (request.SurveyId.HasValue)
        {
            return await HandleLegacyFlow(request, cancellationToken);
        }
        else
        {
            return Result<SurveyResponseDto>.Failure(
                "Application.Response.ResponseIdOrSurveyIdRequired"
            );
        }
    }

    /// <summary>
    /// New flow: Complete an existing draft response.
    /// The response was already created via StartResponse command.
    /// </summary>
    private async Task<Result<SurveyResponseDto>> HandleNewFlow(
        SubmitSurveyResponseCommand request,
        CancellationToken cancellationToken
    )
    {
        _logger.LogWarning("=== DEBUG: HandleNewFlow START ===");
        _logger.LogWarning("DEBUG: Looking for ResponseId: {ResponseId}", request.ResponseId);

        // First, check if the response exists in the database (bypassing filters)
        var (responseExists, responseIsDeleted, responseDebugInfo) =
            await _dbContextDebugService.CheckResponseExistsAsync(
                request.ResponseId!.Value,
                cancellationToken
            );
        _logger.LogWarning(
            "DEBUG: Response exists check: Exists={Exists}, IsDeleted={IsDeleted}",
            responseExists,
            responseIsDeleted
        );
        _logger.LogWarning("DEBUG: Response raw data:\n{DebugInfo}", responseDebugInfo);

        // Get the existing response with change tracking enabled
        var response = await _responseRepository.GetByIdForUpdateAsync(
            request.ResponseId!.Value,
            cancellationToken
        );

        if (response == null)
        {
            _logger.LogError(
                "DEBUG: GetByIdForUpdateAsync returned NULL for ResponseId: {ResponseId}",
                request.ResponseId
            );
            return Result<SurveyResponseDto>.NotFound("Errors.ResponseNotFound");
        }

        _logger.LogWarning(
            "DEBUG: Response loaded successfully. Id={Id}, SurveyId={SurveyId}, SurveyLinkId={SurveyLinkId}, IsComplete={IsComplete}, IsDeleted={IsDeleted}",
            response.Id,
            response.SurveyId,
            response.SurveyLinkId,
            response.IsComplete,
            response.IsDeleted
        );

        if (response.IsComplete)
            return Result<SurveyResponseDto>.Failure("Domain.Response.AlreadyComplete");

        // Get the survey with questions for validation
        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(
            response.SurveyId,
            cancellationToken
        );
        if (survey == null)
            return Result<SurveyResponseDto>.NotFound("Errors.SurveyNotFound");

        _logger.LogWarning(
            "DEBUG: Survey loaded. Id={SurveyId}, QuestionCount={QuestionCount}",
            survey.Id,
            survey.Questions.Count
        );

        if (!survey.IsAcceptingResponses)
            return Result<SurveyResponseDto>.Failure("Application.Survey.NotAcceptingResponses");

        // Log tracked entities BEFORE adding answers
        _logger.LogWarning(
            "DEBUG: Tracked entities BEFORE ValidateAndAddAnswers:\n{TrackedEntities}",
            _dbContextDebugService.GetTrackedEntitiesDebugInfo()
        );

        // Validate and add answers
        var validationResult = await ValidateAndAddAnswers(survey, response, request.Answers);
        if (!validationResult.IsSuccess)
            return Result<SurveyResponseDto>.Failure(validationResult.Error!);

        // IMPORTANT: Explicitly add answers to the DbContext so they're tracked as Added (not Modified)
        // When adding entities to a collection of a tracked parent, EF Core may not detect them as new
        _responseRepository.AddAnswersToContext(response.Answers);

        _logger.LogWarning(
            "DEBUG: Answers added. AnswerCount in response: {AnswerCount}",
            response.Answers.Count
        );

        // Add metadata if provided
        if (request.Metadata != null)
        {
            foreach (var (key, value) in request.Metadata)
                response.AddMetadata(key, value);
        }

        // Complete the response (calculates TimeSpentSeconds)
        response.Complete();
        _logger.LogWarning(
            "DEBUG: Response completed. IsComplete={IsComplete}, SubmittedAt={SubmittedAt}, TimeSpentSeconds={TimeSpentSeconds}",
            response.IsComplete,
            response.SubmittedAt,
            response.TimeSpentSeconds
        );

        // Update link response count if response came from a link
        if (response.SurveyLinkId.HasValue)
        {
            _logger.LogWarning(
                "DEBUG: Response has SurveyLinkId: {SurveyLinkId}",
                response.SurveyLinkId
            );

            // Check if link exists in database (bypassing filters)
            var (linkExists, linkIsDeleted, linkDebugInfo) =
                await _dbContextDebugService.CheckLinkExistsAsync(
                    response.SurveyLinkId.Value,
                    cancellationToken
                );
            _logger.LogWarning(
                "DEBUG: Link exists check: Exists={Exists}, IsDeleted={IsDeleted}",
                linkExists,
                linkIsDeleted
            );
            _logger.LogWarning("DEBUG: Link raw data:\n{DebugInfo}", linkDebugInfo);

            var link = await _surveyLinkRepository.GetByIdForUpdateAsync(
                response.SurveyLinkId.Value,
                cancellationToken
            );
            if (link != null)
            {
                _logger.LogWarning(
                    "DEBUG: Link loaded. Id={LinkId}, ResponseCount before={ResponseCount}",
                    link.Id,
                    link.ResponseCount
                );
                link.RecordResponse();
                _logger.LogWarning(
                    "DEBUG: Link ResponseCount after RecordResponse: {ResponseCount}",
                    link.ResponseCount
                );
            }
            else
            {
                _logger.LogWarning("DEBUG: GetByIdForUpdateAsync for link returned NULL!");
            }
        }

        // Log tracked entities BEFORE SaveChanges
        _logger.LogWarning(
            "DEBUG: Tracked entities BEFORE SaveChangesAsync:\n{TrackedEntities}",
            _dbContextDebugService.GetTrackedEntitiesDebugInfo()
        );

        _logger.LogWarning("DEBUG: About to call SaveChangesAsync...");

        try
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            _logger.LogWarning("DEBUG: SaveChangesAsync completed successfully!");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "DEBUG: SaveChangesAsync FAILED!\nTracked entities at failure:\n{TrackedEntities}",
                _dbContextDebugService.GetTrackedEntitiesDebugInfo()
            );
            throw;
        }

        _logger.LogWarning("=== DEBUG: HandleNewFlow END (success) ===");
        return Result<SurveyResponseDto>.Success(_mapper.Map<SurveyResponseDto>(response));
    }

    /// <summary>
    /// Legacy flow: Create and complete a response in one step.
    /// Kept for backward compatibility.
    /// </summary>
    private async Task<Result<SurveyResponseDto>> HandleLegacyFlow(
        SubmitSurveyResponseCommand request,
        CancellationToken cancellationToken
    )
    {
        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(
            request.SurveyId!.Value,
            cancellationToken
        );
        if (survey == null)
            return Result<SurveyResponseDto>.NotFound("Errors.SurveyNotFound");

        if (!survey.IsAcceptingResponses)
            return Result<SurveyResponseDto>.Failure("Application.Survey.NotAcceptingResponses");

        if (survey.MaxResponses.HasValue)
        {
            var responseCount = await _responseRepository.GetResponseCountAsync(
                survey.Id,
                cancellationToken
            );
            if (responseCount >= survey.MaxResponses.Value)
                return Result<SurveyResponseDto>.Failure("Application.Survey.MaxResponsesReached");
        }

        // Handle survey link if provided
        SurveyLink? surveyLink = null;
        if (!string.IsNullOrEmpty(request.LinkToken))
        {
            surveyLink = await _surveyLinkRepository.GetByTokenAsync(
                request.LinkToken,
                cancellationToken
            );
            if (surveyLink != null && surveyLink.SurveyId == survey.Id)
            {
                // Record usage for legacy flow
                surveyLink.RecordUsage();
            }
            else
            {
                surveyLink = null; // Invalid link, ignore
            }
        }

        string? respondentEmail = null;
        if (!survey.IsAnonymous && _currentUserService.UserId.HasValue)
            respondentEmail = _currentUserService.Email;

        var response = SurveyResponse.Create(
            survey.Id,
            survey.AccessToken,
            surveyLink?.Id,
            respondentEmail
        );

        // Validate and add answers
        var validationResult = await ValidateAndAddAnswers(survey, response, request.Answers);
        if (!validationResult.IsSuccess)
            return Result<SurveyResponseDto>.Failure(validationResult.Error!);

        if (request.Metadata != null)
        {
            foreach (var (key, value) in request.Metadata)
                response.AddMetadata(key, value);
        }

        response.Complete();

        // Update link response count
        if (surveyLink != null)
        {
            surveyLink.RecordResponse();
            _surveyLinkRepository.Update(surveyLink);
        }

        await _responseRepository.AddAsync(response, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SurveyResponseDto>.Success(_mapper.Map<SurveyResponseDto>(response));
    }

    private Task<Result<Unit>> ValidateAndAddAnswers(
        Survey survey,
        SurveyResponse response,
        List<SubmitAnswerDto> answers
    )
    {
        // Validate required questions
        var requiredQuestionIds = survey
            .Questions.Where(q => q.IsRequired)
            .Select(q => q.Id)
            .ToHashSet();
        var answeredQuestionIds = answers
            .Where(a => HasAnswer(a))
            .Select(a => a.QuestionId)
            .ToHashSet();

        var missingRequired = requiredQuestionIds.Except(answeredQuestionIds).ToList();
        if (missingRequired.Count != 0)
        {
            var missingQuestions = survey
                .Questions.Where(q => missingRequired.Contains(q.Id))
                .Select(q => q.Text);
            return Task.FromResult(
                Result<Unit>.Failure(
                    $"Application.Response.RequiredQuestionsNotAnswered|{string.Join(", ", missingQuestions)}"
                )
            );
        }

        // Process and validate each answer
        foreach (var answerDto in answers)
        {
            var question = survey.Questions.FirstOrDefault(q => q.Id == answerDto.QuestionId);
            if (question == null)
                continue;

            var settings = question.GetSettings();

            // Build AnswerValue based on question type
            var (answerValue, validationError) = BuildAnswerValue(question, settings, answerDto);
            if (validationError != null)
                return Task.FromResult(
                    Result<Unit>.Failure(
                        $"Application.Response.InvalidAnswerForQuestion|{question.Text}|{validationError}"
                    )
                );

            if (answerValue != null)
                response.AddAnswer(answerDto.QuestionId, answerValue.ToJson());
        }

        return Task.FromResult(Result<Unit>.Success(Unit.Value));
    }

    private static bool HasAnswer(SubmitAnswerDto answer)
    {
        return (answer.SelectedOptionIds != null && answer.SelectedOptionIds.Count > 0)
            || !string.IsNullOrEmpty(answer.Text);
    }

    private (AnswerValue?, string?) BuildAnswerValue(
        Question question,
        QuestionSettings? settings,
        SubmitAnswerDto dto
    )
    {
        return question.Type switch
        {
            QuestionType.SingleChoice or QuestionType.Dropdown or QuestionType.YesNo =>
                BuildSingleChoiceAnswer(settings, dto),

            QuestionType.MultipleChoice or QuestionType.Checkbox => BuildMultiChoiceAnswer(
                settings,
                dto
            ),

            QuestionType.Ranking => BuildRankingAnswer(settings, dto),

            QuestionType.Matrix => BuildMatrixAnswer(dto),

            QuestionType.Rating or QuestionType.Scale or QuestionType.NPS => BuildNumericAnswer(
                settings,
                dto
            ),

            QuestionType.Text or QuestionType.ShortText or QuestionType.LongText => BuildTextAnswer(
                settings,
                dto
            ),

            QuestionType.Email => BuildEmailAnswer(dto),
            QuestionType.Phone => BuildPhoneAnswer(settings, dto),
            QuestionType.Url => BuildUrlAnswer(settings, dto),
            QuestionType.Date or QuestionType.DateTime => BuildDateAnswer(dto),
            QuestionType.Number => BuildNumberAnswer(settings, dto),
            QuestionType.FileUpload => BuildFileUploadAnswer(dto),

            _ => (string.IsNullOrEmpty(dto.Text) ? null : AnswerValue.ForText(dto.Text), null),
        };
    }

    private static (AnswerValue?, string?) BuildSingleChoiceAnswer(
        QuestionSettings? settings,
        SubmitAnswerDto dto
    )
    {
        if (dto.SelectedOptionIds == null || dto.SelectedOptionIds.Count == 0)
        {
            // Maybe "Other" text only
            if (!string.IsNullOrEmpty(dto.Text) && settings?.AllowOther == true)
                return (AnswerValue.ForText(dto.Text), null);
            return (null, null);
        }

        if (dto.SelectedOptionIds.Count > 1)
            return (null, "Application.Response.SingleChoiceOnlyOneOption");

        var optionId = dto.SelectedOptionIds[0];
        var option = settings?.GetOption(optionId);
        if (option == null)
            return (null, "Application.Response.InvalidOptionId");

        return (AnswerValue.ForSingleChoice(option), null);
    }

    private static (AnswerValue?, string?) BuildMultiChoiceAnswer(
        QuestionSettings? settings,
        SubmitAnswerDto dto
    )
    {
        if (
            (dto.SelectedOptionIds == null || dto.SelectedOptionIds.Count == 0)
            && string.IsNullOrEmpty(dto.Text)
        )
            return (null, null);

        var selectedOptions = new List<QuestionOption>();

        if (dto.SelectedOptionIds != null)
        {
            foreach (var optionId in dto.SelectedOptionIds)
            {
                var option = settings?.GetOption(optionId);
                if (option == null)
                    return (null, $"Application.Response.InvalidOptionId:{optionId}");
                selectedOptions.Add(option);
            }

            if (
                settings?.MaxSelections.HasValue == true
                && selectedOptions.Count > settings.MaxSelections.Value
            )
                return (
                    null,
                    $"Application.Response.MaxSelectionsAllowed:{settings.MaxSelections.Value}"
                );
        }

        // Handle "Other" text
        if (!string.IsNullOrEmpty(dto.Text) && settings?.AllowOther == true)
            return (AnswerValue.ForMultiChoiceWithOther(selectedOptions, dto.Text), null);

        return (AnswerValue.ForMultiChoice(selectedOptions), null);
    }

    private static (AnswerValue?, string?) BuildRankingAnswer(
        QuestionSettings? settings,
        SubmitAnswerDto dto
    )
    {
        if (dto.SelectedOptionIds == null || dto.SelectedOptionIds.Count == 0)
            return (null, null);

        // For ranking, options must be in the provided order
        var rankedOptions = new List<QuestionOption>();
        foreach (var optionId in dto.SelectedOptionIds)
        {
            var option = settings?.GetOption(optionId);
            if (option == null)
                return (null, $"Application.Response.InvalidOptionId:{optionId}");
            rankedOptions.Add(option);
        }

        // Store as ordered list of selected options
        return (AnswerValue.ForMultiChoice(rankedOptions), null);
    }

    private static (AnswerValue?, string?) BuildMatrixAnswer(SubmitAnswerDto dto)
    {
        // Matrix answers come as JSON text: {"row1": "col1", "row2": "col2"}
        if (string.IsNullOrEmpty(dto.Text))
            return (null, null);

        // Validate it's valid JSON
        try
        {
            System.Text.Json.JsonDocument.Parse(dto.Text);
        }
        catch (System.Text.Json.JsonException)
        {
            return (null, "Application.Response.InvalidMatrixAnswerFormat");
        }

        return (AnswerValue.ForText(dto.Text), null);
    }

    private static (AnswerValue?, string?) BuildFileUploadAnswer(SubmitAnswerDto dto)
    {
        // File uploads store file URLs/paths as JSON array in text
        if (string.IsNullOrEmpty(dto.Text))
            return (null, null);

        return (AnswerValue.ForText(dto.Text), null);
    }

    private static (AnswerValue?, string?) BuildNumericAnswer(
        QuestionSettings? settings,
        SubmitAnswerDto dto
    )
    {
        if (string.IsNullOrEmpty(dto.Text))
            return (null, null);

        if (!int.TryParse(dto.Text, out var numValue))
            return (null, "Application.Response.InvalidNumericValue");

        if (settings?.MinValue.HasValue == true && numValue < settings.MinValue.Value)
            return (null, $"Application.Response.ValueMustBeAtLeast:{settings.MinValue.Value}");

        if (settings?.MaxValue.HasValue == true && numValue > settings.MaxValue.Value)
            return (null, $"Application.Response.ValueMustBeAtMost:{settings.MaxValue.Value}");

        return (AnswerValue.ForText(dto.Text), null);
    }

    private static (AnswerValue?, string?) BuildTextAnswer(
        QuestionSettings? settings,
        SubmitAnswerDto dto
    )
    {
        if (string.IsNullOrEmpty(dto.Text))
            return (null, null);

        if (settings?.MinLength.HasValue == true && dto.Text.Length < settings.MinLength.Value)
            return (null, $"Application.Response.AnswerMinLength:{settings.MinLength.Value}");

        if (settings?.MaxLength.HasValue == true && dto.Text.Length > settings.MaxLength.Value)
            return (null, $"Application.Response.AnswerMaxLength:{settings.MaxLength.Value}");

        return (AnswerValue.ForText(dto.Text), null);
    }

    private static (AnswerValue?, string?) BuildEmailAnswer(SubmitAnswerDto dto)
    {
        if (string.IsNullOrEmpty(dto.Text))
            return (null, null);

        if (!Email.TryCreate(dto.Text, out _))
            return (null, "Application.Response.InvalidEmailAddress");

        return (AnswerValue.ForText(dto.Text), null);
    }

    private static (AnswerValue?, string?) BuildPhoneAnswer(
        QuestionSettings? settings,
        SubmitAnswerDto dto
    )
    {
        if (string.IsNullOrEmpty(dto.Text))
            return (null, null);

        var pattern =
            settings?.ValidationPattern
            ?? GetPhonePatternFromPreset(settings?.ValidationPreset)
            ?? @"^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$";

        try
        {
            if (!System.Text.RegularExpressions.Regex.IsMatch(dto.Text, pattern))
                return (
                    null,
                    settings?.ValidationMessage ?? "Application.Response.InvalidPhoneNumber"
                );
        }
        catch
        { /* Invalid regex, accept */
        }

        return (AnswerValue.ForText(dto.Text), null);
    }

    private static (AnswerValue?, string?) BuildUrlAnswer(
        QuestionSettings? settings,
        SubmitAnswerDto dto
    )
    {
        if (string.IsNullOrEmpty(dto.Text))
            return (null, null);

        var pattern =
            settings?.ValidationPattern
            ?? @"^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+[\/\w\-.,@?^=%&:/~+#]*$";

        try
        {
            if (
                !System.Text.RegularExpressions.Regex.IsMatch(
                    dto.Text,
                    pattern,
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase
                )
            )
                return (
                    null,
                    settings?.ValidationMessage ?? "Application.Response.InvalidUrlFormat"
                );
        }
        catch
        { /* Invalid regex, accept */
        }

        return (AnswerValue.ForText(dto.Text), null);
    }

    private static (AnswerValue?, string?) BuildDateAnswer(SubmitAnswerDto dto)
    {
        if (string.IsNullOrEmpty(dto.Text))
            return (null, null);

        if (!DateTime.TryParse(dto.Text, out _))
            return (null, "Application.Response.InvalidDateFormat");

        return (AnswerValue.ForText(dto.Text), null);
    }

    private static (AnswerValue?, string?) BuildNumberAnswer(
        QuestionSettings? settings,
        SubmitAnswerDto dto
    )
    {
        if (string.IsNullOrEmpty(dto.Text))
            return (null, null);

        if (!decimal.TryParse(dto.Text, out _))
            return (null, "Application.Response.InvalidNumberFormat");

        return BuildNumericAnswer(settings, dto);
    }

    private static string? GetPhonePatternFromPreset(string? presetId)
    {
        return presetId switch
        {
            "phone-international" => @"^\+?[1-9]\d{1,14}$",
            "phone-us" => @"^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$",
            "phone-uk" => @"^(\+44|0)\d{10,11}$",
            "phone-eu" => @"^\+?[0-9\s-]{8,20}$",
            "phone-digits-only" => @"^[0-9]{7,15}$",
            "phone-flexible" => @"^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$",
            _ => null,
        };
    }
}
