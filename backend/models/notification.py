from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class NotificationBase(BaseModel):
    userId: str
    title: str
    message: str
    notificationType: str = Field(..., description="order, promotion, system, reservation")
    data: Optional[dict] = None  # Additional data like orderId, restaurantId, etc.
    isRead: bool = False
    readAt: Optional[datetime] = None

class NotificationCreate(BaseModel):
    userId: str
    title: str
    message: str
    notificationType: str
    data: Optional[dict] = None

class Notification(NotificationBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class NotificationResponse(NotificationBase):
    id: str
    createdAt: datetime

    class Config:
        orm_mode = True

# Bulk notification for campaigns
class BulkNotification(BaseModel):
    title: str
    message: str
    notificationType: str = "promotion"
    targetAudience: str = "all"  # all, new_users, loyal_users, specific_users
    userIds: Optional[List[str]] = None  # For specific_users
    data: Optional[dict] = None
