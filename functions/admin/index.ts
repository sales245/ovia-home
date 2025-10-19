export type PagesFunction = (context: any) => Promise<Response> | Response;

export const onRequest: PagesFunction = async (context) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Ovia Home</title>
    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
            line-height: 1.5;
        }
        form {
            display: grid;
            gap: 1rem;
            max-width: 500px;
            margin-bottom: 2rem;
            padding: 1.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
        }
        .form-group {
            display: grid;
            gap: 0.5rem;
        }
        input[type="text"],
        input[type="number"] {
            padding: 0.5rem;
            border: 1px solid #cbd5e1;
            border-radius: 0.25rem;
            width: 100%;
        }
        button {
            background: #2563eb;
            color: white;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 0.25rem;
            cursor: pointer;
        }
        button:hover {
            background: #1d4ed8;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2rem;
        }
        th, td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        th {
            background: #f8fafc;
            font-weight: 600;
        }
        .checkbox-group {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }
        .checkbox-group input[type="checkbox"] {
            width: auto;
        }
    </style>
</head>
<body>
    <h1>Ovia Home Admin</h1>
    
    <form hx-post="/api/products" hx-target="#rows" hx-swap="afterbegin">
        <div class="form-group">
            <label for="sku">SKU</label>
            <input type="text" id="sku" name="sku" required>
        </div>
        
        <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" name="title" required>
        </div>
        
        <div class="form-group">
            <label for="price_cents">Price (cents)</label>
            <input type="number" id="price_cents" name="price_cents" required min="0">
        </div>
        
        <div class="form-group">
            <label for="stock">Stock</label>
            <input type="number" id="stock" name="stock" required min="0">
        </div>
        
        <div class="checkbox-group">
            <input type="checkbox" id="is_wholesale" name="is_wholesale">
            <label for="is_wholesale">Wholesale Product</label>
        </div>
        
        <button type="submit">Add Product</button>
    </form>

    <table>
        <thead>
            <tr>
                <th>SKU</th>
                <th>Title</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Wholesale</th>
                <th>Created</th>
            </tr>
        </thead>
        <tbody id="rows" hx-get="/api/products" hx-trigger="load">
            <tr>
                <td colspan="6">Loading products...</td>
            </tr>
        </tbody>
    </table>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=utf-8'
    }
  });
};
