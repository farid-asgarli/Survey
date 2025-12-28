using Microsoft.EntityFrameworkCore;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Repositories;

public class UserPreferencesRepository(ApplicationDbContext context) : IUserPreferencesRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<UserPreferences?> GetByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context.UserPreferences.FirstOrDefaultAsync(
            up => up.UserId == userId,
            cancellationToken
        );
    }

    public async Task<UserPreferences?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context.UserPreferences.FirstOrDefaultAsync(
            up => up.Id == id,
            cancellationToken
        );
    }

    public async Task<UserPreferences?> AddAsync(
        UserPreferences preferences,
        CancellationToken cancellationToken = default
    )
    {
        // Verify the user exists before adding preferences
        var userExists = await _context.Users.AnyAsync(
            u => u.Id == preferences.UserId,
            cancellationToken
        );
        if (!userExists)
        {
            return null;
        }

        await _context.UserPreferences.AddAsync(preferences, cancellationToken);
        return preferences;
    }

    public void Update(UserPreferences preferences)
    {
        _context.UserPreferences.Update(preferences);
    }

    public async Task<UserPreferences?> GetOrCreateAsync(
        Guid userId,
        CancellationToken cancellationToken = default
    )
    {
        var existing = await GetByUserIdAsync(userId, cancellationToken);
        if (existing != null)
        {
            return existing;
        }

        // Check if the user exists in the Users table before creating preferences
        var userExists = await _context.Users.AnyAsync(u => u.Id == userId, cancellationToken);
        if (!userExists)
        {
            // User doesn't exist in domain Users table - can't create preferences
            // This can happen if the user exists in Identity but not in domain
            return null;
        }

        var preferences = UserPreferences.CreateDefault(userId);
        await _context.UserPreferences.AddAsync(preferences, cancellationToken);
        return preferences;
    }
}
