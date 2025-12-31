using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Responses.Commands.SubmitResponse;

public class SubmitSurveyResponseCommandHandler(
    ISurveyRepository surveyRepository,
    ISurveyResponseRepository responseRepository,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    IMapper mapper
) : IRequestHandler<SubmitSurveyResponseCommand, Result<SurveyResponseDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly ISurveyResponseRepository _responseRepository = responseRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyResponseDto>> Handle(
        SubmitSurveyResponseCommand request,
        CancellationToken cancellationToken
    )
    {
        // Get survey with questions
        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(
            request.SurveyId,
            cancellationToken
        );
        if (survey == null)
        {
            return Result<SurveyResponseDto>.Failure("Handler.SurveyNotFound");
        }

        // Validate survey is accepting responses
        if (!survey.IsAcceptingResponses)
        {
            return Result<SurveyResponseDto>.Failure("Application.Survey.NotAcceptingResponses");
        }

        // Check if response limit reached
        if (survey.MaxResponses.HasValue)
        {
            var responseCount = await _responseRepository.GetResponseCountAsync(
                survey.Id,
                cancellationToken
            );
            if (responseCount >= survey.MaxResponses.Value)
            {
                return Result<SurveyResponseDto>.Failure("Application.Survey.MaxResponsesReached");
            }
        }

        // Get respondent email if not anonymous
        string? respondentEmail = null;
        if (!survey.IsAnonymous && _currentUserService.UserId.HasValue)
        {
            // In a real app, you'd fetch the user's email here
            respondentEmail = _currentUserService.Email;
        }

        // Validate required questions are answered
        var requiredQuestionIds = survey
            .Questions.Where(q => q.IsRequired)
            .Select(q => q.Id)
            .ToList();

        var answeredQuestionIds = request
            .Answers.Where(a => !string.IsNullOrEmpty(a.Value))
            .Select(a => a.QuestionId)
            .ToList();

        var missingRequired = requiredQuestionIds.Except(answeredQuestionIds).ToList();
        if (missingRequired.Any())
        {
            var missingQuestions = survey
                .Questions.Where(q => missingRequired.Contains(q.Id))
                .Select(q => q.Text);
            return Result<SurveyResponseDto>.Failure(
                $"Required questions not answered: {string.Join(", ", missingQuestions)}"
            );
        }

        // Create response
        var response = SurveyResponse.Create(survey.Id, survey.AccessToken, respondentEmail);

        // Add answers
        foreach (var answerDto in request.Answers)
        {
            var question = survey.Questions.FirstOrDefault(q => q.Id == answerDto.QuestionId);
            if (question == null)
            {
                continue; // Skip invalid question IDs
            }

            // Validate answer based on question type
            var validationResult = ValidateAnswer(question, answerDto.Value);
            if (!validationResult.IsSuccess)
            {
                return Result<SurveyResponseDto>.Failure(
                    $"Application.Response.InvalidAnswerForQuestion|{question.Text}|{validationResult.Error}"
                );
            }

            response.AddAnswer(answerDto.QuestionId, answerDto.Value ?? string.Empty);
        }

        // Add metadata if provided
        if (request.Metadata != null)
        {
            foreach (var (key, value) in request.Metadata)
            {
                response.AddMetadata(key, value);
            }
        }

        // Complete the response
        response.Complete();

        await _responseRepository.AddAsync(response, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<SurveyResponseDto>(response);
        return Result<SurveyResponseDto>.Success(dto);
    }

    private Result ValidateAnswer(Question question, string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return question.IsRequired
                ? Result.Failure("Application.Response.RequiresAnswer")
                : Result.Success();
        }

        var settings = question.GetSettings();

        return question.Type switch
        {
            QuestionType.MultipleChoice or QuestionType.Dropdown => ValidateChoiceAnswer(
                value,
                settings
            ),
            QuestionType.Checkbox => ValidateMultiChoiceAnswer(value, settings),
            QuestionType.Rating or QuestionType.Scale => ValidateNumericAnswer(value, settings),
            QuestionType.Number => ValidateNumberAnswer(value, settings),
            QuestionType.ShortText or QuestionType.LongText => ValidateTextAnswer(value, settings),
            QuestionType.Email => ValidateEmailAnswer(value),
            QuestionType.Phone => ValidatePhoneAnswer(value, settings),
            QuestionType.Url => ValidateUrlAnswer(value, settings),
            QuestionType.Date or QuestionType.DateTime => ValidateDateAnswer(value),
            _ => Result.Success(),
        };
    }

    private Result ValidateChoiceAnswer(
        string value,
        Domain.ValueObjects.QuestionSettings? settings
    )
    {
        if (settings?.Options == null || !settings.Options.Any())
        {
            return Result.Success();
        }

        if (!settings.Options.Contains(value))
        {
            return Result.Failure("Application.Response.InvalidOptionSelected");
        }

        return Result.Success();
    }

    private Result ValidateMultiChoiceAnswer(
        string value,
        Domain.ValueObjects.QuestionSettings? settings
    )
    {
        if (settings?.Options == null || !settings.Options.Any())
        {
            return Result.Success();
        }

        var selectedOptions = value
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim())
            .ToList();

        foreach (var option in selectedOptions)
        {
            if (!settings.Options.Contains(option))
            {
                return Result.Failure($"Application.Response.InvalidOption:{option}");
            }
        }

        if (settings.MaxSelections.HasValue && selectedOptions.Count > settings.MaxSelections.Value)
        {
            return Result.Failure(
                $"Application.Response.MaxSelectionsAllowed:{settings.MaxSelections.Value}"
            );
        }

        return Result.Success();
    }

    private Result ValidateNumericAnswer(
        string value,
        Domain.ValueObjects.QuestionSettings? settings
    )
    {
        if (!int.TryParse(value, out var numValue))
        {
            return Result.Failure("Application.Response.InvalidNumericValue");
        }

        if (settings?.MinValue.HasValue == true && numValue < settings.MinValue.Value)
        {
            return Result.Failure(
                $"Application.Response.ValueMustBeAtLeast:{settings.MinValue.Value}"
            );
        }

        if (settings?.MaxValue.HasValue == true && numValue > settings.MaxValue.Value)
        {
            return Result.Failure(
                $"Application.Response.ValueMustBeAtMost:{settings.MaxValue.Value}"
            );
        }

        return Result.Success();
    }

    private Result ValidateNumberAnswer(
        string value,
        Domain.ValueObjects.QuestionSettings? settings
    )
    {
        if (!decimal.TryParse(value, out _))
        {
            return Result.Failure("Application.Response.InvalidNumberFormat");
        }

        return ValidateNumericAnswer(value, settings);
    }

    private Result ValidateTextAnswer(string value, Domain.ValueObjects.QuestionSettings? settings)
    {
        if (settings?.MinLength.HasValue == true && value.Length < settings.MinLength.Value)
        {
            return Result.Failure(
                $"Application.Response.AnswerMinLength:{settings.MinLength.Value}"
            );
        }

        if (settings?.MaxLength.HasValue == true && value.Length > settings.MaxLength.Value)
        {
            return Result.Failure(
                $"Application.Response.AnswerMaxLength:{settings.MaxLength.Value}"
            );
        }

        return Result.Success();
    }

    private Result ValidateEmailAnswer(string value)
    {
        var isValid = Domain.ValueObjects.Email.TryCreate(value, out _);
        return isValid
            ? Result.Success()
            : Result.Failure("Application.Response.InvalidEmailAddress");
    }

    private Result ValidatePhoneAnswer(string value, Domain.ValueObjects.QuestionSettings? settings)
    {
        // If custom pattern is provided, use that
        if (!string.IsNullOrEmpty(settings?.ValidationPattern))
        {
            try
            {
                var regex = new System.Text.RegularExpressions.Regex(settings.ValidationPattern);
                if (!regex.IsMatch(value))
                {
                    return Result.Failure(
                        settings.ValidationMessage ?? "Application.Response.InvalidPhoneNumber"
                    );
                }
                return Result.Success();
            }
            catch
            {
                // Invalid regex, skip validation
                return Result.Success();
            }
        }

        // If preset is provided, use that
        if (!string.IsNullOrEmpty(settings?.ValidationPreset))
        {
            var pattern = GetPhonePatternFromPreset(settings.ValidationPreset);
            if (!string.IsNullOrEmpty(pattern))
            {
                try
                {
                    var regex = new System.Text.RegularExpressions.Regex(pattern);
                    if (!regex.IsMatch(value))
                    {
                        return Result.Failure(
                            settings.ValidationMessage ?? "Application.Response.InvalidPhoneNumber"
                        );
                    }
                    return Result.Success();
                }
                catch
                {
                    // Invalid regex, skip validation
                    return Result.Success();
                }
            }
        }

        // Default: flexible phone validation (allows various formats)
        var flexiblePattern = @"^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$";
        if (!System.Text.RegularExpressions.Regex.IsMatch(value, flexiblePattern))
        {
            return Result.Failure(
                settings?.ValidationMessage ?? "Application.Response.InvalidPhoneNumber"
            );
        }

        return Result.Success();
    }

    private Result ValidateUrlAnswer(string value, Domain.ValueObjects.QuestionSettings? settings)
    {
        // If custom pattern is provided, use that
        if (!string.IsNullOrEmpty(settings?.ValidationPattern))
        {
            try
            {
                var regex = new System.Text.RegularExpressions.Regex(settings.ValidationPattern);
                if (!regex.IsMatch(value))
                {
                    return Result.Failure(
                        settings.ValidationMessage ?? "Application.Response.InvalidUrlFormat"
                    );
                }
                return Result.Success();
            }
            catch
            {
                // Invalid regex, skip validation
                return Result.Success();
            }
        }

        // Default URL validation
        var urlPattern = @"^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+[\/\w\-.,@?^=%&:/~+#]*$";
        if (
            !System.Text.RegularExpressions.Regex.IsMatch(
                value,
                urlPattern,
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            )
        )
        {
            return Result.Failure(
                settings?.ValidationMessage ?? "Application.Response.InvalidUrlFormat"
            );
        }

        return Result.Success();
    }

    private static string? GetPhonePatternFromPreset(string presetId)
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

    private Result ValidateDateAnswer(string value)
    {
        if (!DateTime.TryParse(value, out _))
        {
            return Result.Failure("Application.Response.InvalidDateFormat");
        }

        return Result.Success();
    }
}
