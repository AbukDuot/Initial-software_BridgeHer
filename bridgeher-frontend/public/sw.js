const CACHE_NAME = 'bridgeher-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/offline.html'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Background sync for progress tracking
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-progress') {
    event.waitUntil(syncProgress());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New course update available!',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Course',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('BridgeHer', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/courses')
    );
  }
});

async function syncProgress() {
  try {
    const progressData = await getStoredProgress();
    if (progressData.length > 0) {
      await fetch('/api/sync/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(progressData)
      });
      clearStoredProgress();
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

function getStoredProgress() {
  return new Promise((resolve) => {
    const progress = JSON.parse(localStorage.getItem('offline_progress') || '[]');
    resolve(progress);
  });
}

function clearStoredProgress() {
  localStorage.removeItem('offline_progress');
}