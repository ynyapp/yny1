import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import random

load_dotenv()
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'food_delivery')

async def add_promotions_to_restaurants():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    restaurants = await db.restaurants.find({}).to_list(length=100)
    
    # Offer templates
    offer_templates = [
        "Flat 15% OFF",
        "Flat 20% OFF",
        "Buy 1 Get 1 Free",
        "Free Delivery",
        "30% OFF up to ₺50",
        "Flat ₺100 OFF",
        "50% OFF on selected items",
    ]
    
    promotion_texts = ["Promoted", "Ad", "Sponsored"]
    
    for i, restaurant in enumerate(restaurants):
        # Random promotion assignment (40% chance)
        is_promoted = random.random() < 0.4
        
        # Random gold partner (20% chance for high-rated)
        is_gold = restaurant.get('rating', 0) >= 4.5 and random.random() < 0.2
        
        # Random offers (50% chance)
        has_offer = random.random() < 0.5
        offers = []
        if has_offer:
            # 1-2 offers
            num_offers = random.randint(1, 2)
            offers = random.sample(offer_templates, num_offers)
        
        promotion_text = random.choice(promotion_texts) if is_promoted else None
        
        update_data = {
            'isPromoted': is_promoted,
            'promotionText': promotion_text,
            'offers': offers,
            'isGoldPartner': is_gold,
            'hasActiveOffer': len(offers) > 0
        }
        
        await db.restaurants.update_one(
            {'_id': restaurant['_id']},
            {'$set': update_data}
        )
        
        status = []
        if is_promoted:
            status.append(f"🔥 {promotion_text}")
        if is_gold:
            status.append("👑 Gold")
        if offers:
            status.append(f"💰 {len(offers)} offers")
        
        status_str = " | ".join(status) if status else "No promotions"
        print(f"✅ {restaurant['name']}: {status_str}")
    
    print(f"\n✅ Successfully updated {len(restaurants)} restaurants with promotions!")
    client.close()

if __name__ == "__main__":
    asyncio.run(add_promotions_to_restaurants())
