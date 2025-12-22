from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models.order import Order, OrderCreate, OrderResponse
from utils.security import get_current_user
from utils.logger import log_request, log_error
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/orders", tags=["orders"])

from server import db

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user)):
    """Create a new order"""
    try:
        log_request("/api/orders", "POST", current_user["user_id"])
        
        # Create order
        order = Order(
            userId=current_user["user_id"],
            restaurantId=order_data.restaurantId,
            items=order_data.items,
            deliveryAddress=order_data.deliveryAddress,
            paymentMethod=order_data.paymentMethod,
            subtotal=order_data.subtotal,
            deliveryFee=order_data.deliveryFee,
            serviceFee=order_data.serviceFee,
            total=order_data.total,
            status="confirmed"
        )
        
        result = await db.orders.insert_one(order.dict(by_alias=True))
        order_id = str(result.inserted_id)
        
        # Get created order
        created_order = await db.orders.find_one({"_id": ObjectId(order_id)})
        created_order["id"] = str(created_order["_id"])
        del created_order["_id"]
        
        return created_order
    
    except Exception as e:
        log_error(e, "create_order")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order"
        )

@router.get("", response_model=List[OrderResponse])
async def get_orders(current_user: dict = Depends(get_current_user)):
    """Get user's orders"""
    try:
        log_request("/api/orders", "GET", current_user["user_id"])
        
        # Get orders
        cursor = db.orders.find({"userId": current_user["user_id"]}).sort("createdAt", -1)
        orders = await cursor.to_list(length=1000)
        
        # Convert ObjectId to string
        for order in orders:
            order["id"] = str(order["_id"])
            del order["_id"]
        
        return orders
    
    except Exception as e:
        log_error(e, "get_orders")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch orders"
        )

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Get order details"""
    try:
        log_request(f"/api/orders/{order_id}", "GET", current_user["user_id"])
        
        if not ObjectId.is_valid(order_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid order ID"
            )
        
        order = await db.orders.find_one({
            "_id": ObjectId(order_id),
            "userId": current_user["user_id"]
        })
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        order["id"] = str(order["_id"])
        del order["_id"]
        
        return order
    
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "get_order")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch order"
        )