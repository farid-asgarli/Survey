using SurveyApp.Application.Common.Interfaces;

namespace SurveyApp.API.Services;

public class NamespaceContext : INamespaceContext
{
    public Guid? CurrentNamespaceId { get; set; }
    public Guid? NamespaceId => CurrentNamespaceId;
    public string? CurrentNamespaceSlug { get; set; }
    public bool HasNamespace => CurrentNamespaceId.HasValue;

    public void SetNamespaceId(Guid namespaceId)
    {
        CurrentNamespaceId = namespaceId;
    }

    public void Clear()
    {
        CurrentNamespaceId = null;
        CurrentNamespaceSlug = null;
    }
}
