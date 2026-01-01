using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;

namespace SurveyApp.Application.Validators.Common;

/// <summary>
/// Base validator for paged queries that automatically validates pagination parameters.
/// Extend this class for queries that inherit from <see cref="PagedQuery"/>.
/// </summary>
/// <typeparam name="T">The query type that inherits from <see cref="PagedQuery"/>.</typeparam>
/// <remarks>
/// Initializes a new instance of the paged query validator.
/// </remarks>
/// <param name="localizer">The string localizer service.</param>
public abstract class PagedQueryValidator<T>(IStringLocalizer localizer)
    : LocalizedValidator<T>(localizer)
    where T : PagedQuery
{
    /// <summary>
    /// Adds standard pagination validation rules for PageNumber and PageSize.
    /// Call this method in the constructor of derived validators to include pagination validation.
    /// </summary>
    protected void AddPaginationRules()
    {
        RuleFor(x => x.PageNumber).ValidPageNumber();

        RuleFor(x => x.PageSize).ValidPageSize();
    }
}
