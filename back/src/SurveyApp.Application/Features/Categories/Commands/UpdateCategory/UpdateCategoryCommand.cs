using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Categories.Commands.UpdateCategory;

/// <summary>
/// Command to update an existing survey category.
/// </summary>
public record UpdateCategoryCommand : IRequest<Result<SurveyCategoryDto>>, INamespaceCommand
{
    public static NamespacePermission RequiredPermission => NamespacePermission.ManageSettings;

    public Guid CategoryId { get; init; }
    public string Name { get; init; } = null!;
    public string? Description { get; init; }
    public string? Color { get; init; }
    public string? Icon { get; init; }
    public int? DisplayOrder { get; init; }
    public string? LanguageCode { get; init; }
}
