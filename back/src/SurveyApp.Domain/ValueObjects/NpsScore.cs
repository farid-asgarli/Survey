using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.ValueObjects;

/// <summary>
/// Represents a calculated Net Promoter Score (NPS) with its breakdown.
/// </summary>
public sealed class NpsScore : ValueObject
{
    /// <summary>
    /// Gets the count of promoters (scores 9-10).
    /// </summary>
    public int Promoters { get; }

    /// <summary>
    /// Gets the count of passives (scores 7-8).
    /// </summary>
    public int Passives { get; }

    /// <summary>
    /// Gets the count of detractors (scores 0-6).
    /// </summary>
    public int Detractors { get; }

    /// <summary>
    /// Gets the total number of responses.
    /// </summary>
    public int TotalResponses { get; }

    /// <summary>
    /// Gets the NPS score calculated as ((Promoters - Detractors) / Total) * 100.
    /// </summary>
    public decimal Score { get; }

    /// <summary>
    /// Gets the percentage of promoters.
    /// </summary>
    public decimal PromoterPercentage =>
        TotalResponses > 0 ? Math.Round((decimal)Promoters / TotalResponses * 100, 2) : 0;

    /// <summary>
    /// Gets the percentage of passives.
    /// </summary>
    public decimal PassivePercentage =>
        TotalResponses > 0 ? Math.Round((decimal)Passives / TotalResponses * 100, 2) : 0;

    /// <summary>
    /// Gets the percentage of detractors.
    /// </summary>
    public decimal DetractorPercentage =>
        TotalResponses > 0 ? Math.Round((decimal)Detractors / TotalResponses * 100, 2) : 0;

    /// <summary>
    /// Gets the category of the NPS score.
    /// </summary>
    public NpsCategory Category =>
        Score switch
        {
            >= 70 => NpsCategory.Excellent,
            >= 50 => NpsCategory.Great,
            >= 0 => NpsCategory.Good,
            _ => NpsCategory.NeedsImprovement,
        };

    private NpsScore(int promoters, int passives, int detractors, int totalResponses, decimal score)
    {
        Promoters = promoters;
        Passives = passives;
        Detractors = detractors;
        TotalResponses = totalResponses;
        Score = score;
    }

    /// <summary>
    /// Creates an NPS score from a list of numeric responses (0-10).
    /// </summary>
    /// <param name="responses">List of numeric responses from 0 to 10.</param>
    /// <returns>Calculated NPS score.</returns>
    public static NpsScore Calculate(IEnumerable<int> responses)
    {
        var responseList = responses.ToList();

        if (responseList.Count == 0)
        {
            return Empty();
        }

        // Filter only valid NPS responses (0-10)
        var validResponses = responseList.Where(r => r >= 0 && r <= 10).ToList();

        if (validResponses.Count == 0)
        {
            return Empty();
        }

        var promoters = validResponses.Count(r => r >= 9);
        var passives = validResponses.Count(r => r >= 7 && r <= 8);
        var detractors = validResponses.Count(r => r <= 6);
        var total = validResponses.Count;

        var score = Math.Round(((decimal)(promoters - detractors) / total) * 100, 2);

        return new NpsScore(promoters, passives, detractors, total, score);
    }

    /// <summary>
    /// Creates an NPS score from pre-calculated values.
    /// </summary>
    public static NpsScore Create(int promoters, int passives, int detractors)
    {
        var total = promoters + passives + detractors;
        var score =
            total > 0 ? Math.Round(((decimal)(promoters - detractors) / total) * 100, 2) : 0;

        return new NpsScore(promoters, passives, detractors, total, score);
    }

    /// <summary>
    /// Creates an empty NPS score.
    /// </summary>
    public static NpsScore Empty()
    {
        return new NpsScore(0, 0, 0, 0, 0);
    }

    /// <summary>
    /// Gets a human-readable description of the NPS category.
    /// </summary>
    public string GetCategoryDescription() =>
        Category switch
        {
            NpsCategory.Excellent => "Excellent - World-class customer loyalty",
            NpsCategory.Great => "Great - Strong customer loyalty",
            NpsCategory.Good => "Good - Room for improvement",
            NpsCategory.NeedsImprovement => "Needs Improvement - Focus on customer experience",
            _ => "Unknown",
        };

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Promoters;
        yield return Passives;
        yield return Detractors;
        yield return TotalResponses;
        yield return Score;
    }
}
