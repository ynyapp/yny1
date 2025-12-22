from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class Location(BaseModel):
    address: str
    city: str
    coordinates: Optional[dict] = None

class RestaurantBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    slug: str
    cuisine: str
    rating: float = Field(default=0.0, ge=0, le=5)
    reviewCount: int = Field(default=0, ge=0)
    deliveryTime: str
    priceRange: str
    location: Location
    image: str
    isOpen: bool = True
    discount: Optional[str] = None
    tags: List[str] = []
    minOrder: float = Field(ge=0)
    deliveryFee: float = Field(ge=0)

class RestaurantCreate(RestaurantBase):
    pass

class Restaurant(RestaurantBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class RestaurantResponse(RestaurantBase):
    id: str
    createdAt: datetime

    class Config:
        orm_mode = True