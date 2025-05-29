const CACHE_NAME = 'minigame-workshop-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/icon.png',
  '/og_image.png',
  '/manifest.json'
];

// Service Worker 설치
self.addEventListener('install', event => {
  console.log('Service Worker 설치 중...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시 열기 완료');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('캐시 추가 실패:', err);
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', event => {
  console.log('Service Worker 활성화 중...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 네트워크 요청 가로채기 (Cache First 전략)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시된 버전이 있으면 반환
        if (response) {
          return response;
        }
        
        // 네트워크에서 요청
        return fetch(event.request).then(response => {
          // 유효한 응답인지 확인
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // 응답을 복제하여 캐시에 저장
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(err => {
          console.log('네트워크 요청 실패:', err);
          // 오프라인일 때 기본 페이지 반환 (선택사항)
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// 푸시 알림 처리 (선택사항)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : '새로운 워크숍 일정이 업데이트되었습니다!',
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/icon.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('미니게임 워크숍', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});