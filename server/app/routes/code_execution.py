from fastapi import APIRouter, Depends
from app.models import User
from app.services.judge0_service import run_code
from app.utils.error_parser import extract_error_details
from app.services.ai_helper import explain_error
from app.utils.auth import get_current_user_strict

router = APIRouter()   # ✅ THIS LINE IS CRITICAL

@router.post("/run-code")
async def run_user_code(
    data: dict,
    current_user: User = Depends(get_current_user_strict),
):
    source_code = data.get("code")
    language_id = data.get("language_id")

    result = run_code(source_code, language_id)
    stderr = result.get("stderr")

    error_details = extract_error_details(stderr)

    explanation = None
    if stderr:
        explanation = explain_error(source_code, stderr)

    return {
        "output": result.get("stdout"),
        "error": error_details,
        "ai_suggestion": explanation
    }
