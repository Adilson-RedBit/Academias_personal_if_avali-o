/**
 * 🚀 SERVICE WORKER - FASE 3: PWA
 * 
 * Funcionalidades:
 * - Cache de assets (HTML, CSS, JS)
 * - Funcionamento offline
 * - Sync de dados em background
 * - Atualização automática
 */

const CACHE_NAME = 'assessment-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/app.js',
    '/styles.css',
    '/tests.js',
    '/integration-api.md',
    '/manifest.json'
];

// ==========================================
// INSTALAÇÃO
// ==========================================

self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error('[SW] Installation failed:', error);
            })
    );
});

// ==========================================
// ATIVAÇÃO
// ==========================================

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => cacheName !== CACHE_NAME)
                        .map((cacheName) => {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// ==========================================
// FETCH - ESTRATÉGIA CACHE FIRST
// ==========================================

self.addEventListener('fetch', (event) => {
    // Ignorar não-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Estratégia: Cache first, fallback to network
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Se encontrou no cache, usar
                if (response) {
                    console.log('[SW] Cache hit:', event.request.url);
                    return response;
                }

                // Senão, fazer request na rede
                return fetch(event.request)
                    .then((response) => {
                        // Clonar response (pode ser usada só uma vez)
                        const clonedResponse = response.clone();

                        // Cache response se for sucesso
                        if (response.status === 200) {
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, clonedResponse);
                                });
                        }

                        return response;
                    })
                    .catch(() => {
                        // Offline - retornar página offline se disponível
                        console.log('[SW] Offline:', event.request.url);
                        return new Response('Offline - dados pode estar desatualizado', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// ==========================================
// SINCRONIZAÇÃO EM BACKGROUND
// ==========================================

self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    
    if (event.tag === 'sync-assessment-data') {
        event.waitUntil(syncAssessmentData());
    }
});

async function syncAssessmentData() {
    try {
        // Recuperar dados do localStorage via client
        const clients = await self.clients.matchAll();
        
        for (const client of clients) {
            client.postMessage({
                type: 'SYNC_DATA',
                payload: null
            });
        }
        
        console.log('[SW] Sync completed');
        return true;
    } catch (error) {
        console.error('[SW] Sync failed:', error);
        throw error;
    }
}

// ==========================================
// NOTIFICAÇÕES PUSH
// ==========================================

self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
    
    const options = {
        body: event.data?.text() || 'Nova notificação',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%238B5CF6" width="192" height="192"/><text x="96" y="96" text-anchor="middle" dy=".3em" fill="white" font-size="80">📸</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%238B5CF6" width="192" height="192"/><text x="96" y="96" text-anchor="middle" dy=".3em" fill="white" font-size="80">📸</text></svg>',
        tag: 'assessment-notification',
        requireInteraction: false,
        actions: [
            {
                action: 'open',
                title: 'Abrir'
            },
            {
                action: 'close',
                title: 'Fechar'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Avaliação Física', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then((clientList) => {
                    // Procurar por janela já aberta
                    for (const client of clientList) {
                        if (client.url === '/' && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // Abrir nova janela se nenhuma existe
                    if (clients.openWindow) {
                        return clients.openWindow('/');
                    }
                })
        );
    }
});

// ==========================================
// PERIODIC BACKGROUND SYNC
// ==========================================

self.addEventListener('periodicsync', (event) => {
    console.log('[SW] Periodic sync:', event.tag);
    
    if (event.tag === 'check-updates') {
        event.waitUntil(checkForUpdates());
    }
});

async function checkForUpdates() {
    try {
        // Fazer request simples pra verificar se tem atualizações
        const response = await fetch('/manifest.json');
        if (response.ok) {
            console.log('[SW] Updates available, notifying clients');
            
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'UPDATE_AVAILABLE',
                    payload: null
                });
            });
        }
    } catch (error) {
        console.error('[SW] Update check failed:', error);
    }
}

// ==========================================
// MESSAGE HANDLING
// ==========================================

self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLIENTS_CLAIM') {
        self.clients.claim();
    }
});

// ==========================================
// LIFECYCLE
// ==========================================

console.log('[SW] Service Worker loaded');
