namespace SurveyApp.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when access to a resource is forbidden.
/// </summary>
public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException()
        : base("Errors.AccessToResourceForbidden") { }

    public ForbiddenAccessException(string message)
        : base(message) { }
}
