# Localization Audit Report

Generated: 2025-12-25T07:59:32.325Z

## Summary

| Metric | Count |
|--------|-------|
| Total keys in en.json | 2336 |
| Unique keys used in code | 1343 |
| Keys used but missing from en.json | 0 |
| Keys defined but not used | 991 |
| Potential hardcoded strings | 257 |

---

## 🚨 Critical: Missing Translation Keys

These translation keys are used in the code but **do not exist** in the locale files:

✅ No missing keys found!

---

## ⚠️ Locale File Comparison

### Missing translations in other locale files

#### az.json

✅ All keys translated!

#### ru.json

✅ All keys translated!

---

## 📝 Potential Hardcoded Strings

These look like English text that might need localization:

Found **169** unique potentially hardcoded strings across 42 files.

### components\ErrorBoundary.tsx

- Line 62: `Something went wrong` (JSX text content)
- Line 63: `An unexpected error has occurred` (JSX text content)
- Line 73: `View stack trace` (JSX text content)

### components\features\analytics\MatrixHeatmap.tsx

- Line 94: `No matrix data available` (Element text)

### components\features\analytics\NPSGauge.tsx

- Line 105: `NPS Score` (Element text)
- Line 74: `Net Promoter Score breakdown` (JSX text content)
- Line 57: `No NPS data available` (JSX text content)
- Line 115: `Detractors` (Element text)
- Line 119: `Passives` (Element text)
- Line 123: `Promoters` (Element text)

### components\features\analytics\QuestionAnalyticsCard.tsx

- Line 124: `No data available` (Element text)
- Line 140: `Analytics visualization not available for this question type` (Element text)

### components\features\analytics\ResponseTrendChart.tsx

- Line 60: `No response data available` (JSX text content)
- Line 76: `Total responses` (Element text)

### components\features\analytics\TextResponsesList.tsx

- Line 42: `No text responses yet` (Element text)

### components\features\distributions\CreateDistributionDialog.tsx

- Line 50: `Click here to take the survey` (JSX text content)
- Line 54: `Best regards` (Element text)
- Line 70: `Sincerely` (Element text)

### components\features\distributions\DistributionStats.tsx

- Line 269: `Distribution Analytics` (Element text)
- Line 279: `Sent` (String prop)
- Line 286: `Delivered` (String prop)
- Line 293: `Opened` (String prop)
- Line 300: `Clicked` (String prop)
- Line 317: `Email performance breakdown` (JSX text content)
- Line 331: `Key metrics comparison` (JSX text content)
- Line 336: `Delivery Rate` (Element text)
- Line 343: `Open Rate` (Element text)
- Line 350: `Click Rate` (Element text)
- ... and 1 more

### components\features\distributions\QRCodeDialog.tsx

- Line 102: `QR Code` (String prop)

### components\features\email-templates\CreateEmailTemplateDialog.tsx

- Line 43: `Click here to take the survey` (JSX text content)
- Line 65: `Take the survey` (JSX text content)
- Line 125: `Create Email Template` (String prop)
- Line 126: `Create a new email template for your survey distributions.` (String prop)
- Line 133: `Template Name` (Element text)
- Line 137: `e.g., Customer Satisfaction Survey Invite` (String prop)
- Line 145: `Template Type` (Element text)
- Line 162: `Default content will be added` (Element text)

### components\features\namespaces\MembersManagement.tsx

- Line 225: `No team members yet` (Element text)
- Line 226: `Invite team members to collaborate on this workspace` (Element text)
- Line 244: `Invite Team Member` (String prop)
- Line 245: `Send an invitation to join this workspace` (String prop)
- Line 252: `Email Address` (String prop)
- Line 254: `colleague@example.com` (String prop)
- Line 263: `Role` (Element text)
- Line 264: `Select a role` (String prop)

### components\features\profile\AvatarUpload.tsx

- Line 216: `Preview` (String prop)

### components\features\public-survey\QuestionCard.tsx

- Line 28: `Required` (Element text)

### components\features\questions\LogicBuilderDialog.tsx

- Line 377: `Delete rule` (String prop)

### components\features\questions\QuestionPreview.tsx

- Line 219: `Date picker` (String prop)
- Line 236: `Drop files here or click to upload` (Element text)

### components\features\recurring-surveys\RecurringScheduleEditor.tsx

- Line 292: `Survey` (String prop)
- Line 293: `Select a published survey...` (String prop)
- Line 310: `Schedule Name` (String prop)
- Line 310: `e.g., Weekly Customer Feedback` (String prop)
- Line 319: `Repeat` (String prop)
- Line 324: `Days of Week` (Element text)
- Line 341: `Select one or more days` (Element text)
- Line 346: `Day of Month` (String prop)
- Line 352: `Cron Expression` (String prop)
- Line 353: `e.g., 0 9 * * MON-FRI` (String prop)
- ... and 17 more

### components\features\recurring-surveys\RecurringSurveyCard.tsx

- Line 72: `More options` (String prop)
- Line 128: `Next Run` (Element text)
- Line 136: `Last Run` (Element text)
- Line 144: `Total Runs` (Element text)
- Line 156: `Pause recurring survey` (String prop)
- Line 169: `Resume recurring survey` (String prop)
- Line 179: `Trigger immediate run` (String prop)
- Line 187: `View run history` (String prop)

### components\features\recurring-surveys\RunHistoryDrawer.tsx

- Line 165: `Run History` (String prop)
- Line 168: `runs` (String prop)
- Line 169: `responses` (String prop)
- Line 179: `Completed` (Element text)
- Line 183: `Failed` (Element text)
- Line 187: `Skipped` (Element text)
- Line 191: `Responses` (Element text)
- Line 207: `Failed to load history` (String prop)
- Line 208: `Something went wrong while loading the run history.` (String prop)
- Line 217: `No runs yet` (String prop)
- ... and 1 more

### components\features\responses\ExportDialog.tsx

- Line 161: `Export Responses` (String prop)
- Line 205: `Include incomplete responses` (String prop)
- Line 206: `Export responses that weren` (String prop)
- Line 211: `Include metadata` (String prop)
- Line 212: `Include submission time, duration, device info, etc.` (String prop)
- Line 236: `Failed to load column options` (Element text)
- Line 243: `Questions` (String prop)
- Line 257: `System Fields` (String prop)
- Line 271: `Metadata` (String prop)

### components\features\responses\ResponseDetailDrawer.tsx

- Line 146: `Required` (Element text)
- Line 205: `Response Details` (String prop)
- Line 209: `answers` (String prop)
- Line 212: `Complete` (String prop)
- Line 214: `Partial` (String prop)
- Line 230: `Failed to load response` (Element text)
- Line 236: `Response Info` (Element text)
- Line 244: `Respondent` (Element text)
- Line 252: `Response ID` (Element text)
- Line 260: `Started` (Element text)
- ... and 4 more


... and 22 more files with hardcoded strings

---

## 🗑️ Potentially Unused Keys

These keys are defined in en.json but not found in the codebase:

Found **991** potentially unused keys:

> Note: Some keys might be used dynamically (e.g., `t(`prefix.${var}`)`) and won't be detected.

<details>
<summary>accessibility (15 keys)</summary>

- `accessibility.openMenu`
- `accessibility.closeMenu`
- `accessibility.toggleSidebar`
- `accessibility.notifications`
- `accessibility.userMenu`
- `accessibility.search`
- `accessibility.gridView`
- `accessibility.listView`
- `accessibility.viewMode`
- `accessibility.dragHandle`
- `accessibility.sortable`
- `accessibility.expandSection`
- `accessibility.collapseSection`
- `accessibility.selectLanguage`
- `accessibility.changeLanguage`

</details>

<details>
<summary>analytics (6 keys)</summary>

- `analytics.overview`
- `analytics.responseRate`
- `analytics.completionRate`
- `analytics.averageTime`
- `analytics.totalViews`
- `analytics.noData`

</details>

<details>
<summary>apiKeys (21 keys)</summary>

- `apiKeys.description`
- `apiKeys.createKey`
- `apiKeys.createNew`
- `apiKeys.keyName`
- `apiKeys.keyNamePlaceholder`
- `apiKeys.permissions`
- `apiKeys.selectScopes`
- `apiKeys.noKeys`
- `apiKeys.noKeysDesc`
- `apiKeys.keyCreated`
- `apiKeys.keyCreatedDesc`
- `apiKeys.copyKey`
- `apiKeys.keyCopied`
- `apiKeys.deleteKey`
- `apiKeys.deleteKeyConfirm`
- `apiKeys.keyDeleted`
- `apiKeys.scopes.surveys:read`
- `apiKeys.scopes.surveys:write`
- `apiKeys.scopes.responses:read`
- `apiKeys.scopes.responses:write`
- `apiKeys.scopes.analytics:read`

</details>

<details>
<summary>auth (9 keys)</summary>

- `auth.login`
- `auth.register`
- `auth.firstName`
- `auth.lastName`
- `auth.resetPassword`
- `auth.newPassword`
- `auth.currentPassword`
- `auth.passwordResetSent`
- `auth.passwordResetSuccess`

</details>

<details>
<summary>avatar (1 keys)</summary>

- `avatar.uploadBtn`

</details>

<details>
<summary>avatarUpload (9 keys)</summary>

- `avatarUpload.change`
- `avatarUpload.remove`
- `avatarUpload.maxSize`
- `avatarUpload.title`
- `avatarUpload.description`
- `avatarUpload.errors.tooLarge`
- `avatarUpload.errors.invalidType`
- `avatarUpload.errors.uploadFailed`
- `avatarUpload.errors.removeFailed`

</details>

<details>
<summary>charts (1 keys)</summary>

- `charts.responseCount_plural`

</details>

<details>
<summary>common (19 keys)</summary>

- `common.create`
- `common.confirm`
- `common.next`
- `common.previous`
- `common.submit`
- `common.filter`
- `common.actions`
- `common.name`
- `common.title`
- `common.type`
- `common.required`
- `common.no`
- `common.none`
- `common.noResults`
- `common.error`
- `common.success`
- `common.warning`
- `common.info`
- `common.dismissNotification`

</details>

<details>
<summary>conditionalLogic (26 keys)</summary>

- `conditionalLogic.enableLogic`
- `conditionalLogic.deleteRule`
- `conditionalLogic.editRule`
- `conditionalLogic.and`
- `conditionalLogic.or`
- `conditionalLogic.jumpTo`
- `conditionalLogic.equals`
- `conditionalLogic.notEquals`
- `conditionalLogic.contains`
- `conditionalLogic.greaterThan`
- `conditionalLogic.lessThan`
- `conditionalLogic.isEmpty`
- `conditionalLogic.isNotEmpty`
- `conditionalLogic.isAnswered`
- `conditionalLogic.isNotAnswered`
- `conditionalLogic.after`
- `conditionalLogic.before`
- `conditionalLogic.operators.isAnswered`
- `conditionalLogic.operators.isNotAnswered`
- `conditionalLogic.operators.equals`
- `conditionalLogic.operators.notEquals`
- `conditionalLogic.operators.contains`
- `conditionalLogic.operators.greaterThan`
- `conditionalLogic.operators.lessThan`
- `conditionalLogic.operators.after`
- `conditionalLogic.operators.before`

</details>

<details>
<summary>createDistribution (1 keys)</summary>

- `createDistribution.recipientsAdded_plural`

</details>

<details>
<summary>createTemplate (20 keys)</summary>

- `createTemplate.title`
- `createTemplate.modes.scratch.name`
- `createTemplate.modes.scratch.description`
- `createTemplate.modes.survey.name`
- `createTemplate.modes.survey.description`
- `createTemplate.selectSurvey`
- `createTemplate.selectSurveyPlaceholder`
- `createTemplate.templateName`
- `createTemplate.templateNamePlaceholder`
- `createTemplate.description`
- `createTemplate.descriptionPlaceholder`
- `createTemplate.descriptionHelper`
- `createTemplate.category`
- `createTemplate.visibility.public.name`
- `createTemplate.visibility.public.description`
- `createTemplate.visibility.private.name`
- `createTemplate.visibility.private.description`
- `createTemplate.createButton`
- `createTemplate.createSuccess`
- `createTemplate.createError`

</details>

<details>
<summary>distributionAnalytics (13 keys)</summary>

- `distributionAnalytics.title`
- `distributionAnalytics.refresh`
- `distributionAnalytics.status.draft`
- `distributionAnalytics.status.scheduled`
- `distributionAnalytics.status.sending`
- `distributionAnalytics.status.sent`
- `distributionAnalytics.status.failed`
- `distributionAnalytics.status.cancelled`
- `distributionAnalytics.status.partiallyFailed`
- `distributionAnalytics.stats.delivered`
- `distributionAnalytics.stats.deliveryRate`
- `distributionAnalytics.stats.openRate`
- `distributionAnalytics.stats.clickRate`

</details>

<details>
<summary>distributions (6 keys)</summary>

- `distributions.title`
- `distributions.copyLink`
- `distributions.emailCampaign`
- `distributions.qrCode`
- `distributions.embedCode`
- `distributions.socialShare`

</details>

<details>
<summary>editors (60 keys)</summary>

- `editors.common.questionText`
- `editors.common.questionTextPlaceholder`
- `editors.common.description`
- `editors.common.descriptionPlaceholder`
- `editors.common.descriptionHelper`
- `editors.common.placeholder`
- `editors.common.placeholderInput`
- `editors.common.placeholderHelper`
- `editors.common.maxCharacters`
- `editors.common.preview`
- `editors.text.helper`
- `editors.textarea.helper`
- `editors.textarea.placeholderHelper`
- `editors.number.helper`
- `editors.number.placeholderDefault`
- `editors.number.minValue`
- `editors.number.minPlaceholder`
- `editors.number.minHelper`
- `editors.number.maxValue`
- `editors.number.maxPlaceholder`
- `editors.number.maxHelper`
- `editors.email.helper`
- `editors.email.placeholderDefault`
- `editors.email.errorMessage`
- `editors.email.errorPlaceholder`
- `editors.email.errorHelper`
- `editors.phone.helper`
- `editors.phone.format`
- `editors.url.helper`
- `editors.url.placeholderDefault`
- ... and 30 more

</details>

<details>
<summary>emailDistribution (28 keys)</summary>

- `emailDistribution.title`
- `emailDistribution.createNew`
- `emailDistribution.steps.recipients`
- `emailDistribution.steps.compose`
- `emailDistribution.steps.schedule`
- `emailDistribution.steps.review`
- `emailDistribution.recipients.title`
- `emailDistribution.recipients.description`
- `emailDistribution.recipients.noRecipients`
- `emailDistribution.recipients.addManually`
- `emailDistribution.recipients.importCsv`
- `emailDistribution.recipients.dropCsv`
- `emailDistribution.recipients.orClickBrowse`
- `emailDistribution.recipients.alreadyInList`
- `emailDistribution.recipients.invalidEmail`
- `emailDistribution.recipients.duplicateEmail`
- `emailDistribution.compose.title`
- `emailDistribution.compose.description`
- `emailDistribution.compose.subject`
- `emailDistribution.compose.fromName`
- `emailDistribution.compose.fromNamePlaceholder`
- `emailDistribution.compose.replyTo`
- `emailDistribution.compose.preview`
- `emailDistribution.schedule.title`
- `emailDistribution.schedule.description`
- `emailDistribution.schedule.sendNow`
- `emailDistribution.schedule.sendLater`
- `emailDistribution.schedule.scheduledFor`

</details>

<details>
<summary>emailTemplates (46 keys)</summary>

- `emailTemplates.retry`
- `emailTemplates.tabs.all`
- `emailTemplates.tabs.invitation`
- `emailTemplates.tabs.reminder`
- `emailTemplates.tabs.thankYou`
- `emailTemplates.tabs.custom`
- `emailTemplates.empty.title`
- `emailTemplates.empty.description`
- `emailTemplates.empty.createButton`
- `emailTemplates.loadError.title`
- `emailTemplates.loadError.description`
- `emailTemplates.defaultBadge`
- `emailTemplates.form.title`
- `emailTemplates.form.description`
- `emailTemplates.form.name`
- `emailTemplates.form.namePlaceholder`
- `emailTemplates.form.defaultContentInfo`
- `emailTemplates.form.defaultContentDesc`
- `emailTemplates.form.createButton`
- `emailTemplates.editor.body`
- `emailTemplates.editor.split`
- `emailTemplates.editor.saveChanges`
- `emailTemplates.editor.saving`
- `emailTemplates.editor.toolbar.underline`
- `emailTemplates.editor.placeholderInserted`
- `emailTemplates.editor.placeholderCopied`
- `emailTemplates.editor.validation.nameRequired`
- `emailTemplates.editor.validation.subjectRequired`
- `emailTemplates.editor.validation.bodyRequired`
- `emailTemplates.editor.saveSuccess`
- ... and 16 more

</details>

<details>
<summary>emailWizard (11 keys)</summary>

- `emailWizard.title`
- `emailWizard.description`
- `emailWizard.steps.recipients.title`
- `emailWizard.steps.recipients.description`
- `emailWizard.steps.content.title`
- `emailWizard.steps.content.description`
- `emailWizard.steps.schedule.title`
- `emailWizard.steps.schedule.description`
- `emailWizard.scheduleSuccess`
- `emailWizard.sendSuccess`
- `emailWizard.createError`

</details>

<details>
<summary>errorBoundary (4 keys)</summary>

- `errorBoundary.viewStackTrace`
- `errorBoundary.refreshMessage`
- `errorBoundary.goHome`
- `errorBoundary.tryAgain`

</details>

<details>
<summary>errors (2 keys)</summary>

- `errors.networkError`
- `errors.networkErrorDesc`

</details>

<details>
<summary>forgotPassword (13 keys)</summary>

- `forgotPassword.form.title`
- `forgotPassword.form.description`
- `forgotPassword.form.email`
- `forgotPassword.form.emailPlaceholder`
- `forgotPassword.form.submit`
- `forgotPassword.form.backToLogin`
- `forgotPassword.success.title`
- `forgotPassword.success.description`
- `forgotPassword.success.instruction`
- `forgotPassword.success.tryAgain`
- `forgotPassword.success.backToLogin`
- `forgotPassword.error.title`
- `forgotPassword.error.generic`

</details>

<details>
<summary>linkAnalytics (6 keys)</summary>

- `linkAnalytics.geographic`
- `linkAnalytics.devices`
- `linkAnalytics.created`
- `linkAnalytics.lastAccessed`
- `linkAnalytics.name`
- `linkAnalytics.noDataYet`

</details>

<details>
<summary>linkAnalyticsPanel (14 keys)</summary>

- `linkAnalyticsPanel.title`
- `linkAnalyticsPanel.description`
- `linkAnalyticsPanel.views`
- `linkAnalyticsPanel.unique`
- `linkAnalyticsPanel.geographic`
- `linkAnalyticsPanel.noGeographicData`
- `linkAnalyticsPanel.devices`
- `linkAnalyticsPanel.noDeviceData`
- `linkAnalyticsPanel.trafficSources`
- `linkAnalyticsPanel.noReferrerData`
- `linkAnalyticsPanel.directTraffic`
- `linkAnalyticsPanel.loadError.title`
- `linkAnalyticsPanel.loadError.description`
- `linkAnalyticsPanel.loadError.retry`

</details>

<details>
<summary>linkGenerator (13 keys)</summary>

- `linkGenerator.title`
- `linkGenerator.description`
- `linkGenerator.linkName`
- `linkGenerator.expiration`
- `linkGenerator.expirationDesc`
- `linkGenerator.responseLimit`
- `linkGenerator.responseLimitDesc`
- `linkGenerator.responseLimitPlaceholder`
- `linkGenerator.passwordProtection`
- `linkGenerator.passwordProtectionDesc`
- `linkGenerator.passwordPlaceholder`
- `linkGenerator.createSuccess`
- `linkGenerator.createError`

</details>

<details>
<summary>linksPanel (35 keys)</summary>

- `linksPanel.types.standardObj.name`
- `linksPanel.types.standardObj.description`
- `linksPanel.types.anonymous.name`
- `linksPanel.types.anonymous.description`
- `linksPanel.types.tracked.name`
- `linksPanel.types.tracked.description`
- `linksPanel.types.passwordProtected.name`
- `linksPanel.types.passwordProtected.description`
- `linksPanel.tooltips.passwordProtected`
- `linksPanel.tooltips.copyLink`
- `linksPanel.tooltips.responses`
- `linksPanel.tooltips.expires`
- `linksPanel.tooltips.expired`
- `linksPanel.tooltips.viewAnalytics`
- `linksPanel.tooltips.editLink`
- `linksPanel.menu.viewAnalytics`
- `linksPanel.menu.copyLink`
- `linksPanel.menu.editLink`
- `linksPanel.menu.deactivate`
- `linksPanel.menu.reactivate`
- `linksPanel.empty.title`
- `linksPanel.empty.description`
- `linksPanel.linkCopied`
- `linksPanel.linkCopyError`
- `linksPanel.deactivateConfirm.title`
- `linksPanel.deactivateConfirm.description`
- `linksPanel.deactivateConfirm.confirm`
- `linksPanel.reactivateConfirm.title`
- `linksPanel.reactivateConfirm.description`
- `linksPanel.reactivateConfirm.confirm`
- ... and 5 more

</details>

<details>
<summary>navigation (1 keys)</summary>

- `navigation.openMenu`

</details>

<details>
<summary>notifications (12 keys)</summary>

- `notifications.pushNotifications`
- `notifications.settings.newResponses.title`
- `notifications.settings.newResponses.description`
- `notifications.settings.surveyMilestones.title`
- `notifications.settings.surveyMilestones.description`
- `notifications.settings.teamActivity.title`
- `notifications.settings.teamActivity.description`
- `notifications.settings.productUpdates.title`
- `notifications.settings.productUpdates.description`
- `notifications.settings.securityAlerts.title`
- `notifications.settings.securityAlerts.description`
- `notifications.saveSuccess`

</details>

<details>
<summary>passwordChange (2 keys)</summary>

- `passwordChange.success`
- `passwordChange.error`

</details>

<details>
<summary>passwordForm (8 keys)</summary>

- `passwordForm.title`
- `passwordForm.description`
- `passwordForm.successMessage`
- `passwordForm.currentPassword`
- `passwordForm.newPassword`
- `passwordForm.changeSuccess`
- `passwordForm.changeError`
- `passwordForm.genericError`

</details>

<details>
<summary>profile (5 keys)</summary>

- `profile.updateSuccess`
- `profile.updateError`
- `profile.avatar.change`
- `profile.avatar.dragDrop`
- `profile.avatar.orClick`

</details>

<details>
<summary>profileForm (6 keys)</summary>

- `profileForm.title`
- `profileForm.description`
- `profileForm.updateSuccess`
- `profileForm.updateError`
- `profileForm.removeAvatarSuccess`
- `profileForm.removeAvatarError`

</details>

<details>
<summary>publicSurvey (6 keys)</summary>

- `publicSurvey.submit`
- `publicSurvey.submitSuccess`
- `publicSurvey.required`
- `publicSurvey.surveyNotFound`
- `publicSurvey.surveyClosed`
- `publicSurvey.alreadySubmitted`

</details>

<details>
<summary>publicSurveyPage (1 keys)</summary>

- `publicSurveyPage.defaultTitle`

</details>

<details>
<summary>qrCode (16 keys)</summary>

- `qrCode.title`
- `qrCode.download`
- `qrCode.print`
- `qrCode.style.light`
- `qrCode.style.dark`
- `qrCode.style.brand`
- `qrCode.filename`
- `qrCode.filenamePlaceholder`
- `qrCode.downloadAs`
- `qrCode.printQR`
- `qrCode.close`
- `qrCode.tips.title`
- `qrCode.tips.tip1`
- `qrCode.tips.tip2`
- `qrCode.tips.tip3`
- `qrCode.tips.tip4`

</details>

<details>
<summary>qrGenerator (22 keys)</summary>

- `qrGenerator.title`
- `qrGenerator.description`
- `qrGenerator.theme`
- `qrGenerator.themes.light`
- `qrGenerator.themes.dark`
- `qrGenerator.themes.brand`
- `qrGenerator.sizes.small`
- `qrGenerator.sizes.medium`
- `qrGenerator.sizes.large`
- `qrGenerator.sizes.xlarge`
- `qrGenerator.filename`
- `qrGenerator.filenamePlaceholder`
- `qrGenerator.download`
- `qrGenerator.print`
- `qrGenerator.printTips.title`
- `qrGenerator.printTips.tip1`
- `qrGenerator.printTips.tip2`
- `qrGenerator.printTips.tip3`
- `qrGenerator.printTips.tip4`
- `qrGenerator.downloadSuccess`
- `qrGenerator.downloadError`
- `qrGenerator.printError`

</details>

<details>
<summary>questionCategories (3 keys)</summary>

- `questionCategories.text`
- `questionCategories.input`
- `questionCategories.date`

</details>

<details>
<summary>questionDefaults (15 keys)</summary>

- `questionDefaults.rating.minLabel`
- `questionDefaults.rating.maxLabel`
- `questionDefaults.scale.minLabel`
- `questionDefaults.scale.maxLabel`
- `questionDefaults.nps.minLabel`
- `questionDefaults.nps.maxLabel`
- `questionDefaults.matrix.row`
- `questionDefaults.matrix.column`
- `questionDefaults.placeholders.text`
- `questionDefaults.placeholders.email`
- `questionDefaults.placeholders.number`
- `questionDefaults.placeholders.longText`
- `questionDefaults.options.option`
- `questionDefaults.options.yes`
- `questionDefaults.options.no`

</details>

<details>
<summary>questionEditor (52 keys)</summary>

- `questionEditor.addQuestion`
- `questionEditor.closeMenu`
- `questionEditor.searchTypes`
- `questionEditor.noTypesFound`
- `questionEditor.tryDifferentSearch`
- `questionEditor.dragToReorder`
- `questionEditor.toggleOptions`
- `questionEditor.required`
- `questionEditor.questionText`
- `questionEditor.questionDescription`
- `questionEditor.placeholder`
- `questionEditor.questionNumber`
- `questionEditor.helperText.text`
- `questionEditor.helperText.textarea`
- `questionEditor.helperText.number`
- `questionEditor.helperText.email`
- `questionEditor.helperText.phone`
- `questionEditor.helperText.date`
- `questionEditor.helperText.time`
- `questionEditor.helperText.select`
- `questionEditor.helperText.radio`
- `questionEditor.helperText.checkbox`
- `questionEditor.helperText.rating`
- `questionEditor.helperText.scale`
- `questionEditor.helperText.ranking`
- `questionEditor.helperText.matrix`
- `questionEditor.helperText.file`
- `questionEditor.text.placeholderDefault`
- `questionEditor.phone.validationMessage`
- `questionEditor.phone.validationPlaceholder`
- ... and 22 more

</details>

<details>
<summary>questionTypes (30 keys)</summary>

- `questionTypes.text.name`
- `questionTypes.text.description`
- `questionTypes.textarea.name`
- `questionTypes.textarea.description`
- `questionTypes.number.name`
- `questionTypes.number.description`
- `questionTypes.email.name`
- `questionTypes.email.description`
- `questionTypes.phone.name`
- `questionTypes.phone.description`
- `questionTypes.date.name`
- `questionTypes.date.description`
- `questionTypes.time.name`
- `questionTypes.time.description`
- `questionTypes.select.name`
- `questionTypes.select.description`
- `questionTypes.radio.name`
- `questionTypes.radio.description`
- `questionTypes.checkbox.name`
- `questionTypes.checkbox.description`
- `questionTypes.rating.name`
- `questionTypes.rating.description`
- `questionTypes.scale.name`
- `questionTypes.scale.description`
- `questionTypes.matrix.name`
- `questionTypes.matrix.description`
- `questionTypes.file.name`
- `questionTypes.file.description`
- `questionTypes.nps.name`
- `questionTypes.nps.description`

</details>

<details>
<summary>questions (22 keys)</summary>

- `questions.addQuestion`
- `questions.editQuestion`
- `questions.deleteQuestion`
- `questions.questionText`
- `questions.questionType`
- `questions.required`
- `questions.types.text`
- `questions.types.textarea`
- `questions.types.number`
- `questions.types.email`
- `questions.types.phone`
- `questions.types.date`
- `questions.types.time`
- `questions.types.select`
- `questions.types.radio`
- `questions.types.checkbox`
- `questions.types.rating`
- `questions.types.scale`
- `questions.types.file`
- `questions.options`
- `questions.addOption`
- `questions.placeholder`

</details>

<details>
<summary>recipientImporter (4 keys)</summary>

- `recipientImporter.recipientCount_plural`
- `recipientImporter.validEmails_plural`
- `recipientImporter.duplicatesSkipped_plural`
- `recipientImporter.invalidEmails_plural`

</details>

<details>
<summary>recipientInput (5 keys)</summary>

- `recipientInput.placeholder`
- `recipientInput.errors.empty`
- `recipientInput.errors.invalid`
- `recipientInput.errors.duplicate`
- `recipientInput.errors.maxReached`

</details>

<details>
<summary>recurringSurveys (20 keys)</summary>

- `recurringSurveys.editSchedule`
- `recurringSurveys.noUpcoming`
- `recurringSurveys.pause`
- `recurringSurveys.resume`
- `recurringSurveys.viewHistory`
- `recurringSurveys.runHistory`
- `recurringSurveys.responsesCollected`
- `recurringSurveys.empty.title`
- `recurringSurveys.empty.description`
- `recurringSurveys.notRunYet`
- `recurringSurveys.form.selectSurvey`
- `recurringSurveys.form.surveyRequired`
- `recurringSurveys.form.scheduleName`
- `recurringSurveys.form.frequency`
- `recurringSurveys.form.startDate`
- `recurringSurveys.form.endDate`
- `recurringSurveys.form.time`
- `recurringSurveys.form.timezone`
- `recurringSurveys.form.activeByDefault`
- `recurringSurveys.form.activeByDefaultDesc`

</details>

<details>
<summary>register (11 keys)</summary>

- `register.form.firstName`
- `register.form.firstNamePlaceholder`
- `register.form.lastName`
- `register.form.lastNamePlaceholder`
- `register.form.email`
- `register.form.emailPlaceholder`
- `register.form.password`
- `register.form.passwordPlaceholder`
- `register.form.meetsRequirements`
- `register.validation.firstNameRequired`
- `register.validation.lastNameRequired`

</details>

<details>
<summary>resetPassword (12 keys)</summary>

- `resetPassword.invalidLink.requestNew`
- `resetPassword.invalidLink.backToLogin`
- `resetPassword.form.title`
- `resetPassword.form.description`
- `resetPassword.form.newPassword`
- `resetPassword.form.newPasswordPlaceholder`
- `resetPassword.form.confirmPassword`
- `resetPassword.form.confirmPasswordPlaceholder`
- `resetPassword.form.submit`
- `resetPassword.form.meetsRequirements`
- `resetPassword.error.title`
- `resetPassword.error.generic`

</details>

<details>
<summary>responses (33 keys)</summary>

- `responses.responseDetails`
- `responses.submittedAt`
- `responses.exportAll`
- `responses.responseInfo`
- `responses.responseId`
- `responses.started`
- `responses.device`
- `responses.location`
- `responses.answers`
- `responses.noAnswers`
- `responses.deleteResponse.title`
- `responses.deleteResponse.description`
- `responses.deleteResponse.confirm`
- `responses.deleteResponse.cancel`
- `responses.deleteSuccess`
- `responses.deleteError`
- `responses.na`
- `responses.direct`
- `responses.noFiles`
- `responses.exportDialog.title`
- `responses.exportDialog.description`
- `responses.exportDialog.format`
- `responses.exportDialog.columns`
- `responses.exportDialog.filters`
- `responses.exportDialog.formats.csv`
- `responses.exportDialog.formats.csvDesc`
- `responses.exportDialog.formats.excel`
- `responses.exportDialog.formats.excelDesc`
- `responses.exportDialog.formats.pdf`
- `responses.exportDialog.formats.pdfDesc`
- ... and 3 more

</details>

<details>
<summary>settings (33 keys)</summary>

- `settings.profile.description`
- `settings.profile.firstName`
- `settings.profile.lastName`
- `settings.profile.email`
- `settings.profile.avatar`
- `settings.profile.changeAvatar`
- `settings.profile.removeAvatar`
- `settings.profile.saveChanges`
- `settings.profile.updateSuccess`
- `settings.security.description`
- `settings.security.changePassword`
- `settings.security.currentPassword`
- `settings.security.newPassword`
- `settings.security.confirmPassword`
- `settings.security.twoFactor`
- `settings.security.twoFactorDesc`
- `settings.security.passwordChanged`
- `settings.security.scopes.surveysRead`
- `settings.security.scopes.surveysReadDesc`
- `settings.security.scopes.surveysWrite`
- `settings.security.scopes.surveysWriteDesc`
- `settings.security.scopes.responsesRead`
- `settings.security.scopes.responsesReadDesc`
- `settings.security.scopes.responsesWrite`
- `settings.security.scopes.responsesWriteDesc`
- `settings.security.scopes.analyticsRead`
- `settings.security.scopes.analyticsReadDesc`
- `settings.notifications.title`
- `settings.notifications.description`
- `settings.notifications.emailNotifications`
- ... and 3 more

</details>

<details>
<summary>surveyBuilder (3 keys)</summary>

- `surveyBuilder.title`
- `surveyBuilder.keepEditing`
- `surveyBuilder.themes`

</details>

<details>
<summary>surveyLinks (34 keys)</summary>

- `surveyLinks.title`
- `surveyLinks.createLink`
- `surveyLinks.generateLink`
- `surveyLinks.bulkGenerate`
- `surveyLinks.copyLink`
- `surveyLinks.linkCopied`
- `surveyLinks.linkCopyError`
- `surveyLinks.expirationDate`
- `surveyLinks.noExpiration`
- `surveyLinks.responseLimit`
- `surveyLinks.responseLimitDesc`
- `surveyLinks.unlimited`
- `surveyLinks.passwordProtection`
- `surveyLinks.passwordProtectionDesc`
- `surveyLinks.password`
- `surveyLinks.trackCampaign`
- `surveyLinks.utmParameters`
- `surveyLinks.utmSource`
- `surveyLinks.utmMedium`
- `surveyLinks.utmCampaign`
- `surveyLinks.bulkLinks.title`
- `surveyLinks.bulkLinks.description`
- `surveyLinks.bulkLinks.numberOfLinks`
- `surveyLinks.bulkLinks.prefix`
- `surveyLinks.bulkLinks.generate`
- `surveyLinks.bulkLinks.download`
- `surveyLinks.status.active`
- `surveyLinks.status.inactive`
- `surveyLinks.status.expired`
- `surveyLinks.status.limitReached`
- ... and 4 more

</details>

<details>
<summary>surveyPreview (5 keys)</summary>

- `surveyPreview.submitPreview`
- `surveyPreview.desktop`
- `surveyPreview.tablet`
- `surveyPreview.mobile`
- `surveyPreview.testSubmitError`

</details>

<details>
<summary>surveys (14 keys)</summary>

- `surveys.editSurvey`
- `surveys.deleteSurvey`
- `surveys.duplicateSurvey`
- `surveys.archiveSurvey`
- `surveys.surveyDescription`
- `surveys.status.published`
- `surveys.empty.title`
- `surveys.empty.description`
- `surveys.empty.searchTitle`
- `surveys.empty.searchDescription`
- `surveys.deleteConfirm.title`
- `surveys.deleteConfirm.description`
- `surveys.form.createButton`
- `surveys.form.updateButton`

</details>

<details>
<summary>teamMembers (20 keys)</summary>

- `teamMembers.title`
- `teamMembers.description`
- `teamMembers.inviteMember`
- `teamMembers.you`
- `teamMembers.roles.admin`
- `teamMembers.roles.member`
- `teamMembers.roles.viewer`
- `teamMembers.removeConfirm.title`
- `teamMembers.removeConfirm.description`
- `teamMembers.removeConfirm.confirm`
- `teamMembers.inviteSuccess`
- `teamMembers.removeSuccess`
- `teamMembers.inviteError`
- `teamMembers.removeError`
- `teamMembers.loadError`
- `teamMembers.tryAgain`
- `teamMembers.empty.title`
- `teamMembers.empty.description`
- `teamMembers.validation.emailRequired`
- `teamMembers.validation.emailInvalid`

</details>

<details>
<summary>templatePreview (24 keys)</summary>

- `templatePreview.title`
- `templatePreview.uses`
- `templatePreview.public`
- `templatePreview.private`
- `templatePreview.questions`
- `templatePreview.questionTypes.text`
- `templatePreview.questionTypes.textarea`
- `templatePreview.questionTypes.number`
- `templatePreview.questionTypes.email`
- `templatePreview.questionTypes.phone`
- `templatePreview.questionTypes.date`
- `templatePreview.questionTypes.time`
- `templatePreview.questionTypes.select`
- `templatePreview.questionTypes.radio`
- `templatePreview.questionTypes.checkbox`
- `templatePreview.questionTypes.rating`
- `templatePreview.questionTypes.scale`
- `templatePreview.questionTypes.ranking`
- `templatePreview.questionTypes.matrix`
- `templatePreview.questionTypes.file`
- `templatePreview.questionTypes.nps`
- `templatePreview.empty.title`
- `templatePreview.empty.description`
- `templatePreview.useButton`

</details>

<details>
<summary>templates (9 keys)</summary>

- `templates.useTemplate`
- `templates.categories.all`
- `templates.categories.feedback`
- `templates.categories.research`
- `templates.categories.hr`
- `templates.categories.education`
- `templates.categories.marketing`
- `templates.empty.title`
- `templates.empty.description`

</details>

<details>
<summary>themeCard (8 keys)</summary>

- `themeCard.default`
- `themeCard.selected`
- `themeCard.buttons`
- `themeCard.outline`
- `themeCard.menu.edit`
- `themeCard.menu.duplicate`
- `themeCard.menu.setDefault`
- `themeCard.menu.delete`

</details>

<details>
<summary>themeEditor (30 keys)</summary>

- `themeEditor.title`
- `themeEditor.namePlaceholder`
- `themeEditor.presets.violet`
- `themeEditor.presets.ocean`
- `themeEditor.presets.forest`
- `themeEditor.presets.sunset`
- `themeEditor.presets.minimal`
- `themeEditor.presets.dark`
- `themeEditor.typography.fontFamily`
- `themeEditor.typography.baseFontSize`
- `themeEditor.typography.buttonStyle`
- `themeEditor.typography.buttonStyles.rounded`
- `themeEditor.typography.buttonStyles.pill`
- `themeEditor.typography.buttonStyles.square`
- `themeEditor.typography.sizes.small`
- `themeEditor.typography.sizes.default`
- `themeEditor.typography.sizes.large`
- `themeEditor.typography.sizes.xlarge`
- `themeEditor.branding.logoUrl`
- `themeEditor.branding.logoPlaceholder`
- `themeEditor.branding.logoHelper`
- `themeEditor.branding.backgroundImage`
- `themeEditor.branding.backgroundPlaceholder`
- `themeEditor.branding.backgroundHelper`
- `themeEditor.advanced.customCss`
- `themeEditor.advanced.cssPlaceholder`
- `themeEditor.advanced.cssHelper`
- `themeEditor.advanced.cssPreview`
- `themeEditor.saveSuccess`
- `themeEditor.saveError`

</details>

<details>
<summary>themes (12 keys)</summary>

- `themes.title`
- `themes.editTheme`
- `themes.deleteTheme`
- `themes.applyTheme`
- `themes.themeName`
- `themes.preview`
- `themes.primaryColor`
- `themes.backgroundColor`
- `themes.textColor`
- `themes.empty.title`
- `themes.empty.description`
- `themes.savedThemes`

</details>

<details>
<summary>time (6 keys)</summary>

- `time.justNow`
- `time.minutesAgo`
- `time.hoursAgo`
- `time.daysAgo`
- `time.weeksAgo`
- `time.monthsAgo`

</details>

<details>
<summary>twoFactor (1 keys)</summary>

- `twoFactor.disabled`

</details>

<details>
<summary>useTemplate (11 keys)</summary>

- `useTemplate.title`
- `useTemplate.description`
- `useTemplate.explanation`
- `useTemplate.surveyName`
- `useTemplate.surveyNamePlaceholder`
- `useTemplate.surveyDescription`
- `useTemplate.surveyDescriptionPlaceholder`
- `useTemplate.createButton`
- `useTemplate.info`
- `useTemplate.createSuccess`
- `useTemplate.createError`

</details>

<details>
<summary>validation (9 keys)</summary>

- `validation.email`
- `validation.phone`
- `validation.url`
- `validation.minLength`
- `validation.maxLength`
- `validation.maxCharacters`
- `validation.passwordMismatch`
- `validation.invalidFormat`
- `validation.invalidAnswer`

</details>

<details>
<summary>welcomeScreen (1 keys)</summary>

- `welcomeScreen.questions_plural`

</details>

<details>
<summary>workspaceForm (22 keys)</summary>

- `workspaceForm.title`
- `workspaceForm.description`
- `workspaceForm.name`
- `workspaceForm.namePlaceholder`
- `workspaceForm.slug`
- `workspaceForm.slugPlaceholder`
- `workspaceForm.slugHelper`
- `workspaceForm.descriptionLabel`
- `workspaceForm.descriptionPlaceholder`
- `workspaceForm.proTip`
- `workspaceForm.proTipText`
- `workspaceForm.createButton`
- `workspaceForm.creating`
- `workspaceForm.createSuccess`
- `workspaceForm.createError`
- `workspaceForm.validation.nameRequired`
- `workspaceForm.validation.nameMinLength`
- `workspaceForm.validation.nameMaxLength`
- `workspaceForm.validation.slugRequired`
- `workspaceForm.validation.slugFormat`
- `workspaceForm.validation.slugMinLength`
- `workspaceForm.validation.slugMaxLength`

</details>

<details>
<summary>workspaceSettings (62 keys)</summary>

- `workspaceSettings.title`
- `workspaceSettings.back`
- `workspaceSettings.general.logoHelper`
- `workspaceSettings.general.logoPlaceholder`
- `workspaceSettings.general.slug`
- `workspaceSettings.general.slugHelper`
- `workspaceSettings.general.saving`
- `workspaceSettings.general.saveChanges`
- `workspaceSettings.general.updateSuccess`
- `workspaceSettings.general.updateError`
- `workspaceSettings.validation.nameRequired`
- `workspaceSettings.validation.nameMinLength`
- `workspaceSettings.validation.slugRequired`
- `workspaceSettings.billing.tierDescriptions.free`
- `workspaceSettings.billing.tierDescriptions.pro`
- `workspaceSettings.billing.tierDescriptions.enterprise`
- `workspaceSettings.billing.features.surveys3`
- `workspaceSettings.billing.features.responses100`
- `workspaceSettings.billing.features.basicAnalytics`
- `workspaceSettings.billing.features.teamMembers1`
- `workspaceSettings.billing.features.unlimitedSurveys`
- `workspaceSettings.billing.features.responses10000`
- `workspaceSettings.billing.features.advancedAnalytics`
- `workspaceSettings.billing.features.teamMembers10`
- `workspaceSettings.billing.features.customBranding`
- `workspaceSettings.billing.features.prioritySupport`
- `workspaceSettings.billing.features.unlimitedEverything`
- `workspaceSettings.billing.features.customIntegrations`
- `workspaceSettings.billing.features.dedicatedSupport`
- `workspaceSettings.billing.features.ssoSecurity`
- ... and 32 more

</details>

<details>
<summary>workspaces (22 keys)</summary>

- `workspaces.editWorkspace`
- `workspaces.workspaceName`
- `workspaces.members`
- `workspaces.inviteMember`
- `workspaces.role`
- `workspaces.empty.title`
- `workspaces.empty.description`
- `workspaces.team.inviteTitle`
- `workspaces.team.inviteDescription`
- `workspaces.team.emailLabel`
- `workspaces.team.emailPlaceholder`
- `workspaces.team.roleLabel`
- `workspaces.team.selectRole`
- `workspaces.team.roleDescriptions.admin`
- `workspaces.team.roleDescriptions.member`
- `workspaces.team.roleDescriptions.viewer`
- `workspaces.team.sendInvitation`
- `workspaces.team.sending`
- `workspaces.team.removeFromWorkspace`
- `workspaces.team.noMembers`
- `workspaces.team.noMembersDesc`
- `workspaces.team.inviteFirst`

</details>

---

## 📊 Recommended Actions

1. **Add missing keys to en.json** - 0 keys need to be added
2. **Translate missing keys** in other locales:
   - az.json: 0 keys missing
   - ru.json: 0 keys missing
3. **Review hardcoded strings** - 257 potential strings to localize
4. **Consider removing unused keys** - 991 keys appear unused

---

## Quick Fix: Missing Keys Template

Add these to your en.json:

```json
{

}
```

