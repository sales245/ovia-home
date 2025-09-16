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

# Define Models
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

# Statistics Routes
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