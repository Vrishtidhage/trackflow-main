from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.orm import relationship
from app.database import Base


class BugHistory(Base):
    __tablename__ = "bug_history"

    id: Column[int] = Column(Integer, primary_key=True, autoincrement=True)
    bug_id: Column[int] = Column(Integer, ForeignKey("bug.id"), nullable=True)
    changed_by_id: Column[int] = Column(Integer, ForeignKey("user.id"), nullable=False)
    changed_at: Column[datetime] = Column(
        DateTime(timezone=True), server_default=func.now()
    )
    field_name: Column[str] = Column(String(50), nullable=False)
    old_value: Column[str] = Column(Text, nullable=True)
    new_value: Column[str] = Column(Text, nullable=True)

    __table_args__ = (
        Index("idx_bug_history_bug_id", "bug_id"),
        Index("idx_bug_history_changed_at", "changed_at"),
    )
