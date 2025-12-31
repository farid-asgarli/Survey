using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Themes.Commands.SetDefaultTheme;

/// <summary>
/// Handler for setting a theme as default.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class SetDefaultThemeCommandHandler(
    ISurveyThemeRepository themeRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext
) : IRequestHandler<SetDefaultThemeCommand, Result<bool>>
{
    private readonly ISurveyThemeRepository _themeRepository = themeRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;

    public async Task<Result<bool>> Handle(
        SetDefaultThemeCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Get the theme to set as default with change tracking
        var theme = await _themeRepository.GetByIdForUpdateAsync(
            request.ThemeId,
            cancellationToken
        );
        if (theme == null)
        {
            return Result<bool>.Failure("Handler.ThemeNotFound");
        }

        // Verify theme belongs to namespace
        if (theme.NamespaceId != ctx.NamespaceId)
        {
            return Result<bool>.Failure("Handler.ThemeNotFoundInNamespace");
        }

        // If already default, nothing to do
        if (theme.IsDefault)
        {
            return Result<bool>.Success(true);
        }

        // Get current default theme and unset it
        var currentDefault = await _themeRepository.GetDefaultByNamespaceIdForUpdateAsync(
            ctx.NamespaceId,
            cancellationToken
        );
        if (currentDefault != null)
        {
            currentDefault.SetAsDefault(false);
            _themeRepository.Update(currentDefault);
        }

        // Set new default
        theme.SetAsDefault(true);
        _themeRepository.Update(theme);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
