from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Table,
    Text,
    DateTime,
    ForeignKey,
    Index,
    func,
)
from sqlalchemy.orm import relationship
from app.database import Base


# ✅ ASSOCIATION TABLE (NO CLASS IMPORTS HERE)
project_members = Table(
    "project_members",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("project.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", Integer, ForeignKey("user.id", ondelete="CASCADE"), primary_key=True),
)


class Project(Base):
    __tablename__ = "project"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # ✅ OPTIONAL USER (NO LOGIN REQUIRED)
    created_by_id = Column(Integer, ForeignKey("user.id"), nullable=True)

    # ✅ STRING REFERENCE (NO IMPORT NEEDED)
    created_by = relationship("User", back_populates="projects")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ✅ SAFE RELATIONSHIPS
    bugs = relationship(
        "Bug",
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    members = relationship(
        "User",
        secondary=project_members,
        back_populates="projects_member_of",
    )

    __table_args__ = (
        Index("idx_project_title", "title"),
        Index("idx_project_created_by", "created_by_id"),
    )