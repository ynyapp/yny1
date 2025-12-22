#!/usr/bin/env python3
"""
Comprehensive Backend API Test Suite for Yemek Nerede Yenir (Food Delivery Platform)
Tests all backend endpoints systematically
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Backend URL from frontend .env
BASE_URL = "https://food-order-31.preview.emergentagent.com/api"

class APITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_data = {
            "name": "Ahmet Yılmaz",
            "email": "ahmet.yilmaz@test.com",
            "phone": "+905551234567",
            "password": "test123456"
        }
        self.results = []
        
    def log_result(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data
        })
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return (success, response, status_code)"""
        url = f"{self.base_url}{endpoint}"
        
        # Add auth header if token exists
        if self.auth_token and headers is None:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
        elif self.auth_token and headers:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=30)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=headers, timeout=30)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers, timeout=30)
            else:
                return False, f"Unsupported method: {method}", 0
                
            return True, response, response.status_code
            
        except requests.exceptions.RequestException as e:
            return False, f"Request failed: {str(e)}", 0
    
    def test_health_endpoints(self):
        """Test health check and basic endpoints"""
        print("=== Testing Health & Basic Endpoints ===")
        
        # Test root endpoint
        success, response, status_code = self.make_request("GET", "/")
        if success and status_code == 200:
            try:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_result("GET /api/ - Root endpoint", True, f"Status: {data.get('status')}")
                else:
                    self.log_result("GET /api/ - Root endpoint", False, f"Unexpected response: {data}")
            except:
                self.log_result("GET /api/ - Root endpoint", False, "Invalid JSON response")
        else:
            self.log_result("GET /api/ - Root endpoint", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        
        # Test health endpoint
        success, response, status_code = self.make_request("GET", "/health")
        if success and status_code == 200:
            try:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_result("GET /api/health - Health check", True, f"Database: {data.get('database', 'unknown')}")
                else:
                    self.log_result("GET /api/health - Health check", False, f"Unhealthy status: {data}")
            except:
                self.log_result("GET /api/health - Health check", False, "Invalid JSON response")
        else:
            self.log_result("GET /api/health - Health check", False, f"Status: {status_code}, Response: {response if not success else response.text}")
    
    def test_authentication_flow(self):
        """Test complete authentication flow"""
        print("=== Testing Authentication Flow ===")
        
        # Test user registration
        success, response, status_code = self.make_request("POST", "/auth/register", self.test_user_data)
        if success and status_code == 201:
            try:
                data = response.json()
                if "access_token" in data:
                    self.auth_token = data["access_token"]
                    self.log_result("POST /api/auth/register - Register user", True, "User registered successfully")
                else:
                    self.log_result("POST /api/auth/register - Register user", False, f"No access token in response: {data}")
            except:
                self.log_result("POST /api/auth/register - Register user", False, "Invalid JSON response")
        elif success and status_code == 400:
            # User might already exist, try login instead
            self.log_result("POST /api/auth/register - Register user", True, "User already exists (expected)")
        else:
            self.log_result("POST /api/auth/register - Register user", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        
        # Test user login
        login_data = {
            "email": self.test_user_data["email"],
            "password": self.test_user_data["password"]
        }
        success, response, status_code = self.make_request("POST", "/auth/login", login_data)
        if success and status_code == 200:
            try:
                data = response.json()
                if "access_token" in data:
                    self.auth_token = data["access_token"]
                    self.log_result("POST /api/auth/login - Login user", True, "Login successful")
                else:
                    self.log_result("POST /api/auth/login - Login user", False, f"No access token in response: {data}")
            except:
                self.log_result("POST /api/auth/login - Login user", False, "Invalid JSON response")
        else:
            self.log_result("POST /api/auth/login - Login user", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        
        # Test get current user (requires auth)
        if self.auth_token:
            success, response, status_code = self.make_request("GET", "/auth/me")
            if success and status_code == 200:
                try:
                    data = response.json()
                    if "email" in data and data["email"] == self.test_user_data["email"]:
                        self.log_result("GET /api/auth/me - Get current user", True, f"User: {data.get('name')}")
                    else:
                        self.log_result("GET /api/auth/me - Get current user", False, f"Unexpected user data: {data}")
                except:
                    self.log_result("GET /api/auth/me - Get current user", False, "Invalid JSON response")
            else:
                self.log_result("GET /api/auth/me - Get current user", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        else:
            self.log_result("GET /api/auth/me - Get current user", False, "No auth token available")
    
    def test_restaurants_api(self):
        """Test restaurants API endpoints"""
        print("=== Testing Restaurants API ===")
        
        # Test get all restaurants
        success, response, status_code = self.make_request("GET", "/restaurants")
        restaurants_data = None
        if success and status_code == 200:
            try:
                data = response.json()
                if isinstance(data, dict) and "items" in data:
                    restaurants_data = data["items"]
                    self.log_result("GET /api/restaurants - Get all restaurants", True, f"Found {len(restaurants_data)} restaurants")
                else:
                    self.log_result("GET /api/restaurants - Get all restaurants", False, f"Unexpected response format: {data}")
            except:
                self.log_result("GET /api/restaurants - Get all restaurants", False, "Invalid JSON response")
        else:
            self.log_result("GET /api/restaurants - Get all restaurants", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        
        # Test filter by city
        success, response, status_code = self.make_request("GET", "/restaurants?city=İstanbul")
        if success and status_code == 200:
            try:
                data = response.json()
                if isinstance(data, dict) and "items" in data:
                    self.log_result("GET /api/restaurants?city=İstanbul - Filter by city", True, f"Found {len(data['items'])} restaurants in İstanbul")
                else:
                    self.log_result("GET /api/restaurants?city=İstanbul - Filter by city", False, f"Unexpected response format: {data}")
            except:
                self.log_result("GET /api/restaurants?city=İstanbul - Filter by city", False, "Invalid JSON response")
        else:
            self.log_result("GET /api/restaurants?city=İstanbul - Filter by city", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        
        # Test filter by cuisine
        success, response, status_code = self.make_request("GET", "/restaurants?cuisine=Kebap")
        if success and status_code == 200:
            try:
                data = response.json()
                if isinstance(data, dict) and "items" in data:
                    self.log_result("GET /api/restaurants?cuisine=Kebap - Filter by cuisine", True, f"Found {len(data['items'])} Kebap restaurants")
                else:
                    self.log_result("GET /api/restaurants?cuisine=Kebap - Filter by cuisine", False, f"Unexpected response format: {data}")
            except:
                self.log_result("GET /api/restaurants?cuisine=Kebap - Filter by cuisine", False, "Invalid JSON response")
        else:
            self.log_result("GET /api/restaurants?cuisine=Kebap - Filter by cuisine", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        
        # Test get restaurant by slug
        success, response, status_code = self.make_request("GET", "/restaurants/kebapci-halil-kadikoy")
        if success and status_code == 200:
            try:
                data = response.json()
                if "id" in data and "name" in data:
                    self.log_result("GET /api/restaurants/kebapci-halil-kadikoy - Get by slug", True, f"Restaurant: {data.get('name')}")
                    return data.get("id")  # Return restaurant ID for menu testing
                else:
                    self.log_result("GET /api/restaurants/kebapci-halil-kadikoy - Get by slug", False, f"Unexpected response format: {data}")
            except:
                self.log_result("GET /api/restaurants/kebapci-halil-kadikoy - Get by slug", False, "Invalid JSON response")
        elif success and status_code == 404:
            self.log_result("GET /api/restaurants/kebapci-halil-kadikoy - Get by slug", False, "Restaurant not found - may need sample data")
            # Try to get first restaurant from the list if available
            if restaurants_data and len(restaurants_data) > 0:
                return restaurants_data[0].get("id")
        else:
            self.log_result("GET /api/restaurants/kebapci-halil-kadikoy - Get by slug", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        
        return None
    
    def test_menu_api(self, restaurant_id: Optional[str] = None):
        """Test menu API endpoints"""
        print("=== Testing Menu API ===")
        
        if not restaurant_id:
            # Try to get first restaurant
            success, response, status_code = self.make_request("GET", "/restaurants")
            if success and status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, dict) and "items" in data and len(data["items"]) > 0:
                        restaurant_id = data["items"][0].get("id")
                except:
                    pass
        
        if restaurant_id:
            success, response, status_code = self.make_request("GET", f"/menu/{restaurant_id}")
            if success and status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        self.log_result(f"GET /api/menu/{restaurant_id} - Get menu", True, f"Found {len(data)} menu items")
                        return data
                    else:
                        self.log_result(f"GET /api/menu/{restaurant_id} - Get menu", False, f"Unexpected response format: {data}")
                except:
                    self.log_result(f"GET /api/menu/{restaurant_id} - Get menu", False, "Invalid JSON response")
            else:
                self.log_result(f"GET /api/menu/{restaurant_id} - Get menu", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        else:
            self.log_result("GET /api/menu/{restaurant_id} - Get menu", False, "No restaurant ID available")
        
        return []
    
    def test_orders_api(self, restaurant_id: Optional[str] = None, menu_items: list = None):
        """Test orders API endpoints (requires authentication)"""
        print("=== Testing Orders API ===")
        
        if not self.auth_token:
            self.log_result("Orders API tests", False, "No authentication token available")
            return
        
        # Prepare test order data
        if not restaurant_id:
            # Try to get first restaurant
            success, response, status_code = self.make_request("GET", "/restaurants")
            if success and status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, dict) and "items" in data and len(data["items"]) > 0:
                        restaurant_id = data["items"][0].get("id")
                except:
                    pass
        
        if not menu_items and restaurant_id:
            menu_items = self.test_menu_api(restaurant_id)
        
        if restaurant_id and menu_items and len(menu_items) > 0:
            # Create test order
            order_data = {
                "restaurantId": restaurant_id,
                "items": [
                    {
                        "menuItemId": menu_items[0].get("id", "test-item-1"),
                        "name": menu_items[0].get("name", "Test Item"),
                        "price": menu_items[0].get("price", 25.50),
                        "quantity": 2
                    }
                ],
                "deliveryAddress": {
                    "title": "Ev",
                    "address": "Kadıköy, İstanbul",
                    "coordinates": {"lat": 40.9903, "lng": 29.0253}
                },
                "paymentMethod": "credit_card",
                "subtotal": 51.00,
                "deliveryFee": 5.00,
                "serviceFee": 2.50,
                "total": 58.50
            }
            
            success, response, status_code = self.make_request("POST", "/orders", order_data)
            if success and status_code == 201:
                try:
                    data = response.json()
                    if "id" in data and "orderNumber" in data:
                        self.log_result("POST /api/orders - Create order", True, f"Order created: {data.get('orderNumber')}")
                    else:
                        self.log_result("POST /api/orders - Create order", False, f"Unexpected response format: {data}")
                except:
                    self.log_result("POST /api/orders - Create order", False, "Invalid JSON response")
            else:
                self.log_result("POST /api/orders - Create order", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        else:
            self.log_result("POST /api/orders - Create order", False, "No restaurant or menu items available")
        
        # Test get user orders
        success, response, status_code = self.make_request("GET", "/orders")
        if success and status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("GET /api/orders - Get user orders", True, f"Found {len(data)} orders")
                else:
                    self.log_result("GET /api/orders - Get user orders", False, f"Unexpected response format: {data}")
            except:
                self.log_result("GET /api/orders - Get user orders", False, "Invalid JSON response")
        else:
            self.log_result("GET /api/orders - Get user orders", False, f"Status: {status_code}, Response: {response if not success else response.text}")
    
    def test_user_profile_api(self):
        """Test user profile API endpoints (requires authentication)"""
        print("=== Testing User Profile API ===")
        
        if not self.auth_token:
            self.log_result("User Profile API tests", False, "No authentication token available")
            return
        
        # Test get profile
        success, response, status_code = self.make_request("GET", "/user/profile")
        if success and status_code == 200:
            try:
                data = response.json()
                if "id" in data and "email" in data:
                    self.log_result("GET /api/user/profile - Get profile", True, f"User: {data.get('name')}")
                else:
                    self.log_result("GET /api/user/profile - Get profile", False, f"Unexpected response format: {data}")
            except:
                self.log_result("GET /api/user/profile - Get profile", False, "Invalid JSON response")
        else:
            self.log_result("GET /api/user/profile - Get profile", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        
        # Test update profile
        update_data = {
            "name": "Ahmet Yılmaz Updated",
            "phone": "+905559876543"
        }
        success, response, status_code = self.make_request("PUT", "/user/profile", update_data)
        if success and status_code == 200:
            try:
                data = response.json()
                if "id" in data and data.get("name") == update_data["name"]:
                    self.log_result("PUT /api/user/profile - Update profile", True, f"Profile updated: {data.get('name')}")
                else:
                    self.log_result("PUT /api/user/profile - Update profile", False, f"Update not reflected: {data}")
            except:
                self.log_result("PUT /api/user/profile - Update profile", False, "Invalid JSON response")
        else:
            self.log_result("PUT /api/user/profile - Update profile", False, f"Status: {status_code}, Response: {response if not success else response.text}")
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Yemek Nerede Yenir Backend API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Run test suites
        self.test_health_endpoints()
        self.test_authentication_flow()
        restaurant_id = self.test_restaurants_api()
        menu_items = self.test_menu_api(restaurant_id)
        self.test_orders_api(restaurant_id, menu_items)
        self.test_user_profile_api()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        failed = total - passed
        
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed/total*100):.1f}%")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.results:
                if not result["success"]:
                    print(f"   ❌ {result['test']}: {result['details']}")
        
        return passed, failed, self.results

def main():
    """Main test runner"""
    tester = APITester()
    passed, failed, results = tester.run_all_tests()
    
    # Exit with error code if tests failed
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()