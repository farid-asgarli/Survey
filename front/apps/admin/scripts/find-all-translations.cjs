#!/usr/bin/env node

/**
 * Comprehensive script to find ALL translation patterns in the codebase:
 * - t('key') - standard hook-based translation
 * - t('key', 'default') - with default value
 * - t('key', { options }) - with interpolation options
 * - t(variable) - dynamic keys
 * - i18n.t('key') - direct i18n instance usage
 * - window.__i18n?.t('key') - global i18n for class components
 * - <Trans> component - JSX-based translations
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.join(__dirname, '../src');
const OUTPUT_FILE = path.join(__dirname, '../temp/ALL_TRANSLATION_PATTERNS_REPORT.md');
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

// All translation patterns to search for
const translationPatterns = [
  {
    name: 't() - Standard hook call',
    // Matches: t('key'), t("key"), t(`key`)
    regex: /(?<![.\w])t\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    extractKey: (match) => match[1],
    extractDefault: () => null,
  },
  {
    name: 't() - With default value',
    // Matches: t('key', 'default'), t('key', "default")
    regex: /(?<![.\w])t\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]\s*\)/g,
    extractKey: (match) => match[1],
    extractDefault: (match) => match[2],
  },
  {
    name: 't() - With options object',
    // Matches: t('key', { count: 5 })
    regex: /(?<![.\w])t\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{[^}]*\}\s*\)/g,
    extractKey: (match) => match[1],
    extractDefault: () => null,
  },
  {
    name: 't() - Dynamic/variable key',
    // Matches: t(variable), t(obj.key), t(arr[0])
    regex: /(?<![.\w])t\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*|\[[^\]]+\])*)\s*\)/g,
    extractKey: (match) => `[DYNAMIC] ${match[1]}`,
    extractDefault: () => null,
  },
  {
    name: 't() - Template literal',
    // Matches: t(`prefix.${var}`)
    regex: /(?<![.\w])t\s*\(\s*`([^`]+)`\s*\)/g,
    extractKey: (match) => `[TEMPLATE] ${match[1]}`,
    extractDefault: () => null,
  },
  {
    name: 'i18n.t() - Direct instance call',
    // Matches: i18n.t('key')
    regex: /i18n\.t\s*\(\s*['"`]([^'"`]+)['"`]/g,
    extractKey: (match) => match[1],
    extractDefault: () => null,
  },
  {
    name: 'i18n.t() - Template literal',
    // Matches: i18n.t(`prefix.${var}`)
    regex: /i18n\.t\s*\(\s*`([^`]+)`/g,
    extractKey: (match) => `[TEMPLATE] ${match[1]}`,
    extractDefault: () => null,
  },
  {
    name: 'i18n.t() - Dynamic key',
    // Matches: i18n.t(variable)
    regex: /i18n\.t\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\s*\)/g,
    extractKey: (match) => `[DYNAMIC] ${match[1]}`,
    extractDefault: () => null,
  },
  {
    name: 'window.__i18n?.t() - Global fallback',
    // Matches: window.__i18n?.t('key')
    regex: /window\.__i18n\?\.t\s*\(\s*['"`]([^'"`]+)['"`]/g,
    extractKey: (match) => match[1],
    extractDefault: () => null,
  },
  {
    name: '<Trans> component - i18nKey prop',
    // Matches: <Trans i18nKey="key">
    regex: /<Trans[^>]*\si18nKey\s*=\s*['"`]([^'"`]+)['"`]/g,
    extractKey: (match) => match[1],
    extractDefault: () => null,
  },
];

// Catch-all pattern to find ANY .t() call we might have missed
const catchAllPatterns = [
  {
    name: 'ANY .t() call (catch-all)',
    regex: /\.t\s*\([^)]+\)/g,
  },
  {
    name: 'ANY standalone t() call (catch-all)',
    regex: /(?<![.\w])t\s*\([^)]+\)/g,
  },
];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!['node_modules', 'dist', 'build', '.git', 'temp'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (EXTENSIONS.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

function findAllTranslations(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  const lines = content.split('\n');
  const results = [];
  const foundMatches = new Set(); // To avoid duplicates

  // Search with each specific pattern
  for (const pattern of translationPatterns) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match;

    while ((match = regex.exec(content)) !== null) {
      const matchId = `${match.index}-${match[0]}`;
      if (foundMatches.has(matchId)) continue;
      foundMatches.add(matchId);

      const lineNumber = getLineNumber(content, match.index);
      results.push({
        file: relativePath,
        lineNumber,
        pattern: pattern.name,
        full: match[0],
        line: lines[lineNumber - 1]?.trim() || '',
        key: pattern.extractKey(match),
        defaultValue: pattern.extractDefault(match),
      });
    }
  }

  // Also run catch-all patterns to find anything we might have missed
  for (const catchAll of catchAllPatterns) {
    const regex = new RegExp(catchAll.regex.source, catchAll.regex.flags);
    let match;

    while ((match = regex.exec(content)) !== null) {
      const matchId = `${match.index}-${match[0]}`;
      if (foundMatches.has(matchId)) continue;

      // Check if this looks like a translation call (not a CSS transform or other .t method)
      const lineContent = lines[getLineNumber(content, match.index) - 1] || '';

      // Skip CSS transforms and non-translation .t() calls
      if (
        lineContent.includes('transform') ||
        lineContent.includes('translate(') ||
        lineContent.includes('.catch') ||
        lineContent.includes('.then') ||
        lineContent.includes('moment') ||
        lineContent.includes('date.t') ||
        lineContent.includes('.toString') ||
        lineContent.includes('.toFixed') ||
        lineContent.includes('.target')
      ) {
        continue;
      }

      foundMatches.add(matchId);
      const lineNumber = getLineNumber(content, match.index);

      results.push({
        file: relativePath,
        lineNumber,
        pattern: `⚠️ ${catchAll.name}`,
        full: match[0],
        line: lines[lineNumber - 1]?.trim() || '',
        key: '[UNKNOWN - Review manually]',
        defaultValue: null,
      });
    }
  }

  return results;
}

function generateReport(allResults) {
  const timestamp = new Date().toISOString();

  // Group by pattern type
  const byPattern = {};
  for (const result of allResults) {
    if (!byPattern[result.pattern]) {
      byPattern[result.pattern] = [];
    }
    byPattern[result.pattern].push(result);
  }

  // Group by file
  const byFile = {};
  for (const result of allResults) {
    if (!byFile[result.file]) {
      byFile[result.file] = [];
    }
    byFile[result.file].push(result);
  }

  // Extract unique static keys (excluding dynamic/template)
  const staticKeys = [...new Set(allResults.filter((r) => r.key && !r.key.startsWith('[')).map((r) => r.key))].sort();

  // Extract dynamic keys
  const dynamicKeys = allResults
    .filter((r) => r.key && r.key.startsWith('[DYNAMIC]'))
    .map((r) => ({
      key: r.key,
      file: r.file,
      line: r.lineNumber,
      full: r.full,
    }));

  // Extract template keys
  const templateKeys = allResults
    .filter((r) => r.key && r.key.startsWith('[TEMPLATE]'))
    .map((r) => ({
      key: r.key,
      file: r.file,
      line: r.lineNumber,
      full: r.full,
    }));

  let report = `# Complete Translation Patterns Report

Generated: ${timestamp}

## Summary

| Metric | Count |
|--------|-------|
| **Total translation calls** | ${allResults.length} |
| **Files with translations** | ${Object.keys(byFile).length} |
| **Unique static keys** | ${staticKeys.length} |
| **Dynamic key usages** | ${dynamicKeys.length} |
| **Template literal usages** | ${templateKeys.length} |

## Translation Patterns Found

| Pattern Type | Count |
|--------------|-------|
${Object.entries(byPattern)
  .sort((a, b) => b[1].length - a[1].length)
  .map(([pattern, items]) => `| ${pattern} | ${items.length} |`)
  .join('\n')}

---

## ⚠️ Patterns Requiring Manual Review

These are translation calls that don't follow standard patterns and may need attention:

`;

  // List catch-all findings (potential issues)
  const catchAllResults = allResults.filter((r) => r.pattern.startsWith('⚠️'));
  if (catchAllResults.length > 0) {
    report += `### Unrecognized Patterns (${catchAllResults.length})\n\n`;
    for (const item of catchAllResults) {
      report += `- **${item.file}** (Line ${item.lineNumber})\n`;
      report += `  \`\`\`\n  ${item.line}\n  \`\`\`\n\n`;
    }
  } else {
    report += `✅ No unrecognized patterns found!\n\n`;
  }

  report += `---

## Dynamic Keys (${dynamicKeys.length})

These translations use variables instead of static keys - the actual keys are determined at runtime:

| File | Line | Code |
|------|------|------|
${dynamicKeys.map((d) => `| \`${d.file}\` | ${d.line} | \`${d.full}\` |`).join('\n')}

---

## Template Literal Keys (${templateKeys.length})

These translations use template literals to construct keys:

| File | Line | Template |
|------|------|----------|
${templateKeys.map((t) => `| \`${t.file}\` | ${t.line} | \`${t.key.replace('[TEMPLATE] ', '')}\` |`).join('\n')}

---

## By Pattern Type

`;

  // List by pattern
  for (const [pattern, items] of Object.entries(byPattern).sort((a, b) => b[1].length - a[1].length)) {
    report += `### ${pattern} (${items.length})\n\n`;

    if (items.length <= 50) {
      for (const item of items) {
        report += `- \`${item.file}\` L${item.lineNumber}: \`${item.full}\`\n`;
        if (item.defaultValue) {
          report += `  - Default: \`${item.defaultValue}\`\n`;
        }
      }
    } else {
      report += `<details>\n<summary>Click to expand (${items.length} items)</summary>\n\n`;
      for (const item of items) {
        report += `- \`${item.file}\` L${item.lineNumber}: \`${item.full}\`\n`;
      }
      report += `\n</details>\n`;
    }
    report += '\n';
  }

  report += `---

## All Static Translation Keys (${staticKeys.length})

\`\`\`
${staticKeys.join('\n')}
\`\`\`

---

## Keys With Default Values

| Key | Default Value | File | Line |
|-----|---------------|------|------|
${allResults
  .filter((r) => r.defaultValue)
  .map((r) => `| \`${r.key}\` | \`${r.defaultValue}\` | \`${r.file}\` | ${r.lineNumber} |`)
  .join('\n')}

---

## By File

`;

  // List by file (collapsed for large files)
  for (const [file, items] of Object.entries(byFile).sort()) {
    report += `### ${file} (${items.length})\n\n`;
    report += `| Line | Pattern | Key |\n`;
    report += `|------|---------|-----|\n`;

    for (const item of items.sort((a, b) => a.lineNumber - b.lineNumber)) {
      const shortPattern = item.pattern.replace('t() - ', '').replace('i18n.t() - ', 'i18n: ');
      report += `| ${item.lineNumber} | ${shortPattern} | \`${item.key || '-'}\` |\n`;
    }
    report += '\n';
  }

  report += `---

## Raw JSON Data

<details>
<summary>Click to expand raw JSON data</summary>

\`\`\`json
${JSON.stringify(allResults, null, 2)}
\`\`\`

</details>
`;

  return report;
}

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Main execution
console.log('🔍 Scanning for ALL translation patterns...');
console.log(`   Root directory: ${ROOT_DIR}`);

const files = getAllFiles(ROOT_DIR);
console.log(`   Found ${files.length} source files to scan\n`);

console.log('📋 Patterns being searched:');
translationPatterns.forEach((p) => console.log(`   - ${p.name}`));
console.log('');

const allResults = [];
for (const file of files) {
  const results = findAllTranslations(file);
  allResults.push(...results);
}

// Group and display summary
const byPattern = {};
for (const result of allResults) {
  if (!byPattern[result.pattern]) {
    byPattern[result.pattern] = 0;
  }
  byPattern[result.pattern]++;
}

console.log('📊 Results Summary:');
console.log(`   Total calls found: ${allResults.length}`);
Object.entries(byPattern)
  .sort((a, b) => b[1] - a[1])
  .forEach(([pattern, count]) => {
    const icon = pattern.startsWith('⚠️') ? '⚠️ ' : '   ';
    console.log(`${icon}${pattern}: ${count}`);
  });

const report = generateReport(allResults);
fs.writeFileSync(OUTPUT_FILE, report, 'utf-8');

console.log(`\n✅ Report written to: ${OUTPUT_FILE}`);
