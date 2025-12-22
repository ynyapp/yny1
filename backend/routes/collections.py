from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.collection import Collection, CollectionCreate, CollectionResponse
import os
from bson import ObjectId

router = APIRouter(prefix="/collections", tags=["collections"])

def get_db():
    from server import db
    return db

@router.get("/", response_model=List[CollectionResponse])
async def get_collections(
    category: Optional[str] = None,
    is_active: bool = True,
    limit: int = Query(default=20, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all collections"""
    query = {"isActive": is_active}
    if category:
        query["category"] = category
    
    collections = await db.collections.find(query, {"_id": 0}).sort("priority", -1).limit(limit).to_list(length=limit)
    
    # Add restaurant count for each collection
    for collection in collections:
        collection["restaurantCount"] = len(collection.get("restaurantIds", []))
    
    return collections

@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection(collection_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get collection by ID"""
    collection = await db.collections.find_one({"id": collection_id}, {"_id": 0})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    collection["restaurantCount"] = len(collection.get("restaurantIds", []))
    return collection

@router.get("/{collection_id}/restaurants")
async def get_collection_restaurants(
    collection_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get restaurants in a collection"""
    collection = await db.collections.find_one({"id": collection_id}, {"_id": 0})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    restaurant_ids = collection.get("restaurantIds", [])
    if not restaurant_ids:
        return []
    
    restaurants = await db.restaurants.find(
        {"id": {"$in": restaurant_ids}},
        {"_id": 0}
    ).to_list(length=len(restaurant_ids))
    
    return restaurants

@router.post("/", response_model=CollectionResponse)
async def create_collection(
    collection: CollectionCreate,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new collection (Admin only)"""
    collection_dict = collection.dict()
    collection_dict["id"] = str(ObjectId())
    collection_dict["createdAt"] = datetime.utcnow()
    collection_dict["updatedAt"] = datetime.utcnow()
    
    await db.collections.insert_one(collection_dict)
    
    result = await db.collections.find_one({"id": collection_dict["id"]}, {"_id": 0})
    result["restaurantCount"] = len(result.get("restaurantIds", []))
    return result

@router.put("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: str,
    collection: CollectionCreate,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update a collection (Admin only)"""
    existing = await db.collections.find_one({"id": collection_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    update_dict = collection.dict()
    update_dict["updatedAt"] = datetime.utcnow()
    
    await db.collections.update_one(
        {"id": collection_id},
        {"$set": update_dict}
    )
    
    result = await db.collections.find_one({"id": collection_id}, {"_id": 0})
    result["restaurantCount"] = len(result.get("restaurantIds", []))
    return result

@router.delete("/{collection_id}")
async def delete_collection(collection_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Delete a collection (Admin only)"""
    result = await db.collections.delete_one({"id": collection_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Collection not found")
    return {"message": "Collection deleted successfully"}
