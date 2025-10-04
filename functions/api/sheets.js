// Cloudflare Pages Function - Google Sheets Integration
// Endpoint: /api/sheets
// Bu dosya Google Sheets API ile gerçek veri çekecek

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
  
  // Get environment variables
  const spreadsheetId = env.SPREADSHEET_ID;
  const apiKey = typeof env.GOOGLE_API_KEY === 'string' ? env.GOOGLE_API_KEY.trim() : String(env.GOOGLE_API_KEY || '').trim();
  
  // Check if API key is configured
  if (!apiKey || apiKey === 'your-google-api-key-here') {
    return new Response(JSON.stringify({
      error: 'API key not configured',
      message: 'Please set GOOGLE_API_KEY in Cloudflare environment variables'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }

  // Get query parameters
  const url = new URL(request.url);
  const sheetName = url.searchParams.get('sheet') || 'Products'; // Default to Products
  const maxRows = url.searchParams.get('maxRows') || '1000';

  try {
    // Google Sheets API v4 endpoint
    const range = `${sheetName}!A1:Z${maxRows}`; // Configurable rows
    
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify({
        error: 'Google Sheets API error',
        details: errorData,
        sheetName: sheetName
      }), {
        status: response.status,
        headers: corsHeaders
      });
    }
    
    const data = await response.json();
    const rows = data.values || [];
    
    // If we have data, separate headers from data rows
    let headers = [];
    let dataRows = [];
    
    if (rows.length > 0) {
      headers = rows[0]; // First row as headers
      dataRows = rows.slice(1); // Rest as data
    }
    
    return new Response(JSON.stringify({
      success: true,
      sheetName: sheetName,
      headers: headers,
      data: dataRows,
      rawData: rows,
      spreadsheetId: spreadsheetId,
      range: range,
      totalRows: rows.length
    }), {
      status: 200,
      headers: corsHeaders
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
      sheetName: sheetName || 'unknown'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
