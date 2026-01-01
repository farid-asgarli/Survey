using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.Services;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Infrastructure.Identity;
using SurveyApp.Infrastructure.Persistence;
using SurveyApp.Infrastructure.Repositories;
using SurveyApp.Infrastructure.Services;

namespace SurveyApp.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        // Database contexts (PostgreSQL)
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)
            )
        );

        services.AddDbContext<ApplicationIdentityDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("IdentityConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationIdentityDbContext).Assembly.FullName)
            )
        );

        // Identity
        services
            .AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequiredLength = 8;
                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = false;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
                options.Lockout.MaxFailedAccessAttempts = 5;
            })
            .AddEntityFrameworkStores<ApplicationIdentityDbContext>()
            .AddDefaultTokenProviders();

        // JWT Authentication
        var jwtSettings = new JwtSettings();
        configuration.Bind(JwtSettings.SectionName, jwtSettings);
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtSettings.Secret)
                    ),
                    ClockSkew = TimeSpan.Zero,
                };
            });

        // Repositories
        services.AddScoped<INamespaceRepository, NamespaceRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IUserPreferencesRepository, UserPreferencesRepository>();
        services.AddScoped<ISurveyRepository, SurveyRepository>();
        services.AddScoped<ISurveyResponseRepository, SurveyResponseRepository>();
        services.AddScoped<ISurveyTemplateRepository, SurveyTemplateRepository>();
        services.AddScoped<IQuestionLogicRepository, QuestionLogicRepository>();
        services.AddScoped<ISurveyThemeRepository, SurveyThemeRepository>();
        services.AddScoped<IRecurringSurveyRepository, RecurringSurveyRepository>();
        services.AddScoped<IEmailTemplateRepository, EmailTemplateRepository>();
        services.AddScoped<IEmailDistributionRepository, EmailDistributionRepository>();
        services.AddScoped<ISurveyLinkRepository, SurveyLinkRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Services
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddSingleton<IDateTimeService, DateTimeService>();
        services.AddScoped<INotificationService, EmailNotificationService>();

        // Debug service for troubleshooting
        services.AddScoped<IDbContextDebugService, DbContextDebugService>();

        // File storage configuration
        services.Configure<FileStorageOptions>(
            configuration.GetSection(FileStorageOptions.SectionName)
        );
        services.AddScoped<IFileStorageService, LocalFileStorageService>();

        // File validation configuration
        services.Configure<Application.Services.Files.FileValidationOptions>(
            configuration.GetSection(Application.Services.Files.FileValidationOptions.SectionName)
        );
        services.AddScoped<
            Application.Services.Files.IFileValidationService,
            FileValidationService
        >();

        services.AddScoped<ILogicEvaluationService, LogicEvaluationService>();
        services.AddScoped<IExportService, ExportService>();
        services.AddScoped<INpsService, NpsService>();
        services.AddScoped<IEmailDistributionService, EmailDistributionService>();
        services.AddScoped<ILinkUrlService, LinkUrlService>();

        // Database seeder
        services.AddScoped<Persistence.DatabaseSeeder>();

        return services;
    }
}
