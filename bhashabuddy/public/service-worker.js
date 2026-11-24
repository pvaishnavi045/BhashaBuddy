const CACHE_NAME='bhashabuddy-v7';
const APP_FILES=['./','./index.html','./style.css','./data.js','./regional.js','./i18n.js','./storage.js','./api.js','./progress.js','./vocab.js','./speech.js','./quiz.js','./extras.js','./app.js','./manifest.json','./icon.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_FILES)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// Network-first: always gets the latest files when online, falls back to cache when offline
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||e.request.url.includes('/api/'))return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(m=>m||caches.match('./index.html'))))});
