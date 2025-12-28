using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a survey theme with branding and styling options.
/// </summary>
public class SurveyTheme : AggregateRoot<Guid>
{
    /// <summary>
    /// Gets the namespace ID this theme belongs to.
    /// </summary>
    public Guid NamespaceId { get; private set; }

    /// <summary>
    /// Gets the name of the theme.
    /// </summary>
    public string Name { get; private set; } = null!;

    /// <summary>
    /// Gets the description of the theme.
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Gets whether this is the default theme for the namespace.
    /// </summary>
    public bool IsDefault { get; private set; }

    /// <summary>
    /// Gets whether this theme is available to all namespace members.
    /// </summary>
    public bool IsPublic { get; private set; }

    /// <summary>
    /// Gets whether this is a system-provided theme (cannot be edited or deleted).
    /// </summary>
    public bool IsSystem { get; private set; }

    #region Color Scheme - Material Design 3

    // Primary Colors
    /// <summary>
    /// Gets the primary color (hex format).
    /// </summary>
    public string PrimaryColor { get; private set; } = "#6750A4";

    /// <summary>
    /// Gets the color to use on primary color (hex format).
    /// </summary>
    public string OnPrimaryColor { get; private set; } = "#FFFFFF";

    /// <summary>
    /// Gets the primary container color (hex format).
    /// </summary>
    public string PrimaryContainerColor { get; private set; } = "#EADDFF";

    /// <summary>
    /// Gets the color to use on primary container (hex format).
    /// </summary>
    public string OnPrimaryContainerColor { get; private set; } = "#21005D";

    // Secondary Colors
    /// <summary>
    /// Gets the secondary color (hex format).
    /// </summary>
    public string SecondaryColor { get; private set; } = "#625B71";

    /// <summary>
    /// Gets the color to use on secondary color (hex format).
    /// </summary>
    public string OnSecondaryColor { get; private set; } = "#FFFFFF";

    /// <summary>
    /// Gets the secondary container color (hex format).
    /// </summary>
    public string SecondaryContainerColor { get; private set; } = "#E8DEF8";

    /// <summary>
    /// Gets the color to use on secondary container (hex format).
    /// </summary>
    public string OnSecondaryContainerColor { get; private set; } = "#1D192B";

    // Surface Colors
    /// <summary>
    /// Gets the surface color (hex format).
    /// </summary>
    public string SurfaceColor { get; private set; } = "#FEF7FF";

    /// <summary>
    /// Gets the surface container lowest color (hex format).
    /// </summary>
    public string SurfaceContainerLowestColor { get; private set; } = "#FFFFFF";

    /// <summary>
    /// Gets the surface container low color (hex format).
    /// </summary>
    public string SurfaceContainerLowColor { get; private set; } = "#F7F2FA";

    /// <summary>
    /// Gets the surface container color (hex format).
    /// </summary>
    public string SurfaceContainerColor { get; private set; } = "#F3EDF7";

    /// <summary>
    /// Gets the surface container high color (hex format).
    /// </summary>
    public string SurfaceContainerHighColor { get; private set; } = "#ECE6F0";

    /// <summary>
    /// Gets the surface container highest color (hex format).
    /// </summary>
    public string SurfaceContainerHighestColor { get; private set; } = "#E6E0E9";

    /// <summary>
    /// Gets the color to use on surface (hex format).
    /// </summary>
    public string OnSurfaceColor { get; private set; } = "#1D1B20";

    /// <summary>
    /// Gets the color to use on surface variant (hex format).
    /// </summary>
    public string OnSurfaceVariantColor { get; private set; } = "#49454F";

    // Outline Colors
    /// <summary>
    /// Gets the outline color (hex format).
    /// </summary>
    public string OutlineColor { get; private set; } = "#79747E";

    /// <summary>
    /// Gets the outline variant color (hex format).
    /// </summary>
    public string OutlineVariantColor { get; private set; } = "#CAC4D0";

    // Legacy/Deprecated - kept for backward compatibility
    /// <summary>
    /// Gets the background color (hex format). Use SurfaceColor for new themes.
    /// </summary>
    public string BackgroundColor { get; private set; } = "#FEF7FF";

    /// <summary>
    /// Gets the text color (hex format). Use OnSurfaceColor for new themes.
    /// </summary>
    public string TextColor { get; private set; } = "#1D1B20";

    /// <summary>
    /// Gets the accent color (hex format).
    /// </summary>
    public string AccentColor { get; private set; } = "#7D5260";

    // Semantic Colors
    /// <summary>
    /// Gets the error color (hex format).
    /// </summary>
    public string ErrorColor { get; private set; } = "#B3261E";

    /// <summary>
    /// Gets the success color (hex format).
    /// </summary>
    public string SuccessColor { get; private set; } = "#2AA86A";

    #endregion

    #region Typography

    /// <summary>
    /// Gets the font family for body text.
    /// </summary>
    public string FontFamily { get; private set; } = "Inter";

    /// <summary>
    /// Gets the font family for headings.
    /// </summary>
    public string HeadingFontFamily { get; private set; } = "Inter";

    /// <summary>
    /// Gets the base font size in pixels.
    /// </summary>
    public int BaseFontSize { get; private set; } = 16;

    #endregion

    #region Layout

    /// <summary>
    /// Gets the layout style.
    /// </summary>
    public ThemeLayout Layout { get; private set; } = ThemeLayout.Classic;

    /// <summary>
    /// Gets the background image URL.
    /// </summary>
    public string? BackgroundImageUrl { get; private set; }

    /// <summary>
    /// Gets the background image position.
    /// </summary>
    public BackgroundImagePosition BackgroundPosition { get; private set; } =
        BackgroundImagePosition.Cover;

    /// <summary>
    /// Gets whether to show the progress bar.
    /// </summary>
    public bool ShowProgressBar { get; private set; } = true;

    /// <summary>
    /// Gets the progress bar style.
    /// </summary>
    public ProgressBarStyle ProgressBarStyle { get; private set; } = ProgressBarStyle.Bar;

    #endregion

    #region Branding

    /// <summary>
    /// Gets the logo URL.
    /// </summary>
    public string? LogoUrl { get; private set; }

    /// <summary>
    /// Gets the logo position.
    /// </summary>
    public LogoPosition LogoPosition { get; private set; } = LogoPosition.TopLeft;

    /// <summary>
    /// Gets the logo size.
    /// </summary>
    public LogoSize LogoSize { get; private set; } = LogoSize.Medium;

    /// <summary>
    /// Gets whether to show a background container behind the logo.
    /// </summary>
    public bool ShowLogoBackground { get; private set; } = true;

    /// <summary>
    /// Gets the logo background color (hex format). Only used when ShowLogoBackground is true.
    /// </summary>
    public string? LogoBackgroundColor { get; private set; }

    /// <summary>
    /// Gets the branding title text shown alongside the logo.
    /// </summary>
    public string? BrandingTitle { get; private set; }

    /// <summary>
    /// Gets the branding subtitle text shown below the title.
    /// </summary>
    public string? BrandingSubtitle { get; private set; }

    /// <summary>
    /// Gets whether to show "Powered by SurveyApp" branding.
    /// </summary>
    public bool ShowPoweredBy { get; private set; } = true;

    #endregion

    #region Button Styling

    /// <summary>
    /// Gets the button style.
    /// </summary>
    public ButtonStyle ButtonStyle { get; private set; } = ButtonStyle.Rounded;

    /// <summary>
    /// Gets the button text color (hex format).
    /// </summary>
    public string ButtonTextColor { get; private set; } = "#FFFFFF";

    #endregion

    /// <summary>
    /// Gets the custom CSS (Enterprise feature).
    /// </summary>
    public string? CustomCss { get; private set; }

    /// <summary>
    /// Gets the usage count of this theme.
    /// </summary>
    public int UsageCount { get; private set; }

    /// <summary>
    /// Gets whether this theme uses a dark color scheme.
    /// Computed based on the background color luminance.
    /// </summary>
    public bool IsDark
    {
        get
        {
            if (string.IsNullOrEmpty(BackgroundColor) || !BackgroundColor.StartsWith('#'))
                return false;

            var hex = BackgroundColor.Replace("#", "");
            if (hex.Length != 6)
                return false;

            var r = Convert.ToInt32(hex.Substring(0, 2), 16);
            var g = Convert.ToInt32(hex.Substring(2, 2), 16);
            var b = Convert.ToInt32(hex.Substring(4, 2), 16);

            // Calculate relative luminance
            var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance < 0.5;
        }
    }

    /// <summary>
    /// Navigation property to the namespace.
    /// </summary>
    public Namespace Namespace { get; private set; } = null!;

    private SurveyTheme() { }

    private SurveyTheme(Guid id, Guid namespaceId, string name)
        : base(id)
    {
        NamespaceId = namespaceId;
        Name = name;
        IsDefault = false;
        IsPublic = true;
    }

    /// <summary>
    /// Creates a new survey theme.
    /// </summary>
    public static SurveyTheme Create(Guid namespaceId, string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Theme name cannot be empty.", nameof(name));

        return new SurveyTheme(Guid.NewGuid(), namespaceId, name);
    }

    /// <summary>
    /// Updates the theme name.
    /// </summary>
    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Theme name cannot be empty.", nameof(name));

        Name = name;
    }

    /// <summary>
    /// Updates the theme description.
    /// </summary>
    public void UpdateDescription(string? description)
    {
        Description = description;
    }

    /// <summary>
    /// Sets whether this theme is the default.
    /// </summary>
    public void SetAsDefault(bool isDefault)
    {
        IsDefault = isDefault;
    }

    /// <summary>
    /// Sets whether this theme is public.
    /// </summary>
    public void SetPublic(bool isPublic)
    {
        IsPublic = isPublic;
    }

    /// <summary>
    /// Sets whether this is a system-provided theme.
    /// </summary>
    public void SetAsSystem(bool isSystem)
    {
        IsSystem = isSystem;
    }

    /// <summary>
    /// Updates the color scheme with Material Design 3 colors.
    /// </summary>
    public void UpdateColors(
        // Primary
        string primaryColor,
        string onPrimaryColor,
        string primaryContainerColor,
        string onPrimaryContainerColor,
        // Secondary
        string secondaryColor,
        string onSecondaryColor,
        string secondaryContainerColor,
        string onSecondaryContainerColor,
        // Surface
        string surfaceColor,
        string surfaceContainerLowestColor,
        string surfaceContainerLowColor,
        string surfaceContainerColor,
        string surfaceContainerHighColor,
        string surfaceContainerHighestColor,
        string onSurfaceColor,
        string onSurfaceVariantColor,
        // Outline
        string outlineColor,
        string outlineVariantColor,
        // Semantic
        string errorColor,
        string successColor,
        // Legacy
        string? accentColor = null
    )
    {
        // Primary
        PrimaryColor = ValidateHexColor(primaryColor, nameof(primaryColor));
        OnPrimaryColor = ValidateHexColor(onPrimaryColor, nameof(onPrimaryColor));
        PrimaryContainerColor = ValidateHexColor(
            primaryContainerColor,
            nameof(primaryContainerColor)
        );
        OnPrimaryContainerColor = ValidateHexColor(
            onPrimaryContainerColor,
            nameof(onPrimaryContainerColor)
        );

        // Secondary
        SecondaryColor = ValidateHexColor(secondaryColor, nameof(secondaryColor));
        OnSecondaryColor = ValidateHexColor(onSecondaryColor, nameof(onSecondaryColor));
        SecondaryContainerColor = ValidateHexColor(
            secondaryContainerColor,
            nameof(secondaryContainerColor)
        );
        OnSecondaryContainerColor = ValidateHexColor(
            onSecondaryContainerColor,
            nameof(onSecondaryContainerColor)
        );

        // Surface
        SurfaceColor = ValidateHexColor(surfaceColor, nameof(surfaceColor));
        SurfaceContainerLowestColor = ValidateHexColor(
            surfaceContainerLowestColor,
            nameof(surfaceContainerLowestColor)
        );
        SurfaceContainerLowColor = ValidateHexColor(
            surfaceContainerLowColor,
            nameof(surfaceContainerLowColor)
        );
        SurfaceContainerColor = ValidateHexColor(
            surfaceContainerColor,
            nameof(surfaceContainerColor)
        );
        SurfaceContainerHighColor = ValidateHexColor(
            surfaceContainerHighColor,
            nameof(surfaceContainerHighColor)
        );
        SurfaceContainerHighestColor = ValidateHexColor(
            surfaceContainerHighestColor,
            nameof(surfaceContainerHighestColor)
        );
        OnSurfaceColor = ValidateHexColor(onSurfaceColor, nameof(onSurfaceColor));
        OnSurfaceVariantColor = ValidateHexColor(
            onSurfaceVariantColor,
            nameof(onSurfaceVariantColor)
        );

        // Outline
        OutlineColor = ValidateHexColor(outlineColor, nameof(outlineColor));
        OutlineVariantColor = ValidateHexColor(outlineVariantColor, nameof(outlineVariantColor));

        // Semantic
        ErrorColor = ValidateHexColor(errorColor, nameof(errorColor));
        SuccessColor = ValidateHexColor(successColor, nameof(successColor));

        // Legacy - set for backward compatibility
        BackgroundColor = surfaceColor;
        TextColor = onSurfaceColor;
        AccentColor = accentColor ?? primaryColor;
    }

    /// <summary>
    /// Updates the typography settings.
    /// </summary>
    public void UpdateTypography(string fontFamily, string headingFontFamily, int baseFontSize)
    {
        if (string.IsNullOrWhiteSpace(fontFamily))
            throw new ArgumentException("Font family cannot be empty.", nameof(fontFamily));

        if (baseFontSize < 10 || baseFontSize > 32)
            throw new ArgumentException(
                "Base font size must be between 10 and 32.",
                nameof(baseFontSize)
            );

        FontFamily = fontFamily;
        HeadingFontFamily = string.IsNullOrWhiteSpace(headingFontFamily)
            ? fontFamily
            : headingFontFamily;
        BaseFontSize = baseFontSize;
    }

    /// <summary>
    /// Updates the layout settings.
    /// </summary>
    public void UpdateLayout(
        ThemeLayout layout,
        string? backgroundImageUrl,
        BackgroundImagePosition backgroundPosition,
        bool showProgressBar,
        ProgressBarStyle progressBarStyle
    )
    {
        Layout = layout;
        BackgroundImageUrl = backgroundImageUrl;
        BackgroundPosition = backgroundPosition;
        ShowProgressBar = showProgressBar;
        ProgressBarStyle = progressBarStyle;
    }

    /// <summary>
    /// Updates the branding settings.
    /// </summary>
    public void UpdateBranding(
        string? logoUrl,
        LogoPosition logoPosition,
        LogoSize logoSize,
        bool showLogoBackground,
        string? logoBackgroundColor,
        string? brandingTitle,
        string? brandingSubtitle,
        bool showPoweredBy
    )
    {
        LogoUrl = logoUrl;
        LogoPosition = logoPosition;
        LogoSize = logoSize;
        ShowLogoBackground = showLogoBackground;
        LogoBackgroundColor = logoBackgroundColor;
        BrandingTitle = brandingTitle;
        BrandingSubtitle = brandingSubtitle;
        ShowPoweredBy = showPoweredBy;
    }

    /// <summary>
    /// Updates the button styling.
    /// </summary>
    public void UpdateButtonStyle(ButtonStyle buttonStyle, string buttonTextColor)
    {
        ButtonStyle = buttonStyle;
        ButtonTextColor = ValidateHexColor(buttonTextColor, nameof(buttonTextColor));
    }

    /// <summary>
    /// Updates the custom CSS.
    /// </summary>
    public void UpdateCustomCss(string? customCss)
    {
        CustomCss = customCss;
    }

    /// <summary>
    /// Increments the usage count.
    /// </summary>
    public void IncrementUsageCount()
    {
        UsageCount++;
    }

    /// <summary>
    /// Decrements the usage count.
    /// </summary>
    public void DecrementUsageCount()
    {
        if (UsageCount > 0)
            UsageCount--;
    }

    /// <summary>
    /// Creates a duplicate of this theme.
    /// </summary>
    public SurveyTheme Duplicate(string newName)
    {
        var duplicate = Create(NamespaceId, newName);
        duplicate.Description = Description;
        duplicate.IsPublic = IsPublic;
        duplicate.PrimaryColor = PrimaryColor;
        duplicate.SecondaryColor = SecondaryColor;
        duplicate.BackgroundColor = BackgroundColor;
        duplicate.TextColor = TextColor;
        duplicate.AccentColor = AccentColor;
        duplicate.ErrorColor = ErrorColor;
        duplicate.SuccessColor = SuccessColor;
        duplicate.FontFamily = FontFamily;
        duplicate.HeadingFontFamily = HeadingFontFamily;
        duplicate.BaseFontSize = BaseFontSize;
        duplicate.Layout = Layout;
        duplicate.BackgroundImageUrl = BackgroundImageUrl;
        duplicate.BackgroundPosition = BackgroundPosition;
        duplicate.ShowProgressBar = ShowProgressBar;
        duplicate.ProgressBarStyle = ProgressBarStyle;
        duplicate.LogoUrl = LogoUrl;
        duplicate.LogoPosition = LogoPosition;
        duplicate.LogoSize = LogoSize;
        duplicate.ShowLogoBackground = ShowLogoBackground;
        duplicate.LogoBackgroundColor = LogoBackgroundColor;
        duplicate.BrandingTitle = BrandingTitle;
        duplicate.BrandingSubtitle = BrandingSubtitle;
        duplicate.ShowPoweredBy = ShowPoweredBy;
        duplicate.ButtonStyle = ButtonStyle;
        duplicate.ButtonTextColor = ButtonTextColor;
        duplicate.CustomCss = CustomCss;
        return duplicate;
    }

    /// <summary>
    /// Generates CSS from the theme settings.
    /// </summary>
    public string GenerateCss()
    {
        var css =
            $@"
:root {{
    --primary-color: {PrimaryColor};
    --secondary-color: {SecondaryColor};
    --background-color: {BackgroundColor};
    --text-color: {TextColor};
    --accent-color: {AccentColor};
    --error-color: {ErrorColor};
    --success-color: {SuccessColor};
    --font-family: '{FontFamily}', sans-serif;
    --heading-font-family: '{HeadingFontFamily}', sans-serif;
    --base-font-size: {BaseFontSize}px;
    --button-text-color: {ButtonTextColor};
    --button-border-radius: {GetButtonBorderRadius()};
}}

body {{
    font-family: var(--font-family);
    font-size: var(--base-font-size);
    color: var(--text-color);
    background-color: var(--background-color);
    {GetBackgroundImageCss()}
}}

h1, h2, h3, h4, h5, h6 {{
    font-family: var(--heading-font-family);
}}

.btn-primary {{
    background-color: var(--primary-color);
    color: var(--button-text-color);
    border-radius: var(--button-border-radius);
}}

.btn-secondary {{
    background-color: var(--secondary-color);
    color: var(--button-text-color);
    border-radius: var(--button-border-radius);
}}

.error {{
    color: var(--error-color);
}}

.success {{
    color: var(--success-color);
}}
";

        if (!string.IsNullOrWhiteSpace(CustomCss))
        {
            css += $"\n/* Custom CSS */\n{CustomCss}";
        }

        return css;
    }

    private string GetButtonBorderRadius()
    {
        return ButtonStyle switch
        {
            ButtonStyle.Square => "0",
            ButtonStyle.Pill => "9999px",
            _ => "8px",
        };
    }

    private string GetBackgroundImageCss()
    {
        if (string.IsNullOrWhiteSpace(BackgroundImageUrl))
            return string.Empty;

        var position = BackgroundPosition switch
        {
            BackgroundImagePosition.Cover => "background-size: cover; background-position: center;",
            BackgroundImagePosition.Contain =>
                "background-size: contain; background-repeat: no-repeat; background-position: center;",
            BackgroundImagePosition.Tile => "background-repeat: repeat;",
            BackgroundImagePosition.Center =>
                "background-position: center; background-repeat: no-repeat;",
            BackgroundImagePosition.TopLeft =>
                "background-position: top left; background-repeat: no-repeat;",
            BackgroundImagePosition.TopRight =>
                "background-position: top right; background-repeat: no-repeat;",
            _ => "background-size: cover;",
        };

        return $"background-image: url('{BackgroundImageUrl}'); {position}";
    }

    private static string ValidateHexColor(string color, string paramName)
    {
        if (string.IsNullOrWhiteSpace(color))
            throw new ArgumentException($"{paramName} cannot be empty.", paramName);

        if (!color.StartsWith('#'))
            color = "#" + color;

        if (color.Length != 7 && color.Length != 4)
            throw new ArgumentException($"{paramName} must be a valid hex color.", paramName);

        return color.ToUpperInvariant();
    }
}
