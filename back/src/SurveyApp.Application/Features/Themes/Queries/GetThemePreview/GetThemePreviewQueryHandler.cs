using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Themes.Queries.GetThemePreview;

public class GetThemePreviewQueryHandler(
    ISurveyThemeRepository themeRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetThemePreviewQuery, Result<ThemePreviewDto>>
{
    private readonly ISurveyThemeRepository _themeRepository = themeRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<ThemePreviewDto>> Handle(
        GetThemePreviewQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<ThemePreviewDto>.Failure("Handler.NamespaceContextRequired");
        }

        var theme = await _themeRepository.GetByIdAsync(request.ThemeId, cancellationToken);

        if (theme is null)
        {
            return Result<ThemePreviewDto>.Failure(
                $"Theme with ID '{request.ThemeId}' was not found."
            );
        }

        // Check namespace access - allow if same namespace or if theme is public
        if (theme.NamespaceId != namespaceId.Value && !theme.IsPublic)
        {
            return Result<ThemePreviewDto>.Failure("Handler.NoAccessToTheme");
        }

        var generatedCss = theme.GenerateCss();

        var themeDto = new SurveyThemeDto
        {
            Id = theme.Id,
            Name = theme.Name,
            Description = theme.Description,
            NamespaceId = theme.NamespaceId,
            IsDefault = theme.IsDefault,
            IsPublic = theme.IsPublic,
            IsSystem = theme.IsSystem,
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

        var preview = new ThemePreviewDto { Theme = themeDto, GeneratedCss = generatedCss };

        return Result<ThemePreviewDto>.Success(preview);
    }
}
