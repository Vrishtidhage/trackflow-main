from typing import Optional
from pydantic import BaseModel, Field


class CreateProjectPayload(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)


class UpdateProjectPayload(BaseModel):
    title: Optional[str] = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(..., min_length=1)
