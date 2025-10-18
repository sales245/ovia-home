import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { 
                tiers: { 
                    orderBy: { min: 'asc' } 
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            items: products.map(p => ({
                id: p.id, 
                slug: p.slug, 
                name: p.name, 
                currency: p.currency,
                tiersRetail: p.tiers
                    .filter(t => t.mode === "RETAIL")
                    .map(t => ({ min: t.min, price: Number(t.price) })),
                tiersWholesale: p.tiers
                    .filter(t => t.mode === "WHOLESALE")
                    .map(t => ({ min: t.min, price: Number(t.price) }))
            }))
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product
app.get("/api/products/:slug", async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { slug: req.params.slug },
            include: { tiers: { orderBy: { min: "asc" } } }
        });
        
        if (!product) {
            return res.status(404).json({ message: "Not found" });
        }
        
        res.json({
            id: product.id, 
            slug: product.slug, 
            name: product.name, 
            currency: product.currency,
            tiersRetail: product.tiers
                .filter(t => t.mode === "RETAIL")
                .map(t => ({ min: t.min, price: Number(t.price) })),
            tiersWholesale: product.tiers
                .filter(t => t.mode === "WHOLESALE")
                .map(t => ({ min: t.min, price: Number(t.price) }))
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Create product
app.post("/api/products", async (req, res) => {
    const { slug, name, currency = "TRY", tiersRetail = [], tiersWholesale = [] } = req.body || {};
    
    if (!slug || !name) {
        return res.status(400).json({ message: "Both slug and name are required" });
    }
    
    const normalizeTiers = arr => {
        return (Array.isArray(arr) ? arr : [])
            .map(t => ({ min: +t.min, price: +t.price }))
            .filter(t => t.min > 0 && t.price >= 0)
            .sort((a, b) => a.min - b.min);
    };
    
    const retailTiers = normalizeTiers(tiersRetail);
    const wholesaleTiers = normalizeTiers(tiersWholesale);
    
    try {
        const product = await prisma.product.create({
            data: {
                slug,
                name,
                currency,
                tiers: {
                    create: [
                        ...retailTiers.map(t => ({ mode: "RETAIL", min: t.min, price: t.price })),
                        ...wholesaleTiers.map(t => ({ mode: "WHOLESALE", min: t.min, price: t.price }))
                    ]
                }
            },
            include: { tiers: true }
        });
        
        res.status(201).json({
            id: product.id,
            slug: product.slug,
            name: product.name,
            currency: product.currency,
            tiersRetail: product.tiers
                .filter(t => t.mode === "RETAIL")
                .map(t => ({ min: t.min, price: Number(t.price) })),
            tiersWholesale: product.tiers
                .filter(t => t.mode === "WHOLESALE")
                .map(t => ({ min: t.min, price: Number(t.price) }))
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ message: "Failed to create product", error: error.message });
    }
});

// Update product
app.put("/api/products/:slug", async (req, res) => {
    const { name, currency, tiersRetail = [], tiersWholesale = [] } = req.body || {};
    
    try {
        const product = await prisma.product.findUnique({ 
            where: { slug: req.params.slug } 
        });
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        const normalizeTiers = arr => {
            return (Array.isArray(arr) ? arr : [])
                .map(t => ({ min: +t.min, price: +t.price }))
                .filter(t => t.min > 0 && t.price >= 0)
                .sort((a, b) => a.min - b.min);
        };
        
        const retailTiers = normalizeTiers(tiersRetail);
        const wholesaleTiers = normalizeTiers(tiersWholesale);
        
        await prisma.$transaction([
            prisma.product.update({ 
                where: { slug: req.params.slug }, 
                data: { 
                    name: name ?? product.name, 
                    currency: currency ?? product.currency 
                }
            }),
            prisma.priceTier.deleteMany({ 
                where: { productId: product.id } 
            }),
            prisma.priceTier.createMany({
                data: [
                    ...retailTiers.map(t => ({ 
                        productId: product.id, 
                        mode: "RETAIL", 
                        min: t.min, 
                        price: t.price 
                    })),
                    ...wholesaleTiers.map(t => ({ 
                        productId: product.id, 
                        mode: "WHOLESALE", 
                        min: t.min, 
                        price: t.price 
                    }))
                ]
            })
        ]);
        
        const refreshedProduct = await prisma.product.findUnique({
            where: { slug: req.params.slug },
            include: { tiers: true }
        });
        
        res.json({
            id: refreshedProduct.id,
            slug: refreshedProduct.slug,
            name: refreshedProduct.name,
            currency: refreshedProduct.currency,
            tiersRetail: refreshedProduct.tiers
                .filter(t => t.mode === "RETAIL")
                .map(t => ({ min: t.min, price: Number(t.price) })),
            tiersWholesale: refreshedProduct.tiers
                .filter(t => t.mode === "WHOLESALE")
                .map(t => ({ min: t.min, price: Number(t.price) }))
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ message: "Failed to update product", error: error.message });
    }
});

// Calculate price
app.get("/api/price", async (req, res) => {
    try {
        const { slug, qty: q, mode = "retail" } = req.query;
        const quantity = Math.max(1, Number(q) || 1);
        const priceMode = (mode || "retail").toString().toUpperCase() === "WHOLESALE" ? "WHOLESALE" : "RETAIL";
        
        const product = await prisma.product.findUnique({
            where: { slug },
            include: { 
                tiers: { 
                    where: { mode: priceMode }, 
                    orderBy: { min: "asc" } 
                } 
            }
        });
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        let unitPrice = 0;
        for (const tier of product.tiers) {
            if (quantity >= tier.min) {
                unitPrice = Number(tier.price);
            }
        }
        
        const totalPrice = +(unitPrice * quantity).toFixed(2);
        
        res.json({ 
            slug, 
            mode: priceMode, 
            quantity, 
            unitPrice, 
            totalPrice, 
            currency: product.currency 
        });
    } catch (error) {
        console.error('Error calculating price:', error);
        res.status(500).json({ error: 'Failed to calculate price' });
    }
});

const PORT = process.env.PORT || 49153;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
    console.log('Press Ctrl+C to stop');
});