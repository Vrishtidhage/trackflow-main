import enum
from datetime import datetime, timezone
from typing import final

from sqlalchemy.orm import relationship

from app.database import Base
from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Table,
    Text,
    func,
)


class BugStatus(enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    in_review = "in_review"
    done = "done"


class PriorityStates(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    top = "top"


bug_assignees = Table(
    "bug_assignees",
    Base.metadata,
    Column(
        "bug_id", Integer, ForeignKey("bug.id", ondelete="CASCADE"), primary_key=True
    ),
    Column(
        "user_id", Integer, ForeignKey("user.id", ondelete="CASCADE"), primary_key=True
    ),
)


class Bug(Base):
    __tablename__: str = "bug"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    solution = Column(Text, nullable=True)
    solution_updated_at = Column(DateTime(timezone=True), nullable=True)
    solution_by_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    status = Column(Enum(BugStatus), nullable=False)
    priority = Column(Enum(PriorityStates), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # User
    created_by_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_by = relationship(
        "User",
        back_populates="bugs",
        foreign_keys=[created_by_id],
    )
    solution_by = relationship("User", foreign_keys=[solution_by_id])

    # Comments
    comments = relationship(
        "Comment", back_populates="bug", cascade="all, delete-orphan"
    )

    # Project
    project_id = Column(
        Integer, ForeignKey("project.id", ondelete="CASCADE"), nullable=False
    )
    project = relationship("Project", back_populates="bugs")

    assignees = relationship(
        "User",
        secondary=bug_assignees,
        back_populates="assigned_bugs",
    )

    __table_args__ = (
        Index("idx_bug_status", "status"),
        Index("idx_bug_priority", "priority"),
        Index("idx_bug_created_by", "created_by_id"),
    )
