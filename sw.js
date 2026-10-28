// Service worker: aplikace funguje offline (cache-first pro shell, fonty se uloží při prvním načtení)
const CACHE='trhliny-v7';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-512-maskable.png','./jspdf.umd.min.js','./pdf-fonts.js'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{ const u=new URL(e.request.url); if(e.request.method!=='GET') return;
  const isFont=u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(u.origin===location.origin||isFont){
    const isPage=e.request.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html');
    e.respondWith(caches.match(e.request).then(hit=>{ const net=fetch(e.request).then(r=>{ if(r&&r.ok){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); } return r; }).catch(()=>hit);
      return isPage?net.then(r=>r||hit):(hit||net); })); // stránka: nejdřív síť (aktualizace hned), offline z cache
  } });
