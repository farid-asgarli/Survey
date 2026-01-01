using System.Text.RegularExpressions;
using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.ValueObjects;

/// <summary>
/// Represents an email address value object with validation.
/// </summary>
public sealed partial class Email : ValueObject
{
    /// <summary>
    /// Maximum length for an email address.
    /// </summary>
    public const int MaxLength = 256;

    /// <summary>
    /// Gets the email address value.
    /// </summary>
    public string Value { get; }

    private Email(string value)
    {
        Value = value;
    }

    /// <summary>
    /// Creates a new email address value object.
    /// </summary>
    /// <param name="email">The email address string.</param>
    /// <returns>A new Email value object.</returns>
    /// <exception cref="DomainException">Thrown when the email is invalid.</exception>
    public static Email Create(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new DomainException("Domain.ValueObjects.Email.EmailEmpty");

        email = email.Trim().ToLowerInvariant();

        if (email.Length > MaxLength)
            throw new DomainException("Domain.ValueObjects.Email.MaxLengthExceeded", MaxLength);

        if (!EmailRegex().IsMatch(email))
            throw new DomainException("Domain.ValueObjects.Email.EmailInvalidFormat");

        return new Email(email);
    }

    /// <summary>
    /// Tries to create a new email address value object.
    /// </summary>
    /// <param name="email">The email address string.</param>
    /// <param name="result">The created Email value object if successful.</param>
    /// <returns>True if the email is valid, false otherwise.</returns>
    public static bool TryCreate(string? email, out Email? result)
    {
        result = null;

        if (string.IsNullOrWhiteSpace(email))
            return false;

        email = email.Trim().ToLowerInvariant();

        if (email.Length > MaxLength)
            return false;

        if (!EmailRegex().IsMatch(email))
            return false;

        result = new Email(email);
        return true;
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    public static implicit operator string(Email email) => email.Value;

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase | RegexOptions.Compiled)]
    private static partial Regex EmailRegex();
}
