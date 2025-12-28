#!/bin/zsh
# Zsh script to zip the current directory
# Excludes: bin, obj (dotnet), node_modules, and .git

timestamp=$(date +"%Y%m%d_%H%M%S")
zipName="survey_new_$timestamp.zip"

# Get the directory where the script is located
scriptDir="${0:A:h}"
sourceDir="$scriptDir/.."

# Change to source directory
cd "$sourceDir" || exit 1

echo "\033[36mCreating zip archive: $zipName\033[0m"
echo "\033[90mSource: $sourceDir\033[0m"

# Create the zip file excluding bin, obj, node_modules, and .git
zip -r "$zipName" . \
    -x "*/bin/*" \
    -x "*/obj/*" \
    -x "*/node_modules/*" \
    -x "*/.git/*" \
    -x ".git/*" \
    -x "*.zip"

zipPath="$sourceDir/$zipName"
zipSize=$(du -h "$zipPath" | cut -f1)

echo "\033[32mDone! Created: $zipPath\033[0m"
echo "\033[90mSize: $zipSize\033[0m"
