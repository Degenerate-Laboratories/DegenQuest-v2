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
    if (url.hostname.includes('vercel.live')) {
      console.log('CORS Service Worker: Intercepting Vercel Live request', url.toString());
      event.respondWith(
        fetch(request, { 
          mode: 'cors',
          credentials: 'omit',
          headers: {
            // Add any required headers here
          }
        }).catch(err => {
          console.error('CORS Service Worker: Fetch failed', err);
          return new Response('CORS request failed', { status: 500 });
        })
      );
    }
  }
}); 