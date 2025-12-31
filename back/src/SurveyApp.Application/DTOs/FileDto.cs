namespace SurveyApp.Application.DTOs;

/// <summary>
/// Response model for single file upload.
/// </summary>
public record FileUploadResponseDto
{
    public string FileId { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public string Url { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long Size { get; init; }
    public string? Category { get; init; }
}

/// <summary>
/// Response model for bulk file upload.
/// </summary>
public record BulkFileUploadResponseDto
{
    public List<FileUploadResultDto> Results { get; init; } = [];
    public int SuccessCount { get; init; }
    public int FailureCount { get; init; }
}

/// <summary>
/// Result model for individual file in bulk upload.
/// </summary>
public record FileUploadResultDto
{
    public string FileName { get; init; } = string.Empty;
    public bool Success { get; init; }
    public string? FileId { get; init; }
    public string? Url { get; init; }
    public long? Size { get; init; }
    public string? Error { get; init; }
}

/// <summary>
/// File information DTO.
/// </summary>
public record FileInfoDto
{
    public string Id { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long Size { get; init; }
    public DateTime CreatedAt { get; init; }
    public string Url { get; init; } = string.Empty;
}
