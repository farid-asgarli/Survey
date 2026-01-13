using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Categories.Commands.CreateCategory;

/// <summary>
/// Command to create a new survey category.
/// </summary>
public record CreateCategoryCommand : IRequest<Result<SurveyCategoryDto>>, INamespaceCommand
{
    public static NamespacePermission RequiredPermission => NamespacePermission.ManageSettings;

    public string Name { get; init; } = null!;
    public string? Description { get; init; }
    public string? Color { get; init; }
    public string? Icon { get; init; }
    public string LanguageCode { get; init; } = "en";
}
