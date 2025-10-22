// PWA Service Worker for LAMP v3.2
const CACHE_NAME = 'lamp-v3-2-cache-v1';

// 캐시할 파일 목록 (모두 동일 경로에 있어야 합니다)
const urlsToCache = [
  './index.html',
  './manifest.json',
  // 아이콘이 있다면 이 경로를 추가해야 합니다.
  // './icons/icon-192x192.png',
  // './icons/icon-512x512.png',
];

// 1. Service Worker 설치: 캐시에 파일 추가
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell');
        // Firebase SDK와 같은 외부 스크립트는 캐시 목록에서 제외합니다.
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Service Worker: Caching failed', err))
  );
  self.skipWaiting(); // 설치 후 즉시 활성화
});

// 2. 리소스 가져오기(Fetch) 이벤트 처리: 캐시 우선 전략
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에 요청된 리소스가 있으면 캐시된 리소스를 반환
        if (response) {
          return response;
        }
        // 캐시에 없으면 네트워크를 통해 가져옴
        return fetch(event.request);
      })
  );
});

// 3. 이전 캐시 정리 (업데이트 시)
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate Event');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 화이트리스트에 없는 이전 버전 캐시 삭제
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
