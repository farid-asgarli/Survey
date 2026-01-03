# Missing Translations Report

Generated: 2026-01-03T08:55:47.977Z

## Summary

| Metric | Count |
|--------|-------|
| Total unique keys in codebase | 2113 |
| Keys found in en.json | 2110 |
| Keys MISSING (added) | 3 |

## ❌ Missing Keys (Added with "TODO-Translate")

These keys were found in the codebase but were NOT in en.json.
They have been added with the value `"TODO-Translate"`.

| Key | Used In |
|-----|---------|
| `questionEditor.livePreview` | src\components\features\questions\QuestionEditor.tsx |
| `questionEditor.logic` | src\components\features\questions\QuestionEditor.tsx |
| `questionEditor.previewDescription` | src\components\features\questions\QuestionEditor.tsx |


### Detailed Usage of Missing Keys

#### `questionEditor.livePreview`

- `src\components\features\questions\QuestionEditor.tsx` (Line 362)
  ```
  <p className="text-sm font-semibold text-on-surface">{t('questionEditor.livePreview', 'Live Preview')}</p>
  ```

#### `questionEditor.logic`

- `src\components\features\questions\QuestionEditor.tsx` (Line 298)
  ```
  {t('questionEditor.logic', 'Logic')}
  ```
- `src\components\features\questions\QuestionEditor.tsx` (Line 307)
  ```
  {t('questionEditor.logic', 'Logic')}
  ```
- `src\components\features\questions\QuestionEditor.tsx` (Line 497)
  ```
  {t('questionEditor.logic', 'Logic')}
  ```

#### `questionEditor.previewDescription`

- `src\components\features\questions\QuestionEditor.tsx` (Line 363)
  ```
  <p className="text-xs text-on-surface-variant">{t('questionEditor.previewDescription', 'How respondents will see this')}</p>
  ```


---

## Note About Dynamic Keys

This script only checks **static** translation keys. The following patterns use dynamic keys
and cannot be automatically verified:

- `t(variable)` - key from a variable
- `t(`prefix.${dynamic}`)` - template literal keys
- `t(obj.property)` - key from object property

These should be manually reviewed to ensure all possible runtime values exist in en.json.
