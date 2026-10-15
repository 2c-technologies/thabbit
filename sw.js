self.addEventListener("install", event => {

    event.waitUntil(
  
      caches.open("thabbit-v1")
        .then(cache => {
  
          return cache.addAll([
            "/",
            "/index.html",
            "/style.css",
            "/app.js"
          ]);
  
        })
  
    );
  
  });