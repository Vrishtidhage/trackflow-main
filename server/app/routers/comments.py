from app.database import get_db
from app.models import User
from app.schemas.comment import CreateCommentPayload, UpdateCommentPayload
from app.services.comment_service import CommentService
from app.utils.auth import get_current_user_strict, require_permission
from app.utils.formatter import format_response
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(tags=["comments"])


@router.get("/bugs/{bug_id}/comments")
def get_all_comments(
    bug_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_strict),
):
    comments = CommentService.get_all_comments(db, bug_id)
    return format_response(comments)


@router.post("/comments")
def create_comment(
    comment_data: CreateCommentPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("write_comment")),
):
    new_comment = CommentService.create_comment(db, comment_data, current_user)
    return format_response(new_comment, "New comment created successfully")


@router.put("/comments/{comment_id}")
def update_coment(
    comment_id: int,
    comment_data: UpdateCommentPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("write_comment")),
):
    updated_comment = CommentService.update_comment(
        db, comment_id, comment_data, current_user
    )
    return format_response(updated_comment, "Comment updated successfully")


@router.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("write_comment")),
):
    deleted_comment = CommentService.delete_comment(db, comment_id, current_user)
    return format_response(deleted_comment, "Comment deleted successfully")
