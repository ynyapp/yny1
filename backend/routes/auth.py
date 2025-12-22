from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import timedelta
from bson import ObjectId
from models.user import UserCreate, UserLogin, UserResponse, Token, User
from utils.security import (
    get_password_hash, 
    verify_password, 
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from utils.logger import log_request, log_error, log_security_event
import os

router = APIRouter(prefix="/auth", tags=["authentication"])

# Get database
from database import db

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        log_request("/api/auth/register", "POST")
        
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            log_security_event("duplicate_registration", {"email": user_data.email})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        user = User(
            name=user_data.name,
            email=user_data.email,
            phone=user_data.phone,
            password=get_password_hash(user_data.password)
        )
        
        result = await db.users.insert_one(user.dict(by_alias=True))
        user_id = str(result.inserted_id)
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user_data.email, "user_id": user_id},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        log_security_event("user_registered", {"user_id": user_id, "email": user_data.email})
        
        return {"access_token": access_token, "token_type": "bearer"}
    
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "register")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login user"""
    try:
        log_request("/api/auth/login", "POST")
        
        # Find user
        user = await db.users.find_one({"email": user_data.email})
        if not user:
            log_security_event("failed_login", {"email": user_data.email, "reason": "user_not_found"})
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Verify password
        if not verify_password(user_data.password, user["password"]):
            log_security_event("failed_login", {"email": user_data.email, "reason": "wrong_password"})
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user["email"], "user_id": str(user["_id"])},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        log_security_event("user_logged_in", {"user_id": str(user["_id"]), "email": user["email"]})
        
        return {"access_token": access_token, "token_type": "bearer"}
    
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "login")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    try:
        log_request("/api/auth/me", "GET", current_user["user_id"])
        
        # Try to find user by string ID first, then by ObjectId
        user = await db.users.find_one({"_id": current_user["user_id"]})
        if not user:
            if ObjectId.is_valid(current_user["user_id"]):
                user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Convert ObjectId to string if needed
        if isinstance(user["_id"], ObjectId):
            user["id"] = str(user["_id"])
        else:
            user["id"] = user["_id"]
        del user["password"]
        del user["_id"]
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "get_current_user_info")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user info"
        )