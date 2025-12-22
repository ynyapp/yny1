import logging
from datetime import datetime
import os

# Create logs directory if it doesn't exist
log_dir = "/var/log/app"
os.makedirs(log_dir, exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f"{log_dir}/app.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def log_request(endpoint: str, method: str, user_id: str = None):
    """Log API request"""
    logger.info(f"API Request: {method} {endpoint} | User: {user_id or 'anonymous'}")

def log_error(error: Exception, context: str = ""):
    """Log error with context"""
    logger.error(f"Error in {context}: {str(error)}", exc_info=True)

def log_security_event(event_type: str, details: dict):
    """Log security-related events"""
    logger.warning(f"Security Event: {event_type} | Details: {details}")