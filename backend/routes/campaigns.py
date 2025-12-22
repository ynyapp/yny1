from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional, List
from utils.logger import log_request, log_error
from bson import ObjectId
from datetime import datetime
from database import db

router = APIRouter(prefix="/campaigns", tags=["campaigns"])

@router.get("/active")
async def get_active_campaigns(
    campaign_type: Optional[str] = None,
    city: Optional[str] = None,
    limit: int = Query(10, ge=1, le=50)
):
    """Get currently active campaigns for public display"""
    try:
        now = datetime.utcnow()
        
        query = {
            "isActive": True,
            "startDate": {"$lte": now},
            "endDate": {"$gte": now}
        }
        
        if campaign_type:
            query["campaignType"] = campaign_type
        
        cursor = db.campaigns.find(query).sort("priority", -1).limit(limit)
        campaigns = await cursor.to_list(length=limit)
        
        result = []
        for campaign in campaigns:
            # Filter by city if specified
            if city and campaign.get("applicableCities"):
                if city not in campaign["applicableCities"]:
                    continue
            
            # Increment impression count
            await db.campaigns.update_one(
                {"_id": campaign["_id"]},
                {"$inc": {"impressionCount": 1}}
            )
            
            campaign["id"] = str(campaign["_id"])
            del campaign["_id"]
            result.append(campaign)
        
        return result
    except Exception as e:
        log_error(e, "get_active_campaigns")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Kampanyalar yüklenemedi"
        )

@router.get("/homepage")
async def get_homepage_campaigns():
    """Get campaigns to show on homepage"""
    try:
        now = datetime.utcnow()
        
        cursor = db.campaigns.find({
            "isActive": True,
            "showOnHomepage": True,
            "startDate": {"$lte": now},
            "endDate": {"$gte": now}
        }).sort("priority", -1).limit(5)
        
        campaigns = await cursor.to_list(length=5)
        
        for campaign in campaigns:
            await db.campaigns.update_one(
                {"_id": campaign["_id"]},
                {"$inc": {"impressionCount": 1}}
            )
            campaign["id"] = str(campaign["_id"])
            del campaign["_id"]
        
        return campaigns
    except Exception as e:
        log_error(e, "get_homepage_campaigns")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Kampanyalar yüklenemedi"
        )

@router.post("/{campaign_id}/click")
async def record_campaign_click(campaign_id: str):
    """Record a click on a campaign"""
    try:
        if not ObjectId.is_valid(campaign_id):
            raise HTTPException(status_code=400, detail="Invalid campaign ID")
        
        result = await db.campaigns.update_one(
            {"_id": ObjectId(campaign_id)},
            {"$inc": {"clickCount": 1}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        return {"message": "Click recorded"}
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "record_campaign_click")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record click"
        )

@router.get("/{campaign_id}")
async def get_campaign_details(campaign_id: str):
    """Get campaign details"""
    try:
        if not ObjectId.is_valid(campaign_id):
            raise HTTPException(status_code=400, detail="Invalid campaign ID")
        
        campaign = await db.campaigns.find_one({"_id": ObjectId(campaign_id)})
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        campaign["id"] = str(campaign["_id"])
        del campaign["_id"]
        
        return campaign
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "get_campaign_details")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch campaign"
        )
