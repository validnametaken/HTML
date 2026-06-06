#!/usr/bin/env python3
import sys
import json
import subprocess
import os

def run_eslint(target_path, config_path=None):
    cmd = ["npx", "eslint", "-f", "json"]
    if config_path:
        cmd.extend(["-c", config_path])
    cmd.append(target_path)
    
    # Run command and capture output
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    # ESLint exits with code 1 if errors are found, which is normal.
    # We load stdout since it contains the JSON payload.
    raw_output = result.stdout.strip()
    if not raw_output:
        # If there's some error running eslint itself (like a parser crash)
        if result.stderr:
            print(f"Error executing ESLint:\n{result.stderr}", file=sys.stderr)
        else:
            print("ESLint returned no output. Everything might be fine, or check your path.")
        return
        
    try:
        data = json.loads(raw_output)
    except json.JSONDecodeError as e:
        print(f"Failed to parse ESLint JSON output: {e}\nRaw output was:\n{raw_output}", file=sys.stderr)
        return

    total_errors = 0
    total_warnings = 0
    reported_any = False

    for file_entry in data:
        messages = file_entry.get("messages", [])
        if not messages:
            continue
            
        file_path = file_entry.get("filePath", "unknown")
        # Relative path for cleaner output
        rel_path = os.path.relpath(file_path) if os.path.isabs(file_path) else file_path
        
        file_errors = [m for m in messages if m.get("severity") == 2]
        file_warnings = [m for m in messages if m.get("severity") == 1]
        
        total_errors += len(file_errors)
        total_warnings += len(file_warnings)
        
        if file_errors or file_warnings:
            reported_any = True
            print(f"\nFile: {rel_path} ({len(file_errors)} errors, {len(file_warnings)} warnings)")
            print("-" * 60)
            for m in messages:
                severity_str = "ERROR" if m.get("severity") == 2 else "WARN"
                line = m.get("line", "?")
                column = m.get("column", "?")
                msg_text = m.get("message", "")
                rule_id = m.get("ruleId", "unknown-rule")
                print(f"  [{severity_str}] Line {line}:{column} - {msg_text} ({rule_id})")

    print("\n" + "="*40)
    print(f"ESLint Summary: {total_errors} errors, {total_warnings} warnings found.")
    print("="*40)
    
    # Exit with code 0 if no errors, 1 otherwise
    sys.exit(1 if total_errors > 0 else 0)

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    config = "/home/andy/coding/myworkout/.eslintrc.cjs"
    if not os.path.exists(config):
        config = None
    run_eslint(target, config)
