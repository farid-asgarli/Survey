namespace SurveyApp.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when a namespace-related error occurs.
/// </summary>
public class NamespaceException : Exception
{
    public Guid? NamespaceId { get; }

    public NamespaceException(string message)
        : base(message) { }

    public NamespaceException(string message, Guid namespaceId)
        : base(message)
    {
        NamespaceId = namespaceId;
    }
}
