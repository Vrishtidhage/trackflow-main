from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.models.user import UserRole


# ✅ CREATE USER
class CreateUserPayload(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value):
        if isinstance(value, str):
            return value.strip().lower()
        return value


# ✅ UPDATE USER
class UpdateUserPayload(BaseModel):
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value):
        if isinstance(value, str):
            return value.strip().lower()
        return value


# ✅ USER MODEL RESPONSE
class User(BaseModel):
    id: int
    email: str
    role: UserRole
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ✅ RESPONSE STRUCTURES
class UserResponse(BaseModel):
    success: bool
    data: User | list[User]


class UserResponseWithMsg(BaseModel):
    success: bool
    message: str
    data: User | list[User]
