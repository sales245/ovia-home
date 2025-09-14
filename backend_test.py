import requests
import sys
import json
from datetime import datetime

class OviaHomeAPITester:
    def __init__(self, base_url="https://turkish-linens.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_ids = {}  # Store created resource IDs for cleanup/reference

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, params=params)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_status(self):
        """Test API root endpoint"""
        return self.run_test("API Status", "GET", "", 200)

    def test_create_inquiry(self):
        """Test creating a product inquiry"""
        inquiry_data = {
            "name": "Test Customer",
            "email": "test@example.com",
            "company": "Test Company Ltd",
            "phone": "+90 555 123 4567",
            "product_category": "Bathrobes",
            "message": "I'm interested in your bathrobe collection for wholesale."
        }
        success, response = self.run_test("Create Product Inquiry", "POST", "inquiries", 200, inquiry_data)
        if success and 'id' in response:
            self.created_ids['inquiry_id'] = response['id']
        return success

    def test_get_inquiries(self):
        """Test retrieving all inquiries"""
        return self.run_test("Get All Inquiries", "GET", "inquiries", 200)

    def test_create_quote_request(self):
        """Test creating a quote request"""
        quote_data = {
            "name": "Quote Customer",
            "email": "quote@example.com",
            "company": "Wholesale Textiles Inc",
            "phone": "+1 555 987 6543",
            "country": "United States",
            "products": ["Bathrobes", "Towels", "Bedding"],
            "quantity": "500-1000 pieces per product",
            "message": "Looking for bulk pricing on your home textile products."
        }
        success, response = self.run_test("Create Quote Request", "POST", "quotes", 200, quote_data)
        if success and 'id' in response:
            self.created_ids['quote_id'] = response['id']
        return success

    def test_get_quotes(self):
        """Test retrieving all quotes"""
        return self.run_test("Get All Quotes", "GET", "quotes", 200)

    def test_create_customer(self):
        """Test creating a customer"""
        customer_data = {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "company": "Global Textiles Corp",
            "phone": "+44 20 7946 0958",
            "country": "United Kingdom"
        }
        success, response = self.run_test("Create Customer", "POST", "customers", 200, customer_data)
        if success and 'id' in response:
            self.created_ids['customer_id'] = response['id']
        return success

    def test_get_customer(self):
        """Test retrieving a specific customer"""
        if 'customer_id' not in self.created_ids:
            print("❌ Skipping - No customer ID available")
            return False
        
        customer_id = self.created_ids['customer_id']
        return self.run_test("Get Customer by ID", "GET", f"customers/{customer_id}", 200)

    def test_create_order(self):
        """Test creating an order"""
        if 'customer_id' not in self.created_ids:
            print("❌ Skipping - No customer ID available")
            return False

        order_data = {
            "customer_id": self.created_ids['customer_id'],
            "products": [
                {
                    "name": "Premium Bathrobe",
                    "category": "Bathrobes",
                    "quantity": 100,
                    "specifications": "100% Cotton, Size: L"
                },
                {
                    "name": "Turkish Towel Set",
                    "category": "Towels", 
                    "quantity": 200,
                    "specifications": "600 GSM, White"
                }
            ],
            "shipping_address": {
                "street": "123 Business Ave",
                "city": "London",
                "country": "United Kingdom",
                "postal_code": "SW1A 1AA"
            },
            "payment_method": "Bank Transfer"
        }
        success, response = self.run_test("Create Order", "POST", "orders", 200, order_data)
        if success and 'id' in response:
            self.created_ids['order_id'] = response['id']
        return success

    def test_get_customer_orders(self):
        """Test retrieving orders for a customer"""
        if 'customer_id' not in self.created_ids:
            print("❌ Skipping - No customer ID available")
            return False

        customer_id = self.created_ids['customer_id']
        return self.run_test("Get Customer Orders", "GET", f"orders/customer/{customer_id}", 200)

    def test_get_order(self):
        """Test retrieving a specific order"""
        if 'order_id' not in self.created_ids:
            print("❌ Skipping - No order ID available")
            return False

        order_id = self.created_ids['order_id']
        return self.run_test("Get Order by ID", "GET", f"orders/{order_id}", 200)

    def test_update_order_status(self):
        """Test updating order status"""
        if 'order_id' not in self.created_ids:
            print("❌ Skipping - No order ID available")
            return False

        order_id = self.created_ids['order_id']
        params = {
            "status": "Confirmed",
            "tracking_number": "TRK123456789"
        }
        return self.run_test("Update Order Status", "PUT", f"orders/{order_id}", 200, params=params)

    def test_get_stats(self):
        """Test retrieving website statistics"""
        return self.run_test("Get Website Statistics", "GET", "stats", 200)

    def test_error_handling(self):
        """Test error handling with invalid requests"""
        print("\n🔍 Testing Error Handling...")
        
        # Test invalid customer ID
        success, _ = self.run_test("Invalid Customer ID", "GET", "customers/invalid-id", 404)
        
        # Test invalid order ID
        success2, _ = self.run_test("Invalid Order ID", "GET", "orders/invalid-id", 404)
        
        # Test invalid inquiry data (missing required fields)
        invalid_inquiry = {"name": "Test"}  # Missing required fields
        success3, _ = self.run_test("Invalid Inquiry Data", "POST", "inquiries", 422, invalid_inquiry)
        
        return success and success2 and success3

def main():
    print("🏠 Starting Ovia Home API Testing...")
    print("=" * 60)
    
    tester = OviaHomeAPITester()
    
    # Test sequence
    test_results = []
    
    # Basic API tests
    test_results.append(tester.test_api_status())
    test_results.append(tester.test_get_stats())
    
    # Inquiry tests
    test_results.append(tester.test_create_inquiry())
    test_results.append(tester.test_get_inquiries())
    
    # Quote tests
    test_results.append(tester.test_create_quote_request())
    test_results.append(tester.test_get_quotes())
    
    # Customer tests
    test_results.append(tester.test_create_customer())
    test_results.append(tester.test_get_customer())
    
    # Order tests
    test_results.append(tester.test_create_order())
    test_results.append(tester.test_get_customer_orders())
    test_results.append(tester.test_get_order())
    test_results.append(tester.test_update_order_status())
    
    # Error handling tests
    test_results.append(tester.test_error_handling())
    
    # Print final results
    print("\n" + "=" * 60)
    print("📊 FINAL TEST RESULTS")
    print("=" * 60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.created_ids:
        print(f"\n📝 Created Resources:")
        for key, value in tester.created_ids.items():
            print(f"   {key}: {value}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())