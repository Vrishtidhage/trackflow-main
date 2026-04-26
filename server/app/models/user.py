import enum
from datetime import datetime, timezone
from sqlalchemy.orm import deferred, relationship
from app.database import Base
from sqlalchemy import Column, DateTime, Enum, Integer, String, func

from app.models.project import project_members
from app.models.bug import bug_assignees


class UserRole(enum.Enum):
    admin = "admin"
    manager = "manager"
    developer = "developer"
    viewer = "viewer"


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=False, unique=True)
    password = deferred(Column(String(255), nullable=False))
    role = Column(Enum(UserRole), nullable=False, default=UserRole.developer)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    bugs = relationship(
        "Bug",
        back_populates="created_by",
        lazy="dynamic",
        foreign_keys="Bug.created_by_id",
    )
    comments = relationship("Comment", back_populates="created_by", lazy="dynamic")

    # ✅ SAFE STRING
    projects = relationship("Project", back_populates="created_by")

    projects_member_of = relationship(
        "Project",
        secondary=project_members,
        back_populates="members",
    )

    assigned_bugs = relationship(
        "Bug",
        secondary=bug_assignees,
        back_populates="assignees",
    )
