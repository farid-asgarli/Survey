namespace SurveyApp.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when a requested entity is not found.
/// </summary>
public class NotFoundException : Exception
{
    public string EntityName { get; }
    public object Key { get; }

    public NotFoundException(string entityName, object key)
        : base($"Errors.EntityNotFound|{entityName}|{key}")
    {
        EntityName = entityName;
        Key = key;
    }

    public NotFoundException(string message)
        : base(message)
    {
        EntityName = string.Empty;
        Key = string.Empty;
    }
}
