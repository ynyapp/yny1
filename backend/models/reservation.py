from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import random
import string

def generate_reservation_code():
    return 'RES-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class ReservationBase(BaseModel):
    restaurantId: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    partySize: int = Field(ge=1, le=20)
    specialRequests: Optional[str] = None
    tablePreference: Optional[str] = None  # indoor, outdoor, window, private

class ReservationCreate(ReservationBase):
    pass

class Reservation(ReservationBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    reservationCode: str = Field(default_factory=generate_reservation_code)
    userId: str
    userName: str
    userPhone: str
    userEmail: str
    status: str = Field(default="pending")  # pending, confirmed, cancelled, completed, no_show
    confirmedAt: Optional[datetime] = None
    cancelledAt: Optional[datetime] = None
    cancellationReason: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ReservationResponse(ReservationBase):
    id: str
    reservationCode: str
    userId: str
    userName: str
    userPhone: str
    status: str
    createdAt: datetime

    class Config:
        orm_mode = True

class RestaurantAvailability(BaseModel):
    restaurantId: str
    date: str
    timeSlots: List[dict] = []  # [{"time": "12:00", "available": 5}, ...]
    maxCapacity: int = 50

    class Config:
        orm_mode = True
