using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Themes.Commands.CreateTheme;

/// <summary>
/// Handler for creating a new survey theme.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class CreateThemeCommandHandler(
    ISurveyThemeRepository themeRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<CreateThemeCommand, Result<SurveyThemeDto>>
{
    private readonly ISurveyThemeRepository _themeRepository = themeRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyThemeDto>> Handle(
        CreateThemeCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Check for duplicate name
        if (
            await _themeRepository.ExistsByNameAsync(
                ctx.NamespaceId,
                request.Name,
                cancellationToken: cancellationToken
            )
        )
        {
            return Result<SurveyThemeDto>.Failure(
                $"A theme with the name '{request.Name}' already exists."
            );
        }

        // Create theme with localization support
        var theme = SurveyTheme.Create(
            ctx.NamespaceId,
            request.Name,
            request.LanguageCode,
            request.Description
        );
        theme.SetPublic(request.IsPublic);

        // Apply colors if provided
        if (request.Colors != null)
        {
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
        }

        // Apply typography if provided
        if (request.Typography != null)
        {
            theme.UpdateTypography(
                request.Typography.FontFamily,
                request.Typography.HeadingFontFamily,
                request.Typography.BaseFontSize
            );
        }

        // Apply layout if provided
        if (request.Layout != null)
        {
            theme.UpdateLayout(
                request.Layout.Layout,
                request.Layout.BackgroundImageUrl,
                request.Layout.BackgroundPosition,
                request.Layout.ShowProgressBar,
                request.Layout.ProgressBarStyle
            );
        }

        // Apply branding if provided
        if (request.Branding != null)
        {
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
        }

        // Apply button style if provided
        if (request.Button != null)
        {
            theme.UpdateButtonStyle(request.Button.Style, request.Button.TextColor);
        }

        // Apply custom CSS
        if (!string.IsNullOrWhiteSpace(request.CustomCss))
        {
            theme.UpdateCustomCss(request.CustomCss);
        }

        _themeRepository.Add(theme);
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
