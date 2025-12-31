### 🔴 **HIGH PRIORITY - User-Facing Error Messages**

| File | Line | Current Text | Category | Suggested Key | Priority |
|------|------|--------------|----------|---------------|----------|
| GlobalExceptionMiddleware.cs | 109 | `"An internal server error occurred. Please try again later."` | Error | `Errors.InternalServerError` | High |
| GlobalExceptionMiddleware.cs | 139 | `"An error occurred"` | Error | `Errors.GenericError` | High |
| FilesController.cs | 51 | `"Invalid file"` | Error | `Errors.File.Invalid` | High |
| FilesController.cs | 52 | `"File is empty or not provided"` | Validation | `Validation.File.EmptyOrMissing` | High |
| FilesController.cs | 93 | `"No files provided"` | Error | `Errors.File.NoFilesProvided` | High |
| FilesController.cs | 94 | `"At least one file is required"` | Validation | `Validation.File.AtLeastOneRequired` | High |

---

### 🔴 **HIGH PRIORITY - Service Exception Messages**

| File | Line | Current Text | Category | Suggested Key | Priority |
|------|------|--------------|----------|---------------|----------|
| NpsService.cs | 33, 116, 222 | `$"Survey with ID {surveyId} not found."` | Error | `Errors.Survey.NotFoundWithId` | High |
| ExportService.cs | 231, 314 | `$"Survey with ID {surveyId} not found."` | Error | `Errors.Survey.NotFoundWithId` | High |
| LocalFileStorageService.cs | 84, 119 | `$"File not found: {fileId}"` | Error | `Errors.File.NotFoundWithId` | High |
| EmailDistributionService.cs | 205 | `$"Reminder: {distribution.Subject}"` | Email | `Email.ReminderPrefix` | High |

---

### 🔴 **HIGH PRIORITY - Application Handler Messages**

| File | Line | Current Text | Category | Suggested Key | Priority |
|------|------|--------------|----------|---------------|----------|
| GetQuestionLogicQueryHandler.cs | 50 | `"Survey not found in this namespace."` | Error | `Errors.Survey.NotFoundInNamespace` | High |
| GetQuestionLogicQueryHandler.cs | 58 | `"Question not found in this survey."` | Error | `Errors.Question.NotFoundInSurvey` | High |
| GetThemePreviewQueryHandler.cs | 33 | `$"Theme with ID '{request.ThemeId}' was not found."` | Error | `Errors.Theme.NotFoundWithId` | High |
| GetThemeByIdQueryHandler.cs | 34 | `$"Theme with ID '{request.ThemeId}' was not found."` | Error | `Errors.Theme.NotFoundWithId` | High |
| DuplicateSurveyCommandHandler.cs | 53 | `$"Survey with ID {request.SurveyId} not found."` | Error | `Errors.Survey.NotFoundWithId` | High |
| BulkUpdateSurveyTranslationsCommandHandler.cs | 129 | `$"Question not found: '{qt.QuestionId}'"` | Error | `Errors.Question.NotFoundWithId` | High |
| SubmitSurveyResponseCommandHandler.cs | 107 | `$"Invalid answer for '{question.Text}': {validationResult.Error}"` | Validation | `Validation.Response.InvalidAnswer` | High |

---

### 🟠 **MEDIUM PRIORITY - Domain Validation Messages**

| File | Line | Current Text | Category | Suggested Key | Priority |
|------|------|--------------|----------|---------------|----------|
| NamespaceSlug.cs | 49 | `$"Slug must be at least {MinLength} characters."` | Validation | `Validation.Slug.MinLength` | Medium |
| NamespaceSlug.cs | 55 | `$"Slug cannot exceed {MaxLength} characters."` | Validation | `Validation.Slug.MaxLength` | Medium |
| NamespaceSlug.cs | 61 | `"Slug can only contain lowercase letters, numbers, and hyphens."` | Validation | `Validation.Slug.InvalidFormat` | Medium |
| LanguageCode.cs | 87 | `$"Invalid language code format: '{value}'."` | Validation | `Validation.LanguageCode.InvalidFormat` | Medium |
| TranslationManager.cs | 142 | `$"Translation for language '{languageCode}' not found."` | Error | `Errors.Translation.NotFoundForLanguage` | Medium |
| EmailTemplate.cs | 155 | `"Name cannot be empty."` | Validation | `Validation.Name.Required` | Medium |
| EmailTemplate.cs | 162 | `$"Translation for language '{lang}' not found. Create a translation first."` | Error | `Errors.Translation.NotFoundCreateFirst` | Medium |
| SurveyTemplate.cs | 495 | `"Question not found in template."` | Error | `Errors.Question.NotFoundInTemplate` | Medium |
| RecurringSurvey.cs | 453 | `$"Unknown recurrence pattern: {Pattern}"` | Error | `Errors.RecurringSurvey.UnknownPattern` | Medium |
| NamespaceMembership.cs | 91 | `"New role must be higher than the current role."` | Error | `Errors.Membership.RoleMustBeHigher` | Medium |

---

### 🟠 **MEDIUM PRIORITY - UserPreferences Validation Messages**

| File | Line | Current Text | Category | Suggested Key | Priority |
|------|------|--------------|----------|---------------|----------|
| UserPreferences.cs | 273 | `"Invalid theme mode. Must be 'light', 'dark', or 'system'."` | Validation | `Validation.ThemeMode.Invalid` | Medium |
| UserPreferences.cs | 286 | `"Invalid color palette."` | Validation | `Validation.ColorPalette.Invalid` | Medium |
| UserPreferences.cs | 326 | `"Invalid font size scale. Must be 'small', 'medium', 'large', or 'extra-large'."` | Validation | `Validation.FontSizeScale.Invalid` | Medium |
| UserPreferences.cs | 362 | `"Invalid date format."` | Validation | `Validation.DateFormat.Invalid` | Medium |
| UserPreferences.cs | 374 | `"Invalid time format. Must be '12h' or '24h'."` | Validation | `Validation.TimeFormat.Invalid` | Medium |
| UserPreferences.cs | 387 | `"Timezone cannot be empty."` | Validation | `Validation.Timezone.Required` | Medium |
| UserPreferences.cs | 399 | `"Invalid decimal separator. Must be 'dot' or 'comma'."` | Validation | `Validation.DecimalSeparator.Invalid` | Medium |
| UserPreferences.cs | 413 | `"Invalid thousands separator..."` | Validation | `Validation.ThousandsSeparator.Invalid` | Medium |
| UserPreferences.cs | 591 | `"Invalid view mode. Must be 'grid' or 'list'."` | Validation | `Validation.ViewMode.Invalid` | Medium |
| UserPreferences.cs | 621 | `"Invalid sort field."` | Validation | `Validation.SortField.Invalid` | Medium |
| UserPreferences.cs | 632 | `"Invalid sort order. Must be 'asc' or 'desc'."` | Validation | `Validation.SortOrder.Invalid` | Medium |
| UserPreferences.cs | 732 | `"Invalid numbering style..."` | Validation | `Validation.NumberingStyle.Invalid` | Medium |
| UserPreferences.cs | 752 | `"Invalid page break behavior."` | Validation | `Validation.PageBreakBehavior.Invalid` | Medium |
| UserPreferences.cs | 808 | `"Onboarding step must be between 0 and 10."` | Validation | `Validation.OnboardingStep.OutOfRange` | Medium |
| UserPreferences.cs | 791 | `"Invalid onboarding status..."` | Validation | `Validation.OnboardingStatus.Invalid` | Medium |

---

### 🟡 **LOW PRIORITY - CommonValidationRules (Consider Centralizing)**

The CommonValidationRules.cs file has **~30 hardcoded validation messages** using template patterns like:
- `$"{fieldName} is required."`
- `$"{fieldName} must be at least {minLength} characters."`
- `$"{fieldName} cannot exceed {maxLength} characters."`

**Recommendation:** Create generic localization keys with parameters:
- `Validation.Required` → `"{0} is required."`
- `Validation.MinLength` → `"{0} must be at least {1} characters."`
- `Validation.MaxLength` → `"{0} cannot exceed {1} characters."`

---

### ✅ **Already Properly Localized (Good Examples)**

Your codebase has many well-localized patterns to follow:
- Domain exceptions use keys: `throw new DomainException("Domain.Survey.TitleRequired")`
- Validators use localizer: `.WithMessage(localizer["Validation.Theme.NameRequired"])`
- Email subjects use localizer: `_localizer["Email.SurveyInvitationSubject"]`
- Result failures use keys: `Result.Failure("Errors.SurveyNotFound")`

---

### 📋 **Summary**

| Priority | Count | Action |
|----------|-------|--------|
| 🔴 High | ~18 | Fix immediately - visible to end users |
| 🟠 Medium | ~25 | Fix soon - domain/business rule messages |
| 🟡 Low | ~30 | Centralize validation rule messages |

**Total hardcoded strings needing localization: ~73**