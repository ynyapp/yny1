from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import string
import random

def generate_coupon_code():
    return 'YNY-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class CouponBase(BaseModel):
    code: str = Field(default_factory=generate_coupon_code)
    name: str
    description: Optional[str] = None
    discountType: str = Field(..., description="percentage or fixed")
    discountValue: float = Field(ge=0)
    minOrderAmount: float = Field(default=0, ge=0)
    maxDiscountAmount: Optional[float] = None
    usageLimit: Optional[int] = None
    usedCount: int = Field(default=0)
    userLimit: int = Field(default=1)
    validFrom: datetime
    validUntil: datetime
    isActive: bool = True
    applicableRestaurants: List[str] = []  # Empty means all restaurants
    applicableCuisines: List[str] = []  # Empty means all cuisines

class CouponCreate(BaseModel):
    code: Optional[str] = None
    name: str
    description: Optional[str] = None
    discountType: str
    discountValue: float
    minOrderAmount: float = 0
    maxDiscountAmount: Optional[float] = None
    usageLimit: Optional[int] = None
    userLimit: int = 1
    validFrom: datetime
    validUntil: datetime
    isActive: bool = True
    applicableRestaurants: List[str] = []
    applicableCuisines: List[str] = []

class Coupon(CouponBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class CouponResponse(CouponBase):
    id: str
    createdAt: datetime

    class Config:
        orm_mode = True

class CouponUsage(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    couponId: str
    userId: str
    orderId: str
    discountApplied: float
    usedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
