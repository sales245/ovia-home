#!/usr/bin/env node
/**
 * Local test runner for Cloudflare Workers Functions
 * Simulates the Cloudflare Workers environment to test API endpoints
 */

const fs = require('fs');
const path = require('path');

// Mock Cloudflare Workers environment
global.Request = class MockRequest {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Map();
    this.body = options.body;
    
    // Set headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value);
      });
    }
  }
  
  get(name) {
    return this.headers.get(name.toLowerCase());
  }
  
  async json() {
    return JSON.parse(this.body);
  }
};

global.Response = class MockResponse {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.headers = new Map();
    
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        this.headers.set(key, value);
      });
    }
  }
  
  async json() {
    return JSON.parse(this.body);
  }
  
  async text() {
    return this.body;
  }
};

// Mock crypto for password hashing
global.crypto = {
  subtle: {
    digest: async (algorithm, data) => {
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256');
      hash.update(data);
      return hash.digest();
    }
  }
};

// Mock btoa/atob
global.btoa = (str) => Buffer.from(str).toString('base64');
global.atob = (str) => Buffer.from(str, 'base64').toString();

// Mock fetch
global.fetch = async (url, options = {}) => {
  // Mock PayPal API responses
  if (url.includes('paypal.com')) {
    if (url.includes('/oauth2/token')) {
      return new Response(JSON.stringify({
        access_token: 'mock_access_token',
        token_type: 'Bearer',
        expires_in: 3600
      }), { status: 200 });
    }
    
    if (url.includes('/checkout/orders')) {
      return new Response(JSON.stringify({
        id: 'mock_order_id_123',
        status: 'CREATED',
        links: [
          { rel: 'approve', href: 'https://www.sandbox.paypal.com/checkoutnow?token=mock_token' }
        ]
      }), { status: 201 });
    }
  }
  
  throw new Error(`Fetch not mocked for: ${url}`);
};

class FunctionTester {
  constructor() {
    this.results = [];
  }
  
  log(test, success, details = '') {
    const status = success ? '✅ PASS' : '❌ FAIL';
    this.results.push({ test, success, details });
    console.log(`${status}: ${test}`);
    if (details) console.log(`   ${details}`);
  }
  
  async loadFunction(functionPath) {
    try {
      // Read the function file
      const functionCode = fs.readFileSync(functionPath, 'utf8');
      
      // Create a simple module system
      const moduleExports = {};
      const module = { exports: moduleExports };
      
      // Mock import/export for ES modules
      const mockImport = (path) => {
        if (path.includes('_middlewares')) {
          return {
            corsHeaders: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              'Content-Type': 'application/json'
            }
          };
        }
        return {};
      };
      
      // Replace ES6 imports with mock imports
      let processedCode = functionCode
        .replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"];?/g, (match, imports, path) => {
          return `const { ${imports} } = (${mockImport.toString()})(${JSON.stringify(path)});`;
        })
        .replace(/export\s+async\s+function\s+onRequest/g, 'async function onRequest')
        .replace(/export\s+{([^}]+)}/g, ''); // Remove export statements
      
      // Add the onRequest function to module.exports
      processedCode += '\nmodule.exports = { onRequest };';
      
      // Execute the code
      const func = new Function('module', 'exports', 'require', 'console', 'process', processedCode);
      func(module, moduleExports, require, console, { env: {} });
      
      return moduleExports.onRequest;
    } catch (error) {
      console.error(`Error loading function ${functionPath}:`, error.message);
      return null;
    }
  }
  
  async testFunction(functionPath, testCases) {
    console.log(`\n🧪 Testing ${path.basename(functionPath)}...`);
    
    const onRequest = await this.loadFunction(functionPath);
    if (!onRequest) {
      this.log(`Load ${path.basename(functionPath)}`, false, 'Failed to load function');
      return;
    }
    
    for (const testCase of testCases) {
      try {
        const request = new Request(testCase.url, {
          method: testCase.method,
          headers: testCase.headers,
          body: testCase.body ? JSON.stringify(testCase.body) : undefined
        });
        
        const context = { request };
        const response = await onRequest(context);
        
        const success = testCase.expectedStatus ? 
          response.status === testCase.expectedStatus : 
          response.status < 400;
          
        let details = `${testCase.method} ${testCase.url} -> ${response.status}`;
        
        if (testCase.expectedContent && response.body) {
          const responseText = await response.text();
          const hasContent = responseText.includes(testCase.expectedContent);
          details += hasContent ? ' (content ✓)' : ' (content ✗)';
        }
        
        this.log(testCase.name, success, details);
        
      } catch (error) {
        this.log(testCase.name, false, `Error: ${error.message}`);
      }
    }
  }
  
  async runAllTests() {
    console.log('🚀 Starting Local Function Tests');
    console.log('=' * 50);
    
    // Test Settings API
    await this.testFunction('/app/functions/api/settings.js', [
      {
        name: 'Settings GET',
        method: 'GET',
        url: 'https://example.com/api/settings',
        expectedStatus: 200,
        expectedContent: 'salesMode'
      },
      {
        name: 'Settings PUT',
        method: 'PUT',
        url: 'https://example.com/api/settings',
        headers: { 'Content-Type': 'application/json' },
        body: { salesMode: 'retail' },
        expectedStatus: 200
      },
      {
        name: 'Settings Validation',
        method: 'PUT',
        url: 'https://example.com/api/settings',
        headers: { 'Content-Type': 'application/json' },
        body: { salesMode: 'invalid' },
        expectedStatus: 400
      }
    ]);
    
    // Test Auth API
    await this.testFunction('/app/functions/api/auth.js', [
      {
        name: 'Auth Register',
        method: 'POST',
        url: 'https://example.com/api/auth/register',
        headers: { 'Content-Type': 'application/json' },
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        },
        expectedStatus: 201
      },
      {
        name: 'Auth Login',
        method: 'POST',
        url: 'https://example.com/api/auth/login',
        headers: { 'Content-Type': 'application/json' },
        body: {
          email: 'test@example.com',
          password: 'password123'
        },
        expectedStatus: 200
      }
    ]);
    
    // Test Cart API
    await this.testFunction('/app/functions/api/cart.js', [
      {
        name: 'Cart GET',
        method: 'GET',
        url: 'https://example.com/api/cart',
        expectedStatus: 200,
        expectedContent: 'items'
      },
      {
        name: 'Cart POST',
        method: 'POST',
        url: 'https://example.com/api/cart',
        headers: { 'Content-Type': 'application/json' },
        body: {
          productId: 'test123',
          name: 'Test Product',
          price: 100,
          quantity: 1
        },
        expectedStatus: 200
      }
    ]);
    
    // Test PayPal API
    await this.testFunction('/app/functions/api/paypal.js', [
      {
        name: 'PayPal Config',
        method: 'GET',
        url: 'https://example.com/api/paypal/config',
        expectedStatus: 200,
        expectedContent: 'clientId'
      }
    ]);
    
    // Summary
    console.log('\n' + '=' * 50);
    console.log('📊 TEST SUMMARY');
    console.log('=' * 50);
    
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const total = this.results.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${(passed/total*100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.test}: ${r.details}`);
      });
    }
    
    return { passed, failed, total };
  }
}

// Run tests
const tester = new FunctionTester();
tester.runAllTests().then(({ passed, failed, total }) => {
  process.exit(failed > 0 ? 1 : 0);
}).catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});