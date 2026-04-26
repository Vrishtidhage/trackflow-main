import re

def extract_error_details(stderr):
    if not stderr:
        return None

    # Try to extract line number (Python-style errors)
    line_match = re.search(r'line (\d+)', stderr)
    error_line = line_match.group(1) if line_match else None

    # Extract error type (first part before colon)
    error_type = stderr.split(":")[0] if ":" in stderr else "Error"

    return {
        "line": error_line,
        "type": error_type,
        "message": stderr
    }