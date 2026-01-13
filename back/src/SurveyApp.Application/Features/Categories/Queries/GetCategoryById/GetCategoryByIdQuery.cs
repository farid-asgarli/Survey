using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Categories.Queries.GetCategoryById;

/// <summary>
/// Query to get a category by its ID.
/// </summary>
public record GetCategoryByIdQuery(Guid CategoryId) : IRequest<Result<SurveyCategoryDto>>;
