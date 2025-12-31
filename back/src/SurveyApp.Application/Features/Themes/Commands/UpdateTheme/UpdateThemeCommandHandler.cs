using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Themes.Commands.UpdateTheme;

/// <summary>
/// Handler for updating a theme.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class UpdateThemeCommandHandler(
    ISurveyThemeRepository themeRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<UpdateThemeCommand, Result<SurveyThemeDto>>
{
    private readonly ISurveyThemeRepository _themeRepository = themeRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyThemeDto>> Handle(
        UpdateThemeCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Get existing theme with change tracking for updates
        var theme = await _themeRepository.GetByIdForUpdateAsync(
            request.ThemeId,
            cancellationToken
        );
        if (theme == null)
        {
            return Result<SurveyThemeDto>.Failure("Handler.ThemeNotFound");
        }

        // Verify theme belongs to namespace
        if (theme.NamespaceId != ctx.NamespaceId)
        {
            return Result<SurveyThemeDto>.Failure("Handler.ThemeNotFoundInNamespace");
        }

        // Check for duplicate name (excluding current theme)
        if (
            await _themeRepository.ExistsByNameAsync(
                ctx.NamespaceId,
                request.Name,
                request.ThemeId,
                cancellationToken
            )
        )
        {
            return Result<SurveyThemeDto>.Failure($"Errors.ThemeNameExists|{request.Name}");
        }

        // Update theme properties with localization support
        if (!string.IsNullOrEmpty(request.LanguageCode))
        {
            // Update specific language translation
            theme.AddOrUpdateTranslation(request.LanguageCode, request.Name, request.Description);
        }
        else
        {
            // Update default language
            theme.UpdateName(request.Name);
            theme.UpdateDescription(request.Description);
        }
        theme.SetPublic(request.IsPublic);

        theme.UpdateColors(
            // Primary
            primaryColor: request.Colors.Primary,
            onPrimaryColor: request.Colors.OnPrimary,
            primaryContainerColor: request.Colors.PrimaryContainer,
            onPrimaryContainerColor: request.Colors.OnPrimaryContainer,
            // Secondary
            secondaryColor: request.Colors.Secondary,
            onSecondaryColor: request.Colors.OnSecondary,
            secondaryContainerColor: request.Colors.SecondaryContainer,
            onSecondaryContainerColor: request.Colors.OnSecondaryContainer,
            // Surface
            surfaceColor: request.Colors.Surface,
            surfaceContainerLowestColor: request.Colors.SurfaceContainerLowest,
            surfaceContainerLowColor: request.Colors.SurfaceContainerLow,
            surfaceContainerColor: request.Colors.SurfaceContainer,
            surfaceContainerHighColor: request.Colors.SurfaceContainerHigh,
            surfaceContainerHighestColor: request.Colors.SurfaceContainerHighest,
            onSurfaceColor: request.Colors.OnSurface,
            onSurfaceVariantColor: request.Colors.OnSurfaceVariant,
            // Outline
            outlineColor: request.Colors.Outline,
            outlineVariantColor: request.Colors.OutlineVariant,
            // Semantic
            errorColor: request.Colors.Error,
            successColor: request.Colors.Success,
            // Legacy
            accentColor: request.Colors.Accent
        );

        theme.UpdateTypography(
            request.Typography.FontFamily,
            request.Typography.HeadingFontFamily,
            request.Typography.BaseFontSize
        );

        theme.UpdateLayout(
            request.Layout.Layout,
            request.Layout.BackgroundImageUrl,
            request.Layout.BackgroundPosition,
            request.Layout.ShowProgressBar,
            request.Layout.ProgressBarStyle
        );

        theme.UpdateBranding(
            request.Branding.LogoUrl,
            request.Branding.LogoPosition,
            request.Branding.LogoSize,
            request.Branding.ShowLogoBackground,
            request.Branding.LogoBackgroundColor,
            request.Branding.BrandingTitle,
            request.Branding.BrandingSubtitle,
            request.Branding.ShowPoweredBy
        );

        theme.UpdateButtonStyle(request.Button.Style, request.Button.TextColor);

        theme.UpdateCustomCss(request.CustomCss);

        _themeRepository.Update(theme);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SurveyThemeDto>.Success(MapToDto(theme));
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
