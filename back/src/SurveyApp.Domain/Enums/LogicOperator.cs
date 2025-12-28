namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the comparison operator for conditional logic evaluation.
/// </summary>
public enum LogicOperator
{
    /// <summary>
    /// Value equals the condition value.
    /// </summary>
    Equals = 0,

    /// <summary>
    /// Value does not equal the condition value.
    /// </summary>
    NotEquals = 1,

    /// <summary>
    /// Value contains the condition value (for text).
    /// </summary>
    Contains = 2,

    /// <summary>
    /// Value does not contain the condition value (for text).
    /// </summary>
    NotContains = 3,

    /// <summary>
    /// Value is greater than the condition value (for numeric).
    /// </summary>
    GreaterThan = 4,

    /// <summary>
    /// Value is less than the condition value (for numeric).
    /// </summary>
    LessThan = 5,

    /// <summary>
    /// Value is greater than or equal to the condition value (for numeric).
    /// </summary>
    GreaterThanOrEquals = 6,

    /// <summary>
    /// Value is less than or equal to the condition value (for numeric).
    /// </summary>
    LessThanOrEquals = 7,

    /// <summary>
    /// Value is empty or null.
    /// </summary>
    IsEmpty = 8,

    /// <summary>
    /// Value is not empty or null.
    /// </summary>
    IsNotEmpty = 9,

    /// <summary>
    /// Question has been answered.
    /// </summary>
    IsAnswered = 10,

    /// <summary>
    /// Question has not been answered.
    /// </summary>
    IsNotAnswered = 11,
}
