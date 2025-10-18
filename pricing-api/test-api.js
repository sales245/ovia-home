import fetch from 'node-fetch';

// Test the health endpoint
console.log('Testing health endpoint...');
try {
    const health = await fetch('http://127.0.0.1:49153/health');
    console.log('Health response:', await health.json());
} catch (error) {
    console.error('Health check error:', error);
}

// Create a test product
console.log('\nCreating test product...');
try {
    const createProduct = await fetch('http://127.0.0.1:49153/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            slug: 'product-1',
            name: 'Test Product',
            currency: 'TRY',
            tiersRetail: [
                { min: 1, price: 100 },
                { min: 10, price: 90 },
                { min: 100, price: 80 }
            ],
            tiersWholesale: [
                { min: 1, price: 80 },
                { min: 10, price: 70 },
                { min: 100, price: 60 }
            ]
        })
    });
    console.log('Create product response:', await createProduct.json());
} catch (error) {
    console.error('Create product error:', error);
}

// Get the product
console.log('\nGetting product...');
try {
    const getProduct = await fetch('http://127.0.0.1:49153/api/products/product-1');
    console.log('Get product response:', await getProduct.json());
} catch (error) {
    console.error('Get product error:', error);
}

// Calculate price for 15 units retail
console.log('\nCalculating price...');
try {
    const getPrice = await fetch('http://127.0.0.1:49153/api/price?slug=product-1&qty=15&mode=retail');
    console.log('Get price response:', await getPrice.json());
} catch (error) {
    console.error('Get price error:', error);
}