using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Themes.Queries.GetPublicThemes;

public class GetPublicThemesQueryHandler(
    ISurveyThemeRepository themeRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetPublicThemesQuery, Result<IReadOnlyList<SurveyThemeSummaryDto>>>
{
    private readonly ISurveyThemeRepository _themeRepository = themeRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<IReadOnlyList<SurveyThemeSummaryDto>>> Handle(
        GetPublicThemesQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<IReadOnlyList<SurveyThemeSummaryDto>>.Failure(
                "Handler.NamespaceContextRequired"
            );
        }

        var themes = await _themeRepository.GetPublicThemesByNamespaceIdAsync(
            namespaceId.Value,
            cancellationToken
        );

        var dtos = themes.Select(MapToSummaryDto).ToList();

        return Result<IReadOnlyList<SurveyThemeSummaryDto>>.Success(dtos);
    }

    private static SurveyThemeSummaryDto MapToSummaryDto(SurveyTheme theme)
    {
        return new SurveyThemeSummaryDto
        {
            Id = theme.Id,
            Name = theme.Name,
            Description = theme.Description,
            IsDefault = theme.IsDefault,
            IsPublic = theme.IsPublic,
            IsSystem = theme.IsSystem,
            IsDark = theme.IsDark,
            PrimaryColor = theme.PrimaryColor,
            SecondaryColor = theme.SecondaryColor,
            BackgroundColor = theme.BackgroundColor,
            Layout = theme.Layout,
            UsageCount = theme.UsageCount,
            CreatedAt = theme.CreatedAt,
        };
    }
}
