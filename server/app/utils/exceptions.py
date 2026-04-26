from fastapi import Request, status
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.responses import JSONResponse
from typing import Any


def format_validation_error(error: dict[str, Any]) -> dict[str, str]:
    """Format a single validation error into a user-friendly message"""
    field = error["loc"][-1] if error["loc"] else "unknown"
    error_type = error["type"]

    if "email" in error_type or "email" in str(error.get("ctx", {})).lower():
        return {
            "field": field,
            "message": "Please enter a valid email address (e.g., user@example.com)",
        }

    if error_type == "missing":
        return {"field": field, "message": f"The '{field}' field is required"}

    if error_type == "string_too_short":
        min_length = error.get("ctx", {}).get("min_length")
        if min_length:
            return {
                "field": field,
                "message": f"The '{field}' field must be at least {min_length} characters",
            }
        return {"field": field, "message": f"The '{field}' field is too short"}

    if error_type == "string_too_long":
        max_length = error.get("ctx", {}).get("max_length")
        if max_length:
            return {
                "field": field,
                "message": f"The '{field}' field must be at most {max_length} characters",
            }
        return {"field": field, "message": f"The '{field}' field is too long"}

    if "string" in error_type:
        return {"field": field, "message": f"The '{field}' field must be text"}

    if "int" in error_type or "number" in error_type:
        return {"field": field, "message": f"The '{field}' field must be a number"}

    return {"field": field, "message": error.get("msg", "Invalid value")}


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with user-friendly messages"""
    errors = [format_validation_error(error) for error in exc.errors()]

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Please check your input and try again",
            "errors": errors,
        },
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with consistent format"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "data": None,
            "message": exc.detail,
        },
    )
