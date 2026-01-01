using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Services;

/// <summary>
/// Debug service to inspect DbContext state for troubleshooting.
/// </summary>
public class DbContextDebugService(ApplicationDbContext context) : IDbContextDebugService
{
    private readonly ApplicationDbContext _context = context;

    public string GetTrackedEntitiesDebugInfo()
    {
        var sb = new StringBuilder();
        sb.AppendLine("=== TRACKED ENTITIES ===");

        var entries = _context.ChangeTracker.Entries().ToList();
        sb.AppendLine($"Total tracked entities: {entries.Count}");

        foreach (var entry in entries)
        {
            var entityType = entry.Entity.GetType().Name;
            var state = entry.State.ToString();

            sb.AppendLine($"  [{state}] {entityType}");

            // Get the primary key
            var primaryKey = entry.Metadata.FindPrimaryKey();
            if (primaryKey != null)
            {
                var keyValues = primaryKey
                    .Properties.Select(p => $"{p.Name}={entry.Property(p.Name).CurrentValue}")
                    .ToList();
                sb.AppendLine($"    PK: {string.Join(", ", keyValues)}");
            }

            // For modified entities, show what changed
            if (entry.State == EntityState.Modified)
            {
                var modifiedProps = entry
                    .Properties.Where(p => p.IsModified)
                    .Select(p => $"{p.Metadata.Name}: {p.OriginalValue} -> {p.CurrentValue}")
                    .ToList();

                if (modifiedProps.Any())
                {
                    sb.AppendLine($"    Modified properties:");
                    foreach (var prop in modifiedProps)
                    {
                        sb.AppendLine($"      - {prop}");
                    }
                }
            }

            // For added entities, show key properties
            if (entry.State == EntityState.Added)
            {
                sb.AppendLine($"    (New entity to be inserted)");
            }
        }

        sb.AppendLine("=== END TRACKED ENTITIES ===");
        return sb.ToString();
    }

    public async Task<(bool Exists, bool IsDeleted, string? DebugInfo)> CheckResponseExistsAsync(
        Guid responseId,
        CancellationToken cancellationToken = default
    )
    {
        // Bypass query filter by using IgnoreQueryFilters
        var response = await _context
            .SurveyResponses.IgnoreQueryFilters()
            .Where(r => r.Id == responseId)
            .Select(r => new
            {
                r.Id,
                r.SurveyId,
                r.SurveyLinkId,
                r.IsComplete,
                r.IsDeleted,
                r.StartedAt,
                r.SubmittedAt,
                r.CreatedAt,
                r.UpdatedAt,
                AnswerCount = r.Answers.Count(),
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (response == null)
        {
            return (
                false,
                false,
                $"Response {responseId} NOT FOUND in database (even with IgnoreQueryFilters)"
            );
        }

        var debugInfo = JsonSerializer.Serialize(
            response,
            new JsonSerializerOptions { WriteIndented = true }
        );
        return (true, response.IsDeleted, debugInfo);
    }

    public async Task<(bool Exists, bool IsDeleted, string? DebugInfo)> CheckLinkExistsAsync(
        Guid linkId,
        CancellationToken cancellationToken = default
    )
    {
        // Bypass query filter by using IgnoreQueryFilters
        var link = await _context
            .SurveyLinks.IgnoreQueryFilters()
            .Where(l => l.Id == linkId)
            .Select(l => new
            {
                l.Id,
                l.SurveyId,
                l.Token,
                l.IsActive,
                l.IsDeleted,
                l.UsageCount,
                l.ResponseCount,
                l.CreatedAt,
                l.UpdatedAt,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (link == null)
        {
            return (
                false,
                false,
                $"Link {linkId} NOT FOUND in database (even with IgnoreQueryFilters)"
            );
        }

        var debugInfo = JsonSerializer.Serialize(
            link,
            new JsonSerializerOptions { WriteIndented = true }
        );
        return (true, link.IsDeleted, debugInfo);
    }
}
