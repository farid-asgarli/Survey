using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SurveyApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLocalizationSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DefaultLanguage",
                table: "Surveys",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "en");

            migrationBuilder.AddColumn<string>(
                name: "DefaultLanguage",
                table: "Questions",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "en");

            migrationBuilder.CreateTable(
                name: "EmailTemplateTranslations",
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
                    table.PrimaryKey("PK_EmailTemplateTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmailTemplateTranslations_EmailTemplates_EmailTemplateId",
                        column: x => x.EmailTemplateId,
                        principalTable: "EmailTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionTranslations",
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
                    table.PrimaryKey("PK_QuestionTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionTranslations_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SurveyTemplateTranslations",
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
                    table.PrimaryKey("PK_SurveyTemplateTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyTemplateTranslations_SurveyTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "SurveyTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SurveyThemeTranslations",
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
                    table.PrimaryKey("PK_SurveyThemeTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyThemeTranslations_SurveyThemes_ThemeId",
                        column: x => x.ThemeId,
                        principalTable: "SurveyThemes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SurveyTranslations",
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
                    table.PrimaryKey("PK_SurveyTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyTranslations_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TemplateQuestionTranslations",
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
                    table.PrimaryKey("PK_TemplateQuestionTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TemplateQuestionTranslations_TemplateQuestions_TemplateQues~",
                        column: x => x.TemplateQuestionId,
                        principalTable: "TemplateQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplateTranslations_EmailTemplateId",
                table: "EmailTemplateTranslations",
                column: "EmailTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplateTranslations_EmailTemplateId_LanguageCode",
                table: "EmailTemplateTranslations",
                columns: new[] { "EmailTemplateId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplateTranslations_LanguageCode",
                table: "EmailTemplateTranslations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionTranslations_LanguageCode",
                table: "QuestionTranslations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionTranslations_QuestionId",
                table: "QuestionTranslations",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionTranslations_QuestionId_LanguageCode",
                table: "QuestionTranslations",
                columns: new[] { "QuestionId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SurveyTemplateTranslations_LanguageCode",
                table: "SurveyTemplateTranslations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyTemplateTranslations_TemplateId",
                table: "SurveyTemplateTranslations",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyTemplateTranslations_TemplateId_LanguageCode",
                table: "SurveyTemplateTranslations",
                columns: new[] { "TemplateId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SurveyThemeTranslations_LanguageCode",
                table: "SurveyThemeTranslations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyThemeTranslations_ThemeId",
                table: "SurveyThemeTranslations",
                column: "ThemeId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyThemeTranslations_ThemeId_LanguageCode",
                table: "SurveyThemeTranslations",
                columns: new[] { "ThemeId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SurveyTranslations_LanguageCode",
                table: "SurveyTranslations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyTranslations_SurveyId",
                table: "SurveyTranslations",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyTranslations_SurveyId_LanguageCode",
                table: "SurveyTranslations",
                columns: new[] { "SurveyId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TemplateQuestionTranslations_LanguageCode",
                table: "TemplateQuestionTranslations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_TemplateQuestionTranslations_TemplateQuestionId",
                table: "TemplateQuestionTranslations",
                column: "TemplateQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_TemplateQuestionTranslations_TemplateQuestionId_LanguageCode",
                table: "TemplateQuestionTranslations",
                columns: new[] { "TemplateQuestionId", "LanguageCode" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmailTemplateTranslations");

            migrationBuilder.DropTable(
                name: "QuestionTranslations");

            migrationBuilder.DropTable(
                name: "SurveyTemplateTranslations");

            migrationBuilder.DropTable(
                name: "SurveyThemeTranslations");

            migrationBuilder.DropTable(
                name: "SurveyTranslations");

            migrationBuilder.DropTable(
                name: "TemplateQuestionTranslations");

            migrationBuilder.DropColumn(
                name: "DefaultLanguage",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "DefaultLanguage",
                table: "Questions");
        }
    }
}
