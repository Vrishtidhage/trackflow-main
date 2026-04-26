from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from starlette.status import HTTP_401_UNAUTHORIZED

from app.models import Bug, Project, User, BugHistory, UserRole
from app.schemas import CreateBugPayload, UpdateBugPayload
from app.utils.logger import logger
from app.services.user_service import UserService


def get_value_for_history(value):
    if hasattr(value, "value"):
        return value.value
    return str(value)


def can_override_bug_owner(current_user: User) -> bool:
    return current_user.role == UserRole.admin


class BugService:
    @staticmethod
    def get_all_bugs(project_id: int, db: Session) -> list[Bug]:
        try:
            logger.debug(f"Fetching all bugs from project {project_id}.")
            project = db.query(Project).filter(Project.id == project_id).first()
            if not project:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Project with id {project_id} not found.",
                )
            bugs = project.bugs
            logger.info(f"Successfully fetched {len(bugs)} bugs.")
            return bugs
        except SQLAlchemyError as e:
            logger.error(f"Database error while fetching all bugs: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def get_bug_by_id(db: Session, bug_id: int) -> Bug:
        logger.debug(f"Fetching bug by ID: {bug_id}")
        try:
            bug = db.query(Bug).filter(Bug.id == bug_id).first()
            if not bug:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Bug with id {bug_id} not found.",
                )
            logger.info(
                f"Successfully retrieved bug - ID: {bug_id}, title: {bug.title}"
            )
            _ = bug.assignees
            return bug
        except HTTPException:
            raise
        except SQLAlchemyError as e:
            logger.error(f"Database error while fetching bug {bug_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def create_bug(db: Session, bug_data: CreateBugPayload, current_user: User) -> Bug:
        try:
            new_bug = Bug(**bug_data.model_dump())
            new_bug.created_by_id = current_user.id
            logger.debug(f"Creating a new bug: {new_bug.title}")
            db.add(new_bug)
            db.flush()

            logger.info(f"Adding CREATE entry to bug {new_bug.id} history.")
            history_entry = BugHistory(
                bug_id=new_bug.id,
                changed_by_id=current_user.id,
                field_name="create",
                old_value="",
                new_value="",
            )

            db.add(history_entry)
            db.commit()
            db.refresh(new_bug)

            logger.info(
                "Successfully created new bug: "
                f"ID: {new_bug.id}, "
                f"Title: {new_bug.title}, "
            )
            return new_bug
        except SQLAlchemyError as e:
            db.rollback()
            logger.warning(
                f"Integrity error during bug creation - Title: {bug_data.title}, Error: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def update_bug(
        db: Session, bug_id: int, update_data: UpdateBugPayload, current_user: User
    ) -> Bug:
        bug = BugService.get_bug_by_id(db, bug_id)
        logger.debug(f"Updating bug - ID: {bug_id}")

        if current_user.id != bug.created_by_id and not can_override_bug_owner(current_user):
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail="Unauthorized access. Only bug creator can edit it.",
            )

        try:
            update_dict = update_data.model_dump(exclude_unset=True)

            fields_to_update = [k for k in update_dict.keys()]
            if fields_to_update:
                logger.debug(
                    f"Updating fields for bug {bug_id}: {', '.join(fields_to_update)}"
                )
            for field, value in update_dict.items():
                old = getattr(bug, field)
                if old != value:
                    history_entry = BugHistory(
                        bug_id=bug.id,
                        changed_by_id=current_user.id,
                        field_name=field,
                        old_value=get_value_for_history(old),
                        new_value=get_value_for_history(value),
                    )
                    db.add(history_entry)
                    setattr(bug, field, value)

            db.commit()
            db.refresh(bug)
            logger.info(f"Successfully updated bug - ID: {bug_id}, Title: {bug.title}")
            return bug
        except SQLAlchemyError as e:
            db.rollback()
            logger.warning(
                f"Integrity error during bug creation - Title: {bug.title}, Error: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def delete_bug(db: Session, bug_id: int, current_user: User):
        logger.debug(f"Attempting to delete bug - ID: {bug_id}")
        bug = BugService.get_bug_by_id(db, bug_id)

        if current_user.id != bug.created_by_id and not can_override_bug_owner(current_user):
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail="Unauthorized access. Only bug creator can delete it.",
            )

        try:
            db.delete(bug)
            history_entry = BugHistory(
                bug_id=bug.id,
                changed_by_id=current_user.id,
                field_name="delete",
                old_value=bug.title,
                new_value="",
            )
            db.add(history_entry)

            db.commit()
            logger.info(f"Successfully deleted bug - ID: {bug_id}")
            return {"message": "Bug deleted successfully", "bug_id": bug_id}
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(
                f"Database error during bug deletion - ID: {bug_id}, Error: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def assign_user_to_bug(bug_id: int, user_id: int, db: Session, current_user: User):
        logger.debug(f"Attempting to assign user {user_id} to bug {bug_id}")
        bug = BugService.get_bug_by_id(db, bug_id)
        user = UserService.get_user_by_id(db, user_id)

        if current_user.id != bug.created_by_id and not can_override_bug_owner(current_user):
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail="Unauthorized access. Only bug creator can assign members to it.",
            )

        try:
            bug.assignees.append(user)
            logger.info(f"Successfully assigned user {user_id} to bug {bug_id}")
            history_entry = BugHistory(
                bug_id=bug.id,
                changed_by_id=current_user.id,
                field_name="assign",
                old_value="",
                new_value=get_value_for_history(user_id),
            )
            db.add(history_entry)
            db.commit()
            db.refresh(bug)
            _ = bug.assignees
            return bug
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(
                f"Database error during assign user {user_id} to bug {bug_id}, Error: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def unassign_user_to_bug(
        bug_id: int, user_id: int, db: Session, current_user: User
    ):
        logger.debug(f"Attempting to unassign user {user_id} from bug {bug_id}")
        bug = BugService.get_bug_by_id(db, bug_id)
        user = UserService.get_user_by_id(db, user_id)

        if current_user.id != bug.created_by_id and not can_override_bug_owner(current_user):
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail="Unauthorized access. Only bug creator can unassign members from it.",
            )

        try:
            bug.assignees.remove(user)
            logger.debug(f"Successfully unassigned user {user_id} from bug {bug_id}")
            history_entry = BugHistory(
                bug_id=bug.id,
                changed_by_id=current_user.id,
                field_name="unassign",
                old_value="",
                new_value=get_value_for_history(user_id),
            )
            db.add(history_entry)
            db.commit()
            db.refresh(bug)
            _ = bug.assignees
            return bug
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(
                f"Database error during unassign user {user_id} from bug {bug_id}, Error: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def bug_history(bug_id: int, current_user: User, db: Session):
        history = db.query(BugHistory).filter(BugHistory.bug_id == bug_id).all()
        return history

    @staticmethod
    def update_solution(db: Session, bug_id: int, solution: str, current_user: User):
        bug = BugService.get_bug_by_id(db, bug_id)

        if current_user.role != UserRole.admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required to add a solution.",
            )

        try:
            old_solution = bug.solution or ""
            bug.solution = solution.strip()
            bug.solution_by_id = current_user.id
            bug.solution_updated_at = datetime.now(timezone.utc)

            db.add(
                BugHistory(
                    bug_id=bug.id,
                    changed_by_id=current_user.id,
                    field_name="solution",
                    old_value=old_solution,
                    new_value=bug.solution,
                )
            )

            db.commit()
            db.refresh(bug)
            _ = bug.assignees
            return bug
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )
