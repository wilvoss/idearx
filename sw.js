// currently not using this at all - might not need it

const CACHE_VERSION = '0.0.010';
const CURRENT_CACHE = `main-${CACHE_VERSION}`;

// prettier-ignore
// these are the routes we are going to cache for offline support
const cacheFiles = [
  './',
  'helpers/console-enhancer.js',
  'helpers/vue.min.js',
  'scripts/idearx-controller.js',
  'styles/normalize-min.css',
  'styles/idearx.css',
  'index.html',
];

// on activation we clean up the previously registered service workers
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CURRENT_CACHE) {
            return caches.delete(cacheName);
          }
          // Return a resolved promise to ensure all caches are checked
          return Promise.resolve();
        }),
      );
    }),
  );
  evt.waitUntil(clients.claim());
});

// on install we download the routes we want to cache for offline
self.addEventListener('install', (evt) =>
  evt.waitUntil(
    caches.open(CURRENT_CACHE).then((cache) => {
      return cache.addAll(cacheFiles);
    }),
  ),
);

// update app if new service worker version has been loaded but is waiting
self.addEventListener('message', function (event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('.txt')) {
    // Bypass the service worker and always fetch from the network
    event.respondWith(fetch(event.request));
  } else {
    // Check the file extension of the request
    let fileExtension = event.request.url.split('.').pop();
    if (fileExtension === 'js' || fileExtension === 'css' || fileExtension === 'html') {
      // Network first for .js, .css, and .html files
      event.respondWith(
        caches.open(CURRENT_CACHE).then((cache) => {
          // Go to the network first
          return fetch(event.request)
            .then((fetchedResponse) => {
              // Add the network response to the cache for later visits
              cache.put(event.request.url, fetchedResponse.clone());

              // Return the network response
              return fetchedResponse;
            })
            .catch((error) => {
              // If the network request fails, fallback to the cache
              return cache.match(event.request.url).then((cachedResponse) => {
                // Return a cached response if we have one, or an error otherwise
                return cachedResponse || new Response('Network error', { status: 500 });
              });
            });
        }),
      );
    } else {
      // Cache first for everything else
      event.respondWith(
        caches.open(CURRENT_CACHE).then((cache) => {
          // Go to the cache first
          return cache.match(event.request.url).then((cachedResponse) => {
            // Return a cached response if we have one
            if (cachedResponse) {
              return cachedResponse;
            }

            // Otherwise, hit the network
            return fetch(event.request).then((fetchedResponse) => {
              // Add the network response to the cache for later visits
              cache.put(event.request.url, fetchedResponse.clone());

              // Return the network response
              return fetchedResponse;
            });
          });
        }),
      );
    }
  }
});
