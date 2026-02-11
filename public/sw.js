const CACHE_NAME = 'c4g-template-v1';

// Install event - skip waiting to activate immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip caching for API routes, especially authentication
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // Skip caching for authentication-related requests
  if (event.request.url.includes('auth') || 
      event.request.url.includes('oauth') ||
      event.request.url.includes('signin') ||
      event.request.url.includes('signout') ||
      event.request.url.includes('callback')) {
    return;
  }

  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push event
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'C4G Template Notification',
    body: 'This is a push notification from C4G Template!',
    data: {}
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (error) {
      console.error('Error parsing notification data:', error);
    }
  }

  const options = {
    body: notificationData.body,
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1',
      ...notificationData.data
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/android-chrome-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/android-chrome-192x192.png'
      }
    ]
  };

  const promiseChain = self.registration.showNotification(notificationData.title, options);

  event.waitUntil(promiseChain);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
