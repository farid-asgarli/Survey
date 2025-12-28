# Form Migration to React Hook Form

This document tracks the migration of forms to React Hook Form (RHF) with Zod validation.

## Migration Status

### ✅ Already Using RHF

- [x] LoginForm
- [x] RegisterForm
- [x] ResetPasswordPage

---

### 🟢 Lower Priority (Simple Forms) - COMPLETED ✅

| Form                      | File                                                                | Fields                                                                         | Status  |
| ------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------- |
| CreateSurveyDialog        | `components/features/surveys/CreateSurveyDialog.tsx`                | title, description                                                             | ✅ Done |
| CreateTemplateDialog      | `components/features/templates/CreateTemplateDialog.tsx`            | name, description, category, isPublic, surveyId                                | ✅ Done |
| UseTemplateDialog         | `components/features/templates/UseTemplateDialog.tsx`               | title, description                                                             | ✅ Done |
| CreateEmailTemplateDialog | `components/features/email-templates/CreateEmailTemplateDialog.tsx` | name, type                                                                     | ✅ Done |
| CreateLinkDialog          | `components/features/distributions/CreateLinkDialog.tsx`            | linkType, expiresAt, maxResponses, password, utmSource, utmMedium, utmCampaign | ✅ Done |
| BulkLinkGenerationDialog  | `components/features/distributions/BulkLinkGenerationDialog.tsx`    | count, namePrefix, expiresAt, utmSource, utmMedium, utmCampaign                | ✅ Done |

---

### 🟠 Medium Priority - COMPLETED ✅

| Form                       | File                                                       | Fields                     | Status  |
| -------------------------- | ---------------------------------------------------------- | -------------------------- | ------- |
| MembersManagement (Invite) | `components/features/namespaces/MembersManagement.tsx`     | email, role                | ✅ Done |
| CreateNamespaceDialog      | `components/features/namespaces/CreateNamespaceDialog.tsx` | name, slug, description    | ✅ Done |
| GeneralSettings            | `pages/NamespaceSettings/sections/GeneralSettings.tsx`     | name, description, baseUrl | ✅ Done |
| ApiKeysSection             | `pages/Settings/sections/ApiKeysSection.tsx`               | keyName, scopes            | ✅ Done |

---

### 🔴 High Priority (Most Benefit) - COMPLETED ✅

| Form               | File                                                 | Fields                                        | Status  |
| ------------------ | ---------------------------------------------------- | --------------------------------------------- | ------- |
| ForgotPasswordPage | `pages/ForgotPassword/ForgotPasswordPage.tsx`        | email                                         | ✅ Done |
| SecuritySection    | `pages/Settings/sections/SecuritySection.tsx`        | currentPassword, newPassword, confirmPassword | ✅ Done |
| PasswordChangeForm | `components/features/profile/PasswordChangeForm.tsx` | currentPassword, newPassword, confirmPassword | ✅ Done |

---

## Zod Schemas to Add

Add these schemas to `src/lib/validations.ts` as needed:

```ts
// ✅ ADDED - Namespace (createNamespaceSchema, namespaceSettingsSchema)
// ✅ ADDED - Invite Member (inviteMemberSchema)
// ✅ ADDED - API Keys (createApiKeySchema)
// ✅ ADDED - Forgot Password (forgotPasswordSchema)
// ✅ ADDED - Change Password (changePasswordSchema)
```

---

## Migration Checklist (Per Form)

- [ ] Add Zod schema to `validations.ts`
- [ ] Export inferred type
- [ ] Replace `useState` for form fields with `useForm`
- [ ] Replace manual validation with `zodResolver`
- [ ] Use `register()` for inputs
- [ ] Use `formState.errors` for error display
- [ ] Use `formState.touchedFields` for touched state
- [ ] Test form submission
- [ ] Test validation errors display
- [ ] Remove unused imports

---

## Notes

- Forms in dialogs may need special handling for reset on close
- Some forms have auto-generation logic (e.g., slug from name) - use `watch()` and `setValue()`
- Password forms should use existing `strongPasswordSchema` and `getPasswordRequirements()`
