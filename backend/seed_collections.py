import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from bson import ObjectId
from datetime import datetime

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'food_delivery')

async def seed_collections():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Clear existing collections
    await db.collections.delete_many({})
    
    collections_data = [
        {
            "id": str(ObjectId()),
            "title": "Trend Olanlar",
            "description": "Şu an en popüler restoranlar",
            "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=200&fit=crop",
            "restaurantIds": [],
            "category": "trending",
            "isActive": True,
            "priority": 100,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": str(ObjectId()),
            "title": "Yeni Açılanlar",
            "description": "Yeni eklenen restoranlar",
            "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop",
            "restaurantIds": [],
            "category": "new",
            "isActive": True,
            "priority": 90,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": str(ObjectId()),
            "title": "En İyi Fırsatlar",
            "description": "İndirimli restoranlar",
            "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=200&fit=crop",
            "restaurantIds": [],
            "category": "deals",
            "isActive": True,
            "priority": 85,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": str(ObjectId()),
            "title": "En Yüksek Puanlılar",
            "description": "4.5+ puan alan restoranlar",
            "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop",
            "restaurantIds": [],
            "category": "top_rated",
            "isActive": True,
            "priority": 80,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": str(ObjectId()),
            "title": "Hızlı Teslimat",
            "description": "30 dakikada kapınızda",
            "image": "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400&h=200&fit=crop",
            "restaurantIds": [],
            "category": "fast_delivery",
            "isActive": True,
            "priority": 75,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": str(ObjectId()),
            "title": "Lüks Yemek Deneyimi",
            "description": "Premium restoranlar",
            "image": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=200&fit=crop",
            "restaurantIds": [],
            "category": "premium",
            "isActive": True,
            "priority": 70,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": str(ObjectId()),
            "title": "Vejetaryen & Vegan",
            "description": "Bitki bazlı lezzetler",
            "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=200&fit=crop",
            "restaurantIds": [],
            "category": "vegetarian",
            "isActive": True,
            "priority": 65,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": str(ObjectId()),
            "title": "Gece Lezzetleri",
            "description": "Gece geç saatlere kadar açık",
            "image": "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=200&fit=crop",
            "restaurantIds": [],
            "category": "nightlife",
            "isActive": True,
            "priority": 60,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    # Get some restaurant IDs to populate collections
    restaurants = await db.restaurants.find({}, {"_id": 0, "id": 1}).limit(20).to_list(length=20)
    restaurant_ids = [r["id"] for r in restaurants]
    
    # Distribute restaurants across collections
    for i, collection in enumerate(collections_data):
        # Assign 3-5 restaurants per collection
        start_idx = (i * 3) % len(restaurant_ids)
        end_idx = min(start_idx + 5, len(restaurant_ids))
        collection["restaurantIds"] = restaurant_ids[start_idx:end_idx]
    
    if collections_data:
        await db.collections.insert_many(collections_data)
        print(f"✅ Seeded {len(collections_data)} collections")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_collections())
