from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Bug, BugHistory, Project, User, UserRole
from app.services.user_service import UserService
from app.utils.auth import get_current_admin
from app.utils.formatter import format_response

router = APIRouter(prefix="/admin", tags=["admin"])


class UpdateRolePayload(BaseModel):
    role: UserRole


@router.get("/summary")
def get_admin_summary(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_projects = db.query(func.count(Project.id)).scalar() or 0
    total_bugs = db.query(func.count(Bug.id)).scalar() or 0

    recent_users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .limit(5)
        .all()
    )

    data = {
        "admin_email": current_admin.email,
        "total_users": total_users,
        "total_projects": total_projects,
        "total_bugs": total_bugs,
        "recent_users": [
            {
                "id": user.id,
                "email": user.email,
                "created_at": user.created_at,
            }
            for user in recent_users
        ],
    }
    return format_response(data, "Admin summary fetched successfully")


@router.get("/users")
def get_all_users_for_admin(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return format_response(
        [
            {
                "id": user.id,
                "email": user.email,
                "role": user.role.value if user.role else UserRole.developer.value,
                "created_at": user.created_at,
            }
            for user in users
        ],
        "Users fetched successfully",
    )


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    payload: UpdateRolePayload,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    user = UserService.update_user_role(db, user_id, payload.role)
    return format_response(
        {
            "id": user.id,
            "email": user.email,
            "role": user.role.value,
        },
        "User role updated successfully",
    )


@router.get("/activity")
def get_admin_activity(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    rows = (
        db.query(BugHistory, User.email)
        .join(User, User.id == BugHistory.changed_by_id)
        .order_by(BugHistory.changed_at.desc())
        .limit(25)
        .all()
    )

    return format_response(
        [
            {
                "id": history.id,
                "bug_id": history.bug_id,
                "user_email": email,
                "field_name": history.field_name,
                "old_value": history.old_value,
                "new_value": history.new_value,
                "changed_at": history.changed_at,
            }
            for history, email in rows
        ],
        "Activity fetched successfully",
    )
