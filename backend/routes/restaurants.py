from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List
from models.restaurant import Restaurant, RestaurantResponse
from utils.helpers import paginate
from utils.logger import log_request, log_error
from bson import ObjectId

router = APIRouter(prefix="/restaurants", tags=["restaurants"])

from database import db

@router.get("", response_model=dict)
async def get_restaurants(
    city: Optional[str] = Query(None, description="Filter by city"),
    cuisine: Optional[str] = Query(None, description="Filter by cuisine"),
    search: Optional[str] = Query(None, description="Search query"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating"),
    lat: Optional[float] = Query(None, description="User latitude for nearby search"),
    lng: Optional[float] = Query(None, description="User longitude for nearby search"),
    max_distance: Optional[float] = Query(None, ge=0, le=50, description="Max distance in km"),
    feature: Optional[str] = Query(None, description="Filter by feature tag"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """Get list of restaurants with filters"""
    try:
        log_request("/api/restaurants", "GET")
        
        # Build query
        query = {}
        
        if city:
            query["location.city"] = {"$regex": city, "$options": "i"}
        
        if cuisine:
            query["cuisine"] = {"$regex": cuisine, "$options": "i"}
        
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"cuisine": {"$regex": search, "$options": "i"}},
                {"tags": {"$regex": search, "$options": "i"}}
            ]
        
        if min_rating:
            query["rating"] = {"$gte": min_rating}
        
        # Feature filter (tags)
        if feature:
            query["$or"] = [
                {"tags": {"$regex": feature, "$options": "i"}},
                {"amenities": {"$regex": feature, "$options": "i"}},
                {"specialFeatures": {"$regex": feature, "$options": "i"}},
                {"atmosphere": {"$regex": feature, "$options": "i"}},
                {"dietaryOptions": {"$regex": feature, "$options": "i"}}
            ]
        
        # Get restaurants
        cursor = db.restaurants.find(query)
        restaurants = await cursor.to_list(length=1000)
        
        # Convert ObjectId to string and remove _id
        for restaurant in restaurants:
            restaurant["id"] = str(restaurant["_id"])
            del restaurant["_id"]
            
            # Calculate distance if lat/lng provided
            if lat is not None and lng is not None and restaurant.get("location", {}).get("coordinates"):
                coords = restaurant["location"]["coordinates"]
                if coords.get("lat") and coords.get("lng"):
                    # Haversine formula for distance calculation
                    from math import radians, cos, sin, asin, sqrt
                    
                    lon1, lat1, lon2, lat2 = map(radians, [lng, lat, coords["lng"], coords["lat"]])
                    dlon = lon2 - lon1
                    dlat = lat2 - lat1
                    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
                    c = 2 * asin(sqrt(a))
                    km = 6371 * c
                    
                    restaurant["distance"] = round(km, 2)
                    
                    # Check if within delivery radius
                    delivery_radius = restaurant.get("deliveryRadius", 5.0)
                    restaurant["canDeliver"] = km <= delivery_radius
        
        # Filter by max_distance if provided
        if max_distance is not None and lat is not None and lng is not None:
            restaurants = [r for r in restaurants if r.get("distance", float('inf')) <= max_distance]
        
        # Sort by distance if location provided, otherwise by rating
        if lat is not None and lng is not None:
            restaurants.sort(key=lambda x: x.get("distance", float('inf')))
        else:
            restaurants.sort(key=lambda x: x.get("rating", 0), reverse=True)
            del restaurant["_id"]
        
        # Paginate results
        result = paginate(restaurants, page, page_size)
        
        return result
    
    except Exception as e:
        log_error(e, "get_restaurants")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch restaurants"
        )

@router.get("/{slug}", response_model=RestaurantResponse)
async def get_restaurant_by_slug(slug: str):
    """Get restaurant by SEO-friendly slug"""
    try:
        log_request(f"/api/restaurants/{slug}", "GET")
        
        restaurant = await db.restaurants.find_one({"slug": slug})
        
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant not found"
            )
        
        restaurant["id"] = str(restaurant["_id"])
        del restaurant["_id"]
        
        return restaurant
    
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "get_restaurant_by_slug")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch restaurant"
        )

@router.get("/id/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant_by_id(restaurant_id: str):
    """Get restaurant by ID"""
    try:
        log_request(f"/api/restaurants/id/{restaurant_id}", "GET")
        
        # Try to find by 'id' field first (string), then by '_id' (ObjectId)
        restaurant = await db.restaurants.find_one({"id": restaurant_id})
        
        if not restaurant and ObjectId.is_valid(restaurant_id):
            restaurant = await db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
        
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant not found"
            )
        
        restaurant["id"] = str(restaurant["_id"])
        del restaurant["_id"]
        
        return restaurant
    
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "get_restaurant_by_id")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch restaurant"
        )