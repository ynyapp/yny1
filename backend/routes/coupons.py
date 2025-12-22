from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional
from models.coupon import CouponUsage
from utils.security import get_current_user
from utils.logger import log_request, log_error
from bson import ObjectId
from datetime import datetime
from database import db

router = APIRouter(prefix="/coupons", tags=["coupons"])

@router.get("/validate/{code}")
async def validate_coupon(
    code: str,
    restaurant_id: Optional[str] = None,
    order_amount: Optional[float] = None,
    current_user: dict = Depends(get_current_user)
):
    """Validate a coupon code"""
    try:
        log_request(f"/api/coupons/validate/{code}", "GET", current_user["user_id"])
        
        coupon = await db.coupons.find_one({"code": code.upper()})
        
        if not coupon:
            raise HTTPException(status_code=404, detail="Kupon bulunamadı")
        
        now = datetime.utcnow()
        
        # Check if active
        if not coupon.get("isActive", True):
            raise HTTPException(status_code=400, detail="Bu kupon aktif değil")
        
        # Check validity period
        if coupon.get("validFrom") and coupon["validFrom"] > now:
            raise HTTPException(status_code=400, detail="Bu kupon henüz geçerli değil")
        
        if coupon.get("validUntil") and coupon["validUntil"] < now:
            raise HTTPException(status_code=400, detail="Bu kuponun süresi dolmuş")
        
        # Check usage limit
        if coupon.get("usageLimit") and coupon.get("usedCount", 0) >= coupon["usageLimit"]:
            raise HTTPException(status_code=400, detail="Bu kuponun kullanım limiti dolmuş")
        
        # Check user limit
        user_usage = await db.coupon_usage.count_documents({
            "couponId": str(coupon["_id"]),
            "userId": current_user["user_id"]
        })
        if user_usage >= coupon.get("userLimit", 1):
            raise HTTPException(status_code=400, detail="Bu kuponu zaten kullandınız")
        
        # Check minimum order amount
        if order_amount and coupon.get("minOrderAmount", 0) > order_amount:
            raise HTTPException(
                status_code=400, 
                detail=f"Minimum sipariş tutarı {coupon['minOrderAmount']}₺ olmalıdır"
            )
        
        # Check applicable restaurants
        if coupon.get("applicableRestaurants") and restaurant_id:
            if restaurant_id not in coupon["applicableRestaurants"]:
                raise HTTPException(status_code=400, detail="Bu kupon bu restoran için geçerli değil")
        
        # Calculate discount
        discount = 0
        if order_amount:
            if coupon["discountType"] == "percentage":
                discount = order_amount * (coupon["discountValue"] / 100)
                if coupon.get("maxDiscountAmount"):
                    discount = min(discount, coupon["maxDiscountAmount"])
            else:
                discount = coupon["discountValue"]
        
        coupon["id"] = str(coupon["_id"])
        del coupon["_id"]
        
        return {
            "valid": True,
            "coupon": coupon,
            "discount": round(discount, 2),
            "message": f"Kupon geçerli! {round(discount, 2)}₺ indirim uygulanacak."
        }
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "validate_coupon")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Kupon doğrulanamadı"
        )

@router.post("/apply")
async def apply_coupon(
    coupon_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Apply a coupon to an order (records usage)"""
    try:
        code = coupon_data.get("code")
        order_id = coupon_data.get("orderId")
        discount_applied = coupon_data.get("discountApplied", 0)
        
        if not code or not order_id:
            raise HTTPException(status_code=400, detail="Kupon kodu ve sipariş ID gerekli")
        
        coupon = await db.coupons.find_one({"code": code.upper()})
        if not coupon:
            raise HTTPException(status_code=404, detail="Kupon bulunamadı")
        
        # Record usage
        usage = {
            "couponId": str(coupon["_id"]),
            "userId": current_user["user_id"],
            "orderId": order_id,
            "discountApplied": discount_applied,
            "usedAt": datetime.utcnow()
        }
        await db.coupon_usage.insert_one(usage)
        
        # Increment used count
        await db.coupons.update_one(
            {"_id": coupon["_id"]},
            {"$inc": {"usedCount": 1}}
        )
        
        return {"message": "Kupon başarıyla uygulandı", "discount": discount_applied}
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "apply_coupon")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Kupon uygulanamadı"
        )

@router.get("/my-coupons")
async def get_user_coupons(current_user: dict = Depends(get_current_user)):
    """Get coupons available for the user"""
    try:
        now = datetime.utcnow()
        
        # Get all active coupons
        cursor = db.coupons.find({
            "isActive": True,
            "validFrom": {"$lte": now},
            "validUntil": {"$gte": now}
        })
        all_coupons = await cursor.to_list(length=50)
        
        available_coupons = []
        for coupon in all_coupons:
            # Check if user can still use this coupon
            user_usage = await db.coupon_usage.count_documents({
                "couponId": str(coupon["_id"]),
                "userId": current_user["user_id"]
            })
            
            if user_usage < coupon.get("userLimit", 1):
                coupon["id"] = str(coupon["_id"])
                del coupon["_id"]
                coupon["remainingUses"] = coupon.get("userLimit", 1) - user_usage
                available_coupons.append(coupon)
        
        return available_coupons
    except Exception as e:
        log_error(e, "get_user_coupons")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Kuponlar yüklenemedi"
        )
