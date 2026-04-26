from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas.project import CreateProjectPayload, UpdateProjectPayload
from app.services.project_service import ProjectService
from app.utils.auth import get_current_user_strict, require_permission
from app.utils.formatter import format_response

router = APIRouter(prefix="/projects", tags=["Projects"])


# ✅ CREATE PROJECT (NO AUTH)
@router.post("")
def create_project(
    project_data: CreateProjectPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("write_project")),
):
    project = ProjectService.create_project(db, project_data, current_user)
    return format_response(project, message="Project created successfully.")


# ✅ GET ONE PROJECT
@router.get("/{project_id}")
def get_a_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_strict),
):
    project = ProjectService.get_project_by_id(db, project_id)
    return format_response(project)


# ✅ GET ALL PROJECTS
@router.get("")
def get_all_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_strict),
):
    projects = ProjectService.get_all_projects(db)
    return format_response(projects)


# ✅ UPDATE PROJECT
@router.put("/{project_id}")
def update_project(
    project_id: int,
    update_data: UpdateProjectPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("write_project")),
):
    project = ProjectService.update_project(project_id, update_data, db)
    return format_response(project, message="Project updated successfully.")


# ✅ DELETE PROJECT
@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("write_project")),
):
    ProjectService.delete_project(db, project_id)
    return {"message": "Project deleted successfully"}


# ✅ ADD MEMBER (OPTIONAL FEATURE)
@router.post("/{project_id}/members/add/{user_id}")
def add_member_to_project(
    user_id: int,
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("manage_users")),
):
    project = ProjectService.add_member_to_project(db, user_id, project_id)
    return format_response(project, "Successfully added user to the project")


# ✅ REMOVE MEMBER
@router.delete("/{project_id}/members/remove/{user_id}")
def remove_member_from_project(
    user_id: int,
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("manage_users")),
):
    project = ProjectService.remove_member_from_project(db, user_id, project_id)
    return format_response(project, "Successfully removed user from the project")


# ✅ GET USERS IN PROJECT
@router.get("/{project_id}/users")
def get_all_users_for_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_strict),
):
    users = ProjectService.get_all_users_for_project(db, project_id)
    return format_response(
        users,
        f"Successfully fetched all users from the project {project_id}",
    )
