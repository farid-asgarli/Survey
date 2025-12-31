Created 5 todos

Searched for regex `throw new.*Exception\("` (`**/*.cs`), 20 results

Searched for regex `.*not found` (`**/*.cs`), 20 results

Searched for text `BadRequest\("` (`**/*.cs`), no results

Searched for text `NotFound\("` (`**/*.cs`), no results

Searched for regex `Failure\("` (`**/*.cs`), 20 results

Searched for regex `Result\.Fail|Result\.Error|\.Failure\(` (`**/*.cs`), 20 results

Searched for regex `WithMessage\("` (`**/*.cs`), no results

Searched for regex `\.Message\s*=\s*"` (`**/*.cs`), no results

Searched for regex `Failure\("` (`**/*.cs`), 100 results

Searched for regex `throw new.*Exception\("` (`**/*.cs`), 100 results

Starting: _Scan Services for hardcoded strings_ (2/5)

Searched for regex `Failure\("[^"]*"` (`**/*.cs`), 100 results

Searched for regex `\.Must|\.NotEmpty|\.NotNull|\.MaximumLength|\.MinimumLength|\.GreaterThan` (`**/Validators/*.cs`), no results

Searched for files matching `**/Validators/**/*.cs`, 20 matches

Searched for regex `Failure\("[A-Za-z]+ ` (`**/*.cs`), 74 results

Let me check the existing localization resource files and scan the validators:

Read [](file:///c%3A/Users/CyberDream/Desktop/projects/Work/survey_new/back/src/SurveyApp.API/Resources/en.json#1-1), lines 1 to 150

Read [](file:///c%3A/Users/CyberDream/Desktop/projects/Work/survey_new/back/src/SurveyApp.Application/Validators/Users/RegisterUserCommandValidator.cs)

Read [](file:///c%3A/Users/CyberDream/Desktop/projects/Work/survey_new/back/src/SurveyApp.Application/Validators/Surveys/CreateSurveyCommandValidator.cs#1-1), lines 1 to 50

Starting: _Scan Domain/Application layers_ (4/5)

Searched for regex `DomainException\("[^"]*"` (`**/*.cs`), 27 results

Searched for regex `InvalidOperationException\("[^"]*"` (`**/*.cs`), 11 results

Searched for regex `ArgumentException\("[^"]*"` (`**/*.cs`), 50 results

Searched for regex `Subject\s*=\s*"[^"]+"|Subject\s*:\s*"[^"]+"` (`**/*.cs`), no results

Read [](file:///c%3A/Users/CyberDream/Desktop/projects/Work/survey_new/back/src/SurveyApp.API/Resources/en.json#150-150), lines 150 to 350

Starting: _Compile and categorize results_ (5/5)

Based on my comprehensive scan of your codebase, I've identified hardcoded strings that need localization. The analysis shows that **many strings are already using localization keys**, but there are several that need to be converted.

## Hardcoded Strings Analysis Report

### ✅ **Already Localized (Using Keys)**

Your project already follows good localization practices in many areas:

- Domain exceptions use keys like `"Domain.Survey.SurveyTitleRequired"`
- Infrastructure identity messages use keys like `"Infrastructure.Identity.UserAlreadyExists"`
- Many handlers use keys like `"Handler.SurveyNotFound"`, `"Errors.NamespaceRequired"`

---

### 🔴 **Hardcoded Strings Requiring Localization**

| File                                      | Line | Current Text                                            | Category   | Suggested Key                          | Priority |
| ----------------------------------------- | ---- | ------------------------------------------------------- | ---------- | -------------------------------------- | -------- |
| RegisterUserCommandHandler.cs             | 29   | `"Invalid email address."`                              | Error      | `Errors.InvalidEmailAddress`           | High     |
| RegisterUserCommandHandler.cs             | 36   | `"A user with this email already exists."`              | Error      | `Errors.UserWithEmailExists`           | High     |
| GetSurveysQueryHandler.cs                 | 40   | `"User not authenticated."`                             | Error      | `Errors.UserNotAuthenticated`          | High     |
| GetSurveyByIdQueryHandler.cs              | 49   | `"User not authenticated."`                             | Error      | `Errors.UserNotAuthenticated`          | High     |
| GetSurveyAnalyticsQueryHandler.cs         | 49   | `"User not authenticated."`                             | Error      | `Errors.UserNotAuthenticated`          | High     |
| UpdateSurveyCommandHandler.cs             | 44   | `"Only draft surveys can be edited."`                   | Error      | `Errors.OnlyDraftSurveysEditable`      | High     |
| PublishSurveyCommandHandler.cs            | 46   | `"Cannot publish a survey without questions."`          | Error      | `Errors.SurveyRequiresQuestions`       | High     |
| DuplicateSurveyCommandHandler.cs          | 40   | `"User not authenticated."`                             | Error      | `Errors.UserNotAuthenticated`          | High     |
| DuplicateSurveyCommandHandler.cs          | 46   | `"Namespace context required."`                         | Error      | `Errors.NamespaceRequired`             | High     |
| DuplicateSurveyCommandHandler.cs          | 59   | `"Survey does not belong to the current namespace."`    | Error      | `Errors.SurveyNotInNamespace`          | High     |
| DuplicateSurveyCommandHandler.cs          | 70   | `"You do not have permission to create surveys."`       | Error      | `Errors.NoPermissionCreateSurveys`     | High     |
| CreateTemplateCommandHandler.cs           | 45   | `"A template with this name already exists."`           | Error      | `Errors.TemplateNameExists`            | High     |
| UpdateTemplateCommandHandler.cs           | 57   | `"A template with this name already exists."`           | Error      | `Errors.TemplateNameExists`            | High     |
| CreateTemplateFromSurveyCommandHandler.cs | 56   | `"A template with this name already exists."`           | Error      | `Errors.TemplateNameExists`            | High     |
| CreateSurveyFromTemplateCommandHandler.cs | 59   | `"Template not found."`                                 | Error      | `Errors.TemplateNotFound`              | High     |
| GetTemplateByIdQueryHandler.cs            | 38   | `"Template not found."`                                 | Error      | `Errors.TemplateNotFound`              | High     |
| ApplyThemeToSurveyCommandHandler.cs       | 46   | `"Survey not found in this namespace."`                 | Error      | `Errors.SurveyNotInNamespace`          | High     |
| GetSurveyLinksQueryHandler.cs             | 43   | `"User not authenticated."`                             | Error      | `Errors.UserNotAuthenticated`          | High     |
| GetSurveyLinksQueryHandler.cs             | 55   | `"Survey does not belong to this namespace."`           | Error      | `Errors.SurveyNotInNamespace`          | High     |
| GetSurveyLinkByIdQueryHandler.cs          | 44   | `"User not authenticated."`                             | Error      | `Errors.UserNotAuthenticated`          | High     |
| GetSurveyLinkByIdQueryHandler.cs          | 65   | `"Survey link not found."`                              | Error      | `Errors.SurveyLinkNotFound`            | High     |
| GetLinkByTokenQueryHandler.cs             | 27   | `"Invalid survey link."`                                | Error      | `Errors.InvalidSurveyLink`             | High     |
| GetLinkAnalyticsQueryHandler.cs           | 38   | `"User not authenticated."`                             | Error      | `Errors.UserNotAuthenticated`          | High     |
| GetLinkAnalyticsQueryHandler.cs           | 50   | `"Survey does not belong to this namespace."`           | Error      | `Errors.SurveyNotInNamespace`          | High     |
| GetLinkAnalyticsQueryHandler.cs           | 60   | `"Survey link not found."`                              | Error      | `Errors.SurveyLinkNotFound`            | High     |
| GetLinkAnalyticsQueryHandler.cs           | 65   | `"Survey link does not belong to this survey."`         | Error      | `Errors.SurveyLinkNotBelongToSurvey`   | High     |
| UpdateSurveyLinkCommandHandler.cs         | 46   | `"User not authenticated."`                             | Error      | `Errors.UserNotAuthenticated`          | High     |
| UpdateSurveyLinkCommandHandler.cs         | 58   | `"Survey does not belong to this namespace."`           | Error      | `Errors.SurveyNotInNamespace`          | High     |
| UpdateSurveyLinkCommandHandler.cs         | 65   | `"Survey link not found."`                              | Error      | `Errors.SurveyLinkNotFound`            | High     |
| UpdateSurveyLinkCommandHandler.cs         | 70   | `"Survey link does not belong to this survey."`         | Error      | `Errors.SurveyLinkNotBelongToSurvey`   | High     |
| RecordLinkClickCommandHandler.cs          | 31   | `"Invalid survey link."`                                | Error      | `Errors.InvalidSurveyLink`             | High     |
| RecordLinkClickCommandHandler.cs          | 43   | `"This survey link has expired."`                       | Error      | `Errors.SurveyLinkExpired`             | High     |
| RecordLinkClickCommandHandler.cs          | 54   | `"Invalid password for this survey link."`              | Error      | `Errors.InvalidSurveyLinkPassword`     | High     |
| GenerateBulkLinksCommandHandler.cs        | 49   | `"User not authenticated."`                             | Error      | `Errors.UserNotAuthenticated`          | High     |
| GenerateBulkLinksCommandHandler.cs        | 54   | `"Count must be greater than 0."`                       | Validation | `Validation.CountGreaterThanZero`      | Medium   |
| DeactivateSurveyLinkCommandHandler.cs     | 39   | `"User not authenticated."`                             | Error      | `Errors.UserNotAuthenticated`          | High     |
| DeactivateSurveyLinkCommandHandler.cs     | 51   | `"Survey does not belong to this namespace."`           | Error      | `Errors.SurveyNotInNamespace`          | High     |
| DeactivateSurveyLinkCommandHandler.cs     | 58   | `"Survey link not found."`                              | Error      | `Errors.SurveyLinkNotFound`            | High     |
| DeactivateSurveyLinkCommandHandler.cs     | 63   | `"Survey link does not belong to this survey."`         | Error      | `Errors.SurveyLinkNotBelongToSurvey`   | High     |
| CreateSurveyLinkCommandHandler.cs         | 47   | `"User not authenticated."`                             | Error      | `Errors.UserNotAuthenticated`          | High     |
| CreateSurveyLinkCommandHandler.cs         | 59   | `"Survey does not belong to this namespace."`           | Error      | `Errors.SurveyNotInNamespace`          | High     |
| GetResponseByIdQueryHandler.cs            | 44   | `"Response not found."`                                 | Error      | `Errors.ResponseNotFound`              | High     |
| GetResponseByIdQueryHandler.cs            | 51   | `"Response not found."`                                 | Error      | `Errors.ResponseNotFound`              | High     |
| GetResponseByIdQueryHandler.cs            | 58   | `"User not authenticated."`                             | Error      | `Errors.UserNotAuthenticated`          | High     |
| GetResponsesQueryHandler.cs               | 51   | `"User not authenticated."`                             | Error      | `Errors.UserNotAuthenticated`          | High     |
| GetExportPreviewQuery.cs                  | 43   | `"Survey not found."`                                   | Error      | `Errors.SurveyNotFound`                | High     |
| ExportResponsesCommand.cs                 | 73   | `"Survey not found."`                                   | Error      | `Errors.SurveyNotFound`                | High     |
| DeleteResponseCommandHandler.cs           | 38   | `"Response not found."`                                 | Error      | `Errors.ResponseNotFound`              | High     |
| DeleteResponseCommandHandler.cs           | 45   | `"Response not found."`                                 | Error      | `Errors.ResponseNotFound`              | High     |
| UpdateRecurringSurveyCommandHandler.cs    | 44   | `"Recurring survey not found."`                         | Error      | `Errors.RecurringSurveyNotFound`       | High     |
| TriggerRecurringSurveyCommandHandler.cs   | 43   | `"Recurring survey not found."`                         | Error      | `Errors.RecurringSurveyNotFound`       | High     |
| ResumeRecurringSurveyCommandHandler.cs    | 44   | `"Recurring survey not found."`                         | Error      | `Errors.RecurringSurveyNotFound`       | High     |
| PauseRecurringSurveyCommandHandler.cs     | 44   | `"Recurring survey not found."`                         | Error      | `Errors.RecurringSurveyNotFound`       | High     |
| DeleteRecurringSurveyCommandHandler.cs    | 38   | `"Recurring survey not found."`                         | Error      | `Errors.RecurringSurveyNotFound`       | High     |
| DeleteRecurringSurveyCommandHandler.cs    | 43   | `"Recurring survey does not belong to this namespace."` | Error      | `Errors.RecurringSurveyNotInNamespace` | High     |
| CreateRecurringSurveyCommandHandler.cs    | 47   | `"Survey does not belong to this namespace."`           | Error      | `Errors.SurveyNotInNamespace`          | High     |
| GetRecurringSurveyByIdQueryHandler.cs     | 43   | `"Recurring survey not found."`                         | Error      | `Errors.RecurringSurveyNotFound`       | High     |
| GetRecurringSurveyRunsQueryHandler.cs     | 45   | `"Recurring survey not found."`                         | Error      | `Errors.RecurringSurveyNotFound`       | High     |
| GetRecurringSurveyRunByIdQueryHandler.cs  | 43   | `"Recurring survey not found."`                         | Error      | `Errors.RecurringSurveyNotFound`       | High     |
| GetRecurringSurveyRunByIdQueryHandler.cs  | 59   | `"Run not found."`                                      | Error      | `Errors.RunNotFound`                   | High     |
| GetQuestionsQueryHandler.cs               | 38   | `"Survey not found."`                                   | Error      | `Errors.SurveyNotFound`                | High     |
| GetQuestionByIdQueryHandler.cs            | 38   | `"Survey not found."`                                   | Error      | `Errors.SurveyNotFound`                | High     |
| GetQuestionByIdQueryHandler.cs            | 44   | `"Question not found."`                                 | Error      | `Errors.QuestionNotFound`              | High     |
| ReorderQuestionsCommandHandler.cs         | 37   | `"Survey not found."`                                   | Error      | `Errors.SurveyNotFound`                | High     |
| ReorderQuestionsCommandHandler.cs         | 43   | `"Only draft surveys can be edited."`                   | Error      | `Errors.OnlyDraftSurveysEditable`      | High     |
| DeleteQuestionCommandHandler.cs           | 37   | `"Survey not found."`                                   | Error      | `Errors.SurveyNotFound`                | High     |
| DeleteQuestionCommandHandler.cs           | 43   | `"Only draft surveys can be edited."`                   | Error      | `Errors.OnlyDraftSurveysEditable`      | High     |
| DeleteQuestionCommandHandler.cs           | 49   | `"Question not found."`                                 | Error      | `Errors.QuestionNotFound`              | High     |
| CreateQuestionCommandHandler.cs           | 42   | `"Survey not found."`                                   | Error      | `Errors.SurveyNotFound`                | High     |
| CreateQuestionCommandHandler.cs           | 48   | `"Only draft surveys can be edited."`                   | Error      | `Errors.OnlyDraftSurveysEditable`      | High     |
| UpdateQuestionCommandHandler.cs           | 42   | `"Survey not found."`                                   | Error      | `Errors.SurveyNotFound`                | High     |
| UpdateQuestionCommandHandler.cs           | 48   | `"Only draft surveys can be edited."`                   | Error      | `Errors.OnlyDraftSurveysEditable`      | High     |
| UpdateQuestionCommandHandler.cs           | 54   | `"Question not found."`                                 | Error      | `Errors.QuestionNotFound`              | High     |
| GetSurveyLogicMapQueryHandler.cs          | 44   | `"Survey not found in this namespace."`                 | Error      | `Errors.SurveyNotInNamespace`          | High     |

---

### 🟡 **Domain Layer ArgumentExceptions (Medium Priority)**

These are in the Domain layer and should be converted to use localization keys:

| File                        | Line | Current Text                                       | Suggested Key                                   |
| --------------------------- | ---- | -------------------------------------------------- | ----------------------------------------------- |
| NamespaceSlug.cs            | 40   | `"Slug cannot be empty."`                          | `Domain.Validation.SlugEmpty`                   |
| NamespaceSlug.cs            | 73   | `"Name cannot be empty."`                          | `Domain.Validation.NameEmpty`                   |
| LanguageCode.cs             | 78   | `"Language code cannot be empty."`                 | `Domain.Validation.LanguageCodeEmpty`           |
| Email.cs                    | 35   | `"Email cannot be empty."`                         | `Domain.Validation.EmailEmpty`                  |
| Email.cs                    | 46   | `"Email format is invalid."`                       | `Domain.Validation.EmailInvalidFormat`          |
| QuestionSettings.cs         | 221  | `"Max value must be greater than min value."`      | `Domain.Validation.MaxGreaterThanMin`           |
| EmailDistributionService.cs | 158  | `"Template not found."`                            | `Errors.TemplateNotFound`                       |
| EmailDistributionService.cs | 300  | `"Distribution not found."`                        | `Errors.DistributionNotFound`                   |
| RecurringSurveyRun.cs       | 141  | `"Can only start a scheduled run."`                | `Domain.RecurringSurvey.CanOnlyStartScheduled`  |
| RecurringSurveyRun.cs       | 153  | `"Can only complete a running run."`               | `Domain.RecurringSurvey.CanOnlyCompleteRunning` |
| RecurringSurveyRun.cs       | 188  | `"Can only cancel a scheduled run."`               | `Domain.RecurringSurvey.CanOnlyCancelScheduled` |
| SurveyResponse.cs           | 148  | `"Cannot submit answers to a completed response."` | `Domain.Response.CannotSubmitCompleted`         |
| SurveyResponse.cs           | 188  | `"Response is already complete."`                  | `Domain.Response.AlreadyComplete`               |
| Survey.cs                   | 580  | `"Cannot set both ThemeId and PresetThemeId."`     | `Domain.Survey.CannotSetBothThemes`             |
| SurveyTemplate.cs           | 482  | `"Question not found in template."`                | `Domain.Template.QuestionNotFound`              |

---

### 📊 **Summary by Priority**

| Priority   | Count | Action                                |
| ---------- | ----- | ------------------------------------- |
| **High**   | ~70   | Immediate localization required       |
| **Medium** | ~15   | Domain/Infrastructure exceptions      |
| **Low**    | ~40   | ArgumentExceptions (developer-facing) |

### 🎯 **Recommended Keys to Add to en.json**

```json
{
  "Errors.UserWithEmailExists": "A user with this email already exists.",
  "Errors.TemplateNameExists": "A template with this name already exists.",
  "Errors.TemplateNotFound": "Template not found.",
  "Errors.SurveyLinkNotFound": "Survey link not found.",
  "Errors.InvalidSurveyLink": "Invalid survey link.",
  "Errors.SurveyLinkExpired": "This survey link has expired.",
  "Errors.InvalidSurveyLinkPassword": "Invalid password for this survey link.",
  "Errors.SurveyLinkNotBelongToSurvey": "Survey link does not belong to this survey.",
  "Errors.ResponseNotFound": "Response not found.",
  "Errors.RecurringSurveyNotFound": "Recurring survey not found.",
  "Errors.RecurringSurveyNotInNamespace": "Recurring survey does not belong to this namespace.",
  "Errors.RunNotFound": "Run not found.",
  "Errors.SurveyRequiresQuestions": "Cannot publish a survey without questions.",
  "Errors.NoPermissionCreateSurveys": "You do not have permission to create surveys.",
  "Validation.CountGreaterThanZero": "Count must be greater than 0."
}
```

Completed: _Compile and categorize results_ (5/5)

Analysis complete. I found **approximately 85+ hardcoded strings** that need localization across your Application and Infrastructure layers.

**Good news:** Many of your error messages already use localization key patterns (like `"Handler.SurveyNotFound"` and `"Errors.NamespaceRequired"`).

**The main issue:** There's inconsistency - some handlers use localization keys while others use plain English text for the same error types. To fix this, you'll need to:

1. Add the missing keys to your resource files (en.json, ru.json, az.json)
2. Update the handlers to use keys instead of hardcoded text
3. Standardize on a consistent naming convention for error keys
