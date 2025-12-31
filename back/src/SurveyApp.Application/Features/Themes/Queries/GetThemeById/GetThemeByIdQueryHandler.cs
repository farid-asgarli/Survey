using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Themes.Queries.GetThemeById;

public class GetThemeByIdQueryHandler(
    ISurveyThemeRepository themeRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetThemeByIdQuery, Result<SurveyThemeDto>>
{
    private readonly ISurveyThemeRepository _themeRepository = themeRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<SurveyThemeDto>> Handle(
        GetThemeByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<SurveyThemeDto>.Failure("Handler.NamespaceContextRequired");
        }

        var theme = await _themeRepository.GetByIdAsync(request.ThemeId, cancellationToken);

        if (theme is null)
        {
            return Result<SurveyThemeDto>.Failure($"Errors.EntityNotFound|Theme|{request.ThemeId}");
        }

        // Check namespace access - allow if same namespace or if theme is public
        if (theme.NamespaceId != namespaceId.Value && !theme.IsPublic)
        {
            return Result<SurveyThemeDto>.Failure("Handler.NoAccessToTheme");
        }

        var dto = MapToDto(theme);

        return Result<SurveyThemeDto>.Success(dto);
    }

    private static SurveyThemeDto MapToDto(SurveyTheme theme)
    {
        return new SurveyThemeDto
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
    }
}
