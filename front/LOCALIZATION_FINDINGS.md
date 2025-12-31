# Hardcoded Text Localization Analysis

useQuestionLogic also needs to be localized.

## Summary

| Priority  | Count    | Description                              |
| --------- | -------- | ---------------------------------------- |
| HIGH      | ~85      | Buttons, Errors, Validation, Form Labels |
| MEDIUM    | ~75      | Placeholders, Descriptions, Empty States |
| LOW       | ~25      | Aria Labels, Alt Text                    |
| DevTest   | ~50      | Demo content (may not need localization) |
| **Total** | **~235** |

---

## 🆕 NEW FINDINGS (Scan Date: December 31, 2025)

### 🔴 HIGH Priority - NEW Items Found

| File                          | Line          | Current Text                                            | Category                 | Suggested Key                              | Priority         |
| ----------------------------- | ------------- | ------------------------------------------------------- | ------------------------ | ------------------------------------------ | ---------------- |
| ~~ErrorScreen.tsx~~           | ~~22~~        | ~~`'Survey Not Available'`~~                            | ~~Fallback Title~~       | ~~`publicSurvey.errorTitle`~~              | ~~HIGH~~ ✅ DONE |
| ~~ErrorScreen.tsx~~           | ~~25-26~~     | ~~`'This survey is either not found, has expired...'`~~ | ~~Fallback Message~~     | ~~`publicSurvey.errorMessage`~~            | ~~HIGH~~ ✅ DONE |
| ~~ErrorScreen.tsx~~           | ~~33~~        | ~~`Try Again`~~                                         | ~~Button Label~~         | ~~`common.tryAgain`~~                      | ~~HIGH~~ ✅ DONE |
| ~~ResumeProgressDialog.tsx~~  | ~~25~~        | ~~`'Continue Where You Left Off?'`~~                    | ~~Dialog Title~~         | ~~`publicSurvey.resumeTitle`~~             | ~~HIGH~~ ✅ DONE |
| ~~ResumeProgressDialog.tsx~~  | ~~28-29~~     | ~~`'We found your previous progress...'`~~              | ~~Dialog Description~~   | ~~`publicSurvey.resumeDescription`~~       | ~~HIGH~~ ✅ DONE |
| ~~ResumeProgressDialog.tsx~~  | ~~35~~        | ~~`Continue Survey`~~                                   | ~~Button Label~~         | ~~`publicSurvey.continueSurvey`~~          | ~~HIGH~~ ✅ DONE |
| ~~ResumeProgressDialog.tsx~~  | ~~39~~        | ~~`Start Fresh`~~                                       | ~~Button Label~~         | ~~`publicSurvey.startFresh`~~              | ~~HIGH~~ ✅ DONE |
| ~~QuestionRenderers.tsx~~     | ~~204~~       | ~~`'Your answer'`~~                                     | ~~Placeholder Fallback~~ | ~~`publicSurvey.placeholders.yourAnswer`~~ | ~~HIGH~~ ✅ DONE |
| ~~QuestionRenderers.tsx~~     | ~~238~~       | ~~`'Your answer'`~~                                     | ~~Placeholder Fallback~~ | ~~`publicSurvey.placeholders.yourAnswer`~~ | ~~HIGH~~ ✅ DONE |
| ~~QuestionRenderers.tsx~~     | ~~272~~       | ~~`'email@example.com'`~~                               | ~~Placeholder Fallback~~ | ~~`placeholders.emailExample`~~            | ~~HIGH~~ ✅ DONE |
| ~~QuestionRenderers.tsx~~     | ~~289~~       | ~~`'Invalid email'`~~                                   | ~~Validation Error~~     | ~~`validation.invalidEmail`~~              | ~~HIGH~~ ✅ DONE |
| ~~QuestionRenderers.tsx~~     | ~~327~~       | ~~`'Enter phone number'`~~                              | ~~Placeholder Fallback~~ | ~~`placeholders.enterPhone`~~              | ~~HIGH~~ ✅ DONE |
| ~~QuestionRenderers.tsx~~     | ~~344~~       | ~~`'Invalid phone number'`~~                            | ~~Validation Error~~     | ~~`validation.invalidPhone`~~              | ~~HIGH~~ ✅ DONE |
| ~~QuestionRenderers.tsx~~     | ~~400~~       | ~~`'Invalid URL'`~~                                     | ~~Validation Error~~     | ~~`validation.invalidUrl`~~                | ~~HIGH~~ ✅ DONE |
| ~~QuestionRenderers.tsx~~     | ~~438~~       | ~~`'Enter a number'`~~                                  | ~~Placeholder Fallback~~ | ~~`placeholders.enterNumber`~~             | ~~HIGH~~ ✅ DONE |
| ~~QuestionRenderers.tsx~~     | ~~1023-1175~~ | ~~`'Yes'` / `'No'`~~                                    | ~~Yes/No Fallbacks~~     | ~~`common.yes` / `common.no`~~             | ~~HIGH~~ ✅ DONE |
| ~~QuestionRenderers.tsx~~     | ~~1259~~      | ~~`'Unsupported question type:'`~~                      | ~~Error Message~~        | ~~`errors.unsupportedQuestionType`~~       | ~~HIGH~~ ✅ DONE |
| ~~NamespaceSelector.tsx~~     | ~~60~~        | ~~`'Select Workspace'`~~                                | ~~Fallback Text~~        | ~~`workspaces.selectWorkspace`~~           | ~~HIGH~~ ✅ DONE |
| ~~NamespaceSelector.tsx~~     | ~~77~~        | ~~`'Workspaces'`~~                                      | ~~Section Header~~       | ~~`workspaces.title`~~                     | ~~HIGH~~ ✅ DONE |
| ~~NamespaceSelector.tsx~~     | ~~118~~       | ~~`'Create New Workspace'`~~                            | ~~Button Label~~         | ~~`workspaces.createNew`~~                 | ~~HIGH~~ ✅ DONE |
| ~~TemplatePreviewDrawer.tsx~~ | ~~169~~       | ~~`'Untitled question'`~~                               | ~~Fallback Text~~        | ~~`templates.untitledQuestion`~~           | ~~HIGH~~ ✅ DONE |
| ~~TemplatePreviewDrawer.tsx~~ | ~~183~~       | ~~`'Questions will appear here once added'`~~           | ~~Empty State~~          | ~~`templates.questionsWillAppear`~~        | ~~HIGH~~ ✅ DONE |
| ~~TemplatePreviewDrawer.tsx~~ | ~~190~~       | ~~`'Use This Template'`~~                               | ~~Button Label~~         | ~~`templates.useThis`~~                    | ~~HIGH~~ ✅ DONE |
| ~~DistributionStats.tsx~~     | ~~289~~       | ~~`'Distribution Analytics'`~~                          | ~~Section Title~~        | ~~`distributions.analytics`~~              | ~~HIGH~~ ✅ DONE |
| ~~DistributionStats.tsx~~     | ~~293~~       | ~~`'Refresh'`~~                                         | ~~Button Label~~         | ~~`common.refresh`~~                       | ~~HIGH~~ ✅ DONE |

### 🟡 MEDIUM Priority - NEW Items Found

| File                            | Line        | Current Text                                                          | Category                | Suggested Key                                        | Priority           |
| ------------------------------- | ----------- | --------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------- | ------------------ |
| ~~ResponseTrendChart.tsx~~      | ~~17~~      | ~~`'Response Trend'`~~                                                | ~~Default Title~~       | ~~`analytics.responseTrend`~~                        | ~~MEDIUM~~ ✅ DONE |
| ~~ResponseTrendChart.tsx~~      | ~~18~~      | ~~`'Daily responses over time'`~~                                     | ~~Default Description~~ | ~~`analytics.dailyResponses`~~                       | ~~MEDIUM~~ ✅ DONE |
| ~~ResponseTrendChart.tsx~~      | ~~60~~      | ~~`'No response data available'`~~                                    | ~~Empty State~~         | ~~`analytics.noResponseData`~~                       | ~~MEDIUM~~ ✅ DONE |
| ~~ResponseTrendChart.tsx~~      | ~~76~~      | ~~`'Total responses'`~~                                               | ~~Label~~               | ~~`analytics.totalResponses`~~                       | ~~MEDIUM~~ ✅ DONE |
| ~~ResponseTrendChart.tsx~~      | ~~91~~      | ~~`'{count} responses'`~~                                             | ~~Tooltip~~             | ~~`analytics.responsesCount`~~                       | ~~MEDIUM~~ ✅ DONE |
| ~~QuestionAnalyticsCard.tsx~~   | ~~127~~     | ~~`'Matrix question'`~~                                               | ~~Label~~               | ~~`analytics.matrixQuestion`~~                       | ~~MEDIUM~~ ✅ DONE |
| ~~QuestionAnalyticsCard.tsx~~   | ~~140~~     | ~~`'No data available'`~~                                             | ~~Empty State~~         | ~~`analytics.noData`~~                               | ~~MEDIUM~~ ✅ DONE |
| ~~QuestionAnalyticsCard.tsx~~   | ~~156~~     | ~~`'Analytics visualization not available for this question type'~~   | ~~Info Message~~        | ~~`analytics.visualizationNotAvailable`~~            | ~~MEDIUM~~ ✅ DONE |
| ~~NPSGauge.tsx~~                | ~~108~~     | ~~`'NPS Score'`~~                                                     | ~~Label~~               | ~~`analytics.npsScoreLabel`~~                        | ~~MEDIUM~~ ✅ DONE |
| ~~NPSGauge.tsx~~                | ~~158~~     | ~~`'Based on {count} response(s)'`~~                                  | ~~Info Text~~           | ~~`analytics.basedOnResponses`~~                     | ~~MEDIUM~~ ✅ DONE |
| ~~MatrixHeatmap.tsx~~           | ~~173~~     | ~~`'Response intensity:'`~~                                           | ~~Legend Label~~        | ~~`analytics.responseIntensity`~~                    | ~~MEDIUM~~ ✅ DONE |
| ~~DistributionStats.tsx~~       | ~~299-324~~ | ~~`'Sent'`, `'Delivered'`, `'Opened'`, `'Clicked'`~~                  | ~~Stat Labels~~         | ~~`distributions.sent`, etc.~~                       | ~~MEDIUM~~ ✅ DONE |
| ~~DistributionStats.tsx~~       | ~~333~~     | ~~`'Delivery Funnel'`~~                                               | ~~Card Title~~          | ~~`distributions.deliveryFunnel`~~                   | ~~MEDIUM~~ ✅ DONE |
| ~~DistributionStats.tsx~~       | ~~337~~     | ~~`'Email performance breakdown'`~~                                   | ~~Description~~         | ~~`distributions.performanceBreakdown`~~             | ~~MEDIUM~~ ✅ DONE |
| ~~DistributionStats.tsx~~       | ~~345~~     | ~~`'Performance Rates'`~~                                             | ~~Card Title~~          | ~~`distributions.performanceRates`~~                 | ~~MEDIUM~~ ✅ DONE |
| ~~DistributionStats.tsx~~       | ~~351~~     | ~~`'Key metrics comparison'`~~                                        | ~~Description~~         | ~~`distributions.metricsComparison`~~                | ~~MEDIUM~~ ✅ DONE |
| ~~DistributionStats.tsx~~       | ~~356~~     | ~~`'Delivery Rate'`~~                                                 | ~~Label~~               | ~~`distributions.deliveryRate`~~                     | ~~MEDIUM~~ ✅ DONE |
| ~~DistributionStats.tsx~~       | ~~363~~     | ~~`'Open Rate'`~~                                                     | ~~Label~~               | ~~`distributions.openRate`~~                         | ~~MEDIUM~~ ✅ DONE |
| ~~DistributionStats.tsx~~       | ~~370~~     | ~~`'Click Rate'`~~                                                    | ~~Label~~               | ~~`distributions.clickRate`~~                        | ~~MEDIUM~~ ✅ DONE |
| ~~DistributionStats.tsx~~       | ~~376~~     | ~~`'Bounced:'` / `'Failed:'`~~                                        | ~~Labels~~              | ~~`distributions.bounced` / `distributions.failed`~~ | ~~MEDIUM~~ ✅ DONE |
| ~~DistributionStats.tsx~~       | ~~386~~     | ~~`'Recipients'`~~                                                    | ~~Card Title~~          | ~~`distributions.recipients`~~                       | ~~MEDIUM~~ ✅ DONE |
| ~~DistributionStats.tsx~~       | ~~389~~     | ~~`'{count} total recipients'`~~                                      | ~~Description~~         | ~~`distributions.totalRecipients`~~                  | ~~MEDIUM~~ ✅ DONE |
| ~~RecurringSurveyCard.tsx~~     | ~~133~~     | ~~`'{count} recipient(s)'`~~                                          | ~~Info Text~~           | ~~`recurringSurveys.recipientCount`~~                | ~~MEDIUM~~ ✅ DONE |
| ~~RecurringSurveyCard.tsx~~     | ~~141~~     | ~~`'Next Run'`~~                                                      | ~~Label~~               | ~~`recurringSurveys.nextRun`~~                       | ~~MEDIUM~~ ✅ DONE |
| ~~RecurringSurveyCard.tsx~~     | ~~149~~     | ~~`'Last Run'`~~                                                      | ~~Label~~               | ~~`recurringSurveys.lastRun`~~                       | ~~MEDIUM~~ ✅ DONE |
| ~~RecurringSurveyCard.tsx~~     | ~~157~~     | ~~`'Total Runs'`~~                                                    | ~~Label~~               | ~~`recurringSurveys.totalRuns`~~                     | ~~MEDIUM~~ ✅ DONE |
| ~~RecurringSurveyCard.tsx~~     | ~~166~~     | ~~`'Pause recurring survey'`~~                                        | ~~Tooltip~~             | ~~`recurringSurveys.pauseTooltip`~~                  | ~~MEDIUM~~ ✅ DONE |
| ~~RecurringSurveyCard.tsx~~     | ~~181~~     | ~~`'Resume recurring survey'`~~                                       | ~~Tooltip~~             | ~~`recurringSurveys.resumeTooltip`~~                 | ~~MEDIUM~~ ✅ DONE |
| ~~RecurringSurveyCard.tsx~~     | ~~191~~     | ~~`'Trigger immediate run'`~~                                         | ~~Tooltip~~             | ~~`recurringSurveys.triggerTooltip`~~                | ~~MEDIUM~~ ✅ DONE |
| ~~RecurringSurveyCard.tsx~~     | ~~201~~     | ~~`'View run history'`~~                                              | ~~Tooltip~~             | ~~`recurringSurveys.viewHistoryTooltip`~~            | ~~MEDIUM~~ ✅ DONE |
| ~~RecurringScheduleEditor.tsx~~ | ~~365~~     | ~~`'Cron Expression'`~~                                               | ~~Label~~               | ~~`recurringSurveys.cronExpression`~~                | ~~MEDIUM~~ ✅ DONE |
| ~~RecurringScheduleEditor.tsx~~ | ~~369~~     | ~~`'Use standard cron format: minute hour...'`~~                      | ~~Helper Text~~         | ~~`recurringSurveys.cronHelp`~~                      | ~~MEDIUM~~ ✅ DONE |
| ~~RecurringScheduleEditor.tsx~~ | ~~377~~     | ~~`'Time Settings'`~~                                                 | ~~Section Title~~       | ~~`recurringSurveys.timeSettings`~~                  | ~~MEDIUM~~ ✅ DONE |
| ~~RecurringScheduleEditor.tsx~~ | ~~387~~     | ~~`'Timezone'`~~                                                      | ~~Label~~               | ~~`common.timezone`~~                                | ~~MEDIUM~~ ✅ DONE |
| ~~RecurringScheduleEditor.tsx~~ | ~~390-391~~ | ~~`'The survey will be sent at {time} in the {timezone} timezone.'`~~ | ~~Info Text~~           | ~~`recurringSurveys.sendTimeInfo`~~                  | ~~MEDIUM~~ ✅ DONE |
| ~~RecurringScheduleEditor.tsx~~ | ~~396~~     | ~~`'Audience'`~~                                                      | ~~Section Title~~       | ~~`recurringSurveys.audience`~~                      | ~~MEDIUM~~ ✅ DONE |
| ~~RecurringScheduleEditor.tsx~~ | ~~520~~     | ~~`'If unchecked, the schedule will be created in a paused state'`~~  | ~~Helper Text~~         | ~~`recurringSurveys.pausedStateHint`~~               | ~~MEDIUM~~ ✅ DONE |
| ~~KeyboardShortcutsHelp.tsx~~   | ~~115~~     | ~~`'Shortcuts will appear as you navigate the app'`~~                 | ~~Empty State Hint~~    | ~~`shortcuts.willAppear`~~                           | ~~MEDIUM~~ ✅ DONE |
| ~~SearchButton.tsx~~            | ~~73~~      | ~~`'Search surveys, templates...'`~~                                  | ~~Placeholder~~         | ~~`search.placeholder`~~                             | ~~MEDIUM~~ ✅ DONE |
| ~~GlobalSearch.tsx~~            | ~~293~~     | ~~`'Open with'`~~                                                     | ~~Keyboard Hint~~       | ~~`emptyState.search.openWith`~~                     | ~~MEDIUM~~ ✅ DONE |
| ~~DatePicker.tsx~~              | ~~475~~     | ~~`'Select date'`~~                                                   | ~~Default Title~~       | ~~`datePicker.selectDate`~~                          | ~~MEDIUM~~ ✅ DONE |
| ~~VisualEmailEditor.tsx~~       | ~~840~~     | ~~`'Email Preview'`~~                                                 | ~~Title~~               | ~~`emailEditor.previewTitle`~~                       | ~~MEDIUM~~ ✅ DONE |
| ~~Dashboard.tsx~~               | ~~34~~      | ~~`'there'`~~                                                         | ~~Fallback Name~~       | ~~`common.greetingFallback`~~                        | ~~MEDIUM~~ ✅ DONE |
| ~~ProfileSettings.tsx~~         | ~~176~~     | ~~`'User'`~~                                                          | ~~Fallback Name~~       | ~~`common.userFallback`~~                            | ~~MEDIUM~~ ✅ DONE |
| ~~PublicSurveyLayout.tsx~~      | ~~22~~      | ~~`'Survey'`~~                                                        | ~~Page Title~~          | ~~`common.surveyFallback`~~                          | ~~MEDIUM~~ ✅ DONE |
| ~~PublicSurveyLayout.tsx~~      | ~~25~~      | ~~`'Survey App'`~~                                                    | ~~App Title~~           | ~~`common.appTitle`~~                                | ~~MEDIUM~~ ✅ DONE |
| ~~Layout.tsx~~                  | ~~147~~     | ~~`'Survey'`~~                                                        | ~~Fallback Title~~      | ~~`common.surveyFallback`~~                          | ~~MEDIUM~~ ✅ DONE |
| ~~Layout.tsx~~                  | ~~158~~     | ~~`'Template'`~~                                                      | ~~Fallback Title~~      | ~~`common.templateFallback`~~                        | ~~MEDIUM~~ ✅ DONE |
| ~~Layout.tsx~~                  | ~~169~~     | ~~`'Theme'`~~                                                         | ~~Fallback Title~~      | ~~`common.themeFallback`~~                           | ~~MEDIUM~~ ✅ DONE |
| ~~Avatar.tsx~~                  | ~~49~~      | ~~`'Avatar'`~~                                                        | ~~Alt Text Fallback~~   | ~~`a11y.avatarAlt`~~                                 | ~~MEDIUM~~ ✅ DONE |
| ~~Chip.tsx~~                    | ~~75~~      | ~~`'Remove'`~~                                                        | ~~Aria Label~~          | ~~`a11y.remove`~~                                    | ~~MEDIUM~~ ✅ DONE |
| ~~BlockEditor.tsx~~             | ~~200~~     | ~~`'Logo'`~~                                                          | ~~Alt Text~~            | ~~`a11y.logoAlt`~~                                   | ~~MEDIUM~~ ✅ DONE |
| MembersManagement.tsx           | 38          | `'Member'`                                                            | Role Fallback           | N/A - code constant, not UI text                     | SKIPPED            |
| ~~LogicVisualization.tsx~~      | ~~49~~      | ~~`'Unknown'`~~                                                       | ~~Fallback Type~~       | ~~`common.unknown`~~                                 | ~~MEDIUM~~ ✅ DONE |

### 🟢 LOW Priority - NEW Items Found

| File                          | Line      | Current Text                                                | Category                  | Suggested Key                      | Priority        |
| ----------------------------- | --------- | ----------------------------------------------------------- | ------------------------- | ---------------------------------- | --------------- |
| ~~ButtonShowcaseSection.tsx~~ | ~~90-99~~ | ~~`'Like'`, `'Favorite'`, `'Notifications'`, `'Settings'`~~ | ~~Aria Labels (DevTest)~~ | ~~`devTest.like`, etc.~~           | ~~LOW~~ ✅ DONE |
| ~~PreviewToolbar.tsx~~        | ~~215~~   | ~~`'Width'`~~                                               | ~~Placeholder~~           | ~~`surveyPreview.width`~~          | ~~LOW~~ ✅ DONE |
| ~~PreviewToolbar.tsx~~        | ~~227~~   | ~~`'Height'`~~                                              | ~~Placeholder~~           | ~~`surveyPreview.height`~~         | ~~LOW~~ ✅ DONE |
| ~~ErrorBoundary.tsx~~         | ~~75~~    | ~~`'View stack trace'`~~                                    | ~~Collapsible Summary~~   | ~~`errorBoundary.viewStackTrace`~~ | ~~LOW~~ ✅ DONE |

---

## 📋 Validation Messages in src/lib/validations.ts

These Zod schema validation messages should be localized using a custom error map:

| Line        | Current Message                            | Suggested Key                        |
| ----------- | ------------------------------------------ | ------------------------------------ |
| 5           | `'Email is required'`                      | `validation.emailRequired`           |
| 5           | `'Please enter a valid email address'`     | `validation.emailInvalid`            |
| 7           | `'Password is required'`                   | `validation.passwordRequired`        |
| 7           | `'Password must be at least 8 characters'` | `validation.passwordMinLength`       |
| 10-15       | Various strong password rules              | `validation.passwordUppercase`, etc. |
| 20-22       | Name validation messages                   | `validation.nameRequired`, etc.      |
| 24          | `'This field is required'`                 | `validation.fieldRequired`           |
| 46, 58, 423 | `'Passwords do not match'`                 | `validation.passwordsMismatch`       |
| 340         | `'Must be between 1 and 1000'`             | `validation.rangeLinkCount`          |
| 382         | `'Please enter a valid URL'`               | `validation.urlInvalid`              |
| 147-156     | Password strength labels                   | `validation.strength.veryWeak`, etc. |

---

## 📧 Email Template Default Content

These default email bodies in CreateEmailTemplateDialog.tsx and CreateDistributionDialog.tsx contain hardcoded English text that could be localized for multilingual support:

| File                          | Lines | Content Type                                     |
| ----------------------------- | ----- | ------------------------------------------------ |
| CreateEmailTemplateDialog.tsx | 42-84 | Survey invitation, reminder, thank you templates |
| CreateDistributionDialog.tsx  | 33-68 | Default distribution email templates             |
