# E-commerce Cart and Payment System
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
from datetime import datetime, timezone
import uuid
import os
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

# Cart and Payment Models
class CartItem(BaseModel):
    product_id: str
    quantity: int
    price: float  # Retail price
    product_name: dict  # Multilingual product names
    product_image: str

class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str  # Browser session ID
    items: List[CartItem] = []
    total: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ShippingAddress(BaseModel):
    name: str
    email: EmailStr
    phone: str
    street: str
    city: str
    state: str
    postal_code: str
    country: str

class CheckoutRequest(BaseModel):
    cart_id: str
    shipping_address: ShippingAddress
    shipping_method: str  # 'standard', 'express', 'overnight'
    customer_type: str  # 'retail' or 'wholesale'

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str  # Stripe session ID
    cart_id: str
    customer_email: str
    customer_type: str  # 'retail' or 'wholesale'
    amount: float
    currency: str = "usd"
    shipping_cost: float
    total_amount: float
    payment_status: str = "pending"  # pending, paid, failed, expired
    stripe_status: str = "initiated"
    shipping_address: dict
    items: List[dict]
    metadata: Optional[Dict[str, str]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Retail Pricing Configuration (Fixed prices for retail customers)
RETAIL_PRICES = {
    "product-1": {"price": 89.99, "category": "bathrobes"},  # Premium Cotton Bathrobe
    "product-2": {"price": 129.99, "category": "bathrobes"}, # Bamboo Luxury Bathrobe
    "product-3": {"price": 45.99, "category": "towels"},     # Turkish Cotton Towel Set
    "product-4": {"price": 65.99, "category": "towels"},     # Spa Luxury Towels
    "product-5": {"price": 199.99, "category": "bedding"},   # Premium Bedding Set
    "product-6": {"price": 249.99, "category": "bedding"},   # Organic Bedding Collection
    "product-7": {"price": 299.99, "category": "home-decor"}, # Traditional Turkish Carpets
    "product-8": {"price": 39.99, "category": "home-decor"},  # Decorative Cushions
}

# Shipping Rates (USD)
SHIPPING_RATES = {
    "standard": {"price": 9.99, "days": "5-7 business days", "description": "Standard Shipping"},
    "express": {"price": 19.99, "days": "2-3 business days", "description": "Express Shipping"},
    "overnight": {"price": 39.99, "days": "1 business day", "description": "Overnight Shipping"}
}

# Router for cart and payment endpoints
cart_router = APIRouter(prefix="/api/cart", tags=["cart"])
payment_router = APIRouter(prefix="/api/payments", tags=["payments"])

# Initialize Stripe
def get_stripe_checkout(request: Request):
    api_key = os.getenv("STRIPE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")
    
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    return StripeCheckout(api_key=api_key, webhook_url=webhook_url)

# Cart Management Endpoints
@cart_router.post("/add", response_model=Cart)
async def add_to_cart(session_id: str, product_id: str, quantity: int = 1):
    """Add item to cart"""
    from server import db  # Import db from main server
    
    # Check if product exists and get details
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if product has retail pricing
    if product_id not in RETAIL_PRICES:
        raise HTTPException(status_code=400, detail="Product not available for retail purchase")
    
    retail_info = RETAIL_PRICES[product_id]
    
    # Find or create cart
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        cart = Cart(session_id=session_id).dict()
        await db.carts.insert_one(cart)
    
    # Check if item already in cart
    existing_item = None
    for item in cart["items"]:
        if item["product_id"] == product_id:
            existing_item = item
            break
    
    if existing_item:
        # Update quantity
        existing_item["quantity"] += quantity
    else:
        # Add new item
        cart_item = CartItem(
            product_id=product_id,
            quantity=quantity,
            price=retail_info["price"],
            product_name=product["name"],
            product_image=product["image"]
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

@cart_router.get("/{session_id}", response_model=Cart)
async def get_cart(session_id: str):
    """Get cart by session ID"""
    from server import db
    
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        # Return empty cart
        empty_cart = Cart(session_id=session_id)
        await db.carts.insert_one(empty_cart.dict())
        return empty_cart
    
    return Cart(**cart)

@cart_router.put("/update")
async def update_cart_item(session_id: str, product_id: str, quantity: int):
    """Update item quantity in cart"""
    from server import db
    
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Find item and update quantity
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

@cart_router.delete("/remove/{session_id}/{product_id}")
async def remove_from_cart(session_id: str, product_id: str):
    """Remove item from cart"""
    from server import db
    
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Remove item
    cart["items"] = [item for item in cart["items"] if item["product_id"] != product_id]
    
    # Recalculate total
    cart["total"] = sum(item["price"] * item["quantity"] for item in cart["items"])
    cart["updated_at"] = datetime.now(timezone.utc)
    
    # Update in database
    await db.carts.update_one(
        {"session_id": session_id},
        {"$set": cart}
    )
    
    return Cart(**cart)

@cart_router.get("/shipping/rates")
async def get_shipping_rates():
    """Get available shipping options"""
    return SHIPPING_RATES

# Payment Endpoints
@payment_router.post("/checkout", response_model=dict)
async def create_checkout_session(
    checkout_request: CheckoutRequest,
    request: Request,
    stripe_checkout: StripeCheckout = Depends(get_stripe_checkout)
):
    """Create Stripe checkout session"""
    from server import db
    
    # Get cart
    cart = await db.carts.find_one({"id": checkout_request.cart_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    if not cart["items"]:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Check customer type
    if checkout_request.customer_type == "wholesale":
        # Redirect to contact form for wholesale
        return {
            "redirect_type": "wholesale",
            "redirect_url": "/contact",
            "message": "Wholesale customers please contact us for pricing"
        }
    
    # Calculate shipping
    shipping_info = SHIPPING_RATES.get(checkout_request.shipping_method)
    if not shipping_info:
        raise HTTPException(status_code=400, detail="Invalid shipping method")
    
    shipping_cost = shipping_info["price"]
    subtotal = cart["total"]
    total_amount = subtotal + shipping_cost
    
    # Create success and cancel URLs
    host_url = str(request.base_url).rstrip('/')
    success_url = f"{host_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/checkout/cancel"
    
    # Prepare metadata
    metadata = {
        "cart_id": checkout_request.cart_id,
        "customer_email": checkout_request.shipping_address.email,
        "customer_type": checkout_request.customer_type,
        "shipping_method": checkout_request.shipping_method,
        "shipping_cost": str(shipping_cost)
    }
    
    # Create Stripe checkout session
    checkout_session_request = CheckoutSessionRequest(
        amount=total_amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    try:
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_session_request)
        
        # Create payment transaction record
        payment_transaction = PaymentTransaction(
            session_id=session.session_id,
            cart_id=checkout_request.cart_id,
            customer_email=checkout_request.shipping_address.email,
            customer_type=checkout_request.customer_type,
            amount=subtotal,
            shipping_cost=shipping_cost,
            total_amount=total_amount,
            shipping_address=checkout_request.shipping_address.dict(),
            items=[item for item in cart["items"]],
            metadata=metadata
        )
        
        await db.payment_transactions.insert_one(payment_transaction.dict())
        
        return {
            "redirect_type": "payment",
            "checkout_url": session.url,
            "session_id": session.session_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")

@payment_router.get("/status/{session_id}", response_model=dict)
async def get_payment_status(
    session_id: str,
    stripe_checkout: StripeCheckout = Depends(get_stripe_checkout)
):
    """Get payment status and update transaction"""
    from server import db
    
    # Get transaction from database
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    try:
        # Get status from Stripe
        status_response: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction status (only if not already processed)
        if transaction["payment_status"] == "pending":
            update_data = {
                "stripe_status": status_response.status,
                "payment_status": "paid" if status_response.payment_status == "paid" else "failed",
                "updated_at": datetime.now(timezone.utc)
            }
            
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": update_data}
            )
            
            # If payment successful, create order
            if status_response.payment_status == "paid":
                await create_order_from_transaction(transaction, db)
        
        return {
            "payment_status": status_response.payment_status,
            "stripe_status": status_response.status,
            "amount_total": status_response.amount_total,
            "currency": status_response.currency
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check payment status: {str(e)}")

async def create_order_from_transaction(transaction: dict, db):
    """Create order from successful payment transaction"""
    order_data = {
        "id": str(uuid.uuid4()),
        "order_number": f"OV{str(uuid.uuid4())[:8].upper()}",
        "customer_email": transaction["customer_email"],
        "customer_type": "retail",
        "items": transaction["items"],
        "subtotal": transaction["amount"],
        "shipping_cost": transaction["shipping_cost"],
        "total_amount": transaction["total_amount"],
        "payment_status": "paid",
        "order_status": "confirmed",
        "shipping_address": transaction["shipping_address"],
        "shipping_method": transaction["metadata"]["shipping_method"],
        "stripe_session_id": transaction["session_id"],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.orders.insert_one(order_data)
    
    # Clear the cart
    await db.carts.delete_one({"id": transaction["cart_id"]})

# Webhook endpoint
@payment_router.post("/webhook/stripe")
async def stripe_webhook(
    request: Request,
    stripe_checkout: StripeCheckout = Depends(get_stripe_checkout)
):
    """Handle Stripe webhooks"""
    from server import db
    
    try:
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.event_type == "checkout.session.completed":
            # Handle successful payment
            transaction = await db.payment_transactions.find_one({"session_id": webhook_response.session_id})
            
            if transaction and transaction["payment_status"] == "pending":
                # Update transaction
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {
                        "payment_status": "paid",
                        "stripe_status": "completed",
                        "updated_at": datetime.now(timezone.utc)
                    }}
                )
                
                # Create order
                await create_order_from_transaction(transaction, db)
        
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")

# Add routers to main app (this will be imported in server.py)
def setup_cart_payment_routes(app):
    app.include_router(cart_router)
    app.include_router(payment_router)