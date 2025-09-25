from fastapi import FastAPI, APIRouter, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import os
import logging
import uuid
import hashlib
import secrets
from pathlib import Path
from dotenv import load_dotenv
import httpx
from bs4 import BeautifulSoup

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection - with defaults if env vars not set
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'ovia_home')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Product Management Models
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    image: str
    name: dict  # Multilingual names
    features: dict  # Multilingual features  
    badges: List[str]
    retail_price: Optional[float] = None  # Retail price for individual customers
    wholesale_price: Optional[float] = None  # Wholesale price for bulk orders
    min_wholesale_quantity: int = 50  # Minimum quantity for wholesale pricing
    in_stock: bool = True
    stock_quantity: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    category: str
    image: str
    name: dict
    features: dict
    badges: List[str]
    retail_price: Optional[float] = None
    wholesale_price: Optional[float] = None
    min_wholesale_quantity: int = 50
    in_stock: bool = True
    stock_quantity: Optional[int] = None

class ProductUpdate(BaseModel):
    category: Optional[str] = None
    image: Optional[str] = None
    name: Optional[dict] = None
    features: Optional[dict] = None
    badges: Optional[List[str]] = None
    retail_price: Optional[float] = None
    wholesale_price: Optional[float] = None
    min_wholesale_quantity: Optional[int] = None
    in_stock: Optional[bool] = None
    stock_quantity: Optional[int] = None

# Category Management Models
class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: dict  # Multilingual names (e.g., {"en": "Bathrobes", "tr": "Bornozlar"})
    slug: str  # URL-friendly identifier (e.g., "bathrobes")
    description: Optional[dict] = None  # Multilingual descriptions
    image: Optional[str] = None  # Category image URL
    sort_order: int = 0  # For ordering categories
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: dict
    slug: str
    description: Optional[dict] = None
    image: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True

class CategoryUpdate(BaseModel):
    name: Optional[dict] = None
    slug: Optional[str] = None
    description: Optional[dict] = None
    image: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

# Cart and Shopping Models
class CartItem(BaseModel):
    product_id: str
    quantity: int
    price: float
    product_name: dict
    product_image: str
    customer_type: str = "retail"  # retail or wholesale

class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    items: List[CartItem] = []
    total: float = 0.0
    customer_type: str = "retail"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int = 1
    customer_type: str = "retail"
class ProductInquiry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    company: str
    phone: Optional[str] = None
    product_category: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductInquiryCreate(BaseModel):
    name: str
    email: EmailStr
    company: str
    phone: Optional[str] = None
    product_category: str 
    message: str

class QuoteRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    company: str
    phone: str
    country: str
    products: List[str]
    quantity: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuoteRequestCreate(BaseModel):
    name: str
    email: EmailStr
    company: str
    phone: str
    country: str
    products: List[str]
    quantity: str
    message: str

class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    password_hash: str
    company: str
    phone: str
    country: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    company: str
    phone: str
    country: str

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    order_number: str = Field(default_factory=lambda: f"OV{str(uuid.uuid4())[:8].upper()}")
    products: List[dict]
    status: str = "Pending"  # Pending, Confirmed, In Production, Shipped, Delivered
    tracking_number: Optional[str] = None
    total_amount: Optional[float] = None
    payment_method: Optional[str] = None
    shipping_address: dict
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_id: str
    products: List[dict]
    shipping_address: dict
    payment_method: Optional[str] = None

# Ürün URL'sinden veri çekme için model
class ImportProductRequest(BaseModel):
    url: str

# Product Inquiry Routes
@api_router.post("/inquiries", response_model=ProductInquiry)
async def create_inquiry(inquiry: ProductInquiryCreate):
    inquiry_dict = inquiry.dict()
    inquiry_obj = ProductInquiry(**inquiry_dict)
    await db.inquiries.insert_one(inquiry_obj.dict())
    return inquiry_obj

@api_router.get("/inquiries", response_model=List[ProductInquiry])
async def get_inquiries():
    inquiries = await db.inquiries.find().to_list(1000)
    return [ProductInquiry(**inquiry) for inquiry in inquiries]

# Quote Request Routes
@api_router.post("/quotes", response_model=QuoteRequest)
async def create_quote_request(quote: QuoteRequestCreate):
    quote_dict = quote.dict()
    quote_obj = QuoteRequest(**quote_dict)
    await db.quotes.insert_one(quote_obj.dict())
    return quote_obj

@api_router.get("/quotes", response_model=List[QuoteRequest])
async def get_quotes():
    quotes = await db.quotes.find().to_list(1000)
    return [QuoteRequest(**quote) for quote in quotes]

# Customer Routes
import hashlib
import secrets

def hash_password(password: str, salt: str = None) -> str:
    if not salt:
        salt = secrets.token_hex(16)
    hash_ = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}${hash_}"

def verify_password(password: str, hashed: str) -> bool:
    salt, hash_ = hashed.split('$')
    return hash_ == hashlib.sha256((salt + password).encode()).hexdigest()

@api_router.post("/customers", response_model=Customer)
async def create_customer(customer: CustomerCreate):
    # Check if customer already exists
    existing = await db.customers.find_one({"email": customer.email})
    if existing:
        raise HTTPException(status_code=400, detail="Customer already exists")
    
    customer_dict = customer.dict()
    password = customer_dict.pop("password")
    password_hash = hash_password(password)
    customer_obj = Customer(**customer_dict, password_hash=password_hash)
    await db.customers.insert_one(customer_obj.dict())
    return customer_obj

# Login endpoint
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@api_router.post("/login")
async def login(request: LoginRequest):
    user = await db.customers.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    # Remove password_hash and _id from response for security and serialization
    user.pop("password_hash", None)
    user.pop("_id", None)  # Remove ObjectId to avoid serialization issues
    return user

@api_router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str):
    customer = await db.customers.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return Customer(**customer)

# Order Routes
@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate):
    order_dict = order.dict()
    order_obj = Order(**order_dict)
    await db.orders.insert_one(order_obj.dict())
    return order_obj

@api_router.get("/orders/customer/{customer_id}", response_model=List[Order])
async def get_customer_orders(customer_id: str):
    orders = await db.orders.find({"customer_id": customer_id}).to_list(1000)
    return [Order(**order) for order in orders]

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**order)

@api_router.put("/orders/{order_id}")
async def update_order_status(order_id: str, status: str, tracking_number: Optional[str] = None):
    update_data = {"status": status, "updated_at": datetime.now(timezone.utc)}
    if tracking_number:
        update_data["tracking_number"] = tracking_number
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order updated successfully"}

# Product Management Routes
@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find().to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/customers") 
async def get_customers():
    customers = await db.customers.find().to_list(1000)
    # Convert ObjectId to string for JSON serialization
    for customer in customers:
        if '_id' in customer:
            customer['_id'] = str(customer['_id'])
    return customers

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    product_dict = product.dict()
    product_obj = Product(**product_dict)
    await db.products.insert_one(product_obj.dict())
    return product_obj

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_update: ProductUpdate):
    update_data = {k: v for k, v in product_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    updated_product = await db.products.find_one({"id": product_id})
    return Product(**updated_product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

# Category Management Routes
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({"is_active": True}).sort("sort_order", 1).to_list(1000)
    return [Category(**category) for category in categories]

@api_router.get("/categories/{category_id}", response_model=Category)
async def get_category(category_id: str):
    category = await db.categories.find_one({"id": category_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return Category(**category)

@api_router.post("/categories", response_model=Category)
async def create_category(category: CategoryCreate):
    # Check if slug already exists
    existing = await db.categories.find_one({"slug": category.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists")
    
    category_dict = category.dict()
    category_obj = Category(**category_dict)
    await db.categories.insert_one(category_obj.dict())
    return category_obj

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, category_update: CategoryUpdate):
    # Check if new slug conflicts with existing categories
    if category_update.slug:
        existing = await db.categories.find_one({
            "slug": category_update.slug,
            "id": {"$ne": category_id}
        })
        if existing:
            raise HTTPException(status_code=400, detail="Category slug already exists")
    
    update_data = {k: v for k, v in category_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.categories.update_one(
        {"id": category_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    updated_category = await db.categories.find_one({"id": category_id})
    return Category(**updated_category)

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str):
    # Check if category is used by products
    products_using_category = await db.products.count_documents({"category": category_id})
    if products_using_category > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category. {products_using_category} products are using this category."
        )
    
    result = await db.categories.delete_one({"id": category_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}

@api_router.post("/admin/init-categories")
async def initialize_categories():
    """Initialize default categories"""
    existing_count = await db.categories.count_documents({})
    if existing_count > 0:
        return {"message": "Categories already initialized", "count": existing_count}
    
    default_categories = [
        {
            "slug": "bathrobes",
            "name": {
                "en": "Bathrobes",
                "tr": "Bornozlar",
                "de": "Bademäntel",
                "fr": "Peignoirs",
                "it": "Accappatoi",
                "es": "Albornoces"
            },
            "description": {
                "en": "Luxury bathrobes made from premium materials",
                "tr": "Premium malzemelerden yapılmış lüks bornozlar"
            },
            "sort_order": 1,
            "is_active": True
        },
        {
            "slug": "towels",
            "name": {
                "en": "Towels",
                "tr": "Havlular",
                "de": "Handtücher",
                "fr": "Serviettes",
                "it": "Asciugamani", 
                "es": "Toallas"
            },
            "description": {
                "en": "High-quality towels for home and spa use",
                "tr": "Ev ve spa kullanımı için yüksek kaliteli havlular"
            },
            "sort_order": 2,
            "is_active": True
        },
        {
            "slug": "bedding",
            "name": {
                "en": "Bedding",
                "tr": "Yatak Takımları",
                "de": "Bettwäsche",
                "fr": "Literie",
                "it": "Biancheria da letto",
                "es": "Ropa de cama"
            },
            "description": {
                "en": "Premium bedding sets and linens",
                "tr": "Premium yatak takımları ve çarşaflar"
            },
            "sort_order": 3,
            "is_active": True
        },
        {
            "slug": "home-decor",
            "name": {
                "en": "Home Décor",
                "tr": "Ev Dekorasyonu",
                "de": "Wohndekoration",
                "fr": "Décoration",
                "it": "Decorazione casa",
                "es": "Decoración del hogar"
            },
            "description": {
                "en": "Decorative items and accessories for your home",
                "tr": "Eviniz için dekoratif eşyalar ve aksesuarlar"
            },
            "sort_order": 4,
            "is_active": True
        }
    ]
    
    categories = [Category(**cat) for cat in default_categories]
    await db.categories.insert_many([cat.dict() for cat in categories])
    
    return {"message": "Categories initialized successfully", "count": len(categories)}

# Cart Management Routes
@api_router.get("/cart/{session_id}", response_model=Cart)
async def get_cart(session_id: str):
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        # Create empty cart
        empty_cart = Cart(session_id=session_id)
        await db.carts.insert_one(empty_cart.dict())
        return empty_cart
    return Cart(**cart)

@api_router.post("/cart/{session_id}/add", response_model=Cart)
async def add_to_cart(session_id: str, request: AddToCartRequest):
    # Get product details
    product = await db.products.find_one({"id": request.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Determine price based on customer type and quantity
    if request.customer_type == "wholesale" and request.quantity >= product.get("min_wholesale_quantity", 50):
        price = product.get("wholesale_price")
        if price is None:
            raise HTTPException(status_code=400, detail="Wholesale price not available")
    else:
        price = product.get("retail_price")
        if price is None:
            raise HTTPException(status_code=400, detail="Retail price not available")
    
    # Get or create cart
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        cart = Cart(session_id=session_id, customer_type=request.customer_type).dict()
        await db.carts.insert_one(cart)
    
    # Check if item already in cart
    existing_item = None
    for item in cart["items"]:
        if item["product_id"] == request.product_id:
            existing_item = item
            break
    
    if existing_item:
        # Update quantity
        existing_item["quantity"] += request.quantity
    else:
        # Add new item
        cart_item = CartItem(
            product_id=request.product_id,
            quantity=request.quantity,
            price=price,
            product_name=product["name"],
            product_image=product["image"],
            customer_type=request.customer_type
        )
        cart["items"].append(cart_item.dict())
    
    # Recalculate total
    cart["total"] = sum(item["price"] * item["quantity"] for item in cart["items"])
    cart["updated_at"] = datetime.now(timezone.utc)
    
    # Update in database
    await db.carts.update_one(
        {"session_id": session_id},
        {"$set": cart}
    )
    
    return Cart(**cart)

@api_router.put("/cart/{session_id}/update", response_model=Cart)
async def update_cart_item(session_id: str, product_id: str, quantity: int):
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Find and update item
    item_found = False
    for item in cart["items"]:
        if item["product_id"] == product_id:
            if quantity <= 0:
                cart["items"].remove(item)
            else:
                item["quantity"] = quantity
            item_found = True
            break
    
    if not item_found:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    # Recalculate total
    cart["total"] = sum(item["price"] * item["quantity"] for item in cart["items"])
    cart["updated_at"] = datetime.now(timezone.utc)
    
    # Update in database
    await db.carts.update_one(
        {"session_id": session_id},
        {"$set": cart}
    )
    
    return Cart(**cart)

@api_router.delete("/cart/{session_id}/remove/{product_id}")
async def remove_from_cart(session_id: str, product_id: str):
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Remove item
    cart["items"] = [item for item in cart["items"] if item["product_id"] != product_id]
    
    # Recalculate total
    cart["total"] = sum(item["price"] * item["quantity"] for item in cart["items"])
    cart["updated_at"] = datetime.now(timezone.utc)
    
    await db.carts.update_one(
        {"session_id": session_id},
        {"$set": cart}
    )
    
    return {"message": "Item removed from cart"}

@api_router.delete("/cart/{session_id}/clear")
async def clear_cart(session_id: str):
    await db.carts.delete_one({"session_id": session_id})
    return {"message": "Cart cleared"}

# Initialize default products endpoint
@api_router.post("/admin/init-products")
async def initialize_products():
    """Initialize the product catalog with default products"""
    
    # Check if products already exist
    existing_count = await db.products.count_documents({})
    if existing_count > 0:
        return {"message": "Products already initialized", "count": existing_count}
    
    default_products = [
        {
            "id": "product-1",
            "category": "bathrobes",
            "image": "https://images.unsplash.com/photo-1713881676551-b16f22ce4719?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxjb3R0b24lMjBiYXRocm9iZXN8ZW58MHx8fHwxNzU3ODY5NDU1fDA&ixlib=rb-4.1.0&q=85",
            "name": {
                "en": "Premium Cotton Bathrobe",
                "tr": "Premium Pamuk Bornoz",
                "de": "Premium Baumwoll-Bademantel",
                "fr": "Peignoir en Coton Premium",
                "it": "Accappatoio di Cotone Premium",
                "es": "Albornoz de Algodón Premium",
                "pl": "Szlafrok Bawełniany Premium",
                "ru": "Премиум Хлопковый Халат",
                "bg": "Премиум Памучен Халат",
                "el": "Premium Βαμβακερό Μπουρνούζι",
                "pt": "Roupão de Algodão Premium",
                "ar": "بشكير قطني فاخر"
            },
            "features": {
                "en": ["100% Organic Cotton", "OEKO-TEX Certified", "Multiple Sizes"],
                "tr": ["%100 Organik Pamuk", "OEKO-TEX Sertifikalı", "Çoklu Bedenler"],
                "de": ["100% Bio-Baumwolle", "OEKO-TEX Zertifiziert", "Mehrere Größen"],
                "fr": ["100% Coton Biologique", "Certifié OEKO-TEX", "Tailles Multiples"],
                "it": ["100% Cotone Biologico", "Certificato OEKO-TEX", "Taglie Multiple"],
                "es": ["100% Algodón Orgánico", "Certificado OEKO-TEX", "Múltiples Tallas"],
                "pl": ["100% Bawełna Organiczna", "Certyfikat OEKO-TEX", "Wiele Rozmiarów"],
                "ru": ["100% Органический Хлопок", "Сертификат OEKO-TEX", "Разные Размеры"],
                "bg": ["100% Органичен Памук", "OEKO-TEX Сертификат", "Множество Размери"],
                "el": ["100% Βιολογικό Βαμβάκι", "Πιστοποίηση OEKO-TEX", "Πολλαπλά Μεγέθη"],
                "pt": ["100% Algodão Orgânico", "Certificado OEKO-TEX", "Múltiplos Tamanhos"],
                "ar": ["قطن عضوي 100%", "معتمد OEKO-TEX", "أحجام متعددة"]
            },
            "badges": ["organicCotton", "certified"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "product-2",
            "category": "bathrobes",
            "image": "https://images.unsplash.com/photo-1639654803583-7c616d7e0b6c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHxjb3R0b24lMjBiYXRocm9iZXN8ZW58MHx8fHwxNzU3ODY5NDU1fDA&ixlib=rb-4.1.0&q=85",
            "name": {
                "en": "Bamboo Luxury Bathrobe",
                "tr": "Bambu Lüks Bornoz",
                "de": "Bambus Luxus-Bademantel",
                "fr": "Peignoir de Luxe en Bambou",
                "it": "Accappatoio di Lusso in Bambù",
                "es": "Albornoz de Lujo de Bambú",
                "pl": "Luksusowy Szlafrok Bambusowy",
                "ru": "Роскошный Бамбуковый Халат",
                "bg": "Луксозен Бамбуков Халат",
                "el": "Πολυτελές Μπαμπού Μπουρνούζι",
                "pt": "Roupão de Luxo de Bambu",
                "ar": "بشكير خيزران فاخر"
            },
            "features": {
                "en": ["Bamboo Fiber", "Antibacterial", "Eco-Friendly"],
                "tr": ["Bambu Lifi", "Antibakteriyel", "Çevre Dostu"],
                "de": ["Bambusfaser", "Antibakteriell", "Umweltfreundlich"],
                "fr": ["Fibre de Bambou", "Antibactérien", "Écologique"],
                "it": ["Fibra di Bambù", "Antibatterico", "Ecologico"],
                "es": ["Fibra de Bambú", "Antibacteriano", "Ecológico"],
                "pl": ["Włókno Bambusowe", "Antybakteryjne", "Ekologiczne"],
                "ru": ["Бамбуковое Волокно", "Антибактериальный", "Экологичный"],
                "bg": ["Бамбуково Влакно", "Антибактериален", "Екологичен"],
                "el": ["Ίνα Μπαμπού", "Αντιβακτηριδιακό", "Φιλικό προς το Περιβάλλον"],
                "pt": ["Fibra de Bambu", "Antibacteriano", "Ecológico"],
                "ar": ["ألياف الخيزران", "مضاد للبكتيريا", "صديق للبيئة"]
            },
            "badges": ["sustainable", "premium"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "product-3",
            "category": "towels",
            "image": "https://images.unsplash.com/photo-1649446326998-a16524cfa667?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB0b3dlbHN8ZW58MHx8fHwxNzU3ODY5NDU5fDA&ixlib=rb-4.1.0&q=85",
            "name": {
                "en": "Turkish Cotton Towel Set",
                "tr": "Türk Pamuğu Havlu Seti",
                "de": "Türkisches Baumwoll-Handtuch-Set",
                "fr": "Set de Serviettes en Coton Turc",
                "it": "Set Asciugamani in Cotone Turco",
                "es": "Juego de Toallas de Algodón Turco",
                "pl": "Zestaw Ręczników z Tureckiej Bawełny",
                "ru": "Набор Полотенец из Турецкого Хлопка",
                "bg": "Комплект Хавлии от Турски Памук",
                "el": "Σετ Πετσέτες από Τουρκικό Βαμβάκι",
                "pt": "Conjunto de Toalhas de Algodão Turco",
                "ar": "طقم مناشف قطن تركي"
            },
            "features": {
                "en": ["Turkish Cotton", "High Absorption", "Various Colors"],
                "tr": ["Türk Pamuğu", "Yüksek Emicilik", "Çeşitli Renkler"],
                "de": ["Türkische Baumwolle", "Hohe Saugfähigkeit", "Verschiedene Farben"],
                "fr": ["Coton Turc", "Haute Absorption", "Couleurs Variées"],
                "it": ["Cotone Turco", "Alta Assorbenza", "Vari Colori"],
                "es": ["Algodón Turco", "Alta Absorción", "Varios Colores"],
                "pl": ["Turecka Bawełna", "Wysoka Chłonność", "Różne Kolory"],
                "ru": ["Турецкий Хлопок", "Высокая Впитываемость", "Разные Цвета"],
                "bg": ["Турски Памук", "Високо Поглъщане", "Различни Цветове"],
                "el": ["Τουρκικό Βαμβάκι", "Υψηλή Απορρόφηση", "Διάφορα Χρώματα"],
                "pt": ["Algodão Turco", "Alta Absorção", "Várias Cores"],
                "ar": ["قطن تركي", "امتصاص عالي", "ألوان متنوعة"]
            },
            "badges": ["premium", "certified"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    try:
        await db.products.insert_many(default_products)
        return {"message": "Products initialized successfully", "count": len(default_products)}
    except Exception as e:
        return {"message": f"Error initializing products: {str(e)}", "status": "error"}

# Ürün URL'sinden veri çekme endpointi (örnek scraping, demo amaçlı)
@api_router.post("/import-product-from-url")
async def import_product_from_url(request: ImportProductRequest):
    url = request.url
    # Sadece demo: Amazon veya Alibaba ise örnek veri döndür
    if "amazon" in url:
        return {
            "name": {"en": "Premium Cotton Bathrobe", "tr": "Premium Pamuk Bornoz"},
            "features": {"en": ["100% Cotton", "Machine Washable", "Soft & Comfortable"]},
            "image": "https://via.placeholder.com/400x400/4f46e5/ffffff?text=Amazon+Product",
            "badges": ["premium", "organicCotton"]
        }
    elif "alibaba" in url:
        return {
            "name": {"en": "Bulk Hotel Towel Set", "tr": "Toplu Otel Havlu Seti"},
            "features": {"en": ["Bulk Price", "Hotel Quality", "Customizable"]},
            "image": "https://via.placeholder.com/400x400/f59e42/ffffff?text=Alibaba+Product",
            "badges": ["bulk", "customizable"]
        }
    # Gerçek scraping örneği (çok basit, sadece başlık ve ilk görsel)
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            soup = BeautifulSoup(resp.text, 'html.parser')
            title = soup.title.string if soup.title else "Imported Product"
            img = soup.find('img')
            image_url = img['src'] if img and img.has_attr('src') else ''
            return {
                "name": {"en": title},
                "features": {"en": ["Imported from URL"]},
                "image": image_url,
                "badges": ["imported"]
            }
    except Exception as e:
        return {"error": f"Failed to import product: {str(e)}"}

@api_router.get("/stats")
async def get_stats():
    inquiries_count = await db.inquiries.count_documents({})
    quotes_count = await db.quotes.count_documents({})
    customers_count = await db.customers.count_documents({})
    orders_count = await db.orders.count_documents({})
    
    return {
        "inquiries": inquiries_count,
        "quotes": quotes_count,
        "customers": customers_count,
        "orders": orders_count,
        "countries_served": 30,  # Static for now
        "years_experience": 15
    }

@api_router.get("/")
async def root():
    return {"message": "Ovia Home API - Turkish Home Textiles"}

# Create sample data endpoint for admin testing
@api_router.post("/admin/seed-data")
async def seed_sample_data():
    """Create sample data for admin panel testing"""
    import random
    
    # Sample inquiries
    sample_inquiries = [
        {
            "id": f"inquiry-{i}",
            "name": f"Customer {i}",
            "email": f"customer{i}@example.com",
            "company": f"Company {i} Ltd",
            "phone": f"+1-555-{1000+i:04d}",
            "product_category": random.choice(["Bathrobes", "Towels", "Bedding", "Home Decor"]),
            "message": f"I'm interested in your products for wholesale. Please provide more information about pricing and minimum order quantities.",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))).isoformat()
        }
        for i in range(1, 21)
    ]
    
    # Sample quotes
    sample_quotes = [
        {
            "id": f"quote-{i}",
            "name": f"Wholesale Buyer {i}",
            "email": f"buyer{i}@wholesale.com",
            "company": f"Wholesale Co {i}",
            "phone": f"+1-555-{2000+i:04d}",
            "country": random.choice(["Germany", "France", "Italy", "Spain", "UK", "USA"]),
            "products": random.sample(["Bathrobes", "Towels", "Bedding", "Home Decor"], random.randint(1, 3)),
            "quantity": f"{random.randint(100, 1000)} pieces",
            "message": f"Looking for bulk pricing on your textile products for our retail chain.",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 15))).isoformat()
        }
        for i in range(1, 16)
    ]
    
    # Sample customers
    sample_customers = [
        {
            "id": f"customer-{i}",
            "name": f"Business Owner {i}",
            "email": f"owner{i}@business.com",
            "company": f"Textile Business {i}",
            "phone": f"+1-555-{3000+i:04d}",
            "country": random.choice(["Germany", "France", "Italy", "Spain", "UK", "USA", "Canada"]),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 60))).isoformat()
        }
        for i in range(1, 11)
    ]
    
    # Insert sample data
    try:
        # Only insert if collections are empty to avoid duplicates
        if await db.inquiries.count_documents({}) == 0:
            await db.inquiries.insert_many(sample_inquiries)
        
        if await db.quotes.count_documents({}) == 0:
            await db.quotes.insert_many(sample_quotes)
            
        if await db.customers.count_documents({}) == 0:
            await db.customers.insert_many(sample_customers)
            
        return {"message": "Sample data created successfully", "status": "success"}
    except Exception as e:
        return {"message": f"Error creating sample data: {str(e)}", "status": "error"}

@api_router.get("/admin/analytics")
async def get_admin_analytics():
    """Get detailed analytics for admin dashboard"""
    try:
        # Get counts by time periods
        now = datetime.now(timezone.utc)
        last_week = now - timedelta(days=7)
        last_month = now - timedelta(days=30)
        
        # Inquiries by period
        inquiries_total = await db.inquiries.count_documents({})
        inquiries_week = await db.inquiries.count_documents({
            "created_at": {"$gte": last_week.isoformat()}
        })
        inquiries_month = await db.inquiries.count_documents({
            "created_at": {"$gte": last_month.isoformat()}
        })
        
        # Quotes by period
        quotes_total = await db.quotes.count_documents({})
        quotes_week = await db.quotes.count_documents({
            "created_at": {"$gte": last_week.isoformat()}
        })
        quotes_month = await db.quotes.count_documents({
            "created_at": {"$gte": last_month.isoformat()}
        })
        
        # Most popular product categories
        pipeline = [
            {"$group": {"_id": "$product_category", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        popular_categories = await db.inquiries.aggregate(pipeline).to_list(5)
        
        # Countries by quotes
        countries_pipeline = [
            {"$group": {"_id": "$country", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        countries_data = await db.quotes.aggregate(countries_pipeline).to_list(10)
        
        return {
            "inquiries": {
                "total": inquiries_total,
                "this_week": inquiries_week,
                "this_month": inquiries_month
            },
            "quotes": {
                "total": quotes_total,
                "this_week": quotes_week,
                "this_month": quotes_month
            },
            "popular_categories": popular_categories,
            "top_countries": countries_data,
            "customers_total": await db.customers.count_documents({})
        }
    except Exception as e:
        return {"error": str(e)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()