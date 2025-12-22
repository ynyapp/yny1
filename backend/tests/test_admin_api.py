#!/usr/bin/env python3
"""
Admin Backend API Test Suite for Yemek Nerede Yenir (Food Delivery Platform)
Tests all new admin endpoints and geolocation features
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Backend URL from frontend .env
BASE_URL = "https://localfood-tr.preview.emergentagent.com/api"

class AdminAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.auth_token = None
        self.admin_user_data = {
            "email": "test@test.com",
            "password": "test123"
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
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None, params: Dict = None) -> tuple:
        """Make HTTP request and return (success, response, status_code)"""
        url = f"{self.base_url}{endpoint}"
        
        # Add auth header if token exists
        if self.auth_token and headers is None:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
        elif self.auth_token and headers:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, params=params, timeout=30)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, params=params, timeout=30)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=headers, params=params, timeout=30)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers, params=params, timeout=30)
            else:
                return False, f"Unsupported method: {method}", 0
                
            return True, response, response.status_code
            
        except requests.exceptions.RequestException as e:
            return False, f"Request failed: {str(e)}", 0
    
    def authenticate_admin(self):
        """Authenticate as admin user"""
        print("=== Authenticating Admin User ===")
        
        success, response, status_code = self.make_request("POST", "/auth/login", self.admin_user_data)
        if success and status_code == 200:
            try:
                data = response.json()
                if "access_token" in data:
                    self.auth_token = data["access_token"]
                    self.log_result("Admin Authentication", True, f"Logged in as: {data.get('user', {}).get('email', 'admin')}")
                    return True
                else:
                    self.log_result("Admin Authentication", False, f"No access token in response: {data}")
                    return False
            except:
                self.log_result("Admin Authentication", False, "Invalid JSON response")
                return False
        else:
            self.log_result("Admin Authentication", False, f"Status: {status_code}, Response: {response if not success else response.text}")
            return False
    
    def test_admin_dashboard_analytics(self):
        """Test admin dashboard analytics endpoint"""
        print("=== Testing Admin Dashboard Analytics ===")
        
        if not self.auth_token:
            self.log_result("Admin Dashboard Analytics", False, "No authentication token available")
            return
        
        success, response, status_code = self.make_request("GET", "/admin/analytics/dashboard")
        if success and status_code == 200:
            try:
                data = response.json()
                
                # Check required fields
                required_fields = ["summary", "today", "recent_orders", "orders_by_status", "top_restaurants"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    summary = data.get("summary", {})
                    today = data.get("today", {})
                    
                    details = f"Total restaurants: {summary.get('total_restaurants', 0)}, "
                    details += f"Total orders: {summary.get('total_orders', 0)}, "
                    details += f"Total users: {summary.get('total_users', 0)}, "
                    details += f"Today's orders: {today.get('orders', 0)}"
                    
                    self.log_result("GET /api/admin/analytics/dashboard", True, details)
                else:
                    self.log_result("GET /api/admin/analytics/dashboard", False, f"Missing fields: {missing_fields}")
            except Exception as e:
                self.log_result("GET /api/admin/analytics/dashboard", False, f"JSON parsing error: {str(e)}")
        else:
            self.log_result("GET /api/admin/analytics/dashboard", False, f"Status: {status_code}, Response: {response if not success else response.text}")
    
    def test_geolocation_api(self):
        """Test geolocation API endpoints"""
        print("=== Testing Geolocation API ===")
        
        # Test location search
        success, response, status_code = self.make_request("GET", "/geo/search", params={"q": "istanbul"})
        if success and status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    location = data[0]
                    if "displayName" in location and "lat" in location and "lng" in location:
                        self.log_result("GET /api/geo/search?q=istanbul", True, f"Found {len(data)} locations, first: {location.get('displayName', 'Unknown')}")
                    else:
                        self.log_result("GET /api/geo/search?q=istanbul", False, f"Invalid location format: {location}")
                else:
                    self.log_result("GET /api/geo/search?q=istanbul", False, f"No locations found or invalid response: {data}")
            except Exception as e:
                self.log_result("GET /api/geo/search?q=istanbul", False, f"JSON parsing error: {str(e)}")
        else:
            self.log_result("GET /api/geo/search?q=istanbul", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        
        # Test cities endpoint
        success, response, status_code = self.make_request("GET", "/geo/cities")
        if success and status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("GET /api/geo/cities", True, f"Found {len(data)} cities with restaurants")
                else:
                    self.log_result("GET /api/geo/cities", False, f"Invalid response format: {data}")
            except Exception as e:
                self.log_result("GET /api/geo/cities", False, f"JSON parsing error: {str(e)}")
        else:
            self.log_result("GET /api/geo/cities", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        
        # Test nearby restaurants
        params = {"lat": 41.0082, "lng": 28.9784, "radius": 10}  # Istanbul coordinates
        success, response, status_code = self.make_request("GET", "/geo/restaurants/nearby", params=params)
        if success and status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("GET /api/geo/restaurants/nearby", True, f"Found {len(data)} nearby restaurants")
                else:
                    self.log_result("GET /api/geo/restaurants/nearby", False, f"Invalid response format: {data}")
            except Exception as e:
                self.log_result("GET /api/geo/restaurants/nearby", False, f"JSON parsing error: {str(e)}")
        else:
            self.log_result("GET /api/geo/restaurants/nearby", False, f"Status: {status_code}, Response: {response if not success else response.text}")
    
    def test_admin_coupons(self):
        """Test admin coupons CRUD operations"""
        print("=== Testing Admin Coupons API ===")
        
        if not self.auth_token:
            self.log_result("Admin Coupons API", False, "No authentication token available")
            return
        
        created_coupon_id = None
        
        # Test GET all coupons
        success, response, status_code = self.make_request("GET", "/admin/coupons")
        if success and status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("GET /api/admin/coupons", True, f"Retrieved {len(data)} coupons")
                else:
                    self.log_result("GET /api/admin/coupons", False, f"Invalid response format: {data}")
            except Exception as e:
                self.log_result("GET /api/admin/coupons", False, f"JSON parsing error: {str(e)}")
        else:
            self.log_result("GET /api/admin/coupons", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        
        # Test POST create coupon
        coupon_data = {
            "code": "TEST2024",
            "name": "Test Coupon 2024",
            "description": "Test coupon for API testing",
            "discountType": "percentage",
            "discountValue": 15,
            "maxDiscountAmount": 50,
            "minOrderAmount": 100,
            "usageLimit": 100,
            "userLimit": 1,
            "validFrom": "2024-01-01T00:00:00Z",
            "validUntil": "2024-12-31T23:59:59Z",
            "isActive": True
        }
        
        success, response, status_code = self.make_request("POST", "/admin/coupons", coupon_data)
        if success and status_code == 201:
            try:
                data = response.json()
                if "id" in data and "code" in data:
                    created_coupon_id = data["id"]
                    self.log_result("POST /api/admin/coupons", True, f"Created coupon: {data.get('code')}")
                else:
                    self.log_result("POST /api/admin/coupons", False, f"Invalid response format: {data}")
            except Exception as e:
                self.log_result("POST /api/admin/coupons", False, f"JSON parsing error: {str(e)}")
        else:
            self.log_result("POST /api/admin/coupons", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        
        # Test PUT update coupon
        if created_coupon_id:
            update_data = {
                "description": "Updated test coupon description",
                "discountValue": 20
            }
            
            success, response, status_code = self.make_request("PUT", f"/admin/coupons/{created_coupon_id}", update_data)
            if success and status_code == 200:
                try:
                    data = response.json()
                    if "id" in data and data.get("discountValue") == 20:
                        self.log_result("PUT /api/admin/coupons/{id}", True, f"Updated coupon discount to {data.get('discountValue')}%")
                    else:
                        self.log_result("PUT /api/admin/coupons/{id}", False, f"Update not reflected: {data}")
                except Exception as e:
                    self.log_result("PUT /api/admin/coupons/{id}", False, f"JSON parsing error: {str(e)}")
            else:
                self.log_result("PUT /api/admin/coupons/{id}", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        
        # Test DELETE coupon
        if created_coupon_id:
            success, response, status_code = self.make_request("DELETE", f"/admin/coupons/{created_coupon_id}")
            if success and status_code == 200:
                try:
                    data = response.json()
                    if "message" in data:
                        self.log_result("DELETE /api/admin/coupons/{id}", True, "Coupon deleted successfully")
                    else:
                        self.log_result("DELETE /api/admin/coupons/{id}", False, f"Unexpected response: {data}")
                except Exception as e:
                    self.log_result("DELETE /api/admin/coupons/{id}", False, f"JSON parsing error: {str(e)}")
            else:
                self.log_result("DELETE /api/admin/coupons/{id}", False, f"Status: {status_code}, Response: {response if not success else response.text}")
    
    def test_admin_campaigns(self):
        """Test admin campaigns CRUD operations"""
        print("=== Testing Admin Campaigns API ===")
        
        if not self.auth_token:
            self.log_result("Admin Campaigns API", False, "No authentication token available")
            return
        
        created_campaign_id = None
        
        # Test GET all campaigns
        success, response, status_code = self.make_request("GET", "/admin/campaigns")
        if success and status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("GET /api/admin/campaigns", True, f"Retrieved {len(data)} campaigns")
                else:
                    self.log_result("GET /api/admin/campaigns", False, f"Invalid response format: {data}")
            except Exception as e:
                self.log_result("GET /api/admin/campaigns", False, f"JSON parsing error: {str(e)}")
        else:
            self.log_result("GET /api/admin/campaigns", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        
        # Test POST create campaign
        campaign_data = {
            "name": "test-campaign-2024",
            "title": "Test Campaign 2024",
            "description": "Test campaign for API testing",
            "image": "https://example.com/test-campaign.jpg",
            "campaignType": "banner",
            "targetAudience": "all",
            "couponCode": "TESTCAMP2024",
            "startDate": "2024-01-01T00:00:00Z",
            "endDate": "2024-12-31T23:59:59Z",
            "isActive": True,
            "showOnHomepage": True,
            "priority": 5,
            "applicableCities": ["İstanbul", "Ankara"]
        }
        
        success, response, status_code = self.make_request("POST", "/admin/campaigns", campaign_data)
        if success and status_code == 201:
            try:
                data = response.json()
                if "id" in data and "title" in data:
                    created_campaign_id = data["id"]
                    self.log_result("POST /api/admin/campaigns", True, f"Created campaign: {data.get('title')}")
                else:
                    self.log_result("POST /api/admin/campaigns", False, f"Invalid response format: {data}")
            except Exception as e:
                self.log_result("POST /api/admin/campaigns", False, f"JSON parsing error: {str(e)}")
        else:
            self.log_result("POST /api/admin/campaigns", False, f"Status: {status_code}, Response: {response if not success else response.text}")
        
        # Clean up - delete created campaign
        if created_campaign_id:
            success, response, status_code = self.make_request("DELETE", f"/admin/campaigns/{created_campaign_id}")
            if success and status_code == 200:
                self.log_result("DELETE /api/admin/campaigns/{id} (cleanup)", True, "Campaign deleted successfully")
    
    def test_public_campaigns(self):
        """Test public campaigns endpoint"""
        print("=== Testing Public Campaigns API ===")
        
        success, response, status_code = self.make_request("GET", "/campaigns/active")
        if success and status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("GET /api/campaigns/active", True, f"Retrieved {len(data)} active campaigns")
                else:
                    self.log_result("GET /api/campaigns/active", False, f"Invalid response format: {data}")
            except Exception as e:
                self.log_result("GET /api/campaigns/active", False, f"JSON parsing error: {str(e)}")
        else:
            self.log_result("GET /api/campaigns/active", False, f"Status: {status_code}, Response: {response if not success else response.text}")
    
    def run_all_tests(self):
        """Run all admin API test suites"""
        print("🚀 Starting Admin Backend API Tests for Yemek Nerede Yenir")
        print(f"Testing against: {self.base_url}")
        print("=" * 70)
        
        # Authenticate first
        if not self.authenticate_admin():
            print("❌ Authentication failed. Cannot proceed with admin tests.")
            return 0, len(self.results), self.results
        
        # Run test suites
        self.test_admin_dashboard_analytics()
        self.test_geolocation_api()
        self.test_admin_coupons()
        self.test_admin_campaigns()
        self.test_public_campaigns()
        
        # Summary
        print("=" * 70)
        print("📊 ADMIN API TEST SUMMARY")
        print("=" * 70)
        
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
    tester = AdminAPITester()
    passed, failed, results = tester.run_all_tests()
    
    # Exit with error code if tests failed
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()