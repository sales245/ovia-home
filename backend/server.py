from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    category: str
    image: str
    name: dict
    features: dict
    badges: List[str]

class ProductUpdate(BaseModel):
    category: Optional[str] = None
    image: Optional[str] = None
    name: Optional[dict] = None
    features: Optional[dict] = None
    badges: Optional[List[str]] = None
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
    company: str
    phone: str
    country: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
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
@api_router.post("/customers", response_model=Customer)
async def create_customer(customer: CustomerCreate):
    # Check if customer already exists
    existing = await db.customers.find_one({"email": customer.email})
    if existing:
        return Customer(**existing)
    
    customer_dict = customer.dict()
    customer_obj = Customer(**customer_dict)
    await db.customers.insert_one(customer_obj.dict())
    return customer_obj

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