// Cloudflare Pages Function - Google Sheets Integration
// Endpoint: /api/sheets
// Bu dosya Google Sheets API ile gerçek veri çekecek

export async function onRequest(context) {
  const { env } = context;
  
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
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Google Sheets API v4 endpoint
    const sheetName = 'Sheet1'; // veya 'Products' vb.
    const range = `${sheetName}!A1:Z1000`; // İlk 1000 satırı çek
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify({
        error: 'Google Sheets API error',
        details: errorData
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const data = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      data: data.values || [],
      spreadsheetId: spreadsheetId,
      range: range
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
