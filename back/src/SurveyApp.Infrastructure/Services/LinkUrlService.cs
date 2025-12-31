using Microsoft.Extensions.Configuration;
using SurveyApp.Application.Common.Interfaces;

namespace SurveyApp.Infrastructure.Services;

/// <summary>
/// Service for generating survey link URLs.
/// </summary>
public class LinkUrlService(IConfiguration configuration) : ILinkUrlService
{
    private readonly string _baseUrl =
        configuration["Application:BaseUrl"] ?? "https://localhost:5001";

    public string BaseUrl => _baseUrl;

    public string BuildLinkUrl(string token)
    {
        return $"{_baseUrl}/s/{token}";
    }

    public string BuildQrCodeUrl(string token)
    {
        return $"{_baseUrl}/s/{token}/qr.png";
    }
}
