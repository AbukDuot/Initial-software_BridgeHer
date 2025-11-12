const CACHE_NAME = 'bridgeher-v1';
const VIDEO_CACHE = 'bridgeher-videos-v1';
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

// Fetch event with video caching
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle video requests (Cloudinary or local videos)
  if (event.request.url.includes('cloudinary.com') || 
      event.request.url.includes('/video/') ||
      event.request.url.match(/\.(mp4|webm|ogg)$/)) {
    event.respondWith(
      caches.open(VIDEO_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            console.log('[SW] Serving video from cache:', event.request.url);
            return response;
          }
          
          // Fetch and cache video
          return fetch(event.request).then(networkResponse => {
            // Only cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Return offline message if video not cached
            return new Response('Video not available offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        });
      })
    );
    return;
  }
  
  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
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

// Message handler for downloading courses
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'DOWNLOAD_COURSE') {
    handleCourseDownload(event.data.courseId, event.source);
  }
  if (event.data && event.data.type === 'CACHE_VIDEO') {
    handleVideoCache(event.data.videoUrl, event.source);
  }
});

async function handleVideoCache(videoUrl, source) {
  try {
    const cache = await caches.open(VIDEO_CACHE);
    const response = await fetch(videoUrl);
    
    if (response.ok) {
      await cache.put(videoUrl, response.clone());
      source.postMessage({
        type: 'VIDEO_CACHED',
        videoUrl: videoUrl,
        success: true
      });
    }
  } catch (error) {
    source.postMessage({
      type: 'VIDEO_CACHED',
      videoUrl: videoUrl,
      success: false,
      error: error.message
    });
  }
}

async function handleCourseDownload(courseId, source) {
  try {
    // Fetch course data
    const courseResponse = await fetch(`/api/courses/${courseId}`);
    const courseData = await courseResponse.json();
    
    // Fetch modules
    const modulesResponse = await fetch(`/api/courses/${courseId}/modules`);
    const modules = await modulesResponse.json();
    
    // Cache course and module data
    const cache = await caches.open(CACHE_NAME);
    await cache.put(`/api/courses/${courseId}`, new Response(JSON.stringify(courseData)));
    await cache.put(`/api/courses/${courseId}/modules`, new Response(JSON.stringify(modules)));
    
    // Cache videos
    const videoCache = await caches.open(VIDEO_CACHE);
    let progress = 0;
    const totalVideos = modules.filter(m => m.video_url).length;
    
    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      if (module.video_url) {
        try {
          const videoResponse = await fetch(module.video_url);
          if (videoResponse.ok) {
            await videoCache.put(module.video_url, videoResponse.clone());
          }
          progress = Math.round(((i + 1) / totalVideos) * 100);
          source.postMessage({
            type: 'DOWNLOAD_PROGRESS',
            courseId: courseId,
            progress: progress
          });
        } catch (err) {
          console.error('Failed to cache video:', module.video_url, err);
        }
      }
    }
    
    source.postMessage({
      type: 'DOWNLOAD_COMPLETE',
      courseId: courseId,
      success: true,
      message: 'Course downloaded successfully'
    });
  } catch (error) {
    source.postMessage({
      type: 'DOWNLOAD_COMPLETE',
      courseId: courseId,
      success: false,
      message: error.message
    });
  }
}

async function syncProgress() {
  try {
    const progressData = await getStoredProgress();
    if (progressData.length > 0) {
      await fetch('/api/sync/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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