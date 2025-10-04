// Cloudflare Pages Function - Products API
// Bu dosya otomatik olarak /api/products endpoint'i oluşturur

export async function onRequest(context) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // OPTIONS request için (preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const spreadsheetId = env.SPREADSHEET_ID;
    const apiKey = typeof env.GOOGLE_API_KEY === 'string' ? env.GOOGLE_API_KEY.trim() : String(env.GOOGLE_API_KEY || '').trim();
    
    // Check if API key is configured
    if (!apiKey || apiKey === 'your-google-api-key-here') {
      // Fallback to mock data if API key not configured
      const mockProducts = [
        {
          id: "1",
          category: "bathrobes",
          image: "https://example.com/bathrobe.jpg",
          name: {
            en: "Premium Cotton Bathrobe",
            tr: "Premium Pamuklu Bornoz"
          },
          features: {
            en: ["100% Turkish Cotton", "Ultra Soft", "Quick Dry"],
            tr: ["100% Türk Pamuğu", "Ekstra Yumuşak", "Hızlı Kuruyan"]
          },
          badges: ["premium", "organic"],
          retail_price: 99.99,
          wholesale_price: 79.99,
          min_wholesale_quantity: 50,
          in_stock: true,
          stock_quantity: 150
        },
        {
          id: "2",
          category: "towels",
          image: "https://example.com/towel.jpg",
          name: {
            en: "Turkish Towel Set",
            tr: "Türk Havlu Seti"
          },
          features: {
            en: ["600 GSM", "Highly Absorbent", "Durable"],
            tr: ["600 GSM", "Yüksek Emici", "Dayanıklı"]
          },
          badges: ["bestseller"],
          retail_price: 49.99,
          wholesale_price: 39.99,
          min_wholesale_quantity: 100,
          in_stock: true,
          stock_quantity: 300
        }
      ];

      if (request.method === 'GET') {
        return new Response(JSON.stringify(mockProducts), {
          headers: corsHeaders,
          status: 200
        });
      }
    }

    // GET request - Fetch from Google Sheets
    if (request.method === 'GET') {
      const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Products!A2:O1000?key=${apiKey}`;
      
      const sheetsResponse = await fetch(sheetsUrl);
      
      if (!sheetsResponse.ok) {
        throw new Error('Failed to fetch from Google Sheets');
      }
      
      const sheetsData = await sheetsResponse.json();
      const rows = sheetsData.values || [];
      
      // Convert rows to product objects
      // Expected columns: A=id, B=category, C=name_en, D=name_tr, E=name_de, F=image, 
      // G=features_en, H=features_tr, I=badges, J=retail_price, K=wholesale_price, 
      // L=min_wholesale_quantity, M=in_stock, N=created_at, O=updated_at
      const products = rows.map(row => {
        try {
          return {
            id: row[0] || '',
            category: row[1] || '',
            name: {
              en: row[2] || '',
              tr: row[3] || '',
              de: row[4] || ''
            },
            image: row[5] || '',
            features: {
              en: row[6] ? JSON.parse(row[6]) : [],
              tr: row[7] ? JSON.parse(row[7]) : []
            },
            badges: row[8] ? row[8].split(',').map(b => b.trim()) : [],
            retail_price: parseFloat(row[9]) || 0,
            wholesale_price: parseFloat(row[10]) || 0,
            min_wholesale_quantity: parseInt(row[11]) || 1,
            in_stock: row[12] === 'TRUE' || row[12] === 'true',
            created_at: row[13] || '',
            updated_at: row[14] || ''
          };
        } catch (e) {
          // Return basic object if parsing fails
          return {
            id: row[0] || '',
            category: row[1] || '',
            name: { en: row[2] || '', tr: row[3] || '' },
            image: row[5] || '',
            features: { en: [], tr: [] },
            badges: [],
            retail_price: 0,
            wholesale_price: 0,
            min_wholesale_quantity: 1,
            in_stock: false
          };
        }
      });

      return new Response(JSON.stringify(products), {
        headers: corsHeaders,
        status: 200
      });
    }

    // POST request - Add new product to Google Sheets
    if (request.method === 'POST') {
      const newProduct = await request.json();
      
      // Generate ID (use timestamp or UUID)
      const productId = Date.now().toString();
      const currentTime = new Date().toISOString();
      
      // Prepare row data
      const rowData = [
        productId,
        newProduct.category || '',
        newProduct.name?.en || '',
        newProduct.name?.tr || '',
        newProduct.name?.de || '',
        newProduct.image || '',
        JSON.stringify(newProduct.features?.en || []),
        JSON.stringify(newProduct.features?.tr || []),
        (newProduct.badges || []).join(', '),
        newProduct.retail_price || 0,
        newProduct.wholesale_price || 0,
        newProduct.min_wholesale_quantity || 1,
        newProduct.in_stock ? 'TRUE' : 'FALSE',
        currentTime,
        currentTime
      ];
      
      // Append to Google Sheets
      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Products!A:O:append?valueInputOption=USER_ENTERED&key=${apiKey}`;
      
      const appendResponse = await fetch(appendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          values: [rowData]
        })
      });
      
      if (!appendResponse.ok) {
        throw new Error('Failed to add product to Google Sheets');
      }
      
      const appendResult = await appendResponse.json();
      
      return new Response(JSON.stringify({
        success: true,
        id: productId,
        message: 'Product added successfully',
        sheetsResponse: appendResult
      }), {
        headers: corsHeaders,
        status: 200
      });
    }

    // PUT request - Update existing product (requires row number or search by ID)
    if (request.method === 'PUT') {
      const url = new URL(request.url);
      const productId = url.searchParams.get('id');
      
      if (!productId) {
        return new Response(JSON.stringify({ error: 'Product ID required' }), {
          headers: corsHeaders,
          status: 400
        });
      }
      
      const updatedProduct = await request.json();
      const currentTime = new Date().toISOString();
      
      // First, find the row number by searching for the product ID
      const searchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Products!A:A?key=${apiKey}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      const idColumn = searchData.values || [];
      
      let rowNumber = -1;
      for (let i = 1; i < idColumn.length; i++) { // Start from 1 to skip header
        if (idColumn[i][0] === productId) {
          rowNumber = i + 1; // Google Sheets is 1-indexed
          break;
        }
      }
      
      if (rowNumber === -1) {
        return new Response(JSON.stringify({ error: 'Product not found' }), {
          headers: corsHeaders,
          status: 404
        });
      }
      
      // Prepare updated row data
      const rowData = [
        productId,
        updatedProduct.category || '',
        updatedProduct.name?.en || '',
        updatedProduct.name?.tr || '',
        updatedProduct.name?.de || '',
        updatedProduct.image || '',
        JSON.stringify(updatedProduct.features?.en || []),
        JSON.stringify(updatedProduct.features?.tr || []),
        (updatedProduct.badges || []).join(', '),
        updatedProduct.retail_price || 0,
        updatedProduct.wholesale_price || 0,
        updatedProduct.min_wholesale_quantity || 1,
        updatedProduct.in_stock ? 'TRUE' : 'FALSE',
        idColumn[rowNumber-1][13] || currentTime, // Keep original created_at
        currentTime // Update updated_at
      ];
      
      // Update the specific row
      const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Products!A${rowNumber}:O${rowNumber}?valueInputOption=USER_ENTERED&key=${apiKey}`;
      
      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          values: [rowData]
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update product in Google Sheets');
      }
      
      return new Response(JSON.stringify({
        success: true,
        id: productId,
        message: 'Product updated successfully'
      }), {
        headers: corsHeaders,
        status: 200
      });
    }

    // DELETE request - Delete product (clear row data but keep structure)
    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      const productId = url.searchParams.get('id');
      
      if (!productId) {
        return new Response(JSON.stringify({ error: 'Product ID required' }), {
          headers: corsHeaders,
          status: 400
        });
      }
      
      // Find the row number
      const searchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Products!A:A?key=${apiKey}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      const idColumn = searchData.values || [];
      
      let rowNumber = -1;
      for (let i = 1; i < idColumn.length; i++) {
        if (idColumn[i][0] === productId) {
          rowNumber = i + 1;
          break;
        }
      }
      
      if (rowNumber === -1) {
        return new Response(JSON.stringify({ error: 'Product not found' }), {
          headers: corsHeaders,
          status: 404
        });
      }
      
      // Clear the row (set empty values)
      const emptyRow = Array(15).fill(''); // 15 columns A-O
      
      const deleteUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Products!A${rowNumber}:O${rowNumber}?valueInputOption=USER_ENTERED&key=${apiKey}`;
      
      const deleteResponse = await fetch(deleteUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          values: [emptyRow]
        })
      });
      
      if (!deleteResponse.ok) {
        throw new Error('Failed to delete product from Google Sheets');
      }
      
      return new Response(JSON.stringify({
        success: true,
        id: productId,
        message: 'Product deleted successfully'
      }), {
        headers: corsHeaders,
        status: 200
      });
    }

    // Diğer metodlar için 405
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: corsHeaders,
      status: 405
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: corsHeaders,
      status: 500
    });
  }
}
