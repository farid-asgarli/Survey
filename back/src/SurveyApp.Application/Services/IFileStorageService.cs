namespace SurveyApp.Application.Services;

public interface IFileStorageService
{
    Task<string> UploadFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default
    );
    Task<Stream> DownloadFileAsync(string fileId, CancellationToken cancellationToken = default);
    Task<bool> DeleteFileAsync(string fileId, CancellationToken cancellationToken = default);
    Task<FileInfo> GetFileInfoAsync(string fileId, CancellationToken cancellationToken = default);
    string GetFileUrl(string fileId);
}

public record FileInfo
{
    public string Id { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long Size { get; init; }
    public DateTime CreatedAt { get; init; }
    public string Url { get; init; } = string.Empty;
}
