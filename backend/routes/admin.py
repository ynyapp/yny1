from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from models.restaurant import Restaurant, RestaurantCreate, Location
from models.menu import MenuItem, MenuItemCreate
from models.order import Order
from models.coupon import Coupon, CouponCreate, CouponUsage
from models.campaign import Campaign, CampaignCreate
from models.api_key import APIKey, APIKeyCreate, APIUsageLog
from models.notification import Notification, NotificationCreate, BulkNotification
from models.reservation import Reservation
from utils.security import get_current_user, create_slug
from utils.logger import log_request, log_error
from bson import ObjectId
from datetime import datetime, timedelta
from database import db

router = APIRouter(prefix="/admin", tags=["admin"])

# Admin check middleware
async def verify_admin(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    
    # Try both string and ObjectId queries
    user = await db.users.find_one({"_id": user_id})
    if not user:
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
        except:
            pass
    
    if not user or not user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# ==================== DASHBOARD & ANALYTICS ====================

@router.get("/analytics/dashboard")
async def get_dashboard_analytics(current_user: dict = Depends(verify_admin)):
    """Get comprehensive dashboard analytics"""
    try:
        log_request("/api/admin/analytics/dashboard", "GET", current_user["user_id"])
        
        # Total counts
        total_restaurants = await db.restaurants.count_documents({})
        total_orders = await db.orders.count_documents({})
        total_users = await db.users.count_documents({})
        total_reviews = await db.reviews.count_documents({})
        
        # Active campaigns & coupons
        now = datetime.utcnow()
        active_campaigns = await db.campaigns.count_documents({
            "isActive": True,
            "startDate": {"$lte": now},
            "endDate": {"$gte": now}
        })
        active_coupons = await db.coupons.count_documents({
            "isActive": True,
            "validFrom": {"$lte": now},
            "validUntil": {"$gte": now}
        })
        
        # Total revenue
        pipeline = [
            {"$match": {"status": {"$ne": "cancelled"}}},
            {"$group": {"_id": None, "total": {"$sum": "$total"}}}
        ]
        revenue_result = await db.orders.aggregate(pipeline).to_list(1)
        total_revenue = revenue_result[0]["total"] if revenue_result else 0
        
        # Today's stats
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_orders = await db.orders.count_documents({"createdAt": {"$gte": today_start}})
        
        today_revenue_pipeline = [
            {"$match": {"createdAt": {"$gte": today_start}, "status": {"$ne": "cancelled"}}},
            {"$group": {"_id": None, "total": {"$sum": "$total"}}}
        ]
        today_revenue_result = await db.orders.aggregate(today_revenue_pipeline).to_list(1)
        today_revenue = today_revenue_result[0]["total"] if today_revenue_result else 0
        
        # Recent orders
        recent_orders = await db.orders.find().sort("createdAt", -1).limit(10).to_list(10)
        for order in recent_orders:
            order["id"] = str(order["_id"])
            del order["_id"]
        
        # Orders by status
        status_pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        status_result = await db.orders.aggregate(status_pipeline).to_list(10)
        orders_by_status = {item["_id"]: item["count"] for item in status_result}
        
        # Revenue trend (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        revenue_trend_pipeline = [
            {"$match": {"createdAt": {"$gte": seven_days_ago}, "status": {"$ne": "cancelled"}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
                "revenue": {"$sum": "$total"},
                "orders": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        revenue_trend = await db.orders.aggregate(revenue_trend_pipeline).to_list(7)
        
        # Top restaurants by orders
        top_restaurants_pipeline = [
            {"$group": {"_id": "$restaurantId", "orders": {"$sum": 1}, "revenue": {"$sum": "$total"}}},
            {"$sort": {"revenue": -1}},
            {"$limit": 5}
        ]
        top_restaurants = await db.orders.aggregate(top_restaurants_pipeline).to_list(5)
        
        # Enrich with restaurant names
        for item in top_restaurants:
            restaurant = await db.restaurants.find_one({"_id": ObjectId(item["_id"])})
            item["name"] = restaurant["name"] if restaurant else "Unknown"
            item["id"] = item["_id"]
            del item["_id"]
        
        # Top cuisines
        cuisine_pipeline = [
            {"$group": {"_id": "$cuisine", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        top_cuisines = await db.restaurants.aggregate(cuisine_pipeline).to_list(10)
        
        return {
            "summary": {
                "total_restaurants": total_restaurants,
                "total_orders": total_orders,
                "total_users": total_users,
                "total_reviews": total_reviews,
                "total_revenue": total_revenue,
                "active_campaigns": active_campaigns,
                "active_coupons": active_coupons
            },
            "today": {
                "orders": today_orders,
                "revenue": today_revenue
            },
            "recent_orders": recent_orders,
            "orders_by_status": orders_by_status,
            "revenue_trend": revenue_trend,
            "top_restaurants": top_restaurants,
            "top_cuisines": [{"cuisine": c["_id"], "count": c["count"]} for c in top_cuisines]
        }
    except Exception as e:
        log_error(e, "get_dashboard_analytics")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch analytics"
        )

@router.get("/analytics/orders")
async def get_order_analytics(
    period: str = Query("week", description="day, week, month, year"),
    current_user: dict = Depends(verify_admin)
):
    """Get detailed order analytics"""
    try:
        periods = {
            "day": timedelta(days=1),
            "week": timedelta(days=7),
            "month": timedelta(days=30),
            "year": timedelta(days=365)
        }
        
        start_date = datetime.utcnow() - periods.get(period, timedelta(days=7))
        
        # Order count by hour/day
        if period == "day":
            group_format = "%H:00"
        else:
            group_format = "%Y-%m-%d"
        
        pipeline = [
            {"$match": {"createdAt": {"$gte": start_date}}},
            {"$group": {
                "_id": {"$dateToString": {"format": group_format, "date": "$createdAt"}},
                "count": {"$sum": 1},
                "revenue": {"$sum": "$total"},
                "avgOrderValue": {"$avg": "$total"}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        time_series = await db.orders.aggregate(pipeline).to_list(100)
        
        # Order completion rate
        total = await db.orders.count_documents({"createdAt": {"$gte": start_date}})
        completed = await db.orders.count_documents({
            "createdAt": {"$gte": start_date},
            "status": "delivered"
        })
        cancelled = await db.orders.count_documents({
            "createdAt": {"$gte": start_date},
            "status": "cancelled"
        })
        
        return {
            "time_series": time_series,
            "completion_rate": (completed / total * 100) if total > 0 else 0,
            "cancellation_rate": (cancelled / total * 100) if total > 0 else 0,
            "total_orders": total
        }
    except Exception as e:
        log_error(e, "get_order_analytics")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch order analytics"
        )

@router.get("/analytics/users")
async def get_user_analytics(current_user: dict = Depends(verify_admin)):
    """Get user analytics"""
    try:
        # Total users
        total_users = await db.users.count_documents({})
        
        # New users this week
        week_ago = datetime.utcnow() - timedelta(days=7)
        new_users_week = await db.users.count_documents({"createdAt": {"$gte": week_ago}})
        
        # Users with orders
        users_with_orders_pipeline = [
            {"$group": {"_id": "$userId"}},
            {"$count": "total"}
        ]
        users_with_orders_result = await db.orders.aggregate(users_with_orders_pipeline).to_list(1)
        users_with_orders = users_with_orders_result[0]["total"] if users_with_orders_result else 0
        
        # User registration trend
        registration_trend_pipeline = [
            {"$match": {"createdAt": {"$gte": datetime.utcnow() - timedelta(days=30)}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        registration_trend = await db.users.aggregate(registration_trend_pipeline).to_list(30)
        
        # Top ordering users
        top_users_pipeline = [
            {"$group": {"_id": "$userId", "orders": {"$sum": 1}, "spent": {"$sum": "$total"}}},
            {"$sort": {"spent": -1}},
            {"$limit": 10}
        ]
        top_users = await db.orders.aggregate(top_users_pipeline).to_list(10)
        
        return {
            "total_users": total_users,
            "new_users_week": new_users_week,
            "users_with_orders": users_with_orders,
            "conversion_rate": (users_with_orders / total_users * 100) if total_users > 0 else 0,
            "registration_trend": registration_trend,
            "top_users": top_users
        }
    except Exception as e:
        log_error(e, "get_user_analytics")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user analytics"
        )

# ==================== RESTAURANTS ====================

@router.get("/restaurants", response_model=List[dict])
async def get_all_restaurants_admin(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    city: Optional[str] = None,
    cuisine: Optional[str] = None,
    current_user: dict = Depends(verify_admin)
):
    """Get all restaurants for admin with filtering"""
    try:
        log_request("/api/admin/restaurants", "GET", current_user["user_id"])
        
        query = {}
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"cuisine": {"$regex": search, "$options": "i"}}
            ]
        if city:
            query["location.city"] = city
        if cuisine:
            query["cuisine"] = cuisine
        
        skip = (page - 1) * limit
        
        cursor = db.restaurants.find(query).skip(skip).limit(limit).sort("createdAt", -1)
        restaurants = await cursor.to_list(length=limit)
        
        total = await db.restaurants.count_documents(query)
        
        for restaurant in restaurants:
            restaurant["id"] = str(restaurant["_id"])
            del restaurant["_id"]
            # Add order count
            order_count = await db.orders.count_documents({"restaurantId": restaurant["id"]})
            restaurant["orderCount"] = order_count
        
        return {
            "restaurants": restaurants,
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit
        }
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
        
        slug = create_slug(f"{restaurant_data.name} {restaurant_data.location.city}")
        
        restaurant_dict = restaurant_data.dict()
        restaurant_dict["slug"] = slug
        restaurant_dict["createdAt"] = datetime.utcnow()
        restaurant_dict["updatedAt"] = datetime.utcnow()
        
        result = await db.restaurants.insert_one(restaurant_dict)
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

@router.get("/restaurants/{restaurant_id}")
async def get_restaurant_details(restaurant_id: str, current_user: dict = Depends(verify_admin)):
    """Get detailed restaurant info for admin"""
    try:
        if not ObjectId.is_valid(restaurant_id):
            raise HTTPException(status_code=400, detail="Invalid restaurant ID")
        
        restaurant = await db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        restaurant["id"] = str(restaurant["_id"])
        del restaurant["_id"]
        
        # Get menu items
        menu_items = await db.menu_items.find({"restaurantId": restaurant_id}).to_list(100)
        for item in menu_items:
            item["id"] = str(item["_id"])
            del item["_id"]
        
        # Get recent orders
        orders = await db.orders.find({"restaurantId": restaurant_id}).sort("createdAt", -1).limit(20).to_list(20)
        for order in orders:
            order["id"] = str(order["_id"])
            del order["_id"]
        
        # Get reviews
        reviews = await db.reviews.find({"restaurantId": restaurant_id}).sort("createdAt", -1).limit(20).to_list(20)
        for review in reviews:
            review["id"] = str(review["_id"])
            del review["_id"]
        
        # Stats
        total_orders = await db.orders.count_documents({"restaurantId": restaurant_id})
        revenue_pipeline = [
            {"$match": {"restaurantId": restaurant_id, "status": {"$ne": "cancelled"}}},
            {"$group": {"_id": None, "total": {"$sum": "$total"}}}
        ]
        revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(1)
        total_revenue = revenue_result[0]["total"] if revenue_result else 0
        
        return {
            "restaurant": restaurant,
            "menu_items": menu_items,
            "recent_orders": orders,
            "reviews": reviews,
            "stats": {
                "total_orders": total_orders,
                "total_revenue": total_revenue,
                "menu_item_count": len(menu_items),
                "review_count": len(reviews)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "get_restaurant_details")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch restaurant details"
        )

@router.put("/restaurants/{restaurant_id}")
async def update_restaurant(restaurant_id: str, restaurant_data: dict, current_user: dict = Depends(verify_admin)):
    """Update restaurant"""
    try:
        log_request(f"/api/admin/restaurants/{restaurant_id}", "PUT", current_user["user_id"])
        
        if not ObjectId.is_valid(restaurant_id):
            raise HTTPException(status_code=400, detail="Invalid restaurant ID")
        
        restaurant_data["updatedAt"] = datetime.utcnow()
        
        result = await db.restaurants.update_one(
            {"_id": ObjectId(restaurant_id)},
            {"$set": restaurant_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
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
    """Delete restaurant and related data"""
    try:
        log_request(f"/api/admin/restaurants/{restaurant_id}", "DELETE", current_user["user_id"])
        
        if not ObjectId.is_valid(restaurant_id):
            raise HTTPException(status_code=400, detail="Invalid restaurant ID")
        
        result = await db.restaurants.delete_one({"_id": ObjectId(restaurant_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        # Delete related data
        await db.menu_items.delete_many({"restaurantId": restaurant_id})
        await db.reviews.delete_many({"restaurantId": restaurant_id})
        
        return {"message": "Restaurant and related data deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "delete_restaurant")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete restaurant"
        )

# ==================== MENU ITEMS ====================

@router.get("/menu-items")
async def get_all_menu_items(
    restaurant_id: Optional[str] = None,
    category: Optional[str] = None,
    current_user: dict = Depends(verify_admin)
):
    """Get all menu items with filtering"""
    try:
        query = {}
        if restaurant_id:
            query["restaurantId"] = restaurant_id
        if category:
            query["category"] = category
        
        cursor = db.menu_items.find(query).sort("category", 1)
        items = await cursor.to_list(length=500)
        
        for item in items:
            item["id"] = str(item["_id"])
            del item["_id"]
        
        return items
    except Exception as e:
        log_error(e, "get_all_menu_items")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch menu items"
        )

@router.post("/menu-items", status_code=status.HTTP_201_CREATED)
async def create_menu_item(menu_item_data: MenuItemCreate, current_user: dict = Depends(verify_admin)):
    """Create a new menu item"""
    try:
        log_request("/api/admin/menu-items", "POST", current_user["user_id"])
        
        menu_item_dict = menu_item_data.dict()
        menu_item_dict["createdAt"] = datetime.utcnow()
        
        result = await db.menu_items.insert_one(menu_item_dict)
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
        if not ObjectId.is_valid(item_id):
            raise HTTPException(status_code=400, detail="Invalid item ID")
        
        result = await db.menu_items.update_one(
            {"_id": ObjectId(item_id)},
            {"$set": item_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Menu item not found")
        
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
        if not ObjectId.is_valid(item_id):
            raise HTTPException(status_code=400, detail="Invalid item ID")
        
        result = await db.menu_items.delete_one({"_id": ObjectId(item_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Menu item not found")
        
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
async def get_all_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    restaurant_id: Optional[str] = None,
    current_user: dict = Depends(verify_admin)
):
    """Get all orders with filtering"""
    try:
        query = {}
        if status:
            query["status"] = status
        if restaurant_id:
            query["restaurantId"] = restaurant_id
        
        skip = (page - 1) * limit
        
        cursor = db.orders.find(query).skip(skip).limit(limit).sort("createdAt", -1)
        orders = await cursor.to_list(length=limit)
        
        total = await db.orders.count_documents(query)
        
        for order in orders:
            order["id"] = str(order["_id"])
            del order["_id"]
            # Get restaurant name
            if order.get("restaurantId"):
                try:
                    restaurant = await db.restaurants.find_one({"_id": ObjectId(order["restaurantId"])})
                    order["restaurantName"] = restaurant["name"] if restaurant else "Unknown"
                except:
                    order["restaurantName"] = "Unknown"
        
        return {
            "orders": orders,
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        log_error(e, "get_all_orders")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch orders"
        )

@router.get("/orders/{order_id}")
async def get_order_details(order_id: str, current_user: dict = Depends(verify_admin)):
    """Get detailed order info"""
    try:
        if not ObjectId.is_valid(order_id):
            raise HTTPException(status_code=400, detail="Invalid order ID")
        
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        order["id"] = str(order["_id"])
        del order["_id"]
        
        # Get restaurant info
        if order.get("restaurantId"):
            try:
                restaurant = await db.restaurants.find_one({"_id": ObjectId(order["restaurantId"])})
                if restaurant:
                    order["restaurant"] = {
                        "id": str(restaurant["_id"]),
                        "name": restaurant["name"],
                        "phone": restaurant.get("phone"),
                        "address": restaurant.get("location", {}).get("address")
                    }
            except:
                pass
        
        # Get user info
        if order.get("userId"):
            try:
                user = await db.users.find_one({"_id": ObjectId(order["userId"])})
                if user:
                    order["user"] = {
                        "id": str(user["_id"]),
                        "name": user["name"],
                        "email": user["email"],
                        "phone": user.get("phone")
                    }
            except:
                pass
        
        return order
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "get_order_details")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch order details"
        )

@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status_data: dict, current_user: dict = Depends(verify_admin)):
    """Update order status"""
    try:
        if not ObjectId.is_valid(order_id):
            raise HTTPException(status_code=400, detail="Invalid order ID")
        
        new_status = status_data.get("status")
        valid_statuses = ["pending", "confirmed", "preparing", "on-the-way", "delivered", "cancelled"]
        
        if new_status not in valid_statuses:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        update_data = {
            "status": new_status,
            "updatedAt": datetime.utcnow()
        }
        
        # Add status-specific timestamps
        if new_status == "confirmed":
            update_data["confirmedAt"] = datetime.utcnow()
        elif new_status == "delivered":
            update_data["deliveredAt"] = datetime.utcnow()
        elif new_status == "cancelled":
            update_data["cancelledAt"] = datetime.utcnow()
            if status_data.get("reason"):
                update_data["cancellationReason"] = status_data["reason"]
        
        result = await db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        
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

# ==================== USERS ====================

@router.get("/users")
async def get_all_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    current_user: dict = Depends(verify_admin)
):
    """Get all users"""
    try:
        query = {}
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"phone": {"$regex": search, "$options": "i"}}
            ]
        
        skip = (page - 1) * limit
        
        cursor = db.users.find(query, {"password": 0}).skip(skip).limit(limit).sort("createdAt", -1)
        users = await cursor.to_list(length=limit)
        
        total = await db.users.count_documents(query)
        
        for user in users:
            user["id"] = str(user["_id"])
            del user["_id"]
            # Get order count
            order_count = await db.orders.count_documents({"userId": user["id"]})
            user["orderCount"] = order_count
        
        return {
            "users": users,
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        log_error(e, "get_all_users")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users"
        )

@router.get("/users/{user_id}")
async def get_user_details(user_id: str, current_user: dict = Depends(verify_admin)):
    """Get detailed user info"""
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        user = await db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user["id"] = str(user["_id"])
        del user["_id"]
        
        # Get user's orders
        orders = await db.orders.find({"userId": user_id}).sort("createdAt", -1).limit(20).to_list(20)
        for order in orders:
            order["id"] = str(order["_id"])
            del order["_id"]
        
        # Get user's reviews
        reviews = await db.reviews.find({"userId": user_id}).sort("createdAt", -1).to_list(20)
        for review in reviews:
            review["id"] = str(review["_id"])
            del review["_id"]
        
        # Stats
        total_spent_pipeline = [
            {"$match": {"userId": user_id, "status": "delivered"}},
            {"$group": {"_id": None, "total": {"$sum": "$total"}}}
        ]
        total_spent_result = await db.orders.aggregate(total_spent_pipeline).to_list(1)
        total_spent = total_spent_result[0]["total"] if total_spent_result else 0
        
        return {
            "user": user,
            "orders": orders,
            "reviews": reviews,
            "stats": {
                "total_orders": len(orders),
                "total_spent": total_spent,
                "total_reviews": len(reviews)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "get_user_details")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user details"
        )

@router.put("/users/{user_id}")
async def update_user(user_id: str, user_data: dict, current_user: dict = Depends(verify_admin)):
    """Update user (admin can update any user)"""
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        # Prevent password updates through this endpoint
        if "password" in user_data:
            del user_data["password"]
        
        user_data["updatedAt"] = datetime.utcnow()
        
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": user_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        updated_user = await db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
        updated_user["id"] = str(updated_user["_id"])
        del updated_user["_id"]
        
        return updated_user
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "update_user")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )

@router.put("/users/{user_id}/make-admin")
async def make_user_admin(user_id: str, current_user: dict = Depends(verify_admin)):
    """Make a user admin"""
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_admin": True, "updatedAt": datetime.utcnow()}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "User is now an admin"}
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "make_user_admin")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )

# ==================== COUPONS ====================

@router.get("/coupons")
async def get_all_coupons(
    is_active: Optional[bool] = None,
    current_user: dict = Depends(verify_admin)
):
    """Get all coupons"""
    try:
        query = {}
        if is_active is not None:
            query["isActive"] = is_active
        
        cursor = db.coupons.find(query).sort("createdAt", -1)
        coupons = await cursor.to_list(length=100)
        
        for coupon in coupons:
            coupon["id"] = str(coupon["_id"])
            del coupon["_id"]
        
        return coupons
    except Exception as e:
        log_error(e, "get_all_coupons")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch coupons"
        )

@router.post("/coupons", status_code=status.HTTP_201_CREATED)
async def create_coupon(coupon_data: CouponCreate, current_user: dict = Depends(verify_admin)):
    """Create a new coupon"""
    try:
        coupon_dict = coupon_data.dict()
        
        # Generate code if not provided
        if not coupon_dict.get("code"):
            coupon_dict["code"] = "YNY-" + "".join(__import__("random").choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", k=6))
        
        # Check if code already exists
        existing = await db.coupons.find_one({"code": coupon_dict["code"]})
        if existing:
            raise HTTPException(status_code=400, detail="Coupon code already exists")
        
        coupon_dict["usedCount"] = 0
        coupon_dict["createdAt"] = datetime.utcnow()
        coupon_dict["updatedAt"] = datetime.utcnow()
        
        result = await db.coupons.insert_one(coupon_dict)
        coupon_id = str(result.inserted_id)
        
        created_coupon = await db.coupons.find_one({"_id": ObjectId(coupon_id)})
        created_coupon["id"] = str(created_coupon["_id"])
        del created_coupon["_id"]
        
        return created_coupon
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "create_coupon")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create coupon"
        )

@router.put("/coupons/{coupon_id}")
async def update_coupon(coupon_id: str, coupon_data: dict, current_user: dict = Depends(verify_admin)):
    """Update coupon"""
    try:
        if not ObjectId.is_valid(coupon_id):
            raise HTTPException(status_code=400, detail="Invalid coupon ID")
        
        coupon_data["updatedAt"] = datetime.utcnow()
        
        result = await db.coupons.update_one(
            {"_id": ObjectId(coupon_id)},
            {"$set": coupon_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Coupon not found")
        
        updated_coupon = await db.coupons.find_one({"_id": ObjectId(coupon_id)})
        updated_coupon["id"] = str(updated_coupon["_id"])
        del updated_coupon["_id"]
        
        return updated_coupon
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "update_coupon")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update coupon"
        )

@router.delete("/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str, current_user: dict = Depends(verify_admin)):
    """Delete coupon"""
    try:
        if not ObjectId.is_valid(coupon_id):
            raise HTTPException(status_code=400, detail="Invalid coupon ID")
        
        result = await db.coupons.delete_one({"_id": ObjectId(coupon_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Coupon not found")
        
        return {"message": "Coupon deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "delete_coupon")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete coupon"
        )

@router.get("/coupons/{coupon_id}/usage")
async def get_coupon_usage(coupon_id: str, current_user: dict = Depends(verify_admin)):
    """Get coupon usage history"""
    try:
        if not ObjectId.is_valid(coupon_id):
            raise HTTPException(status_code=400, detail="Invalid coupon ID")
        
        usage = await db.coupon_usage.find({"couponId": coupon_id}).sort("usedAt", -1).to_list(100)
        
        for item in usage:
            item["id"] = str(item["_id"])
            del item["_id"]
        
        return usage
    except Exception as e:
        log_error(e, "get_coupon_usage")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch coupon usage"
        )

# ==================== CAMPAIGNS ====================

@router.get("/campaigns")
async def get_all_campaigns(
    is_active: Optional[bool] = None,
    campaign_type: Optional[str] = None,
    current_user: dict = Depends(verify_admin)
):
    """Get all campaigns"""
    try:
        query = {}
        if is_active is not None:
            query["isActive"] = is_active
        if campaign_type:
            query["campaignType"] = campaign_type
        
        cursor = db.campaigns.find(query).sort("priority", -1)
        campaigns = await cursor.to_list(length=100)
        
        for campaign in campaigns:
            campaign["id"] = str(campaign["_id"])
            del campaign["_id"]
        
        return campaigns
    except Exception as e:
        log_error(e, "get_all_campaigns")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch campaigns"
        )

@router.post("/campaigns", status_code=status.HTTP_201_CREATED)
async def create_campaign(campaign_data: CampaignCreate, current_user: dict = Depends(verify_admin)):
    """Create a new campaign"""
    try:
        campaign_dict = campaign_data.dict()
        campaign_dict["clickCount"] = 0
        campaign_dict["impressionCount"] = 0
        campaign_dict["createdAt"] = datetime.utcnow()
        campaign_dict["updatedAt"] = datetime.utcnow()
        
        result = await db.campaigns.insert_one(campaign_dict)
        campaign_id = str(result.inserted_id)
        
        created_campaign = await db.campaigns.find_one({"_id": ObjectId(campaign_id)})
        created_campaign["id"] = str(created_campaign["_id"])
        del created_campaign["_id"]
        
        return created_campaign
    except Exception as e:
        log_error(e, "create_campaign")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create campaign"
        )

@router.put("/campaigns/{campaign_id}")
async def update_campaign(campaign_id: str, campaign_data: dict, current_user: dict = Depends(verify_admin)):
    """Update campaign"""
    try:
        if not ObjectId.is_valid(campaign_id):
            raise HTTPException(status_code=400, detail="Invalid campaign ID")
        
        campaign_data["updatedAt"] = datetime.utcnow()
        
        result = await db.campaigns.update_one(
            {"_id": ObjectId(campaign_id)},
            {"$set": campaign_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        updated_campaign = await db.campaigns.find_one({"_id": ObjectId(campaign_id)})
        updated_campaign["id"] = str(updated_campaign["_id"])
        del updated_campaign["_id"]
        
        return updated_campaign
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "update_campaign")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update campaign"
        )

@router.delete("/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str, current_user: dict = Depends(verify_admin)):
    """Delete campaign"""
    try:
        if not ObjectId.is_valid(campaign_id):
            raise HTTPException(status_code=400, detail="Invalid campaign ID")
        
        result = await db.campaigns.delete_one({"_id": ObjectId(campaign_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        return {"message": "Campaign deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "delete_campaign")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete campaign"
        )

@router.get("/campaigns/{campaign_id}/analytics")
async def get_campaign_analytics(campaign_id: str, current_user: dict = Depends(verify_admin)):
    """Get campaign performance analytics"""
    try:
        if not ObjectId.is_valid(campaign_id):
            raise HTTPException(status_code=400, detail="Invalid campaign ID")
        
        campaign = await db.campaigns.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Calculate CTR
        impressions = campaign.get("impressionCount", 0)
        clicks = campaign.get("clickCount", 0)
        ctr = (clicks / impressions * 100) if impressions > 0 else 0
        
        # Get orders with campaign coupon (if any)
        orders_count = 0
        revenue = 0
        if campaign.get("couponCode"):
            orders_count = await db.orders.count_documents({"couponCode": campaign["couponCode"]})
            revenue_pipeline = [
                {"$match": {"couponCode": campaign["couponCode"]}},
                {"$group": {"_id": None, "total": {"$sum": "$total"}}}
            ]
            revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(1)
            revenue = revenue_result[0]["total"] if revenue_result else 0
        
        return {
            "impressions": impressions,
            "clicks": clicks,
            "ctr": ctr,
            "orders": orders_count,
            "revenue": revenue
        }
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "get_campaign_analytics")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch campaign analytics"
        )

# ==================== API KEYS ====================

@router.get("/api-keys")
async def get_all_api_keys(current_user: dict = Depends(verify_admin)):
    """Get all API keys (without secrets)"""
    try:
        cursor = db.api_keys.find({}, {"secret": 0}).sort("createdAt", -1)
        api_keys = await cursor.to_list(length=100)
        
        for key in api_keys:
            key["id"] = str(key["_id"])
            del key["_id"]
            # Mask the key
            key["key"] = key["key"][:12] + "..." + key["key"][-4:]
        
        return api_keys
    except Exception as e:
        log_error(e, "get_all_api_keys")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch API keys"
        )

@router.post("/api-keys", status_code=status.HTTP_201_CREATED)
async def create_api_key(api_key_data: APIKeyCreate, current_user: dict = Depends(verify_admin)):
    """Create a new API key"""
    try:
        import secrets as sec
        
        api_key_dict = api_key_data.dict()
        api_key_dict["key"] = f"yny_live_{sec.token_urlsafe(32)}"
        api_key_dict["secret"] = f"yny_secret_{sec.token_urlsafe(48)}"
        api_key_dict["ownerId"] = current_user["user_id"]
        api_key_dict["usageCount"] = 0
        api_key_dict["isActive"] = True
        api_key_dict["createdAt"] = datetime.utcnow()
        api_key_dict["updatedAt"] = datetime.utcnow()
        
        result = await db.api_keys.insert_one(api_key_dict)
        api_key_id = str(result.inserted_id)
        
        created_key = await db.api_keys.find_one({"_id": ObjectId(api_key_id)})
        created_key["id"] = str(created_key["_id"])
        del created_key["_id"]
        
        # Return full key only on creation
        return {
            "message": "API key created successfully. Save these credentials - the secret will not be shown again.",
            "api_key": created_key
        }
    except Exception as e:
        log_error(e, "create_api_key")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create API key"
        )

@router.put("/api-keys/{key_id}")
async def update_api_key(key_id: str, key_data: dict, current_user: dict = Depends(verify_admin)):
    """Update API key settings"""
    try:
        if not ObjectId.is_valid(key_id):
            raise HTTPException(status_code=400, detail="Invalid key ID")
        
        # Prevent updating key/secret
        key_data.pop("key", None)
        key_data.pop("secret", None)
        key_data["updatedAt"] = datetime.utcnow()
        
        result = await db.api_keys.update_one(
            {"_id": ObjectId(key_id)},
            {"$set": key_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="API key not found")
        
        updated_key = await db.api_keys.find_one({"_id": ObjectId(key_id)}, {"secret": 0})
        updated_key["id"] = str(updated_key["_id"])
        del updated_key["_id"]
        
        return updated_key
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "update_api_key")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update API key"
        )

@router.delete("/api-keys/{key_id}")
async def delete_api_key(key_id: str, current_user: dict = Depends(verify_admin)):
    """Delete API key"""
    try:
        if not ObjectId.is_valid(key_id):
            raise HTTPException(status_code=400, detail="Invalid key ID")
        
        result = await db.api_keys.delete_one({"_id": ObjectId(key_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="API key not found")
        
        return {"message": "API key deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "delete_api_key")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete API key"
        )

@router.get("/api-keys/{key_id}/usage")
async def get_api_key_usage(key_id: str, current_user: dict = Depends(verify_admin)):
    """Get API key usage logs"""
    try:
        if not ObjectId.is_valid(key_id):
            raise HTTPException(status_code=400, detail="Invalid key ID")
        
        usage = await db.api_usage_logs.find({"apiKeyId": key_id}).sort("timestamp", -1).limit(100).to_list(100)
        
        for item in usage:
            item["id"] = str(item["_id"])
            del item["_id"]
        
        return usage
    except Exception as e:
        log_error(e, "get_api_key_usage")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch API key usage"
        )

# ==================== REVIEWS ====================

@router.get("/reviews")
async def get_all_reviews(
    restaurant_id: Optional[str] = None,
    min_rating: Optional[int] = None,
    current_user: dict = Depends(verify_admin)
):
    """Get all reviews"""
    try:
        query = {}
        if restaurant_id:
            query["restaurantId"] = restaurant_id
        if min_rating:
            query["rating"] = {"$gte": min_rating}
        
        cursor = db.reviews.find(query).sort("createdAt", -1)
        reviews = await cursor.to_list(length=200)
        
        for review in reviews:
            review["id"] = str(review["_id"])
            del review["_id"]
        
        return reviews
    except Exception as e:
        log_error(e, "get_all_reviews")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch reviews"
        )

@router.delete("/reviews/{review_id}")
async def delete_review(review_id: str, current_user: dict = Depends(verify_admin)):
    """Delete a review (admin moderation)"""
    try:
        if not ObjectId.is_valid(review_id):
            raise HTTPException(status_code=400, detail="Invalid review ID")
        
        # Get review to update restaurant rating
        review = await db.reviews.find_one({"_id": ObjectId(review_id)})
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        result = await db.reviews.delete_one({"_id": ObjectId(review_id)})
        
        # Update restaurant rating
        restaurant_id = review["restaurantId"]
        pipeline = [
            {"$match": {"restaurantId": restaurant_id}},
            {"$group": {"_id": None, "avg": {"$avg": "$rating"}, "count": {"$sum": 1}}}
        ]
        rating_result = await db.reviews.aggregate(pipeline).to_list(1)
        
        if rating_result:
            await db.restaurants.update_one(
                {"_id": ObjectId(restaurant_id)},
                {"$set": {
                    "rating": round(rating_result[0]["avg"], 1),
                    "reviewCount": rating_result[0]["count"]
                }}
            )
        else:
            await db.restaurants.update_one(
                {"_id": ObjectId(restaurant_id)},
                {"$set": {"rating": 0, "reviewCount": 0}}
            )
        
        return {"message": "Review deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "delete_review")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete review"
        )

# ==================== RESERVATIONS ====================

@router.get("/reservations")
async def get_all_reservations(
    status: Optional[str] = None,
    restaurant_id: Optional[str] = None,
    date: Optional[str] = None,
    current_user: dict = Depends(verify_admin)
):
    """Get all reservations"""
    try:
        query = {}
        if status:
            query["status"] = status
        if restaurant_id:
            query["restaurantId"] = restaurant_id
        if date:
            query["date"] = date
        
        cursor = db.reservations.find(query).sort("createdAt", -1)
        reservations = await cursor.to_list(length=200)
        
        for reservation in reservations:
            reservation["id"] = str(reservation["_id"])
            del reservation["_id"]
            # Get restaurant name
            try:
                restaurant = await db.restaurants.find_one({"_id": ObjectId(reservation["restaurantId"])})
                reservation["restaurantName"] = restaurant["name"] if restaurant else "Unknown"
            except:
                reservation["restaurantName"] = "Unknown"
        
        return reservations
    except Exception as e:
        log_error(e, "get_all_reservations")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch reservations"
        )

@router.put("/reservations/{reservation_id}/status")
async def update_reservation_status(reservation_id: str, status_data: dict, current_user: dict = Depends(verify_admin)):
    """Update reservation status"""
    try:
        if not ObjectId.is_valid(reservation_id):
            raise HTTPException(status_code=400, detail="Invalid reservation ID")
        
        new_status = status_data.get("status")
        valid_statuses = ["pending", "confirmed", "cancelled", "completed", "no_show"]
        
        if new_status not in valid_statuses:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        update_data = {
            "status": new_status,
            "updatedAt": datetime.utcnow()
        }
        
        if new_status == "confirmed":
            update_data["confirmedAt"] = datetime.utcnow()
        elif new_status == "cancelled":
            update_data["cancelledAt"] = datetime.utcnow()
            if status_data.get("reason"):
                update_data["cancellationReason"] = status_data["reason"]
        
        result = await db.reservations.update_one(
            {"_id": ObjectId(reservation_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        updated_reservation = await db.reservations.find_one({"_id": ObjectId(reservation_id)})
        updated_reservation["id"] = str(updated_reservation["_id"])
        del updated_reservation["_id"]
        
        return updated_reservation
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "update_reservation_status")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update reservation status"
        )

# ==================== NOTIFICATIONS ====================

@router.post("/notifications/send-bulk", status_code=status.HTTP_201_CREATED)
async def send_bulk_notification(notification_data: BulkNotification, current_user: dict = Depends(verify_admin)):
    """Send bulk notifications to users"""
    try:
        target = notification_data.targetAudience
        user_ids = notification_data.userIds or []
        
        if target == "all":
            users = await db.users.find({}, {"_id": 1}).to_list(10000)
            user_ids = [str(u["_id"]) for u in users]
        elif target == "new_users":
            week_ago = datetime.utcnow() - timedelta(days=7)
            users = await db.users.find({"createdAt": {"$gte": week_ago}}, {"_id": 1}).to_list(10000)
            user_ids = [str(u["_id"]) for u in users]
        elif target == "loyal_users":
            # Users with more than 5 orders
            pipeline = [
                {"$group": {"_id": "$userId", "count": {"$sum": 1}}},
                {"$match": {"count": {"$gte": 5}}}
            ]
            loyal = await db.orders.aggregate(pipeline).to_list(10000)
            user_ids = [u["_id"] for u in loyal]
        elif target == "inactive_users":
            # Users who haven't ordered in 30 days
            month_ago = datetime.utcnow() - timedelta(days=30)
            active_pipeline = [
                {"$match": {"createdAt": {"$gte": month_ago}}},
                {"$group": {"_id": "$userId"}}
            ]
            active = await db.orders.aggregate(active_pipeline).to_list(10000)
            active_ids = set([u["_id"] for u in active])
            all_users = await db.users.find({}, {"_id": 1}).to_list(10000)
            user_ids = [str(u["_id"]) for u in all_users if str(u["_id"]) not in active_ids]
        
        # Create notifications
        notifications = []
        for user_id in user_ids:
            notifications.append({
                "userId": user_id,
                "title": notification_data.title,
                "message": notification_data.message,
                "notificationType": notification_data.notificationType,
                "data": notification_data.data,
                "isRead": False,
                "createdAt": datetime.utcnow()
            })
        
        if notifications:
            await db.notifications.insert_many(notifications)
        
        return {
            "message": f"Notifications sent to {len(notifications)} users",
            "count": len(notifications)
        }
    except Exception as e:
        log_error(e, "send_bulk_notification")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send notifications"
        )

# ==================== SETTINGS ====================

@router.get("/settings")
async def get_app_settings(current_user: dict = Depends(verify_admin)):
    """Get application settings"""
    try:
        settings = await db.settings.find_one({"type": "app"})
        if not settings:
            # Default settings
            settings = {
                "type": "app",
                "siteName": "Yemek Nerede Yenir",
                "currency": "TRY",
                "currencySymbol": "₺",
                "defaultDeliveryFee": 10,
                "defaultServiceFee": 5,
                "minOrderAmount": 50,
                "maxDeliveryRadius": 10,
                "supportEmail": "destek@yemeknereyeyenir.com",
                "supportPhone": "+90 212 000 00 00"
            }
            await db.settings.insert_one(settings)
        
        if "_id" in settings:
            settings["id"] = str(settings["_id"])
            del settings["_id"]
        
        return settings
    except Exception as e:
        log_error(e, "get_app_settings")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch settings"
        )

@router.put("/settings")
async def update_app_settings(settings_data: dict, current_user: dict = Depends(verify_admin)):
    """Update application settings"""
    try:
        settings_data["updatedAt"] = datetime.utcnow()
        
        result = await db.settings.update_one(
            {"type": "app"},
            {"$set": settings_data},
            upsert=True
        )
        
        settings = await db.settings.find_one({"type": "app"})
        if "_id" in settings:
            settings["id"] = str(settings["_id"])
            del settings["_id"]
        
        return settings
    except Exception as e:
        log_error(e, "update_app_settings")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update settings"
        )
