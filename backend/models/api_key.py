from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import secrets

def generate_api_key():
    return f"yny_live_{secrets.token_urlsafe(32)}"

def generate_api_secret():
    return f"yny_secret_{secrets.token_urlsafe(48)}"

class APIKeyBase(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: List[str] = Field(default_factory=lambda: ["read"])  # read, write, delete, admin
    rateLimit: int = Field(default=1000)  # requests per hour
    isActive: bool = True
    allowedIPs: List[str] = []  # Empty means all IPs allowed
    allowedOrigins: List[str] = []  # Empty means all origins allowed

class APIKeyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: List[str] = ["read"]
    rateLimit: int = 1000
    allowedIPs: List[str] = []
    allowedOrigins: List[str] = []

class APIKey(APIKeyBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    key: str = Field(default_factory=generate_api_key)
    secret: str = Field(default_factory=generate_api_secret)
    ownerId: str  # User ID who created this key
    lastUsed: Optional[datetime] = None
    usageCount: int = Field(default=0)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class APIKeyResponse(APIKeyBase):
    id: str
    key: str  # Show only first time or on reveal
    ownerId: str
    lastUsed: Optional[datetime] = None
    usageCount: int
    createdAt: datetime

    class Config:
        orm_mode = True

class APIKeyPublicResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    permissions: List[str]
    rateLimit: int
    isActive: bool
    lastUsed: Optional[datetime] = None
    usageCount: int
    createdAt: datetime

    class Config:
        orm_mode = True

class APIUsageLog(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    apiKeyId: str
    endpoint: str
    method: str
    statusCode: int
    responseTime: float  # milliseconds
    ipAddress: str
    userAgent: Optional[str] = None
    requestBody: Optional[dict] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
