using Microsoft.Extensions.Logging;
using SurveyApp.Application.Services;

namespace SurveyApp.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly ILogger<LocalFileStorageService> _logger;
    private readonly string _basePath;
    private readonly string _baseUrl;

    public LocalFileStorageService(
        ILogger<LocalFileStorageService> logger,
        string basePath = "uploads",
        string baseUrl = "/files"
    )
    {
        _logger = logger;
        _basePath = basePath;
        _baseUrl = baseUrl;

        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
        }
    }

    public async Task<string> UploadFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default
    )
    {
        var fileId = Guid.NewGuid().ToString("N");
        var extension = Path.GetExtension(fileName);
        var storedFileName = $"{fileId}{extension}";
        var filePath = Path.Combine(_basePath, storedFileName);

        using var outputStream = new FileStream(filePath, FileMode.Create);
        await fileStream.CopyToAsync(outputStream, cancellationToken);

        _logger.LogInformation("File uploaded: {FileId} ({FileName})", fileId, fileName);
        return fileId;
    }

    public async Task<Stream> DownloadFileAsync(
        string fileId,
        CancellationToken cancellationToken = default
    )
    {
        var files = Directory.GetFiles(_basePath, $"{fileId}.*");
        if (files.Length == 0)
        {
            throw new FileNotFoundException($"File not found: {fileId}");
        }

        var stream = new MemoryStream();
        using var fileStream = new FileStream(files[0], FileMode.Open, FileAccess.Read);
        await fileStream.CopyToAsync(stream, cancellationToken);
        stream.Position = 0;
        return stream;
    }

    public Task<bool> DeleteFileAsync(string fileId, CancellationToken cancellationToken = default)
    {
        var files = Directory.GetFiles(_basePath, $"{fileId}.*");
        if (files.Length == 0)
        {
            return Task.FromResult(false);
        }

        foreach (var file in files)
        {
            File.Delete(file);
        }

        _logger.LogInformation("File deleted: {FileId}", fileId);
        return Task.FromResult(true);
    }

    public Task<Application.Services.FileInfo> GetFileInfoAsync(
        string fileId,
        CancellationToken cancellationToken = default
    )
    {
        var files = Directory.GetFiles(_basePath, $"{fileId}.*");
        if (files.Length == 0)
        {
            throw new FileNotFoundException($"File not found: {fileId}");
        }

        var filePath = files[0];
        var fileInfo = new System.IO.FileInfo(filePath);

        return Task.FromResult(
            new Application.Services.FileInfo
            {
                Id = fileId,
                FileName = fileInfo.Name,
                ContentType = GetContentType(fileInfo.Extension),
                Size = fileInfo.Length,
                CreatedAt = fileInfo.CreationTimeUtc,
                Url = GetFileUrl(fileId)
            }
        );
    }

    public string GetFileUrl(string fileId)
    {
        return $"{_baseUrl}/{fileId}";
    }

    private static string GetContentType(string extension)
    {
        return extension.ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            _ => "application/octet-stream"
        };
    }
}
