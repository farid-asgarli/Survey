using AutoMapper;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Common;

namespace SurveyApp.Application.Mappings;

/// <summary>
/// AutoMapper profile for common mapping configurations.
/// Provides reusable mapping patterns for base entity types.
/// </summary>
public class CommonMappingProfile : Profile
{
    /// <summary>
    /// Initializes the common mapping profile.
    /// </summary>
    public CommonMappingProfile()
    {
        // PagedList to PagedResponse mapping
        CreateMap(typeof(PagedList<>), typeof(PagedResponse<>))
            .ConvertUsing(typeof(PagedListToPagedResponseConverter<,>));
    }
}

/// <summary>
/// Converter for PagedList to PagedResponse.
/// </summary>
/// <typeparam name="TSource">Source type.</typeparam>
/// <typeparam name="TDestination">Destination type.</typeparam>
public class PagedListToPagedResponseConverter<TSource, TDestination>
    : ITypeConverter<PagedList<TSource>, PagedResponse<TDestination>>
{
    /// <inheritdoc />
    public PagedResponse<TDestination> Convert(
        PagedList<TSource> source,
        PagedResponse<TDestination> destination,
        ResolutionContext context
    )
    {
        var mappedItems = context.Mapper.Map<IReadOnlyList<TDestination>>(source.Items);

        return new PagedResponse<TDestination>
        {
            Items = mappedItems,
            PageNumber = source.PageNumber,
            PageSize = source.PageSize,
            TotalCount = source.TotalCount,
        };
    }
}

/// <summary>
/// AutoMapper resolver for common entity properties.
/// </summary>
public static class CommonMappingHelpers
{
    /// <summary>
    /// Creates a standard mapping from Entity to DTO with audit properties.
    /// </summary>
    public static IMappingExpression<TSource, TDestination> MapAuditableProperties<
        TSource,
        TDestination
    >(this IMappingExpression<TSource, TDestination> mapping)
        where TSource : IAuditable
        where TDestination : IAuditableDto
    {
        return mapping
            .ForMember(d => d.CreatedAt, opt => opt.MapFrom(s => s.CreatedAt))
            .ForMember(d => d.CreatedBy, opt => opt.MapFrom(s => s.CreatedBy))
            .ForMember(d => d.UpdatedAt, opt => opt.MapFrom(s => s.UpdatedAt))
            .ForMember(d => d.UpdatedBy, opt => opt.MapFrom(s => s.UpdatedBy));
    }
}
