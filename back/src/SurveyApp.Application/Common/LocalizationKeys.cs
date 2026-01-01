namespace SurveyApp.Application.Common;

/// <summary>
/// Contains localization keys for validation messages.
/// These keys are used with string.Format to create parameterized messages.
/// </summary>
public static class LocalizationKeys
{
    public static class Validation
    {
        public static class Common
        {
            /// <summary>
            /// Key: "Validation.Common.Required"
            /// Format: "{0} is required."
            /// </summary>
            public const string Required = "Validation.Common.Required";

            /// <summary>
            /// Key: "Validation.Common.MinLength"
            /// Format: "{0} must be at least {1} characters."
            /// </summary>
            public const string MinLength = "Validation.Name.MinLengthGeneric";

            /// <summary>
            /// Key: "Validation.Common.MaxLength"
            /// Format: "{0} cannot exceed {1} characters."
            /// </summary>
            public const string MaxLength = "Validation.Name.MaxLengthGeneric";

            /// <summary>
            /// Key: "Validation.Common.GreaterThanZero"
            /// Format: "{0} must be greater than 0."
            /// </summary>
            public const string GreaterThanZero = "Validation.Common.GreaterThanZero";

            /// <summary>
            /// Key: "Validation.Common.NonNegative"
            /// Format: "{0} must be non-negative."
            /// </summary>
            public const string NonNegative = "Validation.Common.NonNegative";

            /// <summary>
            /// Key: "Validation.Common.Range"
            /// Format: "{0} must be between {1} and {2}."
            /// </summary>
            public const string Range = "Validation.Common.Range";

            /// <summary>
            /// Key: "Validation.Common.FutureDate"
            /// Format: "{0} must be in the future."
            /// </summary>
            public const string FutureDate = "Validation.Common.FutureDate";

            /// <summary>
            /// Key: "Validation.Common.DateRangeInvalid"
            /// Format: "{0} must be before {1}."
            /// </summary>
            public const string DateRangeInvalid = "Validation.Common.DateRangeInvalid";

            /// <summary>
            /// Key: "Validation.Common.IdRequired"
            /// Format: "{0} ID is required."
            /// </summary>
            public const string IdRequired = "Validation.Common.IdRequired";

            /// <summary>
            /// Key: "Validation.Common.IdNotEmpty"
            /// Format: "{0} cannot be empty."
            /// </summary>
            public const string IdNotEmpty = "Validation.Common.IdNotEmpty";

            /// <summary>
            /// Key: "Validation.Common.NotEmptyCollection"
            /// Format: "{0} must contain at least one item."
            /// </summary>
            public const string NotEmptyCollection = "Validation.Common.NotEmptyCollection";

            /// <summary>
            /// Key: "Validation.Common.MaxCollectionCount"
            /// Format: "{0} cannot contain more than {1} items."
            /// </summary>
            public const string MaxCollectionCount = "Validation.Common.MaxCollectionCount";
        }

        public static class Url
        {
            /// <summary>
            /// Key: "Validation.Url.MustBeValid"
            /// Format: "{0} must be a valid HTTP or HTTPS URL."
            /// </summary>
            public const string MustBeValid = "Validation.Url.MustBeValid";

            /// <summary>
            /// Key: "Validation.Url.MaxLength"
            /// Format: "{0} cannot exceed 2000 characters."
            /// </summary>
            public const string MaxLength = "Validation.Url.MaxLength";

            /// <summary>
            /// Key: "Validation.Url.Required"
            /// Format: "{0} is required."
            /// </summary>
            public const string Required = "Validation.Url.Required";
        }

        public static class Email
        {
            /// <summary>
            /// Key: "Validation.Email.MustBeValid"
            /// Format: "{0} must be a valid email address."
            /// </summary>
            public const string MustBeValid = "Validation.Email.MustBeValid";
        }

        public static class Color
        {
            /// <summary>
            /// Key: "Validation.Color.MustBeValid"
            /// Format: "{0} must be a valid hex color code (e.g., #RRGGBB or #RRGGBBAA)."
            /// </summary>
            public const string InvalidHexFormat = "Validation.Color.MustBeValid";
        }

        public static class Pagination
        {
            /// <summary>
            /// Key: "Validation.Pagination.PageNumberMinValue"
            /// Format: "Page number must be at least {0}."
            /// </summary>
            public const string PageNumberMinValue = "Validation.Pagination.PageNumberMinValue";

            /// <summary>
            /// Key: "Validation.Pagination.PageSizeRange"
            /// Format: "Page size must be between {0} and {1}."
            /// </summary>
            public const string PageSizeRange = "Validation.Pagination.PageSizeRange";
        }
    }
}
