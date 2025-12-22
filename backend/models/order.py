from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from bson import ObjectId
import random
import string

def generate_order_number():
    return 'ORD-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

class OrderItem(BaseModel):
    menuItemId: str
    name: str
    price: float
    quantity: int = Field(ge=1)

class OrderBase(BaseModel):
    restaurantId: str
    items: List[OrderItem]
    deliveryAddress: dict
    paymentMethod: str
    subtotal: float = Field(ge=0)
    deliveryFee: float = Field(ge=0)
    serviceFee: float = Field(ge=0)
    total: float = Field(ge=0)

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    orderNumber: str = Field(default_factory=generate_order_number)
    userId: str
    status: str = "pending"
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class OrderResponse(OrderBase):
    id: str
    orderNumber: str
    userId: str
    status: str
    createdAt: datetime

    class Config:
        orm_mode = True