using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Common;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence;

public class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    ICurrentUserService currentUserService,
    IDateTimeService dateTimeService
) : DbContext(options)
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IDateTimeService _dateTimeService = dateTimeService;

    public DbSet<Namespace> Namespaces => Set<Namespace>();
    public DbSet<User> Users => Set<User>();
    public DbSet<NamespaceMembership> NamespaceMemberships => Set<NamespaceMembership>();
    public DbSet<Survey> Surveys => Set<Survey>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuestionLogic> QuestionLogics => Set<QuestionLogic>();
    public DbSet<SurveyTheme> SurveyThemes => Set<SurveyTheme>();
    public DbSet<SurveyResponse> SurveyResponses => Set<SurveyResponse>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<SurveyTemplate> SurveyTemplates => Set<SurveyTemplate>();
    public DbSet<TemplateQuestion> TemplateQuestions => Set<TemplateQuestion>();
    public DbSet<RecurringSurvey> RecurringSurveys => Set<RecurringSurvey>();
    public DbSet<RecurringSurveyRun> RecurringSurveyRuns => Set<RecurringSurveyRun>();
    public DbSet<EmailTemplate> EmailTemplates => Set<EmailTemplate>();
    public DbSet<EmailDistribution> EmailDistributions => Set<EmailDistribution>();
    public DbSet<EmailRecipient> EmailRecipients => Set<EmailRecipient>();
    public DbSet<SurveyLink> SurveyLinks => Set<SurveyLink>();
    public DbSet<LinkClick> LinkClicks => Set<LinkClick>();
    public DbSet<UserPreferences> UserPreferences => Set<UserPreferences>();

    // Translation tables
    public DbSet<SurveyTranslation> SurveyTranslations => Set<SurveyTranslation>();
    public DbSet<QuestionTranslation> QuestionTranslations => Set<QuestionTranslation>();
    public DbSet<SurveyTemplateTranslation> SurveyTemplateTranslations =>
        Set<SurveyTemplateTranslation>();
    public DbSet<TemplateQuestionTranslation> TemplateQuestionTranslations =>
        Set<TemplateQuestionTranslation>();
    public DbSet<EmailTemplateTranslation> EmailTemplateTranslations =>
        Set<EmailTemplateTranslation>();
    public DbSet<SurveyThemeTranslation> SurveyThemeTranslations => Set<SurveyThemeTranslation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from the assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Apply global query filter for soft delete
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(IAuditable).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = System.Linq.Expressions.Expression.Parameter(
                    entityType.ClrType,
                    "e"
                );
                var property = System.Linq.Expressions.Expression.Property(
                    parameter,
                    nameof(IAuditable.IsDeleted)
                );
                var filter = System.Linq.Expressions.Expression.Lambda(
                    System.Linq.Expressions.Expression.Equal(
                        property,
                        System.Linq.Expressions.Expression.Constant(false)
                    ),
                    parameter
                );

                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(filter);
            }
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditableEntities();
        return await base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        UpdateAuditableEntities();
        return base.SaveChanges();
    }

    private void UpdateAuditableEntities()
    {
        var userId = _currentUserService.UserId;
        var now = _dateTimeService.UtcNow;

        foreach (var entry in ChangeTracker.Entries<IAuditable>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = now;
                    entry.Entity.CreatedBy = userId;
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = now;
                    entry.Entity.UpdatedBy = userId;
                    break;

                case EntityState.Deleted:
                    // Implement soft delete
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.DeletedAt = now;
                    entry.Entity.DeletedBy = userId;
                    break;
            }
        }
    }
}
