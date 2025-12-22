import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'food_delivery')

async def add_features_to_restaurants():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Feature templates
    features_by_type = {
        'Türk Mutfağı': {
            'amenities': ['wifi', 'otopark', 'klima', 'açık_hava'],
            'atmosphere': ['geleneksel', 'aile_dostu', 'rahat'],
            'specialFeatures': ['kahvaltı', 'brunch', 'canlı_müzik'],
            'deliveryRadius': 8.0
        },
        'Pizza': {
            'amenities': ['wifi', 'paket_servis', 'online_sipariş'],
            'atmosphere': ['rahat', 'hızlı_servis', 'genç'],
            'specialFeatures': ['gece_geç', 'hızlı_teslimat'],
            'deliveryRadius': 10.0
        },
        'Burger': {
            'amenities': ['wifi', 'çocuk_menüsü', 'drive_thru'],
            'atmosphere': ['rahat', 'hızlı_servis', 'aile_dostu'],
            'specialFeatures': ['gece_geç', 'fast_food'],
            'deliveryRadius': 12.0
        },
        'Balık': {
            'amenities': ['otopark', 'vale', 'açık_hava', 'bar'],
            'atmosphere': ['şık', 'romantik', 'lüks'],
            'specialFeatures': ['rezervasyon_önerili', 'canlı_müzik', 'boğaz_manzarası'],
            'deliveryRadius': 5.0
        },
        'İtalyan': {
            'amenities': ['wifi', 'bar', 'açık_hava'],
            'atmosphere': ['romantik', 'şık', 'rahat'],
            'specialFeatures': ['şarap_listesi', 'vejetaryen_seçenekler'],
            'deliveryRadius': 7.0
        },
        'Çin Mutfağı': {
            'amenities': ['wifi', 'paket_servis'],
            'atmosphere': ['rahat', 'aile_dostu'],
            'specialFeatures': ['hızlı_teslimat', 'vejetaryen_seçenekler'],
            'deliveryRadius': 9.0
        },
        'Kahvaltı': {
            'amenities': ['wifi', 'açık_hava', 'otopark'],
            'atmosphere': ['rahat', 'aile_dostu', 'neşeli'],
            'specialFeatures': ['sabah_kahvaltısı', 'brunch', 'serpme_kahvaltı'],
            'deliveryRadius': 6.0
        }
    }
    
    # Common features for all
    common_amenities = ['Kredi Kartı Kabul Edilir', 'Temassız Ödeme']
    
    restaurants = await db.restaurants.find({}).to_list(length=100)
    
    for restaurant in restaurants:
        cuisine = restaurant.get('cuisine', '').split(',')[0].strip()
        
        # Find matching features
        features = None
        for cuisine_type, cuisine_features in features_by_type.items():
            if cuisine_type.lower() in cuisine.lower():
                features = cuisine_features
                break
        
        # Default features if no match
        if not features:
            features = {
                'amenities': ['wifi'],
                'atmosphere': ['rahat'],
                'specialFeatures': [],
                'deliveryRadius': 7.0
            }
        
        # Update restaurant
        update_data = {
            'amenities': features['amenities'],
            'atmosphere': features['atmosphere'],
            'specialFeatures': features['specialFeatures'],
            'deliveryRadius': features['deliveryRadius'],
            'dietaryOptions': []
        }
        
        # Add vegetarian option for some
        if cuisine in ['İtalyan', 'Çin Mutfağı']:
            update_data['dietaryOptions'].append('vejetaryen')
        
        await db.restaurants.update_one(
            {'_id': restaurant['_id']},
            {'$set': update_data}
        )
        
        print(f"✅ Updated: {restaurant['name']} - {cuisine}")
    
    print(f"\n✅ Successfully updated {len(restaurants)} restaurants with features!")
    client.close()

if __name__ == "__main__":
    asyncio.run(add_features_to_restaurants())
