using FluentValidation.Results;

namespace SurveyApp.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when validation fails.
/// </summary>
public class ValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException()
        : base("Errors.ValidationErrors")
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IDictionary<string, string[]> errors)
        : base("Errors.ValidationErrors")
    {
        Errors = errors;
    }

    public ValidationException(string propertyName, string errorMessage)
        : base("Errors.ValidationErrors")
    {
        Errors = new Dictionary<string, string[]> { { propertyName, new[] { errorMessage } } };
    }

    public ValidationException(IEnumerable<ValidationFailure> failures)
        : base("Errors.ValidationErrors")
    {
        Errors = failures
            .GroupBy(f => f.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(f => f.ErrorMessage).ToArray());
    }
}
