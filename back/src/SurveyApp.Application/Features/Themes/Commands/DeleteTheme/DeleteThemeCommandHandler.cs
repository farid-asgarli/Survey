using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Themes.Commands.DeleteTheme;

/// <summary>
/// Handler for deleting a theme.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class DeleteThemeCommandHandler(
    ISurveyThemeRepository themeRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext
) : IRequestHandler<DeleteThemeCommand, Result<bool>>
{
    private readonly ISurveyThemeRepository _themeRepository = themeRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;

    public async Task<Result<bool>> Handle(
        DeleteThemeCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Get existing theme
        var theme = await _themeRepository.GetByIdAsync(request.ThemeId, cancellationToken);
        if (theme == null)
        {
            return Result<bool>.Failure("Theme not found.");
        }

        // Verify theme belongs to namespace
        if (theme.NamespaceId != ctx.NamespaceId)
        {
            return Result<bool>.Failure("Theme not found in this namespace.");
        }

        // Don't allow deleting default theme
        if (theme.IsDefault)
        {
            return Result<bool>.Failure(
                "Cannot delete the default theme. Set another theme as default first."
            );
        }

        // Check if theme is in use
        if (theme.UsageCount > 0)
        {
            return Result<bool>.Failure(
                $"Cannot delete theme. It is currently used by {theme.UsageCount} survey(s)."
            );
        }

        _themeRepository.Remove(theme);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
