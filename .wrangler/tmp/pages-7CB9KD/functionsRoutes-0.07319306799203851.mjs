import { onRequestGet as __admin_products_ts_onRequestGet } from "/app/functions/admin/products.ts"
import { onRequest as __api_addresses_js_onRequest } from "/app/functions/api/addresses.js"
import { onRequest as __api_auth_js_onRequest } from "/app/functions/api/auth.js"
import { onRequest as __api_cart_js_onRequest } from "/app/functions/api/cart.js"
import { onRequest as __api_categories_js_onRequest } from "/app/functions/api/categories.js"
import { onRequest as __api_customers_js_onRequest } from "/app/functions/api/customers.js"
import { onRequest as __api_inquiries_js_onRequest } from "/app/functions/api/inquiries.js"
import { onRequest as __api_orders_js_onRequest } from "/app/functions/api/orders.js"
import { onRequest as __api_paypal_js_onRequest } from "/app/functions/api/paypal.js"
import { onRequest as __api_products_ts_onRequest } from "/app/functions/api/products.ts"
import { onRequest as __api_quotes_js_onRequest } from "/app/functions/api/quotes.js"
import { onRequest as __api_settings_js_onRequest } from "/app/functions/api/settings.js"
import { onRequest as __api_sheets_js_onRequest } from "/app/functions/api/sheets.js"
import { onRequest as __api_stats_js_onRequest } from "/app/functions/api/stats.js"
import { onRequest as __api_test_db_js_onRequest } from "/app/functions/api/test-db.js"
import { onRequest as ___middlewares_ts_onRequest } from "/app/functions/_middlewares.ts"
import { onRequest as __admin_index_ts_onRequest } from "/app/functions/admin/index.ts"
import { onRequest as ___middleware_js_onRequest } from "/app/functions/_middleware.js"

export const routes = [
    {
      routePath: "/admin/products",
      mountPath: "/admin",
      method: "GET",
      middlewares: [],
      modules: [__admin_products_ts_onRequestGet],
    },
  {
      routePath: "/api/addresses",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_addresses_js_onRequest],
    },
  {
      routePath: "/api/auth",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_auth_js_onRequest],
    },
  {
      routePath: "/api/cart",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_cart_js_onRequest],
    },
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
      routePath: "/api/paypal",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_paypal_js_onRequest],
    },
  {
      routePath: "/api/products",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_products_ts_onRequest],
    },
  {
      routePath: "/api/quotes",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_quotes_js_onRequest],
    },
  {
      routePath: "/api/settings",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_settings_js_onRequest],
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
      routePath: "/api/test-db",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_test_db_js_onRequest],
    },
  {
      routePath: "/_middlewares",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [___middlewares_ts_onRequest],
    },
  {
      routePath: "/admin",
      mountPath: "/admin",
      method: "",
      middlewares: [],
      modules: [__admin_index_ts_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]