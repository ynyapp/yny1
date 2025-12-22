from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class ReviewBase(BaseModel):
    restaurantId: str
    rating: int = Field(ge=1, le=5)
    comment: str = Field(..., max_length=1000)

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    userId: str
    userName: str
    userAvatar: Optional[str] = None
    orderId: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ReviewResponse(ReviewBase):
    id: str
    userId: str
    userName: str
    userAvatar: Optional[str] = None
    createdAt: datetime

    class Config:
        orm_mode = True