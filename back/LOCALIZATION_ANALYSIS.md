### 🔴 HIGH PRIORITY - Domain Layer Exception Messages

| File                        | Line    | Current Text                                       | Category | Suggested Key                   | Priority |
| --------------------------- | ------- | -------------------------------------------------- | -------- | ------------------------------- | -------- |
| Question.cs                 | 237     | `"Matrix columns cannot be null."`                 | Error    | `Errors.MatrixColumnsNull`      | High     |
| Question.cs                 | 256     | `"Matrix rows cannot be empty."`                   | Error    | `Errors.MatrixRowsEmpty`        | High     |
| Question.cs                 | 259     | `"Matrix columns cannot be empty."`                | Error    | `Errors.MatrixColumnsEmpty`     | High     |
| Question.cs                 | 108     | `"Scale start value is required..."`               | Error    | `Errors.ScaleStartRequired`     | High     |
| Question.cs                 | 202     | `"Language code is required."`                     | Error    | `Errors.LanguageCodeRequired`   | High     |
| RecurringSurvey.cs          | 182     | `"Cron expression is required."`                   | Error    | `Errors.CronExpressionRequired` | High     |
| RecurringSurvey.cs          | 185     | `"Timezone ID is required."`                       | Error    | `Errors.TimezoneIdRequired`     | High     |
| RecurringSurvey.cs          | 212     | `"Cron expression is required."`                   | Error    | `Errors.CronExpressionRequired` | High     |
| RecurringSurvey.cs          | 230     | `"Timezone ID is required."`                       | Error    | `Errors.TimezoneIdRequired`     | High     |
| RecurringSurvey.cs          | 311     | `"Max reminders must be at least 1."`              | Error    | `Errors.MaxRemindersMinimum`    | High     |
| RecurringSurvey.cs          | 333     | `"End date must be in the future."`                | Error    | `Errors.EndDateMustBeFuture`    | High     |
| RecurringSurvey.cs          | 336     | `"Max runs must be at least 1."`                   | Error    | `Errors.MaxRunsMinimum`         | High     |
| User.cs                     | 91      | `"New role must be higher than the current role."` | Error    | `Errors.RoleMustBeHigher`       | High     |
| User.cs                     | 114     | `"Language code is required."`                     | Error    | `Errors.LanguageCodeRequired`   | High     |
| User.cs                     | 130     | `"Password hash cannot be empty."`                 | Error    | `Errors.PasswordHashEmpty`      | High     |
| User.cs                     | 160     | `"Language code is required."`                     | Error    | `Errors.LanguageCodeRequired`   | High     |
| Namespace.cs                | 120     | `"Namespace name cannot be empty."`                | Error    | `Errors.NamespaceNameEmpty`     | High     |
| QuestionLogic.cs            | 69      | `"Language code is required."`                     | Error    | `Errors.LanguageCodeRequired`   | High     |
| QuestionLogic.cs            | 72      | `"Invalid language code format."`                  | Error    | `Errors.LanguageCodeInvalid`    | High     |
| QuestionLogic.cs            | 96      | `"Translation not found..."`                       | Error    | `Errors.TranslationNotFound`    | High     |
| SurveyLink.cs               | 121     | `"Access token cannot be empty."`                  | Error    | `Errors.AccessTokenEmpty`       | High     |
| SurveyLink.cs               | 173     | `"Max uses must be greater than 0."`               | Error    | `Errors.MaxUsesPositive`        | High     |
| Response.cs                 | 83-86   | `"Language code is required/invalid."`             | Error    | `Errors.LanguageCodeRequired`   | High     |
| Survey.cs                   | 355     | `"Theme name cannot be empty."`                    | Error    | `Errors.ThemeNameEmpty`         | High     |
| Survey.cs                   | 372     | `"Theme name cannot be empty."`                    | Error    | `Errors.ThemeNameEmpty`         | High     |
| Survey.cs                   | 530     | `"Page index out of range."`                       | Error    | `Errors.PageIndexOutOfRange`    | High     |
| Survey.cs                   | 785     | `"Language code is required."`                     | Error    | `Errors.LanguageCodeRequired`   | High     |
| SurveyTranslation.cs        | 59-80   | Language code validation messages                  | Error    | `Errors.LanguageCodeRequired`   | High     |
| Template.cs                 | 137     | `"Template name cannot be empty."`                 | Error    | `Errors.TemplateNameEmpty`      | High     |
| Template.cs                 | 174     | `"Template name cannot be empty."`                 | Error    | `Errors.TemplateNameEmpty`      | High     |
| Template.cs                 | 250-318 | Language code/template messages                    | Error    | `Errors.LanguageCode*`          | High     |
| TemplateTranslation.cs      | 75-125  | Language code validation                           | Error    | `Errors.LanguageCode*`          | High     |
| QuestionTranslation.cs      | 69-118  | Language code validation                           | Error    | `Errors.LanguageCode*`          | High     |
| EmailDistribution.cs        | 94-169  | Email/name validation                              | Error    | `Errors.EmailDistribution*`     | High     |
| EmailTemplate.cs            | 83-126  | Template validation messages                       | Error    | `Errors.EmailTemplate*`         | High     |
| EmailTemplateTranslation.cs | 124-212 | Translation validation                             | Error    | `Errors.EmailTemplate*`         | High     |

---

### 🔴 HIGH PRIORITY - API Middleware Problem Details

| File                           | Line    | Current Text                                               | Category | Suggested Key                  | Priority |
| ------------------------------ | ------- | ---------------------------------------------------------- | -------- | ------------------------------ | -------- |
| GlobalExceptionMiddleware.cs   | 49      | `"Business rule violation."`                               | Error    | `Errors.BusinessRuleViolation` | High     |
| GlobalExceptionMiddleware.cs   | 74      | `"Resource not found."`                                    | Error    | `Errors.ResourceNotFound`      | High     |
| GlobalExceptionMiddleware.cs   | 83      | `"Access denied."`                                         | Error    | `Errors.AccessDenied`          | High     |
| GlobalExceptionMiddleware.cs   | 92      | `"Namespace error."`                                       | Error    | `Errors.NamespaceError`        | High     |
| GlobalExceptionMiddleware.cs   | 109     | `"An internal server error occurred..."`                   | Error    | `Errors.InternalServerError`   | High     |
| ExceptionHandlingMiddleware.cs | 133-139 | `"Validation Error"`, `"Not Found"`, `"An error occurred"` | Error    | `Errors.*`                     | High     |
| ExceptionHandlingMiddleware.cs | 205     | `"Validation error"`                                       | Error    | `Errors.ValidationError`       | High     |

---

### 🔴 HIGH PRIORITY - Survey Link Status Messages

| File                         | Line | Current Text                                                  | Category | Suggested Key                | Priority |
| ---------------------------- | ---- | ------------------------------------------------------------- | -------- | ---------------------------- | -------- |
| ValidateSurveyLinkHandler.cs | 44   | `"This survey link has been deactivated."`                    | Status   | `SurveyLink.Deactivated`     | High     |
| ValidateSurveyLinkHandler.cs | 49   | `"This survey link has expired."`                             | Status   | `SurveyLink.Expired`         | High     |
| ValidateSurveyLinkHandler.cs | 54   | `"This survey link has reached its maximum usage limit."`     | Status   | `SurveyLink.MaxUsageReached` | High     |
| ValidateSurveyLinkHandler.cs | 59   | `"The survey associated with this link is no longer active."` | Status   | `SurveyLink.SurveyInactive`  | High     |

---

### 🔴 HIGH PRIORITY - Email Templates (User-Facing)

| File                        | Line    | Current Text                                           | Category | Suggested Key                                  | Priority |
| --------------------------- | ------- | ------------------------------------------------------ | -------- | ---------------------------------------------- | -------- |
| EmailNotificationService.cs | 45      | `"You've been invited to take a survey"`               | Email    | `Email.SurveyInvitationSubject`                | High     |
| EmailNotificationService.cs | 53      | `"Please click the button below to start the survey."` | Email    | `Email.SurveyInvitationBody`                   | High     |
| EmailNotificationService.cs | 68      | `"Reminder: Complete your survey"`                     | Email    | `Email.SurveyReminderSubject`                  | High     |
| EmailNotificationService.cs | 86-93   | Invitation email content                               | Email    | `Email.InvitationContent*`                     | High     |
| EmailNotificationService.cs | 116-119 | Invitation heading/button                              | Email    | `Email.InvitationHeader`, `Email.AcceptButton` | High     |
| EmailNotificationService.cs | 135-138 | Response notification content                          | Email    | `Email.ResponseNotification*`                  | High     |

---

### 🟡 MEDIUM PRIORITY - Export Column Headers

| File                     | Line | Current Text           | Category | Suggested Key                   | Priority |
| ------------------------ | ---- | ---------------------- | -------- | ------------------------------- | -------- |
| ResponseExportService.cs | 248  | `"Response ID"`        | Export   | `Export.Column.ResponseId`      | Medium   |
| ResponseExportService.cs | 255  | `"Respondent Email"`   | Export   | `Export.Column.RespondentEmail` | Medium   |
| ResponseExportService.cs | 262  | `"Started At"`         | Export   | `Export.Column.StartedAt`       | Medium   |
| ResponseExportService.cs | 269  | `"Submitted At"`       | Export   | `Export.Column.SubmittedAt`     | Medium   |
| ResponseExportService.cs | 276  | `"Duration (seconds)"` | Export   | `Export.Column.Duration`        | Medium   |

---

### 🟡 MEDIUM PRIORITY - Infrastructure Identity Messages

| File                | Line | Current Text                             | Category | Suggested Key               | Priority |
| ------------------- | ---- | ---------------------------------------- | -------- | --------------------------- | -------- |
| IdentityService.cs  | 33   | `"User with this email already exists."` | Error    | `Auth.EmailExists`          | High     |
| IdentityService.cs  | 116  | `"Invalid credentials."`                 | Error    | `Auth.InvalidCredentials`   | High     |
| IdentityService.cs  | 222  | `"Token is required."`                   | Error    | `Auth.TokenRequired`        | High     |
| IdentityService.cs  | 228  | `"Invalid token."`                       | Error    | `Auth.InvalidToken`         | High     |
| IdentityService.cs  | 311  | `"User not found."`                      | Error    | `Auth.UserNotFound`         | High     |
| NamespaceService.cs | 84   | `"User not found."`                      | Error    | `Errors.UserNotFound`       | High     |
| NamespaceService.cs | 119  | `"User not found in namespace."`         | Error    | `Errors.UserNotInNamespace` | High     |

---

## Summary Statistics

| Category                  | Count   | Priority  |
| ------------------------- | ------- | --------- |
| Domain Exception Messages | ~55     | 🔴 High   |
| API Middleware Titles     | ~10     | 🔴 High   |
| Survey Link Status        | 4       | 🔴 High   |
| Email Templates           | ~15     | 🔴 High   |
| Identity/Auth Messages    | ~7      | 🔴 High   |
| Export Column Headers     | 5       | 🟡 Medium |
| **Total**                 | **~96** |           |

---

## ✅ Already Properly Localized

Good news - many parts of your codebase already use localization correctly:

- ✅ FluentValidation messages in validators use `_localizer["key"]`
- ✅ Most `Result.Failure()` calls use resource keys
- ✅ Controllers use `IStringLocalizer` for responses
- ✅ Some domain exceptions use resource keys

---

## Recommended Next Steps

1. **Start with API Middleware** - These are the most visible to all users
2. **Fix Email Templates** - Critical for user communication
3. **Address Survey Link messages** - User-facing status messages
4. **Batch update Domain exceptions** - Many are similar patterns (language code validation)
5. **Add Export column headers** - Lower priority but affects exports

Would you like me to help fix any specific category of these hardcoded strings?
