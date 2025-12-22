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
    type: str = Field(default="both")  # 'delivery', 'dine-in', 'both'
    hasDelivery: bool = True
    hasTableBooking: bool = False
    phone: Optional[str] = None
    description: Optional[str] = None
    deliveryRadius: float = Field(default=5.0, ge=0)  # km
    
    # Amenities
    amenities: List[str] = []  # wifi, parking, valet, highChairs, bar, outdoorSeating, liveMusic, rooftop
    
    # Dietary Options
    dietaryOptions: List[str] = []  # vegetarian, vegan, glutenFree, halal, kosher
    
    # Atmosphere
    atmosphere: List[str] = []  # casual, romantic, upscale, cozy, trendy, family_friendly
    
    # Special Features
    specialFeatures: List[str] = []  # petFriendly, happyHour, lateNight, breakfast, reservation
    
    # Promotions & Offers
    isPromoted: bool = False
    promotionText: Optional[str] = None  # "Ad", "Promoted", etc.
    offers: List[str] = []  # "Flat 15% OFF", "Buy 1 Get 1 Free", "Free Delivery", etc.
    isGoldPartner: bool = False
    hasActiveOffer: bool = False

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
    createdAt: Optional[datetime] = None

    class Config:
        orm_mode = True