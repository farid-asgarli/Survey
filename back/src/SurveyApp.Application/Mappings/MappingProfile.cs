using AutoMapper;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Common;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Application.Mappings;

/// <summary>
/// AutoMapper profile for mapping domain entities to DTOs.
/// </summary>
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // QuestionOption mapping
        CreateMap<QuestionOption, QuestionOptionDto>();

        // QuestionSettings mapping
        CreateMap<QuestionSettings, QuestionSettingsDto>()
            .ForMember(d => d.Options, opt => opt.MapFrom(s => s.Options))
            .ForMember(
                d => d.AllowedFileTypes,
                opt =>
                    opt.MapFrom(s =>
                        s.AllowedFileTypes != null ? s.AllowedFileTypes.ToList() : null
                    )
            )
            .ForMember(
                d => d.MatrixRows,
                opt => opt.MapFrom(s => s.MatrixRows != null ? s.MatrixRows.ToList() : null)
            )
            .ForMember(
                d => d.MatrixColumns,
                opt => opt.MapFrom(s => s.MatrixColumns != null ? s.MatrixColumns.ToList() : null)
            );

        // SelectedOption mapping
        CreateMap<SelectedOption, SelectedOptionDto>();

        // Namespace mappings
        CreateMap<Namespace, NamespaceDto>()
            .ForMember(d => d.MemberCount, opt => opt.MapFrom(s => s.Memberships.Count))
            .ForMember(
                d => d.SurveyCount,
                opt => opt.MapFrom(s => s.Surveys.Count(survey => !survey.IsDeleted))
            );

        CreateMap<Namespace, NamespaceDetailsDto>()
            .ForMember(d => d.MemberCount, opt => opt.MapFrom(s => s.Memberships.Count))
            .ForMember(
                d => d.SurveyCount,
                opt => opt.MapFrom(s => s.Surveys.Count(survey => !survey.IsDeleted))
            )
            .ForMember(d => d.Members, opt => opt.MapFrom(s => s.Memberships));

        CreateMap<NamespaceMembership, NamespaceMemberDto>()
            .ForMember(d => d.Email, opt => opt.MapFrom(s => s.User.Email))
            .ForMember(d => d.FullName, opt => opt.MapFrom(s => s.User.FullName))
            .ForMember(d => d.AvatarId, opt => opt.MapFrom(s => s.User.AvatarId));

        // User mappings
        CreateMap<User, UserDto>();
        CreateMap<User, UserProfileDto>()
            .ForMember(d => d.Namespaces, opt => opt.MapFrom(s => s.Memberships));

        CreateMap<NamespaceMembership, UserNamespaceMembershipDto>()
            .ForMember(d => d.NamespaceName, opt => opt.MapFrom(s => s.Namespace.Name))
            .ForMember(d => d.NamespaceSlug, opt => opt.MapFrom(s => s.Namespace.Slug))
            .ForMember(d => d.Role, opt => opt.MapFrom(s => s.Role.ToString()));

        // Survey mappings - Title, Description, WelcomeMessage, ThankYouMessage come from default translation
        CreateMap<Survey, SurveyDto>()
            .ForMember(d => d.QuestionCount, opt => opt.MapFrom(s => s.Questions.Count))
            .ForMember(
                d => d.ResponseCount,
                opt => opt.MapFrom(s => s.Responses.Count(r => r.IsComplete))
            )
            .ForMember(d => d.Language, opt => opt.MapFrom(s => s.DefaultLanguage))
            .ForMember(
                d => d.AvailableLanguages,
                opt => opt.MapFrom(s => s.GetAvailableLanguages())
            );

        CreateMap<Survey, SurveyDetailsDto>()
            .ForMember(d => d.QuestionCount, opt => opt.MapFrom(s => s.Questions.Count))
            .ForMember(
                d => d.ResponseCount,
                opt => opt.MapFrom(s => s.Responses.Count(r => r.IsComplete))
            )
            .ForMember(d => d.Questions, opt => opt.MapFrom(s => s.Questions.OrderBy(q => q.Order)))
            .ForMember(d => d.Language, opt => opt.MapFrom(s => s.DefaultLanguage))
            .ForMember(
                d => d.AvailableLanguages,
                opt => opt.MapFrom(s => s.GetAvailableLanguages())
            );

        CreateMap<Survey, SurveyListItemDto>()
            .ForMember(d => d.QuestionCount, opt => opt.MapFrom(s => s.Questions.Count))
            .ForMember(
                d => d.ResponseCount,
                opt => opt.MapFrom(s => s.Responses.Count(r => r.IsComplete))
            );

        CreateMap<Survey, PublicSurveyDto>()
            .ForMember(d => d.Questions, opt => opt.MapFrom(s => s.Questions.OrderBy(q => q.Order)))
            .ForMember(d => d.Language, opt => opt.MapFrom(s => s.DefaultLanguage))
            .ForMember(
                d => d.AvailableLanguages,
                opt => opt.MapFrom(s => s.GetAvailableLanguages())
            );

        // Question mappings - Text and Description come from default translation
        CreateMap<Question, QuestionDto>()
            .ForMember(
                d => d.Settings,
                opt => opt.MapFrom(s => MapQuestionSettings(s.SettingsJson))
            );

        CreateMap<Question, PublicQuestionDto>()
            .ForMember(
                d => d.Settings,
                opt => opt.MapFrom(s => MapQuestionSettings(s.SettingsJson))
            );

        // Response mappings
        CreateMap<SurveyResponse, SurveyResponseDto>()
            .ForMember(d => d.SurveyTitle, opt => opt.MapFrom(s => s.Survey.Title))
            .ForMember(d => d.Answers, opt => opt.MapFrom(s => s.Answers));

        CreateMap<SurveyResponse, ResponseListItemDto>()
            .ForMember(d => d.SurveyTitle, opt => opt.MapFrom(s => s.Survey.Title))
            .ForMember(d => d.AnswerCount, opt => opt.MapFrom(s => s.Answers.Count));

        // Answer mappings
        CreateMap<Answer, AnswerDto>()
            .ForMember(
                d => d.SelectedOptions,
                opt => opt.MapFrom(s => MapAnswerOptions(s.AnswerValue))
            )
            .ForMember(d => d.Text, opt => opt.MapFrom(s => MapAnswerText(s.AnswerValue)))
            .ForMember(
                d => d.DisplayValue,
                opt => opt.MapFrom(s => MapAnswerDisplayValue(s.AnswerValue))
            )
            .ForMember(
                d => d.FileUrls,
                opt => opt.MapFrom(s => MapAnswerFileUrls(s.AnswerValue, s.Question))
            )
            .ForMember(
                d => d.MatrixAnswers,
                opt => opt.MapFrom(s => MapAnswerMatrixAnswers(s.AnswerValue, s.Question))
            );

        // Question Logic mappings
        CreateMap<QuestionLogic, QuestionLogicDto>()
            .ForMember(
                d => d.SourceQuestionText,
                opt =>
                    opt.MapFrom(s =>
                        s.SourceQuestion != null ? s.SourceQuestion.Text : string.Empty
                    )
            )
            .ForMember(
                d => d.TargetQuestionText,
                opt => opt.MapFrom(s => s.TargetQuestion != null ? s.TargetQuestion.Text : null)
            );

        // Template mappings
        CreateMap<SurveyTemplate, SurveyTemplateDto>()
            .ForMember(d => d.QuestionCount, opt => opt.MapFrom(s => s.Questions.Count))
            .ForMember(
                d => d.Questions,
                opt => opt.MapFrom(s => s.Questions.OrderBy(q => q.Order))
            );

        CreateMap<SurveyTemplate, SurveyTemplateSummaryDto>()
            .ForMember(d => d.QuestionCount, opt => opt.MapFrom(s => s.Questions.Count));

        CreateMap<TemplateQuestion, TemplateQuestionDto>()
            .ForMember(
                d => d.Settings,
                opt => opt.MapFrom(s => MapTemplateQuestionSettings(s.SettingsJson))
            );

        // Survey Theme mappings
        CreateMap<SurveyTheme, SurveyThemeDto>()
            .ForMember(
                d => d.Colors,
                opt =>
                    opt.MapFrom(s => new ThemeColorsDto
                    {
                        // Primary
                        Primary = s.PrimaryColor,
                        OnPrimary = s.OnPrimaryColor,
                        PrimaryContainer = s.PrimaryContainerColor,
                        OnPrimaryContainer = s.OnPrimaryContainerColor,
                        // Secondary
                        Secondary = s.SecondaryColor,
                        OnSecondary = s.OnSecondaryColor,
                        SecondaryContainer = s.SecondaryContainerColor,
                        OnSecondaryContainer = s.OnSecondaryContainerColor,
                        // Surface
                        Surface = s.SurfaceColor,
                        SurfaceContainerLowest = s.SurfaceContainerLowestColor,
                        SurfaceContainerLow = s.SurfaceContainerLowColor,
                        SurfaceContainer = s.SurfaceContainerColor,
                        SurfaceContainerHigh = s.SurfaceContainerHighColor,
                        SurfaceContainerHighest = s.SurfaceContainerHighestColor,
                        OnSurface = s.OnSurfaceColor,
                        OnSurfaceVariant = s.OnSurfaceVariantColor,
                        // Outline
                        Outline = s.OutlineColor,
                        OutlineVariant = s.OutlineVariantColor,
                        // Semantic
                        Error = s.ErrorColor,
                        Success = s.SuccessColor,
                        // Legacy
                        Background = s.BackgroundColor,
                        Text = s.TextColor,
                        Accent = s.AccentColor,
                    })
            )
            .ForMember(
                d => d.Typography,
                opt =>
                    opt.MapFrom(s => new ThemeTypographyDto
                    {
                        FontFamily = s.FontFamily,
                        HeadingFontFamily = s.HeadingFontFamily,
                        BaseFontSize = s.BaseFontSize,
                    })
            )
            .ForMember(
                d => d.Layout,
                opt =>
                    opt.MapFrom(s => new ThemeLayoutDto
                    {
                        Layout = s.Layout,
                        BackgroundImageUrl = s.BackgroundImageUrl,
                        BackgroundPosition = s.BackgroundPosition,
                        ShowProgressBar = s.ShowProgressBar,
                        ProgressBarStyle = s.ProgressBarStyle,
                    })
            )
            .ForMember(
                d => d.Branding,
                opt =>
                    opt.MapFrom(s => new ThemeBrandingDto
                    {
                        LogoUrl = s.LogoUrl,
                        LogoPosition = s.LogoPosition,
                        LogoSize = s.LogoSize,
                        ShowLogoBackground = s.ShowLogoBackground,
                        LogoBackgroundColor = s.LogoBackgroundColor,
                        BrandingTitle = s.BrandingTitle,
                        BrandingSubtitle = s.BrandingSubtitle,
                        ShowPoweredBy = s.ShowPoweredBy,
                    })
            )
            .ForMember(
                d => d.Button,
                opt =>
                    opt.MapFrom(s => new ThemeButtonDto
                    {
                        Style = s.ButtonStyle,
                        TextColor = s.ButtonTextColor,
                    })
            );

        CreateMap<SurveyTheme, SurveyThemeSummaryDto>();

        // RecurringSurvey mappings
        ConfigureRecurringSurveyMappings();
    }

    private static QuestionSettingsDto? MapQuestionSettings(string? settingsJson)
    {
        if (string.IsNullOrWhiteSpace(settingsJson))
            return null;

        var settings = QuestionSettings.FromJson(settingsJson);
        return new QuestionSettingsDto
        {
            Options = settings
                .Options?.Select(o => new QuestionOptionDto
                {
                    Id = o.Id,
                    Text = o.Text,
                    Order = o.Order,
                })
                .ToList(),
            MinValue = settings.MinValue,
            MaxValue = settings.MaxValue,
            MinLabel = settings.MinLabel,
            MaxLabel = settings.MaxLabel,
            AllowedFileTypes = settings.AllowedFileTypes?.ToList(),
            MaxFileSize = settings.MaxFileSize,
            MatrixRows = settings.MatrixRows?.ToList(),
            MatrixColumns = settings.MatrixColumns?.ToList(),
            Placeholder = settings.Placeholder,
            AllowOther = settings.AllowOther,
            MaxLength = settings.MaxLength,
            MinLength = settings.MinLength,
            MaxSelections = settings.MaxSelections,
            ValidationPattern = settings.ValidationPattern,
            ValidationMessage = settings.ValidationMessage,
            ValidationPreset = settings.ValidationPreset,
            RatingStyle = settings.RatingStyle,
            YesNoStyle = settings.YesNoStyle,
        };
    }

    private static QuestionSettingsResponseDto? MapTemplateQuestionSettings(string? settingsJson)
    {
        if (string.IsNullOrWhiteSpace(settingsJson))
            return null;

        var settings = QuestionSettings.FromJson(settingsJson);
        return new QuestionSettingsResponseDto
        {
            Options = settings
                .Options?.Select(o => new QuestionOptionDto
                {
                    Id = o.Id,
                    Text = o.Text,
                    Order = o.Order,
                })
                .ToList(),
            MinValue = settings.MinValue,
            MaxValue = settings.MaxValue,
            MinLabel = settings.MinLabel,
            MaxLabel = settings.MaxLabel,
            AllowedFileTypes = settings.AllowedFileTypes?.ToList(),
            MaxFileSize = settings.MaxFileSize,
            MatrixRows = settings.MatrixRows?.ToList(),
            MatrixColumns = settings.MatrixColumns?.ToList(),
            Placeholder = settings.Placeholder,
            AllowOther = settings.AllowOther,
            MaxLength = settings.MaxLength,
            MinLength = settings.MinLength,
            MaxSelections = settings.MaxSelections,
            ValidationPattern = settings.ValidationPattern,
            ValidationMessage = settings.ValidationMessage,
            ValidationPreset = settings.ValidationPreset,
            RatingStyle = settings.RatingStyle,
            YesNoStyle = settings.YesNoStyle,
        };
    }

    private void ConfigureRecurringSurveyMappings()
    {
        // RecurringSurvey mappings
        CreateMap<RecurringSurvey, RecurringSurveyDto>()
            .ForMember(d => d.SurveyTitle, opt => opt.Ignore())
            .ForMember(d => d.RecipientCount, opt => opt.MapFrom(s => s.RecipientEmails.Length));

        CreateMap<RecurringSurvey, RecurringSurveyListItemDto>()
            .ForMember(d => d.SurveyTitle, opt => opt.Ignore())
            .ForMember(d => d.RecipientCount, opt => opt.MapFrom(s => s.RecipientEmails.Length));

        // RecurringSurveyRun mappings
        CreateMap<RecurringSurveyRun, RecurringSurveyRunDto>();

        // SurveyLink mappings
        ConfigureSurveyLinkMappings();
    }

    private void ConfigureSurveyLinkMappings()
    {
        // SurveyLink mappings
        CreateMap<SurveyLink, SurveyLinkDto>()
            .ForMember(d => d.FullUrl, opt => opt.Ignore())
            .ForMember(
                d => d.HasPassword,
                opt => opt.MapFrom(s => !string.IsNullOrEmpty(s.Password))
            );

        CreateMap<SurveyLink, SurveyLinkDetailsDto>()
            .ForMember(d => d.FullUrl, opt => opt.Ignore())
            .ForMember(
                d => d.HasPassword,
                opt => opt.MapFrom(s => !string.IsNullOrEmpty(s.Password))
            )
            .ForMember(d => d.PrefillData, opt => opt.Ignore());

        // LinkClick mappings
        CreateMap<LinkClick, LinkClickDto>()
            .ForMember(d => d.HasResponse, opt => opt.MapFrom(s => s.ResponseId.HasValue));
    }

    private static List<SelectedOptionDto>? MapAnswerOptions(string? answerValue)
    {
        if (string.IsNullOrEmpty(answerValue))
            return null;
        var answer = AnswerValue.FromJson(answerValue);
        if (answer.Options.Count == 0)
            return null;
        return [.. answer.Options.Select(o => new SelectedOptionDto { Id = o.Id, Text = o.Text })];
    }

    private static string? MapAnswerText(string? answerValue)
    {
        if (string.IsNullOrEmpty(answerValue))
            return null;
        var answer = AnswerValue.FromJson(answerValue);
        return answer.Text;
    }

    private static string MapAnswerDisplayValue(string? answerValue)
    {
        if (string.IsNullOrEmpty(answerValue))
            return string.Empty;
        var answer = AnswerValue.FromJson(answerValue);
        return answer.GetDisplayText();
    }

    private static List<string>? MapAnswerFileUrls(string? answerValue, Question? question)
    {
        if (string.IsNullOrEmpty(answerValue) || question?.Type != QuestionType.FileUpload)
            return null;

        var answer = AnswerValue.FromJson(answerValue);
        if (string.IsNullOrEmpty(answer.Text))
            return null;

        try
        {
            // FileUpload stores URLs as JSON array in Text field
            return System.Text.Json.JsonSerializer.Deserialize<List<string>>(answer.Text);
        }
        catch (System.Text.Json.JsonException)
        {
            // If not valid JSON array, treat as single URL
            return [answer.Text];
        }
    }

    private static Dictionary<string, string>? MapAnswerMatrixAnswers(
        string? answerValue,
        Question? question
    )
    {
        if (string.IsNullOrEmpty(answerValue) || question?.Type != QuestionType.Matrix)
            return null;

        var answer = AnswerValue.FromJson(answerValue);
        if (string.IsNullOrEmpty(answer.Text))
            return null;

        try
        {
            // Matrix stores row->column mapping as JSON object in Text field
            return System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(
                answer.Text
            );
        }
        catch (System.Text.Json.JsonException)
        {
            return null;
        }
    }
}
