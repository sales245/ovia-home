# Cloudflare Pages Build Configuration

## Build Settings in Cloudflare Dashboard

Go to your Cloudflare Pages project settings and configure:

### Framework preset
Select: **Create React App**

### Build command
```
cd frontend && yarn install && yarn build
```

### Build output directory
```
frontend/build
```

### Root directory (optional)
Leave blank or set to: `/`

### Environment variables
Add these in Settings > Environment variables:

**Production:**
- `NODE_VERSION` = `18`
- `REACT_APP_BACKEND_URL` = (leave blank, will use relative paths)

**Preview:**
- `NODE_VERSION` = `18`
- `REACT_APP_BACKEND_URL` = (leave blank, will use relative paths)

## Alternative: Using package.json build script

If the above doesn't work, try:

### Build command
```
yarn --cwd frontend install && yarn --cwd frontend build
```

### Build output directory
```
frontend/build
```

## For Manual Deployment via Wrangler

If deploying manually using wrangler CLI:

```bash
# Install dependencies
cd frontend
yarn install

# Build
yarn build

# Deploy
cd ..
wrangler pages deploy frontend/build --project-name=ovia-home
```

## Troubleshooting Build Failures

### Issue: "npm: command not found" or yarn issues

**Solution:** Set NODE_VERSION environment variable to 18 in Cloudflare Pages settings

### Issue: "Module not found" errors

**Solution:** 
1. Make sure all dependencies are in package.json
2. Delete node_modules and yarn.lock if cached
3. Retry build

### Issue: Build succeeds but site doesn't work

**Solution:**
1. Check if D1 binding is configured (Settings > Functions > D1 Database Bindings)
2. Verify binding name is exactly `DB`
3. Make sure functions directory is at root level

### Issue: Functions not working

**Solution:**
1. Functions must be in `/functions` directory at root
2. D1 binding must be named `DB`
3. Check Functions logs in Cloudflare dashboard

## File Structure for Cloudflare Pages

```
/app/
├── functions/              # Cloudflare Functions (serverless APIs)
│   └── api/
│       ├── products.ts
│       ├── categories.js
│       ├── inquiries.js
│       └── ...
├── frontend/              # React app source
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── build/            # Build output (created during build)
├── wrangler.toml         # Cloudflare config
├── schema.sql            # Database schema
├── seed.sql              # Sample data
└── .node-version         # Node version (18)
```

## Testing Locally

To test the build locally:

```bash
cd frontend
yarn install
yarn build
```

The build should create a `frontend/build` directory with:
- index.html
- static/ folder with JS, CSS, media

## Current Build Configuration

✅ Node version: 18 (set in .node-version)
✅ Package manager: yarn (configured in package.json)
✅ Build command: Uses craco (configured in package.json)
✅ Output directory: frontend/build

## Next Steps

1. ✅ Commit and push these changes
2. Go to Cloudflare Pages dashboard
3. Go to Settings > Builds & deployments
4. Click "Configure Production deployments"
5. Set build command: `cd frontend && yarn install && yarn build`
6. Set build output directory: `frontend/build`
7. Save and retry deployment
8. If still fails, check the full build logs for specific errors
