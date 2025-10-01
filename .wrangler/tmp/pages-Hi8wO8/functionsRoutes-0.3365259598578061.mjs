import { onRequest as __api_categories_js_onRequest } from "/workspaces/ovia-home/functions/api/categories.js"
import { onRequest as __api_customers_js_onRequest } from "/workspaces/ovia-home/functions/api/customers.js"
import { onRequest as __api_inquiries_js_onRequest } from "/workspaces/ovia-home/functions/api/inquiries.js"
import { onRequest as __api_orders_js_onRequest } from "/workspaces/ovia-home/functions/api/orders.js"
import { onRequest as __api_products_js_onRequest } from "/workspaces/ovia-home/functions/api/products.js"
import { onRequest as __api_quotes_js_onRequest } from "/workspaces/ovia-home/functions/api/quotes.js"
import { onRequest as __api_sheets_js_onRequest } from "/workspaces/ovia-home/functions/api/sheets.js"
import { onRequest as __api_stats_js_onRequest } from "/workspaces/ovia-home/functions/api/stats.js"
import { onRequest as ___middleware_js_onRequest } from "/workspaces/ovia-home/functions/_middleware.js"

export const routes = [
    {
      routePath: "/api/categories",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_categories_js_onRequest],
    },
  {
      routePath: "/api/customers",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_customers_js_onRequest],
    },
  {
      routePath: "/api/inquiries",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_inquiries_js_onRequest],
    },
  {
      routePath: "/api/orders",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_orders_js_onRequest],
    },
  {
      routePath: "/api/products",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_products_js_onRequest],
    },
  {
      routePath: "/api/quotes",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_quotes_js_onRequest],
    },
  {
      routePath: "/api/sheets",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_sheets_js_onRequest],
    },
  {
      routePath: "/api/stats",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_stats_js_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]