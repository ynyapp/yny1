from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional, List
from models.reservation import ReservationCreate, Reservation
from utils.security import get_current_user
from utils.logger import log_request, log_error
from bson import ObjectId
from datetime import datetime, timedelta
from database import db
import random
import string

router = APIRouter(prefix="/reservations", tags=["reservations"])

def generate_reservation_code():
    return 'RES-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_reservation(
    reservation_data: ReservationCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new reservation"""
    try:
        log_request("/api/reservations", "POST", current_user["user_id"])
        
        # Get restaurant
        if not ObjectId.is_valid(reservation_data.restaurantId):
            raise HTTPException(status_code=400, detail="Invalid restaurant ID")
        
        restaurant = await db.restaurants.find_one({"_id": ObjectId(reservation_data.restaurantId)})
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        # Get user info
        user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check availability (basic check - can be expanded)
        existing = await db.reservations.count_documents({
            "restaurantId": reservation_data.restaurantId,
            "date": reservation_data.date,
            "time": reservation_data.time,
            "status": {"$in": ["pending", "confirmed"]}
        })
        
        # Max 5 reservations per time slot (simplified)
        if existing >= 5:
            raise HTTPException(
                status_code=400, 
                detail="Bu saat için rezervasyon dolu. Lütfen başka bir saat seçin."
            )
        
        reservation_dict = reservation_data.dict()
        reservation_dict["userId"] = current_user["user_id"]
        reservation_dict["userName"] = user.get("name", "")
        reservation_dict["userPhone"] = user.get("phone", "")
        reservation_dict["userEmail"] = user.get("email", "")
        reservation_dict["reservationCode"] = generate_reservation_code()
        reservation_dict["status"] = "pending"
        reservation_dict["createdAt"] = datetime.utcnow()
        reservation_dict["updatedAt"] = datetime.utcnow()
        
        result = await db.reservations.insert_one(reservation_dict)
        reservation_id = str(result.inserted_id)
        
        created = await db.reservations.find_one({"_id": ObjectId(reservation_id)})
        created["id"] = str(created["_id"])
        del created["_id"]
        created["restaurantName"] = restaurant["name"]
        
        return created
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "create_reservation")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Rezervasyon oluşturulamadı"
        )

@router.get("/my-reservations")
async def get_user_reservations(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user's reservations"""
    try:
        query = {"userId": current_user["user_id"]}
        if status:
            query["status"] = status
        
        cursor = db.reservations.find(query).sort("createdAt", -1)
        reservations = await cursor.to_list(length=50)
        
        for res in reservations:
            res["id"] = str(res["_id"])
            del res["_id"]
            # Get restaurant name
            try:
                restaurant = await db.restaurants.find_one({"_id": ObjectId(res["restaurantId"])})
                res["restaurantName"] = restaurant["name"] if restaurant else "Unknown"
                res["restaurantImage"] = restaurant.get("image", "") if restaurant else ""
            except:
                res["restaurantName"] = "Unknown"
        
        return reservations
    except Exception as e:
        log_error(e, "get_user_reservations")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Rezervasyonlar yüklenemedi"
        )

@router.get("/{reservation_id}")
async def get_reservation_details(
    reservation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get reservation details"""
    try:
        if not ObjectId.is_valid(reservation_id):
            raise HTTPException(status_code=400, detail="Invalid reservation ID")
        
        reservation = await db.reservations.find_one({
            "_id": ObjectId(reservation_id),
            "userId": current_user["user_id"]
        })
        
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        reservation["id"] = str(reservation["_id"])
        del reservation["_id"]
        
        # Get restaurant info
        try:
            restaurant = await db.restaurants.find_one({"_id": ObjectId(reservation["restaurantId"])})
            if restaurant:
                reservation["restaurant"] = {
                    "id": str(restaurant["_id"]),
                    "name": restaurant["name"],
                    "image": restaurant.get("image", ""),
                    "address": restaurant.get("location", {}).get("address", ""),
                    "phone": restaurant.get("phone", "")
                }
        except:
            pass
        
        return reservation
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "get_reservation_details")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Rezervasyon detayları yüklenemedi"
        )

@router.put("/{reservation_id}/cancel")
async def cancel_reservation(
    reservation_id: str,
    reason_data: Optional[dict] = None,
    current_user: dict = Depends(get_current_user)
):
    """Cancel a reservation"""
    try:
        if not ObjectId.is_valid(reservation_id):
            raise HTTPException(status_code=400, detail="Invalid reservation ID")
        
        reservation = await db.reservations.find_one({
            "_id": ObjectId(reservation_id),
            "userId": current_user["user_id"]
        })
        
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        if reservation["status"] in ["cancelled", "completed"]:
            raise HTTPException(status_code=400, detail="Bu rezervasyon iptal edilemez")
        
        update_data = {
            "status": "cancelled",
            "cancelledAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        if reason_data and reason_data.get("reason"):
            update_data["cancellationReason"] = reason_data["reason"]
        
        await db.reservations.update_one(
            {"_id": ObjectId(reservation_id)},
            {"$set": update_data}
        )
        
        return {"message": "Rezervasyon iptal edildi"}
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "cancel_reservation")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Rezervasyon iptal edilemedi"
        )

@router.get("/restaurant/{restaurant_id}/availability")
async def get_restaurant_availability(
    restaurant_id: str,
    date: str = Query(..., description="Date in YYYY-MM-DD format")
):
    """Get available time slots for a restaurant on a specific date"""
    try:
        if not ObjectId.is_valid(restaurant_id):
            raise HTTPException(status_code=400, detail="Invalid restaurant ID")
        
        restaurant = await db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        # Define time slots (11:00 to 22:00, every 30 minutes)
        time_slots = []
        for hour in range(11, 23):
            for minute in ["00", "30"]:
                time_slots.append(f"{hour:02d}:{minute}")
        
        # Get existing reservations for this date
        reservations = await db.reservations.find({
            "restaurantId": restaurant_id,
            "date": date,
            "status": {"$in": ["pending", "confirmed"]}
        }).to_list(100)
        
        # Count reservations per time slot
        slot_counts = {}
        for res in reservations:
            time = res.get("time")
            slot_counts[time] = slot_counts.get(time, 0) + 1
        
        # Max capacity per slot (can be customized per restaurant)
        max_per_slot = restaurant.get("maxReservationsPerSlot", 5)
        
        availability = []
        for slot in time_slots:
            current = slot_counts.get(slot, 0)
            availability.append({
                "time": slot,
                "available": max_per_slot - current,
                "isAvailable": current < max_per_slot
            })
        
        return {
            "restaurantId": restaurant_id,
            "date": date,
            "timeSlots": availability
        }
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "get_restaurant_availability")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Uygunluk bilgisi yüklenemedi"
        )
