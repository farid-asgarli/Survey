#!/usr/bin/env node

/**
 * Localization Audit Script
 *
 * This script performs two main checks:
 * 1. Finds all translation keys used in the code (t('key') patterns) that are missing from locale JSON files
 * 2. Finds potential hardcoded strings that should be localized
 *
 * Usage: node scripts/check-localization.js
 * Output: Writes results to scripts/localization-audit-report.md
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  srcDir: path.join(__dirname, '..', 'src'),
  localesDir: path.join(__dirname, '..', 'src', 'i18n', 'locales'),
  outputFile: path.join(__dirname, 'localization-audit-report.md'),
  primaryLocale: 'en.json',
  // File extensions to scan
  extensions: ['.tsx', '.ts', '.jsx', '.js'],
  // Directories to skip
  skipDirs: ['node_modules', 'dist', 'build', '.git', 'coverage'],
  // Patterns that look like translation keys (showing the key instead of translated text)
  suspiciousKeyPatterns: [
    /[a-z]+\.[a-z]+[A-Z][a-zA-Z]+/, // camelCase with dot notation like "themeEditor.createTitle"
    /[a-z]+\.[a-z]+\.[a-z]+/i, // multiple dots like "section.subsection.key"
  ],
  // Minimum word length to consider as potentially hardcoded text
  minHardcodedLength: 3,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Recursively get all files with specified extensions
 */
function getAllFiles(dir, extensions, skipDirs) {
  const files = [];

  function walk(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!skipDirs.includes(item)) {
            walk(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${currentDir}:`, err.message);
    }
  }

  walk(dir);
  return files;
}

/**
 * Load and parse JSON file
 */
function loadJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error loading JSON from ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Flatten nested object keys with dot notation
 */
function flattenKeys(obj, prefix = '') {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Get value from nested object using dot notation
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Extract all t() translation key usages from source code
 */
function extractTranslationKeys(content, filePath) {
  const keys = [];

  // Match various t() patterns:
  // t('key'), t("key"), t(`key`)
  // t('key', { ... })
  // Also match patterns like {t('key')}
  const patterns = [/\bt\(\s*['"`]([^'"`]+)['"`]/g, /\bt\(\s*['"`]([^'"`]+)['"`]\s*,/g];

  // Also match indirect key references:
  // labelKey: 'key', titleKey: 'key', descriptionKey: 'key', etc.
  const indirectPatterns = [
    /(?:labelKey|titleKey|descriptionKey|messageKey|textKey|placeholderKey|tooltipKey|key)\s*:\s*['"`]([^'"`]+)['"`]/g,
    // Match i18nKey prop pattern: i18nKey="some.key"
    /i18nKey\s*=\s*['"`]([^'"`]+)['"`]/g,
    // Match string literals that look like translation keys in object values
    /:\s*['"`]([a-zA-Z]+\.[a-zA-Z]+(?:\.[a-zA-Z]+)*)['"`]/g,
  ];

  // Patterns to skip (not translation keys)
  const skipPatterns = [
    /^[a-z]+\.(com|org|net|io|dev|app)$/i, // Domain names like example.com
    /^[a-z]+\.[a-z]+@/i, // Email patterns
    /^\d+\.\d+/, // Version numbers
    /\.(com|org|net|io)$/i, // Ends with TLD
  ];

  const shouldSkipKey = (key) => skipPatterns.some((p) => p.test(key));

  // Extract dynamic key prefixes from template literals like t(`prefix.${var}`)
  const dynamicPatterns = [
    /\bt\(\s*`([^`$]+)\$\{/g, // Capture prefix before ${
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const key = match[1];
      // Skip if the key contains template literals ${...} or matches skip patterns
      if (!key.includes('${') && !shouldSkipKey(key)) {
        // Find line number
        const lineNumber = content.substring(0, match.index).split('\n').length;
        keys.push({
          key,
          file: filePath,
          line: lineNumber,
        });
      }
    }
  }

  // Check indirect patterns
  for (const pattern of indirectPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const key = match[1];
      // Only include if it looks like a translation key (contains a dot) and not a skip pattern
      if (key.includes('.') && !key.includes('${') && !key.includes('/') && !key.includes('http') && !shouldSkipKey(key)) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        keys.push({
          key,
          file: filePath,
          line: lineNumber,
          isDynamic: false,
        });
      }
    }
  }

  // Check dynamic patterns and mark their prefixes
  for (const pattern of dynamicPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const prefix = match[1];
      if (prefix && prefix.includes('.')) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        keys.push({
          key: prefix,
          file: filePath,
          line: lineNumber,
          isDynamicPrefix: true,
        });
      }
    }
  }

  return keys;
}

/**
 * Find potential hardcoded English strings in JSX
 */
function findHardcodedStrings(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  // Patterns for common hardcoded text locations
  const patterns = [
    // JSX text content: >Some text< (but not inside {})
    {
      regex: />([A-Z][a-zA-Z\s]{2,}[a-zA-Z])</g,
      type: 'JSX text content',
    },
    // String props that might need localization (excluding className, style, etc.)
    {
      regex: /(?:title|label|placeholder|description|message|text|alt|aria-label)=["']([A-Z][^"']{2,})["']/gi,
      type: 'String prop',
    },
    // Button/heading text in JSX
    {
      regex: /<(?:Button|button|h[1-6]|p|span|label|Title|Description)[^>]*>([A-Z][a-zA-Z\s]{2,}[a-zA-Z])</gi,
      type: 'Element text',
    },
  ];

  // Common false positives to skip
  const skipPatterns = [
    /^[A-Z][A-Z0-9_]+$/, // Constants like "API" or "HTTP_ERROR"
    /^(GET|POST|PUT|DELETE|PATCH)$/,
    /^(true|false|null|undefined)$/i,
    /^[A-Z]{2,3}$/, // Short acronyms
    /^(Loading|Error|OK)\.{3}?$/, // Common UI states that might be intentional
    /^(px|em|rem|vh|vw|%|rgb|rgba|hsl|hsla)/, // CSS values
    /^#[0-9a-fA-F]{3,8}$/, // Hex colors
    /^https?:\/\//, // URLs
    /^[a-z]+[A-Z][a-zA-Z]+$/, // camelCase - likely variable names
  ];

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    // Skip import statements and comments
    if (line.trim().startsWith('import ') || line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
      continue;
    }

    // Skip lines that already use t()
    if (line.includes('t(') || line.includes('t`')) {
      continue;
    }

    for (const { regex, type } of patterns) {
      let match;
      regex.lastIndex = 0;

      while ((match = regex.exec(line)) !== null) {
        const text = match[1].trim();

        // Skip short strings and false positives
        if (text.length < CONFIG.minHardcodedLength) continue;
        if (skipPatterns.some((p) => p.test(text))) continue;

        // Skip if it looks like a CSS class or code
        if (text.includes('-') && text.includes(' ') === false) continue;
        if (text.includes('_') && !text.includes(' ')) continue;

        issues.push({
          text,
          file: filePath,
          line: lineNum + 1,
          type,
        });
      }
    }
  }

  return issues;
}

/**
 * Check if displayed text looks like an untranslated key
 * (e.g., showing "themeEditor.createTitle" instead of "Create Theme")
 */
function findDisplayedKeys(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  // Look for JSX that outputs something that looks like a translation key
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    // Check for text that looks like translation keys in displayed content
    for (const pattern of CONFIG.suspiciousKeyPatterns) {
      const matches = line.match(pattern);
      if (matches) {
        // Additional check: ensure it's in a display context
        // This is indicated by being inside JSX or a label/title prop
        if (line.includes('>') || line.includes('title=') || line.includes('label=') || line.includes('placeholder=')) {
          issues.push({
            suspectedKey: matches[0],
            file: filePath,
            line: lineNum + 1,
            context: line.trim().substring(0, 100),
          });
        }
      }
    }
  }

  return issues;
}

/**
 * Compare locale files and find missing translations
 */
function compareLocales(primaryKeys, primaryLocale, otherLocales) {
  const missingByLocale = {};

  for (const [localeName, localeData] of Object.entries(otherLocales)) {
    const localeKeys = flattenKeys(localeData);
    const missing = primaryKeys.filter((key) => !localeKeys.includes(key));
    const extra = localeKeys.filter((key) => !primaryKeys.includes(key));

    missingByLocale[localeName] = {
      missing,
      extra,
    };
  }

  return missingByLocale;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log('🔍 Starting Localization Audit...\n');

  // Load locale files
  console.log('📂 Loading locale files...');
  const primaryLocalePath = path.join(CONFIG.localesDir, CONFIG.primaryLocale);
  const primaryLocale = loadJson(primaryLocalePath);

  if (!primaryLocale) {
    console.error('❌ Failed to load primary locale file');
    process.exit(1);
  }

  const primaryKeys = flattenKeys(primaryLocale);
  console.log(`   Found ${primaryKeys.length} keys in ${CONFIG.primaryLocale}`);

  // Load other locales
  const otherLocales = {};
  const localeFiles = fs.readdirSync(CONFIG.localesDir).filter((f) => f.endsWith('.json') && f !== CONFIG.primaryLocale);

  for (const localeFile of localeFiles) {
    const localePath = path.join(CONFIG.localesDir, localeFile);
    const localeData = loadJson(localePath);
    if (localeData) {
      const keys = flattenKeys(localeData);
      console.log(`   Found ${keys.length} keys in ${localeFile}`);
      otherLocales[localeFile] = localeData;
    }
  }

  // Get all source files
  console.log('\n📂 Scanning source files...');
  const sourceFiles = getAllFiles(CONFIG.srcDir, CONFIG.extensions, CONFIG.skipDirs);
  console.log(`   Found ${sourceFiles.length} files to analyze`);

  // Analyze files
  const allUsedKeys = [];
  const allHardcodedStrings = [];
  const allDisplayedKeys = [];

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(CONFIG.srcDir, file);

    // Extract translation key usages
    const usedKeys = extractTranslationKeys(content, relativePath);
    allUsedKeys.push(...usedKeys);

    // Find hardcoded strings
    const hardcoded = findHardcodedStrings(content, relativePath);
    allHardcodedStrings.push(...hardcoded);

    // Find displayed keys (keys shown instead of translations)
    const displayedKeys = findDisplayedKeys(content, relativePath);
    allDisplayedKeys.push(...displayedKeys);
  }

  // Find missing keys
  console.log('\n🔎 Analyzing translation key usage...');
  const uniqueUsedKeys = [...new Set(allUsedKeys.map((k) => k.key))];

  // Filter out invalid/dynamic keys (keys ending with . are template prefixes, not real keys)
  const validMissingKeys = uniqueUsedKeys.filter((key) => {
    // Skip keys that end with . (dynamic template prefixes)
    if (key.endsWith('.')) return false;
    // Must actually be missing
    return !primaryKeys.includes(key);
  });
  const missingKeys = validMissingKeys;

  // Extract dynamic prefixes (from template literal patterns like t(`prefix.${var}`))
  const dynamicPrefixes = [...new Set(allUsedKeys.filter((k) => k.isDynamicPrefix).map((k) => k.key))];

  // Filter unused keys - exclude keys that match dynamic prefixes
  const unusedKeys = primaryKeys.filter((key) => {
    // Key is directly used
    if (uniqueUsedKeys.includes(key)) return false;
    // Key starts with a dynamic prefix (e.g., "editors.file.fileTypes.documents" when "editors.file.fileTypes." is dynamic)
    if (dynamicPrefixes.some((prefix) => key.startsWith(prefix))) return false;
    return true;
  });

  // Find keys used but missing from JSON
  const missingKeyDetails = missingKeys.map((key) => {
    const usages = allUsedKeys.filter((k) => k.key === key);
    return {
      key,
      usages: usages.map((u) => `${u.file}:${u.line}`),
    };
  });

  // Compare locales
  console.log('\n🌍 Comparing locale files...');
  const localeComparison = compareLocales(primaryKeys, primaryLocale, otherLocales);

  // Generate report
  console.log('\n📝 Generating report...');

  let report = `# Localization Audit Report

Generated: ${new Date().toISOString()}

## Summary

| Metric | Count |
|--------|-------|
| Total keys in en.json | ${primaryKeys.length} |
| Unique keys used in code | ${uniqueUsedKeys.length} |
| Keys used but missing from en.json | ${missingKeys.length} |
| Keys defined but not used | ${unusedKeys.length} |
| Potential hardcoded strings | ${allHardcodedStrings.length} |

---

## 🚨 Critical: Missing Translation Keys

These translation keys are used in the code but **do not exist** in the locale files:

`;

  if (missingKeyDetails.length === 0) {
    report += '✅ No missing keys found!\n\n';
  } else {
    report += `Found **${missingKeyDetails.length}** missing keys:\n\n`;

    // Group by prefix
    const groupedByPrefix = {};
    for (const item of missingKeyDetails) {
      const prefix = item.key.split('.')[0];
      if (!groupedByPrefix[prefix]) {
        groupedByPrefix[prefix] = [];
      }
      groupedByPrefix[prefix].push(item);
    }

    for (const [prefix, items] of Object.entries(groupedByPrefix).sort()) {
      report += `### ${prefix}\n\n`;
      for (const item of items) {
        report += `- \`${item.key}\`\n`;
        for (const usage of item.usages.slice(0, 3)) {
          report += `  - Used in: ${usage}\n`;
        }
        if (item.usages.length > 3) {
          report += `  - ... and ${item.usages.length - 3} more locations\n`;
        }
      }
      report += '\n';
    }
  }

  report += `---

## ⚠️ Locale File Comparison

### Missing translations in other locale files

`;

  for (const [localeName, { missing, extra }] of Object.entries(localeComparison)) {
    report += `#### ${localeName}\n\n`;

    if (missing.length === 0) {
      report += '✅ All keys translated!\n\n';
    } else {
      report += `Missing **${missing.length}** keys:\n\n`;

      // Show first 50 to avoid huge report
      const toShow = missing.slice(0, 50);
      for (const key of toShow) {
        const enValue = getNestedValue(primaryLocale, key);
        const displayValue = typeof enValue === 'string' ? enValue.substring(0, 50) + (enValue.length > 50 ? '...' : '') : '[object]';
        report += `- \`${key}\` (en: "${displayValue}")\n`;
      }

      if (missing.length > 50) {
        report += `\n... and ${missing.length - 50} more keys\n`;
      }
      report += '\n';
    }
  }

  report += `---

## 📝 Potential Hardcoded Strings

These look like English text that might need localization:

`;

  if (allHardcodedStrings.length === 0) {
    report += '✅ No obvious hardcoded strings found!\n\n';
  } else {
    // Group by file
    const byFile = {};
    for (const item of allHardcodedStrings) {
      if (!byFile[item.file]) {
        byFile[item.file] = [];
      }
      byFile[item.file].push(item);
    }

    // Show first 100 unique strings
    const uniqueStrings = [...new Set(allHardcodedStrings.map((s) => s.text))];
    report += `Found **${uniqueStrings.length}** unique potentially hardcoded strings across ${Object.keys(byFile).length} files.\n\n`;

    const filesToShow = Object.entries(byFile).slice(0, 20);
    for (const [file, items] of filesToShow) {
      report += `### ${file}\n\n`;
      const uniqueInFile = [...new Map(items.map((i) => [i.text, i])).values()];
      for (const item of uniqueInFile.slice(0, 10)) {
        report += `- Line ${item.line}: \`${item.text}\` (${item.type})\n`;
      }
      if (uniqueInFile.length > 10) {
        report += `- ... and ${uniqueInFile.length - 10} more\n`;
      }
      report += '\n';
    }

    if (Object.keys(byFile).length > 20) {
      report += `\n... and ${Object.keys(byFile).length - 20} more files with hardcoded strings\n\n`;
    }
  }

  report += `---

## 🗑️ Potentially Unused Keys

These keys are defined in en.json but not found in the codebase:

`;

  if (unusedKeys.length === 0) {
    report += '✅ All keys are used!\n\n';
  } else {
    report += `Found **${unusedKeys.length}** potentially unused keys:\n\n`;
    report += "> Note: Some keys might be used dynamically (e.g., `t(`prefix.${var}`)`) and won't be detected.\n\n";

    // Group by prefix
    const groupedUnused = {};
    for (const key of unusedKeys) {
      const prefix = key.split('.')[0];
      if (!groupedUnused[prefix]) {
        groupedUnused[prefix] = [];
      }
      groupedUnused[prefix].push(key);
    }

    for (const [prefix, keys] of Object.entries(groupedUnused).sort()) {
      report += `<details>\n<summary>${prefix} (${keys.length} keys)</summary>\n\n`;
      for (const key of keys.slice(0, 30)) {
        report += `- \`${key}\`\n`;
      }
      if (keys.length > 30) {
        report += `- ... and ${keys.length - 30} more\n`;
      }
      report += '\n</details>\n\n';
    }
  }

  report += `---

## 📊 Recommended Actions

1. **Add missing keys to en.json** - ${missingKeys.length} keys need to be added
2. **Translate missing keys** in other locales:
${Object.entries(localeComparison)
  .map(([name, { missing }]) => `   - ${name}: ${missing.length} keys missing`)
  .join('\n')}
3. **Review hardcoded strings** - ${allHardcodedStrings.length} potential strings to localize
4. **Consider removing unused keys** - ${unusedKeys.length} keys appear unused

---

## Quick Fix: Missing Keys Template

Add these to your en.json:

\`\`\`json
{
${missingKeyDetails.map((item) => `  "${item.key}": "TODO: Add translation"`).join(',\n')}
}
\`\`\`

`;

  // Write report
  fs.writeFileSync(CONFIG.outputFile, report);
  console.log(`\n✅ Report written to: ${CONFIG.outputFile}`);

  // Print summary to console
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Keys in en.json: ${primaryKeys.length}`);
  console.log(`Keys used in code: ${uniqueUsedKeys.length}`);
  console.log(`❌ Missing from en.json: ${missingKeys.length}`);
  console.log(`⚠️  Unused keys: ${unusedKeys.length}`);
  console.log(`📝 Hardcoded strings: ${allHardcodedStrings.length}`);

  for (const [name, { missing }] of Object.entries(localeComparison)) {
    console.log(`🌍 ${name} missing: ${missing.length}`);
  }

  console.log('='.repeat(60));

  return {
    missingKeys: missingKeys.length,
    unusedKeys: unusedKeys.length,
    hardcodedStrings: allHardcodedStrings.length,
  };
}

// Run the script
const results = main();

// Exit with error code if there are critical issues
if (results.missingKeys > 0) {
  process.exit(1);
}
