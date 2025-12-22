from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional
from models.notification import NotificationCreate
from utils.security import get_current_user
from utils.logger import log_request, log_error
from bson import ObjectId
from datetime import datetime
from database import db

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/")
async def get_user_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get user's notifications"""
    try:
        query = {"userId": current_user["user_id"]}
        if unread_only:
            query["isRead"] = False
        
        cursor = db.notifications.find(query).sort("createdAt", -1).limit(limit)
        notifications = await cursor.to_list(length=limit)
        
        for notif in notifications:
            notif["id"] = str(notif["_id"])
            del notif["_id"]
        
        # Get unread count
        unread_count = await db.notifications.count_documents({
            "userId": current_user["user_id"],
            "isRead": False
        })
        
        return {
            "notifications": notifications,
            "unreadCount": unread_count
        }
    except Exception as e:
        log_error(e, "get_user_notifications")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bildirimler yüklenemedi"
        )

@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark a notification as read"""
    try:
        if not ObjectId.is_valid(notification_id):
            raise HTTPException(status_code=400, detail="Invalid notification ID")
        
        result = await db.notifications.update_one(
            {
                "_id": ObjectId(notification_id),
                "userId": current_user["user_id"]
            },
            {"$set": {"isRead": True, "readAt": datetime.utcnow()}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {"message": "Bildirim okundu olarak işaretlendi"}
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "mark_notification_read")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bildirim güncellenemedi"
        )

@router.put("/read-all")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read"""
    try:
        await db.notifications.update_many(
            {"userId": current_user["user_id"], "isRead": False},
            {"$set": {"isRead": True, "readAt": datetime.utcnow()}}
        )
        
        return {"message": "Tüm bildirimler okundu olarak işaretlendi"}
    except Exception as e:
        log_error(e, "mark_all_notifications_read")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bildirimler güncellenemedi"
        )

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a notification"""
    try:
        if not ObjectId.is_valid(notification_id):
            raise HTTPException(status_code=400, detail="Invalid notification ID")
        
        result = await db.notifications.delete_one({
            "_id": ObjectId(notification_id),
            "userId": current_user["user_id"]
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {"message": "Bildirim silindi"}
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "delete_notification")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bildirim silinemedi"
        )

@router.get("/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get count of unread notifications"""
    try:
        count = await db.notifications.count_documents({
            "userId": current_user["user_id"],
            "isRead": False
        })
        
        return {"unreadCount": count}
    except Exception as e:
        log_error(e, "get_unread_count")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bildirim sayısı alınamadı"
        )
