# Missing Translations Report

Generated: 2026-01-03T06:53:54.106Z

## Summary

| Metric | Count |
|--------|-------|
| Total unique keys in codebase | 2110 |
| Keys found in en.json | 1917 |
| Keys MISSING (added) | 193 |

## ❌ Missing Keys (Added with "TODO-Translate")

These keys were found in the codebase but were NOT in en.json.
They have been added with the value `"TODO-Translate"`.

| Key | Used In |
|-----|---------|
| `auth.authenticationFailed` | src/pages/AzureCallback/AzureCallbackPage.tsx |
| `auth.completingSignIn` | src/pages/AzureCallback/AzureCallbackPage.tsx |
| `auth.orContinueWith` | src/pages/Login/sections/LoginForm.tsx |
| `auth.returnToLogin` | src/pages/AzureCallback/AzureCallbackPage.tsx |
| `auth.signingIn` | src/components/ui/AzureAdLoginButton.tsx |
| `auth.signInWithMicrosoft` | src/components/ui/AzureAdLoginButton.tsx |
| `common.apply` | src/pages/SurveyPreview/components/PreviewToolbar.tsx |
| `common.complete` | src/components/features/localization/QuestionTranslationsEditor.tsx |
| `common.copied` | src/hooks/useCopyToClipboard.ts |
| `common.copyFailed` | src/hooks/useCopyToClipboard.ts |
| `common.dragToReorder` | src/components/features/email-templates/visual-editor/BlockEditor.tsx |
| `common.entityDeletedSuccess` | src/hooks/useEntityActions.ts |
| `common.entityDeleteFailed` | src/hooks/useEntityActions.ts |
| `common.entityDuplicatedSuccess` | src/hooks/useEntityActions.ts |
| `common.entityDuplicateFailed` | src/hooks/useEntityActions.ts |
| `common.item` | src/pages/SurveyBuilder/components/QuestionListSidebar.tsx |
| `common.items` | src/pages/SurveyBuilder/components/QuestionListSidebar.tsx |
| `common.moveDown` | src/components/features/email-templates/visual-editor/BlockEditor.tsx |
| `common.moveUp` | src/components/features/email-templates/visual-editor/BlockEditor.tsx |
| `common.operationFailed` | src/hooks/useEntityActions.ts |
| `common.other` | src/components/features/responses/ResponseDetailDrawer.tsx |
| `common.redo` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `common.reset` | src/components/features/public-survey/UnifiedQuestionPreview.tsx |
| `common.undo` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `createSurvey.language` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.assessment.manager` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.assessment.peers` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.assessment.reports` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.assessment.self` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.assessment.title` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.classic.option1` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.classic.option2` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.classic.option3` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.classic.option4` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.classic.question` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.conversational.botMessage` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.conversational.followUp` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.conversational.placeholder` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.conversational.userMessage` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.csat.rating` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.features` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.nps.detractors` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.nps.passives` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.nps.promoters` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.progress` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.research.subtitle` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.research.title` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `createSurvey.preview.scale` | src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx |
| `dialogs.confirmAction` | src/hooks/useEntityActions.ts |
| `dialogs.confirmDescription` | src/hooks/useEntityActions.ts |
| `dialogs.deleteEntityDescription` | src/hooks/useEntityActions.ts |
| `dialogs.deleteEntityTitle` | src/hooks/useEntityActions.ts |
| `distributions.sentCountLabel` | src/pages/Distributions/components/DistributionCard.tsx |
| `emailEditor.addBlockHint` | src/components/features/email-templates/visual-editor/BlockPalette.tsx |
| `emailEditor.blockSettings` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.blockToolbar` | src/components/features/email-templates/visual-editor/BlockEditor.tsx |
| `emailEditor.columns` | src/components/features/email-templates/visual-editor/BlockEditor.tsx, src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.copyHtml` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.dividerStyles.dashed` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.dividerStyles.dotted` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.dividerStyles.solid` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.downloadHtml` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.errors.loadFailed` | src/pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx |
| `emailEditor.errors.loadFailedDescription` | src/pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx |
| `emailEditor.errors.noTemplate` | src/pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx |
| `emailEditor.errors.noTemplateDescription` | src/pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx |
| `emailEditor.hideSettings` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.modeSwitched` | src/pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx |
| `emailEditor.noBlockSelected` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.placeholderCopied` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.preheaderLabel` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.preheaderPlaceholder` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.preheaderTooltip` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.previewWithSampleData` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.sampleDataInfo` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.selectBlockHint` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.address` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.button` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.colors` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.columns` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.companyInfo` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.divider` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.horizontal` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.htmlContent` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.image` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.layout` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.logo` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.preview` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.spacer` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.stackOnMobile` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.typography` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.unsubscribe` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.settings.vertical` | src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx |
| `emailEditor.showSettings` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.styles.colors` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.styles.layout` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.styles.typography` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.subjectLabel` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.subjectPlaceholder` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.templateNameLabel` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.toolbar` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailEditor.typeLabel` | src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx |
| `emailTemplates.backToTemplates` | src/pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx |
| `emailTemplates.editor.code` | src/pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx |
| `emailTemplates.editor.visual` | src/pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx |
| `linksPanel.types.campaign` | src/components/features/distributions/LinksPanel.tsx |
| `linksPanel.types.campaignDescription` | src/components/features/distributions/LinksPanel.tsx |
| `linksPanel.types.qrCode` | src/components/features/distributions/LinksPanel.tsx |
| `linksPanel.types.qrCodeDescription` | src/components/features/distributions/LinksPanel.tsx |
| `localization.defaultLanguage` | src/components/features/localization/LanguageList.tsx |
| `localization.description` | src/components/features/localization/QuestionTranslationsEditor.tsx |
| `localization.disable` | src/components/features/localization/LanguageList.tsx |
| `localization.disabled` | src/components/features/localization/LanguageList.tsx |
| `localization.editingFallback` | src/components/features/questions/QuestionEditor.tsx |
| `localization.editingTranslation` | src/components/features/localization/LanguagesTab.tsx, src/components/features/questions/QuestionEditor.tsx |
| `localization.editTranslations` | src/components/features/localization/LanguageList.tsx |
| `localization.enable` | src/components/features/localization/LanguageList.tsx |
| `localization.export` | src/components/features/localization/LanguagesTab.tsx |
| `localization.highRatingLabel` | src/components/features/localization/QuestionTranslationsEditor.tsx |
| `localization.import` | src/components/features/localization/LanguagesTab.tsx |
| `localization.languagesDescription` | src/components/features/localization/LanguagesTab.tsx |
| `localization.lowRatingLabel` | src/components/features/localization/QuestionTranslationsEditor.tsx |
| `localization.needsWork` | src/components/features/localization/LanguageList.tsx |
| `localization.noLanguages` | src/components/features/localization/LanguageList.tsx, src/components/features/localization/LanguagesTab.tsx |
| `localization.noLanguagesDesc` | src/components/features/localization/LanguagesTab.tsx |
| `localization.noQuestions` | src/components/features/localization/LanguagesTab.tsx, src/components/features/localization/QuestionTranslationsEditor.tsx |
| `localization.noQuestionsDesc` | src/components/features/localization/LanguagesTab.tsx |
| `localization.optionsCount` | src/components/features/localization/QuestionTranslationsEditor.tsx |
| `localization.optionsTranslationHint` | src/components/features/localization/QuestionTranslationsEditor.tsx |
| `localization.questions` | src/components/features/localization/LanguagesTab.tsx, src/components/features/localization/QuestionTranslationsEditor.tsx |
| `localization.questionsCount` | src/components/features/localization/LanguagesTab.tsx |
| `localization.questionsLabel` | src/components/features/localization/LanguageList.tsx |
| `localization.questionsProgress` | src/components/features/localization/QuestionTranslationsEditor.tsx |
| `localization.questionText` | src/components/features/localization/QuestionTranslationsEditor.tsx |
| `localization.ratingLabels` | src/components/features/localization/QuestionTranslationsEditor.tsx |
| `localization.source` | src/components/features/localization/LanguageList.tsx |
| `localization.surveyFieldsProgress` | src/components/features/localization/LanguagesTab.tsx |
| `localization.totalLanguages` | src/components/features/localization/LanguagesTab.tsx |
| `localization.translationComplete` | src/components/features/localization/QuestionTranslationsEditor.tsx |
| `localization.translationIncomplete` | src/components/features/localization/QuestionTranslationsEditor.tsx |
| `localization.untitledQuestion` | src/components/features/localization/QuestionTranslationsEditor.tsx |
| `profile.avatar.description` | src/pages/Settings/sections/ProfileSection.tsx |
| `profile.avatar.removed` | src/pages/Settings/sections/ProfileSection.tsx |
| `profile.avatar.title` | src/pages/Settings/sections/ProfileSection.tsx |
| `profile.avatar.updated` | src/pages/Settings/sections/ProfileSection.tsx |
| `questionPreview.questionText` | src/components/features/public-survey/UnifiedQuestionPreview.tsx |
| `search.noRecentItems` | src/components/features/search/GlobalSearch.tsx |
| `search.noResults` | src/components/features/search/GlobalSearch.tsx |
| `search.placeholder` | src/components/features/search/GlobalSearch.tsx |
| `search.recent` | src/components/features/search/GlobalSearch.tsx |
| `search.results` | src/components/features/search/GlobalSearch.tsx |
| `search.startTyping` | src/components/features/search/GlobalSearch.tsx |
| `search.toClose` | src/components/features/search/GlobalSearch.tsx |
| `search.toNavigate` | src/components/features/search/GlobalSearch.tsx |
| `search.toSelect` | src/components/features/search/GlobalSearch.tsx |
| `search.tryDifferentKeywords` | src/components/features/search/GlobalSearch.tsx |
| `settings.copyFailed` | src/hooks/useCopyToClipboard.ts |
| `settings.keyCopied` | src/hooks/useCopyToClipboard.ts |
| `shortcuts.willAppear` | src/components/features/search/KeyboardShortcutsHelp.tsx |
| `surveyBuilder.add` | src/pages/SurveyBuilder/components/QuestionListSidebar.tsx |
| `surveyBuilder.addFirstQuestionDesc` | src/pages/SurveyBuilder/components/QuestionListSidebar.tsx |
| `surveyBuilder.dragToReorder` | src/pages/SurveyBuilder/components/QuestionListSidebar.tsx |
| `surveyBuilder.selectQuestion` | src/pages/SurveyBuilder/SurveyBuilderPage.tsx |
| `surveyBuilder.selectQuestionDesc` | src/pages/SurveyBuilder/SurveyBuilderPage.tsx |
| `surveyBuilder.tabs.languages` | src/pages/SurveyBuilder/components/SurveyBuilderTabs.tsx |
| `surveyBuilder.tabs.questions` | src/pages/SurveyBuilder/components/SurveyBuilderTabs.tsx |
| `surveyPreview.previewLanguage` | src/pages/SurveyPreview/components/PreviewLanguageSwitcher.tsx |
| `surveyPreview.selectLanguage` | src/pages/SurveyPreview/components/PreviewLanguageSwitcher.tsx |
| `surveyPreview.switchPreviewLanguage` | src/pages/SurveyPreview/components/PreviewLanguageSwitcher.tsx |
| `surveyPreview.testModeOff` | src/pages/SurveyPreview/components/PreviewToolbar.tsx |
| `templates.form.language` | src/components/features/templates/CreateTemplateDialog.tsx |
| `themeEditor.bodyFont` | src/components/features/themes/ThemeEditorDrawer.tsx |
| `themeEditor.brandColors` | src/components/features/themes/ThemeEditorDrawer.tsx |
| `themeEditor.colors.accent` | src/components/features/themes/ThemeEditorDrawer.tsx |
| `themeEditor.colors.surface` | src/components/features/themes/ThemeEditorDrawer.tsx |
| `themeEditor.containerWidth` | src/components/features/themes/ThemeEditorDrawer.tsx |
| `themeEditor.cornerRadius` | src/components/features/themes/ThemeEditorDrawer.tsx |
| `themeEditor.headingFont` | src/components/features/themes/ThemeEditorDrawer.tsx |
| `themeEditor.progressIndicator` | src/components/features/themes/ThemeEditorDrawer.tsx |
| `themeEditor.questionNumbers` | src/components/features/themes/ThemeEditorDrawer.tsx |
| `themeEditor.spacing` | src/components/features/themes/ThemeEditorDrawer.tsx |
| `themeEditor.surfaceColors` | src/components/features/themes/ThemeEditorDrawer.tsx |
| `themeEditor.tabs.layout` | src/components/features/themes/ThemeEditorDrawer.tsx |
| `themes.bodyFont` | src/components/features/surveys/ThemePreviewPanel.tsx |
| `themes.brandColors` | src/components/features/surveys/ThemePreviewPanel.tsx |
| `themes.containerWidth` | src/components/features/surveys/ThemePreviewPanel.tsx |
| `themes.layoutSpacing` | src/components/features/surveys/ThemePreviewPanel.tsx |
| `themes.spacing` | src/components/features/surveys/ThemePreviewPanel.tsx |
| `themes.surface` | src/components/features/surveys/ThemePreviewPanel.tsx |
| `themes.surfaceColors` | src/components/features/surveys/ThemePreviewPanel.tsx |
| `themes.textPrimary` | src/components/features/surveys/ThemePreviewPanel.tsx |
| `welcomeScreen.anonymousNote` | src/components/features/public-survey/WelcomeScreen.tsx |
| `welcomeScreen.starting` | src/components/features/public-survey/WelcomeScreen.tsx |


### Detailed Usage of Missing Keys

#### `auth.authenticationFailed`

- `src/pages/AzureCallback/AzureCallbackPage.tsx` (Line 57)
  ```
  <h1 className='text-2xl font-bold text-on-surface mb-2'>{t('auth.authenticationFailed', 'Authentication Failed')}</h1>
  ```

#### `auth.completingSignIn`

- `src/pages/AzureCallback/AzureCallbackPage.tsx` (Line 72)
  ```
  <p className='text-on-surface-variant text-lg'>{t('auth.completingSignIn', 'Completing sign in...')}</p>
  ```

#### `auth.orContinueWith`

- `src/pages/Login/sections/LoginForm.tsx` (Line 111)
  ```
  <span className='bg-surface px-3 text-on-surface-variant'>{t('auth.orContinueWith', 'or continue with')}</span>
  ```

#### `auth.returnToLogin`

- `src/pages/AzureCallback/AzureCallbackPage.tsx` (Line 60)
  ```
  {t('auth.returnToLogin', 'Return to Login')}
  ```

#### `auth.signingIn`

- `src/components/ui/AzureAdLoginButton.tsx` (Line 44)
  ```
  <span>{isLoading ? t('auth.signingIn', 'Signing in...') : t('auth.signInWithMicrosoft', 'Sign in with Microsoft')}</span>
  ```

#### `auth.signInWithMicrosoft`

- `src/components/ui/AzureAdLoginButton.tsx` (Line 44)
  ```
  <span>{isLoading ? t('auth.signingIn', 'Signing in...') : t('auth.signInWithMicrosoft', 'Sign in with Microsoft')}</span>
  ```

#### `common.apply`

- `src/pages/SurveyPreview/components/PreviewToolbar.tsx` (Line 241)
  ```
  {t('common.apply')}
  ```

#### `common.complete`

- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 277)
  ```
  {t('common.complete', 'Complete')}
  ```

#### `common.copied`

- `src/hooks/useCopyToClipboard.ts` (Line 54)
  ```
  const { successMessage = t('common.copied'), errorMessage = t('common.copyFailed'), resetDelay = 2000, showToast = true } = options;
  ```

#### `common.copyFailed`

- `src/hooks/useCopyToClipboard.ts` (Line 54)
  ```
  const { successMessage = t('common.copied'), errorMessage = t('common.copyFailed'), resetDelay = 2000, showToast = true } = options;
  ```

#### `common.dragToReorder`

- `src/components/features/email-templates/visual-editor/BlockEditor.tsx` (Line 109)
  ```
  <Tooltip content={t('common.dragToReorder', 'Drag to reorder')}>
  ```
- `src/components/features/email-templates/visual-editor/BlockEditor.tsx` (Line 120)
  ```
  aria-label={t('common.dragToReorder', 'Drag to reorder')}
  ```

#### `common.entityDeletedSuccess`

- `src/hooks/useEntityActions.ts` (Line 237)
  ```
  t('common.entityDeletedSuccess', { entity: capitalizedEntityName, defaultValue: `${capitalizedEntityName} deleted successfully` })
  ```

#### `common.entityDeleteFailed`

- `src/hooks/useEntityActions.ts` (Line 242)
  ```
  toast.error(t('common.entityDeleteFailed', { entity: entityName, defaultValue: `Failed to delete ${entityName}` }));
  ```

#### `common.entityDuplicatedSuccess`

- `src/hooks/useEntityActions.ts` (Line 257)
  ```
  t('common.entityDuplicatedSuccess', { entity: capitalizedEntityName, defaultValue: `${capitalizedEntityName} duplicated successfully` })
  ```

#### `common.entityDuplicateFailed`

- `src/hooks/useEntityActions.ts` (Line 262)
  ```
  toast.error(t('common.entityDuplicateFailed', { entity: entityName, defaultValue: `Failed to duplicate ${entityName}` }));
  ```

#### `common.item`

- `src/pages/SurveyBuilder/components/QuestionListSidebar.tsx` (Line 232)
  ```
  {questions.length} {questions.length === 1 ? t('common.item', 'item') : t('common.items', 'items')}
  ```

#### `common.items`

- `src/pages/SurveyBuilder/components/QuestionListSidebar.tsx` (Line 232)
  ```
  {questions.length} {questions.length === 1 ? t('common.item', 'item') : t('common.items', 'items')}
  ```

#### `common.moveDown`

- `src/components/features/email-templates/visual-editor/BlockEditor.tsx` (Line 147)
  ```
  <Tooltip content={t('common.moveDown', 'Move Down')}>
  ```
- `src/components/features/email-templates/visual-editor/BlockEditor.tsx` (Line 156)
  ```
  aria-label={t('common.moveDown', 'Move Down')}
  ```

#### `common.moveUp`

- `src/components/features/email-templates/visual-editor/BlockEditor.tsx` (Line 130)
  ```
  <Tooltip content={t('common.moveUp', 'Move Up')}>
  ```
- `src/components/features/email-templates/visual-editor/BlockEditor.tsx` (Line 139)
  ```
  aria-label={t('common.moveUp', 'Move Up')}
  ```

#### `common.operationFailed`

- `src/hooks/useEntityActions.ts` (Line 56)
  ```
  const defaultErrorMessage = errorMessage ?? t('common.operationFailed', 'Operation failed');
  ```
- `src/hooks/useEntityActions.ts` (Line 117)
  ```
  const defaultErrorMessage = errorMessage ?? t('common.operationFailed', 'Operation failed');
  ```
- `src/hooks/useEntityActions.ts` (Line 296)
  ```
  toast.error(actionConfig.errorMessage || t('common.operationFailed', 'Operation failed'));
  ```

#### `common.other`

- `src/components/features/responses/ResponseDetailDrawer.tsx` (Line 74)
  ```
  {t('common.other')}: {answer.text}
  ```

#### `common.redo`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 600)
  ```
  <Tooltip content={`${t('common.redo', 'Redo')} (Ctrl+Shift+Z)`}>
  ```
- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 601)
  ```
  <IconButton variant="standard" size="sm" onClick={handleRedo} disabled={!canRedo} aria-label={t('common.redo', 'Redo')}>
  ```

#### `common.reset`

- `src/components/features/public-survey/UnifiedQuestionPreview.tsx` (Line 172)
  ```
  {t('common.reset', 'Reset')}
  ```

#### `common.undo`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 595)
  ```
  <Tooltip content={`${t('common.undo', 'Undo')} (Ctrl+Z)`}>
  ```
- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 596)
  ```
  <IconButton variant="standard" size="sm" onClick={handleUndo} disabled={!canUndo} aria-label={t('common.undo', 'Undo')}>
  ```

#### `createSurvey.language`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 194)
  ```
  <span className="text-sm text-on-surface-variant">{t('createSurvey.language', 'Language')}:</span>
  ```

#### `createSurvey.preview.assessment.manager`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 491)
  ```
  { label: t('createSurvey.preview.assessment.manager', 'Manager'), count: 1 },
  ```

#### `createSurvey.preview.assessment.peers`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 492)
  ```
  { label: t('createSurvey.preview.assessment.peers', 'Peers'), count: 4 },
  ```

#### `createSurvey.preview.assessment.reports`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 493)
  ```
  { label: t('createSurvey.preview.assessment.reports', 'Direct Reports'), count: 3 },
  ```

#### `createSurvey.preview.assessment.self`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 490)
  ```
  { label: t('createSurvey.preview.assessment.self', 'Self'), count: 1 },
  ```

#### `createSurvey.preview.assessment.title`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 484)
  ```
  <p className="text-sm font-medium text-on-surface mb-1">{t('createSurvey.preview.assessment.title', 'Multi-rater Feedback')}</p>
  ```

#### `createSurvey.preview.classic.option1`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 366)
  ```
  t('createSurvey.preview.classic.option1', 'Very satisfied'),
  ```

#### `createSurvey.preview.classic.option2`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 367)
  ```
  t('createSurvey.preview.classic.option2', 'Satisfied'),
  ```

#### `createSurvey.preview.classic.option3`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 368)
  ```
  t('createSurvey.preview.classic.option3', 'Neutral'),
  ```

#### `createSurvey.preview.classic.option4`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 369)
  ```
  t('createSurvey.preview.classic.option4', 'Dissatisfied'),
  ```

#### `createSurvey.preview.classic.question`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 359)
  ```
  {t('createSurvey.preview.classic.question', 'How satisfied are you with our service?')}
  ```

#### `createSurvey.preview.conversational.botMessage`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 417)
  ```
  {t('createSurvey.preview.conversational.botMessage', "Hi there! 👋 I'd love to hear your thoughts.")}
  ```

#### `createSurvey.preview.conversational.followUp`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 435)
  ```
  <p className="text-sm text-on-surface">{t('createSurvey.preview.conversational.followUp', 'Wonderful! What did you like most?')}</p>
  ```

#### `createSurvey.preview.conversational.placeholder`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 442)
  ```
  <span className="text-sm text-on-surface-variant">{t('createSurvey.preview.conversational.placeholder', 'Type your answer...')}</span>
  ```

#### `createSurvey.preview.conversational.userMessage`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 425)
  ```
  <p className="text-sm text-on-primary">{t('createSurvey.preview.conversational.userMessage', 'The experience was great!')}</p>
  ```

#### `createSurvey.preview.csat.rating`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 626)
  ```
  <span className="text-sm font-medium text-on-surface">{t('createSurvey.preview.csat.rating', '4 out of 5')}</span>
  ```

#### `createSurvey.preview.features`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 274)
  ```
  {t('createSurvey.preview.features', 'Features')}
  ```

#### `createSurvey.preview.nps.detractors`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 549)
  ```
  { label: t('createSurvey.preview.nps.detractors', 'Detractors'), color: 'bg-error-container/50' },
  ```

#### `createSurvey.preview.nps.passives`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 550)
  ```
  { label: t('createSurvey.preview.nps.passives', 'Passives'), color: 'bg-warning-container/50' },
  ```

#### `createSurvey.preview.nps.promoters`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 551)
  ```
  { label: t('createSurvey.preview.nps.promoters', 'Promoters'), color: 'bg-success-container/50' },
  ```

#### `createSurvey.preview.progress`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 394)
  ```
  <span>{t('createSurvey.preview.progress', 'Question 1 of 5')}</span>
  ```

#### `createSurvey.preview.research.subtitle`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 457)
  ```
  <p className="text-xs text-on-surface-variant">{t('createSurvey.preview.research.subtitle', 'Conjoint Analysis')}</p>
  ```

#### `createSurvey.preview.research.title`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 456)
  ```
  <p className="text-sm font-medium text-on-surface mb-1">{t('createSurvey.preview.research.title', 'Which option do you prefer?')}</p>
  ```

#### `createSurvey.preview.scale`

- `src/components/features/surveys/CreateSurveyDialog/CreateSurveyDialog.tsx` (Line 340)
  ```
  {t('createSurvey.preview.scale', 'Scale')}: {currentMetric.scaleMin}–{currentMetric.scaleMax}
  ```

#### `dialogs.confirmAction`

- `src/hooks/useEntityActions.ts` (Line 284)
  ```
  title: actionConfig.confirmTitle || t('dialogs.confirmAction', 'Confirm Action'),
  ```

#### `dialogs.confirmDescription`

- `src/hooks/useEntityActions.ts` (Line 281)
  ```
  : actionConfig.confirmDescription || t('dialogs.confirmDescription', 'Are you sure?');
  ```

#### `dialogs.deleteEntityDescription`

- `src/hooks/useEntityActions.ts` (Line 224)
  ```
  description: t('dialogs.deleteEntityDescription', {
  ```

#### `dialogs.deleteEntityTitle`

- `src/hooks/useEntityActions.ts` (Line 223)
  ```
  title: t('dialogs.deleteEntityTitle', { entity: capitalizedEntityName, defaultValue: `Delete ${capitalizedEntityName}` }),
  ```

#### `distributions.sentCountLabel`

- `src/pages/Distributions/components/DistributionCard.tsx` (Line 87)
  ```
  {t('distributions.sentCountLabel', { sent: distribution.sentCount, total: distribution.totalRecipients })}
  ```

#### `emailEditor.addBlockHint`

- `src/components/features/email-templates/visual-editor/BlockPalette.tsx` (Line 94)
  ```
  <p className="text-xs text-on-surface-variant px-1 mb-2">{t('emailEditor.addBlockHint', 'Click or drag blocks to add them')}</p>
  ```

#### `emailEditor.blockSettings`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 891)
  ```
  <p className="text-xs text-on-surface-variant">{t('emailEditor.blockSettings', 'Block Settings')}</p>
  ```

#### `emailEditor.blockToolbar`

- `src/components/features/email-templates/visual-editor/BlockEditor.tsx` (Line 106)
  ```
  aria-label={t('emailEditor.blockToolbar', 'Block actions')}
  ```

#### `emailEditor.columns`

- `src/components/features/email-templates/visual-editor/BlockEditor.tsx` (Line 352)
  ```
  {block.content.columns.length} {t('emailEditor.columns', 'columns')}
  ```
- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 594)
  ```
  {block.content.columns.length} {t('emailEditor.columns', 'columns')}
  ```

#### `emailEditor.copyHtml`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 612)
  ```
  <Tooltip content={t('emailEditor.copyHtml', 'Copy HTML')}>
  ```
- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 613)
  ```
  <IconButton variant="standard" size="sm" onClick={copyHtmlToClipboard} aria-label={t('emailEditor.copyHtml', 'Copy HTML')}>
  ```

#### `emailEditor.dividerStyles.dashed`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 496)
  ```
  { value: 'dashed', label: t('emailEditor.dividerStyles.dashed', 'Dashed') },
  ```

#### `emailEditor.dividerStyles.dotted`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 497)
  ```
  { value: 'dotted', label: t('emailEditor.dividerStyles.dotted', 'Dotted') },
  ```

#### `emailEditor.dividerStyles.solid`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 495)
  ```
  { value: 'solid', label: t('emailEditor.dividerStyles.solid', 'Solid') },
  ```

#### `emailEditor.downloadHtml`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 617)
  ```
  <Tooltip content={t('emailEditor.downloadHtml', 'Download HTML')}>
  ```
- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 618)
  ```
  <IconButton variant="standard" size="sm" onClick={downloadHtml} aria-label={t('emailEditor.downloadHtml', 'Download HTML')}>
  ```

#### `emailEditor.errors.loadFailed`

- `src/pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx` (Line 71)
  ```
  title={t('emailEditor.errors.loadFailed', 'Failed to load template')}
  ```

#### `emailEditor.errors.loadFailedDescription`

- `src/pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx` (Line 72)
  ```
  description={t('emailEditor.errors.loadFailedDescription', 'The email template could not be loaded. Please try again.')}
  ```

#### `emailEditor.errors.noTemplate`

- `src/pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx` (Line 90)
  ```
  title={t('emailEditor.errors.noTemplate', 'No template selected')}
  ```

#### `emailEditor.errors.noTemplateDescription`

- `src/pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx` (Line 91)
  ```
  description={t('emailEditor.errors.noTemplateDescription', 'Please select an email template to edit.')}
  ```

#### `emailEditor.hideSettings`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 864)
  ```
  content={showRightSidebar ? t('emailEditor.hideSettings', 'Hide settings panel') : t('emailEditor.showSettings', 'Show settings panel')}
  ```
- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 873)
  ```
  showRightSidebar ? t('emailEditor.hideSettings', 'Hide settings panel') : t('emailEditor.showSettings', 'Show settings panel')
  ```

#### `emailEditor.modeSwitched`

- `src/pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx` (Line 44)
  ```
  t('emailEditor.modeSwitched', 'Switched to {{mode}} editor. Unsaved changes may be lost.', {
  ```

#### `emailEditor.noBlockSelected`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 836)
  ```
  <h3 className="text-sm font-medium text-on-surface mb-1">{t('emailEditor.noBlockSelected', 'No block selected')}</h3>
  ```

#### `emailEditor.placeholderCopied`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 989)
  ```
  copy(key, { successMessage: t('emailEditor.placeholderCopied', { key, defaultValue: `Copied ${key}` }) });
  ```

#### `emailEditor.preheaderLabel`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 724)
  ```
  {t('emailEditor.preheaderLabel', 'Preheader')}
  ```

#### `emailEditor.preheaderPlaceholder`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 736)
  ```
  placeholder={t('emailEditor.preheaderPlaceholder', 'Preview text shown in inbox before opening the email...')}
  ```

#### `emailEditor.preheaderTooltip`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 711)
  ```
  <Tooltip content={t('emailEditor.preheaderTooltip', 'Preview text shown in inbox before opening the email')}>
  ```

#### `emailEditor.previewWithSampleData`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 802)
  ```
  <span className="text-sm text-on-surface-variant">{t('emailEditor.previewWithSampleData', 'Preview with sample data')}</span>
  ```

#### `emailEditor.sampleDataInfo`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 804)
  ```
  <Tooltip content={t('emailEditor.sampleDataInfo', 'Replaces placeholders like {{firstName}} with sample values')}>
  ```

#### `emailEditor.selectBlockHint`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 838)
  ```
  {t('emailEditor.selectBlockHint', 'Select a block in the canvas to edit its properties')}
  ```

#### `emailEditor.settings.address`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 770)
  ```
  <SettingsField label={t('emailEditor.settings.address', 'Address')}>
  ```

#### `emailEditor.settings.button`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 361)
  ```
  <SettingsSection title={t('emailEditor.settings.button', 'Button')}>
  ```

#### `emailEditor.settings.colors`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 252)
  ```
  <SettingsSection title={t('emailEditor.settings.colors', 'Colors')}>
  ```

#### `emailEditor.settings.columns`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 591)
  ```
  <SettingsSection title={t('emailEditor.settings.columns', 'Columns')}>
  ```

#### `emailEditor.settings.companyInfo`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 762)
  ```
  <SettingsSection title={t('emailEditor.settings.companyInfo', 'Company Info')}>
  ```

#### `emailEditor.settings.divider`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 476)
  ```
  <SettingsSection title={t('emailEditor.settings.divider', 'Divider')}>
  ```

#### `emailEditor.settings.horizontal`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 443)
  ```
  <SettingsField label={t('emailEditor.settings.horizontal', 'Horizontal')}>
  ```

#### `emailEditor.settings.htmlContent`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 216)
  ```
  <SettingsField label={t('emailEditor.settings.htmlContent', 'HTML Content')}>
  ```

#### `emailEditor.settings.image`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 287)
  ```
  <SettingsSection title={t('emailEditor.settings.image', 'Image')}>
  ```

#### `emailEditor.settings.layout`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 313)
  ```
  <SettingsSection title={t('emailEditor.settings.layout', 'Layout')}>
  ```
- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 631)
  ```
  <SettingsSection title={t('emailEditor.settings.layout', 'Layout')}>
  ```

#### `emailEditor.settings.logo`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 138)
  ```
  <SettingsSection title={t('emailEditor.settings.logo', 'Logo')}>
  ```

#### `emailEditor.settings.preview`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 543)
  ```
  <div className="text-xs text-on-surface-variant text-center mb-2">{t('emailEditor.settings.preview', 'Preview')}</div>
  ```

#### `emailEditor.settings.spacer`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 528)
  ```
  <SettingsSection title={t('emailEditor.settings.spacer', 'Spacer')}>
  ```

#### `emailEditor.settings.stackOnMobile`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 654)
  ```
  label={t('emailEditor.settings.stackOnMobile', 'Stack on mobile')}
  ```

#### `emailEditor.settings.typography`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 224)
  ```
  <SettingsSection title={t('emailEditor.settings.typography', 'Typography')}>
  ```

#### `emailEditor.settings.unsubscribe`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 782)
  ```
  <SettingsSection title={t('emailEditor.settings.unsubscribe', 'Unsubscribe')}>
  ```

#### `emailEditor.settings.vertical`

- `src/components/features/email-templates/visual-editor/BlockSettingsPanel.tsx` (Line 425)
  ```
  <SettingsField label={t('emailEditor.settings.vertical', 'Vertical')}>
  ```

#### `emailEditor.showSettings`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 864)
  ```
  content={showRightSidebar ? t('emailEditor.hideSettings', 'Hide settings panel') : t('emailEditor.showSettings', 'Show settings panel')}
  ```
- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 873)
  ```
  showRightSidebar ? t('emailEditor.hideSettings', 'Hide settings panel') : t('emailEditor.showSettings', 'Show settings panel')
  ```

#### `emailEditor.styles.colors`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 908)
  ```
  <h4 className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">{t('emailEditor.styles.colors', 'Colors')}</h4>
  ```

#### `emailEditor.styles.layout`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 948)
  ```
  <h4 className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">{t('emailEditor.styles.layout', 'Layout')}</h4>
  ```

#### `emailEditor.styles.typography`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 935)
  ```
  <h4 className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">{t('emailEditor.styles.typography', 'Typography')}</h4>
  ```

#### `emailEditor.subjectLabel`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 699)
  ```
  {t('emailEditor.subjectLabel', 'Subject Line')}
  ```

#### `emailEditor.subjectPlaceholder`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 704)
  ```
  placeholder={t('emailEditor.subjectPlaceholder', 'e.g., {{survey.title}} - We need your feedback')}
  ```

#### `emailEditor.templateNameLabel`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 679)
  ```
  {t('emailEditor.templateNameLabel', 'Template Name')}
  ```

#### `emailEditor.toolbar`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 564)
  ```
  <div className="flex items-center gap-3" role="toolbar" aria-label={t('emailEditor.toolbar', 'Editor toolbar')}>
  ```

#### `emailEditor.typeLabel`

- `src/components/features/email-templates/visual-editor/VisualEmailEditor.tsx` (Line 691)
  ```
  <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">{t('emailEditor.typeLabel', 'Type')}</label>
  ```

#### `emailTemplates.backToTemplates`

- `src/pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx` (Line 94)
  ```
  label: t('emailTemplates.backToTemplates', 'Back to Templates'),
  ```

#### `emailTemplates.editor.code`

- `src/pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx` (Line 45)
  ```
  mode: mode === 'visual' ? t('emailTemplates.editor.visual', 'Visual') : t('emailTemplates.editor.code', 'Code'),
  ```

#### `emailTemplates.editor.visual`

- `src/pages/EmailTemplateEditor/EmailTemplateEditorPage.tsx` (Line 45)
  ```
  mode: mode === 'visual' ? t('emailTemplates.editor.visual', 'Visual') : t('emailTemplates.editor.code', 'Code'),
  ```

#### `linksPanel.types.campaign`

- `src/components/features/distributions/LinksPanel.tsx` (Line 93)
  ```
  label: t('linksPanel.types.campaign', 'Campaign'),
  ```

#### `linksPanel.types.campaignDescription`

- `src/components/features/distributions/LinksPanel.tsx` (Line 96)
  ```
  description: t('linksPanel.types.campaignDescription', 'Campaign tracking link'),
  ```

#### `linksPanel.types.qrCode`

- `src/components/features/distributions/LinksPanel.tsx` (Line 99)
  ```
  label: t('linksPanel.types.qrCode', 'QR Code'),
  ```

#### `linksPanel.types.qrCodeDescription`

- `src/components/features/distributions/LinksPanel.tsx` (Line 102)
  ```
  description: t('linksPanel.types.qrCodeDescription', 'QR code link'),
  ```

#### `localization.defaultLanguage`

- `src/components/features/localization/LanguageList.tsx` (Line 176)
  ```
  <Tooltip content={t('localization.defaultLanguage', 'Default language')}>
  ```

#### `localization.description`

- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 341)
  ```
  {sourceLang.flag} {t('localization.description', 'Description')}
  ```
- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 352)
  ```
  {targetLang.flag} {t('localization.description', 'Description')}
  ```

#### `localization.disable`

- `src/components/features/localization/LanguageList.tsx` (Line 283)
  ```
  {isEnabled ? t('localization.disable', 'Disable') : t('localization.enable', 'Enable')}
  ```

#### `localization.disabled`

- `src/components/features/localization/LanguageList.tsx` (Line 186)
  ```
  {t('localization.disabled', 'Disabled')}
  ```

#### `localization.editingFallback`

- `src/components/features/questions/QuestionEditor.tsx` (Line 261)
  ```
  ? t('localization.editingFallback', 'Editing (fallback)')
  ```

#### `localization.editingTranslation`

- `src/components/features/localization/LanguagesTab.tsx` (Line 490)
  ```
  <p className="text-xs text-on-surface-variant">{t('localization.editingTranslation', 'Editing translation')}</p>
  ```
- `src/components/features/questions/QuestionEditor.tsx` (Line 262)
  ```
  : t('localization.editingTranslation', 'Editing {{lang}}', { lang: translated.editingLanguage.toUpperCase() })}
  ```

#### `localization.editTranslations`

- `src/components/features/localization/LanguageList.tsx` (Line 278)
  ```
  {t('localization.editTranslations', 'Edit Translations')}
  ```

#### `localization.enable`

- `src/components/features/localization/LanguageList.tsx` (Line 283)
  ```
  {isEnabled ? t('localization.disable', 'Disable') : t('localization.enable', 'Enable')}
  ```

#### `localization.export`

- `src/components/features/localization/LanguagesTab.tsx` (Line 727)
  ```
  {t('localization.export', 'Export')}
  ```

#### `localization.highRatingLabel`

- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 423)
  ```
  {sourceLang.flag} {t('localization.highRatingLabel', 'High Rating Label')}
  ```
- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 432)
  ```
  {targetLang.flag} {t('localization.highRatingLabel', 'High Rating Label')}
  ```

#### `localization.import`

- `src/components/features/localization/LanguagesTab.tsx` (Line 731)
  ```
  {t('localization.import', 'Import')}
  ```

#### `localization.languagesDescription`

- `src/components/features/localization/LanguagesTab.tsx` (Line 719)
  ```
  <p className="text-sm text-on-surface-variant mt-0.5">{t('localization.languagesDescription', 'Manage translations for your survey')}</p>
  ```

#### `localization.lowRatingLabel`

- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 387)
  ```
  {sourceLang.flag} {t('localization.lowRatingLabel', 'Low Rating Label')}
  ```
- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 396)
  ```
  {targetLang.flag} {t('localization.lowRatingLabel', 'Low Rating Label')}
  ```

#### `localization.needsWork`

- `src/components/features/localization/LanguageList.tsx` (Line 258)
  ```
  <span>{t('localization.needsWork', 'Needs work')}</span>
  ```

#### `localization.noLanguages`

- `src/components/features/localization/LanguageList.tsx` (Line 328)
  ```
  <p className="text-on-surface-variant">{t('localization.noLanguages', 'No languages configured')}</p>
  ```
- `src/components/features/localization/LanguagesTab.tsx` (Line 757)
  ```
  title={t('localization.noLanguages', 'No languages configured')}
  ```

#### `localization.noLanguagesDesc`

- `src/components/features/localization/LanguagesTab.tsx` (Line 758)
  ```
  description={t('localization.noLanguagesDesc', 'Add languages to make your survey available in multiple languages.')}
  ```

#### `localization.noQuestions`

- `src/components/features/localization/LanguagesTab.tsx` (Line 576)
  ```
  title={t('localization.noQuestions', 'No questions to translate')}
  ```
- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 531)
  ```
  <p className="text-on-surface-variant">{t('localization.noQuestions', 'No questions to translate')}</p>
  ```

#### `localization.noQuestionsDesc`

- `src/components/features/localization/LanguagesTab.tsx` (Line 577)
  ```
  description={t('localization.noQuestionsDesc', 'Add questions to your survey first, then come back to translate them.')}
  ```

#### `localization.optionsCount`

- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 461)
  ```
  {t('localization.optionsCount', '{{count}} options', {
  ```

#### `localization.optionsTranslationHint`

- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 479)
  ```
  {t('localization.optionsTranslationHint', 'Option translations coming in next update')}
  ```

#### `localization.questions`

- `src/components/features/localization/LanguagesTab.tsx` (Line 525)
  ```
  {t('localization.questions', 'Questions')} ({questionsWithSettings.length})
  ```
- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 540)
  ```
  <h3 className="text-base font-semibold text-on-surface">{t('localization.questions', 'Questions')}</h3>
  ```

#### `localization.questionsCount`

- `src/components/features/localization/LanguagesTab.tsx` (Line 783)
  ```
  {t('localization.questionsCount', '{{count}} questions', { count: questions.length })}
  ```

#### `localization.questionsLabel`

- `src/components/features/localization/LanguageList.tsx` (Line 249)
  ```
  <span className="text-on-surface-variant/70">{t('localization.questionsLabel', 'questions')}</span>
  ```

#### `localization.questionsProgress`

- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 543)
  ```
  {t('localization.questionsProgress', '{{complete}}/{{total}} complete', {
  ```

#### `localization.questionText`

- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 303)
  ```
  {sourceLang.flag} {t('localization.questionText', 'Question Text')}
  ```
- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 313)
  ```
  {targetLang.flag} {t('localization.questionText', 'Question Text')}
  ```

#### `localization.ratingLabels`

- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 378)
  ```
  {t('localization.ratingLabels', 'Rating Labels')}
  ```

#### `localization.source`

- `src/components/features/localization/LanguageList.tsx` (Line 201)
  ```
  {t('localization.source', 'Source')}
  ```

#### `localization.surveyFieldsProgress`

- `src/components/features/localization/LanguagesTab.tsx` (Line 537)
  ```
  label={t('localization.surveyFieldsProgress', 'Survey fields progress')}
  ```

#### `localization.totalLanguages`

- `src/components/features/localization/LanguagesTab.tsx` (Line 780)
  ```
  {t('localization.totalLanguages', '{{count}} languages configured', { count: languageStats.length })}
  ```

#### `localization.translationComplete`

- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 274)
  ```
  <Tooltip content={t('localization.translationComplete', 'Translation complete')}>
  ```

#### `localization.translationIncomplete`

- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 282)
  ```
  content={t('localization.translationIncomplete', '{{percent}}% translated', {
  ```

#### `localization.untitledQuestion`

- `src/components/features/localization/QuestionTranslationsEditor.tsx` (Line 267)
  ```
  {sourceText || t('localization.untitledQuestion', 'Untitled Question')}
  ```

#### `profile.avatar.description`

- `src/pages/Settings/sections/ProfileSection.tsx` (Line 102)
  ```
  <CardDescription>{t('profile.avatar.description')}</CardDescription>
  ```

#### `profile.avatar.removed`

- `src/pages/Settings/sections/ProfileSection.tsx` (Line 65)
  ```
  toast.success(t('profile.avatar.removed'));
  ```

#### `profile.avatar.title`

- `src/pages/Settings/sections/ProfileSection.tsx` (Line 100)
  ```
  {t('profile.avatar.title')}
  ```

#### `profile.avatar.updated`

- `src/pages/Settings/sections/ProfileSection.tsx` (Line 60)
  ```
  toast.success(t('profile.avatar.updated'));
  ```

#### `questionPreview.questionText`

- `src/components/features/public-survey/UnifiedQuestionPreview.tsx` (Line 182)
  ```
  {publicQuestion.text || t('questionPreview.questionText', 'Question text')}
  ```

#### `search.noRecentItems`

- `src/components/features/search/GlobalSearch.tsx` (Line 265)
  ```
  <p className="text-on-surface font-medium">{t('search.noRecentItems')}</p>
  ```

#### `search.noResults`

- `src/components/features/search/GlobalSearch.tsx` (Line 254)
  ```
  <p className="text-on-surface font-medium">{t('search.noResults')}</p>
  ```

#### `search.placeholder`

- `src/components/features/search/GlobalSearch.tsx` (Line 214)
  ```
  placeholder={t('search.placeholder')}
  ```

#### `search.recent`

- `src/components/features/search/GlobalSearch.tsx` (Line 231)
  ```
  {searchQuery.length >= 2 ? t('search.results') : t('search.recent')}
  ```

#### `search.results`

- `src/components/features/search/GlobalSearch.tsx` (Line 231)
  ```
  {searchQuery.length >= 2 ? t('search.results') : t('search.recent')}
  ```

#### `search.startTyping`

- `src/components/features/search/GlobalSearch.tsx` (Line 266)
  ```
  <p className="text-on-surface-variant text-sm mt-1">{t('search.startTyping')}</p>
  ```

#### `search.toClose`

- `src/components/features/search/GlobalSearch.tsx` (Line 290)
  ```
  <span>{t('search.toClose')}</span>
  ```

#### `search.toNavigate`

- `src/components/features/search/GlobalSearch.tsx` (Line 286)
  ```
  <span>{t('search.toNavigate')}</span>
  ```

#### `search.toSelect`

- `src/components/features/search/GlobalSearch.tsx` (Line 277)
  ```
  <span>{t('search.toSelect')}</span>
  ```

#### `search.tryDifferentKeywords`

- `src/components/features/search/GlobalSearch.tsx` (Line 255)
  ```
  <p className="text-on-surface-variant text-sm mt-1">{t('search.tryDifferentKeywords')}</p>
  ```

#### `settings.copyFailed`

- `src/hooks/useCopyToClipboard.ts` (Line 38)
  ```
  *   errorMessage: t('settings.copyFailed')
  ```

#### `settings.keyCopied`

- `src/hooks/useCopyToClipboard.ts` (Line 37)
  ```
  *   successMessage: t('settings.keyCopied'),
  ```

#### `shortcuts.willAppear`

- `src/components/features/search/KeyboardShortcutsHelp.tsx` (Line 115)
  ```
  <p className="text-on-surface-variant text-sm mt-1">{t('shortcuts.willAppear')}</p>
  ```

#### `surveyBuilder.add`

- `src/pages/SurveyBuilder/components/QuestionListSidebar.tsx` (Line 239)
  ```
  {t('surveyBuilder.add', 'Add')}
  ```

#### `surveyBuilder.addFirstQuestionDesc`

- `src/pages/SurveyBuilder/components/QuestionListSidebar.tsx` (Line 302)
  ```
  {t('surveyBuilder.addFirstQuestionDesc', 'Start building your survey by adding your first question')}
  ```

#### `surveyBuilder.dragToReorder`

- `src/pages/SurveyBuilder/components/QuestionListSidebar.tsx` (Line 252)
  ```
  <span>{t('surveyBuilder.dragToReorder', 'Drag to reorder questions')}</span>
  ```

#### `surveyBuilder.selectQuestion`

- `src/pages/SurveyBuilder/SurveyBuilderPage.tsx` (Line 309)
  ```
  title={questions.length === 0 ? t('surveyBuilder.noQuestions') : t('surveyBuilder.selectQuestion', 'Select a question')}
  ```

#### `surveyBuilder.selectQuestionDesc`

- `src/pages/SurveyBuilder/SurveyBuilderPage.tsx` (Line 313)
  ```
  : t('surveyBuilder.selectQuestionDesc', 'Choose a question from the list to edit, or add a new one')
  ```

#### `surveyBuilder.tabs.languages`

- `src/pages/SurveyBuilder/components/SurveyBuilderTabs.tsx` (Line 83)
  ```
  {t('surveyBuilder.tabs.languages', 'Languages')}
  ```

#### `surveyBuilder.tabs.questions`

- `src/pages/SurveyBuilder/components/SurveyBuilderTabs.tsx` (Line 77)
  ```
  {t('surveyBuilder.tabs.questions', 'Questions')}
  ```

#### `surveyPreview.previewLanguage`

- `src/pages/SurveyPreview/components/PreviewLanguageSwitcher.tsx` (Line 112)
  ```
  <p className="text-xs font-medium text-on-surface-variant">{t('surveyPreview.previewLanguage', 'Preview Language')}</p>
  ```

#### `surveyPreview.selectLanguage`

- `src/pages/SurveyPreview/components/PreviewLanguageSwitcher.tsx` (Line 108)
  ```
  aria-label={t('surveyPreview.selectLanguage', 'Select language')}
  ```

#### `surveyPreview.switchPreviewLanguage`

- `src/pages/SurveyPreview/components/PreviewLanguageSwitcher.tsx` (Line 78)
  ```
  <Tooltip content={t('surveyPreview.switchPreviewLanguage', 'Switch preview language')}>
  ```
- `src/pages/SurveyPreview/components/PreviewLanguageSwitcher.tsx` (Line 88)
  ```
  aria-label={t('surveyPreview.switchPreviewLanguage', 'Switch preview language')}
  ```

#### `surveyPreview.testModeOff`

- `src/pages/SurveyPreview/components/PreviewToolbar.tsx` (Line 332)
  ```
  <Tooltip content={isTestMode ? t('surveyPreview.testModeDesc', 'No data is saved') : t('surveyPreview.testModeOff', 'Test mode is off')}>
  ```

#### `templates.form.language`

- `src/components/features/templates/CreateTemplateDialog.tsx` (Line 259)
  ```
  <span className="text-sm text-on-surface-variant">{t('templates.form.language', 'Language')}:</span>
  ```

#### `themeEditor.bodyFont`

- `src/components/features/themes/ThemeEditorDrawer.tsx` (Line 457)
  ```
  <span className='text-sm font-semibold text-on-surface block mb-3'>{t('themeEditor.bodyFont', 'Body Font')}</span>
  ```

#### `themeEditor.brandColors`

- `src/components/features/themes/ThemeEditorDrawer.tsx` (Line 416)
  ```
  <span className='text-xs font-medium text-on-surface-variant block mb-3'>{t('themeEditor.brandColors', 'Brand Colors')}</span>
  ```

#### `themeEditor.colors.accent`

- `src/components/features/themes/ThemeEditorDrawer.tsx` (Line 426)
  ```
  label={t('themeEditor.colors.accent', 'Accent')}
  ```

#### `themeEditor.colors.surface`

- `src/components/features/themes/ThemeEditorDrawer.tsx` (Line 444)
  ```
  label={t('themeEditor.colors.surface', 'Surface')}
  ```

#### `themeEditor.containerWidth`

- `src/components/features/themes/ThemeEditorDrawer.tsx` (Line 568)
  ```
  <span className='text-sm font-semibold text-on-surface block mb-3'>{t('themeEditor.containerWidth', 'Container Width')}</span>
  ```

#### `themeEditor.cornerRadius`

- `src/components/features/themes/ThemeEditorDrawer.tsx` (Line 544)
  ```
  {t('themeEditor.cornerRadius', 'Corner Radius')}
  ```

#### `themeEditor.headingFont`

- `src/components/features/themes/ThemeEditorDrawer.tsx` (Line 486)
  ```
  <span className='text-sm font-semibold text-on-surface block mb-3'>{t('themeEditor.headingFont', 'Heading Font')}</span>
  ```

#### `themeEditor.progressIndicator`

- `src/components/features/themes/ThemeEditorDrawer.tsx` (Line 613)
  ```
  <span className='text-sm font-semibold text-on-surface block mb-3'>{t('themeEditor.progressIndicator', 'Progress Indicator')}</span>
  ```

#### `themeEditor.questionNumbers`

- `src/components/features/themes/ThemeEditorDrawer.tsx` (Line 651)
  ```
  <span className='text-sm font-semibold text-on-surface block mb-3'>{t('themeEditor.questionNumbers', 'Question Numbers')}</span>
  ```

#### `themeEditor.spacing`

- `src/components/features/themes/ThemeEditorDrawer.tsx` (Line 591)
  ```
  <span className='text-sm font-semibold text-on-surface block mb-3'>{t('themeEditor.spacing', 'Spacing')}</span>
  ```

#### `themeEditor.surfaceColors`

- `src/components/features/themes/ThemeEditorDrawer.tsx` (Line 435)
  ```
  <span className='text-xs font-medium text-on-surface-variant block mb-3'>{t('themeEditor.surfaceColors', 'Surface Colors')}</span>
  ```

#### `themeEditor.tabs.layout`

- `src/components/features/themes/ThemeEditorDrawer.tsx` (Line 373)
  ```
  <Sliders className='h-4 w-4 mr-2' /> {t('themeEditor.tabs.layout', 'Layout')}
  ```

#### `themes.bodyFont`

- `src/components/features/surveys/ThemePreviewPanel.tsx` (Line 668)
  ```
  <span className='text-xs font-medium text-on-surface-variant block mb-2'>{t('themes.bodyFont', 'Body Font')}</span>
  ```

#### `themes.brandColors`

- `src/components/features/surveys/ThemePreviewPanel.tsx` (Line 623)
  ```
  <span className='text-xs font-medium text-on-surface-variant block mb-2'>{t('themes.brandColors', 'Brand Colors')}</span>
  ```

#### `themes.containerWidth`

- `src/components/features/surveys/ThemePreviewPanel.tsx` (Line 729)
  ```
  <span className='text-xs font-medium text-on-surface-variant block mb-2'>{t('themes.containerWidth', 'Container Width')}</span>
  ```

#### `themes.layoutSpacing`

- `src/components/features/surveys/ThemePreviewPanel.tsx` (Line 725)
  ```
  {t('themes.layoutSpacing', 'Layout & Spacing')}
  ```

#### `themes.spacing`

- `src/components/features/surveys/ThemePreviewPanel.tsx` (Line 752)
  ```
  <span className='text-xs font-medium text-on-surface-variant block mb-2'>{t('themes.spacing', 'Spacing')}</span>
  ```

#### `themes.surface`

- `src/components/features/surveys/ThemePreviewPanel.tsx` (Line 644)
  ```
  label={t('themes.surface', 'Surface')}
  ```

#### `themes.surfaceColors`

- `src/components/features/surveys/ThemePreviewPanel.tsx` (Line 636)
  ```
  <span className='text-xs font-medium text-on-surface-variant block mb-2'>{t('themes.surfaceColors', 'Surface Colors')}</span>
  ```

#### `themes.textPrimary`

- `src/components/features/surveys/ThemePreviewPanel.tsx` (Line 650)
  ```
  label={t('themes.textPrimary', 'Text')}
  ```

#### `welcomeScreen.anonymousNote`

- `src/components/features/public-survey/WelcomeScreen.tsx` (Line 222)
  ```
  {t('welcomeScreen.anonymousNote', { defaultValue: 'Your responses help us improve' })}
  ```

#### `welcomeScreen.starting`

- `src/components/features/public-survey/WelcomeScreen.tsx` (Line 216)
  ```
  <span>{isStarting ? t('welcomeScreen.starting', { defaultValue: 'Starting...' }) : t('welcomeScreen.startSurvey')}</span>
  ```


---

## Note About Dynamic Keys

This script only checks **static** translation keys. The following patterns use dynamic keys
and cannot be automatically verified:

- `t(variable)` - key from a variable
- `t(`prefix.${dynamic}`)` - template literal keys
- `t(obj.property)` - key from object property

These should be manually reviewed to ensure all possible runtime values exist in en.json.
