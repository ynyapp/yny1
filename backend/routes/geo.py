from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import httpx
import math
from database import db
from utils.logger import log_request, log_error
from bson import ObjectId

router = APIRouter(prefix="/geo", tags=["geolocation"])

# OpenStreetMap Nominatim API base URL
NOMINATIM_URL = "https://nominatim.openstreetmap.org"

# Haversine formula to calculate distance between two points
def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in kilometers"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

@router.get("/search")
async def search_location(q: str = Query(..., min_length=2), limit: int = Query(5, ge=1, le=10)):
    """Search for locations using OpenStreetMap Nominatim"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{NOMINATIM_URL}/search",
                params={
                    "q": q,
                    "format": "json",
                    "limit": limit,
                    "countrycodes": "tr",  # Turkey only
                    "addressdetails": 1
                },
                headers={"User-Agent": "YemekNeredeYenir/1.0"}
            )
            response.raise_for_status()
            results = response.json()
            
            locations = []
            for r in results:
                locations.append({
                    "displayName": r.get("display_name"),
                    "lat": float(r.get("lat")),
                    "lng": float(r.get("lon")),
                    "type": r.get("type"),
                    "address": r.get("address", {})
                })
            
            return locations
    except httpx.HTTPError as e:
        log_error(e, "search_location")
        raise HTTPException(status_code=502, detail="Failed to search location")
    except Exception as e:
        log_error(e, "search_location")
        raise HTTPException(status_code=500, detail="Failed to search location")

@router.get("/reverse")
async def reverse_geocode(lat: float, lng: float):
    """Get address from coordinates using OpenStreetMap"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{NOMINATIM_URL}/reverse",
                params={
                    "lat": lat,
                    "lon": lng,
                    "format": "json",
                    "addressdetails": 1
                },
                headers={"User-Agent": "YemekNeredeYenir/1.0"}
            )
            response.raise_for_status()
            result = response.json()
            
            if "error" in result:
                raise HTTPException(status_code=404, detail="Address not found")
            
            return {
                "displayName": result.get("display_name"),
                "lat": float(result.get("lat")),
                "lng": float(result.get("lon")),
                "address": result.get("address", {})
            }
    except HTTPException:
        raise
    except httpx.HTTPError as e:
        log_error(e, "reverse_geocode")
        raise HTTPException(status_code=502, detail="Failed to reverse geocode")
    except Exception as e:
        log_error(e, "reverse_geocode")
        raise HTTPException(status_code=500, detail="Failed to reverse geocode")

@router.get("/restaurants/nearby")
async def get_nearby_restaurants(
    lat: float,
    lng: float,
    radius: float = Query(5, ge=0.5, le=50, description="Radius in kilometers"),
    cuisine: Optional[str] = None,
    min_rating: Optional[float] = None,
    limit: int = Query(20, ge=1, le=100)
):
    """Get restaurants within a radius from a point"""
    try:
        # Get all restaurants
        query = {}
        if cuisine:
            query["cuisine"] = cuisine
        if min_rating:
            query["rating"] = {"$gte": min_rating}
        
        cursor = db.restaurants.find(query)
        all_restaurants = await cursor.to_list(length=500)
        
        # Filter by distance
        nearby = []
        for restaurant in all_restaurants:
            coords = restaurant.get("location", {}).get("coordinates", {})
            if coords and coords.get("lat") and coords.get("lng"):
                distance = haversine_distance(
                    lat, lng,
                    float(coords["lat"]), float(coords["lng"])
                )
                if distance <= radius:
                    restaurant["id"] = str(restaurant["_id"])
                    del restaurant["_id"]
                    restaurant["distance"] = round(distance, 2)
                    nearby.append(restaurant)
        
        # Sort by distance
        nearby.sort(key=lambda x: x["distance"])
        
        return nearby[:limit]
    except Exception as e:
        log_error(e, "get_nearby_restaurants")
        raise HTTPException(status_code=500, detail="Failed to fetch nearby restaurants")

@router.get("/route")
async def get_route(
    start_lat: float,
    start_lng: float,
    end_lat: float,
    end_lng: float,
    profile: str = Query("driving-car", description="driving-car, cycling-regular, foot-walking")
):
    """Get route between two points using OSRM (Open Source Routing Machine)"""
    try:
        # Using OSRM demo server for routing
        osrm_url = "https://router.project-osrm.org/route/v1"
        
        mode = "driving" if "driving" in profile else "walking" if "foot" in profile else "bike"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{osrm_url}/{mode}/{start_lng},{start_lat};{end_lng},{end_lat}",
                params={
                    "overview": "full",
                    "geometries": "geojson",
                    "steps": "true"
                }
            )
            response.raise_for_status()
            result = response.json()
            
            if result.get("code") != "Ok":
                raise HTTPException(status_code=404, detail="Route not found")
            
            route = result["routes"][0]
            
            return {
                "distance": route["distance"] / 1000,  # Convert to km
                "duration": route["duration"] / 60,  # Convert to minutes
                "geometry": route["geometry"],
                "steps": route.get("legs", [{}])[0].get("steps", [])
            }
    except HTTPException:
        raise
    except httpx.HTTPError as e:
        log_error(e, "get_route")
        raise HTTPException(status_code=502, detail="Failed to get route")
    except Exception as e:
        log_error(e, "get_route")
        raise HTTPException(status_code=500, detail="Failed to get route")

@router.get("/cities")
async def get_available_cities():
    """Get list of cities with restaurants"""
    try:
        pipeline = [
            {"$group": {"_id": "$location.city", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        cities = await db.restaurants.aggregate(pipeline).to_list(100)
        
        return [{"city": c["_id"], "restaurantCount": c["count"]} for c in cities if c["_id"]]
    except Exception as e:
        log_error(e, "get_available_cities")
        raise HTTPException(status_code=500, detail="Failed to fetch cities")

@router.get("/delivery-area/check")
async def check_delivery_area(
    restaurant_id: str,
    lat: float,
    lng: float
):
    """Check if a location is within restaurant's delivery area"""
    try:
        if not ObjectId.is_valid(restaurant_id):
            raise HTTPException(status_code=400, detail="Invalid restaurant ID")
        
        restaurant = await db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        coords = restaurant.get("location", {}).get("coordinates", {})
        if not coords or not coords.get("lat") or not coords.get("lng"):
            # If no coordinates, assume delivery is available
            return {
                "deliveryAvailable": True,
                "message": "Teslimat yapılabilir"
            }
        
        distance = haversine_distance(
            lat, lng,
            float(coords["lat"]), float(coords["lng"])
        )
        
        # Default max delivery radius is 10km
        max_radius = restaurant.get("maxDeliveryRadius", 10)
        
        if distance <= max_radius:
            # Calculate estimated delivery time based on distance
            base_time = 20  # Base preparation time
            travel_time = distance * 3  # ~3 min per km
            estimated_time = int(base_time + travel_time)
            
            return {
                "deliveryAvailable": True,
                "distance": round(distance, 2),
                "estimatedTime": f"{estimated_time}-{estimated_time + 10} dk",
                "message": "Teslimat yapılabilir"
            }
        else:
            return {
                "deliveryAvailable": False,
                "distance": round(distance, 2),
                "message": f"Bu adres teslimat alanı dışında. Maksimum teslimat mesafesi {max_radius} km."
            }
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "check_delivery_area")
        raise HTTPException(status_code=500, detail="Failed to check delivery area")
