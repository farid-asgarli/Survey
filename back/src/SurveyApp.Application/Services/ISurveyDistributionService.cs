namespace SurveyApp.Application.Services;

public interface ISurveyDistributionService
{
    Task<string> GenerateShareLinkAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    );
    Task SendSurveyInvitationsAsync(
        Guid surveyId,
        IEnumerable<string> emails,
        string? message = null,
        CancellationToken cancellationToken = default
    );
    Task<SurveyEmbedCode> GenerateEmbedCodeAsync(
        Guid surveyId,
        EmbedOptions? options = null,
        CancellationToken cancellationToken = default
    );
}

public record SurveyEmbedCode
{
    public string IframeCode { get; init; } = string.Empty;
    public string ScriptCode { get; init; } = string.Empty;
    public string ShareUrl { get; init; } = string.Empty;
}

public record EmbedOptions
{
    public int? Width { get; init; }
    public int? Height { get; init; }
    public bool ShowBorder { get; init; } = true;
    public string? BackgroundColor { get; init; }
}
