using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.ValueObjects;
using SurveyApp.Infrastructure.Identity;

namespace SurveyApp.Infrastructure.Persistence;

/// <summary>
/// Seeds the database with comprehensive realistic data for testing all modules.
/// </summary>
public class DatabaseSeeder(
    ApplicationDbContext dbContext,
    ApplicationIdentityDbContext identityDbContext,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    ILogger<DatabaseSeeder> logger
)
{
    private readonly ApplicationDbContext _dbContext = dbContext;
    private readonly ApplicationIdentityDbContext _identityDbContext = identityDbContext;
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly RoleManager<IdentityRole> _roleManager = roleManager;
    private readonly ILogger<DatabaseSeeder> _logger = logger;

    // Organization details
    private const string DefaultNamespaceSlug = "acme-corp";
    private const string DefaultNamespaceName = "Acme Corporation";

    // Admin user
    private const string AdminEmail = "admin@acmecorp.com";
    private const string AdminPassword = "Admin@123456";
    private const string AdminFirstName = "Sarah";
    private const string AdminLastName = "Mitchell";

    // Additional test users
    private static readonly (
        string Email,
        string FirstName,
        string LastName,
        string Role
    )[] TestUsers =
    [
        ("john.doe@acmecorp.com", "John", "Doe", "Member"),
        ("emily.chen@acmecorp.com", "Emily", "Chen", "Member"),
        ("michael.johnson@acmecorp.com", "Michael", "Johnson", "Viewer"),
        ("lisa.wong@acmecorp.com", "Lisa", "Wong", "Member"),
    ];

    /// <summary>
    /// Seeds the database with initial data.
    /// </summary>
    public async Task SeedAsync()
    {
        await ApplyMigrationsAsync();
        await SeedRolesAsync();
        await SeedDefaultNamespaceAndUsersAsync();
    }

    private async Task ApplyMigrationsAsync()
    {
        try
        {
            _logger.LogInformation("Applying database migrations...");
            await _dbContext.Database.MigrateAsync();
            await _identityDbContext.Database.MigrateAsync();
            _logger.LogInformation("Database migrations applied successfully");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Migration failed, attempting to create database...");
            await _dbContext.Database.EnsureCreatedAsync();
            await _identityDbContext.Database.EnsureCreatedAsync();
        }
    }

    private async Task SeedRolesAsync()
    {
        var roles = new[] { "Admin", "User", "Owner", "Member", "Viewer" };
        foreach (var roleName in roles)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                _logger.LogInformation("Creating role: {RoleName}", roleName);
                await _roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }
    }

    private async Task SeedDefaultNamespaceAndUsersAsync()
    {
        var existingNamespace = await _dbContext.Namespaces.FirstOrDefaultAsync(n =>
            n.Slug == DefaultNamespaceSlug
        );
        if (existingNamespace != null)
        {
            // Check if surveys exist - if not, we need to reseed data
            var surveyCount = await _dbContext.Surveys.CountAsync(s =>
                s.NamespaceId == existingNamespace.Id
            );
            if (surveyCount > 0)
            {
                _logger.LogInformation(
                    "Default namespace already exists with {SurveyCount} surveys, skipping seed",
                    surveyCount
                );
                return;
            }

            _logger.LogInformation(
                "Default namespace exists but has no surveys, reseeding data..."
            );

            // Get existing users for this namespace
            var existingUsers = await _dbContext
                .Users.Where(u =>
                    _dbContext.NamespaceMemberships.Any(m =>
                        m.NamespaceId == existingNamespace.Id && m.UserId == u.Id
                    )
                )
                .ToListAsync();

            if (existingUsers.Count > 0)
            {
                // Reseed only surveys, themes, and email templates
                await SeedThemesAsync(existingNamespace.Id);
                await SeedEmailTemplatesAsync(existingNamespace.Id);
                await SeedSurveysAsync(existingNamespace.Id, existingUsers);
                _logger.LogInformation("Reseeded surveys and related data successfully");
                return;
            }
        }

        _logger.LogInformation("Creating comprehensive seed data...");

        // Create namespace
        var ns = Namespace.Create(
            DefaultNamespaceName,
            DefaultNamespaceSlug,
            SubscriptionTier.Enterprise
        );
        _dbContext.Namespaces.Add(ns);

        // Create admin user
        var adminUser = await CreateUserAsync(
            AdminEmail,
            AdminPassword,
            AdminFirstName,
            AdminLastName,
            "Admin",
            ns.Id,
            NamespaceRole.Owner
        );

        // Create additional users
        var users = new List<User> { adminUser };
        foreach (var (email, firstName, lastName, role) in TestUsers)
        {
            var user = await CreateUserAsync(
                email,
                AdminPassword,
                firstName,
                lastName,
                role,
                ns.Id,
                role == "Member" ? NamespaceRole.Member : NamespaceRole.Viewer
            );
            users.Add(user);
        }

        await _dbContext.SaveChangesAsync();

        // Seed all modules
        await SeedThemesAsync(ns.Id);
        await SeedEmailTemplatesAsync(ns.Id);
        await SeedSurveysAsync(ns.Id, users);

        _logger.LogInformation("Comprehensive seed data created successfully");
    }

    private async Task<User> CreateUserAsync(
        string email,
        string password,
        string firstName,
        string lastName,
        string role,
        Guid namespaceId,
        NamespaceRole nsRole
    )
    {
        var domainUser = User.Create(email, string.Empty, firstName, lastName);
        _dbContext.Users.Add(domainUser);

        var existingIdentityUser = await _userManager.FindByEmailAsync(email);
        if (existingIdentityUser == null)
        {
            var identityUser = new ApplicationUser
            {
                Id = domainUser.Id.ToString(),
                UserName = email,
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                EmailConfirmed = true,
                DomainUserId = domainUser.Id,
            };

            var result = await _userManager.CreateAsync(identityUser, password);
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(identityUser, role);
                _logger.LogInformation("Created user: {Email} with role {Role}", email, role);
            }
        }

        var membership = NamespaceMembership.Create(domainUser.Id, namespaceId, nsRole);
        _dbContext.NamespaceMemberships.Add(membership);

        return domainUser;
    }

    private async Task SeedThemesAsync(Guid namespaceId)
    {
        _logger.LogInformation("Seeding themes...");

        // Ocean Theme (Default) - Professional blue
        var oceanTheme = SurveyTheme.Create(namespaceId, "Ocean");
        oceanTheme.UpdateDescription("Professional blue theme, clean and trustworthy");
        oceanTheme.SetAsDefault(true);
        oceanTheme.SetAsSystem(true);
        oceanTheme.UpdateColors(
            // Primary
            primaryColor: "#1976D2",
            onPrimaryColor: "#FFFFFF",
            primaryContainerColor: "#D1E4FF",
            onPrimaryContainerColor: "#001D36",
            // Secondary
            secondaryColor: "#535F70",
            onSecondaryColor: "#FFFFFF",
            secondaryContainerColor: "#D7E3F7",
            onSecondaryContainerColor: "#101C2B",
            // Surface
            surfaceColor: "#F8F9FF",
            surfaceContainerLowestColor: "#FFFFFF",
            surfaceContainerLowColor: "#F2F3F9",
            surfaceContainerColor: "#ECEDF3",
            surfaceContainerHighColor: "#E6E7ED",
            surfaceContainerHighestColor: "#E1E2E8",
            onSurfaceColor: "#191C20",
            onSurfaceVariantColor: "#42474E",
            // Outline
            outlineColor: "#72777F",
            outlineVariantColor: "#C2C7CF",
            // Semantic
            errorColor: "#BA1A1A",
            successColor: "#2AA86A"
        );
        oceanTheme.UpdateTypography("Inter", "Inter", 16);
        oceanTheme.UpdateLayout(
            ThemeLayout.Classic,
            null,
            BackgroundImagePosition.Cover,
            true,
            ProgressBarStyle.Bar
        );
        _dbContext.SurveyThemes.Add(oceanTheme);

        // Forest Theme - Natural green
        var forestTheme = SurveyTheme.Create(namespaceId, "Forest");
        forestTheme.UpdateDescription("Fresh green theme for environmental and wellness surveys");
        forestTheme.SetAsSystem(true);
        forestTheme.UpdateColors(
            // Primary
            primaryColor: "#2E7D32",
            onPrimaryColor: "#FFFFFF",
            primaryContainerColor: "#C8E6C9",
            onPrimaryContainerColor: "#002204",
            // Secondary
            secondaryColor: "#52634F",
            onSecondaryColor: "#FFFFFF",
            secondaryContainerColor: "#D5E8CF",
            onSecondaryContainerColor: "#101F10",
            // Surface
            surfaceColor: "#F7FBF6",
            surfaceContainerLowestColor: "#FFFFFF",
            surfaceContainerLowColor: "#F1F5F0",
            surfaceContainerColor: "#EBEFEA",
            surfaceContainerHighColor: "#E5E9E4",
            surfaceContainerHighestColor: "#E0E3DF",
            onSurfaceColor: "#181D18",
            onSurfaceVariantColor: "#404943",
            // Outline
            outlineColor: "#707973",
            outlineVariantColor: "#C0C9C1",
            // Semantic
            errorColor: "#BA1A1A",
            successColor: "#2E7D32"
        );
        forestTheme.UpdateTypography("Lato", "Lato", 16);
        forestTheme.UpdateLayout(
            ThemeLayout.Classic,
            null,
            BackgroundImagePosition.Cover,
            true,
            ProgressBarStyle.Bar
        );
        _dbContext.SurveyThemes.Add(forestTheme);

        // Sunset Theme - Warm orange
        var sunsetTheme = SurveyTheme.Create(namespaceId, "Sunset");
        sunsetTheme.UpdateDescription("Warm orange theme, energetic and creative");
        sunsetTheme.SetAsSystem(true);
        sunsetTheme.UpdateColors(
            // Primary
            primaryColor: "#E65100",
            onPrimaryColor: "#FFFFFF",
            primaryContainerColor: "#FFCC80",
            onPrimaryContainerColor: "#311300",
            // Secondary
            secondaryColor: "#77574A",
            onSecondaryColor: "#FFFFFF",
            secondaryContainerColor: "#FFDCC7",
            onSecondaryContainerColor: "#2C160C",
            // Surface
            surfaceColor: "#FFF8F6",
            surfaceContainerLowestColor: "#FFFFFF",
            surfaceContainerLowColor: "#FAF3F0",
            surfaceContainerColor: "#F4EDEA",
            surfaceContainerHighColor: "#EFE7E4",
            surfaceContainerHighestColor: "#E9E2DF",
            onSurfaceColor: "#201A18",
            onSurfaceVariantColor: "#52443C",
            // Outline
            outlineColor: "#84746B",
            outlineVariantColor: "#D7C2B8",
            // Semantic
            errorColor: "#BA1A1A",
            successColor: "#2AA86A"
        );
        sunsetTheme.UpdateTypography("Montserrat", "Montserrat", 16);
        sunsetTheme.UpdateLayout(
            ThemeLayout.Card,
            null,
            BackgroundImagePosition.Cover,
            true,
            ProgressBarStyle.Bar
        );
        _dbContext.SurveyThemes.Add(sunsetTheme);

        // Berry Theme - Pink/Magenta
        var berryTheme = SurveyTheme.Create(namespaceId, "Berry");
        berryTheme.UpdateDescription("Vibrant pink theme, playful and modern");
        berryTheme.SetAsSystem(true);
        berryTheme.UpdateColors(
            // Primary
            primaryColor: "#C2185B",
            onPrimaryColor: "#FFFFFF",
            primaryContainerColor: "#FFD8E7",
            onPrimaryContainerColor: "#3E001D",
            // Secondary
            secondaryColor: "#74565F",
            onSecondaryColor: "#FFFFFF",
            secondaryContainerColor: "#FFD8E2",
            onSecondaryContainerColor: "#2B151C",
            // Surface
            surfaceColor: "#FFF8F8",
            surfaceContainerLowestColor: "#FFFFFF",
            surfaceContainerLowColor: "#FAF2F3",
            surfaceContainerColor: "#F4ECED",
            surfaceContainerHighColor: "#EFE6E8",
            surfaceContainerHighestColor: "#E9E1E2",
            onSurfaceColor: "#201A1B",
            onSurfaceVariantColor: "#514347",
            // Outline
            outlineColor: "#837377",
            outlineVariantColor: "#D6C2C6",
            // Semantic
            errorColor: "#BA1A1A",
            successColor: "#2AA86A"
        );
        berryTheme.UpdateTypography("DM Sans", "DM Sans", 16);
        berryTheme.UpdateLayout(
            ThemeLayout.Classic,
            null,
            BackgroundImagePosition.Cover,
            true,
            ProgressBarStyle.Bar
        );
        _dbContext.SurveyThemes.Add(berryTheme);

        // Violet Theme - Purple (M3 Baseline)
        var violetTheme = SurveyTheme.Create(namespaceId, "Violet");
        violetTheme.UpdateDescription("Rich purple theme, creative and elegant");
        violetTheme.SetAsSystem(true);
        violetTheme.UpdateColors(
            // Primary
            primaryColor: "#6750A4",
            onPrimaryColor: "#FFFFFF",
            primaryContainerColor: "#EADDFF",
            onPrimaryContainerColor: "#21005D",
            // Secondary
            secondaryColor: "#625B71",
            onSecondaryColor: "#FFFFFF",
            secondaryContainerColor: "#E8DEF8",
            onSecondaryContainerColor: "#1D192B",
            // Surface
            surfaceColor: "#FEF7FF",
            surfaceContainerLowestColor: "#FFFFFF",
            surfaceContainerLowColor: "#F7F2FA",
            surfaceContainerColor: "#F3EDF7",
            surfaceContainerHighColor: "#ECE6F0",
            surfaceContainerHighestColor: "#E6E0E9",
            onSurfaceColor: "#1D1B20",
            onSurfaceVariantColor: "#49454F",
            // Outline
            outlineColor: "#79747E",
            outlineVariantColor: "#CAC4D0",
            // Semantic
            errorColor: "#B3261E",
            successColor: "#2AA86A"
        );
        violetTheme.UpdateTypography("Roboto", "Roboto", 16);
        violetTheme.UpdateLayout(
            ThemeLayout.Classic,
            null,
            BackgroundImagePosition.Cover,
            true,
            ProgressBarStyle.Bar
        );
        _dbContext.SurveyThemes.Add(violetTheme);

        // Slate Theme - Neutral gray
        var slateTheme = SurveyTheme.Create(namespaceId, "Slate");
        slateTheme.UpdateDescription("Neutral gray theme, professional and subtle");
        slateTheme.SetAsSystem(true);
        slateTheme.UpdateColors(
            // Primary
            primaryColor: "#475569",
            onPrimaryColor: "#FFFFFF",
            primaryContainerColor: "#CBD5E1",
            onPrimaryContainerColor: "#0F172A",
            // Secondary
            secondaryColor: "#64748B",
            onSecondaryColor: "#FFFFFF",
            secondaryContainerColor: "#E2E8F0",
            onSecondaryContainerColor: "#1E293B",
            // Surface
            surfaceColor: "#F8FAFC",
            surfaceContainerLowestColor: "#FFFFFF",
            surfaceContainerLowColor: "#F1F5F9",
            surfaceContainerColor: "#E2E8F0",
            surfaceContainerHighColor: "#CBD5E1",
            surfaceContainerHighestColor: "#94A3B8",
            onSurfaceColor: "#1E293B",
            onSurfaceVariantColor: "#475569",
            // Outline
            outlineColor: "#64748B",
            outlineVariantColor: "#CBD5E1",
            // Semantic
            errorColor: "#DC2626",
            successColor: "#16A34A"
        );
        slateTheme.UpdateTypography("Inter", "Inter", 16);
        slateTheme.UpdateLayout(
            ThemeLayout.Minimal,
            null,
            BackgroundImagePosition.Cover,
            true,
            ProgressBarStyle.Bar
        );
        _dbContext.SurveyThemes.Add(slateTheme);

        // Rose Theme - Red/Pink
        var roseTheme = SurveyTheme.Create(namespaceId, "Rose");
        roseTheme.UpdateDescription("Bold red theme, attention-grabbing and passionate");
        roseTheme.SetAsSystem(true);
        roseTheme.UpdateColors(
            // Primary
            primaryColor: "#E11D48",
            onPrimaryColor: "#FFFFFF",
            primaryContainerColor: "#FECDD3",
            onPrimaryContainerColor: "#4C0519",
            // Secondary
            secondaryColor: "#9F1239",
            onSecondaryColor: "#FFFFFF",
            secondaryContainerColor: "#FFE4E6",
            onSecondaryContainerColor: "#4C0519",
            // Surface
            surfaceColor: "#FFF1F2",
            surfaceContainerLowestColor: "#FFFFFF",
            surfaceContainerLowColor: "#FFE4E6",
            surfaceContainerColor: "#FECDD3",
            surfaceContainerHighColor: "#FBBCC4",
            surfaceContainerHighestColor: "#FDA4AF",
            onSurfaceColor: "#1F2937",
            onSurfaceVariantColor: "#4C0519",
            // Outline
            outlineColor: "#9F1239",
            outlineVariantColor: "#FECDD3",
            // Semantic
            errorColor: "#B91C1C",
            successColor: "#16A34A"
        );
        roseTheme.UpdateTypography("Open Sans", "Open Sans", 16);
        roseTheme.UpdateLayout(
            ThemeLayout.Classic,
            null,
            BackgroundImagePosition.Cover,
            true,
            ProgressBarStyle.Bar
        );
        _dbContext.SurveyThemes.Add(roseTheme);

        // Teal Theme - Blue-green
        var tealTheme = SurveyTheme.Create(namespaceId, "Teal");
        tealTheme.UpdateDescription("Refreshing teal theme, modern and sophisticated");
        tealTheme.SetAsSystem(true);
        tealTheme.UpdateColors(
            // Primary
            primaryColor: "#00796B",
            onPrimaryColor: "#FFFFFF",
            primaryContainerColor: "#B2DFDB",
            onPrimaryContainerColor: "#002019",
            // Secondary
            secondaryColor: "#4A6360",
            onSecondaryColor: "#FFFFFF",
            secondaryContainerColor: "#CCE8E4",
            onSecondaryContainerColor: "#05201D",
            // Surface
            surfaceColor: "#F4FFFE",
            surfaceContainerLowestColor: "#FFFFFF",
            surfaceContainerLowColor: "#EEF5F4",
            surfaceContainerColor: "#E8EFEE",
            surfaceContainerHighColor: "#E3E9E8",
            surfaceContainerHighestColor: "#DDE3E2",
            onSurfaceColor: "#171D1C",
            onSurfaceVariantColor: "#3F4947",
            // Outline
            outlineColor: "#6F7977",
            outlineVariantColor: "#BEC9C7",
            // Semantic
            errorColor: "#BA1A1A",
            successColor: "#2AA86A"
        );
        tealTheme.UpdateTypography("Lato", "Lato", 16);
        tealTheme.UpdateLayout(
            ThemeLayout.Classic,
            null,
            BackgroundImagePosition.Cover,
            true,
            ProgressBarStyle.Bar
        );
        _dbContext.SurveyThemes.Add(tealTheme);

        // Midnight Theme - Dark blue (Dark mode)
        var midnightTheme = SurveyTheme.Create(namespaceId, "Midnight");
        midnightTheme.UpdateDescription("Dark theme with deep blue, ideal for evening surveys");
        midnightTheme.SetAsSystem(true);
        midnightTheme.UpdateColors(
            // Primary
            primaryColor: "#A0C9FF",
            onPrimaryColor: "#003258",
            primaryContainerColor: "#00497D",
            onPrimaryContainerColor: "#D1E4FF",
            // Secondary
            secondaryColor: "#BBC7DB",
            onSecondaryColor: "#253140",
            secondaryContainerColor: "#3C4858",
            onSecondaryContainerColor: "#D7E3F7",
            // Surface
            surfaceColor: "#111318",
            surfaceContainerLowestColor: "#0C0E13",
            surfaceContainerLowColor: "#191C20",
            surfaceContainerColor: "#1D2024",
            surfaceContainerHighColor: "#282A2F",
            surfaceContainerHighestColor: "#32353A",
            onSurfaceColor: "#E1E2E8",
            onSurfaceVariantColor: "#C2C7CF",
            // Outline
            outlineColor: "#8C9199",
            outlineVariantColor: "#42474E",
            // Semantic
            errorColor: "#FFB4AB",
            successColor: "#80E8A8"
        );
        midnightTheme.UpdateTypography("Roboto", "Roboto", 16);
        midnightTheme.UpdateLayout(
            ThemeLayout.Classic,
            null,
            BackgroundImagePosition.Cover,
            true,
            ProgressBarStyle.Bar
        );
        _dbContext.SurveyThemes.Add(midnightTheme);

        // Charcoal Theme - Dark with orange accents (Dark mode)
        var charcoalTheme = SurveyTheme.Create(namespaceId, "Charcoal");
        charcoalTheme.UpdateDescription("Dark theme with warm orange accents, bold and modern");
        charcoalTheme.SetAsSystem(true);
        charcoalTheme.UpdateColors(
            // Primary
            primaryColor: "#FFB874",
            onPrimaryColor: "#512300",
            primaryContainerColor: "#723600",
            onPrimaryContainerColor: "#FFCC80",
            // Secondary
            secondaryColor: "#E6BEAC",
            onSecondaryColor: "#43261E",
            secondaryContainerColor: "#5D3D33",
            onSecondaryContainerColor: "#FFDCC7",
            // Surface
            surfaceColor: "#181210",
            surfaceContainerLowestColor: "#120D0B",
            surfaceContainerLowColor: "#201A18",
            surfaceContainerColor: "#241E1C",
            surfaceContainerHighColor: "#2F2926",
            surfaceContainerHighestColor: "#3A3331",
            onSurfaceColor: "#E9E2DF",
            onSurfaceVariantColor: "#D7C2B8",
            // Outline
            outlineColor: "#9F8D84",
            outlineVariantColor: "#52443C",
            // Semantic
            errorColor: "#FFB4AB",
            successColor: "#80E8A8"
        );
        charcoalTheme.UpdateTypography("Lato", "Lato", 16);
        charcoalTheme.UpdateLayout(
            ThemeLayout.Classic,
            null,
            BackgroundImagePosition.Cover,
            true,
            ProgressBarStyle.Bar
        );
        _dbContext.SurveyThemes.Add(charcoalTheme);

        await _dbContext.SaveChangesAsync();
    }

    private async Task SeedEmailTemplatesAsync(Guid namespaceId)
    {
        _logger.LogInformation("Seeding email templates...");

        // Survey Invitation Template
        var inviteTemplate = EmailTemplate.Create(
            namespaceId,
            "Professional Survey Invitation",
            EmailTemplateType.SurveyInvitation,
            "{{sender.name}} has invited you to complete a survey: {{survey.title}}",
            GetInvitationEmailHtml()
        );
        inviteTemplate.SetAsDefault();
        _dbContext.EmailTemplates.Add(inviteTemplate);

        // Reminder Template
        var reminderTemplate = EmailTemplate.Create(
            namespaceId,
            "Friendly Survey Reminder",
            EmailTemplateType.SurveyReminder,
            "Reminder: Please complete the survey - {{survey.title}}",
            GetReminderEmailHtml()
        );
        reminderTemplate.SetAsDefault();
        _dbContext.EmailTemplates.Add(reminderTemplate);

        // Thank You Template
        var thankYouTemplate = EmailTemplate.Create(
            namespaceId,
            "Survey Completion Thank You",
            EmailTemplateType.ThankYou,
            "Thank you for completing {{survey.title}}",
            GetThankYouEmailHtml()
        );
        thankYouTemplate.SetAsDefault();
        _dbContext.EmailTemplates.Add(thankYouTemplate);

        await _dbContext.SaveChangesAsync();
    }

    private async Task SeedSurveysAsync(Guid namespaceId, List<User> users)
    {
        var adminId = users[0].Id;
        var memberIds = users.Where(u => u.Email != AdminEmail).Select(u => u.Id).ToList();

        // 1. Customer Satisfaction Survey (Published with responses)
        await SeedCustomerSatisfactionSurveyAsync(namespaceId, adminId);

        // 2. Employee Engagement Survey (Published with responses)
        await SeedEmployeeEngagementSurveyAsync(namespaceId, memberIds[0]);

        // 3. Product Feedback Survey (Published, few responses)
        await SeedProductFeedbackSurveyAsync(namespaceId, memberIds[1]);

        // 4. Event Registration Form (Draft)
        await SeedEventRegistrationSurveyAsync(namespaceId, adminId);

        // 5. Website Usability Survey (Closed with responses)
        await SeedWebsiteUsabilitySurveyAsync(namespaceId, memberIds[0]);

        // 6. Market Research Survey (Published with question logic)
        await SeedMarketResearchSurveyAsync(namespaceId, memberIds[1]);

        // 7. Training Feedback Survey (Draft - template source)
        await SeedTrainingFeedbackSurveyAsync(namespaceId, adminId);

        await _dbContext.SaveChangesAsync();
    }

    private async Task SeedCustomerSatisfactionSurveyAsync(Guid namespaceId, Guid createdBy)
    {
        _logger.LogInformation("Seeding Customer Satisfaction Survey...");

        var survey = Survey.Create(namespaceId, "Q4 2024 Customer Satisfaction Survey", createdBy);
        survey.UpdateDescription(
            "Help us understand your experience with Acme Corporation products and services."
        );
        survey.SetWelcomeMessage(
            "Thank you for being a valued customer! This survey takes approximately 5 minutes."
        );
        survey.SetThankYouMessage(
            "Thank you for your valuable feedback! Contact support@acmecorp.com for any concerns."
        );
        survey.SetAnonymous(false);

        // Questions
        survey.AddQuestion(
            "How would you rate your overall satisfaction with Acme Corporation?",
            QuestionType.Rating,
            true
        );
        survey.AddQuestion(
            "How likely are you to recommend Acme Corporation to a colleague?",
            QuestionType.NPS,
            true
        );

        var q3 = survey.AddQuestion(
            "Which products or services have you used?",
            QuestionType.MultipleChoice,
            true
        );
        q3.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "Enterprise Software Suite",
                    "Cloud Infrastructure",
                    "Professional Services",
                    "Technical Support",
                    "Training & Certification",
                    "Mobile Applications",
                ],
                true
            )
        );

        var q4 = survey.AddQuestion(
            "How would you rate the value for money?",
            QuestionType.Scale,
            true
        );
        q4.UpdateSettings(
            QuestionSettings.CreateScaleSettings(1, 10, "Poor Value", "Excellent Value")
        );

        var q5 = survey.AddQuestion(
            "How responsive has our support team been?",
            QuestionType.SingleChoice,
            true
        );
        q5.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "Extremely responsive",
                    "Very responsive",
                    "Somewhat responsive",
                    "Not very responsive",
                    "Haven't contacted support",
                ]
            )
        );

        survey.AddQuestion(
            "What do you appreciate most about Acme Corporation?",
            QuestionType.LongText,
            false
        );
        survey.AddQuestion(
            "What areas would you like to see us improve?",
            QuestionType.LongText,
            false
        );
        survey.AddQuestion("May we contact you for follow-up?", QuestionType.YesNo, true);
        survey.AddQuestion("Contact email (if yes above)", QuestionType.Email, false);

        _dbContext.Surveys.Add(survey);
        await _dbContext.SaveChangesAsync();

        survey.Publish();

        // Add survey links
        var publicLink = SurveyLink.Create(survey.Id, SurveyLinkType.Public, "Main Website Link");
        var campaignLink = SurveyLink.Create(
            survey.Id,
            SurveyLinkType.Campaign,
            "Email Campaign Q4",
            "email",
            "newsletter",
            "q4-satisfaction"
        );
        _dbContext.SurveyLinks.AddRange(publicLink, campaignLink);

        await _dbContext.SaveChangesAsync();

        // Add responses
        await AddCustomerSatisfactionResponsesAsync(survey);
    }

    private async Task AddCustomerSatisfactionResponsesAsync(Survey survey)
    {
        var questions = survey.Questions.OrderBy(q => q.Order).ToList();
        var respondents = new[]
        {
            (
                "james.wilson@techstartup.io",
                "James Wilson",
                5,
                9,
                "[0,1,3]",
                8,
                0,
                "Great quality!",
                "Mobile features",
                true
            ),
            (
                "maria.garcia@retailco.com",
                "Maria Garcia",
                4,
                8,
                "[0,2,4]",
                7,
                1,
                "Professional team",
                "More docs",
                true
            ),
            (
                "robert.kim@manufacturing.net",
                "Robert Kim",
                5,
                10,
                "[1,3]",
                9,
                0,
                "Rock solid",
                "",
                false
            ),
            (
                "amanda.johnson@healthcare.org",
                "Amanda Johnson",
                3,
                6,
                "[0,3,5]",
                5,
                2,
                "Good product",
                "Faster support",
                true
            ),
            (
                "david.brown@fintech.com",
                "David Brown",
                5,
                9,
                "[0,1,2,3]",
                8,
                0,
                "Comprehensive",
                "Startup pricing",
                false
            ),
            (
                "sarah.taylor@education.edu",
                "Sarah Taylor",
                4,
                8,
                "[4,5]",
                7,
                1,
                "Excellent training",
                "Advanced courses",
                true
            ),
            (
                "michael.lee@consulting.biz",
                "Michael Lee",
                4,
                7,
                "[0,2]",
                6,
                1,
                "Solid solution",
                "Integrations",
                false
            ),
            (
                "jennifer.white@logistics.co",
                "Jennifer White",
                5,
                10,
                "[0,1,3,5]",
                9,
                0,
                "Best vendor!",
                "",
                true
            ),
            (
                "chris.anderson@media.tv",
                "Chris Anderson",
                3,
                5,
                "[0]",
                5,
                3,
                "Works fine",
                "Support speed",
                true
            ),
            (
                "lisa.martinez@nonprofit.org",
                "Lisa Martinez",
                4,
                8,
                "[0,4]",
                7,
                1,
                "Good discounts",
                "Tutorials",
                false
            ),
            (
                "kevin.thompson@agency.design",
                "Kevin Thompson",
                5,
                9,
                "[0,5]",
                8,
                0,
                "Intuitive apps",
                "",
                false
            ),
            (
                "nancy.davis@realestate.com",
                "Nancy Davis",
                4,
                7,
                "[0,2,3]",
                6,
                1,
                "Reliable service",
                "Reporting",
                true
            ),
        };

        var random = new Random(42);

        foreach (
            var (
                email,
                name,
                rating,
                nps,
                products,
                value,
                support,
                positive,
                improve,
                contact
            ) in respondents
        )
        {
            var response = SurveyResponse.Create(
                survey.Id,
                survey.AccessToken,
                surveyLinkId: null,
                respondentEmail: email,
                ipAddress: $"192.168.1.{random.Next(1, 255)}",
                userAgent: "Mozilla/5.0"
            );
            response.SetRespondentInfo(email, name);

            response.AddAnswer(questions[0].Id, $"{{\"value\":{rating}}}");
            response.AddAnswer(questions[1].Id, $"{{\"value\":{nps}}}");
            response.AddAnswer(questions[2].Id, $"{{\"selectedIndices\":{products}}}");
            response.AddAnswer(questions[3].Id, $"{{\"value\":{value}}}");
            response.AddAnswer(questions[4].Id, $"{{\"selectedIndex\":{support}}}");
            if (!string.IsNullOrEmpty(positive))
                response.AddAnswer(questions[5].Id, $"{{\"text\":\"{positive}\"}}");
            if (!string.IsNullOrEmpty(improve))
                response.AddAnswer(questions[6].Id, $"{{\"text\":\"{improve}\"}}");
            response.AddAnswer(questions[7].Id, $"{{\"value\":{(contact ? "true" : "false")}}}");
            if (contact)
                response.AddAnswer(questions[8].Id, $"{{\"text\":\"{email}\"}}");

            response.Complete();
            _dbContext.SurveyResponses.Add(response);
        }

        await _dbContext.SaveChangesAsync();
    }

    private async Task SeedEmployeeEngagementSurveyAsync(Guid namespaceId, Guid createdBy)
    {
        _logger.LogInformation("Seeding Employee Engagement Survey...");

        var survey = Survey.Create(
            namespaceId,
            "2024 Annual Employee Engagement Survey",
            createdBy
        );
        survey.UpdateDescription(
            "Your voice matters! Share your honest feedback about your experience at Acme Corporation."
        );
        survey.SetWelcomeMessage(
            "Welcome to our annual engagement survey. All responses are anonymous."
        );
        survey.SetThankYouMessage(
            "Thank you for completing this survey. Results will be shared next month."
        );
        survey.SetAnonymous(true);

        survey.AddQuestion(
            "How satisfied are you with your current role?",
            QuestionType.Rating,
            true
        );

        var q2 = survey.AddQuestion(
            "I feel valued for my contributions.",
            QuestionType.Scale,
            true
        );
        q2.UpdateSettings(
            QuestionSettings.CreateScaleSettings(1, 5, "Strongly Disagree", "Strongly Agree")
        );

        var q3 = survey.AddQuestion(
            "My manager provides clear direction.",
            QuestionType.Scale,
            true
        );
        q3.UpdateSettings(
            QuestionSettings.CreateScaleSettings(1, 5, "Strongly Disagree", "Strongly Agree")
        );

        var q4 = survey.AddQuestion("I have growth opportunities.", QuestionType.Scale, true);
        q4.UpdateSettings(
            QuestionSettings.CreateScaleSettings(1, 5, "Strongly Disagree", "Strongly Agree")
        );

        var q5 = survey.AddQuestion(
            "Which department do you work in?",
            QuestionType.SingleChoice,
            true
        );
        q5.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "Engineering",
                    "Product",
                    "Sales",
                    "Marketing",
                    "Customer Success",
                    "HR",
                    "Finance",
                    "Operations",
                ]
            )
        );

        var q6 = survey.AddQuestion(
            "How long have you been with the company?",
            QuestionType.SingleChoice,
            true
        );
        q6.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                ["Less than 1 year", "1-2 years", "3-5 years", "5-10 years", "More than 10 years"]
            )
        );

        var q7 = survey.AddQuestion(
            "What do you appreciate most about our culture?",
            QuestionType.MultipleChoice,
            false
        );
        q7.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "Work-life balance",
                    "Collaboration",
                    "Innovation",
                    "Learning",
                    "Leadership",
                    "Diversity",
                    "Benefits",
                ]
            )
        );

        survey.AddQuestion("Suggestions for improvement?", QuestionType.LongText, false);
        survey.AddQuestion("Would you recommend Acme as a workplace?", QuestionType.NPS, true);

        _dbContext.Surveys.Add(survey);
        await _dbContext.SaveChangesAsync();

        survey.Publish();

        // Add email distribution
        var distribution = EmailDistribution.Create(
            survey.Id,
            namespaceId,
            "Annual Engagement Survey",
            GetInvitationEmailHtml()
        );
        distribution.UpdateSender("HR Team", "hr@acmecorp.com");
        _dbContext.EmailDistributions.Add(distribution);

        // Add recurring survey
        var recurring = RecurringSurvey.Create(
            survey.Id,
            namespaceId,
            "Quarterly Pulse Check",
            RecurrencePattern.Quarterly,
            new TimeOnly(9, 0),
            "America/New_York",
            AudienceType.StaticList
        );
        recurring.Activate();
        _dbContext.RecurringSurveys.Add(recurring);

        await _dbContext.SaveChangesAsync();

        // Add anonymous responses
        var questions = survey.Questions.OrderBy(q => q.Order).ToList();
        var random = new Random(43);

        for (int i = 0; i < 25; i++)
        {
            var response = SurveyResponse.Create(
                survey.Id,
                survey.AccessToken,
                surveyLinkId: null,
                respondentEmail: null,
                ipAddress: $"10.0.{random.Next(1, 10)}.{random.Next(1, 255)}",
                userAgent: "Mozilla/5.0"
            );

            response.AddAnswer(questions[0].Id, $"{{\"value\":{random.Next(3, 6)}}}");
            response.AddAnswer(questions[1].Id, $"{{\"value\":{random.Next(3, 6)}}}");
            response.AddAnswer(questions[2].Id, $"{{\"value\":{random.Next(2, 6)}}}");
            response.AddAnswer(questions[3].Id, $"{{\"value\":{random.Next(2, 6)}}}");
            response.AddAnswer(questions[4].Id, $"{{\"selectedIndex\":{random.Next(0, 8)}}}");
            response.AddAnswer(questions[5].Id, $"{{\"selectedIndex\":{random.Next(0, 5)}}}");

            var choices = string.Join(
                ",",
                Enumerable.Range(0, 7).OrderBy(_ => random.Next()).Take(random.Next(1, 4))
            );
            response.AddAnswer(questions[6].Id, $"{{\"selectedIndices\":[{choices}]}}");
            response.AddAnswer(questions[8].Id, $"{{\"value\":{random.Next(5, 11)}}}");

            response.Complete();
            _dbContext.SurveyResponses.Add(response);
        }

        await _dbContext.SaveChangesAsync();
    }

    private async Task SeedProductFeedbackSurveyAsync(Guid namespaceId, Guid createdBy)
    {
        _logger.LogInformation("Seeding Product Feedback Survey...");

        var survey = Survey.Create(namespaceId, "Enterprise Suite 5.0 Beta Feedback", createdBy);
        survey.UpdateDescription("Help shape Enterprise Suite 5.0! Share your beta experience.");
        survey.SetWelcomeMessage("Thank you for participating in our beta program!");
        survey.SetThankYouMessage("Your feedback has been recorded. Watch for updates!");
        survey.ConfigureResponseSettings(false, false, 500);

        survey.AddQuestion(
            "Overall rating of Enterprise Suite 5.0 Beta?",
            QuestionType.Rating,
            true
        );

        var q2 = survey.AddQuestion(
            "Which new features have you tried?",
            QuestionType.MultipleChoice,
            true
        );
        q2.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "AI analytics dashboard",
                    "Real-time collaboration",
                    "Workflow automation",
                    "Mobile companion app",
                    "Integrations hub",
                    "Report builder",
                ]
            )
        );

        var q3 = survey.AddQuestion("How intuitive is the new UI?", QuestionType.Scale, true);
        q3.UpdateSettings(QuestionSettings.CreateScaleSettings(1, 10, "Confusing", "Intuitive"));

        survey.AddQuestion("Did you encounter bugs?", QuestionType.YesNo, true);
        survey.AddQuestion("Describe any bugs encountered.", QuestionType.LongText, false);

        var q6 = survey.AddQuestion("Performance vs version 4.x?", QuestionType.SingleChoice, true);
        q6.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                ["Much faster", "Somewhat faster", "Same", "Somewhat slower", "Much slower"]
            )
        );

        survey.AddQuestion("What feature would you like added?", QuestionType.LongText, false);
        survey.AddQuestion("Likelihood to upgrade when released?", QuestionType.NPS, true);

        _dbContext.Surveys.Add(survey);
        await _dbContext.SaveChangesAsync();

        survey.Publish();

        // Add unique links for beta testers
        for (int i = 1; i <= 5; i++)
        {
            var link = SurveyLink.Create(survey.Id, SurveyLinkType.Unique, $"Beta Tester {i}");
            link.SetExpiration(DateTime.UtcNow.AddDays(30));
            _dbContext.SurveyLinks.Add(link);
        }

        await _dbContext.SaveChangesAsync();
    }

    private async Task SeedEventRegistrationSurveyAsync(Guid namespaceId, Guid createdBy)
    {
        _logger.LogInformation("Seeding Event Registration Survey...");

        var survey = Survey.Create(
            namespaceId,
            "Acme Innovation Summit 2025 - Registration",
            createdBy
        );
        survey.UpdateDescription(
            "Register for our annual innovation summit - March 15-17, 2025 in San Francisco."
        );
        survey.SetWelcomeMessage("Welcome to Innovation Summit 2025 registration!");
        survey.SetThankYouMessage("Registration confirmed! Check your email for details.");
        survey.ConfigureResponseSettings(false, false, 500);

        survey.AddQuestion("Full Name", QuestionType.ShortText, true);
        survey.AddQuestion("Email Address", QuestionType.Email, true);
        survey.AddQuestion("Company Name", QuestionType.ShortText, true);
        survey.AddQuestion("Job Title", QuestionType.ShortText, true);

        var q5 = survey.AddQuestion("Phone Number", QuestionType.Phone, false);
        q5.UpdateSettings(
            QuestionSettings.CreateValidatedTextSettings(
                null,
                50,
                "phone-us",
                "Please enter a valid US phone number"
            )
        );

        var q6 = survey.AddQuestion(
            "Which days will you attend?",
            QuestionType.MultipleChoice,
            true
        );
        q6.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "Day 1 - March 15 (Keynotes)",
                    "Day 2 - March 16 (Workshops)",
                    "Day 3 - March 17 (Networking)",
                ]
            )
        );

        var q7 = survey.AddQuestion(
            "Workshop preferences (Day 2)",
            QuestionType.MultipleChoice,
            false
        );
        q7.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "AI in Enterprise",
                    "Cloud Architecture",
                    "DevOps & CI/CD",
                    "Security & Compliance",
                    "UX Design",
                    "Tech Leadership",
                ]
            )
        );

        var q8 = survey.AddQuestion("Dietary restrictions?", QuestionType.SingleChoice, false);
        q8.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                ["None", "Vegetarian", "Vegan", "Gluten-free", "Kosher", "Halal", "Other"]
            )
        );

        survey.AddQuestion(
            "Accessibility needs or special requirements",
            QuestionType.LongText,
            false
        );

        var q10 = survey.AddQuestion(
            "How did you hear about this event?",
            QuestionType.SingleChoice,
            false
        );
        q10.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "Email newsletter",
                    "Social media",
                    "Colleague",
                    "Company announcement",
                    "Industry publication",
                    "Search engine",
                ]
            )
        );

        _dbContext.Surveys.Add(survey);
        await _dbContext.SaveChangesAsync();
        // Keep as draft
    }

    private async Task SeedWebsiteUsabilitySurveyAsync(Guid namespaceId, Guid createdBy)
    {
        _logger.LogInformation("Seeding Website Usability Survey...");

        var survey = Survey.Create(namespaceId, "Website Redesign Feedback - Phase 1", createdBy);
        survey.UpdateDescription("Help us evaluate our website redesign.");
        survey.SetWelcomeMessage(
            "We updated our website and need your feedback! Takes about 3 minutes."
        );
        survey.SetThankYouMessage("Thank you for your feedback on our new website!");
        survey.SetAnonymous(true);

        var q1 = survey.AddQuestion(
            "How easy was it to find what you needed?",
            QuestionType.Scale,
            true
        );
        q1.UpdateSettings(
            QuestionSettings.CreateScaleSettings(1, 5, "Very Difficult", "Very Easy")
        );

        survey.AddQuestion("Visual design rating?", QuestionType.Rating, true);

        var q3 = survey.AddQuestion(
            "Which sections did you visit?",
            QuestionType.MultipleChoice,
            true
        );
        q3.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "Homepage",
                    "Products",
                    "Solutions",
                    "Pricing",
                    "Resources/Blog",
                    "About Us",
                    "Contact",
                    "Support",
                ]
            )
        );

        var q4 = survey.AddQuestion(
            "Any issues while browsing?",
            QuestionType.MultipleChoice,
            false
        );
        q4.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "Slow loading",
                    "Broken links",
                    "Navigation confusion",
                    "Mobile issues",
                    "Search problems",
                    "No issues",
                ],
                true
            )
        );

        var q5 = survey.AddQuestion(
            "Compared to previous website:",
            QuestionType.SingleChoice,
            true
        );
        q5.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "Much better",
                    "Somewhat better",
                    "Same",
                    "Somewhat worse",
                    "Much worse",
                    "Didn't see old site",
                ]
            )
        );

        survey.AddQuestion("Improvement suggestions?", QuestionType.LongText, false);
        survey.AddQuestion("Overall satisfaction with new website?", QuestionType.NPS, true);

        _dbContext.Surveys.Add(survey);
        await _dbContext.SaveChangesAsync();

        survey.Publish();

        // Add responses then close
        var questions = survey.Questions.OrderBy(q => q.Order).ToList();
        var random = new Random(44);

        for (int i = 0; i < 45; i++)
        {
            var response = SurveyResponse.Create(
                survey.Id,
                survey.AccessToken,
                surveyLinkId: null,
                respondentEmail: null,
                ipAddress: $"203.0.{random.Next(1, 255)}.{random.Next(1, 255)}",
                userAgent: "Mozilla/5.0"
            );

            response.AddAnswer(questions[0].Id, $"{{\"value\":{random.Next(3, 6)}}}");
            response.AddAnswer(questions[1].Id, $"{{\"value\":{random.Next(3, 6)}}}");
            var sections = string.Join(
                ",",
                Enumerable.Range(0, 8).OrderBy(_ => random.Next()).Take(random.Next(2, 5))
            );
            response.AddAnswer(questions[2].Id, $"{{\"selectedIndices\":[{sections}]}}");
            response.AddAnswer(questions[4].Id, $"{{\"selectedIndex\":{random.Next(0, 3)}}}");
            response.AddAnswer(questions[6].Id, $"{{\"value\":{random.Next(6, 10)}}}");
            response.Complete();

            _dbContext.SurveyResponses.Add(response);
        }

        await _dbContext.SaveChangesAsync();

        survey.Close();
        await _dbContext.SaveChangesAsync();
    }

    private async Task SeedMarketResearchSurveyAsync(Guid namespaceId, Guid createdBy)
    {
        _logger.LogInformation("Seeding Market Research Survey with Question Logic...");

        var survey = Survey.Create(
            namespaceId,
            "Technology Adoption & Preferences Study",
            createdBy
        );
        survey.UpdateDescription(
            "Understanding how businesses evaluate and adopt new technologies."
        );
        survey.SetWelcomeMessage("Help us understand technology adoption trends in your industry.");
        survey.SetThankYouMessage("Thank you for contributing to our research!");
        survey.SetAnonymous(true);

        var q1 = survey.AddQuestion("Company's primary industry?", QuestionType.SingleChoice, true);
        q1.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "Technology/Software",
                    "Financial Services",
                    "Healthcare",
                    "Manufacturing",
                    "Retail",
                    "Education",
                    "Government",
                    "Other",
                ]
            )
        );

        var q2 = survey.AddQuestion("Company size?", QuestionType.SingleChoice, true);
        q2.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "1-50 employees",
                    "51-200 employees",
                    "201-1000 employees",
                    "1001-5000 employees",
                    "5000+ employees",
                ]
            )
        );

        var q3 = survey.AddQuestion(
            "Your role in tech purchasing?",
            QuestionType.SingleChoice,
            true
        );
        q3.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "Final decision maker",
                    "Strong influencer",
                    "Evaluation team",
                    "End user only",
                    "No involvement",
                ]
            )
        );

        var q4 = survey.AddQuestion(
            "Technologies currently evaluating?",
            QuestionType.MultipleChoice,
            true
        );
        q4.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "Cloud Infrastructure",
                    "Cybersecurity",
                    "AI/Machine Learning",
                    "Data Analytics",
                    "Collaboration Tools",
                    "CRM/Sales",
                    "ERP Systems",
                    "None",
                ]
            )
        );

        // This question shows only if AI/ML is selected
        var q5 = survey.AddQuestion(
            "AI/ML use cases of interest?",
            QuestionType.MultipleChoice,
            false
        );
        q5.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "Predictive Analytics",
                    "Process Automation",
                    "Chatbots",
                    "Content Generation",
                    "Fraud Detection",
                    "Image/Video Analysis",
                ]
            )
        );

        var q6 = survey.AddQuestion(
            "Typical evaluation timeline?",
            QuestionType.SingleChoice,
            true
        );
        q6.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                ["Less than 1 month", "1-3 months", "3-6 months", "6-12 months", "Over 12 months"]
            )
        );

        var q7 = survey.AddQuestion("Important evaluation factors?", QuestionType.Matrix, true);
        q7.UpdateSettings(
            QuestionSettings.CreateMatrixSettings(
                [
                    "Price/Value",
                    "Ease of Implementation",
                    "Vendor Support",
                    "Security Features",
                    "Integration",
                ],
                ["Not Important", "Somewhat", "Very", "Critical"]
            )
        );

        var q8 = survey.AddQuestion("Annual tech budget?", QuestionType.SingleChoice, false);
        q8.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "Under $50K",
                    "$50K-$250K",
                    "$250K-$1M",
                    "$1M-$5M",
                    "Over $5M",
                    "Prefer not to say",
                ]
            )
        );

        survey.AddQuestion("Additional insights to share?", QuestionType.LongText, false);

        _dbContext.Surveys.Add(survey);
        await _dbContext.SaveChangesAsync();

        // Add question logic: Show AI question only if AI/ML selected
        var logic = QuestionLogic.Create(
            q5.Id,
            q4.Id,
            LogicOperator.Contains,
            "2",
            LogicAction.Show
        );
        _dbContext.QuestionLogics.Add(logic);

        survey.Publish();
        await _dbContext.SaveChangesAsync();

        // Add responses
        var questions = survey.Questions.OrderBy(q => q.Order).ToList();
        var random = new Random(45);

        for (int i = 0; i < 18; i++)
        {
            var response = SurveyResponse.Create(
                survey.Id,
                survey.AccessToken,
                surveyLinkId: null,
                respondentEmail: null,
                ipAddress: $"172.16.{random.Next(1, 255)}.{random.Next(1, 255)}",
                userAgent: "Mozilla/5.0"
            );

            var techChoices = Enumerable
                .Range(0, 7)
                .OrderBy(_ => random.Next())
                .Take(random.Next(1, 4))
                .ToArray();

            response.AddAnswer(questions[0].Id, $"{{\"selectedIndex\":{random.Next(0, 8)}}}");
            response.AddAnswer(questions[1].Id, $"{{\"selectedIndex\":{random.Next(0, 5)}}}");
            response.AddAnswer(questions[2].Id, $"{{\"selectedIndex\":{random.Next(0, 5)}}}");
            response.AddAnswer(
                questions[3].Id,
                $"{{\"selectedIndices\":[{string.Join(",", techChoices)}]}}"
            );

            if (techChoices.Contains(2))
            {
                var aiChoices = string.Join(
                    ",",
                    Enumerable.Range(0, 6).OrderBy(_ => random.Next()).Take(random.Next(1, 3))
                );
                response.AddAnswer(questions[4].Id, $"{{\"selectedIndices\":[{aiChoices}]}}");
            }

            response.AddAnswer(questions[5].Id, $"{{\"selectedIndex\":{random.Next(0, 5)}}}");
            response.AddAnswer(questions[7].Id, $"{{\"selectedIndex\":{random.Next(0, 6)}}}");
            response.Complete();

            _dbContext.SurveyResponses.Add(response);
        }

        await _dbContext.SaveChangesAsync();
    }

    private async Task SeedTrainingFeedbackSurveyAsync(Guid namespaceId, Guid createdBy)
    {
        _logger.LogInformation("Seeding Training Feedback Survey...");

        var survey = Survey.Create(
            namespaceId,
            "Leadership Development Program - Session Feedback",
            createdBy
        );
        survey.UpdateDescription("Share your feedback on today's training session.");
        survey.SetWelcomeMessage("Thank you for attending! Please share your thoughts.");
        survey.SetThankYouMessage("Thank you for your feedback!");

        survey.AddQuestion("Session Date", QuestionType.Date, true);

        var q2 = survey.AddQuestion(
            "Which session did you attend?",
            QuestionType.SingleChoice,
            true
        );
        q2.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "Effective Communication",
                    "Strategic Thinking",
                    "Team Building",
                    "Conflict Resolution",
                    "Change Management",
                ]
            )
        );

        survey.AddQuestion("Instructor Name", QuestionType.ShortText, true);
        survey.AddQuestion("Instructor's presentation skills?", QuestionType.Rating, true);

        var q5 = survey.AddQuestion("Content relevance to your role?", QuestionType.Scale, true);
        q5.UpdateSettings(
            QuestionSettings.CreateScaleSettings(1, 5, "Not Relevant", "Highly Relevant")
        );

        var q6 = survey.AddQuestion("Session pace?", QuestionType.SingleChoice, true);
        q6.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(["Too slow", "Just right", "Too fast"])
        );

        var q7 = survey.AddQuestion("Most valuable aspects?", QuestionType.MultipleChoice, false);
        q7.UpdateSettings(
            QuestionSettings.CreateChoiceSettings(
                [
                    "Interactive exercises",
                    "Group discussions",
                    "Case studies",
                    "Instructor insights",
                    "Networking",
                    "Materials",
                ]
            )
        );

        survey.AddQuestion("Topics for more depth?", QuestionType.LongText, false);
        survey.AddQuestion("Suggestions for improvement?", QuestionType.LongText, false);
        survey.AddQuestion("Would you recommend this program?", QuestionType.NPS, true);

        _dbContext.Surveys.Add(survey);
        await _dbContext.SaveChangesAsync();

        // Create a template from this survey
        var template = SurveyTemplate.CreateFromSurvey(
            survey,
            "Training Session Feedback Template",
            createdBy
        );
        template.UpdateCategory("Training & HR");
        template.SetPublic(true);
        _dbContext.SurveyTemplates.Add(template);

        await _dbContext.SaveChangesAsync();
    }

    #region Email HTML Templates

    private static string GetInvitationEmailHtml() =>
        """
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1E40AF;">You're Invited to Share Your Feedback</h2>
                    <p>Hello {{respondent.name}},</p>
                    <p>{{sender.name}} has invited you to participate in:</p>
                    <div style="background: #F8FAFC; border-left: 4px solid #1E40AF; padding: 15px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0;">{{survey.title}}</h3>
                        <p style="margin: 0; color: #64748B;">{{survey.description}}</p>
                    </div>
                    <a href="{{survey.link}}" style="display: inline-block; background: #1E40AF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Take the Survey</a>
                    <p style="font-size: 14px; color: #64748B; margin-top: 20px;">Takes approximately 5-10 minutes.</p>
                    <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;">
                    <p style="font-size: 12px; color: #94A3B8;"><a href="{{unsubscribe.link}}" style="color: #64748B;">Unsubscribe</a></p>
                </div>
            </body>
            </html>
            """;

    private static string GetReminderEmailHtml() =>
        """
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #EA580C;">Reminder: Survey Awaiting Your Response</h2>
                    <p>Hello {{respondent.name}},</p>
                    <p>We noticed you haven't completed the survey yet. We'd appreciate your feedback!</p>
                    <div style="background: #FFF7ED; border-left: 4px solid #EA580C; padding: 15px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0;">{{survey.title}}</h3>
                        <p style="margin: 0; color: #64748B;">Deadline: {{survey.deadline}}</p>
                    </div>
                    <a href="{{survey.link}}" style="display: inline-block; background: #EA580C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Survey Now</a>
                    <p>Thank you!<br>{{sender.name}}</p>
                </div>
            </body>
            </html>
            """;

    private static string GetThankYouEmailHtml() =>
        """
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #15803D;">Thank You for Your Feedback!</h2>
                    <p>Hello {{respondent.name}},</p>
                    <p>Thank you for completing <strong>{{survey.title}}</strong>.</p>
                    <div style="background: #F0FDF4; border-left: 4px solid #15803D; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0;">Your feedback helps shape our improvements.</p>
                    </div>
                    <p>Best regards,<br>The {{namespace.name}} Team</p>
                </div>
            </body>
            </html>
            """;

    #endregion
}
