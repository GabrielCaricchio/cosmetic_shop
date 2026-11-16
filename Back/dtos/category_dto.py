from pydantic import BaseModel, Field
from datetime import datetime

class CategoryCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=120)

class CategoryResponse(BaseModel):
    category_id: int
    name: str
    slug: str
    created_at: datetime

    class Config:
        from_attributes = True
