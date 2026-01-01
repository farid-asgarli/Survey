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
            migrationBuilder.CreateTable(
                name: "EmailTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NamespaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    DefaultLanguage = table.Column<string>(
                        type: "character varying(10)",
                        maxLength: 10,
                        nullable: false,
                        defaultValue: "en"
                    ),
                    Type = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    IsDefault = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    AvailablePlaceholders = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailTemplates", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "Namespaces",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: false
                    ),
                    Slug = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    SubscriptionTier = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false
                    ),
                    IsActive = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: true
                    ),
                    MaxUsers = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 10
                    ),
                    MaxSurveys = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 10
                    ),
                    Description = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: true
                    ),
                    LogoUrl = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: true
                    ),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Namespaces", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: false
                    ),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    LastName = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    EmailConfirmed = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    ProfilePictureUrl = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: true
                    ),
                    LastLoginAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    IsActive = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: true
                    ),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "EmailTemplateTranslations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EmailTemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(
                        type: "character varying(200)",
                        maxLength: 200,
                        nullable: false
                    ),
                    Subject = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: false
                    ),
                    HtmlBody = table.Column<string>(type: "text", nullable: false),
                    PlainTextBody = table.Column<string>(type: "text", nullable: true),
                    DesignJson = table.Column<string>(type: "jsonb", nullable: true),
                    LanguageCode = table.Column<string>(
                        type: "character varying(10)",
                        maxLength: 10,
                        nullable: false
                    ),
                    IsDefault = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    LastModifiedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailTemplateTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmailTemplateTranslations_EmailTemplates_EmailTemplateId",
                        column: x => x.EmailTemplateId,
                        principalTable: "EmailTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "SurveyTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NamespaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    DefaultLanguage = table.Column<string>(
                        type: "character varying(10)",
                        maxLength: 10,
                        nullable: false,
                        defaultValue: "en"
                    ),
                    IsPublic = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DefaultAllowAnonymous = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: true
                    ),
                    DefaultAllowMultipleResponses = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    UsageCount = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyTemplates_Namespaces_NamespaceId",
                        column: x => x.NamespaceId,
                        principalTable: "Namespaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "SurveyThemes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NamespaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    DefaultLanguage = table.Column<string>(
                        type: "character varying(10)",
                        maxLength: 10,
                        nullable: false,
                        defaultValue: "en"
                    ),
                    IsDefault = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    IsPublic = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: true
                    ),
                    IsSystem = table.Column<bool>(type: "boolean", nullable: false),
                    PrimaryColor = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "#3B82F6"
                    ),
                    OnPrimaryColor = table.Column<string>(type: "text", nullable: false),
                    PrimaryContainerColor = table.Column<string>(type: "text", nullable: false),
                    OnPrimaryContainerColor = table.Column<string>(type: "text", nullable: false),
                    SecondaryColor = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "#64748B"
                    ),
                    OnSecondaryColor = table.Column<string>(type: "text", nullable: false),
                    SecondaryContainerColor = table.Column<string>(type: "text", nullable: false),
                    OnSecondaryContainerColor = table.Column<string>(type: "text", nullable: false),
                    SurfaceColor = table.Column<string>(type: "text", nullable: false),
                    SurfaceContainerLowestColor = table.Column<string>(
                        type: "text",
                        nullable: false
                    ),
                    SurfaceContainerLowColor = table.Column<string>(type: "text", nullable: false),
                    SurfaceContainerColor = table.Column<string>(type: "text", nullable: false),
                    SurfaceContainerHighColor = table.Column<string>(type: "text", nullable: false),
                    SurfaceContainerHighestColor = table.Column<string>(
                        type: "text",
                        nullable: false
                    ),
                    OnSurfaceColor = table.Column<string>(type: "text", nullable: false),
                    OnSurfaceVariantColor = table.Column<string>(type: "text", nullable: false),
                    OutlineColor = table.Column<string>(type: "text", nullable: false),
                    OutlineVariantColor = table.Column<string>(type: "text", nullable: false),
                    BackgroundColor = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "#FFFFFF"
                    ),
                    TextColor = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "#1F2937"
                    ),
                    AccentColor = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "#8B5CF6"
                    ),
                    ErrorColor = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "#EF4444"
                    ),
                    SuccessColor = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "#22C55E"
                    ),
                    FontFamily = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: false,
                        defaultValue: "Inter"
                    ),
                    HeadingFontFamily = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: false,
                        defaultValue: "Inter"
                    ),
                    BaseFontSize = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 16
                    ),
                    Layout = table.Column<string>(
                        type: "text",
                        nullable: false,
                        defaultValue: "Classic"
                    ),
                    BackgroundImageUrl = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: true
                    ),
                    BackgroundPosition = table.Column<string>(
                        type: "text",
                        nullable: false,
                        defaultValue: "Cover"
                    ),
                    ShowProgressBar = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: true
                    ),
                    ProgressBarStyle = table.Column<string>(type: "text", nullable: false),
                    LogoUrl = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: true
                    ),
                    LogoPosition = table.Column<string>(
                        type: "text",
                        nullable: false,
                        defaultValue: "TopLeft"
                    ),
                    LogoSize = table.Column<int>(type: "integer", nullable: false),
                    ShowLogoBackground = table.Column<bool>(type: "boolean", nullable: false),
                    LogoBackgroundColor = table.Column<string>(type: "text", nullable: true),
                    BrandingTitle = table.Column<string>(type: "text", nullable: true),
                    BrandingSubtitle = table.Column<string>(type: "text", nullable: true),
                    ShowPoweredBy = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: true
                    ),
                    ButtonStyle = table.Column<string>(
                        type: "text",
                        nullable: false,
                        defaultValue: "Rounded"
                    ),
                    ButtonTextColor = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "#FFFFFF"
                    ),
                    CustomCss = table.Column<string>(
                        type: "character varying(50000)",
                        maxLength: 50000,
                        nullable: true
                    ),
                    UsageCount = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyThemes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyThemes_Namespaces_NamespaceId",
                        column: x => x.NamespaceId,
                        principalTable: "Namespaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "NamespaceMemberships",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    NamespaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false
                    ),
                    JoinedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    InvitedBy = table.Column<Guid>(type: "uuid", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NamespaceMemberships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NamespaceMemberships_Namespaces_NamespaceId",
                        column: x => x.NamespaceId,
                        principalTable: "Namespaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_NamespaceMemberships_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "UserPreferences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ThemeMode = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "system"
                    ),
                    ColorPalette = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "purple"
                    ),
                    HighContrastMode = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    ReducedMotion = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    ScreenReaderOptimized = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    FontSizeScale = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "medium"
                    ),
                    DyslexiaFriendlyFont = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    Language = table.Column<string>(
                        type: "character varying(10)",
                        maxLength: 10,
                        nullable: false,
                        defaultValue: "en"
                    ),
                    DateFormat = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "MM/DD/YYYY"
                    ),
                    TimeFormat = table.Column<string>(
                        type: "character varying(10)",
                        maxLength: 10,
                        nullable: false,
                        defaultValue: "12h"
                    ),
                    Timezone = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: false,
                        defaultValue: "UTC"
                    ),
                    DecimalSeparator = table.Column<string>(
                        type: "character varying(10)",
                        maxLength: 10,
                        nullable: false,
                        defaultValue: "dot"
                    ),
                    ThousandsSeparator = table.Column<string>(
                        type: "character varying(10)",
                        maxLength: 10,
                        nullable: false,
                        defaultValue: "comma"
                    ),
                    EmailNotifications = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: true
                    ),
                    ResponseAlerts = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: true
                    ),
                    WeeklyDigest = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    MarketingEmails = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    CompletionAlerts = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: true
                    ),
                    DistributionReports = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: true
                    ),
                    DefaultViewMode = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "grid"
                    ),
                    ItemsPerPage = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 12
                    ),
                    SidebarCollapsed = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DefaultSortField = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false,
                        defaultValue: "updatedAt"
                    ),
                    DefaultSortOrder = table.Column<string>(
                        type: "character varying(10)",
                        maxLength: 10,
                        nullable: false,
                        defaultValue: "desc"
                    ),
                    HomeWidgets = table.Column<string>(
                        type: "character varying(1000)",
                        maxLength: 1000,
                        nullable: false,
                        defaultValue: "[\"stats\",\"recent\",\"quick-actions\"]"
                    ),
                    PinnedSurveyIds = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: false,
                        defaultValue: ""
                    ),
                    DefaultQuestionRequired = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: true
                    ),
                    DefaultThemeId = table.Column<Guid>(type: "uuid", nullable: true),
                    DefaultWelcomeMessage = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: false,
                        defaultValue: ""
                    ),
                    DefaultThankYouMessage = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: false,
                        defaultValue: ""
                    ),
                    AutoSaveInterval = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 30
                    ),
                    QuestionNumberingStyle = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "numbers"
                    ),
                    ShowQuestionDescriptions = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: true
                    ),
                    DefaultPageBreakBehavior = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "auto"
                    ),
                    OnboardingStatus = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "not_started"
                    ),
                    OnboardingCompletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    OnboardingCurrentStep = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    HasSeenWelcomeTour = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    HasCompletedProfileSetup = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    HasCreatedFirstSurvey = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPreferences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPreferences_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "SurveyTemplateTranslations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(
                        type: "character varying(200)",
                        maxLength: 200,
                        nullable: false
                    ),
                    Description = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: true
                    ),
                    Category = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: true
                    ),
                    WelcomeMessage = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: true
                    ),
                    ThankYouMessage = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: true
                    ),
                    LanguageCode = table.Column<string>(
                        type: "character varying(10)",
                        maxLength: 10,
                        nullable: false
                    ),
                    IsDefault = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    LastModifiedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyTemplateTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyTemplateTranslations_SurveyTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "SurveyTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "TemplateQuestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(
                        type: "character varying(30)",
                        maxLength: 30,
                        nullable: false
                    ),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    IsRequired = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    SettingsJson = table.Column<string>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TemplateQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TemplateQuestions_SurveyTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "SurveyTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "Surveys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NamespaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(
                        type: "character varying(30)",
                        maxLength: 30,
                        nullable: false,
                        defaultValue: "Classic"
                    ),
                    CxMetricType = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: true
                    ),
                    Status = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false
                    ),
                    AccessToken = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: false
                    ),
                    PublishedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    ClosedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    StartsAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    EndsAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    AllowAnonymousResponses = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    AllowMultipleResponses = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    MaxResponses = table.Column<int>(type: "integer", nullable: true),
                    ThemeId = table.Column<Guid>(type: "uuid", nullable: true),
                    PresetThemeId = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: true
                    ),
                    ThemeCustomizations = table.Column<string>(type: "jsonb", nullable: true),
                    DefaultLanguage = table.Column<string>(
                        type: "character varying(10)",
                        maxLength: 10,
                        nullable: false,
                        defaultValue: "en"
                    ),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Surveys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Surveys_Namespaces_NamespaceId",
                        column: x => x.NamespaceId,
                        principalTable: "Namespaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_Surveys_SurveyThemes_ThemeId",
                        column: x => x.ThemeId,
                        principalTable: "SurveyThemes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "SurveyThemeTranslations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ThemeId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(
                        type: "character varying(200)",
                        maxLength: 200,
                        nullable: false
                    ),
                    Description = table.Column<string>(
                        type: "character varying(1000)",
                        maxLength: 1000,
                        nullable: true
                    ),
                    LanguageCode = table.Column<string>(
                        type: "character varying(10)",
                        maxLength: 10,
                        nullable: false
                    ),
                    IsDefault = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    LastModifiedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyThemeTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyThemeTranslations_SurveyThemes_ThemeId",
                        column: x => x.ThemeId,
                        principalTable: "SurveyThemes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "TemplateQuestionTranslations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TemplateQuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Text = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: false
                    ),
                    Description = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: true
                    ),
                    TranslatedSettingsJson = table.Column<string>(type: "jsonb", nullable: true),
                    LanguageCode = table.Column<string>(
                        type: "character varying(10)",
                        maxLength: 10,
                        nullable: false
                    ),
                    IsDefault = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    LastModifiedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TemplateQuestionTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TemplateQuestionTranslations_TemplateQuestions_TemplateQues~",
                        column: x => x.TemplateQuestionId,
                        principalTable: "TemplateQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "EmailDistributions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyId = table.Column<Guid>(type: "uuid", nullable: false),
                    NamespaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    EmailTemplateId = table.Column<Guid>(type: "uuid", nullable: true),
                    Subject = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: false
                    ),
                    Body = table.Column<string>(type: "text", nullable: false),
                    SenderName = table.Column<string>(
                        type: "character varying(200)",
                        maxLength: 200,
                        nullable: true
                    ),
                    SenderEmail = table.Column<string>(
                        type: "character varying(320)",
                        maxLength: 320,
                        nullable: true
                    ),
                    ScheduledAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    SentAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    Status = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false,
                        defaultValue: "Draft"
                    ),
                    TotalRecipients = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    SentCount = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    DeliveredCount = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    OpenedCount = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    ClickedCount = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    BouncedCount = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    UnsubscribedCount = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailDistributions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmailDistributions_EmailTemplates_EmailTemplateId",
                        column: x => x.EmailTemplateId,
                        principalTable: "EmailTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "FK_EmailDistributions_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(
                        type: "character varying(30)",
                        maxLength: 30,
                        nullable: false
                    ),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    IsRequired = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    SettingsJson = table.Column<string>(type: "jsonb", nullable: true),
                    IsNpsQuestion = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    NpsType = table.Column<string>(
                        type: "character varying(30)",
                        maxLength: 30,
                        nullable: true
                    ),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Questions_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "RecurringSurveys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyId = table.Column<Guid>(type: "uuid", nullable: false),
                    NamespaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(
                        type: "character varying(200)",
                        maxLength: 200,
                        nullable: false
                    ),
                    IsActive = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    Pattern = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false
                    ),
                    CronExpression = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: true
                    ),
                    SendTime = table.Column<TimeOnly>(
                        type: "time without time zone",
                        nullable: false
                    ),
                    TimezoneId = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: false
                    ),
                    DaysOfWeek = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    DayOfMonth = table.Column<int>(type: "integer", nullable: true),
                    AudienceType = table.Column<string>(
                        type: "character varying(30)",
                        maxLength: 30,
                        nullable: false
                    ),
                    RecipientEmails = table.Column<string>(
                        type: "character varying(10000)",
                        maxLength: 10000,
                        nullable: false
                    ),
                    AudienceListId = table.Column<Guid>(type: "uuid", nullable: true),
                    SendReminders = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    ReminderDaysAfter = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 3
                    ),
                    MaxReminders = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 2
                    ),
                    CustomSubject = table.Column<string>(
                        type: "character varying(200)",
                        maxLength: 200,
                        nullable: true
                    ),
                    CustomMessage = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: true
                    ),
                    NextRunAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    LastRunAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    TotalRuns = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    EndsAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    MaxRuns = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecurringSurveys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecurringSurveys_Namespaces_NamespaceId",
                        column: x => x.NamespaceId,
                        principalTable: "Namespaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_RecurringSurveys_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "SurveyLinks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Token = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    Type = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false
                    ),
                    Name = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: true
                    ),
                    Source = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: true
                    ),
                    Medium = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: true
                    ),
                    Campaign = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: true
                    ),
                    PrefillDataJson = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: true
                    ),
                    ExpiresAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    MaxUses = table.Column<int>(type: "integer", nullable: true),
                    UsageCount = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    ResponseCount = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    Password = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: true
                    ),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyLinks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyLinks_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "SurveyTranslations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: false
                    ),
                    Description = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: true
                    ),
                    WelcomeMessage = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: true
                    ),
                    ThankYouMessage = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: true
                    ),
                    LanguageCode = table.Column<string>(
                        type: "character varying(10)",
                        maxLength: 10,
                        nullable: false
                    ),
                    IsDefault = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    LastModifiedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyTranslations_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "EmailRecipients",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DistributionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(
                        type: "character varying(320)",
                        maxLength: 320,
                        nullable: false
                    ),
                    Name = table.Column<string>(
                        type: "character varying(200)",
                        maxLength: 200,
                        nullable: true
                    ),
                    Status = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false,
                        defaultValue: "Pending"
                    ),
                    SentAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeliveredAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    OpenedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    ClickedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UniqueToken = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    ErrorMessage = table.Column<string>(
                        type: "character varying(1000)",
                        maxLength: 1000,
                        nullable: true
                    ),
                    OpenCount = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    ClickCount = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailRecipients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmailRecipients_EmailDistributions_DistributionId",
                        column: x => x.DistributionId,
                        principalTable: "EmailDistributions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "QuestionLogics",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceQuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Operator = table.Column<string>(
                        type: "character varying(30)",
                        maxLength: 30,
                        nullable: false
                    ),
                    ConditionValue = table.Column<string>(
                        type: "character varying(1000)",
                        maxLength: 1000,
                        nullable: false
                    ),
                    Action = table.Column<string>(
                        type: "character varying(30)",
                        maxLength: 30,
                        nullable: false
                    ),
                    TargetQuestionId = table.Column<Guid>(type: "uuid", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionLogics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionLogics_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_QuestionLogics_Questions_SourceQuestionId",
                        column: x => x.SourceQuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "FK_QuestionLogics_Questions_TargetQuestionId",
                        column: x => x.TargetQuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "QuestionTranslations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Text = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: false
                    ),
                    Description = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: true
                    ),
                    TranslatedSettingsJson = table.Column<string>(type: "jsonb", nullable: true),
                    LanguageCode = table.Column<string>(
                        type: "character varying(10)",
                        maxLength: 10,
                        nullable: false
                    ),
                    IsDefault = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    LastModifiedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionTranslations_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "RecurringSurveyRuns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RecurringSurveyId = table.Column<Guid>(type: "uuid", nullable: false),
                    RunNumber = table.Column<int>(type: "integer", nullable: false),
                    ScheduledAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    StartedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    CompletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    Status = table.Column<string>(
                        type: "character varying(30)",
                        maxLength: 30,
                        nullable: false
                    ),
                    RecipientsCount = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    SentCount = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    FailedCount = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    ResponsesCount = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    ErrorMessage = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: true
                    ),
                    DurationMs = table.Column<long>(
                        type: "bigint",
                        nullable: false,
                        defaultValue: 0L
                    ),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecurringSurveyRuns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecurringSurveyRuns_RecurringSurveys_RecurringSurveyId",
                        column: x => x.RecurringSurveyId,
                        principalTable: "RecurringSurveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "SurveyResponses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyId = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyLinkId = table.Column<Guid>(type: "uuid", nullable: true),
                    RespondentEmail = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: true
                    ),
                    RespondentName = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: true
                    ),
                    IsComplete = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    StartedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    SubmittedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    TimeSpentSeconds = table.Column<int>(type: "integer", nullable: true),
                    IpAddress = table.Column<string>(
                        type: "character varying(45)",
                        maxLength: 45,
                        nullable: true
                    ),
                    UserAgent = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: true
                    ),
                    AccessToken = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: false
                    ),
                    RespondentUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyResponses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyResponses_SurveyLinks_SurveyLinkId",
                        column: x => x.SurveyLinkId,
                        principalTable: "SurveyLinks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "FK_SurveyResponses_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_SurveyResponses_Users_RespondentUserId",
                        column: x => x.RespondentUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "Answers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ResponseId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    AnswerValue = table.Column<string>(type: "text", nullable: false),
                    AnsweredAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Answers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Answers_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "FK_Answers_SurveyResponses_ResponseId",
                        column: x => x.ResponseId,
                        principalTable: "SurveyResponses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "LinkClicks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SurveyLinkId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClickedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    IpAddress = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: true
                    ),
                    UserAgent = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: true
                    ),
                    Referrer = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: true
                    ),
                    Country = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: true
                    ),
                    City = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: true
                    ),
                    DeviceType = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: true
                    ),
                    Browser = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: true
                    ),
                    OperatingSystem = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: true
                    ),
                    ResponseId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    DeletedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LinkClicks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LinkClicks_SurveyLinks_SurveyLinkId",
                        column: x => x.SurveyLinkId,
                        principalTable: "SurveyLinks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_LinkClicks_SurveyResponses_ResponseId",
                        column: x => x.ResponseId,
                        principalTable: "SurveyResponses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_Answers_IsDeleted",
                table: "Answers",
                column: "IsDeleted"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Answers_QuestionId",
                table: "Answers",
                column: "QuestionId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Answers_ResponseId",
                table: "Answers",
                column: "ResponseId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Answers_ResponseId_QuestionId",
                table: "Answers",
                columns: ["ResponseId", "QuestionId"],
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_EmailDistributions_EmailTemplateId",
                table: "EmailDistributions",
                column: "EmailTemplateId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_EmailDistributions_NamespaceId",
                table: "EmailDistributions",
                column: "NamespaceId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_EmailDistributions_ScheduledAt",
                table: "EmailDistributions",
                column: "ScheduledAt",
                filter: "\"Status\" = 'Scheduled'"
            );

            migrationBuilder.CreateIndex(
                name: "IX_EmailDistributions_Status",
                table: "EmailDistributions",
                column: "Status"
            );

            migrationBuilder.CreateIndex(
                name: "IX_EmailDistributions_SurveyId",
                table: "EmailDistributions",
                column: "SurveyId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_EmailRecipients_DistributionId",
                table: "EmailRecipients",
                column: "DistributionId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_EmailRecipients_Email",
                table: "EmailRecipients",
                column: "Email"
            );

            migrationBuilder.CreateIndex(
                name: "IX_EmailRecipients_Status",
                table: "EmailRecipients",
                column: "Status"
            );

            migrationBuilder.CreateIndex(
                name: "IX_EmailRecipients_UniqueToken",
                table: "EmailRecipients",
                column: "UniqueToken",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplates_NamespaceId",
                table: "EmailTemplates",
                column: "NamespaceId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplates_NamespaceId_Type_IsDefault",
                table: "EmailTemplates",
                columns: ["NamespaceId", "Type", "IsDefault"]
            );

            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplateTranslations_EmailTemplateId",
                table: "EmailTemplateTranslations",
                column: "EmailTemplateId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplateTranslations_EmailTemplateId_LanguageCode",
                table: "EmailTemplateTranslations",
                columns: ["EmailTemplateId", "LanguageCode"],
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplateTranslations_LanguageCode",
                table: "EmailTemplateTranslations",
                column: "LanguageCode"
            );

            migrationBuilder.CreateIndex(
                name: "IX_LinkClicks_ClickedAt",
                table: "LinkClicks",
                column: "ClickedAt"
            );

            migrationBuilder.CreateIndex(
                name: "IX_LinkClicks_IsDeleted",
                table: "LinkClicks",
                column: "IsDeleted"
            );

            migrationBuilder.CreateIndex(
                name: "IX_LinkClicks_ResponseId",
                table: "LinkClicks",
                column: "ResponseId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_LinkClicks_SurveyLinkId",
                table: "LinkClicks",
                column: "SurveyLinkId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_NamespaceMemberships_NamespaceId_UserId",
                table: "NamespaceMemberships",
                columns: ["NamespaceId", "UserId"],
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_NamespaceMemberships_Role",
                table: "NamespaceMemberships",
                column: "Role"
            );

            migrationBuilder.CreateIndex(
                name: "IX_NamespaceMemberships_UserId",
                table: "NamespaceMemberships",
                column: "UserId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Namespaces_CreatedAt",
                table: "Namespaces",
                column: "CreatedAt"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Namespaces_IsDeleted",
                table: "Namespaces",
                column: "IsDeleted"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Namespaces_Slug",
                table: "Namespaces",
                column: "Slug",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_QuestionLogics_IsDeleted",
                table: "QuestionLogics",
                column: "IsDeleted"
            );

            migrationBuilder.CreateIndex(
                name: "IX_QuestionLogics_QuestionId",
                table: "QuestionLogics",
                column: "QuestionId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_QuestionLogics_QuestionId_Priority",
                table: "QuestionLogics",
                columns: ["QuestionId", "Priority"]
            );

            migrationBuilder.CreateIndex(
                name: "IX_QuestionLogics_SourceQuestionId",
                table: "QuestionLogics",
                column: "SourceQuestionId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_QuestionLogics_TargetQuestionId",
                table: "QuestionLogics",
                column: "TargetQuestionId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Questions_IsDeleted",
                table: "Questions",
                column: "IsDeleted"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Questions_IsNpsQuestion",
                table: "Questions",
                column: "IsNpsQuestion"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Questions_SurveyId",
                table: "Questions",
                column: "SurveyId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Questions_SurveyId_Order",
                table: "Questions",
                columns: ["SurveyId", "Order"]
            );

            migrationBuilder.CreateIndex(
                name: "IX_QuestionTranslations_LanguageCode",
                table: "QuestionTranslations",
                column: "LanguageCode"
            );

            migrationBuilder.CreateIndex(
                name: "IX_QuestionTranslations_QuestionId",
                table: "QuestionTranslations",
                column: "QuestionId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_QuestionTranslations_QuestionId_LanguageCode",
                table: "QuestionTranslations",
                columns: ["QuestionId", "LanguageCode"],
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_RecurringSurveyRuns_IsDeleted",
                table: "RecurringSurveyRuns",
                column: "IsDeleted"
            );

            migrationBuilder.CreateIndex(
                name: "IX_RecurringSurveyRuns_RecurringSurveyId",
                table: "RecurringSurveyRuns",
                column: "RecurringSurveyId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_RecurringSurveyRuns_ScheduledAt",
                table: "RecurringSurveyRuns",
                column: "ScheduledAt"
            );

            migrationBuilder.CreateIndex(
                name: "IX_RecurringSurveyRuns_Status",
                table: "RecurringSurveyRuns",
                column: "Status"
            );

            migrationBuilder.CreateIndex(
                name: "IX_RecurringSurveys_IsActive",
                table: "RecurringSurveys",
                column: "IsActive"
            );

            migrationBuilder.CreateIndex(
                name: "IX_RecurringSurveys_IsDeleted",
                table: "RecurringSurveys",
                column: "IsDeleted"
            );

            migrationBuilder.CreateIndex(
                name: "IX_RecurringSurveys_NamespaceId",
                table: "RecurringSurveys",
                column: "NamespaceId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_RecurringSurveys_NextRunAt",
                table: "RecurringSurveys",
                column: "NextRunAt"
            );

            migrationBuilder.CreateIndex(
                name: "IX_RecurringSurveys_SurveyId",
                table: "RecurringSurveys",
                column: "SurveyId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyLinks_CreatedAt",
                table: "SurveyLinks",
                column: "CreatedAt"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyLinks_IsActive",
                table: "SurveyLinks",
                column: "IsActive"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyLinks_IsDeleted",
                table: "SurveyLinks",
                column: "IsDeleted"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyLinks_SurveyId",
                table: "SurveyLinks",
                column: "SurveyId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyLinks_Token",
                table: "SurveyLinks",
                column: "Token",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_IsComplete",
                table: "SurveyResponses",
                column: "IsComplete"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_IsDeleted",
                table: "SurveyResponses",
                column: "IsDeleted"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_RespondentEmail",
                table: "SurveyResponses",
                column: "RespondentEmail"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_RespondentUserId",
                table: "SurveyResponses",
                column: "RespondentUserId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_SubmittedAt",
                table: "SurveyResponses",
                column: "SubmittedAt"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_SurveyId",
                table: "SurveyResponses",
                column: "SurveyId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_SurveyLinkId",
                table: "SurveyResponses",
                column: "SurveyLinkId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Surveys_AccessToken",
                table: "Surveys",
                column: "AccessToken",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_Surveys_CreatedAt",
                table: "Surveys",
                column: "CreatedAt"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Surveys_IsDeleted",
                table: "Surveys",
                column: "IsDeleted"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Surveys_NamespaceId",
                table: "Surveys",
                column: "NamespaceId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Surveys_PresetThemeId",
                table: "Surveys",
                column: "PresetThemeId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Surveys_Status",
                table: "Surveys",
                column: "Status"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Surveys_ThemeId",
                table: "Surveys",
                column: "ThemeId"
            );

            migrationBuilder.CreateIndex(name: "IX_Surveys_Type", table: "Surveys", column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyTemplates_CreatedAt",
                table: "SurveyTemplates",
                column: "CreatedAt"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyTemplates_IsDeleted",
                table: "SurveyTemplates",
                column: "IsDeleted"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyTemplates_IsPublic",
                table: "SurveyTemplates",
                column: "IsPublic"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyTemplates_NamespaceId",
                table: "SurveyTemplates",
                column: "NamespaceId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyTemplateTranslations_LanguageCode",
                table: "SurveyTemplateTranslations",
                column: "LanguageCode"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyTemplateTranslations_TemplateId",
                table: "SurveyTemplateTranslations",
                column: "TemplateId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyTemplateTranslations_TemplateId_LanguageCode",
                table: "SurveyTemplateTranslations",
                columns: ["TemplateId", "LanguageCode"],
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyThemes_IsDeleted",
                table: "SurveyThemes",
                column: "IsDeleted"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyThemes_IsPublic",
                table: "SurveyThemes",
                column: "IsPublic"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyThemes_NamespaceId",
                table: "SurveyThemes",
                column: "NamespaceId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyThemes_NamespaceId_IsDefault",
                table: "SurveyThemes",
                columns: ["NamespaceId", "IsDefault"]
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyThemeTranslations_LanguageCode",
                table: "SurveyThemeTranslations",
                column: "LanguageCode"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyThemeTranslations_ThemeId",
                table: "SurveyThemeTranslations",
                column: "ThemeId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyThemeTranslations_ThemeId_LanguageCode",
                table: "SurveyThemeTranslations",
                columns: ["ThemeId", "LanguageCode"],
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyTranslations_LanguageCode",
                table: "SurveyTranslations",
                column: "LanguageCode"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyTranslations_SurveyId",
                table: "SurveyTranslations",
                column: "SurveyId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SurveyTranslations_SurveyId_LanguageCode",
                table: "SurveyTranslations",
                columns: ["SurveyId", "LanguageCode"],
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_TemplateQuestions_IsDeleted",
                table: "TemplateQuestions",
                column: "IsDeleted"
            );

            migrationBuilder.CreateIndex(
                name: "IX_TemplateQuestions_TemplateId",
                table: "TemplateQuestions",
                column: "TemplateId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_TemplateQuestions_TemplateId_Order",
                table: "TemplateQuestions",
                columns: ["TemplateId", "Order"]
            );

            migrationBuilder.CreateIndex(
                name: "IX_TemplateQuestionTranslations_LanguageCode",
                table: "TemplateQuestionTranslations",
                column: "LanguageCode"
            );

            migrationBuilder.CreateIndex(
                name: "IX_TemplateQuestionTranslations_TemplateQuestionId",
                table: "TemplateQuestionTranslations",
                column: "TemplateQuestionId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_TemplateQuestionTranslations_TemplateQuestionId_LanguageCode",
                table: "TemplateQuestionTranslations",
                columns: ["TemplateQuestionId", "LanguageCode"],
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_UserPreferences_UserId",
                table: "UserPreferences",
                column: "UserId",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_Users_CreatedAt",
                table: "Users",
                column: "CreatedAt"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_Users_IsDeleted",
                table: "Users",
                column: "IsDeleted"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Answers");

            migrationBuilder.DropTable(name: "EmailRecipients");

            migrationBuilder.DropTable(name: "EmailTemplateTranslations");

            migrationBuilder.DropTable(name: "LinkClicks");

            migrationBuilder.DropTable(name: "NamespaceMemberships");

            migrationBuilder.DropTable(name: "QuestionLogics");

            migrationBuilder.DropTable(name: "QuestionTranslations");

            migrationBuilder.DropTable(name: "RecurringSurveyRuns");

            migrationBuilder.DropTable(name: "SurveyTemplateTranslations");

            migrationBuilder.DropTable(name: "SurveyThemeTranslations");

            migrationBuilder.DropTable(name: "SurveyTranslations");

            migrationBuilder.DropTable(name: "TemplateQuestionTranslations");

            migrationBuilder.DropTable(name: "UserPreferences");

            migrationBuilder.DropTable(name: "EmailDistributions");

            migrationBuilder.DropTable(name: "SurveyResponses");

            migrationBuilder.DropTable(name: "Questions");

            migrationBuilder.DropTable(name: "RecurringSurveys");

            migrationBuilder.DropTable(name: "TemplateQuestions");

            migrationBuilder.DropTable(name: "EmailTemplates");

            migrationBuilder.DropTable(name: "SurveyLinks");

            migrationBuilder.DropTable(name: "Users");

            migrationBuilder.DropTable(name: "SurveyTemplates");

            migrationBuilder.DropTable(name: "Surveys");

            migrationBuilder.DropTable(name: "SurveyThemes");

            migrationBuilder.DropTable(name: "Namespaces");
        }
    }
}
