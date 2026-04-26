from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserRole
from app.utils.password import verify_password
from app.utils.auth import create_access_token, is_admin_email
from app.utils.formatter import format_response

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post("/login")
def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    # Match the normalization used when users are registered.
    normalized_email = username.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()

    # ❌ INVALID LOGIN → use proper HTTP error
    if not user or not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credentials"
        )

    # ✅ CREATE JWT TOKEN
    is_admin = is_admin_email(user.email) or (
        user.role and getattr(user.role, "value", str(user.role)) == "admin"
    )

    token_data = {
        "user_id": user.id,
        "email": user.email,
        "is_admin": is_admin,
        "role": user.role.value if user.role else "developer",
    }

    access_token = create_access_token(token_data)

    # ✅ RETURN CONSISTENT RESPONSE (VERY IMPORTANT)
    return format_response(
        {
            "access_token": access_token,
            "token_type": "bearer"
        },
        "Login successful"
    )


@router.post("/admin-login")
def admin_login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    normalized_email = username.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()

    is_admin = bool(user) and (
        is_admin_email(user.email) or user.role == UserRole.admin
    )

    if not user or not verify_password(password, user.password) or not is_admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
        )

    token_data = {
        "user_id": user.id,
        "email": user.email,
        "is_admin": True,
        "role": "admin",
    }
    access_token = create_access_token(token_data)

    return format_response(
        {
            "access_token": access_token,
            "token_type": "bearer",
            "is_admin": True,
        },
        "Admin login successful",
    )
