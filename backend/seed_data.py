"""
Sample data seeder for Yemek Nerede Yenir
Run this script to populate the database with initial data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from utils.security import create_slug

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

restaurants_data = [
    {
        "name": "Kebapçı Halil",
        "slug": create_slug("Kebapçı Halil Kadıköy"),
        "cuisine": "Kebap",
        "rating": 4.5,
        "reviewCount": 250,
        "deliveryTime": "25-35 dk",
        "priceRange": "₺₺",
        "location": {
            "address": "Kadıköy Mah. Bahariye Cad. No:15",
            "city": "İstanbul"
        },
        "image": "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&q=80",
        "isOpen": True,
        "discount": "20% İndirim",
        "tags": ["Kebap", "Türk Mutfağı", "Et Yemekleri"],
        "minOrder": 50,
        "deliveryFee": 10
    },
    {
        "name": "Pizza House",
        "slug": create_slug("Pizza House Beşiktaş"),
        "cuisine": "Pizza",
        "rating": 4.3,
        "reviewCount": 180,
        "deliveryTime": "30-40 dk",
        "priceRange": "₺₺",
        "location": {
            "address": "Beşiktaş Mah. Barbaros Blv. No:45",
            "city": "İstanbul"
        },
        "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
        "isOpen": True,
        "discount": None,
        "tags": ["Pizza", "İtalyan", "Fast Food"],
        "minOrder": 40,
        "deliveryFee": 12
    },
    {
        "name": "Burger King",
        "slug": create_slug("Burger King Şişli"),
        "cuisine": "Burger",
        "rating": 4.2,
        "reviewCount": 520,
        "deliveryTime": "20-30 dk",
        "priceRange": "₺",
        "location": {
            "address": "Şişli Mah. Halaskargazi Cad. No:120",
            "city": "İstanbul"
        },
        "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
        "isOpen": True,
        "discount": "30% İndirim",
        "tags": ["Burger", "Fast Food", "Amerikan"],
        "minOrder": 35,
        "deliveryFee": 8
    },
    {
        "name": "Balık Evi",
        "slug": create_slug("Balık Evi Bebek"),
        "cuisine": "Balık",
        "rating": 4.7,
        "reviewCount": 95,
        "deliveryTime": "35-45 dk",
        "priceRange": "₺₺₺",
        "location": {
            "address": "Bebek Mah. Cevdetpaşa Cad. No:78",
            "city": "İstanbul"
        },
        "image": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
        "isOpen": True,
        "discount": None,
        "tags": ["Balık", "Deniz Ürünleri", "Akdeniz"],
        "minOrder": 100,
        "deliveryFee": 15
    },
    {
        "name": "Çin Lokantası",
        "slug": create_slug("Çin Lokantası Beyoğlu"),
        "cuisine": "Çin Mutfağı",
        "rating": 4.4,
        "reviewCount": 310,
        "deliveryTime": "25-35 dk",
        "priceRange": "₺₺",
        "location": {
            "address": "Beyoğlu Mah. İstiklal Cad. No:234",
            "city": "İstanbul"
        },
        "image": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80",
        "isOpen": False,
        "discount": None,
        "tags": ["Çin Mutfağı", "Asya", "Noodle"],
        "minOrder": 45,
        "deliveryFee": 10
    },
    {
        "name": "Pasta e Basta",
        "slug": create_slug("Pasta e Basta Nişantaşı"),
        "cuisine": "İtalyan",
        "rating": 4.6,
        "reviewCount": 140,
        "deliveryTime": "30-40 dk",
        "priceRange": "₺₺₺",
        "location": {
            "address": "Nişantaşı Mah. Teşvikiye Cad. No:56",
            "city": "İstanbul"
        },
        "image": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
        "isOpen": True,
        "discount": "15% İndirim",
        "tags": ["İtalyan", "Pasta", "Pizza"],
        "minOrder": 60,
        "deliveryFee": 12
    },
    {
        "name": "Kahvaltı Dünyası",
        "slug": create_slug("Kahvaltı Dünyası Moda"),
        "cuisine": "Kahvaltı",
        "rating": 4.8,
        "reviewCount": 420,
        "deliveryTime": "20-30 dk",
        "priceRange": "₺₺",
        "location": {
            "address": "Moda Mah. Bahariye Cad. No:89",
            "city": "İstanbul"
        },
        "image": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80",
        "isOpen": True,
        "discount": None,
        "tags": ["Kahvaltı", "Türk Mutfağı", "Sağlıklı"],
        "minOrder": 40,
        "deliveryFee": 10
    },
    {
        "name": "Tatlı Dünyası",
        "slug": create_slug("Tatlı Dünyası Etiler"),
        "cuisine": "Tatlı",
        "rating": 4.5,
        "reviewCount": 280,
        "deliveryTime": "15-25 dk",
        "priceRange": "₺",
        "location": {
            "address": "Etiler Mah. Nispetiye Cad. No:12",
            "city": "İstanbul"
        },
        "image": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80",
        "isOpen": True,
        "discount": "10% İndirim",
        "tags": ["Tatlı", "Dessert", "Baklava"],
        "minOrder": 30,
        "deliveryFee": 8
    }
]

async def seed_data():
    print("🌱 Starting data seeding...")
    
    try:
        # Clear existing data
        print("🗑️  Clearing existing data...")
        await db.restaurants.delete_many({})
        await db.menu_items.delete_many({})
        
        # Insert restaurants
        print("🍽️  Inserting restaurants...")
        result = await db.restaurants.insert_many(restaurants_data)
        restaurant_ids = result.inserted_ids
        print(f"✅ Inserted {len(restaurant_ids)} restaurants")
        
        # Get inserted restaurants with their IDs
        restaurants = await db.restaurants.find().to_list(length=1000)
        
        # Insert menu items for first 3 restaurants
        print("📋 Inserting menu items...")
        menu_count = 0
        
        # Kebapçı Halil menu
        if len(restaurants) > 0:
            kebapci_id = str(restaurants[0]["_id"])
            kebapci_menu = [
                {
                    "restaurantId": kebapci_id,
                    "name": "Adana Kebap",
                    "description": "Közde pişmiş acılı kıyma kebap",
                    "price": 85,
                    "image": "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80",
                    "category": "Ana Yemek",
                    "isAvailable": True
                },
                {
                    "restaurantId": kebapci_id,
                    "name": "Urfa Kebap",
                    "description": "Közde pişmiş acısız kıyma kebap",
                    "price": 85,
                    "image": "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&q=80",
                    "category": "Ana Yemek",
                    "isAvailable": True
                },
                {
                    "restaurantId": kebapci_id,
                    "name": "Karışık Izgara",
                    "description": "Tavuk, köfte ve kebap karışımı",
                    "price": 95,
                    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80",
                    "category": "Ana Yemek",
                    "isAvailable": True
                },
                {
                    "restaurantId": kebapci_id,
                    "name": "Ayran",
                    "description": "Taze ayran",
                    "price": 10,
                    "image": "https://images.unsplash.com/photo-1623309766947-fec9e67e5cf2?w=400&q=80",
                    "category": "İçecek",
                    "isAvailable": True
                }
            ]
            await db.menu_items.insert_many(kebapci_menu)
            menu_count += len(kebapci_menu)
        
        # Pizza House menu
        if len(restaurants) > 1:
            pizza_id = str(restaurants[1]["_id"])
            pizza_menu = [
                {
                    "restaurantId": pizza_id,
                    "name": "Margherita Pizza",
                    "description": "Domates sosu, mozzarella, fesleğen",
                    "price": 65,
                    "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80",
                    "category": "Pizza",
                    "isAvailable": True
                },
                {
                    "restaurantId": pizza_id,
                    "name": "Pepperoni Pizza",
                    "description": "Domates sosu, mozzarella, pepperoni",
                    "price": 75,
                    "image": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80",
                    "category": "Pizza",
                    "isAvailable": True
                },
                {
                    "restaurantId": pizza_id,
                    "name": "Karışık Pizza",
                    "description": "Sucuk, sosis, mantar, mısır, biber",
                    "price": 80,
                    "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80",
                    "category": "Pizza",
                    "isAvailable": True
                },
                {
                    "restaurantId": pizza_id,
                    "name": "Coca Cola",
                    "description": "330ml kutu",
                    "price": 15,
                    "image": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80",
                    "category": "İçecek",
                    "isAvailable": True
                }
            ]
            await db.menu_items.insert_many(pizza_menu)
            menu_count += len(pizza_menu)
        
        # Burger King menu
        if len(restaurants) > 2:
            burger_id = str(restaurants[2]["_id"])
            burger_menu = [
                {
                    "restaurantId": burger_id,
                    "name": "Whopper Menü",
                    "description": "Whopper, patates, içecek",
                    "price": 70,
                    "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
                    "category": "Menü",
                    "isAvailable": True
                },
                {
                    "restaurantId": burger_id,
                    "name": "Chicken Royal",
                    "description": "Tavuklu burger menü",
                    "price": 65,
                    "image": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80",
                    "category": "Menü",
                    "isAvailable": True
                },
                {
                    "restaurantId": burger_id,
                    "name": "King Nuggets",
                    "description": "9 parça nugget",
                    "price": 45,
                    "image": "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80",
                    "category": "Atıştırmalık",
                    "isAvailable": True
                }
            ]
            await db.menu_items.insert_many(burger_menu)
            menu_count += len(burger_menu)
        
        print(f"✅ Inserted {menu_count} menu items")
        
        print("\n✨ Data seeding completed successfully!")
        print(f"📊 Summary:")
        print(f"   - Restaurants: {len(restaurant_ids)}")
        print(f"   - Menu Items: {menu_count}")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
