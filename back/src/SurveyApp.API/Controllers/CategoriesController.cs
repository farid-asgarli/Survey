using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.API.Extensions;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Application.Features.Categories.Commands.CreateCategory;
using SurveyApp.Application.Features.Categories.Commands.DeleteCategory;
using SurveyApp.Application.Features.Categories.Commands.ReorderCategories;
using SurveyApp.Application.Features.Categories.Commands.SetDefaultCategory;
using SurveyApp.Application.Features.Categories.Commands.UpdateCategory;
using SurveyApp.Application.Features.Categories.Queries.GetCategories;
using SurveyApp.Application.Features.Categories.Queries.GetCategoryById;
using SurveyApp.Application.Features.Categories.Queries.GetCategoryOptions;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for managing survey categories.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Gets all categories in the current namespace.
    /// </summary>
    /// <param name="query">Query parameters for filtering and pagination.</param>
    /// <returns>Paginated list of categories.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<SurveyCategorySummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetCategories([FromQuery] GetCategoriesQuery query)
    {
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Gets all category options for dropdowns/select boxes.
    /// </summary>
    /// <returns>List of category options.</returns>
    [HttpGet("options")]
    [ProducesResponseType(typeof(IReadOnlyList<CategoryOptionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategoryOptions()
    {
        var result = await _mediator.Send(new GetCategoryOptionsQuery());
        return HandleResult(result);
    }

    /// <summary>
    /// Gets a category by its ID.
    /// </summary>
    /// <param name="id">The category ID.</param>
    /// <returns>The category details.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SurveyCategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCategoryById(Guid id)
    {
        var result = await _mediator.Send(new GetCategoryByIdQuery(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Creates a new category.
    /// </summary>
    /// <param name="command">The category creation command.</param>
    /// <returns>The created category.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(SurveyCategoryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleCreatedResult(result, nameof(GetCategoryById), v => new { id = v.Id });
    }

    /// <summary>
    /// Updates an existing category.
    /// </summary>
    /// <param name="id">The category ID.</param>
    /// <param name="command">The category update command.</param>
    /// <returns>The updated category.</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(SurveyCategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCategory(
        Guid id,
        [FromBody] UpdateCategoryCommand command
    )
    {
        if (ValidateIdMatch(id, command.CategoryId) is { } mismatchResult)
            return mismatchResult;

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Deletes a category.
    /// </summary>
    /// <param name="id">The category ID.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var result = await _mediator.Send(new DeleteCategoryCommand(id));
        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Sets a category as the default for the namespace.
    /// </summary>
    /// <param name="id">The category ID.</param>
    /// <returns>No content.</returns>
    [HttpPost("{id:guid}/set-default")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetDefaultCategory(Guid id)
    {
        var result = await _mediator.Send(new SetDefaultCategoryCommand(id));
        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Reorders the categories in the namespace.
    /// </summary>
    /// <param name="command">The reorder command with the new order.</param>
    /// <returns>No content.</returns>
    [HttpPost("reorder")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ReorderCategories([FromBody] ReorderCategoriesCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleNoContentResult(result);
    }
}
