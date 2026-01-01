using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Themes.Queries.GetPublicThemes;

public class GetPublicThemesQueryHandler(
    ISurveyThemeRepository themeRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetPublicThemesQuery, Result<PagedResponse<SurveyThemeSummaryDto>>>
{
    private readonly ISurveyThemeRepository _themeRepository = themeRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<PagedResponse<SurveyThemeSummaryDto>>> Handle(
        GetPublicThemesQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<PagedResponse<SurveyThemeSummaryDto>>.Failure(
                "Errors.NamespaceContextRequired"
            );
        }

        var (themes, totalCount) = await _themeRepository.GetPublicThemesPagedAsync(
            namespaceId.Value,
            request.PageNumber,
            request.PageSize,
            request.SearchTerm,
            cancellationToken
        );

        var dtos = themes.Select(MapToSummaryDto).ToList();

        var pagedResponse = PagedResponse<SurveyThemeSummaryDto>.Create(
            dtos,
            request.PageNumber,
            request.PageSize,
            totalCount
        );

        return Result<PagedResponse<SurveyThemeSummaryDto>>.Success(pagedResponse);
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
