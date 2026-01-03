# Unlocalized Strings Report

**Generated:** 2026-01-02T19:46:04.910Z

## Summary

| Metric | Value |
|--------|-------|
| Total files scanned | 255 |
| Files with issues | 36 |
| Total issues found | 141 |
| 🔴 High severity | 26 |
| 🟡 Medium severity | 14 |
| 🟢 Low severity | 101 |

### Severity Levels

- **🔴 High:** Clear user-facing strings that should definitely be localized (multi-word phrases, sentences, important UI text)
- **🟡 Medium:** Strings that might need localization depending on context (single words, short labels)
- **🟢 Low:** Likely acceptable or false positives (technical labels, translation fallbacks)

### Quick Navigation by Category

**UI Components** (6 files)
- 🔴 2 high, 🟡 2 medium priority

**Feature Components** (20 files)
- 🔴 21 high, 🟡 11 medium priority

**Pages** (8 files)

**Other** (2 files)
- 🔴 3 high, 🟡 1 medium priority

---

## 🔴 High Severity Issues

These are user-facing strings that should be localized.

### 📄 components/ProtectedRoute.tsx

**Line 89** (prop: `message`)

- **String:** `Signing you in`
- **Context:** `return <AppLoadingScreen message='Signing you in' />;`

**Line 100** (prop: `message`)

- **String:** `Loading workspace`
- **Context:** `return <AppLoadingScreen message='Loading workspace' />;`

**Line 106** (prop: `message`)

- **String:** `Loading preferences`
- **Context:** `return <AppLoadingScreen message='Loading preferences' />;`

### 📄 components/features/email-templates/CreateEmailTemplateDialog.tsx

**Line 43**

- **String:** `We would love to hear from you! Please take a few minutes to complete our survey.`
- **Context:** `<p>We would love to hear from you! Please take a few minutes to complete our survey.</p>`

**Line 45**

- **String:** `Click here to take the survey`
- **Context:** `<p><a href="{{surveyLink}}">Click here to take the survey</a></p>`

**Line 47**

- **String:** `Your feedback is important to us and will help us improve our services.`
- **Context:** `<p>Your feedback is important to us and will help us improve our services.</p>`

**Line 57**

- **String:** `This is a friendly reminder to complete our survey. We noticed you haven't had a chance to respond yet.`
- **Context:** `<p>This is a friendly reminder to complete our survey. We noticed you haven't had a chance to respond yet.</p>`

**Line 59**

- **String:** `Click here to take the survey`
- **Context:** `<p><a href="{{surveyLink}}">Click here to take the survey</a></p>`

**Line 61**

- **String:** `Your input is valuable and will only take a few minutes.`
- **Context:** `<p>Your input is valuable and will only take a few minutes.</p>`

**Line 71**

- **String:** `Thank you for taking the time to complete our survey! Your feedback is greatly appreciated.`
- **Context:** `<p>Thank you for taking the time to complete our survey! Your feedback is greatly appreciated.</p>`

**Line 73**

- **String:** `We will use your insights to improve our products and services.`
- **Context:** `<p>We will use your insights to improve our products and services.</p>`

### 📄 components/features/email-templates/visual-editor/BlockSettingsPanel.tsx

**Line 107** (prop: `label`)

- **String:** `Align center`
- **Context:** `<SegmentedButton value="center" icon={<AlignCenter className="h-4 w-4" />} aria-label="Align center" />`

**Line 108** (prop: `label`)

- **String:** `Align right`
- **Context:** `<SegmentedButton value="right" icon={<AlignRight className="h-4 w-4" />} aria-label="Align right" />`

**Line 504** (prop: `placeholder`)

- **String:** `100% or 400px`
- **Context:** `placeholder="100% or 400px"`

### 📄 components/features/public-survey/QuestionRenderers.tsx

**Line 840** (prop: `placeholder`)

- **String:** `Select a date`
- **Context:** `placeholder="Select a date"`

### 📄 components/features/recurring-surveys/RecurringScheduleEditor.tsx

**Line 355** (prop: `label`)

- **String:** `Day of Month`
- **Context:** `<Select label="Day of Month" options={dayOfMonthOptions} value={String(dayOfMonth)} onChange={(v) => setDayOfMonth(Numbe`

**Line 403** (prop: `label`)

- **String:** `Recipient Type`
- **Context:** `label="Recipient Type"`

**Line 412** (prop: `label`)

- **String:** `Email Addresses`
- **Context:** `label="Email Addresses"`

**Line 469** (prop: `label`)

- **String:** `Send reminder emails to non-respondents`
- **Context:** `<Checkbox label="Send reminder emails to non-respondents" checked={sendReminders} onChange={(e) => setSendReminders(e.ta`

**Line 519** (prop: `label`)

- **String:** `Activate immediately after creation`
- **Context:** `label="Activate immediately after creation"`

**Line 295** (prop: `placeholder`)

- **String:** `Select a published survey...`
- **Context:** `placeholder="Select a published survey..."`

**Line 363** (prop: `placeholder`)

- **String:** `e.g., 0 9 * * MON-FRI`
- **Context:** `placeholder="e.g., 0 9 * * MON-FRI"`

**Line 448** (prop: `placeholder`)

- **String:** `Leave empty to use survey title`
- **Context:** `placeholder="Leave empty to use survey title"`

**Line 455** (prop: `placeholder`)

- **String:** `Add a custom message to the email invitation...`
- **Context:** `placeholder="Add a custom message to the email invitation..."`

### 📄 components/ui/ColorPicker.tsx

**Line 239** (prop: `label`)

- **String:** `Pick color from screen`
- **Context:** `aria-label="Pick color from screen"`

**Line 239** (prop: `aria-label`)

- **String:** `Pick color from screen`
- **Context:** `aria-label="Pick color from screen"`

---

## 🟡 Medium Severity Issues

Review these strings in context to determine if localization is needed.

### 📄 components/ProtectedRoute.tsx

| Line | Type | String |
|------|------|--------|
| 130 | `message` | `Loading` |

### 📄 components/features/email-templates/visual-editor/BlockSettingsPanel.tsx

| Line | Type | String |
|------|------|--------|
| 106 | `label` | `Align left` |
| 106 | `aria-label` | `Align left` |
| 107 | `aria-label` | `Align center` |
| 108 | `aria-label` | `Align right` |

### 📄 components/features/recurring-surveys/RecurringScheduleEditor.tsx

| Line | Type | String |
|------|------|--------|
| 294 | `label` | `Survey` |
| 327 | `label` | `Repeat` |

### 📄 components/features/recurring-surveys/RunHistoryDrawer.tsx

| Line | Type | String |
|------|------|--------|
| 189 | JSX text | `Completed` |
| 193 | JSX text | `Failed` |
| 197 | JSX text | `Cancelled` |
| 201 | JSX text | `Responses` |

### 📄 components/features/responses/ResponseDetailDrawer.tsx

| Line | Type | String |
|------|------|--------|
| 259 | `text` | `Complete` |

### 📄 components/ui/Logo.tsx

| Line | Type | String |
|------|------|--------|
| 61 | `alt` | `Inquiro Logo` |
| 79 | `alt` | `Inquiro` |

---

## 🟢 Low Severity Issues

These are likely acceptable or false positives. Review only if time permits.

**Total:** 101 issues

<details>
<summary>Click to expand low severity issues</summary>

#### components/features/distributions/LinkAnalyticsDrawer.tsx

- Line 71: `0) return`

#### components/features/email-templates/CreateEmailTemplateDialog.tsx

- Line 81: `Take the survey`

#### components/features/email-templates/EmailTemplateEditor.tsx

- Line 409: `', '`
- Line 414: `', '`
- Line 419: `', '`
- Line 424: `\n`
- Line 424: `', '`
- Line 424: `\n`
- Line 429: `\n`
- Line 429: `', '`
- Line 429: `\n`

#### components/features/email-templates/visual-editor/BlockPalette.tsx

- Line 44: `Single image with optional link`
- Line 86: `Company info & unsubscribe`
- Line 94: `Click or drag blocks to add them`

#### components/features/email-templates/visual-editor/BlockSettingsPanel.tsx

- Line 218: `Supports: <p>, <strong>, <em>, <a>, <ul>, <ol>`
- Line 838: `Select a block in the canvas to edit its propertie...`

#### components/features/email-templates/visual-editor/VisualEmailEditor.tsx

- Line 738: `✉️`
- Line 455: `Template saved successfully`
- Line 704: `e.g., {{survey.title}} - We need your feedback`
- Line 711: `Preview text shown in inbox before opening the ema...`
- Line 736: `Preview text shown in inbox before opening the ema...`
- Line 762: `Drag blocks here or click to add`
- Line 804: `Replaces placeholders like {{firstName}} with samp...`
- Line 830: `Generated HTML (Outlook Compatible)`
- Line 998: `Click to copy, then paste into text blocks`

#### components/features/localization/AddLanguageDialog.tsx

- Line 96: `Add a new language translation to this survey`
- Line 199: `All available languages have been added`
- Line 211: `Auto-translate from default language`

#### components/features/localization/LanguageList.tsx

- Line 234: `Survey title, description, messages`

#### components/features/localization/LanguagesTab.tsx

- Line 577: `Add questions to your survey first, then come back...`
- Line 592: `Auto-translate feature coming soon!`
- Line 719: `Manage translations for your survey`
- Line 758: `Add languages to make your survey available in mul...`

#### components/features/localization/QuestionTranslationsEditor.tsx

- Line 479: `Option translations coming in next update`

#### components/features/localization/TranslationEditor.tsx

- Line 300: `Auto-translate feature coming soon!`

#### components/features/localization/TranslationEditorDialog.tsx

- Line 96: `Translate survey content from the default language`
- Line 112: `Failed to load translations`
- Line 122: `This language translation does not exist yet`

#### components/features/public-survey/UnifiedQuestionPreview.tsx

- Line 162: `Interactive preview - try it out!`

#### components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx

- Line 359: `How satisfied are you with our service?`
- Line 435: `Wonderful! What did you like most?`
- Line 456: `Which option do you prefer?`

#### components/features/surveys/ThemePreviewPanel.tsx

- Line 463: `Theme created successfully`
- Line 496: `Customize your survey look`
- Line 891: `Create a new theme from your customizations`

#### components/features/themes/ThemeEditorDrawer.tsx

- Line 331: `Changes update in real-time`

#### components/ui/GettingStartedWizard.tsx

- Line 134: `Failed to save progress. Please try again.`
- Line 286: `Skip getting started guide`
- Line 499: `Organize surveys by project or team`
- Line 500: `Invite team members to collaborate`
- Line 512: `You can access workspaces from the sidebar or navi...`
- Line 525: `Build a custom survey with full control`
- Line 530: `Start with pre-built survey templates`
- Line 537: `Ready to create? You have two options to get start...`
- Line 562: `Pro tip: Press Ctrl+N to quickly create a new surv...`
- Line 581: `The Survey Builder supports 10+ question types. He...`
- Line 606: `Drag & drop to reorder questions`
- Line 610: `Autosave keeps your work safe`
- Line 614: `Undo/Redo with Ctrl+Z / Ctrl+Y`
- Line 634: `Make your surveys visually appealing with custom t...`
- Line 655: `Access Themes from the sidebar to create reusable ...`
- Line 673: `Always preview your survey before sharing! See exa...`
- Line 681: `Test the survey as a respondent`
- Line 682: `Verify question logic flows`
- Line 693: `Click the Preview button in the Survey Builder too...`
- Line 718: `Once your survey is ready, publish it and share wi...`
- Line 742: `Access Distribute from the sidebar to manage all y...`
- Line 760: `Watch responses come in real-time! Every submissio...`
- Line 767: `Real-time response notifications`
- Line 794: `Turn raw data into actionable insights with powerf...`
- Line 870: `You now know the essentials. Start creating survey...`
- Line 881: `Quick Navigation Shortcuts`

#### components/ui/ImageUploader.tsx

- Line 98: `Invalid file type. Please upload an image.`
- Line 126: `Upload is not available. Please enter a URL instea...`
- Line 138: `Upload failed. Please try again.`
- Line 307: `Drag & drop or click to upload`

#### components/ui/LoadingState.tsx

- Line 65: `Loading...`

#### components/ui/OnboardingWizard.tsx

- Line 260: `Setup completed successfully!`
- Line 264: `Failed to save your preferences. Please try again.`
- Line 265: `Failed to save your preferences`
- Line 871: `Customize your experience for better accessibility`
- Line 880: `Minimize animations and transitions`
- Line 889: `Increase color contrast for better visibility`
- Line 898: `Increase font size throughout the app`
- Line 907: `Use a font designed for easier reading`
- Line 913: `You can adjust these settings anytime in Settings ...`

#### lib/form.tsx

- Line 61: `field.onChange(value as PathValue`
- Line 80: `field.onChange(e.target.checked as PathValue`

#### pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx

- Line 32: `Template saved successfully`
- Line 72: `The email template could not be loaded. Please try...`
- Line 91: `Please select an email template to edit.`
- Line 107: `Visual Editor (Drag & Drop)`

#### pages/Login/sections/IllustrationPanel.tsx

- Line 20: `Create surveys that inspire`
- Line 22: `Gather insights, understand your audience, and mak...`

#### pages/Login/sections/LoginForm.tsx

- Line 40: `Sign in to continue to your account`

#### pages/Register/RegisterPage.tsx

- Line 78: `Join thousands of teams creating better surveys`
- Line 97: `Create, distribute, and analyze surveys with power...`

#### pages/SurveyBuilder/SurveyBuilderPage.tsx

- Line 313: `Choose a question from the list to edit, or add a ...`

#### pages/SurveyBuilder/components/QuestionListSidebar.tsx

- Line 302: `Start building your survey by adding your first qu...`

#### pages/SurveyBuilder/components/SurveyBuilderHeader.tsx

- Line 81: `This survey is published and cannot be edited. You...`

#### pages/SurveyPreview/components/PreviewToolbar.tsx

- Line 404: `How questions appear to respondents`

</details>

---

## How to Fix

### For JSX Text Content

```tsx
// ❌ Before
<Button>Save Changes</Button>

// ✅ After
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<Button>{t('common.saveChanges')}</Button>
```

### For Prop Values

```tsx
// ❌ Before
<Input placeholder="Enter your email" />

// ✅ After
<Input placeholder={t('form.emailPlaceholder')} />
```

### Adding to Translation Files

Add new keys to `src/i18n/locales/en.json` (and other language files):

```json
{
  "common": {
    "saveChanges": "Save Changes"
  },
  "form": {
    "emailPlaceholder": "Enter your email"
  }
}
```