const CACHE_NAME = 'bridgeher-v1';
const API_CACHE = 'bridgeher-api-v1';
const OFFLINE_CACHE = 'bridgeher-offline-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE && cacheName !== OFFLINE_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone response to cache
          const responseClone = response.clone();
          caches.open(API_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request).then(cached => {
            if (cached) {
              console.log('[SW] Serving from cache:', request.url);
              return cached;
            }
            // Return offline page for failed API calls
            return new Response(JSON.stringify({ 
              error: 'Offline', 
              message: 'You are currently offline' 
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Static assets - cache first, network fallback
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          console.log('[SW] Serving from cache:', request.url);
          return cached;
        }
        
        return fetch(request)
          .then(response => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Message handler for course downloads
self.addEventListener('message', (event) => {
  const { data } = event;
  
  if (data.type === 'DOWNLOAD_COURSE') {
    downloadCourse(data.courseId, data.url, event.ports[0]);
  }
  
  if (data.type === 'CLEAR_CACHE') {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Download course for offline use
async function downloadCourse(courseId, apiUrl, port) {
  try {
    console.log('[SW] Downloading course:', courseId);
    
    // Fetch course data
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed to fetch course');
    
    const courseData = await response.json();
    
    // Cache course data
    const cache = await caches.open(OFFLINE_CACHE);
    await cache.put(
      new Request(`/api/courses/${courseId}`),
      new Response(JSON.stringify(courseData), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    
    // Download and cache videos/PDFs
    if (courseData.modules) {
      for (let i = 0; i < courseData.modules.length; i++) {
        const module = courseData.modules[i];
        
        // Cache video
        if (module.video_url) {
          try {
            const videoResponse = await fetch(module.video_url);
            if (videoResponse.ok) {
              await cache.put(module.video_url, videoResponse);
            }
          } catch (err) {
            console.warn('[SW] Failed to cache video:', err);
          }
        }
        
        // Cache PDF
        if (module.pdf_url) {
          try {
            const pdfResponse = await fetch(module.pdf_url);
            if (pdfResponse.ok) {
              await cache.put(module.pdf_url, pdfResponse);
            }
          } catch (err) {
            console.warn('[SW] Failed to cache PDF:', err);
          }
        }
        
        // Send progress update
        const progress = ((i + 1) / courseData.modules.length) * 100;
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'DOWNLOAD_PROGRESS',
              courseId,
              progress: Math.round(progress)
            });
          });
        });
      }
    }
    
    // Send completion message
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'DOWNLOAD_COMPLETE',
          courseId,
          success: true,
          message: 'Course downloaded successfully'
        });
      });
    });
    
    console.log('[SW] Course downloaded:', courseId);
  } catch (error) {
    console.error('[SW] Download failed:', error);
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'DOWNLOAD_COMPLETE',
          courseId,
          success: false,
          message: error.message
        });
      });
    });
  }
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('[SW] All caches cleared');
}

console.log('[SW] Service Worker loaded');
