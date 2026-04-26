from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.bug import BugStatus, PriorityStates
from app.models import User


class CreateBugPayload(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    status: BugStatus
    priority: PriorityStates
    project_id: int


class UpdateBugPayload(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    status: Optional[BugStatus] = None
    priority: Optional[PriorityStates] = None


class UpdateBugSolutionPayload(BaseModel):
    solution: str = Field(..., min_length=1, max_length=5000)


class Bug(BaseModel):
    id: int
    title: str
    description: str
    solution: Optional[str] = None
    solution_updated_at: Optional[datetime] = None
    solution_by_id: Optional[int] = None
    status: BugStatus
    priority: PriorityStates
    created_at: datetime
    updated_at: datetime
    created_by_id: int

    class Config:
        from_attributes = True


class BugResponse(BaseModel):
    success: bool
    data: Bug | list[Bug]


class BugResponseWithMsg(BaseModel):
    success: bool
    message: str
    data: Bug | list[Bug]
