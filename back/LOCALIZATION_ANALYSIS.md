## **HIGH PRIORITY - User-Facing Error Messages**

| File | Line | Current Text | Category | Suggested Key | Priority |
|------|------|--------------|----------|---------------|----------|
| UpdateUserPreferencesCommandHandler.cs | 40 | `"User profile not found. Please ensure your account is properly set up."` | Error | `Errors.UserProfileNotFound` | High |
| CreateThemeCommandHandler.cs | 45 | `$"A theme with the name '{request.Name}' already exists."` | Error | `Errors.ThemeNameExists` | High |
| UpdateThemeCommandHandler.cs | 62 | `$"A theme with the name '{request.Name}' already exists."` | Error | `Errors.ThemeNameExists` | High |
| DuplicateThemeCommandHandler.cs | 78 | `$"A theme with the name '{newName}' already exists."` | Error | `Errors.ThemeNameExists` | High |
| CreateSurveyCommandHandler.cs | 52 | `$"Survey limit reached for this namespace. Maximum allowed: {@namespace.MaxSurveys}"` | Error | `Errors.SurveyLimitReached` | High |
| DuplicateSurveyCommandHandler.cs | 77 | `$"Survey limit reached for this namespace. Maximum allowed: {@namespace.MaxSurveys}"` | Error | `Errors.SurveyLimitReached` | High |
| CreateSurveyFromTemplateCommandHandler.cs | 48 | `$"Survey limit reached for this namespace. Maximum allowed: {@namespace.MaxSurveys}"` | Error | `Errors.SurveyLimitReached` | High |
| GenerateBulkLinksCommandHandler.cs | 74 | `"Survey does not belong to this namespace."` | Error | `Errors.SurveyNotInNamespace` | High |
| GetRecurringSurveyRunByIdQueryHandler.cs | 65 | `"Run does not belong to this recurring survey."` | Error | `Errors.RunNotBelongToSurvey` | High |

---

## **HIGH PRIORITY - Domain Validation Messages (Not Using Keys)**

| File | Line | Current Text | Category | Suggested Key | Priority |
|------|------|--------------|----------|---------------|----------|
| RecurringSurvey.cs | 234 | `"Days of week are required for weekly pattern."` | Domain | `Domain.RecurringSurvey.DaysOfWeekRequiredWeekly` | High |
| RecurringSurvey.cs | 240 | `"Day of month is required for monthly pattern."` | Domain | `Domain.RecurringSurvey.DayOfMonthRequiredMonthly` | High |
| RecurringSurvey.cs | 246 | `"Cron expression is required for custom pattern."` | Domain | `Domain.RecurringSurvey.CronExpressionRequiredCustom` | High |
| RecurringSurvey.cs | 252 | `"Day of month must be between 1 and 31."` | Domain | `Domain.RecurringSurvey.DayOfMonthRange` | High |
| RecurringSurvey.cs | 280 | `"Recipient emails are required for static list audience."` | Domain | `Domain.RecurringSurvey.RecipientEmailsRequiredStatic` | High |
| RecurringSurvey.cs | 286 | `"Audience list ID is required for dynamic list audience."` | Domain | `Domain.RecurringSurvey.AudienceListIdRequiredDynamic` | High |

---

## **MEDIUM PRIORITY - CX Metric Default Question Text**

| File | Line | Current Text | Category | Suggested Key | Priority |
|------|------|--------------|----------|---------------|----------|
| CreateSurveyCommandHandler.cs | 139 | `"How likely are you to recommend us to a friend or colleague?"` | CX Question | `CxMetric.NPS.Question` | Medium |
| CreateSurveyCommandHandler.cs | 142 | `"Not at all likely"` | CX Label | `CxMetric.NPS.MinLabel` | Medium |
| CreateSurveyCommandHandler.cs | 143 | `"Extremely likely"` | CX Label | `CxMetric.NPS.MaxLabel` | Medium |
| CreateSurveyCommandHandler.cs | 144 | `"What is the primary reason for your score?"` | CX Question | `CxMetric.NPS.FollowUp` | Medium |
| CreateSurveyCommandHandler.cs | 147 | `"How easy was it to interact with our company?"` | CX Question | `CxMetric.CES.Question` | Medium |
| CreateSurveyCommandHandler.cs | 150 | `"Very difficult"` | CX Label | `CxMetric.CES.MinLabel` | Medium |
| CreateSurveyCommandHandler.cs | 151 | `"Very easy"` | CX Label | `CxMetric.CES.MaxLabel` | Medium |
| CreateSurveyCommandHandler.cs | 152 | `"What could we do to make your experience easier?"` | CX Question | `CxMetric.CES.FollowUp` | Medium |
| CreateSurveyCommandHandler.cs | 155 | `"How satisfied are you with your experience?"` | CX Question | `CxMetric.CSAT.Question` | Medium |
| CreateSurveyCommandHandler.cs | 158 | `"Very dissatisfied"` | CX Label | `CxMetric.CSAT.MinLabel` | Medium |
| CreateSurveyCommandHandler.cs | 159 | `"Very satisfied"` | CX Label | `CxMetric.CSAT.MaxLabel` | Medium |
| CreateSurveyCommandHandler.cs | 160 | `"What could we improve to better serve you?"` | CX Question | `CxMetric.CSAT.FollowUp` | Medium |
| CreateSurveyCommandHandler.cs | 189 | `"Please share your thoughts"` | Placeholder | `CxMetric.FollowUp.Description` | Medium |
| CreateSurveyCommandHandler.cs | 190 | `"Share your feedback here..."` | Placeholder | `CxMetric.FollowUp.Placeholder` | Medium |

---

## **MEDIUM PRIORITY - Middleware Error Messages**

| File | Line | Current Text | Category | Suggested Key | Priority |
|------|------|--------------|----------|---------------|----------|
| GlobalExceptionMiddleware.cs | 136 | `"Bad Request"` | HTTP Title | `HttpStatus.BadRequest` | Medium |
| GlobalExceptionMiddleware.cs | 137 | `"Unauthorized"` | HTTP Title | `HttpStatus.Unauthorized` | Medium |
| GlobalExceptionMiddleware.cs | 138 | `"Forbidden"` | HTTP Title | `HttpStatus.Forbidden` | Medium |
| GlobalExceptionMiddleware.cs | 139 | `"Not Found"` | HTTP Title | `HttpStatus.NotFound` | Medium |
| GlobalExceptionMiddleware.cs | 140 | `"Conflict"` | HTTP Title | `HttpStatus.Conflict` | Medium |
| GlobalExceptionMiddleware.cs | 141 | `"Internal Server Error"` | HTTP Title | `HttpStatus.InternalServerError` | Medium |

---

## **LOW PRIORITY - Sample/Preview Data**

| File | Line | Current Text | Category | Suggested Key | Priority |
|------|------|--------------|----------|---------------|----------|
| EmailDistributionService.cs | 391 | `"John Doe"` | Sample | `Sample.RespondentName` | Low |
| EmailDistributionService.cs | 394 | `"Sample Survey"` | Sample | `Sample.SurveyTitle` | Low |
| EmailDistributionService.cs | 395 | `"This is a sample survey description."` | Sample | `Sample.SurveyDescription` | Low |
| EmailDistributionService.cs | 400 | `"Survey Team"` | Sample | `Sample.SenderName` | Low |
| EmailDistributionService.cs | 401 | `"Sample Organization"` | Sample | `Sample.OrganizationName` | Low |

---

## **Already Localized (Good Examples)**

Your codebase follows good patterns in many places:
- ✅ Domain exceptions use keys like `"Domain.RecurringSurvey.NameRequired"`
- ✅ Validators use `localizer["Validation.FirstName.Required"]`
- ✅ Result failures use keys like `"Errors.SurveyNotFound"`
- ✅ Localization files exist: en.json, `ru.json`, `az.json`

---

## **Recommended Next Steps**

1. **Add missing keys to** en.json for all High priority items
2. **Inject `IStringLocalizer`** into handlers that are missing it
3. **Replace hardcoded strings** with localizer calls
4. **Sync translations** to `ru.json` and `az.json`

Would you like me to help implement these changes for any specific category?