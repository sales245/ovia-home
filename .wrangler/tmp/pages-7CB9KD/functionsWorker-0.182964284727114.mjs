var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../.wrangler/tmp/bundle-9xHx2k/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// _middlewares.ts
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};
function basicAuth(request, env) {
  const auth = request.headers.get("Authorization");
  const user = env.ADMIN_USER || "admin";
  const pass = env.ADMIN_PASS || "change-me";
  if (!auth || !auth.startsWith("Basic ")) {
    return {
      ok: false,
      response: new Response("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Area"',
          ...corsHeaders
        }
      })
    };
  }
  try {
    const [providedUser, providedPass] = atob(auth.slice(6)).split(":");
    if (providedUser === user && providedPass === pass) {
      return { ok: true };
    }
    return {
      ok: false,
      response: new Response("Invalid credentials", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Area"',
          ...corsHeaders
        }
      })
    };
  } catch {
    return {
      ok: false,
      response: new Response("Invalid authorization header", {
        status: 400,
        headers: corsHeaders
      })
    };
  }
}
__name(basicAuth, "basicAuth");
var onRequest = /* @__PURE__ */ __name(async (context) => {
  const url = new URL(context.request.url);
  if (!url.pathname.startsWith("/admin")) {
    return context.next();
  }
  const auth = context.request.headers.get("Authorization");
  const user = context.env.ADMIN_USER;
  const pass = context.env.ADMIN_PASS;
  if (!user || !pass) {
    return new Response("Admin credentials not configured", { status: 500 });
  }
  if (!auth || !auth.startsWith("Basic ")) {
    return new Response("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"'
      }
    });
  }
  try {
    const [providedUser, providedPass] = atob(auth.slice(6)).split(":");
    if (providedUser === user && providedPass === pass) {
      return context.next();
    }
    return new Response("Invalid credentials", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"'
      }
    });
  } catch {
    return new Response("Invalid authorization header", { status: 400 });
  }
}, "onRequest");

// admin/products.ts
async function onRequestGet(context) {
  const { request, env } = context;
  const auth = basicAuth(request, env);
  if (!auth.ok) return auth.response;
  const DB = env.DB;
  if (!DB) return new Response("DB not configured", { status: 500 });
  const res = await DB.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
  const rows = res.results || [];
  const itemsHtml = rows.map((r) => `
    <div class="product">
      <h3>${escapeHtml(r.name_en)}</h3>
      <div>Category: ${escapeHtml(r.category)}</div>
      <div>Price: ${r.retail_price}</div>
    </div>
  `).join("\n");
  return new Response(`<div id="products-list">${itemsHtml}</div>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
__name(onRequestGet, "onRequestGet");
function escapeHtml(s) {
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
__name(escapeHtml, "escapeHtml");

// api/addresses.js
var addresses = /* @__PURE__ */ new Map();
function getUserIdFromRequest(request) {
  const cookies = request.headers.get("Cookie") || "";
  let token = cookies.split(";").find((c) => c.trim().startsWith("auth_token="))?.split("=")[1];
  if (!token) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  if (!token) {
    return null;
  }
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload.userId;
  } catch {
    return null;
  }
}
__name(getUserIdFromRequest, "getUserIdFromRequest");
async function onRequest2(context) {
  const { request } = context;
  const method = request.method;
  const url = new URL(request.url);
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return new Response(JSON.stringify({
      error: "Not authenticated",
      message: "Please log in to manage addresses"
    }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  try {
    if (method === "GET") {
      const userAddresses = addresses.get(userId) || [];
      return new Response(JSON.stringify(userAddresses), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (method === "POST") {
      const data = await request.json();
      const required = ["title", "fullName", "phone", "address", "city", "country"];
      for (const field of required) {
        if (!data[field]) {
          return new Response(JSON.stringify({
            error: "Validation error",
            message: `${field} is required`
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }
      const userAddresses = addresses.get(userId) || [];
      const newAddress = {
        id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: data.title,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state || "",
        postalCode: data.postalCode || "",
        country: data.country,
        isDefault: userAddresses.length === 0 ? true : data.isDefault || false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      if (newAddress.isDefault) {
        userAddresses.forEach((addr) => addr.isDefault = false);
      }
      userAddresses.push(newAddress);
      addresses.set(userId, userAddresses);
      return new Response(JSON.stringify(newAddress), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (method === "PUT") {
      const data = await request.json();
      if (!data.id) {
        return new Response(JSON.stringify({
          error: "Validation error",
          message: "Address ID is required"
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const userAddresses = addresses.get(userId) || [];
      const addressIndex = userAddresses.findIndex((addr) => addr.id === data.id);
      if (addressIndex === -1) {
        return new Response(JSON.stringify({
          error: "Address not found"
        }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const updatedAddress = {
        ...userAddresses[addressIndex],
        ...data,
        id: userAddresses[addressIndex].id,
        // Preserve ID
        createdAt: userAddresses[addressIndex].createdAt,
        // Preserve creation date
        updatedAt: Date.now()
      };
      if (updatedAddress.isDefault) {
        userAddresses.forEach((addr) => {
          if (addr.id !== updatedAddress.id) {
            addr.isDefault = false;
          }
        });
      }
      userAddresses[addressIndex] = updatedAddress;
      addresses.set(userId, userAddresses);
      return new Response(JSON.stringify(updatedAddress), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (method === "DELETE") {
      const addressId = url.searchParams.get("id");
      if (!addressId) {
        return new Response(JSON.stringify({
          error: "Validation error",
          message: "Address ID is required"
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const userAddresses = addresses.get(userId) || [];
      const addressIndex = userAddresses.findIndex((addr) => addr.id === addressId);
      if (addressIndex === -1) {
        return new Response(JSON.stringify({
          error: "Address not found"
        }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const wasDefault = userAddresses[addressIndex].isDefault;
      userAddresses.splice(addressIndex, 1);
      if (wasDefault && userAddresses.length > 0) {
        userAddresses[0].isDefault = true;
      }
      addresses.set(userId, userAddresses);
      return new Response(JSON.stringify({
        message: "Address deleted successfully"
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Addresses API error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(onRequest2, "onRequest");

// api/auth.js
var users = /* @__PURE__ */ new Map();
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, hash) {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}
__name(verifyPassword, "verifyPassword");
function generateToken(userId) {
  const payload = {
    userId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1e3
    // 7 days
  };
  return btoa(JSON.stringify(payload));
}
__name(generateToken, "generateToken");
function verifyToken(token) {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
__name(verifyToken, "verifyToken");
async function onRequest3(context) {
  const { request } = context;
  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname;
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (method === "POST" && path.includes("/register")) {
      const data = await request.json();
      if (!data.email || !data.password || !data.name) {
        return new Response(JSON.stringify({
          error: "Validation error",
          message: "Email, password, and name are required"
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      for (const [, user] of users) {
        if (user.email === data.email) {
          return new Response(JSON.stringify({
            error: "User already exists",
            message: "An account with this email already exists"
          }), {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const passwordHash = await hashPassword(data.password);
      const newUser = {
        id: userId,
        email: data.email,
        name: data.name,
        company: data.company || "",
        phone: data.phone || "",
        country: data.country || "",
        taxNumber: data.taxNumber || "",
        authProvider: "email",
        passwordHash,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      users.set(userId, newUser);
      const token = generateToken(userId);
      const { passwordHash: _, ...userWithoutPassword } = newUser;
      return new Response(JSON.stringify({
        user: userWithoutPassword,
        token
      }), {
        status: 201,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Set-Cookie": `auth_token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`
        }
      });
    }
    if (method === "POST" && path.includes("/login")) {
      const data = await request.json();
      if (!data.email || !data.password) {
        return new Response(JSON.stringify({
          error: "Validation error",
          message: "Email and password are required"
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      let foundUser = null;
      for (const [, user] of users) {
        if (user.email === data.email && user.authProvider === "email") {
          foundUser = user;
          break;
        }
      }
      if (!foundUser) {
        return new Response(JSON.stringify({
          error: "Invalid credentials",
          message: "Email or password is incorrect"
        }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const isValid = await verifyPassword(data.password, foundUser.passwordHash);
      if (!isValid) {
        return new Response(JSON.stringify({
          error: "Invalid credentials",
          message: "Email or password is incorrect"
        }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const token = generateToken(foundUser.id);
      const { passwordHash: _, ...userWithoutPassword } = foundUser;
      return new Response(JSON.stringify({
        user: userWithoutPassword,
        token
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Set-Cookie": `auth_token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`
        }
      });
    }
    if (method === "POST" && path.includes("/google")) {
      const data = await request.json();
      if (!data.credential) {
        return new Response(JSON.stringify({
          error: "Validation error",
          message: "Google credential is required"
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      try {
        const parts = data.credential.split(".");
        const payload = JSON.parse(atob(parts[1]));
        const googleEmail = payload.email;
        const googleName = payload.name;
        const googlePicture = payload.picture;
        const googleId = payload.sub;
        let foundUser = null;
        for (const [, user] of users) {
          if (user.email === googleEmail && user.authProvider === "google") {
            foundUser = user;
            break;
          }
        }
        if (!foundUser) {
          const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          foundUser = {
            id: userId,
            email: googleEmail,
            name: googleName,
            picture: googlePicture,
            googleId,
            authProvider: "google",
            company: "",
            phone: "",
            country: "",
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          users.set(userId, foundUser);
        }
        const token = generateToken(foundUser.id);
        return new Response(JSON.stringify({
          user: foundUser,
          token
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Set-Cookie": `auth_token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: "Invalid Google credential",
          message: error.message
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    if (method === "GET" && path.includes("/me")) {
      const cookies = request.headers.get("Cookie") || "";
      let token = cookies.split(";").find((c) => c.trim().startsWith("auth_token="))?.split("=")[1];
      if (!token) {
        const authHeader = request.headers.get("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }
      if (!token) {
        return new Response(JSON.stringify({
          error: "Not authenticated",
          message: "No authentication token provided"
        }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const payload = verifyToken(token);
      if (!payload) {
        return new Response(JSON.stringify({
          error: "Invalid token",
          message: "Token is invalid or expired"
        }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const user = users.get(payload.userId);
      if (!user) {
        return new Response(JSON.stringify({
          error: "User not found"
        }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const { passwordHash: _, ...userWithoutPassword } = user;
      return new Response(JSON.stringify({
        user: userWithoutPassword
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (method === "POST" && path.includes("/logout")) {
      return new Response(JSON.stringify({
        message: "Logged out successfully"
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Set-Cookie": "auth_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
        }
      });
    }
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Auth API error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(onRequest3, "onRequest");

// api/cart.js
var carts = /* @__PURE__ */ new Map();
function cleanupOldCarts() {
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1e3;
  for (const [sessionId, cart] of carts.entries()) {
    if (now - cart.updatedAt > dayInMs) {
      carts.delete(sessionId);
    }
  }
}
__name(cleanupOldCarts, "cleanupOldCarts");
async function onRequest4(context) {
  const { request } = context;
  const method = request.method;
  const url = new URL(request.url);
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (Math.random() < 0.1) {
    cleanupOldCarts();
  }
  try {
    const cookies = request.headers.get("Cookie") || "";
    let sessionId = cookies.split(";").find((c) => c.trim().startsWith("cart_session="))?.split("=")[1];
    if (!sessionId) {
      sessionId = url.searchParams.get("sessionId");
    }
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    if (method === "GET") {
      const cart = carts.get(sessionId) || { items: [], updatedAt: Date.now() };
      const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      return new Response(JSON.stringify({
        sessionId,
        items: cart.items,
        subtotal,
        itemCount,
        updatedAt: cart.updatedAt
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Set-Cookie": `cart_session=${sessionId}; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Lax`
        }
      });
    }
    if (method === "POST") {
      const data = await request.json();
      if (!data.productId || !data.name || !data.price || !data.quantity) {
        return new Response(JSON.stringify({
          error: "Validation error",
          message: "productId, name, price, and quantity are required"
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const cart = carts.get(sessionId) || { items: [], updatedAt: Date.now() };
      const existingIndex = cart.items.findIndex((item) => item.productId === data.productId);
      if (existingIndex >= 0) {
        cart.items[existingIndex].quantity += data.quantity;
      } else {
        cart.items.push({
          productId: data.productId,
          name: data.name,
          image: data.image || "",
          price: data.price,
          quantity: data.quantity,
          category: data.category || "",
          addedAt: Date.now()
        });
      }
      cart.updatedAt = Date.now();
      carts.set(sessionId, cart);
      const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      return new Response(JSON.stringify({
        sessionId,
        items: cart.items,
        subtotal,
        itemCount,
        message: "Item added to cart"
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Set-Cookie": `cart_session=${sessionId}; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Lax`
        }
      });
    }
    if (method === "PUT") {
      const data = await request.json();
      if (!data.productId || data.quantity === void 0) {
        return new Response(JSON.stringify({
          error: "Validation error",
          message: "productId and quantity are required"
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const cart = carts.get(sessionId);
      if (!cart) {
        return new Response(JSON.stringify({
          error: "Cart not found"
        }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const itemIndex = cart.items.findIndex((item) => item.productId === data.productId);
      if (itemIndex === -1) {
        return new Response(JSON.stringify({
          error: "Item not found in cart"
        }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (data.quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = data.quantity;
      }
      cart.updatedAt = Date.now();
      carts.set(sessionId, cart);
      const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      return new Response(JSON.stringify({
        sessionId,
        items: cart.items,
        subtotal,
        itemCount,
        message: "Cart updated"
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (method === "DELETE") {
      const productId = url.searchParams.get("productId");
      if (productId) {
        const cart = carts.get(sessionId);
        if (!cart) {
          return new Response(JSON.stringify({
            error: "Cart not found"
          }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        cart.items = cart.items.filter((item) => item.productId !== productId);
        cart.updatedAt = Date.now();
        carts.set(sessionId, cart);
        const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        return new Response(JSON.stringify({
          sessionId,
          items: cart.items,
          subtotal,
          itemCount,
          message: "Item removed from cart"
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } else {
        carts.delete(sessionId);
        return new Response(JSON.stringify({
          sessionId,
          items: [],
          subtotal: 0,
          itemCount: 0,
          message: "Cart cleared"
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Cart API error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(onRequest4, "onRequest");

// api/categories.js
async function onRequest5(context) {
  const { request, env } = context;
  const corsHeaders2 = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders2 });
  }
  try {
    const { DB } = env;
    if (!DB) {
      return new Response(JSON.stringify({
        error: "Database not configured",
        message: "D1 database binding not found"
      }), {
        status: 500,
        headers: corsHeaders2
      });
    }
    switch (request.method) {
      case "GET":
        const { results } = await DB.prepare(
          "SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order, name_en"
        ).all();
        const categories = results.map((category) => ({
          id: category.id.toString(),
          name: {
            en: category.name_en,
            tr: category.name_tr
          },
          slug: category.slug,
          image: category.image || "https://via.placeholder.com/200x150",
          sort_order: category.sort_order,
          is_active: Boolean(category.is_active)
        }));
        return new Response(JSON.stringify(categories), {
          status: 200,
          headers: corsHeaders2
        });
      case "POST":
        const categoryData = await request.json();
        const insertResult = await DB.prepare(`
          INSERT INTO categories 
          (name_en, name_tr, slug, image, sort_order, is_active)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          categoryData.name.en,
          categoryData.name.tr,
          categoryData.slug,
          categoryData.image || "https://via.placeholder.com/200x150",
          categoryData.sort_order || 0,
          categoryData.is_active ? 1 : 0
        ).run();
        return new Response(JSON.stringify({
          success: true,
          message: "Category created successfully",
          id: insertResult.meta.last_row_id
        }), {
          status: 201,
          headers: corsHeaders2
        });
      default:
        return new Response(JSON.stringify({
          error: "Method not allowed",
          message: `${request.method} method is not supported`
        }), {
          status: 405,
          headers: corsHeaders2
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders2
    });
  }
}
__name(onRequest5, "onRequest");

// api/customers.js
async function onRequest6(context) {
  const { request } = context;
  const method = request.method;
  if (method === "GET") {
    const customers = [
      {
        id: "1",
        name: "Mehmet Demir",
        company: "L\xFCks Otel Zinciri",
        email: "mehmet@luksotel.com",
        phone: "+90 532 444 5566",
        country: "Turkey",
        total_orders: 5,
        total_spent: 45e3,
        last_order_date: "2025-09-15",
        created_at: "2025-01-10",
        status: "active"
        // active, inactive, vip
      },
      {
        id: "2",
        name: "Hotel Manager",
        company: "Grand Hotel",
        email: "info@grandhotel.com",
        phone: "+49 176 123 4567",
        country: "Germany",
        total_orders: 3,
        total_spent: 28e3,
        last_order_date: "2025-09-20",
        created_at: "2025-03-22",
        status: "active"
      }
    ];
    return new Response(JSON.stringify(customers), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (method === "POST") {
    try {
      const data = await request.json();
      const required = ["name", "email"];
      for (const field of required) {
        if (!data[field]) {
          return new Response(JSON.stringify({
            error: "Validation error",
            message: `${field} is required`
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
      const newCustomer = {
        id: String(Date.now()),
        ...data,
        total_orders: 0,
        total_spent: 0,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        status: "active"
      };
      return new Response(JSON.stringify(newCustomer), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: "Internal server error",
        message: error.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  return new Response("Method not allowed", { status: 405 });
}
__name(onRequest6, "onRequest");

// api/inquiries.js
async function onRequest7(context) {
  const { request, env } = context;
  const corsHeaders2 = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders2 });
  }
  const { DB } = env;
  if (!DB) {
    return new Response(JSON.stringify({
      error: "Database not configured",
      message: "D1 database binding not found"
    }), {
      status: 500,
      headers: corsHeaders2
    });
  }
  try {
    if (request.method === "POST") {
      const inquiry = await request.json();
      if (!inquiry.name || !inquiry.email || !inquiry.message) {
        return new Response(JSON.stringify({
          error: "Missing required fields: name, email, message"
        }), {
          headers: corsHeaders2,
          status: 422
        });
      }
      const result = await DB.prepare(`
        INSERT INTO inquiries (name, company, email, phone, country, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        inquiry.name,
        inquiry.company || null,
        inquiry.email,
        inquiry.phone || null,
        inquiry.country || null,
        inquiry.message
      ).run();
      const savedInquiry = {
        id: result.meta.last_row_id.toString(),
        ...inquiry,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      return new Response(JSON.stringify(savedInquiry), {
        headers: corsHeaders2,
        status: 201
      });
    }
    if (request.method === "GET") {
      const { results } = await DB.prepare(
        "SELECT * FROM inquiries ORDER BY created_at DESC"
      ).all();
      const inquiries = results.map((row) => ({
        id: row.id.toString(),
        name: row.name,
        company: row.company,
        email: row.email,
        phone: row.phone,
        country: row.country,
        message: row.message,
        created_at: row.created_at
      }));
      return new Response(JSON.stringify(inquiries), {
        headers: corsHeaders2,
        status: 200
      });
    }
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: corsHeaders2,
      status: 405
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message
    }), {
      headers: corsHeaders2,
      status: 500
    });
  }
}
__name(onRequest7, "onRequest");

// api/orders.js
async function onRequest8(context) {
  const { request } = context;
  const method = request.method;
  if (method === "GET") {
    const orders = [
      {
        id: "1",
        order_number: "ORD-2025-001",
        customer_id: "1",
        customer_name: "Mehmet Demir",
        company: "L\xFCks Otel Zinciri",
        items: [
          {
            product_id: "1",
            product_name: "Premium Pamuk Bornoz",
            quantity: 50,
            unit_price: 450,
            total: 22500
          }
        ],
        subtotal: 22500,
        tax: 4050,
        shipping: 500,
        total: 27050,
        status: "completed",
        // pending, processing, shipped, completed, cancelled
        payment_status: "paid",
        // pending, paid, refunded
        shipping_address: {
          street: "Atat\xFCrk Caddesi No:123",
          city: "\u0130stanbul",
          country: "Turkey",
          postal_code: "34000"
        },
        notes: "L\xFCtfen h\u0131zl\u0131 teslimat",
        created_at: "2025-09-15T10:30:00Z",
        updated_at: "2025-09-18T14:20:00Z",
        shipped_at: "2025-09-16T09:00:00Z",
        delivered_at: "2025-09-18T14:20:00Z"
      },
      {
        id: "2",
        order_number: "ORD-2025-002",
        customer_id: "2",
        customer_name: "Hotel Manager",
        company: "Grand Hotel",
        items: [
          {
            product_id: "2",
            product_name: "Premium Havlu Seti",
            quantity: 100,
            unit_price: 280,
            total: 28e3
          }
        ],
        subtotal: 28e3,
        tax: 5040,
        shipping: 800,
        total: 33840,
        status: "processing",
        payment_status: "paid",
        shipping_address: {
          street: "Hauptstra\xDFe 45",
          city: "Berlin",
          country: "Germany",
          postal_code: "10115"
        },
        notes: "",
        created_at: "2025-09-20T15:45:00Z",
        updated_at: "2025-09-21T10:00:00Z",
        shipped_at: null,
        delivered_at: null
      }
    ];
    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (method === "POST") {
    try {
      const data = await request.json();
      const required = ["customer_id", "items"];
      for (const field of required) {
        if (!data[field]) {
          return new Response(JSON.stringify({
            error: "Validation error",
            message: `${field} is required`
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
      const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      const tax = subtotal * 0.18;
      const shipping = data.shipping_cost || 0;
      const total = subtotal + tax + shipping;
      const newOrder = {
        id: String(Date.now()),
        order_number: `ORD-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(Date.now()).slice(-3)}`,
        ...data,
        subtotal,
        tax,
        shipping,
        total,
        status: "pending",
        payment_status: "pending",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString(),
        shipped_at: null,
        delivered_at: null
      };
      return new Response(JSON.stringify(newOrder), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: "Internal server error",
        message: error.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  return new Response("Method not allowed", { status: 405 });
}
__name(onRequest8, "onRequest");

// api/paypal.js
var PAYPAL_API = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com"
};
async function getPayPalConfig() {
  return {
    clientId: process.env.PAYPAL_CLIENT_ID || "demo-client-id",
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || "demo-client-secret",
    environment: "sandbox"
  };
}
__name(getPayPalConfig, "getPayPalConfig");
async function getAccessToken(clientId, clientSecret, environment) {
  const auth = btoa(`${clientId}:${clientSecret}`);
  const apiUrl = PAYPAL_API[environment];
  const response = await fetch(`${apiUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  if (!response.ok) {
    throw new Error("Failed to get PayPal access token");
  }
  const data = await response.json();
  return data.access_token;
}
__name(getAccessToken, "getAccessToken");
async function onRequest9(context) {
  const { request } = context;
  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname;
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (method === "POST" && path.includes("/create-order")) {
      const data = await request.json();
      if (!data.amount || !data.currency) {
        return new Response(JSON.stringify({
          error: "Validation error",
          message: "Amount and currency are required"
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const config = await getPayPalConfig();
      const accessToken = await getAccessToken(config.clientId, config.clientSecret, config.environment);
      const apiUrl = PAYPAL_API[config.environment];
      const orderResponse = await fetch(`${apiUrl}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [{
            amount: {
              currency_code: data.currency || "USD",
              value: data.amount.toFixed(2)
            },
            description: data.description || "Ovia Home Tekstil Order"
          }],
          application_context: {
            return_url: data.returnUrl || `${url.origin}/checkout/success`,
            cancel_url: data.cancelUrl || `${url.origin}/checkout/cancel`,
            brand_name: "Ovia Home",
            shipping_preference: "NO_SHIPPING"
          }
        })
      });
      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.message || "Failed to create PayPal order");
      }
      const order = await orderResponse.json();
      return new Response(JSON.stringify({
        orderId: order.id,
        approvalUrl: order.links.find((link) => link.rel === "approve")?.href
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (method === "POST" && path.includes("/capture-order")) {
      const data = await request.json();
      if (!data.orderId) {
        return new Response(JSON.stringify({
          error: "Validation error",
          message: "Order ID is required"
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const config = await getPayPalConfig();
      const accessToken = await getAccessToken(config.clientId, config.clientSecret, config.environment);
      const apiUrl = PAYPAL_API[config.environment];
      const captureResponse = await fetch(`${apiUrl}/v2/checkout/orders/${data.orderId}/capture`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
      if (!captureResponse.ok) {
        const error = await captureResponse.json();
        throw new Error(error.message || "Failed to capture PayPal payment");
      }
      const capture = await captureResponse.json();
      return new Response(JSON.stringify({
        status: capture.status,
        captureId: capture.purchase_units[0]?.payments?.captures[0]?.id,
        details: capture
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (method === "POST" && path.includes("/webhook")) {
      const data = await request.json();
      console.log("PayPal webhook received:", data.event_type);
      switch (data.event_type) {
        case "PAYMENT.CAPTURE.COMPLETED":
          console.log("Payment captured:", data.resource.id);
          break;
        case "PAYMENT.CAPTURE.DENIED":
          console.log("Payment denied:", data.resource.id);
          break;
        case "PAYMENT.CAPTURE.REFUNDED":
          console.log("Payment refunded:", data.resource.id);
          break;
        default:
          console.log("Unhandled event type:", data.event_type);
      }
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (method === "GET" && path.includes("/config")) {
      const config = await getPayPalConfig();
      return new Response(JSON.stringify({
        clientId: config.clientId,
        environment: config.environment
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("PayPal API error:", error);
    return new Response(JSON.stringify({
      error: "PayPal error",
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(onRequest9, "onRequest");

// api/products.ts
async function onRequest10(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const DB = env.DB;
  if (!DB) {
    return new Response(JSON.stringify({ error: "D1 binding not found" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  try {
    if (request.method === "GET") {
      const res = await DB.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
      const rows = res.results || [];
      const data = rows.map((r) => ({
        id: String(r.id),
        category: r.category,
        image: r.image,
        name: { en: r.name_en, tr: r.name_tr, de: r.name_de },
        features: { en: JSON.parse(r.features_en || "[]"), tr: JSON.parse(r.features_tr || "[]") },
        badges: r.badges ? r.badges.split(",") : [],
        retail_price: r.retail_price,
        min_wholesale_quantity: r.min_wholesale_quantity,
        stock_quantity: r.stock_quantity,
        in_stock: Boolean(r.in_stock),
        priceTiers: JSON.parse(r.price_tiers || "[]")
      }));
      return new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (request.method === "POST") {
      const body = await request.json();
      const insert = await DB.prepare(`INSERT INTO products (
        category, name_en, name_tr, name_de, image, features_en, features_tr, badges, retail_price, min_wholesale_quantity, stock_quantity, in_stock, price_tiers, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`).bind(
        body.category,
        body.name.en,
        body.name.tr,
        body.name.de || body.name.en,
        body.image || "",
        JSON.stringify(body.features?.en || []),
        JSON.stringify(body.features?.tr || []),
        (body.badges || []).join(","),
        body.retail_price,
        body.min_wholesale_quantity,
        body.stock_quantity || 0,
        Number(body.in_stock),
        JSON.stringify(body.priceTiers || [])
      ).run();
      return new Response(JSON.stringify({ success: true, id: insert.meta?.last_row_id }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (request.method === "PUT") {
      const body = await request.json();
      if (!body.id) return new Response(JSON.stringify({ error: "ID required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const res = await DB.prepare(`UPDATE products SET
        category = ?, name_en = ?, name_tr = ?, name_de = ?, image = ?, features_en = ?, features_tr = ?, badges = ?, retail_price = ?, min_wholesale_quantity = ?, stock_quantity = ?, in_stock = ?, price_tiers = ?
        WHERE id = ?
      `).bind(
        body.category,
        body.name.en,
        body.name.tr,
        body.name.de || body.name.en,
        body.image || "",
        JSON.stringify(body.features?.en || []),
        JSON.stringify(body.features?.tr || []),
        (body.badges || []).join(","),
        body.retail_price,
        body.min_wholesale_quantity,
        body.stock_quantity || 0,
        Number(body.in_stock),
        JSON.stringify(body.priceTiers || []),
        body.id
      ).run();
      if (res.meta?.changes === 0) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (request.method === "DELETE") {
      const body = await request.json();
      if (!body?.id) return new Response(JSON.stringify({ error: "ID required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const res = await DB.prepare("DELETE FROM products WHERE id = ?").bind(body.id).run();
      if (res.meta?.changes === 0) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Server error", message: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
__name(onRequest10, "onRequest");

// api/quotes.js
async function onRequest11(context) {
  const { request, env } = context;
  const corsHeaders2 = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders2 });
  }
  const { DB } = env;
  if (!DB) {
    return new Response(JSON.stringify({
      error: "Database not configured",
      message: "D1 database binding not found"
    }), {
      status: 500,
      headers: corsHeaders2
    });
  }
  try {
    if (request.method === "GET") {
      const { results } = await DB.prepare(
        "SELECT * FROM quotes ORDER BY created_at DESC"
      ).all();
      const quotes = results.map((row) => ({
        id: row.id.toString(),
        name: row.name,
        company: row.company,
        email: row.email,
        phone: row.phone,
        product_category: row.product_category,
        quantity: row.quantity,
        message: row.message,
        created_at: row.created_at
      }));
      return new Response(JSON.stringify(quotes), {
        headers: corsHeaders2,
        status: 200
      });
    }
    if (request.method === "POST") {
      const quote = await request.json();
      if (!quote.name || !quote.email) {
        return new Response(JSON.stringify({
          error: "Validation error",
          message: "name and email are required"
        }), {
          status: 422,
          headers: corsHeaders2
        });
      }
      const result = await DB.prepare(`
        INSERT INTO quotes (name, company, email, phone, product_category, quantity, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        quote.name,
        quote.company || null,
        quote.email,
        quote.phone || null,
        quote.product_category || null,
        quote.quantity || null,
        quote.message || null
      ).run();
      const savedQuote = {
        id: result.meta.last_row_id.toString(),
        ...quote,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      return new Response(JSON.stringify(savedQuote), {
        status: 201,
        headers: corsHeaders2
      });
    }
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders2
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders2
    });
  }
}
__name(onRequest11, "onRequest");

// api/settings.js
var defaultSettings = {
  salesMode: "hybrid",
  // 'retail', 'wholesale', 'hybrid'
  paymentMethods: {
    creditCard: {
      enabled: false
    },
    bankTransfer: {
      enabled: true,
      instructions: "Banka havalesi bilgileri:\n\nBanka: \u0130\u015F Bankas\u0131\nIBAN: TR00 0000 0000 0000 0000 0000 00\nAl\u0131c\u0131: Ovia Home Tekstil A.\u015E.\n\nL\xFCtfen havale a\xE7\u0131klamas\u0131na sipari\u015F numaran\u0131z\u0131 yaz\u0131n\u0131z."
    },
    letterOfCredit: {
      enabled: true,
      instructions: "LC (Letter of Credit) ile \xF6deme i\xE7in:\n\n1. LC'yi \u015Fu bankaya a\xE7\u0131n\u0131z: \u0130\u015F Bankas\u0131, Kad\u0131k\xF6y \u015Eubesi\n2. Beneficiary: Ovia Home Tekstil A.\u015E.\n3. LC bir kopyas\u0131n\u0131 info@oviahome.com adresine g\xF6nderin\n\nDetayl\u0131 bilgi i\xE7in l\xFCtfen bizimle ileti\u015Fime ge\xE7in."
    },
    paypal: {
      enabled: false,
      environment: "sandbox",
      // 'sandbox' or 'live'
      clientId: "",
      clientSecret: "",
      webhookId: ""
    }
  }
};
var currentSettings = { ...defaultSettings };
async function onRequest12(context) {
  const { request } = context;
  const method = request.method;
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (method === "GET") {
      return new Response(JSON.stringify(currentSettings), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (method === "PUT") {
      const data = await request.json();
      if (data.salesMode) {
        if (!["retail", "wholesale", "hybrid"].includes(data.salesMode)) {
          return new Response(JSON.stringify({
            error: "Validation error",
            message: "salesMode must be retail, wholesale, or hybrid"
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        currentSettings.salesMode = data.salesMode;
      }
      if (data.paymentMethods) {
        currentSettings.paymentMethods = {
          ...currentSettings.paymentMethods,
          ...data.paymentMethods
        };
      }
      return new Response(JSON.stringify(currentSettings), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (method === "POST" && new URL(request.url).pathname.endsWith("/reset")) {
      currentSettings = { ...defaultSettings };
      return new Response(JSON.stringify(currentSettings), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Settings API error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(onRequest12, "onRequest");

// api/sheets.js
async function onRequest13(context) {
  const { request, env } = context;
  const corsHeaders2 = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders2 });
  }
  const spreadsheetId = env.SPREADSHEET_ID;
  const apiKey = typeof env.GOOGLE_API_KEY === "string" ? env.GOOGLE_API_KEY.trim() : String(env.GOOGLE_API_KEY || "").trim();
  if (!apiKey || apiKey === "your-google-api-key-here") {
    return new Response(JSON.stringify({
      error: "API key not configured",
      message: "Please set GOOGLE_API_KEY in Cloudflare environment variables"
    }), {
      status: 500,
      headers: corsHeaders2
    });
  }
  const url = new URL(request.url);
  const sheetName = url.searchParams.get("sheet") || "Products";
  const maxRows = url.searchParams.get("maxRows") || "1000";
  try {
    const range = `${sheetName}!A1:Z${maxRows}`;
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify({
        error: "Google Sheets API error",
        details: errorData,
        sheetName
      }), {
        status: response.status,
        headers: corsHeaders2
      });
    }
    const data = await response.json();
    const rows = data.values || [];
    let headers = [];
    let dataRows = [];
    if (rows.length > 0) {
      headers = rows[0];
      dataRows = rows.slice(1);
    }
    return new Response(JSON.stringify({
      success: true,
      sheetName,
      headers,
      data: dataRows,
      rawData: rows,
      spreadsheetId,
      range,
      totalRows: rows.length
    }), {
      status: 200,
      headers: corsHeaders2
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message,
      sheetName: sheetName || "unknown"
    }), {
      status: 500,
      headers: corsHeaders2
    });
  }
}
__name(onRequest13, "onRequest");

// api/stats.js
async function onRequest14(context) {
  const { request, env } = context;
  const corsHeaders2 = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders2 });
  }
  const { DB } = env;
  if (!DB) {
    const stats = {
      inquiries: 1250,
      quotes: 450,
      customers: 320,
      orders: 180,
      countries_served: 45,
      years_experience: 15
    };
    return new Response(JSON.stringify(stats), {
      headers: corsHeaders2,
      status: 200
    });
  }
  try {
    const [inquiriesCount, quotesCount, customersCount, ordersCount] = await Promise.all([
      DB.prepare("SELECT COUNT(*) as count FROM inquiries").first(),
      DB.prepare("SELECT COUNT(*) as count FROM quotes").first(),
      DB.prepare("SELECT COUNT(*) as count FROM customers").first(),
      DB.prepare("SELECT COUNT(*) as count FROM orders").first()
    ]);
    const stats = {
      inquiries: inquiriesCount?.count || 0,
      quotes: quotesCount?.count || 0,
      customers: customersCount?.count || 0,
      orders: ordersCount?.count || 0,
      countries_served: 45,
      years_experience: 15
    };
    return new Response(JSON.stringify(stats), {
      headers: corsHeaders2,
      status: 200
    });
  } catch (error) {
    const stats = {
      inquiries: 1250,
      quotes: 450,
      customers: 320,
      orders: 180,
      countries_served: 45,
      years_experience: 15
    };
    return new Response(JSON.stringify(stats), {
      headers: corsHeaders2,
      status: 200
    });
  }
}
__name(onRequest14, "onRequest");

// api/test-db.js
async function onRequest15(context) {
  const { env } = context;
  const corsHeaders2 = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders2 });
  }
  try {
    const { DB } = env;
    if (!DB) {
      return new Response(JSON.stringify({
        error: "D1 binding not found",
        message: "DB binding is not configured"
      }), {
        status: 500,
        headers: corsHeaders2
      });
    }
    const productsCount = await DB.prepare("SELECT COUNT(*) as count FROM products").first();
    const categoriesCount = await DB.prepare("SELECT COUNT(*) as count FROM categories").first();
    const oneProduct = await DB.prepare("SELECT * FROM products LIMIT 1").first();
    return new Response(JSON.stringify({
      success: true,
      message: "D1 connection working!",
      productsCount: productsCount?.count || 0,
      categoriesCount: categoriesCount?.count || 0,
      sampleProduct: oneProduct,
      dbBinding: "DB binding found and working"
    }), {
      status: 200,
      headers: corsHeaders2
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Database error",
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: corsHeaders2
    });
  }
}
__name(onRequest15, "onRequest");

// admin/index.ts
var onRequest16 = /* @__PURE__ */ __name(async (context) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Ovia Home</title>
    <script src="https://unpkg.com/htmx.org@1.9.10"><\/script>
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
      "Content-Type": "text/html;charset=utf-8"
    }
  });
}, "onRequest");

// _middleware.js
async function onRequest17(context) {
  const { request, next, env } = context;
  const corsHeaders2 = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders2,
      status: 204
    });
  }
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const rateKey = `rate:${ip}`;
  const response = await next();
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders2).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
__name(onRequest17, "onRequest");

// ../.wrangler/tmp/pages-7CB9KD/functionsRoutes-0.07319306799203851.mjs
var routes = [
  {
    routePath: "/admin/products",
    mountPath: "/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/addresses",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/auth",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/api/cart",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest4]
  },
  {
    routePath: "/api/categories",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest5]
  },
  {
    routePath: "/api/customers",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest6]
  },
  {
    routePath: "/api/inquiries",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest7]
  },
  {
    routePath: "/api/orders",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest8]
  },
  {
    routePath: "/api/paypal",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest9]
  },
  {
    routePath: "/api/products",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest10]
  },
  {
    routePath: "/api/quotes",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest11]
  },
  {
    routePath: "/api/settings",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest12]
  },
  {
    routePath: "/api/sheets",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest13]
  },
  {
    routePath: "/api/stats",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest14]
  },
  {
    routePath: "/api/test-db",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest15]
  },
  {
    routePath: "/_middlewares",
    mountPath: "/",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/admin",
    mountPath: "/admin",
    method: "",
    middlewares: [],
    modules: [onRequest16]
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest17],
    modules: []
  }
];

// ../../root/.npm/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../root/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../../root/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../root/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-9xHx2k/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../../root/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-9xHx2k/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.182964284727114.mjs.map
