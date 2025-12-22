from fastapi import APIRouter, HTTPException, status
from typing import List
from models.menu import MenuItem, MenuItemResponse
from utils.logger import log_request, log_error
from bson import ObjectId

router = APIRouter(prefix="/menu", tags=["menu"])

from database import db

@router.get("/{restaurant_id}", response_model=List[MenuItemResponse])
async def get_menu(restaurant_id: str):
    """Get menu items for a restaurant"""
    try:
        log_request(f"/api/menu/{restaurant_id}", "GET")
        
        # Get menu items
        cursor = db.menu_items.find({"restaurantId": restaurant_id})
        menu_items = await cursor.to_list(length=1000)
        
        # Convert ObjectId to string
        for item in menu_items:
            item["id"] = str(item["_id"])
            del item["_id"]
        
        return menu_items
    
    except Exception as e:
        log_error(e, "get_menu")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch menu"
        )