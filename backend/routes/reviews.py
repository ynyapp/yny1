from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models.review import Review, ReviewCreate, ReviewResponse
from utils.security import get_current_user
from utils.logger import log_request, log_error
from bson import ObjectId

router = APIRouter(prefix="/reviews", tags=["reviews"])

from server import db

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(review_data: ReviewCreate, current_user: dict = Depends(get_current_user)):
    """Create a new review"""
    try:
        log_request("/api/reviews", "POST", current_user["user_id"])
        
        # Get user info
        user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
        
        # Create review
        review = Review(
            userId=current_user["user_id"],
            userName=user["name"],
            userAvatar=f"https://i.pravatar.cc/150?u={current_user['user_id']}",
            restaurantId=review_data.restaurantId,
            rating=review_data.rating,
            comment=review_data.comment
        )
        
        result = await db.reviews.insert_one(review.dict(by_alias=True))
        review_id = str(result.inserted_id)
        
        # Update restaurant rating
        await update_restaurant_rating(review_data.restaurantId)
        
        # Get created review
        created_review = await db.reviews.find_one({"_id": ObjectId(review_id)})
        created_review["id"] = str(created_review["_id"])
        del created_review["_id"]
        
        return created_review
    
    except Exception as e:
        log_error(e, "create_review")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create review"
        )

@router.get("/{restaurant_id}", response_model=List[ReviewResponse])
async def get_reviews(restaurant_id: str):
    """Get reviews for a restaurant"""
    try:
        log_request(f"/api/reviews/{restaurant_id}", "GET")
        
        # Get reviews
        cursor = db.reviews.find({"restaurantId": restaurant_id}).sort("createdAt", -1)
        reviews = await cursor.to_list(length=1000)
        
        # Convert ObjectId to string
        for review in reviews:
            review["id"] = str(review["_id"])
            del review["_id"]
        
        return reviews
    
    except Exception as e:
        log_error(e, "get_reviews")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch reviews"
        )

async def update_restaurant_rating(restaurant_id: str):
    """Update restaurant rating based on reviews"""
    try:
        # Get all reviews for restaurant
        cursor = db.reviews.find({"restaurantId": restaurant_id})
        reviews = await cursor.to_list(length=10000)
        
        if reviews:
            # Calculate average rating
            total_rating = sum(review["rating"] for review in reviews)
            avg_rating = round(total_rating / len(reviews), 1)
            
            # Update restaurant
            await db.restaurants.update_one(
                {"_id": ObjectId(restaurant_id)},
                {"$set": {"rating": avg_rating, "reviewCount": len(reviews)}}
            )
    except Exception as e:
        log_error(e, "update_restaurant_rating")