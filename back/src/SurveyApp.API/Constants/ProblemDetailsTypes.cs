using System.Net;

namespace SurveyApp.API.Constants;

/// <summary>
/// Centralized RFC 7231/7235 problem type URIs for ProblemDetails responses.
/// These URIs follow the RFC 7807 specification for Problem Details for HTTP APIs.
/// </summary>
/// <remarks>
/// RFC 7231 Section 6.5.x covers client error responses (4xx).
/// RFC 7231 Section 6.6.x covers server error responses (5xx).
/// RFC 7235 Section 3.1 covers 401 Unauthorized (authentication).
/// </remarks>
public static class ProblemDetailsTypes
{
    private const string Rfc7231Base = "https://tools.ietf.org/html/rfc7231";
    private const string Rfc7235Base = "https://tools.ietf.org/html/rfc7235";

    #region Client Error Responses (4xx)

    /// <summary>
    /// 400 Bad Request - RFC 7231 Section 6.5.1
    /// The server cannot or will not process the request due to client error.
    /// </summary>
    public const string BadRequest = $"{Rfc7231Base}#section-6.5.1";

    /// <summary>
    /// 401 Unauthorized - RFC 7235 Section 3.1
    /// Authentication is required and has failed or not been provided.
    /// </summary>
    public const string Unauthorized = $"{Rfc7235Base}#section-3.1";

    /// <summary>
    /// 403 Forbidden - RFC 7231 Section 6.5.3
    /// The server understood the request but refuses to authorize it.
    /// </summary>
    public const string Forbidden = $"{Rfc7231Base}#section-6.5.3";

    /// <summary>
    /// 404 Not Found - RFC 7231 Section 6.5.4
    /// The origin server did not find the target resource.
    /// </summary>
    public const string NotFound = $"{Rfc7231Base}#section-6.5.4";

    /// <summary>
    /// 405 Method Not Allowed - RFC 7231 Section 6.5.5
    /// The method is not allowed for the target resource.
    /// </summary>
    public const string MethodNotAllowed = $"{Rfc7231Base}#section-6.5.5";

    /// <summary>
    /// 406 Not Acceptable - RFC 7231 Section 6.5.6
    /// The target resource does not have a representation acceptable to the client.
    /// </summary>
    public const string NotAcceptable = $"{Rfc7231Base}#section-6.5.6";

    /// <summary>
    /// 408 Request Timeout - RFC 7231 Section 6.5.7
    /// The server did not receive a complete request in time.
    /// </summary>
    public const string RequestTimeout = $"{Rfc7231Base}#section-6.5.7";

    /// <summary>
    /// 409 Conflict - RFC 7231 Section 6.5.8
    /// The request conflicts with the current state of the target resource.
    /// </summary>
    public const string Conflict = $"{Rfc7231Base}#section-6.5.8";

    /// <summary>
    /// 410 Gone - RFC 7231 Section 6.5.9
    /// The target resource is no longer available at the origin server.
    /// </summary>
    public const string Gone = $"{Rfc7231Base}#section-6.5.9";

    /// <summary>
    /// 411 Length Required - RFC 7231 Section 6.5.10
    /// The server refuses to accept the request without a defined Content-Length.
    /// </summary>
    public const string LengthRequired = $"{Rfc7231Base}#section-6.5.10";

    /// <summary>
    /// 413 Payload Too Large - RFC 7231 Section 6.5.11
    /// The request payload is larger than the server is willing to process.
    /// </summary>
    public const string PayloadTooLarge = $"{Rfc7231Base}#section-6.5.11";

    /// <summary>
    /// 414 URI Too Long - RFC 7231 Section 6.5.12
    /// The request-target is longer than the server is willing to interpret.
    /// </summary>
    public const string UriTooLong = $"{Rfc7231Base}#section-6.5.12";

    /// <summary>
    /// 415 Unsupported Media Type - RFC 7231 Section 6.5.13
    /// The media type of the request payload is not supported.
    /// </summary>
    public const string UnsupportedMediaType = $"{Rfc7231Base}#section-6.5.13";

    /// <summary>
    /// 417 Expectation Failed - RFC 7231 Section 6.5.14
    /// The expectation in the Expect request-header field could not be met.
    /// </summary>
    public const string ExpectationFailed = $"{Rfc7231Base}#section-6.5.14";

    /// <summary>
    /// 426 Upgrade Required - RFC 7231 Section 6.5.15
    /// The server refuses to perform the request using the current protocol.
    /// </summary>
    public const string UpgradeRequired = $"{Rfc7231Base}#section-6.5.15";

    #endregion

    #region Server Error Responses (5xx)

    /// <summary>
    /// 500 Internal Server Error - RFC 7231 Section 6.6.1
    /// The server encountered an unexpected condition that prevented it from fulfilling the request.
    /// </summary>
    public const string InternalServerError = $"{Rfc7231Base}#section-6.6.1";

    /// <summary>
    /// 501 Not Implemented - RFC 7231 Section 6.6.2
    /// The server does not support the functionality required to fulfill the request.
    /// </summary>
    public const string NotImplemented = $"{Rfc7231Base}#section-6.6.2";

    /// <summary>
    /// 502 Bad Gateway - RFC 7231 Section 6.6.3
    /// The server received an invalid response from an upstream server.
    /// </summary>
    public const string BadGateway = $"{Rfc7231Base}#section-6.6.3";

    /// <summary>
    /// 503 Service Unavailable - RFC 7231 Section 6.6.4
    /// The server is currently unable to handle the request.
    /// </summary>
    public const string ServiceUnavailable = $"{Rfc7231Base}#section-6.6.4";

    /// <summary>
    /// 504 Gateway Timeout - RFC 7231 Section 6.6.5
    /// The server did not receive a timely response from an upstream server.
    /// </summary>
    public const string GatewayTimeout = $"{Rfc7231Base}#section-6.6.5";

    /// <summary>
    /// 505 HTTP Version Not Supported - RFC 7231 Section 6.6.6
    /// The server does not support the HTTP protocol version used in the request.
    /// </summary>
    public const string HttpVersionNotSupported = $"{Rfc7231Base}#section-6.6.6";

    #endregion

    /// <summary>
    /// Gets the appropriate problem type URI for a given HTTP status code.
    /// </summary>
    /// <param name="statusCode">The HTTP status code.</param>
    /// <returns>The RFC problem type URI for the status code.</returns>
    public static string GetTypeForStatusCode(int statusCode) =>
        statusCode switch
        {
            400 => BadRequest,
            401 => Unauthorized,
            403 => Forbidden,
            404 => NotFound,
            405 => MethodNotAllowed,
            406 => NotAcceptable,
            408 => RequestTimeout,
            409 => Conflict,
            410 => Gone,
            411 => LengthRequired,
            413 => PayloadTooLarge,
            414 => UriTooLong,
            415 => UnsupportedMediaType,
            417 => ExpectationFailed,
            426 => UpgradeRequired,
            500 => InternalServerError,
            501 => NotImplemented,
            502 => BadGateway,
            503 => ServiceUnavailable,
            504 => GatewayTimeout,
            505 => HttpVersionNotSupported,
            _ => statusCode >= 500 ? InternalServerError : BadRequest,
        };

    /// <summary>
    /// Gets the appropriate problem type URI for a given HttpStatusCode enum.
    /// </summary>
    /// <param name="statusCode">The HTTP status code enum.</param>
    /// <returns>The RFC problem type URI for the status code.</returns>
    public static string GetTypeForStatusCode(HttpStatusCode statusCode) =>
        GetTypeForStatusCode((int)statusCode);
}
