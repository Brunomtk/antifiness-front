const CACHE_NAME = "anti-fitness-client-v1.0.0"
const STATIC_CACHE = "static-v1.0.0"
const DYNAMIC_CACHE = "dynamic-v1.0.0"

// Arquivos para cache estático
const STATIC_FILES = [
  "/client/dashboard",
  "/client/diet",
  "/client/workout",
  "/client/courses",
  "/client/messages",
  "/client/feedbacks",
  "/client/notifications",
  "/client/profile",
  "/client/offline",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/logo-antifitness.png",
  "/diverse-woman-avatar.png",
]

// Instalar Service Worker
self.addEventListener("install", (event) => {
  console.log("SW: Instalando...")
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("SW: Cache aberto")
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log("SW: Arquivos em cache")
        return self.skipWaiting()
      }),
  )
})

// Ativar Service Worker
self.addEventListener("activate", (event) => {
  console.log("SW: Ativando...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("SW: Removendo cache antigo:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("SW: Ativado")
        return self.clients.claim()
      }),
  )
})

// Interceptar requisições
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Apenas interceptar requisições do cliente
  if (!url.pathname.startsWith("/client/")) {
    return
  }

  event.respondWith(
    caches.match(request).then((response) => {
      // Se encontrou no cache, retorna
      if (response) {
        return response
      }

      // Senão, busca na rede
      return fetch(request)
        .then((fetchResponse) => {
          // Se não conseguiu buscar, retorna página offline
          if (!fetchResponse || fetchResponse.status !== 200) {
            if (request.destination === "document") {
              return caches.match("/client/offline")
            }
          }

          // Cache dinâmico para novas requisições
          const responseClone = fetchResponse.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })

          return fetchResponse
        })
        .catch(() => {
          // Se falhou completamente, retorna página offline
          if (request.destination === "document") {
            return caches.match("/client/offline")
          }
        })
    }),
  )
})

// Push Notifications
self.addEventListener("push", (event) => {
  console.log("SW: Push recebido")

  const options = {
    body: event.data ? event.data.text() : "Nova notificação do Anti-Fitness",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [200, 100, 200],
    data: {
      url: "/client/notifications",
    },
    actions: [
      {
        action: "open",
        title: "Abrir",
        icon: "/icons/icon-72x72.png",
      },
      {
        action: "close",
        title: "Fechar",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("Anti-Fitness", options))
})

// Clique em notificação
self.addEventListener("notificationclick", (event) => {
  console.log("SW: Notificação clicada")

  event.notification.close()

  if (event.action === "open" || !event.action) {
    event.waitUntil(clients.openWindow(event.notification.data.url || "/client/dashboard"))
  }
})

// Background Sync
self.addEventListener("sync", (event) => {
  console.log("SW: Background sync:", event.tag)

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Sincronizar dados offline
      syncOfflineData(),
    )
  }
})

async function syncOfflineData() {
  try {
    // Implementar sincronização de dados offline
    console.log("SW: Sincronizando dados offline...")

    // Exemplo: enviar dados salvos offline
    const offlineData = await getOfflineData()
    if (offlineData.length > 0) {
      await sendOfflineData(offlineData)
      await clearOfflineData()
    }
  } catch (error) {
    console.error("SW: Erro na sincronização:", error)
  }
}

async function getOfflineData() {
  // Implementar busca de dados offline
  return []
}

async function sendOfflineData(data) {
  // Implementar envio de dados
  console.log("SW: Enviando dados:", data)
}

async function clearOfflineData() {
  // Implementar limpeza de dados offline
  console.log("SW: Dados offline limpos")
}
