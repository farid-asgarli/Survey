using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.Questions.Commands.BatchSyncQuestions;

/// <summary>
/// Command to batch sync questions in a survey.
/// Handles creates, updates, deletes, and reordering in a single atomic operation.
/// </summary>
public record BatchSyncQuestionsCommand
    : IRequest<Result<BatchSyncQuestionsResult>>,
        INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;

    /// <summary>
    /// The survey ID to sync questions for.
    /// </summary>
    public Guid SurveyId { get; init; }

    /// <summary>
    /// Questions to create (new questions with temporary client-side IDs).
    /// </summary>
    public IReadOnlyList<CreateQuestionData> ToCreate { get; init; } = [];

    /// <summary>
    /// Questions to update (existing questions with real IDs).
    /// </summary>
    public IReadOnlyList<UpdateQuestionData> ToUpdate { get; init; } = [];

    /// <summary>
    /// Question IDs to delete.
    /// </summary>
    public IReadOnlyList<Guid> ToDelete { get; init; } = [];

    /// <summary>
    /// The final order of question IDs after sync.
    /// Temporary IDs (starting with "temp_") will be mapped to real IDs.
    /// </summary>
    public IReadOnlyList<string> FinalOrder { get; init; } = [];
}

/// <summary>
/// Data for creating a new question in batch sync.
/// </summary>
public record CreateQuestionData
{
    /// <summary>
    /// Temporary ID used by the client to track this question.
    /// Will be mapped to a real ID after creation.
    /// </summary>
    public string TempId { get; init; } = string.Empty;

    public string Text { get; init; } = string.Empty;
    public string? Description { get; init; }
    public QuestionType Type { get; init; }
    public bool IsRequired { get; init; }
    public int? Order { get; init; }
    public QuestionSettingsDto? Settings { get; init; }
    public bool IsNpsQuestion { get; init; }
    public NpsQuestionType? NpsType { get; init; }
    public string? LanguageCode { get; init; }
}

/// <summary>
/// Data for updating an existing question in batch sync.
/// </summary>
public record UpdateQuestionData
{
    public Guid QuestionId { get; init; }
    public string Text { get; init; } = string.Empty;
    public string? Description { get; init; }
    public QuestionType Type { get; init; }
    public bool IsRequired { get; init; }
    public int? Order { get; init; }
    public QuestionSettingsDto? Settings { get; init; }
    public bool IsNpsQuestion { get; init; }
    public NpsQuestionType? NpsType { get; init; }
    public string? LanguageCode { get; init; }
}

/// <summary>
/// Result of the batch sync operation.
/// </summary>
public record BatchSyncQuestionsResult
{
    /// <summary>
    /// Successfully created questions with their temp ID to real ID mapping.
    /// </summary>
    public IReadOnlyList<CreatedQuestionResult> Created { get; init; } = [];

    /// <summary>
    /// Successfully updated questions.
    /// </summary>
    public IReadOnlyList<QuestionDto> Updated { get; init; } = [];

    /// <summary>
    /// IDs of successfully deleted questions.
    /// </summary>
    public IReadOnlyList<Guid> Deleted { get; init; } = [];

    /// <summary>
    /// Whether reordering was successful.
    /// </summary>
    public bool Reordered { get; init; }

    /// <summary>
    /// Any errors that occurred during the operation.
    /// </summary>
    public IReadOnlyList<BatchSyncError> Errors { get; init; } = [];
}

/// <summary>
/// Result for a created question, mapping temp ID to real ID.
/// </summary>
public record CreatedQuestionResult
{
    public string TempId { get; init; } = string.Empty;
    public Guid RealId { get; init; }
    public QuestionDto Question { get; init; } = null!;
}

/// <summary>
/// Error information for failed operations in batch sync.
/// </summary>
public record BatchSyncError
{
    public string Operation { get; init; } = string.Empty;
    public string? QuestionId { get; init; }
    public string Message { get; init; } = string.Empty;
}
