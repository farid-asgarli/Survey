# Localization Remediation Task

Based on the localization audit report, I need to fix **321 missing translation keys** and review **257 hardcoded strings** in the front-end project.

---

## Phase 1: Add Missing Translation Keys to en.json

Work through these groups one at a time, adding the English translations to `front/src/i18n/locales/en.json`. For each group:

1. Look at how the keys are used in the source files to understand the context
2. Add appropriate English translations
3. Verify no syntax errors in the JSON

### Group 1 - Authentication & User Management

**Files to reference:**

- `pages/ForgotPasswordPage.tsx`
- `pages/ResetPasswordPage.tsx`
- `pages/RegisterPage.tsx`
- `components/features/profile/PasswordChangeForm.tsx`
- `components/features/profile/ProfileSettings.tsx`
- `components/features/profile/AvatarUpload.tsx`

**Keys to add:**

```
auth.backToLogin

register.firstName
register.firstNamePlaceholder
register.lastName
register.lastNamePlaceholder
register.createPassword

forgotPassword.toast.success
forgotPassword.toast.successDescription
forgotPassword.toast.error
forgotPassword.toast.requestFailed
forgotPassword.emailSent.title
forgotPassword.emailSent.description
forgotPassword.emailSent.expiry
forgotPassword.emailSent.tryAgain
forgotPassword.cardTitle
forgotPassword.cardDescription
forgotPassword.sendResetLink

resetPassword.errors.meetRequirements
resetPassword.successTitle
resetPassword.successDescription
resetPassword.errors.failed
resetPassword.errors.resetFailed
resetPassword.invalidLink.requestNewLink
resetPassword.subtitle
resetPassword.newPassword
resetPassword.description
resetPassword.newPasswordLabel
resetPassword.newPasswordPlaceholder
resetPassword.confirmPasswordLabel
resetPassword.confirmPasswordPlaceholder
resetPassword.submit

password.validation.confirmRequired
password.validation.mismatch
password.validation.currentRequired
password.validation.newRequired
password.validation.requirements
password.toast.success
password.toast.failed
password.toast.failedTitle
password.title
password.description
password.successMessage
password.currentPassword
password.newPassword
password.confirmPassword
password.updating
password.updatePassword

profile.toast.updateSuccess
profile.toast.updateFailed
profile.toast.updateFailedTitle
profile.toast.avatarUpdated
profile.toast.avatarRemoved
profile.emailChangeNotice
profile.editProfile

avatar.validation.invalidType
avatar.validation.tooLarge
avatar.upload.error
avatar.remove.error
avatar.change
avatar.upload
avatar.maxSize
avatar.uploadDialog.title
avatar.uploadDialog.description
avatar.dragDrop
avatar.orBrowse
avatar.browseFiles
avatar.uploading
avatar.removeDialog.title
avatar.removeDialog.description
avatar.removing
avatar.remove
```

---

### Group 2 - Distribution System

**Files to reference:**

- `components/features/distributions/CreateLinkDialog.tsx`
- `components/features/distributions/BulkLinkGenerationDialog.tsx`
- `components/features/distributions/LinksPanel.tsx`
- `components/features/distributions/LinkAnalyticsDrawer.tsx`
- `components/features/distributions/QRCodeDialog.tsx`

**Keys to add:**

```
createLinkDialog.types.standard
createLinkDialog.types.standardDescription
createLinkDialog.types.unique
createLinkDialog.types.uniqueDescription
createLinkDialog.types.embedded
createLinkDialog.types.embeddedDescription
createLinkDialog.toast.success
createLinkDialog.toast.error
createLinkDialog.title
createLinkDialog.descriptionWithTitle
createLinkDialog.description
createLinkDialog.linkType
createLinkDialog.expirationDate
createLinkDialog.expirationDateDescription
createLinkDialog.responseLimit
createLinkDialog.responseLimitDescription
createLinkDialog.maxResponsesPlaceholder
createLinkDialog.passwordProtection
createLinkDialog.passwordProtectionDescription
createLinkDialog.passwordPlaceholder
createLinkDialog.advancedOptions
createLinkDialog.utmParameters
createLinkDialog.utmTooltip
createLinkDialog.utmDescription
createLinkDialog.utmSourcePlaceholder
createLinkDialog.utmSource
createLinkDialog.utmMediumPlaceholder
createLinkDialog.utmMedium
createLinkDialog.utmCampaignPlaceholder
createLinkDialog.utmCampaign
createLinkDialog.creating
createLinkDialog.create

bulkLinkDialog.toast.copyFailed
bulkLinkDialog.toast.allCopied
bulkLinkDialog.toast.downloaded
bulkLinkDialog.generatedCount
bulkLinkDialog.copyAll
bulkLinkDialog.downloadCSV
bulkLinkDialog.toast.invalidCount
bulkLinkDialog.toast.generated
bulkLinkDialog.toast.error
bulkLinkDialog.title
bulkLinkDialog.descriptionWithTitle
bulkLinkDialog.description
bulkLinkDialog.numberOfLinks
bulkLinkDialog.numberOfLinksPlaceholder
bulkLinkDialog.numberOfLinksHint
bulkLinkDialog.namePrefix
bulkLinkDialog.namePrefixPlaceholder
bulkLinkDialog.namePrefixHint
bulkLinkDialog.expirationDate
bulkLinkDialog.expirationDateDescription
bulkLinkDialog.advancedOptions
bulkLinkDialog.utmParameters
bulkLinkDialog.utmTooltip
bulkLinkDialog.utmDescription
bulkLinkDialog.utmSourcePlaceholder
bulkLinkDialog.utmSource
bulkLinkDialog.utmMediumPlaceholder
bulkLinkDialog.utmMedium
bulkLinkDialog.utmCampaignPlaceholder
bulkLinkDialog.utmCampaign
bulkLinkDialog.generating
bulkLinkDialog.generate

linksPanel.types.standard
linksPanel.types.standardDescription
linksPanel.types.unique
linksPanel.types.uniqueDescription
linksPanel.types.embedded
linksPanel.types.embeddedDescription
linksPanel.passwordProtected
linksPanel.totalClicks
linksPanel.responses
linksPanel.expiresAt
linksPanel.showQRCode
linksPanel.openLink
linksPanel.viewAnalytics
linksPanel.copyLink
linksPanel.deactivate
linksPanel.reactivate
linksPanel.emptyState.title
linksPanel.emptyState.description
linksPanel.toast.copied
linksPanel.toast.copyFailed
linksPanel.confirm.deactivateTitle
linksPanel.confirm.deactivateDescription
linksPanel.toast.deactivated
linksPanel.toast.deactivateFailed
linksPanel.confirm.reactivateTitle
linksPanel.confirm.reactivateDescription
linksPanel.toast.reactivated
linksPanel.toast.reactivateFailed
linksPanel.newLink
linksPanel.error

linkAnalytics.description
linkAnalytics.clicks
linkAnalytics.responses
linkAnalytics.conversion
linkAnalytics.error.title
linkAnalytics.error.description
linkAnalytics.uniqueClicks
linkAnalytics.topCountries
linkAnalytics.clicksOverTime
linkAnalytics.tabs.geography
linkAnalytics.tabs.device
linkAnalytics.tabs.referrer
linkAnalytics.geoDistribution
linkAnalytics.noGeoData
linkAnalytics.deviceBreakdown
linkAnalytics.noDeviceData
linkAnalytics.noReferrerData
linkAnalytics.direct
linkAnalytics.details.created
linkAnalytics.details.type
linkAnalytics.details.name
linkAnalytics.details.status
linkAnalytics.details.active
linkAnalytics.details.inactive
linkAnalytics.details.expires
linkAnalytics.details.maxResponses
linkAnalytics.details.passwordProtected
linkAnalytics.details.utmSource
linkAnalytics.details.utmMedium
linkAnalytics.details.utmCampaign
linkAnalytics.loading

qrCodeDialog.sizes.small
qrCodeDialog.sizes.medium
qrCodeDialog.sizes.large
qrCodeDialog.sizes.xlarge
qrCodeDialog.toast.copied
qrCodeDialog.toast.copyFailed
qrCodeDialog.toast.downloaded
qrCodeDialog.toast.downloadFailed
qrCodeDialog.title
qrCodeDialog.description
qrCodeDialog.theme
qrCodeDialog.themes.light
qrCodeDialog.themes.dark
qrCodeDialog.themes.brand
qrCodeDialog.downloadSize
qrCodeDialog.selectSize
qrCodeDialog.downloadPNG
qrCodeDialog.openSurvey
qrCodeDialog.tips.title
qrCodeDialog.tips.tip1
qrCodeDialog.tips.tip2
qrCodeDialog.tips.tip3
qrCodeDialog.tips.tip4
```

---

### Group 3 - Theme Editor

**Files to reference:**

- `components/features/themes/ThemeEditorDrawer.tsx`
- `components/features/themes/ThemeLivePreview.tsx`
- `components/features/themes/ThemePreviewCard.tsx`

**Keys to add:**

```
themeEditor.validation.nameRequired
themeEditor.validation.primaryColorRequired
themeEditor.validation.backgroundColorRequired
themeEditor.toast.validationError
themeEditor.editTitle
themeEditor.createTitle
themeEditor.editDescription
themeEditor.createDescription
themeEditor.themeNamePlaceholder
themeEditor.fontFamily
themeEditor.baseFontSize
themeEditor.buttonStyle
themeEditor.logoUrl
themeEditor.logoUrlHelperText
themeEditor.backgroundImageUrl
themeEditor.backgroundImageUrlHelperText
themeEditor.customCss
themeEditor.customCssPlaceholder
themeEditor.customCssHelperText
themeEditor.generatedCssPreview
themeEditor.saveChanges
themeEditor.createTheme

themePreview.surveyTitle
themePreview.surveyDescription
themePreview.progress
themePreview.sampleQuestion1
themePreview.sampleQuestion2
themePreview.option1
themePreview.option2
themePreview.option3
themePreview.previous
themePreview.next
themePreview.primaryBtn
themePreview.outlineBtn

themes.default
themes.selected
```

---

### Group 4 - Question System

**Files to reference:**

- `components/features/questions/editors/OptionListEditor.tsx`
- `components/features/questions/editors/RankingEditor.tsx`
- `components/features/questions/QuestionCard.tsx`

**Keys to add:**

```
questionTypes.options.title
questionTypes.options.placeholder
questionTypes.options.remove
questionTypes.options.add
questionTypes.ranking.helper
questionTypes.ranking.previewLabel

editors.options
```

---

### Group 5 - Workspace & Settings

**Files to reference:**

- `pages/NamespaceSettingsPage.tsx`
- `pages/EmailTemplatesPage.tsx`
- `pages/SettingsPage.tsx`
- `components/features/namespaces/MembersManagement.tsx`

**Keys to add:**

```
workspaceSettings.billing.tiers.free.label
workspaceSettings.billing.tiers.free.description
workspaceSettings.billing.tiers.free.features.surveys
workspaceSettings.billing.tiers.free.features.responses
workspaceSettings.billing.tiers.free.features.analytics
workspaceSettings.billing.tiers.free.features.teamMembers
workspaceSettings.billing.tiers.pro.label
workspaceSettings.billing.tiers.pro.description
workspaceSettings.billing.tiers.pro.features.surveys
workspaceSettings.billing.tiers.pro.features.responses
workspaceSettings.billing.tiers.pro.features.analytics
workspaceSettings.billing.tiers.pro.features.teamMembers
workspaceSettings.billing.tiers.pro.features.branding
workspaceSettings.billing.tiers.pro.features.support
workspaceSettings.billing.tiers.enterprise.label
workspaceSettings.billing.tiers.enterprise.description
workspaceSettings.billing.tiers.enterprise.features.unlimited
workspaceSettings.billing.tiers.enterprise.features.integrations
workspaceSettings.billing.tiers.enterprise.features.support
workspaceSettings.billing.tiers.enterprise.features.security
workspaceSettings.billing.tiers.enterprise.features.sla
workspaceSettings.general.errors.nameRequired
workspaceSettings.general.errors.nameMinLength
workspaceSettings.general.errors.invalidUrl
workspaceSettings.general.logoAlt
workspaceSettings.general.logoHelperText
workspaceSettings.general.url
workspaceSettings.general.urlHelperText
workspaceSettings.integrations.apiKeys.regenerateComingSoon
workspaceSettings.integrations.apiKeys.createComingSoon
workspaceSettings.integrations.apps.slack
workspaceSettings.integrations.apps.zapier
workspaceSettings.integrations.apps.googleSheets
workspaceSettings.integrations.apps.salesforce
workspaceSettings.integrations.apiKeys.emptyTitle
workspaceSettings.integrations.apiKeys.emptyDescription
workspaceSettings.integrations.webhooks.eventsList
workspaceSettings.integrations.webhooks.disabledTitle
workspaceSettings.integrations.webhooks.disabledDescription
workspaceSettings.dangerZone.deleteConfirmation
workspaceSettings.dangerZone.deleteWorkspace
workspaceSettings.errors.loadFailed
workspaceSettings.errors.loadFailedDescription
workspaceSettings.backToWorkspaces

emailTemplates.errors.cannotDeleteDefault
emailTemplates.errors.loadFailed
emailTemplates.errors.loadFailedDescription

validation.invalidEmail
```

---

### Group 6 - Common Keys

**Keys to add to `common` section:**

```
common.done
common.saveChanges
common.copy
common.retry
common.default
common.enabled
common.disabled
common.comingSoon
common.disconnect
common.connect
common.deleting
```

---

## Phase 2: Sync Translations to az.json and ru.json

After adding keys to en.json, add the same keys to:

- `front/src/i18n/locales/az.json` (Azerbaijani translations)
- `front/src/i18n/locales/ru.json` (Russian translations)

Options:

1. Copy English values as placeholders with a `[TODO: AZ]` or `[TODO: RU]` prefix
2. Provide actual translations if known
3. Use a translation service/API to generate initial translations

---

## Phase 3: Review Hardcoded Strings

Review the 42 files with hardcoded strings. Priority files:

| File                                                                | Hardcoded Strings | Priority |
| ------------------------------------------------------------------- | ----------------- | -------- |
| `components/features/recurring-surveys/RecurringScheduleEditor.tsx` | 27+               | High     |
| `components/features/distributions/DistributionStats.tsx`           | 11+               | High     |
| `components/features/responses/ExportDialog.tsx`                    | 9+                | High     |
| `components/features/responses/ResponseDetailDrawer.tsx`            | 14+               | High     |
| `components/features/analytics/NPSGauge.tsx`                        | 6                 | Medium   |
| `components/features/namespaces/MembersManagement.tsx`              | 8                 | Medium   |
| `components/features/email-templates/CreateEmailTemplateDialog.tsx` | 8                 | Medium   |
| `components/features/recurring-surveys/RunHistoryDrawer.tsx`        | 11                | Medium   |
| `components/features/recurring-surveys/RecurringSurveyCard.tsx`     | 8                 | Medium   |

For each hardcoded string:

- If UI-facing text → Add key to en.json and replace with `t('appropriate.key')`
- If technical/code-only → Leave as is
- If placeholder/example content → Consider if it needs translation

---

## Phase 4: Cleanup Unused Keys (Optional)

Review the **1,155 potentially unused keys**. Many may be:

- Used dynamically via template strings like `t(\`prefix.${variable}\`)`
- Reserved for planned features
- Legacy/deprecated code

**Approach:**

1. Search codebase for dynamic usage patterns
2. Check if keys are used in tests
3. Verify against product roadmap
4. Only remove after thorough verification

---

## Execution Checklist

### After completing each group:

- [ ] Run `node scripts/check-localization.cjs` to verify progress
- [ ] Test affected pages in browser (check for missing translation warnings)
- [ ] Verify JSON syntax is valid
- [ ] Commit changes with descriptive message

### Verification commands:

```bash
# Run audit script
cd front && node scripts/check-localization.cjs

# Validate JSON syntax
cat src/i18n/locales/en.json | python3 -m json.tool > /dev/null && echo "Valid JSON"

# Start dev server and check console for i18n warnings
npm run dev
```

---

## Notes

- The `en.json` file is the source of truth
- Keep key naming consistent with existing patterns
- Use nested objects for related keys (e.g., `dialog.title`, `dialog.description`)
- Include context in translation values where helpful
- Test RTL languages if applicable
