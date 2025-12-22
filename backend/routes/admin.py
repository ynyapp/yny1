from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models.restaurant import Restaurant, RestaurantCreate
from models.menu import MenuItem, MenuItemCreate
from models.order import Order
from utils.security import get_current_user, create_slug
from utils.logger import log_request, log_error
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["admin"])

from server import db

# Admin check middleware
async def verify_admin(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user or not user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# ==================== RESTAURANTS ====================

@router.get("/restaurants", response_model=List[dict])
async def get_all_restaurants_admin(current_user: dict = Depends(verify_admin)):
    """Get all restaurants for admin"""
    try:
        log_request("/api/admin/restaurants", "GET", current_user["user_id"])
        
        cursor = db.restaurants.find()
        restaurants = await cursor.to_list(length=1000)
        
        for restaurant in restaurants:
            restaurant["id"] = str(restaurant["_id"])
            del restaurant["_id"]
        
        return restaurants
    except Exception as e:
        log_error(e, "get_all_restaurants_admin")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch restaurants"
        )

@router.post("/restaurants", status_code=status.HTTP_201_CREATED)
async def create_restaurant(restaurant_data: RestaurantCreate, current_user: dict = Depends(verify_admin)):
    """Create a new restaurant"""
    try:
        log_request("/api/admin/restaurants", "POST", current_user["user_id"])
        
        # Create slug
        slug = create_slug(f"{restaurant_data.name} {restaurant_data.location.city}")
        
        restaurant = Restaurant(
            **restaurant_data.dict(),
            slug=slug
        )
        
        result = await db.restaurants.insert_one(restaurant.dict(by_alias=True))
        restaurant_id = str(result.inserted_id)
        
        created_restaurant = await db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
        created_restaurant["id"] = str(created_restaurant["_id"])
        del created_restaurant["_id"]
        
        return created_restaurant
    except Exception as e:
        log_error(e, "create_restaurant")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create restaurant"
        )

@router.put("/restaurants/{restaurant_id}")
async def update_restaurant(restaurant_id: str, restaurant_data: dict, current_user: dict = Depends(verify_admin)):
    """Update restaurant"""
    try:
        log_request(f"/api/admin/restaurants/{restaurant_id}", "PUT", current_user["user_id"])
        
        if not ObjectId.is_valid(restaurant_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid restaurant ID"
            )
        
        restaurant_data["updatedAt"] = datetime.utcnow()
        
        result = await db.restaurants.update_one(
            {"_id": ObjectId(restaurant_id)},
            {"$set": restaurant_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant not found"
            )
        
        updated_restaurant = await db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
        updated_restaurant["id"] = str(updated_restaurant["_id"])
        del updated_restaurant["_id"]
        
        return updated_restaurant
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "update_restaurant")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update restaurant"
        )

@router.delete("/restaurants/{restaurant_id}")
async def delete_restaurant(restaurant_id: str, current_user: dict = Depends(verify_admin)):
    """Delete restaurant"""
    try:
        log_request(f"/api/admin/restaurants/{restaurant_id}", "DELETE", current_user["user_id"])
        
        if not ObjectId.is_valid(restaurant_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid restaurant ID"
            )
        
        # Delete restaurant
        result = await db.restaurants.delete_one({"_id": ObjectId(restaurant_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant not found"
            )
        
        # Delete related menu items
        await db.menu_items.delete_many({"restaurantId": restaurant_id})
        
        return {"message": "Restaurant deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "delete_restaurant")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete restaurant"
        )

# ==================== MENU ITEMS ====================

@router.post("/menu-items", status_code=status.HTTP_201_CREATED)
async def create_menu_item(menu_item_data: MenuItemCreate, current_user: dict = Depends(verify_admin)):
    """Create a new menu item"""
    try:
        log_request("/api/admin/menu-items", "POST", current_user["user_id"])
        
        menu_item = MenuItem(**menu_item_data.dict())
        
        result = await db.menu_items.insert_one(menu_item.dict(by_alias=True))
        menu_item_id = str(result.inserted_id)
        
        created_item = await db.menu_items.find_one({"_id": ObjectId(menu_item_id)})
        created_item["id"] = str(created_item["_id"])
        del created_item["_id"]
        
        return created_item
    except Exception as e:
        log_error(e, "create_menu_item")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create menu item"
        )

@router.put("/menu-items/{item_id}")
async def update_menu_item(item_id: str, item_data: dict, current_user: dict = Depends(verify_admin)):
    """Update menu item"""
    try:
        log_request(f"/api/admin/menu-items/{item_id}", "PUT", current_user["user_id"])
        
        if not ObjectId.is_valid(item_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid item ID"
            )
        
        result = await db.menu_items.update_one(
            {"_id": ObjectId(item_id)},
            {"$set": item_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu item not found"
            )
        
        updated_item = await db.menu_items.find_one({"_id": ObjectId(item_id)})
        updated_item["id"] = str(updated_item["_id"])
        del updated_item["_id"]
        
        return updated_item
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "update_menu_item")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update menu item"
        )

@router.delete("/menu-items/{item_id}")
async def delete_menu_item(item_id: str, current_user: dict = Depends(verify_admin)):
    """Delete menu item"""
    try:
        log_request(f"/api/admin/menu-items/{item_id}", "DELETE", current_user["user_id"])
        
        if not ObjectId.is_valid(item_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid item ID"
            )
        
        result = await db.menu_items.delete_one({"_id": ObjectId(item_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu item not found"
            )
        
        return {"message": "Menu item deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "delete_menu_item")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete menu item"
        )

# ==================== ORDERS ====================

@router.get("/orders")
async def get_all_orders(current_user: dict = Depends(verify_admin)):
    """Get all orders for admin"""
    try:
        log_request("/api/admin/orders", "GET", current_user["user_id"])
        
        cursor = db.orders.find().sort("createdAt", -1)
        orders = await cursor.to_list(length=1000)
        
        for order in orders:
            order["id"] = str(order["_id"])
            del order["_id"]
        
        return orders
    except Exception as e:
        log_error(e, "get_all_orders")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch orders"
        )

@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status_data: dict, current_user: dict = Depends(verify_admin)):
    """Update order status"""
    try:
        log_request(f"/api/admin/orders/{order_id}/status", "PUT", current_user["user_id"])
        
        if not ObjectId.is_valid(order_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid order ID"
            )
        
        new_status = status_data.get("status")
        valid_statuses = ["pending", "confirmed", "preparing", "on-the-way", "delivered", "cancelled"]
        
        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status"
            )
        
        result = await db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": new_status, "updatedAt": datetime.utcnow()}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        updated_order = await db.orders.find_one({"_id": ObjectId(order_id)})
        updated_order["id"] = str(updated_order["_id"])
        del updated_order["_id"]
        
        return updated_order
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "update_order_status")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order status"
        )

# ==================== ANALYTICS ====================

@router.get("/analytics/dashboard")
async def get_dashboard_analytics(current_user: dict = Depends(verify_admin)):
    """Get dashboard analytics"""
    try:
        log_request("/api/admin/analytics/dashboard", "GET", current_user["user_id"])
        
        # Total restaurants
        total_restaurants = await db.restaurants.count_documents({})
        
        # Total orders
        total_orders = await db.orders.count_documents({})
        
        # Total users
        total_users = await db.users.count_documents({})
        
        # Total revenue
        pipeline = [
            {"$group": {"_id": None, "total": {"$sum": "$total"}}}
        ]
        revenue_result = await db.orders.aggregate(pipeline).to_list(1)
        total_revenue = revenue_result[0]["total"] if revenue_result else 0
        
        # Recent orders
        recent_orders = await db.orders.find().sort("createdAt", -1).limit(5).to_list(5)
        for order in recent_orders:
            order["id"] = str(order["_id"])
            del order["_id"]
        
        # Orders by status
        status_pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        status_result = await db.orders.aggregate(status_pipeline).to_list(10)
        orders_by_status = {item["_id"]: item["count"] for item in status_result}
        
        return {
            "total_restaurants": total_restaurants,
            "total_orders": total_orders,
            "total_users": total_users,
            "total_revenue": total_revenue,
            "recent_orders": recent_orders,
            "orders_by_status": orders_by_status
        }
    except Exception as e:
        log_error(e, "get_dashboard_analytics")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch analytics"
        )
