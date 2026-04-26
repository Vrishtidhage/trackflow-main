from app.database import get_db
from app.models import Bug, User
from app.schemas import (
    BugResponse,
    BugResponseWithMsg,
    CreateBugPayload,
    UpdateBugPayload,
)
from app.schemas.bug import UpdateBugSolutionPayload
from app.services.bug_service import BugService
from app.utils.auth import get_current_user_strict, require_permission
from app.utils.formatter import format_response
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

router = APIRouter(tags=["bugs"])


# ✅ GET ALL BUGS
@router.get("/projects/{project_id}/bugs", response_model=BugResponse)
def get_all_bugs(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_strict),
):
    bugs = BugService.get_all_bugs(project_id, db)
    return format_response(bugs)


@router.get("/bugs/assigned")
def get_my_assigned_bugs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_strict),
):
    bugs = (
        db.query(Bug)
        .join(Bug.assignees)
        .filter(User.id == current_user.id)
        .order_by(Bug.updated_at.desc())
        .all()
    )
    return format_response(bugs)


@router.get("/bugs/reported")
def get_my_reported_bugs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_strict),
):
    bugs = (
        db.query(Bug)
        .filter(Bug.created_by_id == current_user.id)
        .order_by(Bug.updated_at.desc())
        .all()
    )
    return format_response(bugs)


# ✅ GET ONE BUG
@router.get("/bugs/{bug_id}")
def get_a_bug(
    bug_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_strict),
):
    bug = BugService.get_bug_by_id(db, bug_id)
    return format_response(bug)


# ✅ CREATE BUG (NO AUTH)
@router.post(
    "/bugs", response_model=BugResponseWithMsg, status_code=status.HTTP_201_CREATED
)
def create_bug(
    bug: CreateBugPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("write_bug")),
):
    new_bug = BugService.create_bug(db, bug, current_user)
    return format_response(new_bug, "New bug created successfully")


# ✅ UPDATE BUG
@router.put("/bugs/{bug_id}", response_model=BugResponseWithMsg)
def update_bug(
    bug_id: int,
    update_data: UpdateBugPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("write_bug")),
):
    bug = BugService.update_bug(db, bug_id, update_data, current_user)
    return format_response(bug, f"Bug with id {bug_id} updated successfully")


@router.put("/bugs/{bug_id}/solution", response_model=BugResponseWithMsg)
def update_bug_solution(
    bug_id: int,
    payload: UpdateBugSolutionPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("manage_users")),
):
    bug = BugService.update_solution(db, bug_id, payload.solution, current_user)
    return format_response(bug, "Solution added successfully")


# ✅ DELETE BUG
@router.delete("/bugs/{bug_id}", status_code=status.HTTP_200_OK)
def delete_bug(
    bug_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("write_bug")),
):
    msg = BugService.delete_bug(db, bug_id, current_user)
    return format_response(msg)


# ✅ ASSIGN USER
@router.post("/bugs/{bug_id}/assign/{user_id}")
def assign_user_to_bug(
    bug_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("manage_users")),
):
    bug = BugService.assign_user_to_bug(bug_id, user_id, db, current_user)
    return format_response(bug, f"Successfully assigned user {user_id} to bug {bug_id}")


# ✅ UNASSIGN USER
@router.delete("/bugs/{bug_id}/unassign/{user_id}")
def unassign_user_to_bug(
    bug_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("manage_users")),
):
    bug = BugService.unassign_user_to_bug(bug_id, user_id, db, current_user)
    return format_response(
        bug, f"Successfully unassigned user {user_id} from bug {bug_id}"
    )


# ✅ BUG HISTORY
@router.get("/bugs/{bug_id}/history")
def get_bug_history(
    bug_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_strict),
):
    history = BugService.bug_history(bug_id, current_user, db)
    return format_response(history, f"Successfully fetched history for bug {bug_id}")
