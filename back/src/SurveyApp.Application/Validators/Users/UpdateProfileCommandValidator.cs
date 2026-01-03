using System.Text.RegularExpressions;
using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Users.Commands.UpdateProfile;

namespace SurveyApp.Application.Validators.Users;

public partial class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    /// <summary>
    /// Total number of available avatars in the collection.
    /// </summary>
    private const int TotalAvatars = 77;

    /// <summary>
    /// Regex pattern for valid avatar IDs (avatar-1 through avatar-77).
    /// Matches 1-2 digit numbers.
    /// </summary>
    [GeneratedRegex(@"^avatar-(\d{1,2})$", RegexOptions.Compiled)]
    private static partial Regex AvatarIdPattern();

    public UpdateProfileCommandValidator(IStringLocalizer<UpdateProfileCommandValidator> localizer)
    {
        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage(localizer["Validation.FirstName.Required"])
            .MaximumLength(50)
            .WithMessage(localizer["Validation.FirstName.MaxLength"]);

        RuleFor(x => x.LastName)
            .NotEmpty()
            .WithMessage(localizer["Validation.LastName.Required"])
            .MaximumLength(50)
            .WithMessage(localizer["Validation.LastName.MaxLength"]);

        RuleFor(x => x.AvatarId)
            .Must(BeAValidAvatarId)
            .WithMessage(localizer["Validation.AvatarId.Invalid"])
            .When(x => !string.IsNullOrEmpty(x.AvatarId));
    }

    private static bool BeAValidAvatarId(string? avatarId)
    {
        if (string.IsNullOrEmpty(avatarId))
            return true;

        var match = AvatarIdPattern().Match(avatarId);
        if (!match.Success)
            return false;

        var avatarNumber = int.Parse(match.Groups[1].Value);
        return avatarNumber >= 1 && avatarNumber <= TotalAvatars;
    }
}
