const CACHE_VERSION="0.0.003",CURRENT_CACHE="main-0.0.003",cacheFiles=["./","helpers/console-enhancer.js","helpers/vue.min.js","scripts/idearx-controller.js","styles/normalize-min.css","styles/idearx.css","index.html"];self.addEventListener("activate",(e=>{e.waitUntil(caches.keys().then((e=>Promise.all(e.map((e=>e!==CURRENT_CACHE?caches.delete(e):Promise.resolve())))))),e.waitUntil(clients.claim())})),self.addEventListener("install",(e=>e.waitUntil(caches.open(CURRENT_CACHE).then((e=>e.addAll(cacheFiles)))))),self.addEventListener("message",(function(e){"skipWaiting"===e.data.action&&self.skipWaiting()})),self.addEventListener("fetch",(e=>{if(e.request.url.endsWith(".txt"))e.respondWith(fetch(e.request));else{let t=e.request.url.split(".").pop();"js"===t||"css"===t||"html"===t?e.respondWith(caches.open(CURRENT_CACHE).then((t=>fetch(e.request).then((s=>(t.put(e.request.url,s.clone()),s))).catch((s=>t.match(e.request.url).then((e=>e||new Response("Network error",{status:500})))))))):e.respondWith(caches.open(CURRENT_CACHE).then((t=>t.match(e.request.url).then((s=>s||fetch(e.request).then((s=>(t.put(e.request.url,s.clone()),s))))))))}}));