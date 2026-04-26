from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import relationship
from app.database import Base


class Comment(Base):
    __tablename__: str = "comment"
    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Bug
    bug = relationship("Bug", back_populates="comments")
    bug_id = Column(Integer, ForeignKey("bug.id", ondelete="CASCADE"), nullable=False)

    # User
    created_by = relationship("User", back_populates="comments")
    created_by_id = Column(Integer, ForeignKey("user.id"), nullable=False)

    __table_args__ = (
        Index("idx_comment_bug_id", "bug_id"),
        Index("idx_comment_created_by_id", "created_by_id"),
    )
