from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import CreateProjectPayload, UpdateProjectPayload
from app.services.user_service import UserService


class ProjectService:
    @staticmethod
    def create_project(db: Session, project_data: CreateProjectPayload, current_user=None):
        try:
            project = Project(**project_data.model_dump())
            if current_user is not None:
                project.created_by_id = current_user.id

            db.add(project)
            db.commit()
            db.refresh(project)
            return project

        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def get_project_by_id(db: Session, project_id: int):
        project = db.query(Project).filter(Project.id == project_id).first()

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with id {project_id} not found.",
            )

        _ = project.bugs
        _ = project.members
        return project

    @staticmethod
    def get_all_projects(db: Session):
        projects = db.query(Project).all()

        for project in projects:
            _ = project.bugs
            _ = project.members

        return projects

    @staticmethod
    def update_project(project_id: int, update_data: UpdateProjectPayload, db: Session):
        project = ProjectService.get_project_by_id(db, project_id)

        try:
            update_dict = update_data.model_dump(exclude_unset=True)
            for field, value in update_dict.items():
                setattr(project, field, value)

            db.commit()
            db.refresh(project)
            return project

        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def delete_project(db: Session, project_id: int):
        project = ProjectService.get_project_by_id(db, project_id)

        try:
            db.delete(project)
            db.commit()
            return project

        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def add_member_to_project(db: Session, user_id: int, project_id: int):
        project = ProjectService.get_project_by_id(db, project_id)
        user = UserService.get_user_by_id(db, user_id)

        if user not in project.members:
            project.members.append(user)
            db.commit()
            db.refresh(project)

        return project

    @staticmethod
    def remove_member_from_project(db: Session, user_id: int, project_id: int):
        project = ProjectService.get_project_by_id(db, project_id)
        user = UserService.get_user_by_id(db, user_id)

        if user in project.members:
            project.members.remove(user)
            db.commit()
            db.refresh(project)

        return project

    @staticmethod
    def get_all_projects_for_user(db: Session):
        return db.query(Project).all()

    @staticmethod
    def get_all_users_for_project(db: Session, project_id: int):
        project = ProjectService.get_project_by_id(db, project_id)
        return project.members
