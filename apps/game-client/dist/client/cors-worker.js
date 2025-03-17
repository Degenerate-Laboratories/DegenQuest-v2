// CORS Service Worker
// This service worker helps with cross-origin resource sharing issues
// by intercepting requests and modifying how they're handled

self.addEventListener('install', (event) => {
  console.log('CORS Service Worker: Installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('CORS Service Worker: Activating');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Only intercept cross-origin requests
  if (request.mode === 'cors' || url.origin !== self.location.origin) {
    // Handle vercel.live specific resources
    if (url.hostname.includes('vercel.live') || url.pathname.includes('_next-live')) {
      console.log('CORS Service Worker: Intercepting Vercel Live request', url.toString());
      
      // Create a new request with modified options
      const modifiedRequest = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        mode: 'cors',
        credentials: 'omit',
        redirect: request.redirect,
        integrity: request.integrity
      });
      
      event.respondWith(
        fetch(modifiedRequest)
          .then(response => {
            // Clone the response
            const newResponse = response.clone();
            
            // Create a modified response with CORS headers
            return new Response(newResponse.body, {
              status: newResponse.status,
              statusText: newResponse.statusText,
              headers: addCorsHeaders(newResponse.headers)
            });
          })
          .catch(err => {
            console.error('CORS Service Worker: Fetch failed', err);
            return new Response('CORS request failed', { status: 500 });
          })
      );
    }
  }
});

// Helper function to add CORS headers to a Headers object
function addCorsHeaders(headers) {
  const newHeaders = new Headers(headers);
  newHeaders.set('Access-Control-Allow-Origin', '*');
  newHeaders.set('Cross-Origin-Resource-Policy', 'cross-origin');
  return newHeaders;
} 