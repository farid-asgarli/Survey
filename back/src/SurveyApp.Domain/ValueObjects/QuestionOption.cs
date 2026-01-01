using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.ValueObjects;

/// <summary>
/// Represents a selectable option for choice-based questions.
/// Options have stable IDs for reliable aggregation even when text changes.
/// </summary>
public sealed class QuestionOption : ValueObject
{
    /// <summary>
    /// Unique identifier for this option. Used for answer aggregation.
    /// </summary>
    public Guid Id { get; }

    /// <summary>
    /// Display text for this option.
    /// </summary>
    public string Text { get; }

    /// <summary>
    /// Display order in the option list.
    /// </summary>
    public int Order { get; }

    private QuestionOption(Guid id, string text, int order)
    {
        if (string.IsNullOrWhiteSpace(text))
            throw new DomainException("Domain.QuestionOption.TextEmpty");

        Id = id;
        Text = text;
        Order = order;
    }

    /// <summary>
    /// Creates a new option with a generated ID.
    /// </summary>
    public static QuestionOption Create(string text, int order)
    {
        return new QuestionOption(Guid.NewGuid(), text, order);
    }

    /// <summary>
    /// Restores an option from persistence.
    /// </summary>
    public static QuestionOption Restore(Guid id, string text, int order)
    {
        return new QuestionOption(id, text, order);
    }

    /// <summary>
    /// Creates a copy with updated text (preserves ID).
    /// </summary>
    public QuestionOption WithText(string newText)
    {
        return new QuestionOption(Id, newText, Order);
    }

    /// <summary>
    /// Creates a copy with updated order.
    /// </summary>
    public QuestionOption WithOrder(int newOrder)
    {
        return new QuestionOption(Id, Text, newOrder);
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Id;
    }
}
