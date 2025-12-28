using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Common.Interfaces;

/// <summary>
/// Service interface for exporting survey responses.
/// </summary>
public interface IExportService
{
    /// <summary>
    /// Exports survey responses to CSV format.
    /// </summary>
    /// <param name="request">The export request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The export result containing the CSV data.</returns>
    Task<ExportResult> ExportToCsvAsync(
        ExportRequest request,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Exports survey responses to Excel format.
    /// </summary>
    /// <param name="request">The export request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The export result containing the Excel data.</returns>
    Task<ExportResult> ExportToExcelAsync(
        ExportRequest request,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Exports survey responses to JSON format.
    /// </summary>
    /// <param name="request">The export request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The export result containing the JSON data.</returns>
    Task<ExportResult> ExportToJsonAsync(
        ExportRequest request,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets a preview of the export structure.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Preview information about the export.</returns>
    Task<ExportPreviewDto> GetExportPreviewAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    );
}
