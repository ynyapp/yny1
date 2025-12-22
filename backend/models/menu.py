from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class MenuItemBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: str
    price: float = Field(ge=0)
    image: str
    category: str
    isAvailable: bool = True

class MenuItemCreate(MenuItemBase):
    restaurantId: str

class MenuItem(MenuItemBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    restaurantId: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class MenuItemResponse(MenuItemBase):
    id: str
    restaurantId: str

    class Config:
        orm_mode = True