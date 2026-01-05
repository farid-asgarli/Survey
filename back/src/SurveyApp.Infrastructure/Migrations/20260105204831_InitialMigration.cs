using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SurveyApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "survey");

            migrationBuilder.EnsureSchema(
                name: "distribution");

            migrationBuilder.EnsureSchema(
                name: "i18n");

            migrationBuilder.EnsureSchema(
                name: "core");

            migrationBuilder.EnsureSchema(
                name: "scheduling");

            migrationBuilder.EnsureSchema(
                name: "templates");

            migrationBuilder.EnsureSchema(
                name: "themes");

            migrationBuilder.CreateTable(
                name: "email_templates",
                schema: "distribution",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NamespaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    DefaultLanguage = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "en"),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AvailablePlaceholders = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_email_templates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "namespaces",
                schema: "core",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SubscriptionTier = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    MaxUsers = table.Column<int>(type: "integer", nullable: false, defaultValue: 10),
                    MaxSurveys = table.Column<int>(type: "integer", nullable: false, defaultValue: 10),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    LogoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_namespaces", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                schema: "core",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LastName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    avatar_id = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "email_template_translations",
                schema: "i18n",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EmailTemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Subject = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    HtmlBody = table.Column<string>(type: "text", nullable: false),
                    PlainTextBody = table.Column<string>(type: "text", nullable: true),
                    DesignJson = table.Column<string>(type: "jsonb", nullable: true),
                    LanguageCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_email_template_translations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_email_template_translations_email_templates_EmailTemplateId",
                        column: x => x.EmailTemplateId,
                        principalSchema: "distribution",
                        principalTable: "email_templates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "survey_templates",
                schema: "templates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NamespaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    DefaultLanguage = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "en"),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DefaultAllowAnonymous = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    DefaultAllowMultipleResponses = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    UsageCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_survey_templates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_survey_templates_namespaces_NamespaceId",
                        column: x => x.NamespaceId,
                        principalSchema: "core",
                        principalTable: "namespaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "survey_themes",
                schema: "themes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NamespaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    DefaultLanguage = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "en"),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    IsSystem = table.Column<bool>(type: "boolean", nullable: false),
                    PrimaryColor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "#3B82F6"),
                    OnPrimaryColor = table.Column<string>(type: "text", nullable: false),
                    PrimaryContainerColor = table.Column<string>(type: "text", nullable: false),
                    OnPrimaryContainerColor = table.Column<string>(type: "text", nullable: false),
                    SecondaryColor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "#64748B"),
                    OnSecondaryColor = table.Column<string>(type: "text", nullable: false),
                    SecondaryContainerColor = table.Column<string>(type: "text", nullable: false),
                    OnSecondaryContainerColor = table.Column<string>(type: "text", nullable: false),
                    SurfaceColor = table.Column<string>(type: "text", nullable: false),
                    SurfaceContainerLowestColor = table.Column<string>(type: "text", nullable: false),
                    SurfaceContainerLowColor = table.Column<string>(type: "text", nullable: false),
                    SurfaceContainerColor = table.Column<string>(type: "text", nullable: false),
                    SurfaceContainerHighColor = table.Column<string>(type: "text", nullable: false),
                    SurfaceContainerHighestColor = table.Column<string>(type: "text", nullable: false),
                    OnSurfaceColor = table.Column<string>(type: "text", nullable: false),
                    OnSurfaceVariantColor = table.Column<string>(type: "text", nullable: false),
                    OutlineColor = table.Column<string>(type: "text", nullable: false),
                    OutlineVariantColor = table.Column<string>(type: "text", nullable: false),
                    BackgroundColor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "#FFFFFF"),
                    TextColor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "#1F2937"),
                    AccentColor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "#8B5CF6"),
                    ErrorColor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "#EF4444"),
                    SuccessColor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "#22C55E"),
                    FontFamily = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: "Inter"),
                    HeadingFontFamily = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: "Inter"),
                    BaseFontSize = table.Column<int>(type: "integer", nullable: false, defaultValue: 16),
                    Layout = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    BackgroundImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BackgroundPosition = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ShowProgressBar = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ProgressBarStyle = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    LogoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    LogoPosition = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    LogoSize = table.Column<int>(type: "integer", nullable: false),
                    ShowLogoBackground = table.Column<bool>(type: "boolean", nullable: false),
                    LogoBackgroundColor = table.Column<string>(type: "text", nullable: true),
                    BrandingTitle = table.Column<string>(type: "text", nullable: true),
                    BrandingSubtitle = table.Column<string>(type: "text", nullable: true),
                    ShowPoweredBy = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ButtonStyle = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ButtonTextColor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "#FFFFFF"),
                    CustomCss = table.Column<string>(type: "character varying(50000)", maxLength: 50000, nullable: true),
                    UsageCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_survey_themes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_survey_themes_namespaces_NamespaceId",
                        column: x => x.NamespaceId,
                        principalSchema: "core",
                        principalTable: "namespaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "namespace_memberships",
                schema: "core",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    NamespaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    InvitedBy = table.Column<Guid>(type: "uuid", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_namespace_memberships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_namespace_memberships_namespaces_NamespaceId",
                        column: x => x.NamespaceId,
                        principalSchema: "core",
                        principalTable: "namespaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_namespace_memberships_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "core",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                schema: "core",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    ActionUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ActionLabel = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Metadata = table.Column<string>(type: "jsonb", nullable: true),
                    RelatedEntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    RelatedEntityType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_notifications_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "core",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_preferences",
                schema: "core",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ThemeMode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "system"),
                    ColorPalette = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "purple"),
                    HighContrastMode = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ReducedMotion = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ScreenReaderOptimized = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    FontSizeScale = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "medium"),
                    DyslexiaFriendlyFont = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    Language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "en"),
                    DateFormat = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "MM/DD/YYYY"),
                    TimeFormat = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "12h"),
                    Timezone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: "UTC"),
                    DecimalSeparator = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "dot"),
                    ThousandsSeparator = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "comma"),
                    EmailNotifications = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ResponseAlerts = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    WeeklyDigest = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    MarketingEmails = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CompletionAlerts = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    DistributionReports = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    DefaultViewMode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "grid"),
                    ItemsPerPage = table.Column<int>(type: "integer", nullable: false, defaultValue: 12),
                    SidebarCollapsed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DefaultSortField = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "updatedAt"),
                    DefaultSortOrder = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "desc"),
                    HomeWidgets = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false, defaultValue: "[\"stats\",\"recent\",\"quick-actions\"]"),
                    PinnedSurveyIds = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false, defaultValue: ""),
                    DefaultQuestionRequired = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    DefaultThemeId = table.Column<Guid>(type: "uuid", nullable: true),
                    DefaultWelcomeMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false, defaultValue: ""),
                    DefaultThankYouMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false, defaultValue: ""),
                    AutoSaveInterval = table.Column<int>(type: "integer", nullable: false, defaultValue: 30),
                    QuestionNumberingStyle = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "numbers"),
                    ShowQuestionDescriptions = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    DefaultPageBreakBehavior = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "auto"),
                    OnboardingStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "not_started"),
                    OnboardingCompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OnboardingCurrentStep = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    HasSeenWelcomeTour = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    HasCompletedProfileSetup = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    HasCreatedFirstSurvey = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    HasCompletedGettingStarted = table.Column<bool>(type: "boolean", nullable: false),
                    GettingStartedStep = table.Column<int>(type: "integer", nullable: false),
                    GettingStartedCompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_preferences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_preferences_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "core",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "survey_template_translations",
                schema: "i18n",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    WelcomeMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ThankYouMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    LanguageCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_survey_template_translations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_survey_template_translations_survey_templates_TemplateId",
                        column: x => x.TemplateId,
                        principalSchema: "templates",
                        principalTable: "survey_templates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "template_questions",
                schema: "templates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SettingsJson = table.Column<string>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_template_questions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_template_questions_survey_templates_TemplateId",
                        column: x => x.TemplateId,
                        principalSchema: "templates",
                        principalTable: "survey_templates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "survey_theme_translations",
                schema: "i18n",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ThemeId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    LanguageCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_survey_theme_translations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_survey_theme_translations_survey_themes_ThemeId",
                        column: x => x.ThemeId,
                        principalSchema: "themes",
                        principalTable: "survey_themes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "surveys",
                schema: "survey",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NamespaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CxMetricType = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    AccessToken = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClosedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    StartsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AllowAnonymousResponses = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AllowMultipleResponses = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    MaxResponses = table.Column<int>(type: "integer", nullable: true),
                    ThemeId = table.Column<Guid>(type: "uuid", nullable: true),
                    PresetThemeId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ThemeCustomizations = table.Column<string>(type: "jsonb", nullable: true),
                    DefaultLanguage = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "en"),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_surveys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_surveys_namespaces_NamespaceId",
                        column: x => x.NamespaceId,
                        principalSchema: "core",
                        principalTable: "namespaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_surveys_survey_themes_ThemeId",
                        column: x => x.ThemeId,
                        principalSchema: "themes",
                        principalTable: "survey_themes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "template_question_translations",
                schema: "i18n",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TemplateQuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Text = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    TranslatedSettingsJson = table.Column<string>(type: "jsonb", nullable: true),
                    LanguageCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_template_question_translations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_template_question_translations_template_questions_TemplateQ~",
                        column: x => x.TemplateQuestionId,
                        principalSchema: "templates",
                        principalTable: "template_questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "email_distributions",
                schema: "distribution",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyId = table.Column<Guid>(type: "uuid", nullable: false),
                    NamespaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    EmailTemplateId = table.Column<Guid>(type: "uuid", nullable: true),
                    Subject = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Body = table.Column<string>(type: "text", nullable: false),
                    SenderName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SenderEmail = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: true),
                    ScheduledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    TotalRecipients = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    SentCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    DeliveredCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    OpenedCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ClickedCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    BouncedCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    UnsubscribedCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_email_distributions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_email_distributions_email_templates_EmailTemplateId",
                        column: x => x.EmailTemplateId,
                        principalSchema: "distribution",
                        principalTable: "email_templates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_email_distributions_surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalSchema: "survey",
                        principalTable: "surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "questions",
                schema: "survey",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SettingsJson = table.Column<string>(type: "jsonb", nullable: true),
                    IsNpsQuestion = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    NpsType = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_questions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_questions_surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalSchema: "survey",
                        principalTable: "surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "recurring_surveys",
                schema: "scheduling",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyId = table.Column<Guid>(type: "uuid", nullable: false),
                    NamespaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    Pattern = table.Column<int>(type: "integer", nullable: false),
                    CronExpression = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SendTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    TimezoneId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DaysOfWeek = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DayOfMonth = table.Column<int>(type: "integer", nullable: true),
                    AudienceType = table.Column<int>(type: "integer", nullable: false),
                    RecipientEmails = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: false),
                    AudienceListId = table.Column<Guid>(type: "uuid", nullable: true),
                    SendReminders = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ReminderDaysAfter = table.Column<int>(type: "integer", nullable: false, defaultValue: 3),
                    MaxReminders = table.Column<int>(type: "integer", nullable: false, defaultValue: 2),
                    CustomSubject = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CustomMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    NextRunAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastRunAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TotalRuns = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    EndsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MaxRuns = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recurring_surveys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_recurring_surveys_namespaces_NamespaceId",
                        column: x => x.NamespaceId,
                        principalSchema: "core",
                        principalTable: "namespaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_recurring_surveys_surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalSchema: "survey",
                        principalTable: "surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "survey_links",
                schema: "distribution",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Token = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Source = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Medium = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Campaign = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PrefillDataJson = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MaxUses = table.Column<int>(type: "integer", nullable: true),
                    UsageCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ResponseCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Password = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_survey_links", x => x.Id);
                    table.ForeignKey(
                        name: "FK_survey_links_surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalSchema: "survey",
                        principalTable: "surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "survey_translations",
                schema: "i18n",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    WelcomeMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ThankYouMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    LanguageCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_survey_translations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_survey_translations_surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalSchema: "survey",
                        principalTable: "surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "email_recipients",
                schema: "distribution",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DistributionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeliveredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OpenedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClickedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UniqueToken = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ErrorMessage = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    OpenCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ClickCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_email_recipients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_email_recipients_email_distributions_DistributionId",
                        column: x => x.DistributionId,
                        principalSchema: "distribution",
                        principalTable: "email_distributions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "question_logics",
                schema: "survey",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceQuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Operator = table.Column<int>(type: "integer", nullable: false),
                    ConditionValue = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Action = table.Column<int>(type: "integer", nullable: false),
                    TargetQuestionId = table.Column<Guid>(type: "uuid", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_question_logics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_question_logics_questions_QuestionId",
                        column: x => x.QuestionId,
                        principalSchema: "survey",
                        principalTable: "questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_question_logics_questions_SourceQuestionId",
                        column: x => x.SourceQuestionId,
                        principalSchema: "survey",
                        principalTable: "questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_question_logics_questions_TargetQuestionId",
                        column: x => x.TargetQuestionId,
                        principalSchema: "survey",
                        principalTable: "questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "question_translations",
                schema: "i18n",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Text = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    TranslatedSettingsJson = table.Column<string>(type: "jsonb", nullable: true),
                    LanguageCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_question_translations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_question_translations_questions_QuestionId",
                        column: x => x.QuestionId,
                        principalSchema: "survey",
                        principalTable: "questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "recurring_survey_runs",
                schema: "scheduling",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RecurringSurveyId = table.Column<Guid>(type: "uuid", nullable: false),
                    RunNumber = table.Column<int>(type: "integer", nullable: false),
                    ScheduledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RecipientsCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    SentCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    FailedCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ResponsesCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ErrorMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    DurationMs = table.Column<long>(type: "bigint", nullable: false, defaultValue: 0L),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recurring_survey_runs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_recurring_survey_runs_recurring_surveys_RecurringSurveyId",
                        column: x => x.RecurringSurveyId,
                        principalSchema: "scheduling",
                        principalTable: "recurring_surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "survey_responses",
                schema: "survey",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyId = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyLinkId = table.Column<Guid>(type: "uuid", nullable: true),
                    RespondentEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    RespondentName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsComplete = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TimeSpentSeconds = table.Column<int>(type: "integer", nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AccessToken = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RespondentUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_survey_responses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_survey_responses_survey_links_SurveyLinkId",
                        column: x => x.SurveyLinkId,
                        principalSchema: "distribution",
                        principalTable: "survey_links",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_survey_responses_surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalSchema: "survey",
                        principalTable: "surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_survey_responses_users_RespondentUserId",
                        column: x => x.RespondentUserId,
                        principalSchema: "core",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "answers",
                schema: "survey",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ResponseId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    AnswerValue = table.Column<string>(type: "text", nullable: false),
                    AnsweredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_answers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_answers_questions_QuestionId",
                        column: x => x.QuestionId,
                        principalSchema: "survey",
                        principalTable: "questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_answers_survey_responses_ResponseId",
                        column: x => x.ResponseId,
                        principalSchema: "survey",
                        principalTable: "survey_responses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "link_clicks",
                schema: "distribution",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyLinkId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClickedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IpAddress = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Referrer = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DeviceType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Browser = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    OperatingSystem = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ResponseId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_link_clicks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_link_clicks_survey_links_SurveyLinkId",
                        column: x => x.SurveyLinkId,
                        principalSchema: "distribution",
                        principalTable: "survey_links",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_link_clicks_survey_responses_ResponseId",
                        column: x => x.ResponseId,
                        principalSchema: "survey",
                        principalTable: "survey_responses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_answers_IsDeleted",
                schema: "survey",
                table: "answers",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_answers_QuestionId",
                schema: "survey",
                table: "answers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_answers_ResponseId",
                schema: "survey",
                table: "answers",
                column: "ResponseId");

            migrationBuilder.CreateIndex(
                name: "IX_answers_ResponseId_QuestionId",
                schema: "survey",
                table: "answers",
                columns: new[] { "ResponseId", "QuestionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_email_distributions_EmailTemplateId",
                schema: "distribution",
                table: "email_distributions",
                column: "EmailTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_email_distributions_NamespaceId",
                schema: "distribution",
                table: "email_distributions",
                column: "NamespaceId");

            migrationBuilder.CreateIndex(
                name: "IX_email_distributions_ScheduledAt",
                schema: "distribution",
                table: "email_distributions",
                column: "ScheduledAt",
                filter: "\"Status\" = 1");

            migrationBuilder.CreateIndex(
                name: "IX_email_distributions_Status",
                schema: "distribution",
                table: "email_distributions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_email_distributions_SurveyId",
                schema: "distribution",
                table: "email_distributions",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_email_recipients_DistributionId",
                schema: "distribution",
                table: "email_recipients",
                column: "DistributionId");

            migrationBuilder.CreateIndex(
                name: "IX_email_recipients_Email",
                schema: "distribution",
                table: "email_recipients",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_email_recipients_Status",
                schema: "distribution",
                table: "email_recipients",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_email_recipients_UniqueToken",
                schema: "distribution",
                table: "email_recipients",
                column: "UniqueToken",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_email_template_translations_EmailTemplateId",
                schema: "i18n",
                table: "email_template_translations",
                column: "EmailTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_email_template_translations_EmailTemplateId_LanguageCode",
                schema: "i18n",
                table: "email_template_translations",
                columns: new[] { "EmailTemplateId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_email_template_translations_LanguageCode",
                schema: "i18n",
                table: "email_template_translations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_email_templates_NamespaceId",
                schema: "distribution",
                table: "email_templates",
                column: "NamespaceId");

            migrationBuilder.CreateIndex(
                name: "IX_email_templates_NamespaceId_Type_IsDefault",
                schema: "distribution",
                table: "email_templates",
                columns: new[] { "NamespaceId", "Type", "IsDefault" });

            migrationBuilder.CreateIndex(
                name: "IX_link_clicks_ClickedAt",
                schema: "distribution",
                table: "link_clicks",
                column: "ClickedAt");

            migrationBuilder.CreateIndex(
                name: "IX_link_clicks_IsDeleted",
                schema: "distribution",
                table: "link_clicks",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_link_clicks_ResponseId",
                schema: "distribution",
                table: "link_clicks",
                column: "ResponseId");

            migrationBuilder.CreateIndex(
                name: "IX_link_clicks_SurveyLinkId",
                schema: "distribution",
                table: "link_clicks",
                column: "SurveyLinkId");

            migrationBuilder.CreateIndex(
                name: "IX_namespace_memberships_NamespaceId_UserId",
                schema: "core",
                table: "namespace_memberships",
                columns: new[] { "NamespaceId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_namespace_memberships_Role",
                schema: "core",
                table: "namespace_memberships",
                column: "Role");

            migrationBuilder.CreateIndex(
                name: "IX_namespace_memberships_UserId",
                schema: "core",
                table: "namespace_memberships",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_namespaces_CreatedAt",
                schema: "core",
                table: "namespaces",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_namespaces_IsDeleted",
                schema: "core",
                table: "namespaces",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_namespaces_Slug",
                schema: "core",
                table: "namespaces",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_notifications_Type",
                schema: "core",
                table: "notifications",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_notifications_UserId",
                schema: "core",
                table: "notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_notifications_UserId_CreatedAt",
                schema: "core",
                table: "notifications",
                columns: new[] { "UserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_notifications_UserId_IsRead_IsArchived",
                schema: "core",
                table: "notifications",
                columns: new[] { "UserId", "IsRead", "IsArchived" });

            migrationBuilder.CreateIndex(
                name: "IX_question_logics_IsDeleted",
                schema: "survey",
                table: "question_logics",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_question_logics_QuestionId",
                schema: "survey",
                table: "question_logics",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_question_logics_QuestionId_Priority",
                schema: "survey",
                table: "question_logics",
                columns: new[] { "QuestionId", "Priority" });

            migrationBuilder.CreateIndex(
                name: "IX_question_logics_SourceQuestionId",
                schema: "survey",
                table: "question_logics",
                column: "SourceQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_question_logics_TargetQuestionId",
                schema: "survey",
                table: "question_logics",
                column: "TargetQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_question_translations_LanguageCode",
                schema: "i18n",
                table: "question_translations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_question_translations_QuestionId",
                schema: "i18n",
                table: "question_translations",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_question_translations_QuestionId_LanguageCode",
                schema: "i18n",
                table: "question_translations",
                columns: new[] { "QuestionId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_questions_IsDeleted",
                schema: "survey",
                table: "questions",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_questions_IsNpsQuestion",
                schema: "survey",
                table: "questions",
                column: "IsNpsQuestion");

            migrationBuilder.CreateIndex(
                name: "IX_questions_SurveyId",
                schema: "survey",
                table: "questions",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_questions_SurveyId_Order",
                schema: "survey",
                table: "questions",
                columns: new[] { "SurveyId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_recurring_survey_runs_IsDeleted",
                schema: "scheduling",
                table: "recurring_survey_runs",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_recurring_survey_runs_RecurringSurveyId",
                schema: "scheduling",
                table: "recurring_survey_runs",
                column: "RecurringSurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_recurring_survey_runs_ScheduledAt",
                schema: "scheduling",
                table: "recurring_survey_runs",
                column: "ScheduledAt");

            migrationBuilder.CreateIndex(
                name: "IX_recurring_survey_runs_Status",
                schema: "scheduling",
                table: "recurring_survey_runs",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_recurring_surveys_IsActive",
                schema: "scheduling",
                table: "recurring_surveys",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_recurring_surveys_IsDeleted",
                schema: "scheduling",
                table: "recurring_surveys",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_recurring_surveys_NamespaceId",
                schema: "scheduling",
                table: "recurring_surveys",
                column: "NamespaceId");

            migrationBuilder.CreateIndex(
                name: "IX_recurring_surveys_NextRunAt",
                schema: "scheduling",
                table: "recurring_surveys",
                column: "NextRunAt");

            migrationBuilder.CreateIndex(
                name: "IX_recurring_surveys_SurveyId",
                schema: "scheduling",
                table: "recurring_surveys",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_survey_links_CreatedAt",
                schema: "distribution",
                table: "survey_links",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_survey_links_IsActive",
                schema: "distribution",
                table: "survey_links",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_survey_links_IsDeleted",
                schema: "distribution",
                table: "survey_links",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_survey_links_SurveyId",
                schema: "distribution",
                table: "survey_links",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_survey_links_Token",
                schema: "distribution",
                table: "survey_links",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_survey_responses_IsComplete",
                schema: "survey",
                table: "survey_responses",
                column: "IsComplete");

            migrationBuilder.CreateIndex(
                name: "IX_survey_responses_IsDeleted",
                schema: "survey",
                table: "survey_responses",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_survey_responses_RespondentEmail",
                schema: "survey",
                table: "survey_responses",
                column: "RespondentEmail");

            migrationBuilder.CreateIndex(
                name: "IX_survey_responses_RespondentUserId",
                schema: "survey",
                table: "survey_responses",
                column: "RespondentUserId");

            migrationBuilder.CreateIndex(
                name: "IX_survey_responses_SubmittedAt",
                schema: "survey",
                table: "survey_responses",
                column: "SubmittedAt");

            migrationBuilder.CreateIndex(
                name: "IX_survey_responses_SurveyId",
                schema: "survey",
                table: "survey_responses",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_survey_responses_SurveyLinkId",
                schema: "survey",
                table: "survey_responses",
                column: "SurveyLinkId");

            migrationBuilder.CreateIndex(
                name: "IX_survey_template_translations_LanguageCode",
                schema: "i18n",
                table: "survey_template_translations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_survey_template_translations_TemplateId",
                schema: "i18n",
                table: "survey_template_translations",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_survey_template_translations_TemplateId_LanguageCode",
                schema: "i18n",
                table: "survey_template_translations",
                columns: new[] { "TemplateId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_survey_templates_CreatedAt",
                schema: "templates",
                table: "survey_templates",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_survey_templates_IsDeleted",
                schema: "templates",
                table: "survey_templates",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_survey_templates_IsPublic",
                schema: "templates",
                table: "survey_templates",
                column: "IsPublic");

            migrationBuilder.CreateIndex(
                name: "IX_survey_templates_NamespaceId",
                schema: "templates",
                table: "survey_templates",
                column: "NamespaceId");

            migrationBuilder.CreateIndex(
                name: "IX_survey_theme_translations_LanguageCode",
                schema: "i18n",
                table: "survey_theme_translations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_survey_theme_translations_ThemeId",
                schema: "i18n",
                table: "survey_theme_translations",
                column: "ThemeId");

            migrationBuilder.CreateIndex(
                name: "IX_survey_theme_translations_ThemeId_LanguageCode",
                schema: "i18n",
                table: "survey_theme_translations",
                columns: new[] { "ThemeId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_survey_themes_IsDeleted",
                schema: "themes",
                table: "survey_themes",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_survey_themes_IsPublic",
                schema: "themes",
                table: "survey_themes",
                column: "IsPublic");

            migrationBuilder.CreateIndex(
                name: "IX_survey_themes_NamespaceId",
                schema: "themes",
                table: "survey_themes",
                column: "NamespaceId");

            migrationBuilder.CreateIndex(
                name: "IX_survey_themes_NamespaceId_IsDefault",
                schema: "themes",
                table: "survey_themes",
                columns: new[] { "NamespaceId", "IsDefault" });

            migrationBuilder.CreateIndex(
                name: "IX_survey_translations_LanguageCode",
                schema: "i18n",
                table: "survey_translations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_survey_translations_SurveyId",
                schema: "i18n",
                table: "survey_translations",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_survey_translations_SurveyId_LanguageCode",
                schema: "i18n",
                table: "survey_translations",
                columns: new[] { "SurveyId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_surveys_AccessToken",
                schema: "survey",
                table: "surveys",
                column: "AccessToken",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_surveys_CreatedAt",
                schema: "survey",
                table: "surveys",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_surveys_IsDeleted",
                schema: "survey",
                table: "surveys",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_surveys_NamespaceId",
                schema: "survey",
                table: "surveys",
                column: "NamespaceId");

            migrationBuilder.CreateIndex(
                name: "IX_surveys_PresetThemeId",
                schema: "survey",
                table: "surveys",
                column: "PresetThemeId");

            migrationBuilder.CreateIndex(
                name: "IX_surveys_Status",
                schema: "survey",
                table: "surveys",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_surveys_ThemeId",
                schema: "survey",
                table: "surveys",
                column: "ThemeId");

            migrationBuilder.CreateIndex(
                name: "IX_surveys_Type",
                schema: "survey",
                table: "surveys",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_template_question_translations_LanguageCode",
                schema: "i18n",
                table: "template_question_translations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_template_question_translations_TemplateQuestionId",
                schema: "i18n",
                table: "template_question_translations",
                column: "TemplateQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_template_question_translations_TemplateQuestionId_LanguageC~",
                schema: "i18n",
                table: "template_question_translations",
                columns: new[] { "TemplateQuestionId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_template_questions_IsDeleted",
                schema: "templates",
                table: "template_questions",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_template_questions_TemplateId",
                schema: "templates",
                table: "template_questions",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_template_questions_TemplateId_Order",
                schema: "templates",
                table: "template_questions",
                columns: new[] { "TemplateId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_user_preferences_UserId",
                schema: "core",
                table: "user_preferences",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_CreatedAt",
                schema: "core",
                table: "users",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_users_Email",
                schema: "core",
                table: "users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_IsDeleted",
                schema: "core",
                table: "users",
                column: "IsDeleted");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "answers",
                schema: "survey");

            migrationBuilder.DropTable(
                name: "email_recipients",
                schema: "distribution");

            migrationBuilder.DropTable(
                name: "email_template_translations",
                schema: "i18n");

            migrationBuilder.DropTable(
                name: "link_clicks",
                schema: "distribution");

            migrationBuilder.DropTable(
                name: "namespace_memberships",
                schema: "core");

            migrationBuilder.DropTable(
                name: "notifications",
                schema: "core");

            migrationBuilder.DropTable(
                name: "question_logics",
                schema: "survey");

            migrationBuilder.DropTable(
                name: "question_translations",
                schema: "i18n");

            migrationBuilder.DropTable(
                name: "recurring_survey_runs",
                schema: "scheduling");

            migrationBuilder.DropTable(
                name: "survey_template_translations",
                schema: "i18n");

            migrationBuilder.DropTable(
                name: "survey_theme_translations",
                schema: "i18n");

            migrationBuilder.DropTable(
                name: "survey_translations",
                schema: "i18n");

            migrationBuilder.DropTable(
                name: "template_question_translations",
                schema: "i18n");

            migrationBuilder.DropTable(
                name: "user_preferences",
                schema: "core");

            migrationBuilder.DropTable(
                name: "email_distributions",
                schema: "distribution");

            migrationBuilder.DropTable(
                name: "survey_responses",
                schema: "survey");

            migrationBuilder.DropTable(
                name: "questions",
                schema: "survey");

            migrationBuilder.DropTable(
                name: "recurring_surveys",
                schema: "scheduling");

            migrationBuilder.DropTable(
                name: "template_questions",
                schema: "templates");

            migrationBuilder.DropTable(
                name: "email_templates",
                schema: "distribution");

            migrationBuilder.DropTable(
                name: "survey_links",
                schema: "distribution");

            migrationBuilder.DropTable(
                name: "users",
                schema: "core");

            migrationBuilder.DropTable(
                name: "survey_templates",
                schema: "templates");

            migrationBuilder.DropTable(
                name: "surveys",
                schema: "survey");

            migrationBuilder.DropTable(
                name: "survey_themes",
                schema: "themes");

            migrationBuilder.DropTable(
                name: "namespaces",
                schema: "core");
        }
    }
}
