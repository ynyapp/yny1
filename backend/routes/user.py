from fastapi import APIRouter, HTTPException, status, Depends
from models.user import UserUpdate, UserResponse, Address
from utils.security import get_current_user
from utils.logger import log_request, log_error
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/user", tags=["user"])

from database import db

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile"""
    try:
        log_request("/api/user/profile", "GET", current_user["user_id"])
        
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
        log_error(e, "get_profile")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch profile"
        )

@router.put("/profile", response_model=UserResponse)
async def update_profile(user_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    try:
        log_request("/api/user/profile", "PUT", current_user["user_id"])
        
        # Build update data
        update_data = {k: v for k, v in user_data.dict(exclude_unset=True).items()}
        update_data["updatedAt"] = datetime.utcnow()
        
        # Try to update user by string ID first, then by ObjectId
        result = await db.users.update_one(
            {"_id": current_user["user_id"]},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            if ObjectId.is_valid(current_user["user_id"]):
                result = await db.users.update_one(
                    {"_id": ObjectId(current_user["user_id"])},
                    {"$set": update_data}
                )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get updated user
        user = await db.users.find_one({"_id": current_user["user_id"]})
        if not user:
            if ObjectId.is_valid(current_user["user_id"]):
                user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
        
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
        log_error(e, "update_profile")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

@router.post("/addresses", response_model=UserResponse)
async def add_address(address: Address, current_user: dict = Depends(get_current_user)):
    """Add new address"""
    try:
        log_request("/api/user/addresses", "POST", current_user["user_id"])
        
        # Add address
        result = await db.users.update_one(
            {"_id": ObjectId(current_user["user_id"])},
            {"$push": {"addresses": address.dict()}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get updated user
        user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
        user["id"] = str(user["_id"])
        del user["password"]
        del user["_id"]
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "add_address")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add address"
        )

@router.delete("/addresses/{address_id}", response_model=UserResponse)
async def delete_address(address_id: str, current_user: dict = Depends(get_current_user)):
    """Delete address"""
    try:
        log_request(f"/api/user/addresses/{address_id}", "DELETE", current_user["user_id"])
        
        # Remove address
        result = await db.users.update_one(
            {"_id": ObjectId(current_user["user_id"])},
            {"$pull": {"addresses": {"id": address_id}}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )
        
        # Get updated user
        user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
        user["id"] = str(user["_id"])
        del user["password"]
        del user["_id"]
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "delete_address")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete address"
        )