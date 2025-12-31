### **1. HIGH PRIORITY - API Controllers (User-Facing Errors)**

| File                            | Line | Current Text                                                    | Category | Suggested Key                 | Priority |
| ------------------------------- | ---- | --------------------------------------------------------------- | -------- | ----------------------------- | -------- |
| FilesController.cs              | 76   | "Invalid file"                                                  | Error    | Errors.InvalidFile            | High     |
| FilesController.cs              | 77   | "No file was provided or the file is empty."                    | Error    | Errors.FileEmptyOrNotProvided | High     |
| FilesController.cs              | 90   | "File too large"                                                | Error    | Errors.FileTooLarge           | High     |
| FilesController.cs              | 104  | "Invalid file type"                                             | Error    | Errors.InvalidFileType        | High     |
| FilesController.cs              | 119  | "Invalid file extension"                                        | Error    | Errors.InvalidFileExtension   | High     |
| FilesController.cs              | 169  | "Upload failed"                                                 | Error    | Errors.UploadFailed           | High     |
| FilesController.cs              | 170  | "An error occurred while uploading the file. Please try again." | Error    | Errors.UploadErrorRetry       | High     |
| FilesController.cs              | 195  | "No files provided"                                             | Error    | Errors.NoFilesProvided        | High     |
| FilesController.cs              | 196  | "At least one file must be provided."                           | Error    | Errors.AtLeastOneFileRequired | High     |
| FilesController.cs              | 207  | "Too many files"                                                | Error    | Errors.TooManyFiles           | High     |
| FilesController.cs              | 208  | "A maximum of 10 files can be uploaded at once."                | Error    | Errors.MaxFilesUploadLimit    | High     |
| FilesController.cs              | 228  | "File is empty"                                                 | Error    | Errors.FileEmpty              | High     |
| FilesController.cs              | 241  | "File too large"                                                | Error    | Errors.FileTooLarge           | High     |
| FilesController.cs              | 289  | "Upload failed"                                                 | Error    | Errors.UploadFailed           | High     |
| FilesController.cs              | 327  | "File not found"                                                | Error    | Errors.FileNotFound           | High     |
| FilesController.cs              | 359  | "File not found"                                                | Error    | Errors.FileNotFound           | High     |
| FilesController.cs              | 385  | "File not found"                                                | Error    | Errors.FileNotFound           | High     |
| AuthController.cs               | 42   | "Registration failed."                                          | Error    | Errors.RegistrationFailed     | High     |
| AuthController.cs               | 80   | "Authentication failed."                                        | Error    | Errors.AuthenticationFailed   | High     |
| AuthController.cs               | 117  | "Token refresh failed."                                         | Error    | Errors.TokenRefreshFailed     | High     |
| AuthController.cs               | 169  | "Password reset failed."                                        | Error    | Errors.PasswordResetFailed    | High     |
| EmailDistributionsController.cs | 93   | "Resource not found."                                           | Error    | Errors.ResourceNotFound       | High     |
| EmailDistributionsController.cs | 335  | "Invalid tracking token."                                       | Error    | Errors.InvalidTrackingToken   | High     |
| TemplatesController.cs          | 155  | "Bad request."                                                  | Error    | Errors.BadRequest             | High     |
| SurveysController.cs            | 134  | "Bad request."                                                  | Error    | Errors.BadRequest             | High     |
| RecurringSurveysController.cs   | 126  | "Bad request."                                                  | Error    | Errors.BadRequest             | High     |
| NamespacesController.cs         | 106  | "Bad request."                                                  | Error    | Errors.BadRequest             | High     |

---

### **2. HIGH PRIORITY - Identity Service (Auth Errors)**

| File               | Line | Current Text                                 | Category | Suggested Key            | Priority |
| ------------------ | ---- | -------------------------------------------- | -------- | ------------------------ | -------- |
| IdentityService.cs | 38   | "User with this email already exists."       | Auth     | Auth.EmailAlreadyExists  | High     |
| IdentityService.cs | 44   | "Invalid email address."                     | Auth     | Auth.InvalidEmailAddress | High     |
| IdentityService.cs | 78   | "Invalid email or password."                 | Auth     | Auth.InvalidCredentials  | High     |
| IdentityService.cs | 90   | "Account is locked. Please try again later." | Auth     | Auth.AccountLocked       | High     |
| IdentityService.cs | 92   | "Invalid email or password."                 | Auth     | Auth.InvalidCredentials  | High     |
| IdentityService.cs | 103  | "Invalid token."                             | Auth     | Auth.InvalidToken        | High     |
| IdentityService.cs | 115  | "Invalid refresh token."                     | Auth     | Auth.InvalidRefreshToken | High     |

---

### **3. HIGH PRIORITY - Application Response Validation Errors**

| File                                  | Line | Current Text                              | Category   | Suggested Key                    | Priority |
| ------------------------------------- | ---- | ----------------------------------------- | ---------- | -------------------------------- | -------- |
| SubmitSurveyResponseCommandHandler.cs | 142  | "This question requires an answer."       | Validation | Validation.QuestionRequired      | High     |
| SubmitSurveyResponseCommandHandler.cs | 178  | "Invalid option selected."                | Validation | Validation.InvalidOption         | High     |
| SubmitSurveyResponseCommandHandler.cs | 203  | "Invalid option: {option}"                | Validation | Validation.InvalidOptionValue    | High     |
| SubmitSurveyResponseCommandHandler.cs | 209  | "Maximum {n} selections allowed."         | Validation | Validation.MaxSelectionsExceeded | High     |
| SubmitSurveyResponseCommandHandler.cs | 222  | "Invalid numeric value."                  | Validation | Validation.InvalidNumericValue   | High     |
| SubmitSurveyResponseCommandHandler.cs | 227  | "Value must be at least {n}."             | Validation | Validation.ValueMinimum          | High     |
| SubmitSurveyResponseCommandHandler.cs | 232  | "Value must be at most {n}."              | Validation | Validation.ValueMaximum          | High     |
| SubmitSurveyResponseCommandHandler.cs | 245  | "Invalid number format."                  | Validation | Validation.InvalidNumberFormat   | High     |
| SubmitSurveyResponseCommandHandler.cs | 256  | "Answer must be at least {n} characters." | Validation | Validation.AnswerMinLength       | High     |
| SubmitSurveyResponseCommandHandler.cs | 262  | "Answer must be at most {n} characters."  | Validation | Validation.AnswerMaxLength       | High     |
| SubmitSurveyResponseCommandHandler.cs | 271  | "Invalid email address."                  | Validation | Validation.InvalidEmailAddress   | High     |
| SubmitSurveyResponseCommandHandler.cs | 326  | "Invalid phone number format."            | Validation | Validation.InvalidPhoneFormat    | High     |
| SubmitSurveyResponseCommandHandler.cs | 342  | "Invalid URL format."                     | Validation | Validation.InvalidUrlFormat      | High     |
| SubmitSurveyResponseCommandHandler.cs | 387  | "Invalid date format."                    | Validation | Validation.InvalidDateFormat     | High     |
| BatchSyncQuestionsCommandHandler.cs   | 69   | "Question not found."                     | Error      | Errors.QuestionNotFound          | High     |
| BatchSyncQuestionsCommandHandler.cs   | 160  | "Question not found."                     | Error      | Errors.QuestionNotFound          | High     |

---

### **4. MEDIUM PRIORITY - FluentValidation Messages (200+ strings)**

These are validation messages in FluentValidation classes. Sample selection:

| File                            | Line | Current Text                                                    | Category   | Suggested Key                   | Priority |
| ------------------------------- | ---- | --------------------------------------------------------------- | ---------- | ------------------------------- | -------- |
| RegisterUserCommandValidator.cs | 12   | "Email is required."                                            | Validation | Validation.EmailRequired        | Medium   |
| RegisterUserCommandValidator.cs | 14   | "Invalid email address format."                                 | Validation | Validation.EmailInvalidFormat   | Medium   |
| RegisterUserCommandValidator.cs | 18   | "Password is required."                                         | Validation | Validation.PasswordRequired     | Medium   |
| RegisterUserCommandValidator.cs | 20   | "Password must be at least 8 characters."                       | Validation | Validation.PasswordMinLength    | Medium   |
| RegisterUserCommandValidator.cs | 22   | "Password cannot exceed 100 characters."                        | Validation | Validation.PasswordMaxLength    | Medium   |
| RegisterUserCommandValidator.cs | 24   | "Password must contain at least one uppercase letter."          | Validation | Validation.PasswordUppercase    | Medium   |
| RegisterUserCommandValidator.cs | 26   | "Password must contain at least one lowercase letter."          | Validation | Validation.PasswordLowercase    | Medium   |
| RegisterUserCommandValidator.cs | 28   | "Password must contain at least one digit."                     | Validation | Validation.PasswordDigit        | Medium   |
| RegisterUserCommandValidator.cs | 30   | "Password must contain at least one special character."         | Validation | Validation.PasswordSpecialChar  | Medium   |
| RegisterUserCommandValidator.cs | 34   | "First name is required."                                       | Validation | Validation.FirstNameRequired    | Medium   |
| RegisterUserCommandValidator.cs | 40   | "Last name is required."                                        | Validation | Validation.LastNameRequired     | Medium   |
| CreateSurveyCommandValidator.cs | 38   | "Survey title is required."                                     | Validation | Validation.SurveyTitleRequired  | Medium   |
| CreateSurveyCommandValidator.cs | 40   | "Survey title must be at least 3 characters."                   | Validation | Validation.SurveyTitleMinLength | Medium   |
| CreateSurveyCommandValidator.cs | 65   | "Invalid or unsupported language code."                         | Validation | Validation.InvalidLanguageCode  | Medium   |
| QuestionValidators.cs           | 20   | "Question text is required."                                    | Validation | Validation.QuestionTextRequired | Medium   |
| QuestionValidators.cs           | 29   | "Invalid question type."                                        | Validation | Validation.InvalidQuestionType  | Medium   |
| CreateThemeCommandValidator.cs  | 12   | "Theme name is required."                                       | Validation | Validation.ThemeNameRequired    | Medium   |
| CreateThemeCommandValidator.cs  | 28   | "Primary color must be a valid hex color code (e.g., #FF5733)." | Validation | Validation.InvalidHexColor      | Medium   |

---

### **5. MEDIUM PRIORITY - Domain Entities (Business Rule Errors)**

| File                 | Line | Current Text                                       | Category | Suggested Key                      | Priority |
| -------------------- | ---- | -------------------------------------------------- | -------- | ---------------------------------- | -------- |
| Namespace.cs         | 96   | "Namespace name cannot be empty."                  | Domain   | Domain.NamespaceNameRequired       | Medium   |
| Namespace.cs         | 165  | "Cannot downgrade subscription using this method." | Domain   | Domain.CannotDowngradeSubscription | Medium   |
| Namespace.cs         | 186  | "Cannot add users to an inactive namespace."       | Domain   | Domain.CannotAddUsersInactive      | Medium   |
| Namespace.cs         | 194  | "User is already a member of this namespace."      | Domain   | Domain.UserAlreadyMember           | Medium   |
| Namespace.cs         | 211  | "User is not a member of this namespace."          | Domain   | Domain.UserNotMember               | Medium   |
| Namespace.cs         | 217  | "Cannot remove the last owner of the namespace."   | Domain   | Domain.CannotRemoveLastOwner       | Medium   |
| Survey.cs            | 216  | "Survey title cannot be empty."                    | Domain   | Domain.SurveyTitleRequired         | Medium   |
| Survey.cs            | 426  | "Start date must be before end date."              | Domain   | Domain.StartDateBeforeEndDate      | Medium   |
| Survey.cs            | 479  | "Question not found in this survey."               | Domain   | Domain.QuestionNotInSurvey         | Medium   |
| Survey.cs            | 512  | "Only draft surveys can be published."             | Domain   | Domain.OnlyDraftCanPublish         | Medium   |
| Survey.cs            | 531  | "Only published surveys can be closed."            | Domain   | Domain.OnlyPublishedCanClose       | Medium   |
| Survey.cs            | 543  | "Draft surveys cannot be archived."                | Domain   | Domain.DraftCannotArchive          | Medium   |
| Survey.cs            | 554  | "Only closed surveys can be reopened."             | Domain   | Domain.OnlyClosedCanReopen         | Medium   |
| EmailDistribution.cs | 136  | "Subject cannot be empty."                         | Domain   | Domain.SubjectRequired             | Medium   |
| EmailDistribution.cs | 254  | "Cannot send a distribution without recipients."   | Domain   | Domain.NoRecipientsForDistribution | Medium   |
| User.cs              | 88   | "First name cannot be empty."                      | Domain   | Domain.FirstNameRequired           | Medium   |
| User.cs              | 91   | "Last name cannot be empty."                       | Domain   | Domain.LastNameRequired            | Medium   |
| UserPreferences.cs   | 351  | "Invalid language code."                           | Domain   | Domain.InvalidLanguageCode         | Medium   |
| UserPreferences.cs   | 603  | "Items per page must be between 6 and 50."         | Domain   | Domain.ItemsPerPageRange           | Medium   |

---

### **6. LOW PRIORITY - Infrastructure Services**

| File                        | Line | Current Text              | Category | Suggested Key               | Priority |
| --------------------------- | ---- | ------------------------- | -------- | --------------------------- | -------- |
| EmailDistributionService.cs | 158  | "Template not found."     | Error    | Errors.TemplateNotFound     | Low      |
| EmailDistributionService.cs | 300  | "Distribution not found." | Error    | Errors.DistributionNotFound | Low      |

---

### **Summary Statistics**

| Category                   | Count    | Priority |
| -------------------------- | -------- | -------- |
| API Controller Errors      | 27       | High     |
| Auth/Identity Errors       | 7        | High     |
| Survey Response Validation | 16       | High     |
| FluentValidation Messages  | ~150     | Medium   |
| Domain Entity Exceptions   | ~50      | Medium   |
| Infrastructure Services    | 2        | Low      |
| **Total**                  | **~252** | -        |

---

### **Recommended Next Steps**

1. **Immediate (High Priority)**:

   - Add missing keys to en.json
   - Inject `IStringLocalizer` in `FilesController` and `IdentityService`
   - Update `SubmitSurveyResponseCommandHandler` to use localized messages

2. **Short-term (Medium Priority)**:

   - Create a base validator class that injects `IStringLocalizer`
   - Replace all `.WithMessage("...")` with `.WithMessage(localizer["Key"])`

3. **Long-term (Low Priority)**:
   - Domain entities can optionally use resource keys or rely on upper layers to translate exceptions
