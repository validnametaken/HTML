#!/bin/bash
# Pre-flight health check for the workout app
echo "--- Running Pre-flight Health Check ---"

# 1. Check for critical files
REQUIRED_FILES=("index.html" "app.js" "workoutEngine.js" "ui.js" "style.css")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "Error: Missing critical file: $file"
        exit 1
    fi
done

# 2. Check for dependencies
if ! command -v npx &> /dev/null; then
    echo "Error: Node.js/npx not found."
    exit 1
fi

# 3. Quick Syntax Check (js check)
if ! npx eslint app.js --no-eslintrc --parser-options=ecmaVersion:2022 --no-ignore &> /dev/null; then
    echo "Warning: app.js has potential syntax/lint issues."
fi

echo "--- Health Check Complete ---"
