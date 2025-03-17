# Vercel Deployment Troubleshooting

This document covers issues encountered during Vercel deployment of the DegenQuest game client and solutions implemented.

## Issues and Solutions

### 1. Bun Installation Failure

**Issue:** 
```
curl: (22) The requested URL returned error: 404
error: Failed to download bun from "https://github.com/oven-sh/bun/releases/download/--install-dir/bun-linux-x64.zip"
```

**Root Cause:**  
The script was using an incorrect approach to download Bun, resulting in a malformed URL.

**Solution:**
- Modified `vercel-build.sh` to download a specific version of Bun directly from GitHub
- Added platform detection to use the correct binary (linux-x64, darwin-x64, darwin-aarch64)
- Implemented proper error handling and debugging output
- Added fallbacks for installation failures

**Commit:** [Fix Bun installation in Vercel build script](https://github.com/Degenerate-Laboratories/DegenQuest-v2/commit/94c8ed8)

### 2. Python distutils Missing

**Issue:**
```
ModuleNotFoundError: No module named 'distutils'
```

**Root Cause:**  
Node-gyp requires Python's distutils module which wasn't available in the Vercel build environment.

**Solution:**
- Added Python environment setup in the build script
- Installed setuptools which provides distutils
- Set NODE_GYP_FORCE_PYTHON environment variable
- Added conditional logic to install Python if needed

**Commit:** [Fix Python distutils dependency for node-gyp in Vercel build](https://github.com/Degenerate-Laboratories/DegenQuest-v2/commit/84e5410)

### 3. Node.js 22 Compatibility Issues

**Issue:**
```
/vercel/.cache/node-gyp/22.14.0/include/node/v8-array-buffer.h:308:40: error: template argument 1 is invalid
```

**Root Cause:**  
Node.js 22 has breaking changes in its C++ API which caused compilation issues with native modules.

**Solution:**
- Added environment variables to skip native compilation
- Created .npmrc with configuration for native modules
- Implemented fallback mechanisms for installation
- Used `--legacy-peer-deps` when needed

**Commit:** [Fix Node.js 22 compatibility issues with native modules](https://github.com/Degenerate-Laboratories/DegenQuest-v2/commit/7c6e96d)

### 4. Vite Not Found

**Issue:**
```
error: Script not found "vite"
```

**Root Cause:**  
Initial implementation only installed production dependencies, but Vite was in devDependencies.

**Solution:**
- Modified the script to install all dependencies, not just production
- Added explicit check for Vite and installation if needed
- Implemented multiple fallback methods to run the build

**Commit:** [Fix Vite not found error by installing dev dependencies](https://github.com/Degenerate-Laboratories/DegenQuest-v2/commit/b4d3906)

### 5. CORS and COEP Issues

**Issue:**
```
Failed to load resource: net::ERR_BLOCKED_BY_RESPONSE.NotSameOriginAfterDefaultedToSameOriginByCoep
bundle.js:1 Uncaught SyntaxError: Unexpected token '<'
```

**Root Cause:**  
The Cross-Origin-Embedder-Policy (COEP) header was set to 'require-corp', blocking cross-origin resources including Vercel's own feedback system. The 'Unexpected token' error indicated JavaScript files were being served as HTML.

**Solution:**
- Removed COEP headers from vercel.json files
- Added crossorigin="anonymous" to script tags in index.html
- Added specific routing rules for static assets to ensure correct MIME types
- Implemented caching headers for assets

**Commits:** 
- [Remove COEP header to fix Vercel feedback system errors](https://github.com/Degenerate-Laboratories/DegenQuest-v2/commit/1fa6a84)
- [Remove COEP header from vite-migration vercel.json](https://github.com/Degenerate-Laboratories/DegenQuest-v2/commit/081a658)
- [Fix CORS and routing issues in Vercel deployment](https://github.com/Degenerate-Laboratories/DegenQuest-v2/commit/c28f864)

## Persistent COEP Issue

Despite removing COEP headers from configuration files, the error persists:
```
vercel.live/_next-live/feedback/feedback.js:1 Failed to load resource: net::ERR_BLOCKED_BY_RESPONSE.NotSameOriginAfterDefaultedToSameOriginByCoep
```

### Additional Solutions to Try

1. **Client-side Workaround with Service Worker:**
   - Implement a service worker that intercepts network requests and modifies CORS headers
   - Add the following to a new file `public/cors-worker.js`:

```javascript
// cors-worker.js
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  // Only intercept cross-origin requests
  if (request.mode === 'cors') {
    event.respondWith(
      fetch(request, { 
        mode: 'cors',
        credentials: 'omit'
      })
    );
  }
});
```

2. **Register the Service Worker in index.html:**
   - Add this script to your HTML:

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/cors-worker.js').then(registration => {
      console.log('CORS Service Worker registered with scope:', registration.scope);
    }).catch(error => {
      console.error('CORS Service Worker registration failed:', error);
    });
  });
}
```

3. **Contact Vercel Support:**
   - If the issue persists, it may be that Vercel is applying their own security headers
   - Reach out to Vercel support with details of the error and your application

4. **Try a Content Security Policy Alternative:**
   - Instead of COEP, use Content-Security-Policy headers
   - Add this to your vercel.json:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; connect-src 'self' https://vercel.live; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'"
        }
      ]
    }
  ]
}
```

## Understanding ERR_BLOCKED_BY_RESPONSE Error

### What is the ERR_BLOCKED_BY_RESPONSE Error?

The `ERR_BLOCKED_BY_RESPONSE` error is a browser-related issue that occurs when a webpage's response is blocked by certain conditions or rules. This error appears in the browser's DevTools console and is related to but distinct from the COEP issues we've been experiencing.

### Common Causes

1. **CORS (Cross-Origin Resource Sharing) Issues**
   - Misconfigured CORS headers on servers can lead to blocked requests
   - Resources from different domains need proper `Access-Control-Allow-Origin` headers

2. **Misconfigured Server Headers**
   - Incorrect `Content-Security-Policy` (CSP) or `X-Frame-Options` headers
   - Missing or improperly set headers like `Strict-Transport-Security` or `Content-Type`
   
3. **Browser Extensions**
   - Ad blockers, privacy tools, or security extensions can block requests
   - This is related to but different from the `ERR_BLOCKED_BY_CLIENT` error which is specifically caused by browser extensions

4. **Network Restrictions**
   - Firewalls, proxies, or VPNs may block certain web requests
   - Corporate networks often implement restrictions that can trigger this error

5. **Incorrect API or JavaScript Code**
   - Errors in API endpoints or JavaScript code sending invalid requests

### Solutions for Vercel Deployment

1. **Verify CORS Settings**
   - Ensure your `vercel.json` file includes appropriate CORS headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-Requested-With, Content-Type, Accept"
        }
      ]
    }
  ]
}
```

2. **Check for Browser Extensions During Testing**
   - Test in incognito mode or with extensions disabled
   - The `ERR_BLOCKED_BY_CLIENT` error (similar to `ERR_BLOCKED_BY_RESPONSE`) is typically caused by ad blockers

3. **Debug Using Developer Tools**
   - Use browser's Network tab to identify blocked requests
   - Check response headers and status codes
   - Look for specific error details in the console

4. **Modify Content Security Policy**
   - If needed, adjust your CSP to allow necessary resources:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; connect-src 'self' https://api.example.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
        }
      ]
    }
  ]
}
```

5. **Vercel-Specific Issue with Worker Scripts**
   - Some Vercel users report CORS headers not being applied to worker scripts
   - This may be related to GitHub issue #41207 mentioned previously
   - Consider implementing a middleware solution if headers aren't being honored in production

## Build Process Lessons Learned

1. **Platform Detection:**
   - Always detect and use the appropriate binary for the current platform
   - Test builds both locally and in CI to catch platform-specific issues

2. **Native Module Compilation:**
   - Node.js version upgrades can break native module compilation
   - Use environment variables to skip native compilation when possible
   - Prefer pre-built binaries over compiling from source

3. **Dependency Management:**
   - Be explicit about which dependencies are needed for builds
   - Use `--production=false` or omit the production flag to ensure dev dependencies are installed
   - Add fallback mechanisms when packages fail to install

4. **Cross-Origin Resource Sharing:**
   - Balance security and functionality when setting CORS headers
   - Add necessary crossorigin attributes to script tags
   - Be careful with COEP settings as they can block embedded resources

5. **Routing Configuration:**
   - Ensure static assets have specific routing rules
   - Set appropriate mime types and caching headers
   - Use a cascading approach where the most specific routes come first 