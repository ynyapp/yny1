from fastapi import FastAPI, APIRouter
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

# Import database
from database import db, client

# Import routes
from routes import auth, restaurants, menu, orders, reviews, user

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI(
    title="Yemek Nerede Yenir API",
    description="Food delivery platform API - Zomato Clone",
    version="1.0.0"
)

# Add GZip compression for performance
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check
@api_router.get("/")
async def root():
    return {
        "status": "healthy",
        "message": "Yemek Nerede Yenir API",
        "version": "1.0.0"
    }

@api_router.get("/health")
async def health_check():
    try:
        # Check database connection
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

# Include routers
api_router.include_router(auth.router)
api_router.include_router(restaurants.router)
api_router.include_router(menu.router)
api_router.include_router(orders.router)
api_router.include_router(reviews.router)
api_router.include_router(user.router)

# Include the main router in the app
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Startup event
@app.on_event("startup")
async def startup_db_client():
    logger.info("Starting up...")
    # Create indexes for performance
    try:
        await db.users.create_index("email", unique=True)
        await db.restaurants.create_index("slug", unique=True)
        await db.restaurants.create_index("location.city")
        await db.restaurants.create_index("cuisine")
        await db.restaurants.create_index("tags")
        await db.menu_items.create_index("restaurantId")
        await db.orders.create_index("userId")
        await db.orders.create_index("orderNumber", unique=True)
        await db.reviews.create_index("restaurantId")
        await db.reviews.create_index("userId")
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("Shutting down...")