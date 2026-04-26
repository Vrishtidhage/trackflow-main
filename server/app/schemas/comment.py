from pydantic import BaseModel


class CreateCommentPayload(BaseModel):
    content: str
    bug_id: int


class UpdateCommentPayload(BaseModel):
    content: str
