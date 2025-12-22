from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class CampaignBase(BaseModel):
    name: str
    title: str
    description: str
    image: str
    campaignType: str = Field(..., description="banner, popup, notification, email, sms")
    targetAudience: str = Field(default="all", description="all, new_users, loyal_users, inactive_users")
    discountType: Optional[str] = None  # percentage or fixed
    discountValue: Optional[float] = None
    couponCode: Optional[str] = None
    startDate: datetime
    endDate: datetime
    isActive: bool = True
    priority: int = Field(default=0)  # Higher priority shows first
    showOnHomepage: bool = False
    applicableRestaurants: List[str] = []
    applicableCuisines: List[str] = []
    applicableCities: List[str] = []
    clickCount: int = Field(default=0)
    impressionCount: int = Field(default=0)

class CampaignCreate(BaseModel):
    name: str
    title: str
    description: str
    image: str
    campaignType: str
    targetAudience: str = "all"
    discountType: Optional[str] = None
    discountValue: Optional[float] = None
    couponCode: Optional[str] = None
    startDate: datetime
    endDate: datetime
    isActive: bool = True
    priority: int = 0
    showOnHomepage: bool = False
    applicableRestaurants: List[str] = []
    applicableCuisines: List[str] = []
    applicableCities: List[str] = []

class Campaign(CampaignBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class CampaignResponse(CampaignBase):
    id: str
    createdAt: datetime

    class Config:
        orm_mode = True
