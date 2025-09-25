import requests
import sys
import json
from datetime import datetime
import os

class OviaHomeAPITester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_ids = {}  # Store created resource IDs for cleanup/reference
        self.failed_tests = []  # Track failed tests for detailed reporting

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
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

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
                    self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code} - {error_data}")
                except:
                    print(f"   Error: {response.text}")
                    self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code} - {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"{name}: Exception - {str(e)}")
            return False, {}

    def test_database_connection(self):
        """Test MongoDB database connection by checking API status"""
        return self.run_test("Database Connection (API Status)", "GET", "", 200)

    def test_get_categories(self):
        """Test retrieving all categories"""
        return self.run_test("Get All Categories", "GET", "categories", 200)

    def test_create_category(self):
        """Test creating a new category"""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        category_data = {
            "name": {
                "en": f"Test Category {unique_id}",
                "tr": f"Test Kategorisi {unique_id}"
            },
            "slug": f"test-category-{unique_id}",
            "description": {
                "en": "A test category for API testing",
                "tr": "API testi için test kategorisi"
            },
            "sort_order": 10,
            "is_active": True
        }
        success, response = self.run_test("Create Category", "POST", "categories", 200, category_data)
        if success and 'id' in response:
            self.created_ids['category_id'] = response['id']
        return success

    def test_get_products(self):
        """Test retrieving all products"""
        return self.run_test("Get All Products", "GET", "products", 200)

    def test_create_product(self):
        """Test creating a new product"""
        product_data = {
            "category": "bathrobes",
            "image": "https://example.com/test-product.jpg",
            "name": {
                "en": "Test Product",
                "tr": "Test Ürünü"
            },
            "features": {
                "en": ["High Quality", "Durable", "Comfortable"],
                "tr": ["Yüksek Kalite", "Dayanıklı", "Rahat"]
            },
            "badges": ["premium", "new"],
            "retail_price": 99.99,
            "wholesale_price": 79.99,
            "min_wholesale_quantity": 50,
            "in_stock": True,
            "stock_quantity": 100
        }
        success, response = self.run_test("Create Product", "POST", "products", 200, product_data)
        if success and 'id' in response:
            self.created_ids['product_id'] = response['id']
        return success

    def test_admin_init_categories(self):
        """Test admin endpoint for initializing categories"""
        return self.run_test("Admin Init Categories", "POST", "admin/init-categories", 200)

    def test_admin_init_products(self):
        """Test admin endpoint for initializing products"""
        return self.run_test("Admin Init Products", "POST", "admin/init-products", 200)

    def test_admin_seed_data(self):
        """Test admin endpoint for seeding sample data"""
        return self.run_test("Admin Seed Data", "POST", "admin/seed-data", 200)

    def test_import_product_from_amazon_url(self):
        """Test importing product from Amazon URL"""
        import_data = {
            "url": "https://amazon.com/test-product"
        }
        return self.run_test("Import Product from Amazon URL", "POST", "import-product-from-url", 200, import_data)

    def test_import_product_from_alibaba_url(self):
        """Test importing product from Alibaba URL"""
        import_data = {
            "url": "https://alibaba.com/test-product"
        }
        return self.run_test("Import Product from Alibaba URL", "POST", "import-product-from-url", 200, import_data)

    def test_update_category(self):
        """Test updating a category"""
        if 'category_id' not in self.created_ids:
            print("❌ Skipping - No category ID available")
            return False
        
        category_id = self.created_ids['category_id']
        update_data = {
            "description": {
                "en": "Updated test category description",
                "tr": "Güncellenmiş test kategorisi açıklaması"
            }
        }
        return self.run_test("Update Category", "PUT", f"categories/{category_id}", 200, update_data)

    def test_update_product(self):
        """Test updating a product"""
        if 'product_id' not in self.created_ids:
            print("❌ Skipping - No product ID available")
            return False
        
        product_id = self.created_ids['product_id']
        update_data = {
            "retail_price": 109.99,
            "stock_quantity": 150
        }
        return self.run_test("Update Product", "PUT", f"products/{product_id}", 200, update_data)

    def test_get_single_category(self):
        """Test retrieving a single category by ID"""
        if 'category_id' not in self.created_ids:
            print("❌ Skipping - No category ID available")
            return False
        
        category_id = self.created_ids['category_id']
        return self.run_test("Get Single Category", "GET", f"categories/{category_id}", 200)

    def test_get_single_product(self):
        """Test retrieving a single product by ID"""
        if 'product_id' not in self.created_ids:
            print("❌ Skipping - No product ID available")
            return False
        
        product_id = self.created_ids['product_id']
        return self.run_test("Get Single Product", "GET", f"products/{product_id}", 200)

    def test_delete_product(self):
        """Test deleting a product"""
        if 'product_id' not in self.created_ids:
            print("❌ Skipping - No product ID available")
            return False
        
        product_id = self.created_ids['product_id']
        success = self.run_test("Delete Product", "DELETE", f"products/{product_id}", 200)[0]
        if success:
            # Remove from created_ids since it's deleted
            del self.created_ids['product_id']
        return success

    def test_delete_category(self):
        """Test deleting a category"""
        if 'category_id' not in self.created_ids:
            print("❌ Skipping - No category ID available")
            return False
        
        category_id = self.created_ids['category_id']
        success = self.run_test("Delete Category", "DELETE", f"categories/{category_id}", 200)[0]
        if success:
            # Remove from created_ids since it's deleted
            del self.created_ids['category_id']
        return success

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
            "password": "securepassword123",
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
    print("🏠 Starting Comprehensive Ovia Home Backend API Testing...")
    print("=" * 70)
    
    tester = OviaHomeAPITester()
    
    # Test sequence based on review request
    test_results = []
    
    print("\n📊 1. DATABASE CONNECTION TESTS")
    print("-" * 50)
    test_results.append(tester.test_database_connection())
    
    print("\n📂 2. ADMIN INITIALIZATION TESTS")
    print("-" * 50)
    test_results.append(tester.test_admin_init_categories())
    test_results.append(tester.test_admin_init_products())
    test_results.append(tester.test_admin_seed_data())
    
    print("\n📋 3. CATEGORY API TESTS")
    print("-" * 50)
    test_results.append(tester.test_get_categories())
    test_results.append(tester.test_create_category())
    test_results.append(tester.test_get_single_category())
    test_results.append(tester.test_update_category())
    
    print("\n🛍️ 4. PRODUCT API TESTS")
    print("-" * 50)
    test_results.append(tester.test_get_products())
    test_results.append(tester.test_create_product())
    test_results.append(tester.test_get_single_product())
    test_results.append(tester.test_update_product())
    
    print("\n🌐 5. URL IMPORT TESTS")
    print("-" * 50)
    test_results.append(tester.test_import_product_from_amazon_url())
    test_results.append(tester.test_import_product_from_alibaba_url())
    
    print("\n📞 6. INQUIRY & QUOTE TESTS")
    print("-" * 50)
    test_results.append(tester.test_create_inquiry())
    test_results.append(tester.test_get_inquiries())
    test_results.append(tester.test_create_quote_request())
    test_results.append(tester.test_get_quotes())
    
    print("\n👥 7. CUSTOMER & ORDER TESTS")
    print("-" * 50)
    test_results.append(tester.test_create_customer())
    test_results.append(tester.test_get_customer())
    test_results.append(tester.test_create_order())
    test_results.append(tester.test_get_customer_orders())
    test_results.append(tester.test_get_order())
    test_results.append(tester.test_update_order_status())
    
    print("\n📊 8. STATISTICS TESTS")
    print("-" * 50)
    test_results.append(tester.test_get_stats())
    
    print("\n🗑️ 9. CRUD DELETE TESTS")
    print("-" * 50)
    test_results.append(tester.test_delete_product())
    test_results.append(tester.test_delete_category())
    
    print("\n⚠️ 10. ERROR HANDLING TESTS")
    print("-" * 50)
    test_results.append(tester.test_error_handling())
    
    # Print final results
    print("\n" + "=" * 70)
    print("📊 COMPREHENSIVE TEST RESULTS")
    print("=" * 70)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS DETAILS:")
        print("-" * 50)
        for i, failure in enumerate(tester.failed_tests, 1):
            print(f"{i}. {failure}")
    
    if tester.created_ids:
        print(f"\n📝 CREATED RESOURCES:")
        print("-" * 50)
        for key, value in tester.created_ids.items():
            print(f"   {key}: {value}")
    
    print(f"\n🎯 BACKEND TESTING SUMMARY:")
    print("-" * 50)
    if tester.tests_passed == tester.tests_run:
        print("✅ ALL TESTS PASSED - Backend is fully functional!")
    else:
        print(f"⚠️ {tester.tests_run - tester.tests_passed} tests failed - See details above")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())