using AutoMapper;
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
        // No common mappings needed - PagedResponse is used directly
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
