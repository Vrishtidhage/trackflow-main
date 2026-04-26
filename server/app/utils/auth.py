from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.models import User, UserRole

from app.database import get_db
from app.config import get_settings
from app.utils.password import hash_password

settings = get_settings()

SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 3
oauth2_scheme_strict = OAuth2PasswordBearer(tokenUrl="/auth/login")

ROLE_PERMISSIONS = {
    UserRole.viewer.value: {"read"},
    UserRole.developer.value: {"read", "write_bug", "write_comment"},
    UserRole.manager.value: {
        "read",
        "write_bug",
        "write_comment",
        "write_project",
        "manage_users",
    },
    UserRole.admin.value: {"*"},
}


def is_admin_email(email: str) -> bool:
    return email.lower() == settings.admin_email.lower()


def ensure_admin_user(db: Session) -> User:
    admin_email = settings.admin_email.lower()
    admin_user = db.query(User).filter(User.email == admin_email).first()
    if admin_user:
        if admin_user.role != UserRole.admin:
            admin_user.role = UserRole.admin
            db.commit()
            db.refresh(admin_user)
        return admin_user

    admin_user = User(
        email=admin_email,
        password=hash_password(settings.admin_password),
        role=UserRole.admin,
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    return admin_user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()

    expire = datetime.utcnow() + (
        expires_delta or timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"exp": expire})

    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token


def get_current_user(
    token: str = Depends(oauth2_scheme_strict), db: Session = Depends(get_db)
):
    return get_current_user_strict(token, db)


def get_current_user_strict(
    token: str = Depends(oauth2_scheme_strict), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user


def get_current_admin(current_user: User = Depends(get_current_user_strict)):
    if not (is_admin_email(current_user.email) or current_user.role == UserRole.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


def has_permission(current_user: User, permission: str) -> bool:
    if is_admin_email(current_user.email) or current_user.role == UserRole.admin:
        return True

    role_name = (
        current_user.role.value
        if isinstance(current_user.role, UserRole)
        else str(current_user.role)
    )
    permissions = ROLE_PERMISSIONS.get(role_name, set())
    return permission in permissions or "*" in permissions


def require_permission(permission: str):
    def dependency(current_user: User = Depends(get_current_user_strict)):
        if not has_permission(current_user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission}' required",
            )
        return current_user

    return dependency
