using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Themes.Commands.DuplicateTheme;

/// <summary>
/// Handler for duplicating a theme.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class DuplicateThemeCommandHandler(
    ISurveyThemeRepository themeRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<DuplicateThemeCommand, Result<SurveyThemeDto>>
{
    private readonly ISurveyThemeRepository _themeRepository = themeRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyThemeDto>> Handle(
        DuplicateThemeCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Get existing theme
        var theme = await _themeRepository.GetByIdAsync(request.ThemeId, cancellationToken);
        if (theme == null)
        {
            return Result<SurveyThemeDto>.Failure("Handler.ThemeNotFound");
        }

        // Verify theme belongs to namespace
        if (theme.NamespaceId != ctx.NamespaceId)
        {
            return Result<SurveyThemeDto>.Failure("Handler.ThemeNotFoundInNamespace");
        }

        // Generate new name if not provided
        var newName = request.NewName;
        if (string.IsNullOrWhiteSpace(newName))
        {
            newName = $"{theme.Name} (Copy)";
            var counter = 1;
            while (
                await _themeRepository.ExistsByNameAsync(
                    ctx.NamespaceId,
                    newName,
                    cancellationToken: cancellationToken
                )
            )
            {
                counter++;
                newName = $"{theme.Name} (Copy {counter})";
            }
        }
        else
        {
            // Check for duplicate name
            if (
                await _themeRepository.ExistsByNameAsync(
                    ctx.NamespaceId,
                    newName,
                    cancellationToken: cancellationToken
                )
            )
            {
                return Result<SurveyThemeDto>.Failure(
                    $"A theme with the name '{newName}' already exists."
                );
            }
        }

        // Create duplicate
        var duplicate = theme.Duplicate(newName);

        _themeRepository.Add(duplicate);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SurveyThemeDto>.Success(MapToDto(duplicate));
    }

    private static SurveyThemeDto MapToDto(SurveyTheme theme)
    {
        return new SurveyThemeDto
        {
            Id = theme.Id,
            NamespaceId = theme.NamespaceId,
            Name = theme.Name,
            Description = theme.Description,
            IsDefault = theme.IsDefault,
            IsPublic = theme.IsPublic,
            Colors = new ThemeColorsDto
            {
                Primary = theme.PrimaryColor,
                Secondary = theme.SecondaryColor,
                Background = theme.BackgroundColor,
                Text = theme.TextColor,
                Accent = theme.AccentColor,
                Error = theme.ErrorColor,
                Success = theme.SuccessColor,
            },
            Typography = new ThemeTypographyDto
            {
                FontFamily = theme.FontFamily,
                HeadingFontFamily = theme.HeadingFontFamily,
                BaseFontSize = theme.BaseFontSize,
            },
            Layout = new ThemeLayoutDto
            {
                Layout = theme.Layout,
                BackgroundImageUrl = theme.BackgroundImageUrl,
                BackgroundPosition = theme.BackgroundPosition,
                ShowProgressBar = theme.ShowProgressBar,
                ProgressBarStyle = theme.ProgressBarStyle,
            },
            Branding = new ThemeBrandingDto
            {
                LogoUrl = theme.LogoUrl,
                LogoPosition = theme.LogoPosition,
                LogoSize = theme.LogoSize,
                ShowLogoBackground = theme.ShowLogoBackground,
                LogoBackgroundColor = theme.LogoBackgroundColor,
                BrandingTitle = theme.BrandingTitle,
                BrandingSubtitle = theme.BrandingSubtitle,
                ShowPoweredBy = theme.ShowPoweredBy,
            },
            Button = new ThemeButtonDto
            {
                Style = theme.ButtonStyle,
                TextColor = theme.ButtonTextColor,
            },
            CustomCss = theme.CustomCss,
            UsageCount = theme.UsageCount,
            CreatedAt = theme.CreatedAt,
            UpdatedAt = theme.UpdatedAt,
        };
    }
}
