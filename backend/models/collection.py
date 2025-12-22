from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class CollectionBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: str
    image: str
    restaurantIds: List[str] = []
    category: str = Field(default="general")  # trending, new, deals, special_events, etc.
    isActive: bool = True
    priority: int = Field(default=0)  # Higher priority shows first
    
class CollectionCreate(CollectionBase):
    pass

class Collection(CollectionBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class CollectionResponse(CollectionBase):
    id: str
    restaurantCount: int = 0
    createdAt: Optional[datetime] = None
    
    class Config:
        orm_mode = True
