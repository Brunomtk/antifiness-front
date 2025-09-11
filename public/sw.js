const CACHE_NAME = "anti-fitness-v1.0.0"
const STATIC_CACHE_NAME = "anti-fitness-static-v1.0.0"
const DYNAMIC_CACHE_NAME = "anti-fitness-dynamic-v1.0.0"

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/login",
  "/client/dashboard",
  "/admin/dashboard",
  "/manifest.json",
  "/logo-antifitness.png",
  "/icons/icon-192x192.jpg",
  "/icons/icon-512x512.jpg",
  // Add critical CSS and JS files
  "/_next/static/css/app/layout.css",
  "/_next/static/chunks/webpack.js",
  "/_next/static/chunks/main.js",
]

// API endpoints to cache
const API_CACHE_PATTERNS = [/^https:\/\/localhost:44394\/api\//, /^\/api\//]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...")

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log("[SW] Static assets cached successfully")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("[SW] Failed to cache static assets:", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[SW] Service worker activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - handle requests with caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith("http")) {
    return
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request))
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirst(request))
  } else if (isNavigationRequest(request)) {
    event.respondWith(staleWhileRevalidate(request))
  } else {
    event.respondWith(networkFirst(request))
  }
})

// Check if request is for static assets
function isStaticAsset(request) {
  const url = new URL(request.url)
  return (
    url.pathname.includes("/_next/static/") ||
    url.pathname.includes("/icons/") ||
    url.pathname.includes("/images/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  )
}

// Check if request is for API
function isAPIRequest(request) {
  return API_CACHE_PATTERNS.some((pattern) => pattern.test(request.url))
}

// Check if request is navigation
function isNavigationRequest(request) {
  return request.mode === "navigate"
}

// Cache first strategy - for static assets
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error("[SW] Cache first failed:", error)
    return new Response("Offline", { status: 503 })
  }
}

// Network first strategy - for API requests
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", error)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    return new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// Stale while revalidate strategy - for pages
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME)
  const cachedResponse = await cache.match(request)

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    })
    .catch(() => {
      // Return cached response or offline page
      return cachedResponse || caches.match("/") || new Response("Offline", { status: 503 })
    })

  return cachedResponse || fetchPromise
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag)

  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Handle offline actions when back online
  console.log("[SW] Performing background sync...")
}

// Push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received:", event)

  const options = {
    body: event.data ? event.data.text() : "Nova notificação do Anti-Fitness",
    icon: "/icons/icon-192x192.jpg",
    badge: "/icons/icon-72x72.jpg",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Ver detalhes",
        icon: "/icons/icon-96x96.jpg",
      },
      {
        action: "close",
        title: "Fechar",
        icon: "/icons/icon-96x96.jpg",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("Anti-Fitness", options))
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event)

  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/client/dashboard"))
  }
})
