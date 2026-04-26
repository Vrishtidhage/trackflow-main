from app.models import Comment, User, UserRole
from app.schemas.comment import CreateCommentPayload, UpdateCommentPayload
from app.services.bug_service import BugService
from app.services.user_service import UserService
from app.utils.logger import logger
from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload


class CommentService:
    @staticmethod
    def get_comment_by_id(db: Session, comment_id: int):
        logger.debug(f"Fetching comment by ID: {comment_id}")
        try:
            comment = db.query(Comment).filter(Comment.id == comment_id).first()
            if not comment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Comment with id {comment_id} not found.",
                )
            logger.info(f"Successfully retrieved comment - ID: {comment_id}")
            return comment
        except HTTPException:
            raise
        except SQLAlchemyError as e:
            logger.error(
                f"Database error while fetching comment {comment_id}: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def get_all_comments(db: Session, bug_id: int) -> list[Comment]:
        try:
            logger.debug(f"Fetching all comments from bug with id {bug_id}.")
            bug = BugService.get_bug_by_id(db, bug_id)
            comments = (
                db.query(Comment)
                .options(joinedload(Comment.created_by))
                .filter(Comment.bug_id == bug_id)
                .all()
            )
            logger.info(f"Successfully fetched {len(comments)} comments.")
            return comments
        except SQLAlchemyError as e:
            logger.error(f"Database error while fetching all comments: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def create_comment(
        db: Session, comment_data: CreateCommentPayload, current_user: User
    ):
        try:
            logger.debug(f"Creating a new comment: {comment_data.content}")
            new_comment = Comment(**comment_data.model_dump())
            new_comment.created_by_id = current_user.id
            bug = BugService.get_bug_by_id(db, comment_data.bug_id)

            db.add(new_comment)
            db.commit()
            db.refresh(new_comment)

            _ = new_comment.created_by

            logger.info(
                "Successfully created new comment: "
                f"ID: {new_comment.id}, "
                f"Content: {new_comment.content}, "
            )
            return new_comment
        except SQLAlchemyError as e:
            db.rollback()
            logger.warning(
                f"Integrity error during comment creation - Content: {comment_data.content}, Error: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def update_comment(
        db: Session,
        comment_id: int,
        comment_data: UpdateCommentPayload,
        current_user: User,
    ):
        comment = CommentService.get_comment_by_id(db, comment_id)
        logger.debug(f"Updating comment ID - {comment_id}")

        if current_user.id != comment.created_by_id and current_user.role != UserRole.admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized access. Only comment author can edit it.",
            )
        try:
            update_dict = comment_data.model_dump(exclude_unset=True)
            content = update_dict["content"]

            if len(content.strip()) == 0:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail="Content can not be empty",
                )
            setattr(comment, "content", content)

            db.commit()
            db.refresh(comment)

            _ = comment.created_by

            logger.info(
                f"Successfully updated comment - ID: {comment_id}, Content: {comment.content}"
            )
            return comment
        except SQLAlchemyError as e:
            db.rollback()
            logger.warning(
                f"Integrity error during comment update - Content: {comment.content}, Error: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def delete_comment(db: Session, comment_id: int, current_user: User):
        logger.debug(f"Attempting to comment - ID: {comment_id}")
        comment = CommentService.get_comment_by_id(db, comment_id)
        if current_user.id != comment.created_by_id and current_user.role != UserRole.admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized access. Only comment author can delete the comment.",
            )

        try:
            db.delete(comment)
            db.commit()
            logger.info(f"Successfully deleted comment - ID: {comment_id}")
            return comment
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(
                f"Database error during comment deletion - ID: {comment_id}, Error: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )
