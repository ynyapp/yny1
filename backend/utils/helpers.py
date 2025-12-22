from typing import Optional, List
from datetime import datetime

def paginate(items: list, page: int = 1, page_size: int = 20) -> dict:
    """Paginate a list of items"""
    start = (page - 1) * page_size
    end = start + page_size
    total = len(items)
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "items": items[start:end],
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages
    }

def format_date_tr(date: datetime) -> str:
    """Format date in Turkish format"""
    months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ]
    return f"{date.day} {months[date.month - 1]} {date.year}"

def calculate_delivery_time(restaurant_distance: float) -> str:
    """Calculate estimated delivery time based on distance"""
    # Simple calculation: 5 minutes per km + 15 minutes preparation
    base_time = 15
    travel_time = int(restaurant_distance * 5)
    min_time = base_time + travel_time
    max_time = min_time + 10
    
    return f"{min_time}-{max_time} dk"