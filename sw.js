/* ============================================================
   SOS Colombia — sw.js (service worker v6)
   Cache versionado de TODOS los archivos para uso 100% offline.
   Estrategia: cache-first con respaldo de red y actualización.
   v6: app potenciada — asistente de triaje "¿qué hago ahora?",
       ciclo RCP 30:2 guiado, checklist del hogar persistente,
       plan familiar de emergencia, botiquín casero y 6 guías
       nuevas de auxilios (13 en total).
   v7: arreglo del botón "Volver a empezar" del triaje.
   v8: contactos de emergencia (lista de hasta 5) y botón
       "AVISAR A MIS CONTACTOS" con ubicación GPS.
   v9: arreglo destino del aviso (muestra el contacto elegido,
       no el de la ficha).
   v10: SOS EN VIVO — sirena continua, vibración, ubicación
        que se actualiza sola y cola de envío a todos los
        contactos con el tipo de emergencia.
   v11: tipografía editorial (serif en 123/títulos), números
        tabulares, manifest oscuro y AUTO-RECARGA: al activarse
        una versión nueva, la app se actualiza sola.
   ============================================================ */
var CACHE = "sos-colombia-v11";
var ARCHIVOS = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./datos.js",
  "./manifest.json",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){ return cache.addAll(ARCHIVOS); })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); }).then(function(){
      // avisar a las pestañas abiertas que hay versión nueva → se recargan solas
      return self.clients.matchAll({ includeUncontrolled:true }).then(function(cs){
        cs.forEach(function(c){ c.postMessage("NUEVA_VERSION"); });
      });
    })
  );
});

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function(enCache){
      if(enCache) return enCache;
      return fetch(e.request).then(function(resp){
        // guarda en cache las respuestas válidas de mismo origen
        if(resp && resp.status === 200 && resp.type === "basic"){
          var copia = resp.clone();
          caches.open(CACHE).then(function(cache){ cache.put(e.request, copia); });
        }
        return resp;
      }).catch(function(){
        // sin red y sin cache: devuelve la página principal si la pide
        return caches.match("./index.html");
      });
    })
  );
});
